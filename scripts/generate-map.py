#!/usr/bin/env python3
"""Convert the Bavarian Verwaltungsatlas WFS GML to the quiz's local SVG."""

import argparse
import json
import math
import xml.etree.ElementTree as ET
from pathlib import Path


NAMESPACES = {
    "wfs": "http://www.opengis.net/wfs/2.0",
    "gml": "http://www.opengis.net/gml/3.2",
    "vergr": "http://gdi.bayern/vergr",
}
REGIONS = {
    "Oberbayern": "oberbayern",
    "Niederbayern": "niederbayern",
    "Oberpfalz": "oberpfalz",
    "Oberfranken": "oberfranken",
    "Mittelfranken": "mittelfranken",
    "Unterfranken": "unterfranken",
    "Schwaben": "schwaben",
}
SEATS = json.loads((Path(__file__).with_name("seat-locations.json")).read_text(encoding="utf-8"))


def mercator(lon, lat):
    radius = 6378137
    return radius * math.radians(lon), radius * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def distance_to_segment(point, start, end):
    dx, dy = end[0] - start[0], end[1] - start[1]
    if dx == dy == 0:
        return math.dist(point, start)
    fraction = max(0, min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)))
    closest = (start[0] + fraction * dx, start[1] + fraction * dy)
    return math.dist(point, closest)


def simplify_line(points, tolerance):
    keep = {0, len(points) - 1}
    pending = [(0, len(points) - 1)]
    while pending:
        first, last = pending.pop()
        if last - first < 2:
            continue
        farthest = max(range(first + 1, last), key=lambda index: distance_to_segment(points[index], points[first], points[last]))
        if distance_to_segment(points[farthest], points[first], points[last]) > tolerance:
            keep.add(farthest)
            pending.extend(((first, farthest), (farthest, last)))
    return [points[index] for index in sorted(keep)]


def simplify_ring(points, tolerance):
    if points[0] == points[-1]:
        points = points[:-1]
    middle = len(points) // 2
    first = simplify_line(points[: middle + 1], tolerance)
    second = simplify_line(points[middle:] + points[:1], tolerance)
    return first[:-1] + second[:-1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("gml", type=Path, help="WFS GetFeature response in EPSG:3857")
    parser.add_argument("output", type=Path)
    parser.add_argument("--tolerance", type=float, default=200, help="simplification tolerance in metres")
    args = parser.parse_args()

    root = ET.parse(args.gml).getroot()
    features = {}
    for member in root.findall("wfs:member", NAMESPACES):
        label = member.find(".//vergr:bezeichnung", NAMESPACES).text
        name = next((name for name in REGIONS if label.endswith(name)), None)
        if name is None:
            raise ValueError(f"Unknown region: {label}")
        rings = []
        for pos_list in member.findall(".//gml:posList", NAMESPACES):
            values = [float(value) for value in pos_list.text.split()]
            rings.append(simplify_ring(list(zip(values[::2], values[1::2])), args.tolerance))
        features[name] = rings

    if set(features) != set(REGIONS):
        raise ValueError(f"Expected seven regions; found {sorted(features)}")
    coordinates = [point for rings in features.values() for ring in rings for point in ring]
    min_x = min(point[0] for point in coordinates)
    max_y = max(point[1] for point in coordinates)
    scale = 700 / max(max(point[0] for point in coordinates) - min_x, max_y - min(point[1] for point in coordinates))

    lines = ['<svg id="bayernMap" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 740" role="group" aria-label="Karte der bayerischen Regierungsbezirke">']
    for name, code in REGIONS.items():
        commands = []
        for ring in features[name]:
            if len(ring) < 3:
                continue
            points = [(round(20 + (x - min_x) * scale, 1), round(20 + (max_y - y) * scale, 1)) for x, y in ring]
            commands.append("M" + " L".join(f"{x} {y}" for x, y in points) + " Z")
        lines.append(f'  <path id="{code}" class="region" role="button" tabindex="0" aria-label="{name}" fill-rule="evenodd" d="{" ".join(commands)}"/>')
    if set(SEATS) != set(REGIONS.values()):
        raise ValueError("Expected one government seat for each region")
    lines.append('  <g class="seat-locations" aria-label="Regierungssitze">')
    for code in REGIONS.values():
        seat = SEATS[code]
        x, y = mercator(seat["lon"], seat["lat"])
        cx = round(20 + (x - min_x) * scale, 1)
        cy = round(20 + (max_y - y) * scale, 1)
        lines.append(f'    <circle class="seat-dot" data-region="{code}" cx="{cx}" cy="{cy}" r="5" role="button" tabindex="0" aria-label="{seat["name"]}"><title>{seat["name"]}</title></circle>')
    lines.append("  </g>")
    lines.append("</svg>")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
