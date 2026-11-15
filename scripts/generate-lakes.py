#!/usr/bin/env python3
"""Project bundled ATKIS lake polygons offline; --refresh downloads source geometry."""
import argparse
import json
import re
from datetime import date
import runpy
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
from map_projection import map_projection, mercator
from svg_layers import replace_layer

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'scripts/lake-geometry.json'
# The official names also occur on unrelated small lakes elsewhere in Bavaria.
SOURCE_BOUNDS = {
    'koenigssee': (12.9, 47.45, 13.1, 47.65),
    'rothsee': (11.1, 49.1, 11.3, 49.3),
}


def selected_polygons(code, polygons):
    if code not in SOURCE_BOUNDS:
        return polygons
    west, south, east, north = SOURCE_BOUNDS[code]
    left, bottom = mercator(west, south)
    right, top = mercator(east, north)
    return [polygon for polygon in polygons
            if any(left <= x <= right and bottom <= y <= top for x, y in polygon[0])]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('svg', type=Path, nargs='?', default=ROOT / 'src/regions.svg')
    parser.add_argument('--refresh', action='store_true')
    args = parser.parse_args()
    lakes = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
        "import { LAKES } from './src/game.js'; console.log(JSON.stringify(LAKES))"], cwd=ROOT, text=True))
    helpers = runpy.run_path(str(ROOT / 'scripts/generate-rivers.py'))
    if args.refresh:
        records = {}
        for lake in lakes:
            root = helpers['fetch']('AX_StehendesGewaesser', helpers['filter_xml']([helpers['comparison']('adv:name/adv:AX_Lagebezeichnung/adv:unverschluesselt', lake['name'])]))
            polygons = []
            for polygon in root.findall('.//gml:Polygon', helpers['NS']):
                rings = []
                for ring in polygon.findall('.//gml:LinearRing', helpers['NS']):
                    values = [float(v) for v in ring.find('gml:posList', helpers['NS']).text.split()]
                    points = list(zip(values[::2], values[1::2]))
                    rings.append(points)
                if rings:
                    polygons.append(rings)
            if not polygons:
                raise RuntimeError('No lake polygon: ' + lake['name'])
            polygons = selected_polygons(lake['code'], polygons)
            if not polygons:
                raise RuntimeError('No lake polygons in expected location: ' + lake['name'])
            records[lake['code']] = polygons
            print(lake['name'], len(polygons), flush=True)
        SOURCE.write_text(json.dumps({'source': helpers['SERVICE'], 'crs': 'EPSG:3857',
            'retrieved': date.today().isoformat(), 'license': 'CC BY 4.0', 'attribution': 'Bayerische Vermessungsverwaltung – www.geodaten.bayern.de',
            'polygons': records}, ensure_ascii=False, separators=(',', ':')) + '\n')
    records = json.loads(SOURCE.read_text())['polygons']
    original = args.svg.read_text()
    svg = ET.fromstring(original)
    project = map_projection(svg)
    ns = '{http://www.w3.org/2000/svg}'
    layer = ET.Element(ns + 'g', {'id': 'lakesLayer', 'class': 'hidden', 'aria-label': 'Seen'})
    for lake in lakes:
        paths = []
        for polygon in selected_polygons(lake['code'], records[lake['code']]):
            for index, ring in enumerate(polygon):
                points = helpers['simplify']([project(x,y) for x,y in ring], tolerance=0.15)
                if len(set(points)) < 3:
                    points = [project(x,y) for x,y in ring]
                if len(set(points)) < 3:
                    if index == 0:
                        break  # Omit sub-pixel polygon fragments.
                    continue
                paths.append('M ' + ' L '.join(f'{x} {y}' for x,y in points) + ' Z')
        if not paths:
            raise RuntimeError('No visible lake outline: ' + lake['code'])
        group = ET.SubElement(layer, ns+'g', {'class': 'lake', 'data-lake': lake['code'],
            'role': 'button', 'tabindex': '-1', 'aria-label': lake['name']})
        for cls in ['lake-hit', 'lake-shape']:
            ET.SubElement(group, ns+'path', {'class': cls, 'd': ' '.join(paths)})
    # Insert above region fills, below all existing routes and point markers.
    updated = replace_layer(original, layer, 'lakesLayer')
    start = re.search(r'  <g\b[^>]*id="lakesLayer"', updated).start()
    end = updated.index('\n</svg>', start)
    layer_xml = updated[start:end]
    updated = updated[:start] + updated[end:]
    anchor = re.search(r'\s*<g\b[^>]*(?:class="seat-locations"|id="(?:rivers|mountains|cities|sights|natureReserves)Layer")', updated)
    if not anchor:
        raise RuntimeError('Missing overlay insertion anchor')
    updated = updated[:anchor.start()] + '\n' + layer_xml + updated[anchor.start():]
    updated = re.sub(r'\s*</svg>\s*$', '\n</svg>\n', updated)
    args.svg.write_text(updated)


if __name__ == '__main__':
    main()
