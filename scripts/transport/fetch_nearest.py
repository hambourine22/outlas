"""Nearest train station + EV charge point per resort, from OpenStreetMap.

Usage: python3 -I fetch_nearest.py app/content/map/resorts.ts <cache-dir> <out.json>

Batched: for each kind (station, charge) and each search radius, one Overpass
request per BATCH resorts unions an `around` filter per still-unmatched
resort, and the nearest element per resort is picked locally. A resort with
nothing within the radius goes to the next, wider pass. That's a couple of
dozen requests for every resort, instead of several per resort, which
matters because the public Overpass servers can take tens of seconds a
query. Responses are cached per batch, so a rerun only fetches what's
missing.
"""

import hashlib
import json
import math
import os
import re
import subprocess
import sys
import time

ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]
UA = "outlas.cc transport build"
BATCH = 15  # resorts per request — one huge union gets its connection dropped
WIDE_BATCH = 5  # for radii over 60 km, where each around returns far more
RADII_KM = {"station": [25, 60, 120], "charge": [10, 30, 80]}
SELECTOR = {
    "station": 'nwr["railway"~"^(station|halt)$"]',
    "charge": 'nwr["amenity"="charging_station"]',
}

# Not mainline rail: metro, tram, funicular, heritage, miniature.
NON_MAINLINE = {"subway", "light_rail", "monorail", "funicular", "miniature", "tram"}

# Stations that pass the tag filters but are no use to a rider: heritage and
# tourist lines, funiculars and event-only halts that OSM doesn't tag as
# such, and stops across a closed border or in a country with no passenger
# trains. Checked by hand 2026-11-01. The resort falls through to its next
# nearest station, or shows none.
EXCLUDE = {
    "node/13049575843": "Kingston (NZ) — Kingston Flyer heritage line",
    "way/448214935": "Soldier Hollow — Heber Valley heritage railroad",
    "way/1035193299": "Heber Valley Railroad Depot — heritage railroad",
    "node/3627636598": "Virginia City Depot — Alder Gulch heritage short line",
    "node/9890961376": "Carson & Mills Park Railroad — park railway",
    "node/3067755421": "Silverton — Durango & Silverton heritage line",
    "node/6720072906": "Leadville — Leadville, Colorado & Southern tourist line",
    "node/10117708655": "Three Valley — heritage site",
    "node/354498113": "Felskinn — Metro Alpin funicular",
    "node/13306669016": "Zermatt GGB — Gornergrat rack railway (Zermatt MGB is the mainline)",
    "node/2861486050": "Crans-Montana Gare — SMC funicular",
    "node/13831420041": "Bluche — SMC funicular intermediate stop",
    "node/984712525": "S-chanf Marathon — Engadin ski marathon event halt",
    "node/8194246641": "Pionerskaya (Russia) — across the Georgian border from Gudauri",
    "node/13674888712": "Quinta (Chile) — across the Andes from Las Leñas",
    "node/10200882287": "Lebanese station — Lebanon has no passenger trains",
}


def haversine_km(lat1, lon1, lat2, lon2):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 6371.0 * 2 * math.asin(math.sqrt(a))


def overpass(query, cache_path):
    if os.path.exists(cache_path):
        with open(cache_path, encoding="utf-8") as f:
            return json.load(f)
    # curl rather than urllib: this machine's Python has no CA bundle, and
    # turning verification off isn't the fix.
    last = None
    for attempt in range(6):
        url = ENDPOINTS[attempt % len(ENDPOINTS)]
        proc = subprocess.run(
            ["curl", "-s", "-f", "-m", "900", "-A", UA, "--data-urlencode", f"data={query}", url],
            capture_output=True,
        )
        try:
            if proc.returncode != 0:
                raise RuntimeError(f"curl exit {proc.returncode} from {url}")
            data = json.loads(proc.stdout.decode("utf-8"))
            if data.get("remark", "").startswith("runtime error"):
                raise RuntimeError(data["remark"])
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(data, f)
            return data
        except (RuntimeError, json.JSONDecodeError) as e:
            last = e
            print(f"  retry {attempt + 1}: {e}", flush=True)
            time.sleep(15 * (attempt + 1))
    raise RuntimeError(f"overpass failed: {last}")


def coords(el):
    if "lat" in el:
        return el["lat"], el["lon"]
    c = el.get("center")
    return (c["lat"], c["lon"]) if c else (None, None)


def is_mainline_station(tags):
    if tags.get("railway") not in ("station", "halt"):
        return False
    if not tags.get("name"):
        return False
    if tags.get("station") in NON_MAINLINE:
        return False
    if tags.get("railway:preserved") == "yes" or tags.get("usage") == "tourism":
        return False
    for mode in ("subway", "light_rail", "tram", "monorail", "funicular"):
        if tags.get(mode) == "yes" and tags.get("train") != "yes":
            return False
    if tags.get("train") == "no" or tags.get("funicular") == "yes":
        return False
    return True


