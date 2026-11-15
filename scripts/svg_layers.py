"""Replace a named SVG group without disturbing other overlay layers."""

import re
import xml.etree.ElementTree as ET
from xml.dom import minidom


def replace_layer(svg_text, layer, layer_id, *, prepend=False):
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    opening = re.search(r'\s*<g\b[^>]*\bid="' + re.escape(layer_id) + r'"[^>]*>', svg_text)
    if opening:
        depth = 1
        end = None
        for tag in re.finditer(r'</?g\b[^>]*>', svg_text[opening.end():]):
            depth += -1 if tag.group().startswith("</") else 1
            if depth == 0:
                end = opening.end() + tag.end()
                break
        if end is None:
            raise ValueError(f"Unclosed SVG layer: {layer_id}")
        svg_text = svg_text[:opening.start()] + svg_text[end:]
    pretty = minidom.parseString(ET.tostring(layer, encoding="utf-8")).toprettyxml(indent="  ")
    layer_xml = "\n".join("  " + line for line in pretty.splitlines()[1:] if line.strip())
    if "</svg>" not in svg_text:
        raise ValueError("Could not locate closing SVG tag")
    svg_text = re.sub(r'\s*</svg>\s*$', "\n</svg>\n", svg_text)
    if prepend:
        return re.sub(r'(<svg\b[^>]*>)', lambda match: match[1] + "\n" + layer_xml,
                      svg_text, count=1)
    return svg_text.replace("</svg>", layer_xml + "\n</svg>")
