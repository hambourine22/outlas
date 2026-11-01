"""Write app/content/map/transport-world.ts from fetch_nearest.py output.

Usage: python3 -I build_transport.py <nearest.json> <out.ts> <date>

One nearest station and one nearest charger per resort, Scotland excluded
(its points are hand-picked in transport.ts). A point that's nearest to
several resorts appears once, attributed to the closest of them.
"""

import json
import re
import sys

LATIN_NAME_KEYS = ("name:en", "int_name", "name:ja-Latn", "name:ja_rm", "name:ko-Latn", "name:zh-Latn", "name:zh_pinyin", "name:latin")

# Display names for points whose OSM names don't read on an English page:
# Cyrillic with no name:en, and generic "EV charger" labels in Korean and
# Japanese, which add nothing the card's kind line doesn't already say.
NAME_OVERRIDE = {
    "node/278617024": "Bansko",
    "way/227930454": "Kostenets",
}
GENERIC_CHARGER_NAMES = {"전기차충전소", "ＥＶ充電スタンド", "EV充電スタンド", "充電スタンド", "EV充電器"}


def display_name(tags, fallback):
    for k in LATIN_NAME_KEYS:
        if tags.get(k):
            return tags[k]
    for k in ("name", "operator", "brand", "network"):
        v = tags.get(k)
        if v and v not in GENERIC_CHARGER_NAMES:
            return v.replace("株式会社", "").strip()
    return fallback


def ts_str(s):
    return json.dumps(s, ensure_ascii=False)


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def main():
    nearest_path, out_path, date = sys.argv[1:4]
    rows = json.load(open(nearest_path, encoding="utf-8"))
    picked = {"station": {}, "charge": {}}
    served = {"station": {}, "charge": {}}   # osm → [(resort slug, km)]
    missing = {"station": [], "charge": []}
    for row in rows:
        res = row["resort"]
        if res["country"].startswith("Scotland"):
            continue
        for kind in ("station", "charge"):
            p = row[kind]
            if not p:
                missing[kind].append(res["name"])
                continue
            served[kind].setdefault(p["osm"], []).append((res["slug"], p["km"]))
            prev = picked[kind].get(p["osm"])
            if prev is None or p["km"] < prev["km"]:
                picked[kind][p["osm"]] = {
                    "osm": p["osm"],
                    "lat": p["lat"],
                    "long": p["long"],
                    "km": p["km"],
                    "nearest": res["name"],
                    "resort_slug": res["slug"],
                    "name": NAME_OVERRIDE.get(p["osm"]) or display_name(p["tags"], "Unnamed charger" if kind == "charge" else "Unnamed station"),
                }

    def lines(kind, prefix):
        out = []
        for p in sorted(picked[kind].values(), key=lambda p: (p["nearest"], p["km"])):
            slug = f'{prefix}-{slugify(p["resort_slug"])}'
            out.append(
                f'  {{ kind: "{kind}", slug: {ts_str(slug)}, name: {ts_str(p["name"])}, '
                f'nearest: {ts_str(p["nearest"])}, km: {p["km"]}, lat: {p["lat"]}, long: {p["long"]}, osm: {ts_str(p["osm"])},\n'
                f'    serves: [{", ".join(f"{{ resort: {ts_str(r)}, km: {k} }}" for r, k in sorted(served[kind][p["osm"]], key=lambda x: x[1]))}] }},'
            )
        return out

    header = f"""// GENERATED from OpenStreetMap (© OpenStreetMap contributors, ODbL) on
// {date} by scripts/transport/ — don't hand-edit; rerun the scripts.
//
// For every resort outside Scotland: the nearest mainline train station
// (railway=station|halt; metro, tram, funicular and heritage lines excluded)
// and the nearest public car charger (amenity=charging_station; private and
// bike-only excluded). Scotland's points are hand-picked in transport.ts.
// A point nearest to several resorts appears once: `nearest`/`km` name the
// closest, and `serves` lists every resort it's nearest to, with distances
// (the map's world-zoom badges read it).
// `km` is straight-line distance from `nearest`, not road distance.
//
// Heritage, tourist and funicular stops that pass the tag filters, and
// stations across a closed border, are excluded by hand — see EXCLUDE in
// scripts/transport/fetch_nearest.py.
//
// No station within 120 km: {", ".join(missing["station"]) or "none"}.
// No charger within 80 km: {", ".join(missing["charge"]) or "none"}.

import type {{ TransportPoint }} from "./transport";
"""
    body = (
        header
        + "\nexport const WORLD_STATIONS: TransportPoint[] = [\n"
        + "\n".join(lines("station", "stn"))
        + "\n];\n\nexport const WORLD_CHARGE_POINTS: TransportPoint[] = [\n"
        + "\n".join(lines("charge", "chg"))
        + "\n];\n"
    )
    open(out_path, "w", encoding="utf-8").write(body)
    print(f'stations {len(picked["station"])} · chargers {len(picked["charge"])} · '
          f'missing stations {len(missing["station"])} · missing chargers {len(missing["charge"])}')
    print("no station:", missing["station"])
    print("no charger:", missing["charge"])


if __name__ == "__main__":
    main()