def is_public_car_charger(tags):
    if tags.get("amenity") != "charging_station":
        return False
    if tags.get("access") in ("private", "no"):
        return False
    if tags.get("motorcar") == "no":
        return False
    car_socket = any(k.startswith(("socket:type2", "socket:ccs", "socket:chademo", "socket:tesla", "socket:type1", "socket:gb")) for k in tags)
    if tags.get("bicycle") == "yes" and tags.get("motorcar") != "yes" and not car_socket:
        return False
    return True


# Lift companies whose underground metros, funiculars and top stations OSM
# tags as plain stations (Saas-Fee, Crans-Montana, St-Luc).
LIFT_OPERATORS = {"STBAG", "SMC", "LSF", "FLC"}

# In North America nearly every railway=station without a passenger
# operator is a heritage or tourist line (Heber Valley, Georgetown Loop,
# Durango & Silverton, V&T), so there a station counts only if one of these
# runs it.
NA_PASSENGER_OPERATORS = re.compile(
    r"amtrak|via rail|utah transit|\buta\b|\bexo\b|rocky mountaineer|metrolink|caltrain|metra|go transit|west coast express|sound transit|trimet|\brtd\b",
    re.I,
)


def in_north_america(lat, lon):
    return lat > 14 and -170 < lon < -50


def is_rideable_station(tags, lat, lon):
    if not is_mainline_station(tags):
        return False
    operators = [part.strip() for k in ("operator", "network") for part in re.split(r"[;,]", tags.get(k, ""))]
    if any(op in LIFT_OPERATORS for op in operators):
        return False
    if in_north_america(lat, lon) and not NA_PASSENGER_OPERATORS.search(" ".join(operators)):
        return False
    return True


KEEP = {
    "station": is_rideable_station,
    "charge": lambda tags, lat, lon: is_public_car_charger(tags),
}


def load_resorts(path):
    # The compact r({ n, s, lat, long, ..., country }) records in resorts.ts.
    src = open(path, encoding="utf-8").read()
    pat = re.compile(r'\bn:\s*"([^"]+)"\s*,\s*s:\s*"([^"]+)"\s*,\s*lat:\s*(-?[\d.]+)\s*,\s*long:\s*(-?[\d.]+)(?:[^}]*?country:\s*"([^"]*)")?', re.S)
    return [dict(name=m[0], slug=m[1], lat=float(m[2]), long=float(m[3]), country=m[4] or "") for m in pat.findall(src)]


def main():
    resorts_path, cache_dir, out_path = sys.argv[1:4]
    os.makedirs(cache_dir, exist_ok=True)
    resorts = load_resorts(resorts_path)
    best = {kind: {} for kind in RADII_KM}
    for kind, radii in RADII_KM.items():
        todo = list(resorts)
        for r in radii:
            if not todo:
                break
            print(f"{kind} ≤{r} km: {len(todo)} resorts", flush=True)
            candidates = []
            size = BATCH if r <= 60 else WIDE_BATCH
            for b in range(0, len(todo), size):
                chunk = todo[b:b + size]
                arounds = "".join(f'{SELECTOR[kind]}(around:{r * 1000},{x["lat"]},{x["long"]});' for x in chunk)
                q = f"[out:json][timeout:600];({arounds});out center tags;"
                key = hashlib.sha1("|".join(x["slug"] for x in chunk).encode()).hexdigest()[:10]
                data = overpass(q, os.path.join(cache_dir, f"{kind}-{r}km-{key}.json"))
                kept = 0
                for el in data.get("elements", []):
                    tags = el.get("tags", {})
                    lat, lon = coords(el)
                    if lat is None or f'{el["type"]}/{el["id"]}' in EXCLUDE:
                        continue
                    if KEEP[kind](tags, lat, lon):
                        candidates.append((el, tags, lat, lon))
                        kept += 1
                print(f"  batch {b // size + 1}: {len(data.get('elements', []))} elements, {kept} pass the filters", flush=True)
                time.sleep(2)
            still = []
            for x in todo:
                pick = None
                for el, tags, lat, lon in candidates:
                    d = haversine_km(x["lat"], x["long"], lat, lon)
                    if d <= r and (pick is None or d < pick["km"]):
                        pick = {"osm": f'{el["type"]}/{el["id"]}', "lat": round(lat, 5), "long": round(lon, 5), "km": round(d, 1), "tags": tags}
                if pick:
                    best[kind][x["slug"]] = pick
                else:
                    still.append(x)
            todo = still
            time.sleep(5)
    out = [{"resort": x, "station": best["station"].get(x["slug"]), "charge": best["charge"].get(x["slug"])} for x in resorts]
    json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f'done: stations {len(best["station"])}/{len(resorts)} · chargers {len(best["charge"])}/{len(resorts)}', flush=True)


if __name__ == "__main__":
    main()
