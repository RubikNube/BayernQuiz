# BayernQuiz

Ein deutschsprachiges Lernspiel über die sieben Regierungsbezirke, Flüsse, Gebirge und Sehenswürdigkeiten Bayerns. Es bietet ein Kartenquiz, ein Quiz zu den Sitzen der Bezirksregierungen, ein Flussquiz, ein Gebirgsquiz, ein Sehenswürdigkeiten-Quiz und einen Lernmodus. Spielablauf und Gestaltung basieren auf [UsaQuiz](https://github.com/RubikNube/UsaQuiz).

Im Modus **Flüsse finden** lassen sich vor dem Start und nach dem Spiel die 32 Flüsse auf der Karte anklicken: Name und ungefähre Länge in Bayern erscheinen in einem Infokasten. Im Quiz wird der gesuchte Fluss auf der Karte gewählt. Es stehen 3, 5, 7, 10, 15, 20, 25 oder 30 Fragen zur Auswahl. Richtige Antworten können automatisch zur nächsten Frage führen; nach jeder Antwort ist auch **Weiter** verfügbar.

Im Modus **Gebirge finden** lassen sich vor dem Start und nach dem Spiel 15 Gebirge auf der Karte anklicken. Der Infokasten zeigt ihre Lage und einen markanten Gipfel mit ungefährer Höhe. Im Quiz wird das gesuchte Gebirge auf der Karte gewählt. Es stehen 3, 5, 7, 10 oder 15 Fragen zur Auswahl. Bei einer falschen Antwort werden das gewählte und das richtige Gebirge markiert. Nach einer richtigen Antwort ist automatisches Weitergehen möglich; **Weiter** bleibt nach jeder Antwort verfügbar.

Im Modus **Sehenswürdigkeiten finden** können 20 Bauwerke und Naturziele aus allen sieben Regierungsbezirken erkundet werden. Ein Klick auf einen violetten Kartenpunkt zeigt ein lokal gespeichertes Foto, Lage, einen kurzen Informationstext und einen deutschen Wikipedia-Link. **Start** beginnt das Kartenquiz mit 3, 5, 7, 10, 15 oder 20 unterschiedlichen Fragen (Standard: 7). Nach jeder Antwort erscheint die Information zum gewählten Ort. Bei einer falschen Antwort wird der gewählte Punkt rot und der richtige grün markiert. **Weiter** ist nach jeder Antwort möglich; **Automatisch weiter** wechselt nach einer richtigen Antwort nach fünf Sekunden. Nach Spielende können alle Orte wieder erkundet werden. Die Infokarte lässt sich schließen; auf kleinen Bildschirmen erscheint sie unter der Karte. Kartenpunkte sind auch mit Tab und Enter/Leertaste bedienbar.

Im Modus **Lernen** können Regierungsbezirke, Flüsse, Gebirge und Sehenswürdigkeiten über Checkboxen einzeln ein- und ausgeblendet werden. Alle vier Themen sind standardmäßig aktiv; die Auswahl wird im Browser gespeichert. Ein Klick auf ein Kartenelement zeigt die zugehörigen Informationen.

## Karte vergrößern und verschieben

In allen Modi kann die Karte über **+** und **−** zwischen 100 % und 400 % vergrößert werden. **Zurücksetzen** zeigt wieder ganz Bayern. Am PC zoomt das Mausrad um die Zeigerposition; eine vergrößerte Karte lässt sich mit gedrückter Maustaste verschieben. Browser-Zoom mit Strg/Cmd bleibt verfügbar.

Auf dem Smartphone vergrößern und verkleinern zwei Finger die Karte. Nach dem Vergrößern verschiebt ein Finger die Karte; bei 100 % scrollt ein Finger die Seite. Außerhalb der Karte bleibt die normale Seitenbedienung verfügbar. Ziehen und Zoomen wählen keine Quizantwort aus.

Mit der Tastatur: Karte per Tab fokussieren, mit **+ / −** zoomen, mit den **Pfeiltasten** verschieben und mit **Pos1** zurücksetzen. Kartenelemente bleiben mit Tab und Enter/Leertaste auswählbar und werden beim Fokussieren sichtbar gemacht.

Zoom und Ausschnitt bleiben zwischen Fragen und beim Ändern der Lernthemen erhalten. Start, Neustart und Moduswechsel setzen die Ansicht zurück. Die Ansicht wird nicht dauerhaft gespeichert.

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

Die 30 längsten Flüsse und zusätzlich Rednitz und Regnitz sowie ihre Längen in Bayern stammen aus der [Tabelle der 100 längsten Fließgewässer in Bayern](https://www.lfu.bayern.de/wasser/gewaesserverzeichnisse/doc/tab_gew_name_100_laeng.pdf) des Bayerischen Landesamts für Umwelt (Stand 2016). Die beiden Flüsse namens Vils werden nach ihren Mündungsflüssen unterschieden. Die Längen umfassen auch Abschnitte auf der Landesgrenze und werden auf ganze Kilometer gerundet angezeigt. Die vereinfachten Flussläufe wurden aus dem [ATKIS Basis-DLM WFS](https://geodatenonline.bayern.de/geodatenonline/seiten/wfs_atkis) der Bayerischen Vermessungsverwaltung abgeleitet und auf die Quizkarte projiziert. Die Karte dient der Orientierung, nicht der präzisen Navigation. ATKIS-Daten: **Bayerische Vermessungsverwaltung – www.geodaten.bayern.de**, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.de).

Die 15 Gebirgslinien sind vereinfachte, von Hand gesetzte Mittellinien in der bayerischen Landesfläche. Sie orientieren sich an der [naturräumlichen Gliederung des LfU](https://www.lfu.bayern.de/natur/naturraeume/index.htm) und zeigen ungefähre Lagen, keine amtlichen Grenzen. Die Infokarte nennt jeweils einen markanten Gipfel, nicht die Höhe des gesamten Gebirges. Die Gipfelhöhen stammen von regionalen Quellen: [Oberstdorf (Hochfrottspitze)](https://www.oberstdorf.de/alpininfo/allgaeuer-alpen/geographie/), [Ammergauer Alpen Tourismus (Kreuzspitze)](https://www.ammergauer-alpen.de/tour/bergtour-kreuzspitze), [Deutscher Alpenverein (Zugspitze)](https://www.alpenverein.de/artikel/wandern-in-bayern_4eb0e66d-96da-415e-b954-c32f9561d8ec), [Deutscher Alpenverein (Benediktenwand)](https://www.alpenverein.de/artikel/huettentipp-tutzinger-huette-bayerische-voralpen_0aebcec8-b551-48f6-9760-8efa8c710c64), [Chiemgau Tourismus (Sonntagshorn)](https://www.chiemsee-chiemgau.info/sonntagshorn-1961-m), [Berchtesgaden Tourismus (Watzmann)](https://www.berchtesgaden.de/ramsau), [Rhön Tourismus (Kreuzberg)](https://www.rhoen.de/media/www.rhoen.de/org/med_2067/44942_rhoen_flyer-kreuzberg_12-2018_03_final_druckfreigabe.pdf), [LfU (Geiersberg)](https://www.lfu.bayern.de/natur/natura2000_managementplaene/6020_6946/doc/6022_371/texte/de6022371_t_fg_nfin.pdf), [Steigerwald Tourismus (Schwanberg)](https://www.steigerwaldtourismus.com/steigerwald/regionen/rund-um-den-schwanberg), [Haßberge Tourismus (Bramberg)](https://www.hassberge-tourismus.de/detail/id%3D69c671aeb2293959b3bd93d4), [Naturpark Frankenwald (Döbraberg)](https://www.naturpark-frankenwald.de/detail/id%3D6087fb1b0d7ea872058c96c8), [Fichtelgebirge Tourismus (Schneeberg)](https://www.fichtelgebirge.bayern/fileadmin/user_upload/PDF_Intern/Blaetter_PDF_Kataloge/8_WEBANSICHT_Wanderhighlights_2023.pdf), [LBV (Poppberg)](https://www.lbv.de/naturschutz/lebensraeume-schuetzen/gew%C3%A4sser/quellschutz/kalktuffquellen/projektgebiet/), [Landkreis Tirschenreuth (Entenbühl)](https://www.kreis-tir.de/fileadmin/user_upload/Landkreisbuch/index.html) und [Bayerischer Wald Tourismus (Großer Arber)](https://www.bayerischer-wald.de/attraktion/grosser-arber-dc2c76be82).

### Sehenswürdigkeiten und Fotos

Die kuratierte Auswahl enthält Schloss Linderhof, Schloss Herrenchiemsee, Königssee, Zugspitze, Befreiungshalle, Kloster Weltenburg, Veste Oberhaus, Walhalla, Steinerne Brücke, Burg Falkenberg, Bamberger Dom, Markgräfliches Opernhaus, Veste Coburg, Nürnberger Kaiserburg, Plönlein, Würzburger Residenz, Schloss Mespelbrunn, Schloss Johannisburg, Schloss Neuschwanstein und Lindauer Hafeneinfahrt. Die deutschen Kurztexte und offiziellen Betreiber- beziehungsweise Tourismusquellen stehen zusammen mit den WGS84-Koordinaten in `SIGHTS` in `src/game.js`.

Die Kartenpunkte sind ungefähre Orientierungsmarkierungen. Der Königssee wird durch St. Bartholomä am Westufer, die Zugspitze durch den Gipfel und die Lindauer Hafeneinfahrt durch einen Punkt zwischen Löwe und Leuchtturm repräsentiert. Die übrigen Punkte liegen an den jeweiligen Bauwerken. Artikelkoordinaten und Bildmetadaten sind in [`assets/sights/metadata.json`](assets/sights/metadata.json) dokumentiert; die bewusst gewählten repräsentativen Punkte stehen im Datenbestand.

Die lokal gebündelten, verkleinerten Fotos stammen aus Wikimedia Commons. Urheber, Lizenzen und Originaldateien sind in [`assets/sights/ATTRIBUTION.md`](assets/sights/ATTRIBUTION.md) nachgewiesen. Im Browser werden keine Wikimedia-APIs aufgerufen. Fotos und Nachweise lassen sich bei Bedarf aktualisieren:

```sh
python3 scripts/fetch-sight-images.py --refresh
```

Das Skript prüft Bildquellen und freie Lizenzen; die kuratierten Markerkoordinaten bleiben dabei erhalten. Beide Sehenswürdigkeiten-Skripte benötigen zusätzlich Node.js zum Einlesen des gemeinsamen Datenbestands.

Zur Aktualisierung der Karte die WFS-GetFeature-Antwort für `vergr:BezirkeFlaeche` in EPSG:3857 als GML speichern und ausführen:

```sh
python3 scripts/generate-map.py /pfad/zur/antwort.gml src/regions.svg
python3 scripts/generate-rivers.py src/regions.svg
python3 scripts/generate-mountains.py src/regions.svg
python3 scripts/generate-sights.py src/regions.svg
```

## Lizenz

Der Anwendungscode steht unter GPLv3 oder einer späteren Version. Siehe [LICENSE](LICENSE). Die Kartendaten stehen unter CC BY 4.0 mit der oben genannten Quellenangabe. Für Fotos gelten die jeweils in den Bildnachweisen aufgeführten Lizenzen.
