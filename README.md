# BayernQuiz

Ein deutschsprachiges Lernspiel über die sieben Regierungsbezirke und die Flüsse Bayerns. Es bietet ein Kartenquiz, ein Quiz zu den Sitzen der Bezirksregierungen, ein Flussquiz und einen Lernmodus. Spielablauf und Gestaltung basieren auf [UsaQuiz](https://github.com/RubikNube/UsaQuiz).

Im Modus **Flüsse finden** lassen sich vor dem Start und nach dem Spiel die 20 Flüsse auf der Karte anklicken: Name und ungefähre Länge in Bayern erscheinen in einem Infokasten. Im Quiz wird der gesuchte Fluss auf der Karte gewählt. Es stehen 3, 5, 7, 10, 15 oder 20 Fragen zur Auswahl. Richtige Antworten können automatisch zur nächsten Frage führen; nach jeder Antwort ist auch **Weiter** verfügbar.

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
Die schwarzen Punkte zeigen die Lage der sieben Regierungssitze auf der Karte. Ihre Stadtkoordinaten stammen aus [GeoNames](https://www.geonames.org/search.html?q=Germany%2C+Bayern) und werden beim Erzeugen der Karte in das Kartenkoordinatensystem projiziert. Die Quelldaten stehen in `scripts/seat-locations.json`.
Die zusätzlichen Stadtoptionen im Regierungssitz-Quiz stammen aus dem [Verzeichnis der kreisfreien Städte Bayerns](https://www.statistik.bayern.de/mam/produkte/veroffentlichungen/statistische_berichte/e1111c_202300.pdf).

Die 20 Flüsse und ihre Längen in Bayern stammen aus der [Tabelle der 100 längsten Fließgewässer in Bayern](https://www.lfu.bayern.de/wasser/gewaesserverzeichnisse/doc/tab_gew_name_100_laeng.pdf) des Bayerischen Landesamts für Umwelt (Stand 2016). Die Längen umfassen auch Abschnitte auf der Landesgrenze und werden auf ganze Kilometer gerundet angezeigt. Die vereinfachten Flussläufe wurden aus dem [ATKIS Basis-DLM WFS](https://geodatenonline.bayern.de/geodatenonline/seiten/wfs_atkis) der Bayerischen Vermessungsverwaltung abgeleitet und auf die Quizkarte projiziert. Die Karte dient der Orientierung, nicht der präzisen Navigation. ATKIS-Daten: **Bayerische Vermessungsverwaltung – www.geodaten.bayern.de**, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.de).

Zur Aktualisierung der Karte die WFS-GetFeature-Antwort für `vergr:BezirkeFlaeche` in EPSG:3857 als GML speichern und ausführen:

```sh
python3 scripts/generate-map.py /pfad/zur/antwort.gml src/regions.svg
python3 scripts/generate-rivers.py src/regions.svg
```

## Lizenz

Der Anwendungscode steht unter GPLv3 oder einer späteren Version. Siehe [LICENSE](LICENSE). Die Kartendaten stehen unter CC BY 4.0 mit der oben genannten Quellenangabe.
