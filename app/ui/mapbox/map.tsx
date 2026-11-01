"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import mapboxgl, { MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Resorts, Rentals, Repairs } from "@/app/definitions/mapboxDefinitions";
import type { Guides } from "@/app/content/map/types";
import {
  CATEGORY_COLOUR,
  CATEGORY_LABEL,
  type MapCategory,
} from "@/app/content/map/types";
import {
  DEFAULT_REGION,
  regionByKey,
  type RegionKey,
} from "@/app/content/map/regions";
import { mapPins } from "@/app/lib/design-system";
import MapMenuSidebar, { type MapFilters } from "./MapMenuSidebar";
import MapPreviewSidebar, { type PreviewContent } from "./MapPreviewSidebar";

// Note: the legacy MapLegend overlay was retired on 2026-10-31. The pin
// key now lives in MapMenuSidebar — see docs/MAP_MENU_ARCHITECTURE.md.

/*
Notes:
1) Has to be a "use client" module (see above) in order for useEffect to be used. Next.js has strict rules about
modules from which database calls can be made and modules which use client. Database calls should be made from server
modules (ie not this one) for security reasons. Database calls can be passed via props to ui components (such as this
one) for optimum security.

2) For some reason, the .env mapboxAccessToken has to have the specific label "NEXT_PUBLIC_MAPBOX_TOKEN" or the app
throws an error.
*/

// World-view default per the world-mountain-resorts spec (2026-10-31).
// Low zoom + a mid-Atlantic centroid at a northern-biased latitude keeps
// Western North America, Europe and Japan visible in one viewport. Reset
// view returns here, not to Scotland.
const INITIAL_CENTER: [number, number] = [0, 45];
const INITIAL_ZOOM = 1.0;

