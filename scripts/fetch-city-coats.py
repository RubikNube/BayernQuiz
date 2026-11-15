"""Download the city infobox coats of arms and their Commons credits.

Run with --refresh to update existing assets. Requires Python 3 and Node.js.
Images are stored as 120-pixel PNG thumbnails; the application makes no Wikimedia requests.
"""

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
OUT = ROOT / "assets" / "cities"
USER_AGENT = "BayernQuiz/1.0 (https://github.com/RubikNube/BayernQuiz; educational geography quiz)"
ALLOWED_LICENSES = {"Public domain", "CC0", "CC BY 3.0", "CC BY 4.0", "CC BY-SA 3.0", "CC BY-SA 4.0"}


def download(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(8):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if error.code not in (429, 503) or attempt == 7:
                raise
            time.sleep(min(30, 10 * (attempt + 1)))


def query(base, **params):
    return json.loads(download(base + "?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "formatversion": "2", **params,
    })))


def clean(value):
    return html.unescape(re.sub(r"<[^>]*>", "", value or "")).strip()


def write_credits(records, names):
    lines = ["# Bildnachweise: Stadtwappen", "",
             "Die Wappen stammen aus den Stadt-Infoboxen der deutschen Wikipedia und Wikimedia Commons. "
             "Die PNG-Vorschaubilder werden lokal gespeichert; die Wappen wurden ausschließlich skaliert.", ""]
    for item in records:
        license_text = f"[{item['license']}]({item['license_url']})" if item["license_url"] else item["license"]
        lines.append(f"- **{names[item['slug']]}** — {item['artist']}; {license_text}; [Originaldatei]({item['page_url']}).")
    (OUT / "ATTRIBUTION.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh", action="store_true", help="redownload assets and credits")
    args = parser.parse_args()
    cities = json.loads(subprocess.check_output([
        "node", "--input-type=module", "-e",
        "import { CITIES } from './src/game.js'; console.log(JSON.stringify(CITIES));",
    ], cwd=ROOT, text=True))
    OUT.mkdir(parents=True, exist_ok=True)
    metadata_path = OUT / "metadata.json"
    existing = {r["slug"]: r for r in json.loads(metadata_path.read_text(encoding="utf-8"))} if metadata_path.exists() else {}
    missing = [
        city for city in cities
        if args.refresh or city["code"] not in existing
        or existing[city["code"]]["path"] != f"assets/cities/{city['code']}.png"
        or not (ROOT / existing[city["code"]]["path"]).exists()
    ]
    files = {}
    if missing:
        pages = query("https://de.wikipedia.org/w/api.php", titles="|".join(c["wikipediaTitle"] for c in missing),
                      prop="revisions|pageprops", rvprop="content", rvslots="main", redirects="1")["query"]["pages"]
        inherited = {}
        for page in pages:
            content = page["revisions"][0]["slots"]["main"]["content"]
            match = re.search(r"^\|[ \t]*Wappen[ \t]*=[ \t]*([^\n]*)", content, re.MULTILINE | re.IGNORECASE)
            filename = re.sub(r"<!--.*?-->", "", match[1]).strip() if match else ""
            if not filename:
                inherited[page["title"]] = page["pageprops"]["wikibase_item"]
                continue
            files[page["title"]] = filename
        if inherited:
            entities = query("https://www.wikidata.org/w/api.php", action="wbgetentities",
                             ids="|".join(inherited.values()), props="claims")["entities"]
            for title, item_id in inherited.items():
                claims = [c for c in entities[item_id]["claims"]["P94"] if c["rank"] != "deprecated"]
                claim = next((c for c in claims if c["rank"] == "preferred"), claims[0])
                files[title] = claim["mainsnak"]["datavalue"]["value"]
        for title, filename in files.items():
            if not filename.lower().endswith(".svg"):
                raise RuntimeError(f"Expected an SVG coat of arms: {title}: {filename}")
        image_pages = query("https://commons.wikimedia.org/w/api.php", titles="|".join("File:" + f for f in files.values()),
                            prop="imageinfo", iiprop="url|extmetadata", iiurlwidth="120", redirects="1")["query"]
        # Commons redirects can rename a file while retaining the same image.
        redirects = {r["from"]: r["to"] for r in image_pages.get("redirects", [])}
        images = {p["title"]: p["imageinfo"][0] for p in image_pages["pages"]}
    records = []
    for city in cities:
        slug = city["code"]
        if city not in missing:
            records.append(existing[slug])
            continue
        filename = files[city["wikipediaTitle"]]
        title = "File:" + filename.replace("_", " ")
        while title in redirects:
            title = redirects[title]
        info = images[title]
        meta = info.get("extmetadata", {})
        license_name = clean(meta.get("LicenseShortName", {}).get("value"))
        artist = clean(meta.get("Artist", {}).get("value"))
        if not artist and license_name == "Public domain":
            artist = "Urheber auf Commons nicht angegeben"
        if license_name not in ALLOWED_LICENSES or not artist or not info.get("descriptionurl"):
            raise RuntimeError(f"Review image credits for {city['name']}: {license_name}, {artist}")
        data = download(info["thumburl"])
        if not data.startswith(b"\x89PNG\r\n\x1a\n"):
            raise RuntimeError(f"Not a PNG thumbnail: {filename}")
        record = {
            "slug": slug, "name": city["name"], "file": filename,
            "article_url": "https://de.wikipedia.org/wiki/" + urllib.parse.quote(city["wikipediaTitle"].replace(" ", "_")),
            "image_url": info["thumburl"], "page_url": info["descriptionurl"],
            "artist": artist, "license": license_name,
            "license_url": meta.get("LicenseUrl", {}).get("value", ""),
            "path": f"assets/cities/{slug}.png",
        }
        (ROOT / record["path"]).write_bytes(data)
        records.append(record)
        metadata_path.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(slug, filename, license_name, flush=True)
        time.sleep(3)
    metadata_path.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_credits(records, {c["code"]: c["name"] for c in cities})


if __name__ == "__main__":
    main()
