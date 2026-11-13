# BayernQuiz

Ein deutschsprachiges Lernspiel über die sieben Regierungsbezirke Bayerns. Es bietet ein Kartenquiz, ein Quiz zu den Sitzen der Bezirksregierungen und einen Lernmodus. Spielablauf und Gestaltung basieren auf [UsaQuiz](https://github.com/RubikNube/UsaQuiz).

## Lokal starten

Node.js und Python 3 werden benötigt; npm-Abhängigkeiten gibt es nicht.

```sh
npm run build
npm run serve:dist
```

Danach `http://localhost:8000/` öffnen. `npm test` prüft die Quizdaten und den Spielablauf.

## Kartendaten

Die Karte wurde aus dem WFS-Layer `vergr:BezirkeFlaeche` des [Verwaltungsatlas Bayern](https://geoportal.bayern.de/geoportalbayern/details-suche?1=&resId=baa244c2-42d2-43b2-932e-af30b4cd80cb) erzeugt (abgerufen am 13. November 2026). Datenquelle: **Bayerische Vermessungsverwaltung – www.geodaten.bayern.de**, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.de). Für die Darstellung wurden die Polygone vereinfacht; Grenzen sind daher nicht für amtliche Zwecke geeignet.

Der [Regierungssitz jedes Bezirks](https://www.stmi.bayern.de/staat-und-verfassung/staatsgebiet/) wurde mit dem Bayerischen Staatsministerium des Innern abgeglichen.
Die zusätzlichen Stadtoptionen im Regierungssitz-Quiz stammen aus dem [Verzeichnis der kreisfreien Städte Bayerns](https://www.statistik.bayern.de/mam/produkte/veroffentlichungen/statistische_berichte/e1111c_202300.pdf).

Zur Aktualisierung der Karte die WFS-GetFeature-Antwort für `vergr:BezirkeFlaeche` in EPSG:3857 als GML speichern und ausführen:

```sh
python3 scripts/generate-map.py /pfad/zur/antwort.gml src/regions.svg
```

## Lizenz

Der Anwendungscode steht unter GPLv3 oder einer späteren Version. Siehe [LICENSE](LICENSE). Die Kartendaten stehen unter CC BY 4.0 mit der oben genannten Quellenangabe.
