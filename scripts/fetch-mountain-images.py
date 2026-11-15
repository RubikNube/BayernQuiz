"""Fetch credited Wikimedia Commons thumbnails for the Bavarian mountain range information cards."""

import argparse
import html
import json
import re
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "mountains"
MOUNTAINS = json.loads(subprocess.check_output([
    "node", "--input-type=module", "-e",
    "import { MOUNTAINS } from './src/game.js'; console.log(JSON.stringify(MOUNTAINS));"
], cwd=ROOT, text=True))
TITLES = {item["code"]: item.get("wikipediaTitle", item["name"]) for item in MOUNTAINS}
# Curated landscapes: the mountain articles generally use maps as their lead images.
OVERRIDE_IMAGES = {
    "allgaeuer-alpen": "Trettach Maedelegabel Hochfrottspitze.JPG",
    "ammergauer-alpen": "Kreuzspitze von S HQ.jpg",
    "wettersteingebirge": "Wetterstein HQ.jpg",
    "bayerische-voralpen": "Benediktenwand, 1800 m.jpg",
    "chiemgauer-alpen": "Sonntagshorn von Norden.jpg",
    "berchtesgadener-alpen": "Watzmann und Hochkalter.jpg",
    "rhoen": "Rhönlandschaft bei Tann.JPG",
    "spessart": "Aussicht Sohlhöhe (Spessart).jpg",
    "steigerwald": "2015 Schwanberg 09.jpg",
    "hassberge": "Hassberge.jpg",
    "frankenwald": "Doerbraberg-Winter.jpg",
    "fichtelgebirge": "Fichtelgebirge mit Sonnenuntergang.jpg",
    "fraenkische-alb": "Kirschbluete-Walberla.jpg",
    "oberpfaelzer-wald": "Waldnaabtal.jpg",
    "bayerischer-wald": "Bayerischer wald1.jpg",
}
ALLOWED_LICENSES = {"CC BY 2.0", "CC BY 3.0", "CC BY 4.0", "CC BY-SA 2.0", "CC BY-SA 2.5", "CC BY-SA 2.0 de", "CC BY-SA 3.0", "CC BY-SA 3.0 de", "CC BY-SA 4.0", "Public domain", "CC0"}


def get_json(base, params):
    url = base + "?" + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, headers={"User-Agent": "BayernQuiz/1.0 (educational project; Wikimedia attribution)"})
    for attempt in range(8):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if error.code not in (429, 503) or attempt == 7:
                raise
            delay = error.headers.get("Retry-After", "")
            time.sleep(int(delay) if delay.isdigit() else min(60, 10 * (attempt + 1)))


def clean(value):
    return html.unescape(re.sub(r"<[^>]*>", "", value or "")).strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh", action="store_true", help="redownload existing images")
    parser.add_argument("--list-images", action="store_true", help="list article photos for choosing overrides")
    args = parser.parse_args()
    if args.list_images:
        data = get_json("https://de.wikipedia.org/w/api.php", {
            "action": "query", "format": "json", "titles": "|".join(TITLES.values()),
            "prop": "images", "imlimit": "max", "redirects": "1",
        })
        for page in data["query"]["pages"].values():
            print(page["title"], flush=True)
            for image in page.get("images", []):
                if image["title"].lower().endswith((".jpg", ".jpeg")):
                    print("  " + image["title"], flush=True)
        return
    OUT.mkdir(parents=True, exist_ok=True)
    metadata_path = OUT / "metadata.json"
    existing = {item["slug"]: item for item in json.loads(metadata_path.read_text())} if metadata_path.exists() else {}
    records = []
    failures = []
    pending_slugs = [slug for slug in TITLES
                     if args.refresh or slug not in existing
                     or not (ROOT / existing[slug]["path"]).exists()
                     or existing[slug]["file"] != OVERRIDE_IMAGES[slug]]
    image_pages = {}
    if pending_slugs:
        print("Looking up Commons photo credits", flush=True)
        image_data = get_json("https://commons.wikimedia.org/w/api.php", {
            "action": "query", "format": "json",
            "titles": "|".join("File:" + OVERRIDE_IMAGES[slug] for slug in pending_slugs),
            "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": "320",
        })
        image_pages = {page["title"].removeprefix("File:"): page
                       for page in image_data["query"]["pages"].values()}
    for slug, title in TITLES.items():
        if not args.refresh and slug in existing and (ROOT / existing[slug]["path"]).exists() and existing[slug]["file"] == OVERRIDE_IMAGES.get(slug, existing[slug]["file"]):
            records.append(existing[slug])
            continue
        filename = OVERRIDE_IMAGES[slug]
        print("Downloading " + slug, flush=True)
        image_page = image_pages[filename.replace("_", " ")]
        info = image_page.get("imageinfo", [{}])[0]
        meta = info.get("extmetadata", {})
        license_name = clean(meta.get("LicenseShortName", {}).get("value"))
        if license_name not in ALLOWED_LICENSES:
            failures.append(f"Check license for {title}: {license_name or 'missing'}")
            continue
        if not info.get("thumburl") or not info.get("descriptionurl") or not clean(meta.get("Artist", {}).get("value")) or (license_name != "Public domain" and not meta.get("LicenseUrl", {}).get("value")):
            failures.append(f"Missing image source or artist for {title} ({filename}); choose a credited Commons photo")
            continue
        record = {
            "slug": slug, "title": title, "file": filename,
            "image_url": info["thumburl"], "page_url": info["descriptionurl"],
            "artist": clean(meta.get("Artist", {}).get("value")),
            "license": license_name,
            "license_url": meta.get("LicenseUrl", {}).get("value", ""),
            "path": f"assets/mountains/{slug}.jpg",
        }
        request = urllib.request.Request(info["thumburl"], headers={"User-Agent": "BayernQuiz/1.0 (educational project)"})
        with urllib.request.urlopen(request, timeout=30) as response:
            data = response.read()
        if not data.startswith(b"\xff\xd8"):
            failures.append(f"Expected a JPEG photo for {title} ({filename}); choose a Commons JPEG manually")
            continue
        (ROOT / record["path"]).write_bytes(data)
        records.append(record)
        metadata_path.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n")
        print(slug, license_name, flush=True)
        time.sleep(3)
    metadata_path.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n")
    lines = ["# Bildnachweise: Gebirge", "", "Diese lokal gespeicherten Fotos sind verkleinerte Vorschaubilder aus Wikimedia Commons. Die Fotos wurden ausschließlich skaliert.", ""]
    names = {mountain["code"]: mountain["name"] for mountain in MOUNTAINS}
    for item in records:
        license_text = f"[{item['license']}]({item['license_url']})" if item["license_url"] else item["license"]
        lines.append(f"- **{names[item['slug']]}** — {item['artist'] or 'Unknown'}; {license_text}; [Originaldatei]({item['page_url']}).")
    (OUT / "ATTRIBUTION.md").write_text("\n".join(lines) + "\n")
    if failures:
        raise RuntimeError("\n".join(failures))


if __name__ == "__main__":
    main()
