"""Project WGS84 coordinates onto the existing Bayern quiz SVG."""

import json
import math
from pathlib import Path


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
        raise RuntimeError("Expected seven seat markers to align overlay geometry")
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
