#!/usr/bin/env python3
"""Project the curated CITIES coordinates onto the Bayern map.

Run after generate-map.py and before generate-sights.py so sight markers stay
selectable. Runtime and this script share the records in src/game.js; no network
is required.
"""

import argparse
import json
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

from map_projection import map_projection, mercator
from svg_layers import replace_layer

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("svg", type=Path, nargs="?", default=ROOT / "src/regions.svg")
    args = parser.parse_args()
    cities = json.loads(subprocess.check_output([
        "node", "--input-type=module", "-e",
        "import { CITIES } from './src/game.js'; console.log(JSON.stringify(CITIES));",
    ], cwd=ROOT, text=True))
    svg = ET.parse(args.svg).getroot()
    project = map_projection(svg)
    namespace = "{http://www.w3.org/2000/svg}"
    layer = ET.Element(namespace + "g", {
        "id": "citiesLayer", "class": "hidden", "aria-label": "Städte",
    })
    for city in cities:
        x, y = project(*mercator(city["lon"], city["lat"]))
        marker = ET.SubElement(layer, namespace + "g", {
            "class": "city", "data-city": city["code"], "role": "button",
            "tabindex": "-1", "aria-label": city["name"],
        })
        ET.SubElement(marker, namespace + "circle", {
            "class": "city-hit", "cx": str(x), "cy": str(y), "r": "10",
        })
        ET.SubElement(marker, namespace + "circle", {
            "class": "city-dot", "cx": str(x), "cy": str(y), "r": "5",
        })
    original = args.svg.read_text(encoding="utf-8")
    args.svg.write_text(replace_layer(original, layer, "citiesLayer"), encoding="utf-8")


if __name__ == "__main__":
    main()
