#!/usr/bin/env python3
"""Add the 30 longest Bavarian rivers to regions.svg from the public ATKIS WFS.

Run this script after generate-map.py when refreshing the base map.
"""

import argparse
import json
import math
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from xml.dom import minidom


SERVICE = "https://geoservices.bayern.de/wfs/v1/ogc_atkis_basisdlm.cgi"
NS = {
    "adv": "http://www.adv-online.de/namespaces/adv/gid/7.1",
    "gml": "http://www.opengis.net/gml/3.2",
    "wfs": "http://www.opengis.net/wfs/2.0",
    "xlink": "http://www.w3.org/1999/xlink",
}
RIVERS = [
    ("main", "Main", "24"), ("donau", "Donau", "1"),
    ("isar", "Isar", "16"), ("inn", "Inn", "18"),
    ("altmuehl", "Altmühl", "138"), ("lech", "Lech", "12"),
    ("fraenkische-saale", "Fränkische Saale", "244"),
    ("iller", "Iller", "114"), ("wertach", "Wertach", "126"),
    ("paar", "Paar", "134"), ("woernitz", "Wörnitz", "118"),
    ("pegnitz", "Pegnitz", "2422"), ("rott", "Rott", "188"),
    ("regen", "Regen", "1522"), ("amper", "Amper", "164"),
    ("loisach", "Loisach", "162"), ("naab", "Naab", "14"),
    ("zusam", "Zusam", "1192"), ("schmutter", "Schmutter", "1194"),
    ("grosse-laber", "Große Laber", "156"),
    ("vils-naab", "Vils (Naab)", "148"),
    ("schwarzach", "Schwarzach", "146"),
    ("aisch", "Aisch", "2428"),
    ("ilm", "Ilm", "1368"),
    ("vils-donau", "Vils (Donau)", "174"),
    ("isen", "Isen", "1838"),
    ("mindel", "Mindel", "116"),
    ("fraenkische-rezat", "Fränkische Rezat", "24211"),
    ("wiesent", "Wiesent", "2426"),
    ("schwarze-laber", "Schwarze Laber", "1398"),
]
# Two different rivers share the official name Vils; the suffix only disambiguates the quiz prompt.
SOURCE_NAMES = {"vils-naab": "Vils", "vils-donau": "Vils"}
NARROW_RIVERS = {
    "altmuehl", "fraenkische-saale", "paar", "woernitz", "pegnitz",
    "rott", "zusam", "schmutter", "grosse-laber",
    "vils-naab", "schwarzach", "aisch", "ilm", "vils-donau",
    "isen", "mindel", "fraenkische-rezat", "wiesent", "schwarze-laber",
}


def fetch(feature_type, expression):
    params = {
        "SERVICE": "WFS", "VERSION": "2.0.0", "REQUEST": "GetFeature",
        "TYPENAMES": f"adv:{feature_type}", "SRSNAME": "EPSG:3857",
        "COUNT": "10000", "FILTER": expression,
    }
    url = SERVICE + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=90) as response:
        root = ET.fromstring(response.read())
    if root.tag != f"{{{NS['wfs']}}}FeatureCollection":
        raise RuntimeError(ET.tostring(root, encoding="unicode")[:1000])
    if root.get("numberReturned") == "10000":
        raise RuntimeError(f"WFS result limit reached for {feature_type}")
    return root


def comparison(property_name, value):
    return ("<fes:PropertyIsEqualTo><fes:ValueReference>" + property_name
            + "</fes:ValueReference><fes:Literal>" + value
            + "</fes:Literal></fes:PropertyIsEqualTo>")


def filter_xml(comparisons):
    body = comparisons[0] if len(comparisons) == 1 else "<fes:Or>" + "".join(comparisons) + "</fes:Or>"
    return ('<fes:Filter xmlns:fes="http://www.opengis.net/fes/2.0" '
            'xmlns:adv="http://www.adv-online.de/namespaces/adv/gid/7.1" '
            'xmlns:xlink="http://www.w3.org/1999/xlink">' + body + '</fes:Filter>')


def id_filter(ids):
    body = "<fes:Or>" + "".join(f'<fes:ResourceId rid="{id}"/>' for id in ids) + "</fes:Or>"
    return '<fes:Filter xmlns:fes="http://www.opengis.net/fes/2.0">' + body + '</fes:Filter>'


