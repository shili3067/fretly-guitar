"""Import pasted Nier sheet HTML as inert SVG systems and bar coordinates."""
import json
import re
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)
ATTRIBUTES = {"class", "x", "y", "width", "height", "fill", "stroke",
              "stroke-width", "d", "text-anchor", "dominant-baseline", "style"}
GLYPHS = str.maketrans({"\ue859": "×", "\ue06d": "TAB", "\ue084": "4",
                        "\ue4e6": "𝄾", "\ue4e5": "𝄽", "\ue262": "♯"})


def clean(node):
    if node.tag not in {f"{{{NS}}}{tag}" for tag in ("svg", "g", "rect", "text", "path")}:
        raise ValueError(f"Unexpected element {node.tag}")
    for attr in list(node.attrib):
        value = node.attrib[attr]
        if attr not in ATTRIBUTES or re.search(r"url\s*\(|@|\\\\", value, re.I):
            del node.attrib[attr]
    if node.text:
        node.text = node.text.translate(GLYPHS)
    for child in node:
        clean(child)


source, output = map(Path, sys.argv[1:])
output.mkdir(parents=True, exist_ok=True)
bars = []
system = 0
for raw in re.findall(r"<svg\b[^>]*>.*?</svg>", source.read_text(), re.S):
    svg = ET.fromstring(raw)
    height = float(svg.attrib["height"])
    if not height:
        continue
    width = float(svg.attrib["width"])
    boundaries = sorted({float(node.attrib["x"]) for node in svg
                         if node.tag == f"{{{NS}}}rect"
                         and 48 <= float(node.get("height", 0)) <= 54})
    if not boundaries:
        raise ValueError("No barlines found")
    top = min(float(node.attrib["y"]) for node in svg
              if node.tag == f"{{{NS}}}rect" and 48 <= float(node.get("height", 0)) <= 54)
    system += 1
    filename = f"system-{system:02}.svg"
    clean(svg)
    svg.set("viewBox", f"0 0 {width:g} {height:g}")
    (output / filename).write_text(ET.tostring(svg, encoding="unicode"))
    starts = [0, *boundaries]
    for left, right in zip(starts, starts[1:]):
        if right - left < 8:
            continue  # Double barline.
        bars.append([filename, round(left, 2), round(right + 1, 2), width, round(height, 2), round(top - 4, 2)])
    # The final system has a double barline well before the right margin.
    if not 0 <= width - boundaries[-1] <= 2 and width - boundaries[-1] < 100:
        raise ValueError("Unexpected trailing system margin")
(output / "bars.js").write_text("export const bars = " + json.dumps(bars, indent=2) + ";\n")
