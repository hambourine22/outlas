# Transport data

Regenerates `app/content/map/transport-world.ts`: the nearest mainline train station and nearest public EV charger to every resort outside Scotland, from OpenStreetMap (© OpenStreetMap contributors, ODbL). Scotland's points are hand-picked in `app/content/map/transport.ts`.

```bash
python3 -I scripts/transport/fetch_nearest.py app/content/map/resorts.ts /tmp/outlas-osm-cache /tmp/outlas-nearest.json
python3 -I scripts/transport/build_transport.py /tmp/outlas-nearest.json app/content/map/transport-world.ts "$(date +%F)"
```

`fetch_nearest.py` queries the public Overpass API through `curl`, about two to six requests per resort, with a pause between them. It widens the search radius (stations: 25 → 60 → 120 km; chargers: 10 → 30 → 80 km) until something passes the filters, and caches every response, so a rerun only fetches what's missing. Add a resort to `resorts.ts` and rerun both scripts to give it transport.

Station filters live in `fetch_nearest.py`. Metro, tram and funicular stops are dropped by tag. North American stations count only with a passenger operator (`NA_PASSENGER_OPERATORS`). Lift-company stops are dropped (`LIFT_OPERATORS`). A hand-checked `EXCLUDE` list catches heritage lines and stations across closed borders that the tags miss. Display-name fixes (Cyrillic with no `name:en`, generic charger labels) are in `build_transport.py`.