def mercator(lon, lat):
    radius = 6378137
    return radius * math.radians(lon), radius * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def map_projection(svg):
    seats = json.loads(Path(__file__).with_name("seat-locations.json").read_text())
    anchors = []
    for dot in svg.findall(".//svg:circle[@class='seat-dot']", {"svg": "http://www.w3.org/2000/svg"}):
        seat = seats[dot.get("data-region")]
        x, y = mercator(seat["lon"], seat["lat"])
        anchors.append((x, y, float(dot.get("cx")), float(dot.get("cy"))))
    if len(anchors) != 7:
        raise RuntimeError("Expected seven seat markers to align river geometry")
    mean_x = sum(a[0] for a in anchors) / 7
    mean_y = sum(a[1] for a in anchors) / 7
    mean_cx = sum(a[2] for a in anchors) / 7
    mean_cy = sum(a[3] for a in anchors) / 7
    numerator = sum((x - mean_x) * (cx - mean_cx) - (y - mean_y) * (cy - mean_cy)
                    for x, y, cx, cy in anchors)
    denominator = sum((x - mean_x) ** 2 + (y - mean_y) ** 2 for x, y, _, _ in anchors)
    scale = numerator / denominator
    offset_x, offset_y = mean_cx - scale * mean_x, mean_cy + scale * mean_y
    residual = max(math.hypot(scale * x + offset_x - cx, -scale * y + offset_y - cy)
                   for x, y, cx, cy in anchors)
    if residual > 0.15:
        raise RuntimeError(f"Map projection differs from seat anchors by {residual:.2f} units")
    return lambda x, y: (round(scale * x + offset_x, 1), round(-scale * y + offset_y, 1))


def distance_to_segment(point, start, end):
    dx, dy = end[0] - start[0], end[1] - start[1]
    if dx == dy == 0:
        return math.dist(point, start)
    fraction = max(0, min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)))
    return math.dist(point, (start[0] + fraction * dx, start[1] + fraction * dy))


def simplify(points, tolerance=0.7):
    if len(points) < 3:
        return points
    keep = {0, len(points) - 1}
    pending = [(0, len(points) - 1)]
    while pending:
        first, last = pending.pop()
        if last - first < 2:
            continue
        farthest = max(range(first + 1, last), key=lambda i: distance_to_segment(points[i], points[first], points[last]))
        if distance_to_segment(points[farthest], points[first], points[last]) > tolerance:
            keep.add(farthest)
            pending.extend(((first, farthest), (farthest, last)))
    return [points[i] for i in sorted(keep)]


def river_paths(name, code, key, project):
    source_name = SOURCE_NAMES.get(code, name)
    axes = fetch("AX_Gewaesserstationierungsachse", filter_xml([comparison("adv:name", source_name)]))
    paths = []
    matching = [axis for axis in axes.findall(".//adv:AX_Gewaesserstationierungsachse", NS)
                if axis.findtext("adv:gewaesserkennzahl", "", NS) == key.ljust(19, "0")]
    if code in NARROW_RIVERS:
        watercourses = fetch("AX_Wasserlauf", filter_xml([comparison("adv:name", source_name)]))
        ids = []
        for watercourse in watercourses.findall(".//adv:AX_Wasserlauf", NS):
            if watercourse.findtext("adv:gewaesserkennzahl", "", NS) != key.ljust(19, "0"):
                continue
            ids.extend(link.get(f"{{{NS['xlink']}}}href").split(":")[-1]
                       for link in watercourse.findall("adv:bestehtAus", NS))
        for start in range(0, len(ids), 60):
            narrow = fetch("AX_Gewaesserachse", id_filter(ids[start:start + 60]))
            matching.extend(narrow.findall(".//adv:AX_Gewaesserachse", NS))
    for axis in matching:
        for pos_list in axis.findall(".//gml:posList", NS):
            numbers = [float(value) for value in pos_list.text.split()]
            points = simplify([project(x, y) for x, y in zip(numbers[::2], numbers[1::2])])
            if len(points) >= 2:
                paths.append("M " + " L ".join(f"{x} {y}" for x, y in points))
    if not paths:
        raise RuntimeError(f"No centerline geometry found for {name}")
    print(f"{name}: {len(paths)} centerline segments", flush=True)
    return " ".join(paths)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("svg", type=Path, nargs="?", default=Path("src/regions.svg"))
    args = parser.parse_args()
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    svg = ET.parse(args.svg).getroot()
    original_svg = args.svg.read_text(encoding="utf-8")
    project = map_projection(svg)
    layer = ET.Element(f"{{http://www.w3.org/2000/svg}}g", {"id": "riversLayer", "class": "hidden", "aria-label": "Flüsse"})
    for code, name, key in RIVERS:
        route = river_paths(name, code, key, project)
        river = ET.SubElement(layer, f"{{http://www.w3.org/2000/svg}}g", {
            "class": "river", "data-river": code, "role": "button", "tabindex": "-1", "aria-label": name,
        })
        ET.SubElement(river, f"{{http://www.w3.org/2000/svg}}path", {"class": "river-line", "d": route})
        ET.SubElement(river, f"{{http://www.w3.org/2000/svg}}path", {"class": "river-hit", "d": route})
    original_svg = re.sub(r'\s*<g\b[^>]*\bid="riversLayer"[^>]*>.*?</g>(?=\s*</svg>)', "", original_svg, flags=re.S)
    pretty = minidom.parseString(ET.tostring(layer, encoding="utf-8")).toprettyxml(indent="  ")
    layer_xml = "\n".join("  " + line for line in pretty.splitlines()[1:] if line.strip())
    updated_svg = original_svg.replace("</svg>", layer_xml + "\n</svg>")
    if updated_svg == original_svg:
        raise RuntimeError("Could not locate closing SVG tag")
    args.svg.write_text(updated_svg, encoding="utf-8")


if __name__ == "__main__":
    main()