export default function Map({
  resorts,
  rentals,
  repairs,
  guides = [],
}: {
  resorts: Resorts[];
  rentals: Rentals[];
  repairs: Repairs[];
  guides?: Guides[];
}) {
  const mapRef = useRef<mapboxgl.Map>();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapLoaded = useRef(false);

  const [filters, setFilters] = useState<MapFilters>({
    resorts: true,
    rentals: true,
    repairs: true,
    guides: true,
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCategory, setPreviewCategory] = useState<MapCategory | null>(null);
  const [previewContent, setPreviewContent] = useState<PreviewContent | undefined>();

  // Active region drives the sidebar's region picker and the camera. Each
  // region in the content layer carries its own centre + zoom; selecting a
  // region flies the camera there and updates the h3 in the sidebar.
  const [activeRegion, setActiveRegion] = useState<RegionKey>(DEFAULT_REGION);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  mapboxgl.accessToken = mapboxToken;

  // Keep the all-records lookup table stable so pin clicks always find the
  // right record, even when the filter state hides a category from the
  // rendered layer.
  const allRecords = useMemo(
    () => [...repairs, ...rentals, ...resorts, ...guides],
    [resorts, rentals, repairs, guides],
  );

  // GeoJSON features for every category, derived once. We filter at
  // `setData` time to flip pins on and off without rebuilding the array.
  const allFeatures = useMemo(() => {
    function features(
      inputArray: Array<Resorts | Rentals | Repairs | Guides>,
      arrayType: MapCategory,
    ) {
      const markerColor = CATEGORY_COLOUR[arrayType];
      return inputArray.map((x) => ({
        geometry: {
          coordinates: [x.long, x.lat],
          type: "Point" as const,
        },
        properties: {
          name: x.name,
          id: x.slug,
          markerColor,
          dataType: arrayType,
        },
        type: "Feature" as const,
      }));
    }
    return [
      ...features(resorts, "resorts"),
      ...features(rentals, "rentals"),
      ...features(repairs, "repairs"),
      ...features(guides, "guides"),
    ];
  }, [resorts, rentals, repairs, guides]);

  const counts: Record<MapCategory, number> = {
    resorts: resorts.length,
    rentals: rentals.length,
    repairs: repairs.length,
    guides: guides.length,
  };

  // Build the map once. We update pin data separately via setData so flipping
  // filters never has to recreate the GL instance.
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapboxToken) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: INITIAL_CENTER,
      style: "mapbox://styles/hambourine/clmrfyzl1028001r4b6x47hyx",
      zoom: INITIAL_ZOOM,
    });

    mapRef.current.on("load", () => {
      if (!mapRef.current) return;
      mapRef.current.addSource("locations", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: allFeatures.filter(
            (f) => filters[f.properties.dataType as MapCategory],
          ),
        },
      });
      mapRef.current.addLayer({
        id: "locations",
        type: "circle",
        source: "locations",
        paint: {
          // Fill only, no outline. Sharpness comes from integer radii that
          // step with zoom so the world view doesn't blob where resorts
          // cluster — a translucent 1px stroke is all anti-alias fringe and
          // reads soft, and an opaque ring read heavy. Fill per category
          // comes from mapPins in design-system.ts via CATEGORY_COLOUR.
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            ...mapPins.radius.flatMap((r) => [r.zoom, r.px]),
          ],
          "circle-color": ["get", "markerColor"],
          "circle-opacity": 1,
          "circle-stroke-width": 0,
        },
      });

      // Pointer cursor + click → open the right-rail preview with the full
      // record for the pin that was clicked (looked up by slug).
      mapRef.current.on("mouseenter", "locations", () => {
        if (!mapRef.current) return;
        mapRef.current.getCanvas().style.cursor = "pointer";
      });
      mapRef.current.on("mouseleave", "locations", () => {
        if (!mapRef.current) return;
        mapRef.current.getCanvas().style.cursor = "";
      });
      mapRef.current.on("click", "locations", (e: MapMouseEvent) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties ?? {};
        const id = String(props.id ?? "");
        const dataType = String(props.dataType ?? "") as MapCategory;
        const record = allRecords.find((x) => x.slug === id);
        if (!record) return;
        setPreviewCategory(dataType);
        setPreviewContent(record);
        setPreviewOpen(true);
      });

      mapLoaded.current = true;
    });

    return () => {
      if (mapRef.current) mapRef.current.remove();
      mapLoaded.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When filters change, swap the GeoJSON on the live source. If the map
  // hasn't loaded yet we silently skip — the initial `load` handler reads
  // the latest filter state when it runs.
  useEffect(() => {
    if (!mapRef.current || !mapLoaded.current) return;
    const source = mapRef.current.getSource("locations") as
      | mapboxgl.GeoJSONSource
      | undefined;
    if (!source) return;
    source.setData({
      type: "FeatureCollection",
      features: allFeatures.filter(
        (f) => filters[f.properties.dataType as MapCategory],
      ),
    });
  }, [filters, allFeatures]);

  // Fly back to the world centroid and reset the region picker to the
  // default (worldwide). The sidebar's active-row state follows.
  const handleReset = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM });
    setActiveRegion(DEFAULT_REGION);
  };

  // Region picker — fly the camera to the selected region's preset and
  // keep the sidebar h3 in sync via activeRegion.
  const handleSelectRegion = (key: RegionKey) => {
    setActiveRegion(key);
    if (!mapRef.current) return;
    const region = regionByKey(key);
    mapRef.current.flyTo({ center: region.centre, zoom: region.zoom });
  };

  const handleToggleCategory = (c: MapCategory) =>
    setFilters((prev) => ({ ...prev, [c]: !prev[c] }));

  const handleToggleAll = (visible: boolean) =>
    setFilters({
      resorts: visible,
      rentals: visible,
      repairs: visible,
      guides: visible,
    });

  // Token-less fallback — brand-aligned shell with pin counts and legend
  // so the home route still looks finished when NEXT_PUBLIC_MAPBOX_TOKEN
  // is unset (e.g. preview deploys without the env var).
  if (!mapboxToken) {
    return <MapPlaceholder counts={counts} />;
  }

  return (
    <div className="relative overflow-hidden" style={{ height: "calc(100dvh - 56px)" }}>
      <div id="map-container" ref={mapContainerRef} className="h-full w-full" />

      {/* Left rail — map symbols + provider filters + region picker */}
      <MapMenuSidebar
        filters={filters}
        counts={counts}
        onToggle={handleToggleCategory}
        onToggleAll={handleToggleAll}
        activeRegion={activeRegion}
        onSelectRegion={handleSelectRegion}
      />

      {/* Reset view — bottom-right overlay, out of the way of the panel */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-10 md:bottom-4 md:right-4">
        <button
          type="button"
          onClick={handleReset}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-sm border border-rule bg-canvas px-3 py-2 font-ui text-xs uppercase tracking-wide text-ink shadow-sm hover:bg-[var(--row-hover)]"
        >
          Reset view
        </button>
      </div>

      {/* Right rail — pin preview */}
      <MapPreviewSidebar
        show={previewOpen}
        category={previewCategory}
        content={previewContent}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}

function MapPlaceholder({
  counts,
}: {
  counts: Record<MapCategory, number>;
}) {
  const total =
    counts.resorts + counts.rentals + counts.repairs + counts.guides;
  return (
    <div
      style={{ minHeight: "calc(100dvh - 56px)" }}
      className="flex items-center justify-center bg-canvas px-6 py-16"
    >
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-10 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <span className="label text-ink-faint">Scotland basemap</span>
          <h1 className="font-display text-display-2 leading-tight">
            The map is standing by — add your Mapbox token to light up the
            {" "}{total} pins already in the content layer.
          </h1>
          <p className="max-w-xl font-ui text-base leading-relaxed text-ink-muted">
            Set <code className="font-mono text-sm text-ink">NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
            in your Vercel project environment and this route will render
            the full Scotland basemap with pins drawn from{" "}
            <code className="font-mono text-sm">app/content/map</code>.
            Everything else — the sidebar, the Stories, Rentals, Repairs and
            Guides indexes — is already wired up and reading from the same
            typed source of truth.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/stories" className="chip">Stories →</a>
            <a href="/rentals" className="chip">Rentals →</a>
            <a href="/repairs" className="chip">Repairs →</a>
            <a href="/guides"  className="chip">Guides →</a>
          </div>
        </div>
        <div className="border border-rule bg-canvas-raised p-6">
          <div className="label text-ink-faint">In the content layer</div>
          <ul className="mt-4 space-y-3 font-ui text-sm">
            {(["resorts", "rentals", "repairs", "guides"] as const).map((c) => (
              <li key={c} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-3 text-ink">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLOUR[c] }}
                    aria-hidden
                  />
                  {CATEGORY_LABEL[c]}
                </span>
                <span className="font-mono text-ink-muted">{counts[c]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
