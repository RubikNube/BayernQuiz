"""Add schematic neighboring-area labels without changing Bavaria's geometry."""

import argparse
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from svg_layers import replace_layer


VIEW_BOX = "-50 -65 840 840"

# Coordinates use the base map's 740 × 740 canvas. These short dividers only
# suggest where neighboring areas meet; they are not surveyed border geometry.
CONTEXT = """<g xmlns="http://www.w3.org/2000/svg" id="neighborsLayer"
    class="neighbor-context" role="group" aria-label="Bayerns Nachbarn">
  <desc>Schematische Orientierung außerhalb Bayerns. Die Schweiz liegt jenseits des Bodensees; es gibt keine gemeinsame Landgrenze.</desc>
  <g class="neighbor-borders" aria-hidden="true">
    <path d="M87.5 208.3 L35 202 L-30 205"/>
    <path d="M167 21 L152 -10 L135 -45"/>
    <path d="M437.8 51.7 L449 7 L460 -45"/>
    <path d="M455.9 73.6 L512 51 L580 40"/>
    <path d="M698.8 407.1 L730 418 L765 440"/>
  </g>
  <text x="43" y="75">Hessen</text>
  <text x="65" y="413"><tspan x="65">Baden-</tspan><tspan x="65" dy="27">Württemberg</tspan></text>
  <text x="290" y="-20">Thüringen</text>
  <text x="527" y="1">Sachsen</text>
  <text x="616" y="232">Tschechien</text>
  <text x="470" y="738">Österreich</text>
  <text x="65" y="713"><tspan x="65">Schweiz</tspan><tspan class="neighbor-note" x="65" dy="22">(Bodensee)</tspan></text>
</g>"""


def add_neighbor_context(svg_text):
    svg_text = replace_layer(svg_text, ET.fromstring(CONTEXT), "neighborsLayer", prepend=True)
    return re.sub(r'(<svg\b[^>]*\bviewBox=")[^"]*(")',
                  lambda match: match[1] + VIEW_BOX + match[2], svg_text, count=1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("svg", type=Path)
    args = parser.parse_args()
    args.svg.write_text(add_neighbor_context(args.svg.read_text(encoding="utf-8")), encoding="utf-8")


if __name__ == "__main__":
    main()
