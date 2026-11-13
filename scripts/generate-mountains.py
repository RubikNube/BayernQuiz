#!/usr/bin/env python3
"""Add simplified Bavarian mountain-range routes to regions.svg.

Run after generate-map.py. Waypoints are approximate WGS84 longitude/latitude
positions within each range, not surveyed boundaries or hiking routes.
"""

import argparse
import xml.etree.ElementTree as ET
from pathlib import Path

from map_projection import map_projection, mercator
from svg_layers import replace_layer


# Code, German name, and a simplified centerline through the Bavarian part.
MOUNTAINS = [
    ("allgaeuer-alpen", "Allgäuer Alpen", [(10.14, 47.49), (10.27, 47.51), (10.40, 47.54), (10.53, 47.58)]),
    ("ammergauer-alpen", "Ammergauer Alpen", [(10.66, 47.59), (10.77, 47.60), (10.89, 47.59), (10.99, 47.57)]),
    ("wettersteingebirge", "Wettersteingebirge", [(10.95, 47.47), (11.05, 47.47), (11.16, 47.49), (11.27, 47.52)]),
    ("bayerische-voralpen", "Bayerische Voralpen", [(11.36, 47.66), (11.54, 47.68), (11.72, 47.71), (11.91, 47.72), (12.10, 47.73)]),
    ("chiemgauer-alpen", "Chiemgauer Alpen", [(12.34, 47.72), (12.48, 47.73), (12.62, 47.72), (12.73, 47.69)]),
    ("berchtesgadener-alpen", "Berchtesgadener Alpen", [(12.79, 47.65), (12.89, 47.63), (12.98, 47.59), (13.05, 47.57)]),
    ("rhoen", "Rhön", [(9.93, 50.31), (9.99, 50.36), (10.06, 50.42), (10.12, 50.47)]),
    ("spessart", "Spessart", [(9.21, 49.87), (9.34, 49.90), (9.47, 49.94), (9.58, 49.99)]),
    ("steigerwald", "Steigerwald", [(10.24, 49.57), (10.34, 49.66), (10.43, 49.76), (10.51, 49.86)]),
    ("hassberge", "Haßberge", [(10.43, 50.11), (10.56, 50.15), (10.70, 50.17), (10.84, 50.19)]),
    ("frankenwald", "Frankenwald", [(11.30, 50.25), (11.40, 50.29), (11.51, 50.28), (11.64, 50.24)]),
    ("fichtelgebirge", "Fichtelgebirge", [(11.79, 50.04), (11.89, 50.07), (12.00, 50.06), (12.12, 50.01)]),
    ("fraenkische-alb", "Fränkische Alb", [(11.16, 48.90), (11.26, 49.12), (11.40, 49.33), (11.45, 49.53), (11.35, 49.74), (11.25, 49.85)]),
    ("oberpfaelzer-wald", "Oberpfälzer Wald", [(12.48, 49.38), (12.47, 49.53), (12.42, 49.69), (12.38, 49.86), (12.33, 49.98)]),
    ("bayerischer-wald", "Bayerischer Wald", [(12.67, 49.18), (12.83, 49.12), (13.03, 49.08), (13.22, 48.99), (13.42, 48.90), (13.58, 48.80)]),
]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("svg", type=Path, nargs="?", default=Path("src/regions.svg"))
    args = parser.parse_args()
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    svg = ET.parse(args.svg).getroot()
    project = map_projection(svg)
    layer = ET.Element(f"{{http://www.w3.org/2000/svg}}g", {
        "id": "mountainsLayer", "class": "hidden", "aria-label": "Gebirge",
    })
    for code, name, waypoints in MOUNTAINS:
        points = [project(*mercator(lon, lat)) for lon, lat in waypoints]
        route = "M " + " L ".join(f"{x} {y}" for x, y in points)
        mountain = ET.SubElement(layer, f"{{http://www.w3.org/2000/svg}}g", {
            "class": "mountain", "data-mountain": code, "role": "button", "tabindex": "-1", "aria-label": name,
        })
        ET.SubElement(mountain, f"{{http://www.w3.org/2000/svg}}path", {"class": "mountain-line", "d": route})
        ET.SubElement(mountain, f"{{http://www.w3.org/2000/svg}}path", {"class": "mountain-hit", "d": route})
    original = args.svg.read_text(encoding="utf-8")
    args.svg.write_text(replace_layer(original, layer, "mountainsLayer"), encoding="utf-8")


if __name__ == "__main__":
    main()
