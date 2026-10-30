"use client"

//import { useRef, useEffect, useState, MutableRefObject } from 'react'
//import mapboxgl, { LngLatLike, Point } from 'mapbox-gl'
import { useRef, useEffect, useState } from 'react'
import mapboxgl, { MapMouseEvent } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import { Resorts, Rentals, Repairs } from '@/app/definitions/mapboxDefinitions';
import type { Guides } from '@/app/content/map/types';
import { CATEGORY_COLOUR, CATEGORY_LABEL } from '@/app/content/map/types';
import Sidebar from '../sidebar';
//import { customMouseEvent } from '@/app/definitions/mapboxDefinitions';

/*
Notes:
1) Has to be a "use client" module (see above) in order for useEffect to be used. Note that Nextjs has strict rules about
modules from which database calls can be made and modules which use client. Database calls should be made from server
modules (ie not this one) for security reasons. Database calls can be passed via props to ui components (such as this one)
for optimum security

2) For some reason, the .env mapboxAccessToken has to have the specific label "NEXT_PUBLIC_MAPBOX_TOKEN" or the app throws
an error

*/


//defines initial values to be adopted by state
const INITIAL_CENTER: [number, number] = [
  -4.205, 
  57.122
]
const INITIAL_ZOOM = 6.56

//main React function
export default function Map(
  {
    resorts,
    rentals,
    repairs,
    guides = [],
  }:
  {
    resorts: Resorts[],
    rentals: Rentals[],
    repairs: Repairs[],
    guides?: Guides[],
  }
) {
  
    //configures mapbox variables
    const mapRef = useRef<mapboxgl.Map>()
    const mapContainerRef = useRef<HTMLDivElement>(null)    
    
    //initialises state for focal position of map, degree of zoom, sidebar display and sidebar content
    const [center, setCenter] = useState(INITIAL_CENTER)
    const [zoom, setZoom] = useState(INITIAL_ZOOM)
    const [sidebar, setSidebar] = useState(false)
    const [screenWidth, setScreenWidth] = useState(0);
    const [sidebarContent, setSidebarContent] = useState<Rentals | Repairs | Resorts | Guides | undefined>();

    //fetches mapbox access token from .env
    mapboxgl.accessToken=process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';  
    
    //combines all the rentals, resorts, repairs and guides data into a single array. Spread syntax is used to enable
    //objects of very different types to be combined. This makes it easier to recover the details associated with a
    //given map pin
    const allDatabaseData = [...repairs, ...rentals, ...resorts, ...guides];

    //This is a function which takes an array of records of one map category and emits GeoJSON point features ready for
    //the mapbox 'locations' circle layer. Pin colour is pulled from the design-system catalogue so the map and the
    //legend stay in lockstep.
    function features(
      inputArray: Resorts[] | Rentals[] | Repairs[] | Guides[],
      arrayType: 'resorts' | 'rentals' | 'repairs' | 'guides',
    ){
      const markerColor = CATEGORY_COLOUR[arrayType];
      const outputArray = inputArray.map((x) => {        
        return {          
          geometry:
          {
            coordinates:
            [
              x.long, x.lat
            ],
            type: "Point" as const
          },
          properties: {
            name: x.name,
            id: x.slug,
            markerColor: markerColor,
            dataType: arrayType
          },
          type: "Feature" as const
        }
      })
      return outputArray;
    }
    
    //this calls the above features function for all the different types of location — rentals, resorts, repairs and
    //guides — and combines the resulting data into a single GeoJSON feature array
    const pinsDataAllLocationTypes = features(resorts, 'resorts').concat(
      features(rentals, 'rentals'),
      features(repairs, 'repairs'),
      features(guides,  'guides'),
    );
    
    //very important function, on first load and rerender this automatically renders the map
    useEffect(() => {
           
        //escapes function if mapContainerRef.current is undefined
        if (!mapContainerRef.current){
          return;
        }
        
        //creates a new instance of Map, centered and zoomed as per the current state values
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          center: center,
          style: "mapbox://styles/hambourine/clmrfyzl1028001r4b6x47hyx",
          zoom: zoom
        });

        //when the user moves the map, this obtains the new values for centre and zoom and updates the state
        mapRef.current.on('move', () => {
        
          //escapes function if mapRef.current undefined
          if (!mapRef.current){
            return;
          }

          // get the current center coordinates and zoom level from the map
          const mapCenter = mapRef.current.getCenter()
          const mapZoom = mapRef.current.getZoom()

          // update state
          setCenter([ mapCenter.lng, mapCenter.lat ])
          setZoom(mapZoom)
        })        
        
        //similar to the parent useEffect function, this detects when it will be necessary to add a layer of additional detail...
        mapRef.current.on('load', () => {
        
          //(escapes function if mapRef.current undefined)
          if (!mapRef.current){
            return;
          }

          //...specifically this layer of the pins marking resorts, rental shops and repair shops
          mapRef.current.addLayer({
            id: "locations",
            type: "circle",
            /* Add a GeoJSON source containing place coordinates and information. */
            source: {
              type: "geojson",              
              data: {
                type: "FeatureCollection",
                features: pinsDataAllLocationTypes
              }
            },
            paint: {
              // Carbon hairline halo at 40% to lift pins off any map tone,
              // matching the editorial border system used across the brand.
              "circle-radius": 8,
              "circle-stroke-width": 1,
              "circle-color": ["get", "markerColor"],
              "circle-opacity": 1,
              "circle-stroke-color": "rgba(30, 30, 30, 0.4)",
            },
          });
        })    
        
        /*
        This function opens up the sidebar when users click on a pin to get more info        
        */
          mapRef.current.on("click", "locations", (e: MapMouseEvent) => {
            
          if (e.features === undefined){
            return
          }
          if (!e.features){
            return
          }
          
          const ID: string = e.features[0]?.properties?.id ?? 'nothing found';
          
          const details = allDatabaseData.filter((x) => {
            return x.slug === ID;
          })
          //uploads state with info about the clicked location
          setSidebarContent(details[0]);
          setScreenWidth(screen.width);
          //opens the sidebar
          setSidebar(true);          

          //escapes if mapRef.current undefined 
          if (!mapRef.current){
            return;
          }
          //add popup - THIS WAS PICKED UP BY VERCEL BUILD LOG, AS POPUP DEFINE BUT NEVER USED
          //MIGHT BE NEEDED IN FUTURE
          /*
          const popup = new mapboxgl.Popup({ offset: [0, -15] })
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(
              `<h3>${details[0].name}</h3>`
            )
            .addTo(mapRef.current); */           
        })
    
        return () => {
          if (!mapRef.current){
          return;
        }
          mapRef.current.remove()
        }
      }, []) //useEffect function ends      

      //SEE DIR ABOVE
      /*
      The linter threw an error because of the empty dependency array above. The suggested fixes (either
        to delete the dep arr or to include a set of identified dependencies) both impaired the functioning.
        Specifically, you couldn't change the map's centre (so can't scroll to different parts of the world map).
        The likely fix is to define separate functions with useCallback then call those from useEffect, but
        that's a job for the future. Instead I disabled the associated linter rule, see eslintrc.json

        "react-hooks/exhaustive-deps": "off"      )
      */

      //this manages the user's interactions with the maps, zooming and moving centre
      const handleButtonClick = () => {        
        if (!mapRef.current){
          return;
        }        
        mapRef.current.flyTo({
          center: INITIAL_CENTER,
          zoom: INITIAL_ZOOM
        })
      }

      const handleCloseClick = () => {
        return setSidebar(!sidebar);
      }

  return (
    <div className="relative">
      <div id='map-container' ref={mapContainerRef}/>
      {/* Brand-aligned map overlay: pin legend (bottom-left) and a Reset
          button that flies back to the Scotland centroid. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-4 md:flex-row md:items-end md:justify-between md:p-6">
        <MapLegend />
        <button
          type="button"
          onClick={handleButtonClick}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-sm border border-rule bg-canvas px-3 py-2 font-ui text-xs uppercase tracking-wide text-ink shadow-sm hover:bg-[var(--row-hover)]"
        >
          Reset view
        </button>
      </div>
      <Sidebar
        show={sidebar}
        content={sidebarContent}
        closeNav={handleCloseClick}
        screenWidth={screenWidth}
      />
    </div>
  );
}

function MapLegend() {
  const items: { category: 'resorts' | 'rentals' | 'repairs' | 'guides'; note: string }[] = [
    { category: "resorts", note: "pine"    },
    { category: "rentals", note: "glacier" },
    { category: "repairs", note: "rust"    },
    { category: "guides",  note: "sand"    },
  ];
  return (
    <div className="pointer-events-auto border border-rule bg-canvas p-4 font-ui text-xs">
      <div className="label text-ink-faint">Map legend</div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-1 md:gap-y-2">
        {items.map((i) => (
          <li key={i.category} className="flex items-center gap-2 text-ink-muted">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full border"
              style={{ backgroundColor: CATEGORY_COLOUR[i.category], borderColor: "rgba(30,30,30,0.4)" }}
              aria-hidden
            />
            <span className="text-ink">{CATEGORY_LABEL[i.category]}</span>
            <span className="hidden md:inline text-ink-faint">· {i.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}