#!/usr/bin/env python3
"""Project NATURE_RESERVES onto the Bayern SVG without network access.

Run after the other overlay generators so reserve markers remain selectable.
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
    reserves = json.loads(subprocess.check_output([
        "node", "--input-type=module", "-e",
        "import { NATURE_RESERVES } from './src/game.js'; console.log(JSON.stringify(NATURE_RESERVES));",
    ], cwd=ROOT, text=True))
    svg = ET.parse(args.svg).getroot()
    project = map_projection(svg)
    namespace = "{http://www.w3.org/2000/svg}"
    layer = ET.Element(namespace + "g", {
        "id": "natureReservesLayer", "class": "hidden", "aria-label": "Naturschutzgebiete",
    })
    for reserve in reserves:
        x, y = project(*mercator(reserve["lon"], reserve["lat"]))
        marker = ET.SubElement(layer, namespace + "g", {
            "class": "nature", "data-nature": reserve["code"], "role": "button",
            "tabindex": "-1", "aria-label": reserve["name"],
        })
        ET.SubElement(marker, namespace + "circle", {
            "class": "nature-hit", "cx": str(x), "cy": str(y), "r": "10",
        })
        ET.SubElement(marker, namespace + "circle", {
            "class": "nature-dot", "cx": str(x), "cy": str(y), "r": "5",
        })
    original = args.svg.read_text(encoding="utf-8")
    args.svg.write_text(replace_layer(original, layer, "natureReservesLayer"), encoding="utf-8")


if __name__ == "__main__":
    main()
