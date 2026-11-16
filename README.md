# BayernQuiz

Ein deutschsprachiges Lernspiel über die sieben Regierungsbezirke, Städte, Seen, Flüsse, Gebirge, Sehenswürdigkeiten und Naturschutzgebiete Bayerns. Es bietet ein Kartenquiz, ein Quiz zu den Sitzen der Bezirksregierungen, ein Städtequiz, ein Seenquiz, ein Flussquiz, ein Gebirgsquiz, ein Sehenswürdigkeiten-Quiz, ein Naturschutzgebiete-Quiz und einen Lernmodus. Spielablauf und Gestaltung basieren auf [UsaQuiz](https://github.com/RubikNube/UsaQuiz).

## Bilderquiz

**Bilderquiz** zeigt Fotos der 20 Sehenswürdigkeiten Bayerns. Zu jedem Foto stehen vier unterschiedliche Namen zur Auswahl. Runden enthalten 3, 5, 7, 10, 15 oder 20 Fragen (Standard: 10); die Auswahl wird während der Sitzung unabhängig von anderen Modi gemerkt. Kein Ziel wiederholt sich innerhalb einer Runde.

Vor der Antwort bleiben Name, Informationen und Karte verborgen. Nach der Antwort werden die richtige und gegebenenfalls die falsche Auswahl markiert; die Karte zeigt den gesuchten Ort mit seiner Infokarte. Richtige Antworten können nach fünf Sekunden automatisch weitergehen; falsche Antworten warten auf **Weiter**. Kann ein Foto nicht geladen werden, bleiben Antworten gesperrt und **Bild erneut laden** bietet einen weiteren Versuch ohne Punktverlust.

Rekorde werden getrennt nach Fragenanzahl gespeichert. **Fehler wiederholen** und **Fehler korrigieren** behalten das Fotoformat bei. Gespeicherte Foto- und Kartenfehler derselben Sehenswürdigkeit bleiben getrennt; zwei richtige Antworten löschen einen gespeicherten Fehler. Übungsrunden erhalten keine Rekordwertung. Vorhandene Fotos, Bildnachweise und Offline-Cache werden wiederverwendet.

## Bayern-Mix

**Bayern-Mix** kombiniert alle sieben Kartenthemen: Regierungsbezirke, Städte, Seen, Flüsse, Gebirge, Sehenswürdigkeiten und Naturschutzgebiete. Der Regierungssitz-Modus bleibt ein eigenes Multiple-Choice-Quiz. Eine gemischte Runde enthält 7, 10, 15 oder 20 Fragen (Standard: 10); ihre Fragenanzahl wird während der Sitzung unabhängig von den anderen Modi gemerkt.

Jedes Thema kommt mindestens einmal vor. Die Anzahl der Fragen pro Thema unterscheidet sich um höchstens eins; zusätzliche Fragen werden zufällig auf die Themen verteilt. Innerhalb eines Themas wiederholen sich keine Ziele. Die Reihenfolge ist zufällig. Über der Frage steht das aktuelle Thema; ausschließlich dessen Kartenebene ist als Antwort auswählbar. Die Bezirksgrenzen bleiben zur Orientierung sichtbar. Bei einem Themenwechsel zeigt die Karte wieder ganz Bayern; bei aufeinanderfolgenden Fragen desselben Themas bleibt der Ausschnitt erhalten. Vor dem Start erscheint eine neutrale Bezirkskarte, nach Spielende bleibt das letzte Kartenthema zum Erkunden sichtbar.

Fehlerübersicht und wiederholte Übungsrunden funktionieren auch im Mix. Gleichnamige Ziele verschiedener Themen, etwa Königssee als See und als Sehenswürdigkeit, werden getrennt behandelt. Persönliche Rekorde werden für Bayern-Mix und jede Fragenanzahl separat gespeichert; Übungsrunden erhalten keine Rekordwertung.

## Antworten und Fortschritt

In allen Quizmodi steht der gesuchte Name deutlich hervorgehoben in der Frage. Ein Fortschrittsbalken und **N von M Fragen beantwortet** zählen die bereits abgegebenen Antworten; **Frage X/Y** und Punkte bleiben sichtbar. Nach der letzten Antwort ist der Balken voll. Erst **Ergebnis ansehen** beendet die Runde und speichert ihren Rekord. **Weiter** beziehungsweise **Ergebnis ansehen** steht direkt bei der Frage und bleibt auf kleinen Bildschirmen mit ihr sichtbar.

Nach einer falschen Kartenantwort erscheinen **Deine Antwort** und **Richtige Antwort**. Die gewählte Antwort wird rot markiert; das richtige Ziel erscheint grün mit einer zusätzlichen hellen Hervorhebung. Seine Informationen öffnen sich sofort, und die Karte verschiebt sich bei Bedarf zum richtigen Ziel, ohne den Zoom zu ändern. Bei sehr großen Flächen oder langen Flüssen wird deren Mitte sichtbar gemacht. **Deine Auswahl ansehen** und **Richtige Antwort ansehen** wechseln zwischen den Informationen und zeigen die jeweilige Lage. Weitere Kartenklicks nach einer Antwort verändern keine Punkte. Auch das Regierungssitz-Quiz zeigt beide Antworten als Text; seine Antwortknöpfe behalten ihre Markierungen.

Falsche Antworten warten immer auf **Weiter**. Automatisches Weitergehen nach richtigen Antworten behält die bisherigen Zeiten bei: fünf Sekunden bei Seen, Sehenswürdigkeiten und Naturschutzgebieten, sonst 1,6 Sekunden. Diese Zeiten gelten im Mix entsprechend dem aktuellen Fragenthema. Die Informationen nach einer Antwort beziehen sich zunächst auf das gesuchte Ziel, auch wenn ein anderes Ziel ausgewählt wurde.

In allen Kartenmodi helfen dezente Beschriftungen bei der Orientierung: Hessen, Baden-Württemberg, Thüringen, Sachsen, Tschechien, Österreich und die Schweiz jenseits des Bodensees. Kurze Grenzlinien außerhalb Bayerns sind schematisch. Die Nachbarn sind keine Quizziele. `generate-map.py` erzeugt diese Ebene automatisch; `python3 scripts/neighbor_context.py src/regions.svg` aktualisiert sie unabhängig von den übrigen Kartenebenen ohne Netzwerkzugriff.

Im Modus **Städte finden** werden die 25 kreisfreien Städte Bayerns auf der Karte gesucht. Vor dem Start und nach Spielende zeigt ein Klick auf einen gelben Punkt ein kleines Stadtwappen, den Stadtnamen, den Regierungsbezirk und einen Wikipedia-Link. Eine Runde enthält 3, 5, 7, 10, 15, 20 oder 25 unterschiedliche Fragen (Standard: 7). Bei einer falschen Antwort werden die gewählte Stadt rot und die gesuchte Stadt grün markiert. Nach jeder Antwort erscheinen Informationen zur gesuchten Stadt und **Weiter** ist verfügbar. **Automatisch weiter** wechselt nach einer richtigen Antwort nach 1,6 Sekunden zur nächsten Frage. Die Marker sind mit Tab und Enter/Leertaste bedienbar; bei nahe beieinanderliegenden Städten helfen die Zoomfunktionen.

Im Modus **Seen finden** werden 20 natürliche Seen, Stauseen und ein Tagebausee auf der Karte gesucht. Blaue, vereinfachte Seeumrisse zeigen die Wasserflächen; vergrößerte unsichtbare Auswahlbereiche erleichtern das Anklicken kleiner Seen. Vor dem Start und nach Spielende zeigt ein Klick ein lokal gespeichertes Foto, Lage, Entstehungstyp, ungefähre Fläche, einen kurzen Informationstext und einen Wikipedia-Link. Runden enthalten 3, 5, 7, 10, 15 oder 20 unterschiedliche Fragen (Standard: 7). Bei Fehlern werden der gewählte See rot und der gesuchte grün markiert. Nach jeder Antwort erscheinen Informationen zum gesuchten See; weitere Seen können bis **Weiter** ohne zusätzliche Wertung erkundet werden. **Automatisch weiter** wechselt nach einer richtigen Antwort nach fünf Sekunden zur nächsten Frage. Seeumrisse sind mit Tab und Enter/Leertaste bedienbar; für kleine Seen hilft der Kartenzoom.

Im Modus **Flüsse finden** lassen sich vor dem Start und nach dem Spiel die 32 Flüsse auf der Karte anklicken: Name und ungefähre Länge in Bayern erscheinen in einem Infokasten. Im Quiz wird der gesuchte Fluss auf der Karte gewählt. Es stehen 3, 5, 7, 10, 15, 20, 25 oder 30 Fragen zur Auswahl. Richtige Antworten können automatisch zur nächsten Frage führen; nach jeder Antwort ist auch **Weiter** verfügbar.

Im Modus **Gebirge finden** lassen sich vor dem Start und nach dem Spiel 15 Gebirge auf der Karte anklicken. Der Infokasten zeigt ihre Lage und einen markanten Gipfel mit ungefährer Höhe. Im Quiz wird das gesuchte Gebirge auf der Karte gewählt. Es stehen 3, 5, 7, 10 oder 15 Fragen zur Auswahl. Bei einer falschen Antwort werden das gewählte und das richtige Gebirge markiert. Nach einer richtigen Antwort ist automatisches Weitergehen möglich; **Weiter** bleibt nach jeder Antwort verfügbar.

Im Modus **Sehenswürdigkeiten finden** können 20 Bauwerke und Naturziele aus allen sieben Regierungsbezirken erkundet werden. Ein Klick auf einen violetten Kartenpunkt zeigt ein lokal gespeichertes Foto, Lage, einen kurzen Informationstext und einen deutschen Wikipedia-Link. **Start** beginnt das Kartenquiz mit 3, 5, 7, 10, 15 oder 20 unterschiedlichen Fragen (Standard: 7). Nach jeder Antwort erscheint die Information zum gesuchten Ort. Bei einer falschen Antwort wird der gewählte Punkt rot und der richtige grün markiert. **Weiter** ist nach jeder Antwort möglich; **Automatisch weiter** wechselt nach einer richtigen Antwort nach fünf Sekunden. Nach Spielende können alle Orte wieder erkundet werden. Die Infokarte lässt sich schließen; auf großen Bildschirmen erscheint sie neben der Karte, auf kleineren darunter. Kartenpunkte sind auch mit Tab und Enter/Leertaste bedienbar.

Im Modus **Naturschutzgebiete finden** können 20 ausgewählte Schutzgebiete aus allen sieben Regierungsbezirken über türkisfarbene Kartenpunkte erkundet werden. Eine schließbare Infokarte zeigt ein kleines Foto, Name, Lage, Regierungsbezirk, einen kurzen Text und einen deutschen Wikipedia-Link. **Start** beginnt das Kartenquiz mit 3, 5, 7, 10, 15 oder 20 unterschiedlichen Fragen (Standard: 7). Bei einer falschen Antwort wird der gewählte Punkt rot und der gesuchte grün markiert. Nach jeder Antwort erscheinen die Informationen zum gesuchten Gebiet; weitere Punkte lassen sich bis **Weiter** ohne zusätzliche Wertung erkunden. **Automatisch weiter** wechselt nach einer richtigen Antwort nach fünf Sekunden zur nächsten Frage. Vor dem Start und nach Spielende können alle Gebiete erkundet werden. Die Punkte sind mit Tab und Enter/Leertaste bedienbar; bei nahe gelegenen Gebieten hilft der Kartenzoom.

Im Modus **Lernen** können Regierungsbezirke, Städte, Seen, Flüsse, Gebirge, Sehenswürdigkeiten und Naturschutzgebiete über Checkboxen einzeln ein- und ausgeblendet werden. Alle sieben Themen sind standardmäßig aktiv; die Auswahl wird im Browser gespeichert. Bereits gespeicherte Einstellungen bleiben erhalten; neue Themen wie Seen sind zunächst eingeschaltet. Ein Klick auf ein Kartenelement zeigt die zugehörigen Informationen. Wenn Städte eingeblendet sind, ersetzen ihre gelben Marker die schwarzen Regierungssitz-Punkte.

## Fehler ansehen und wiederholen

Nach einer abgeschlossenen Runde zeigt **Deine Fehler** die falsch beantworteten Fragen mit **Deine Antwort** und **Richtige Antwort**. Bei einer fehlerfreien Runde erscheint **Alles richtig!**. Die Übersicht wird nach dem Weitergehen nach der letzten Antwort angezeigt.

**Fehler wiederholen (N)** startet eine zufällig sortierte Übungsrunde mit genau den zuletzt falsch beantworteten Fragen, auch bei nur einer oder zwei Fragen. Nach jeder Übungsrunde können ausschließlich die noch verbleibenden Fehler erneut geübt werden. Sobald alle Antworten richtig sind, erscheint **Alle Fehler geschafft!**. **Übung neu starten** beginnt die aktuelle Übungsrunde mit ihrem vollständigen Fragensatz erneut; **Neue Runde** startet ein normales Quiz mit der eingestellten Fragenanzahl.

Übungsrunden sind als **Fehler üben · Übungsrunde – ohne Rekordwertung** gekennzeichnet und verändern keine persönlichen Rekorde. Kartenbedienung, Rückmeldungen und automatisches Weitergehen funktionieren wie im normalen Quiz. Fehlerübersichten bleiben nur im Arbeitsspeicher: Eine neue normale Runde, ein Moduswechsel oder das Neuladen der Seite verwirft sie. Die Fragenanzahl kann nach Spielende geändert werden, ohne die aktuelle Übersicht zu verlieren; sie gilt für die nächste normale Runde.

## Fehler korrigieren

**Fehler korrigieren** sammelt falsch beantwortete Fragen aus allen Quizthemen dauerhaft in diesem Browser – einschließlich Regierungssitzen, Bayern-Mix und den bisherigen Fehler-Übungsrunden. Die Themenkarte zeigt die Anzahl offener Fragen. Dieser Modus wird ausschließlich über die Themenauswahl aktiviert. Nach einer normalen Runde übt **Fehler wiederholen** nur die Fehler dieser Runde, ohne das Thema zu wechseln. Ohne gespeicherte Fehler ist der Start deaktiviert.

Jede Frage muss in **zwei aufeinanderfolgenden Runden richtig** beantwortet werden, um aus der Liste zu verschwinden. Eine falsche Antwort setzt ihren Fortschritt auf null zurück. Auch richtige Antworten in normalen Quizrunden und bisherigen Fehlerübungen zählen. Gleichnamige Ziele verschiedener Themen bleiben getrennt; dieselbe Kartenfrage im Einzelthema und Bayern-Mix teilt ihren Fortschritt. Regierungsbezirke auf der Karte und ihre Regierungssitze sind unterschiedliche Fragen.

Eine Übungsrunde enthält bis zu zehn unterschiedliche gespeicherte Fragen. Fragen ohne richtige Antwort haben Vorrang vor Fragen mit bereits einer richtigen Antwort; Auswahl und Reihenfolge sind innerhalb dieser Regeln zufällig. Regierungssitzfragen wechseln automatisch zu Antwortknöpfen. **Neue Übungsrunde** und **Übung neu starten** wählen aus den aktuell noch offenen Fragen neu aus. Ein Neustart zählt als neue Runde; eine Wartefrist gibt es nicht. Diese Runden erhalten keine Rekordwertung. Die bisherige Funktion **Fehler wiederholen** für die zuletzt abgeschlossene Runde bleibt erhalten.

Fehler und Korrekturen werden **sofort nach jeder gewerteten Antwort** gespeichert. Abbrechen, Themenwechsel und Neuladen behalten bereits erzielten Fortschritt. Nach der ersten richtigen Antwort erscheint **1 von 2 richtig**, nach der zweiten **Fehler korrigiert!**. Das Ergebnis zeigt die in dieser Runde korrigierten und die insgesamt noch offenen Fragen. Eine fehlerfreie Übungsrunde kann daher weitere offene Fragen hinterlassen.

Die Speicherung benötigt kein Konto und keinen Server und funktioniert offline. Wenn Browser-Speicher nicht verfügbar ist, bleibt die Liste für die aktuelle Sitzung erhalten; ein Hinweis steht in den Einstellungen. Das Löschen der Browserdaten entfernt die Liste. Rekorde und andere Einstellungen sind unabhängig. Fehler aus Sitzungen vor Einführung dieser Funktion lassen sich nicht nachträglich übernehmen.

## Persönliche Rekorde

Alle neun Quizmodi speichern einen persönlichen Rekord getrennt nach Modus und Fragenanzahl. Jede Themenkarte zeigt den bisherigen Bestwert für die eingestellte Fragenanzahl, etwa **Dein Rekord: 6/7**. Unterstützt ein Thema diese Fragenanzahl nicht, zeigt seine Karte den Rekord für sieben Fragen; beim Auswählen wird ebenfalls auf sieben Fragen gewechselt. Ohne gespeicherten Rekord erscheint **Dein Rekord: noch keiner** mit der Fragenanzahl. Die Lernkarte zeigt **Ohne Wertung**. Der ausgewählte Rekord steht zusätzlich in den Einstellungen. Nach einer abgeschlossenen Runde zeigt das Ergebnis einen ersten, verbesserten oder eingestellten Rekord an. Gewertet werden ausschließlich richtige Antworten; es gibt keine Zeitwertung. Eine Runde zählt erst nach dem Weitergehen nach der letzten Antwort. Abgebrochene und neu gestartete Runden sowie **Lernen** erhalten keinen Rekord.

Rekorde werden ausschließlich in diesem Browser gespeichert, ohne Konto oder Übertragung an einen Server. Das Löschen der Browserdaten entfernt sie. Ist dauerhafte Speicherung nicht verfügbar, bleiben Rekorde für die aktuelle Sitzung erhalten; ein Hinweis erscheint in den Einstellungen.

Über **Rekorde zurücksetzen…** lässt sich nach einer Bestätigung entweder **dieser Rekord** (ausgewählter Modus und Fragenanzahl) oder **alle Rekorde** löschen. Andere Einstellungen bleiben erhalten. Das Zurücksetzen kann nicht rückgängig gemacht werden und ist während einer laufenden Runde nicht verfügbar. **Abbrechen** oder Escape schließt den Dialog ohne Änderungen.

## Oberfläche und Bildschirmgrößen

Über der Karte und den Einstellungen stehen elf Themenkarten mit Vorschaubild, kurzer Beschreibung und persönlichem Rekord. Ein Klick auf eine Karte wählt den Modus. Die beim Scrollen sichtbare Startleiste über den Karten zeigt das ausgewählte Thema und die Fragenanzahl; **Quiz starten** beginnt direkt die Runde. Bei **Lernen** öffnet **Karte erkunden** die kompakte Kartenansicht ohne Wertung. **Start** unter den Einstellungen bleibt ebenfalls verfügbar. **Lernen** ist standardmäßig ausgewählt. Ein Wechsel zu einem anderen Thema beendet eine laufende Runde ohne Rekordwertung. Nach dem ersten Quizstart oder **Karte erkunden** verschwinden die Karten aus dem Seitenlayout, damit die Karte mehr Platz erhält. In den Einstellungen stehen dann das aktuelle Thema und **Thema wechseln**. Dieser Knopf öffnet die Themenkarten in einem Dialog; auch nach Rundenende, beim Fehlerüben und beim Wechsel zu Lernen bleibt die Oberfläche kompakt. **Schließen** oder Escape behält die laufende Runde bei. Die Auswahl des aktuellen Themas schließt den Dialog ebenfalls ohne Neustart. Erst die Auswahl eines anderen Themas beendet die Runde. Automatisches Weitergehen läuft während des geöffneten Dialogs weiter. Die Karten lassen sich auch über die Tastatur auswählen. Nach dem Neuladen stehen sie wieder über der Karte. Auf großen Bildschirmen stehen drei Karten nebeneinander, auf mittleren zwei und auf schmalen eine.

Ab 1.100 Pixeln stehen Einstellungen, Quizfrage und Ortsinformationen in einer Seitenleiste neben der Karte. Die Karte nutzt die gesamte Breite ihres Bereichs und passt ihre Höhe an das Fenster an. Die Seitenleiste lässt sich unabhängig scrollen; ausgewählte Ortsinformationen werden automatisch in ihren sichtbaren Bereich gebracht. Auf kleineren Bildschirmen sind die Bereiche untereinander angeordnet. Beim Quizstart werden dort die **Einstellungen** eingeklappt; sie lassen sich jederzeit wieder öffnen. Frage und Fortschritt bleiben beim Scrollen sichtbar, außer bei sehr geringer Bildschirmhöhe. Auch in der Desktop-Seitenleiste bleibt die Quizfrage beim Scrollen der Ortsinformationen angeheftet. Informationen zu allen Kartenthemen erscheinen unter der Karte, werden beim Auswählen automatisch in den sichtbaren Bereich gescrollt und lassen sich über **×** schließen. Die **Kartenhilfe** enthält Hinweise zur Maus- und Touchbedienung.

## Karte vergrößern und verschieben

In allen Modi kann die Karte über **+** und **−** zwischen 100 % und 400 % vergrößert werden. **Zurücksetzen** zeigt wieder ganz Bayern. Am PC zoomt das Mausrad um die Zeigerposition; eine vergrößerte Karte lässt sich mit gedrückter Maustaste verschieben. Browser-Zoom mit Strg/Cmd bleibt verfügbar.

Auf dem Smartphone vergrößern und verkleinern zwei Finger die Karte. Nach dem Vergrößern verschiebt ein Finger die Karte; bei 100 % scrollt ein Finger die Seite. Außerhalb der Karte bleibt die normale Seitenbedienung verfügbar. Ziehen und Zoomen wählen keine Quizantwort aus.

Mit der Tastatur: Karte per Tab fokussieren, mit **+ / −** zoomen, mit den **Pfeiltasten** verschieben und mit **Pos1** zurücksetzen. Kartenelemente bleiben mit Tab und Enter/Leertaste auswählbar und werden beim Fokussieren sichtbar gemacht.

Zoom und Ausschnitt bleiben zwischen Fragen und beim Ändern der Lernthemen erhalten. Start, Neustart und Moduswechsel setzen die Ansicht zurück. Im Bayern-Mix setzt auch ein Wechsel des Fragenthemas die Ansicht zurück; Korrekturen können den Ausschnitt zum richtigen Ziel verschieben. Die Ansicht wird nicht dauerhaft gespeichert.

## Lokal starten

Node.js und Python 3 werden benötigt; npm-Abhängigkeiten gibt es nicht.

```sh
npm run build
npm run serve:dist
```

Danach `http://localhost:8000/` öffnen. `npm test` prüft die Quizdaten und den Spielablauf.

## Als App installieren und offline spielen

Die gebaute Version in `dist/` ist eine Progressive Web App (PWA). Auf Android die
Website in Chrome öffnen und **App installieren** wählen, sobald der Knopf
angeboten wird. Alternativ im Browsermenü **App installieren** oder **Zum
Startbildschirm hinzufügen** wählen. Das BayernQuiz-Symbol startet das Spiel in
einem eigenen Fenster. Die genaue Installation hängt vom Browser ab.

Beim ersten Onlinebesuch lädt der Service Worker sämtliche lokalen Spieldateien,
Karten, Fotos und Lizenznachweise herunter (etwa 4,6 MB zuzüglich App-Symbolen).
Erst **Offline verfügbar** bestätigt den abgeschlossenen Download. Danach lässt
sich das Spiel auch ohne Verbindung öffnen; externe Wikipedia- und Quellenlinks
benötigen weiterhin Internet. **Offline noch nicht verfügbar** bedeutet, dass
der Download noch läuft oder fehlgeschlagen ist; bei einer späteren Onlineöffnung
wird die Installation erneut versucht. Browser können gespeicherte Dateien bei
Speicherknappheit oder beim Löschen von Websitedaten entfernen.

Updates werden beim Onlineöffnen im Hintergrund vollständig heruntergeladen.
Sie werden erst aktiv, wenn alle offenen BayernQuiz-Fenster und -Tabs geschlossen
sind. Eine laufende Runde wird nicht neu geladen. Rekorde und Lernthemen bleiben
unter ihren bisherigen Browser-Speicherschlüsseln erhalten; laufende Runden werden
nicht gespeichert. Gespeicherte Daten sind an den Browser und die Hosting-Origin
gebunden und werden bei einem Domainwechsel nicht automatisch übernommen.

Zum Prüfen `npm run build` und `npm run serve:dist` ausführen. Auf
`http://localhost:8000/` ist der Service Worker auch ohne HTTPS erlaubt. In den
Chromium-Entwicklerwerkzeugen unter **Application** Manifest, Service Worker und
Cache Storage prüfen. Nach **Offline verfügbar** im Network-Panel **Offline**
aktivieren und die Seite neu laden; alle Quizmodi und bisher ungeöffnete Fotos
müssen funktionieren. Auf Android zusätzlich nach der Installation im Flugmodus
über das App-Symbol starten. Eine unverschlüsselte LAN-IP ist kein Ersatz für
HTTPS bei der Prüfung auf dem Telefon. Direktes Öffnen per `file://` oder das
Ausliefern von `src/` unterstützt die Offlineinstallation nicht.

Für späteres Hosting den gesamten Inhalt von `dist/` auf einem statischen
HTTPS-Host veröffentlichen. Domainwurzel und Unterverzeichnisse wie
`/BayernQuiz/` werden unterstützt; Unterverzeichnisse mit abschließendem Slash
ausliefern. `manifest.webmanifest` als `application/manifest+json` und JavaScript
einschließlich `sw.js` mit JavaScript-MIME-Typ ausliefern. Für `sw.js` und
`index.html` `Cache-Control: no-cache` setzen; keine dauerhaft unveränderlichen
HTTP-Caches für die übrigen unversionierten Dateinamen verwenden. Neue Builds
vollständig und möglichst atomar bereitstellen, damit die Cacheinstallation
nicht Dateien verschiedener Versionen mischt. Ein Hostinganbieter und eine
Veröffentlichung sind hier nicht eingerichtet.

`npm test` prüft zusätzlich Manifest, PNG-Abmessungen, Build-Versionierung,
vollständige Offline-Dateiliste, fehlgeschlagene Downloads und Cache-Isolation.

## Kartendaten

Die Karte wurde aus dem WFS-Layer `vergr:BezirkeFlaeche` des [Verwaltungsatlas Bayern](https://geoportal.bayern.de/geoportalbayern/details-suche?1=&resId=baa244c2-42d2-43b2-932e-af30b4cd80cb) erzeugt (abgerufen am 13. November 2026). Datenquelle: **Bayerische Vermessungsverwaltung – www.geodaten.bayern.de**, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.de). Für die Darstellung wurden die Polygone vereinfacht; Grenzen sind daher nicht für amtliche Zwecke geeignet.

Der [Regierungssitz jedes Bezirks](https://www.stmi.bayern.de/staat-und-verfassung/staatsgebiet/) wurde mit dem Bayerischen Staatsministerium des Innern abgeglichen.
Die schwarzen Punkte zeigen die Lage der sieben Regierungssitze auf der Karte. Ihre Stadtkoordinaten stammen aus [GeoNames](https://www.geonames.org/search.html?q=Germany%2C+Bayern) und werden beim Erzeugen der Karte in das Kartenkoordinatensystem projiziert. Die Quelldaten stehen in `scripts/seat-locations.json`.
Die zusätzlichen Stadtoptionen im Regierungssitz-Quiz stammen aus dem [Verzeichnis der kreisfreien Städte Bayerns](https://www.statistik.bayern.de/mam/produkte/veroffentlichungen/statistische_berichte/e1111c_202300.pdf).

Die 30 längsten Flüsse und zusätzlich Rednitz und Regnitz sowie ihre Längen in Bayern stammen aus der [Tabelle der 100 längsten Fließgewässer in Bayern](https://www.lfu.bayern.de/wasser/gewaesserverzeichnisse/doc/tab_gew_name_100_laeng.pdf) des Bayerischen Landesamts für Umwelt (Stand 2016). Die beiden Flüsse namens Vils werden nach ihren Mündungsflüssen unterschieden. Die Längen umfassen auch Abschnitte auf der Landesgrenze und werden auf ganze Kilometer gerundet angezeigt. Die vereinfachten Flussläufe wurden aus dem [ATKIS Basis-DLM WFS](https://geodatenonline.bayern.de/geodatenonline/seiten/wfs_atkis) der Bayerischen Vermessungsverwaltung abgeleitet und auf die Quizkarte projiziert. Die Karte dient der Orientierung, nicht der präzisen Navigation. ATKIS-Daten: **Bayerische Vermessungsverwaltung – www.geodaten.bayern.de**, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.de).

Die 15 Gebirgslinien sind vereinfachte, von Hand gesetzte Mittellinien in der bayerischen Landesfläche. Sie orientieren sich an der [naturräumlichen Gliederung des LfU](https://www.lfu.bayern.de/natur/naturraeume/index.htm) und zeigen ungefähre Lagen, keine amtlichen Grenzen. Die Infokarte nennt jeweils einen markanten Gipfel, nicht die Höhe des gesamten Gebirges. Die Gipfelhöhen stammen von regionalen Quellen: [Oberstdorf (Hochfrottspitze)](https://www.oberstdorf.de/alpininfo/allgaeuer-alpen/geographie/), [Ammergauer Alpen Tourismus (Kreuzspitze)](https://www.ammergauer-alpen.de/tour/bergtour-kreuzspitze), [Deutscher Alpenverein (Zugspitze)](https://www.alpenverein.de/artikel/wandern-in-bayern_4eb0e66d-96da-415e-b954-c32f9561d8ec), [Deutscher Alpenverein (Benediktenwand)](https://www.alpenverein.de/artikel/huettentipp-tutzinger-huette-bayerische-voralpen_0aebcec8-b551-48f6-9760-8efa8c710c64), [Chiemgau Tourismus (Sonntagshorn)](https://www.chiemsee-chiemgau.info/sonntagshorn-1961-m), [Berchtesgaden Tourismus (Watzmann)](https://www.berchtesgaden.de/ramsau), [Rhön Tourismus (Kreuzberg)](https://www.rhoen.de/media/www.rhoen.de/org/med_2067/44942_rhoen_flyer-kreuzberg_12-2018_03_final_druckfreigabe.pdf), [LfU (Geiersberg)](https://www.lfu.bayern.de/natur/natura2000_managementplaene/6020_6946/doc/6022_371/texte/de6022371_t_fg_nfin.pdf), [Steigerwald Tourismus (Schwanberg)](https://www.steigerwaldtourismus.com/steigerwald/regionen/rund-um-den-schwanberg), [Haßberge Tourismus (Bramberg)](https://www.hassberge-tourismus.de/detail/id%3D69c671aeb2293959b3bd93d4), [Naturpark Frankenwald (Döbraberg)](https://www.naturpark-frankenwald.de/detail/id%3D6087fb1b0d7ea872058c96c8), [Fichtelgebirge Tourismus (Schneeberg)](https://www.fichtelgebirge.bayern/fileadmin/user_upload/PDF_Intern/Blaetter_PDF_Kataloge/8_WEBANSICHT_Wanderhighlights_2023.pdf), [LBV (Poppberg)](https://www.lbv.de/naturschutz/lebensraeume-schuetzen/gew%C3%A4sser/quellschutz/kalktuffquellen/projektgebiet/), [Landkreis Tirschenreuth (Entenbühl)](https://www.kreis-tir.de/fileadmin/user_upload/Landkreisbuch/index.html) und [Bayerischer Wald Tourismus (Großer Arber)](https://www.bayerischer-wald.de/attraktion/grosser-arber-dc2c76be82).

Die Gebirgsinformationen zeigen kleine Landschaftsfotos aus Wikimedia Commons. Die JPEG-Vorschauen werden lokal unter `assets/mountains/` gebündelt und mit höchstens 240 × 140 Pixeln angezeigt. Bei einem Ladefehler bleiben die Textinformationen verfügbar. Urheber, Lizenzen und Originaldateien stehen in [`assets/mountains/ATTRIBUTION.md`](assets/mountains/ATTRIBUTION.md) und `assets/mountains/metadata.json`. Im Browser werden keine Wikimedia-APIs aufgerufen. Fotos und Nachweise aktualisieren mit:

```sh
python3 scripts/fetch-mountain-images.py --refresh
```

### Städte

Die Auswahl entspricht den [25 kreisfreien Städten im BayernPortal](https://www.bayernportal.de/dokumente/behoerde/0154617984105) (abgeglichen am 15. November 2026). Namen, Regierungsbezirke, Wikipedia-Titel und WGS84-Koordinaten stehen in `CITIES` in `src/game.js`. Die sieben Regierungssitze verwenden dieselben Koordinaten wie `scripts/seat-locations.json`. Die übrigen Koordinaten stammen aus dem [GeoNames-Datenexport cities15000](https://download.geonames.org/export/dump/cities15000.zip), abgerufen am 15. November 2026; die zugehörigen GeoNames-Einträge sind pro Stadt verlinkt. Quelle: **GeoNames – www.geonames.org**, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.de). Die Punkte zeigen ungefähre Stadtlagen, keine Stadtgrenzen.

`python3 scripts/generate-cities.py src/regions.svg` projiziert den gemeinsamen Datenbestand ohne Netzwerkzugriff auf die Karte. Node.js wird zum Einlesen der Daten benötigt. Das Skript vor `generate-sights.py` ausführen, damit Sehenswürdigkeiten in Lernen über den Stadtmarkern liegen und auswählbar bleiben.

Die Stadtinformationen zeigen in Quiz und Lernen ein kleines Wappen. Die verkleinerten PNG-Dateien sind lokal unter `assets/cities/` gebündelt; im Browser werden keine Wikimedia-APIs aufgerufen. Die Wappen stammen aus den Stadt-Infoboxen der deutschen Wikipedia und Wikimedia Commons. Originaldateien, Urheber und Lizenzen sind in [`assets/cities/ATTRIBUTION.md`](assets/cities/ATTRIBUTION.md) und `assets/cities/metadata.json` dokumentiert. Aktualisieren mit:

```sh
python3 scripts/fetch-city-coats.py --refresh
```

### Seen und Fotos

Die 20 Seen in `LAKES` in `src/game.js` umfassen Chiemsee, Starnberger See, Ammersee, Tegernsee, Schliersee, Walchensee, Kochelsee, Königssee, Eibsee, Staffelsee, Forggensee, Großer Alpsee, Bodensee, Großer und Kleiner Brombachsee, Altmühlsee, Rothsee, Steinberger See, Drachensee und Weißenstädter See. Im Lernmodus lassen sie sich über **Seen** ein- und ausblenden. Gespeicherte Einstellungen anderer Themen bleiben erhalten; Seen sind zunächst eingeschaltet.

Die Seeumrisse stammen aus `AX_StehendesGewaesser` des [ATKIS Basis-DLM WFS](https://geodatenonline.bayern.de/geodatenonline/seiten/wfs_atkis), abgerufen am 15. November 2026. Quelle: **Bayerische Vermessungsverwaltung – www.geodaten.bayern.de**, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.de). Die EPSG:3857-Polygone sind in `scripts/lake-geometry.json` gebündelt; bei Königssee und Rothsee werden gleichnamige Gewässer anderer Orte über geografische Auswahlfenster ausgeschlossen. Das Skript vereinfacht die Konturen und lässt Fragmente unterhalb der Kartenauflösung weg. Die Karte dient der Orientierung, nicht der Navigation. Beim Bodensee zeigt die Karte den im bayerischen Datenbestand enthaltenen Uferbereich; **536 km² beziehen sich auf den gesamten Bodensee einschließlich Untersee**, nicht nur den dargestellten Bereich.

Flächen und Kurztexte wurden anhand der verlinkten deutschen Wikipedia-Artikel abgeglichen; genaue Artikelrevisionen stehen in [`assets/lakes/data-sources.json`](assets/lakes/data-sources.json). Texte wurden eigenständig formuliert. Wikipedia-Inhalte: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.de), siehe die jeweiligen Versionsgeschichten. Flächen sind gerundete Orientierungswerte und können mit dem Wasserstand schwanken. Der Rothsee hat einschließlich Vorsperre ca. 2,1 km² ([Landratsamt Roth](https://www.landratsamt-roth.de/rothsee)); beim Drachensee werden ca. 0,88 km² bei Normalstau verwendet ([Betriebsdaten nach WWA Regensburg](https://www.furth-drachensee.de/index.php/de/der-drachensee/betrieb-und-sicherheit)). Stauseen und der aus einem Braunkohletagebau entstandene Steinberger See werden als solche gekennzeichnet.

Die lokalen JPEG-Vorschaubilder aus Wikimedia Commons werden mit 320 Pixel Breite angefordert und mit höchstens 240 × 140 Pixeln angezeigt. Bildausfälle lassen die Textinformationen verfügbar. Urheber, Originaldateien und Lizenzen stehen in [`assets/lakes/ATTRIBUTION.md`](assets/lakes/ATTRIBUTION.md) und `assets/lakes/metadata.json`. Im Browser sind keine Wikimedia- oder Geodaten-Abfragen nötig.

```sh
# Offline: erzeugt ausschließlich die Seenebene, unter den bestehenden Kartenmarkern.
python3 scripts/generate-lakes.py src/regions.svg
# Optional: amtliche Quelldaten neu laden und anschließend die Ebene erzeugen.
python3 scripts/generate-lakes.py src/regions.svg --refresh
# Fotos und Bildnachweise aktualisieren.
python3 scripts/fetch-lake-images.py --refresh
```

### Sehenswürdigkeiten und Fotos

Die kuratierte Auswahl enthält Schloss Linderhof, Schloss Herrenchiemsee, Königssee, Zugspitze, Befreiungshalle, Kloster Weltenburg, Veste Oberhaus, Walhalla, Steinerne Brücke, Burg Falkenberg, Bamberger Dom, Markgräfliches Opernhaus, Veste Coburg, Nürnberger Kaiserburg, Plönlein, Würzburger Residenz, Schloss Mespelbrunn, Schloss Johannisburg, Schloss Neuschwanstein und Lindauer Hafeneinfahrt. Die deutschen Kurztexte und offiziellen Betreiber- beziehungsweise Tourismusquellen stehen zusammen mit den WGS84-Koordinaten in `SIGHTS` in `src/game.js`.

Die Kartenpunkte sind ungefähre Orientierungsmarkierungen. Der Königssee wird durch St. Bartholomä am Westufer, die Zugspitze durch den Gipfel und die Lindauer Hafeneinfahrt durch einen Punkt zwischen Löwe und Leuchtturm repräsentiert. Die übrigen Punkte liegen an den jeweiligen Bauwerken. Artikelkoordinaten und Bildmetadaten sind in [`assets/sights/metadata.json`](assets/sights/metadata.json) dokumentiert; die bewusst gewählten repräsentativen Punkte stehen im Datenbestand.

Die lokal gebündelten, verkleinerten Fotos stammen aus Wikimedia Commons. Urheber, Lizenzen und Originaldateien sind in [`assets/sights/ATTRIBUTION.md`](assets/sights/ATTRIBUTION.md) nachgewiesen. Im Browser werden keine Wikimedia-APIs aufgerufen. Fotos und Nachweise lassen sich bei Bedarf aktualisieren:

```sh
python3 scripts/fetch-sight-images.py --refresh
```

Das Skript prüft Bildquellen und freie Lizenzen; die kuratierten Markerkoordinaten bleiben dabei erhalten. Beide Sehenswürdigkeiten-Skripte benötigen zusätzlich Node.js zum Einlesen des gemeinsamen Datenbestands.

### Naturschutzgebiete

`NATURE_RESERVES` in `src/game.js` enthält die gemeinsame Datengrundlage für Quiz, Lernen und Kartengenerator: stabile Codes, amtliche Namen und Kennungen, Regierungsbezirke, WGS84-Koordinaten, Lagebeschreibungen, deutsche Kurztexte, Wikipedia-Titel und amtliche Quellenlinks. Die Auswahl ist kuratiert und enthält 20 Gebiete; Nationalparks und Naturparks sind nicht Teil dieses Quiz.

Die Namen und SGD-Kennungen wurden mit der [Grünen Liste des LfU](https://www.lfu.bayern.de/natur/schutzgebiete/schutzgebietslisten/doc/naturschutzgebiete.pdf) (Stand 31.12.2025) abgeglichen. Eine aktuelle Änderung berücksichtigt die [Verordnung der Regierung von Oberfranken vom 21. Januar 2026](https://www.regierung.oberfranken.bayern.de/mam/service/umwelt/natur/105_02_luisenburg_felsenlabyrinth_wunsiedel.pdf): Das frühere Gebiet Luisenburg wurde zum 1. Februar 2026 durch **Luisenburg-Felsenlabyrinth Wunsiedel** ersetzt. Hier wird die regionale Kennung **NSG-105 (Oberfranken)** verwendet, statt die alte SGD-Kennung weiterzuführen. Die übrigen Kennungen folgen der Grünen Liste. Quellenabgleich: 15. November 2026.

Die Markerkoordinaten stammen aus den Positionsangaben der Wikipedia-Gebietslisten für [Oberbayern](https://de.wikipedia.org/wiki/Liste_der_Naturschutzgebiete_in_Oberbayern), [Niederbayern](https://de.wikipedia.org/wiki/Liste_der_Naturschutzgebiete_in_Niederbayern), [Oberpfalz](https://de.wikipedia.org/wiki/Liste_der_Naturschutzgebiete_in_der_Oberpfalz), [Oberfranken](https://de.wikipedia.org/wiki/Liste_der_Naturschutzgebiete_in_Oberfranken), [Mittelfranken](https://de.wikipedia.org/wiki/Liste_der_Naturschutzgebiete_in_Mittelfranken), [Unterfranken](https://de.wikipedia.org/wiki/Liste_der_Naturschutzgebiete_in_Unterfranken) und [Schwaben](https://de.wikipedia.org/wiki/Liste_der_Naturschutzgebiete_in_Schwaben_(Bayern)), abgerufen am 15. November 2026 und auf fünf Nachkommastellen gerundet. Der Luisenburg-Punkt liegt im Felsenlabyrinth und wird auch für das neu abgegrenzte Gebiet verwendet. Die Punkte zeigen ungefähre repräsentative Lagen, keine Schutzgebietsgrenzen oder Eingänge. Die Kurztexte wurden anhand der verlinkten Gebietsartikel und amtlichen Informationsangebote eigenständig formuliert. Wikipedia-Inhalte: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.de), jeweilige Versionsgeschichten bei den verlinkten Artikeln. Die Fotos werden lokal gebündelt; im Browser werden keine Wikimedia-APIs aufgerufen.

Die kleinen Fotos stammen aus Wikimedia Commons und werden unter `assets/nature-reserves/` gespeichert. Urheber, Lizenzen und Originaldateien stehen in [`assets/nature-reserves/ATTRIBUTION.md`](assets/nature-reserves/ATTRIBUTION.md) und `assets/nature-reserves/metadata.json`. Die Vorschauen werden mit 320 Pixel Breite angefordert und in den Infokarten mit höchstens 240 × 140 Pixeln dargestellt. Bei einem Ladefehler bleiben die Textinformationen verfügbar. Fotos und Nachweise aktualisieren mit:

```sh
python3 scripts/fetch-nature-images.py --refresh
```

`python3 scripts/generate-nature-reserves.py src/regions.svg` projiziert die gemeinsamen Daten ohne Netzwerkzugriff auf die Karte. Node.js wird zum Einlesen benötigt. Das Skript zuletzt ausführen, damit die Reservemarker über den übrigen Kartenebenen liegen. Wiederholtes Ausführen ersetzt ausschließlich die eigene Ebene.

Zur Aktualisierung der Karte die WFS-GetFeature-Antwort für `vergr:BezirkeFlaeche` in EPSG:3857 als GML speichern und ausführen:

```sh
python3 scripts/generate-map.py /pfad/zur/antwort.gml src/regions.svg
python3 scripts/generate-lakes.py src/regions.svg
python3 scripts/generate-rivers.py src/regions.svg
python3 scripts/generate-mountains.py src/regions.svg
python3 scripts/generate-cities.py src/regions.svg
python3 scripts/generate-sights.py src/regions.svg
python3 scripts/generate-nature-reserves.py src/regions.svg
```

## Lizenz

Der Anwendungscode steht unter GPLv3 oder einer späteren Version. Siehe [LICENSE](LICENSE). Die Kartendaten stehen unter CC BY 4.0 mit der oben genannten Quellenangabe. Für Fotos gelten die jeweils in den Bildnachweisen aufgeführten Lizenzen.

## Aufbau der Oberfläche

`src/app.js` startet den `quiz-controller.js`. Dieser besitzt den Spielzustand,
Rundenwechsel, Antwortwertung und den Timer für automatisches Weitergehen und
verbindet die Ansichten über Rückrufe. `game.js`, `highscores.js` und
`mistakes.js` bleiben für Spielregeln und Speicherung zuständig.

- `quiz-view.js` rendert Fragen, Fortschritt, Antworten und Ergebnisse anhand
  eines übergebenen Zustands, ohne Antworten zu werten oder Rekorde zu speichern.
- `map-view.js` lädt die Karte, verwaltet Ebenen, Markierungen und Zoom und meldet
  Maus- und Tastaturauswahlen als `{ topic, code }` an den Controller.
- `info-cards.js` verwaltet Informationen, Bilder und Fokus beim Schließen.
- `settings-view.js` verwaltet Themenauswahl, Lernpräferenzen und den Rekorddialog.
- `layout.js` übernimmt Scrollen und responsive Positionierung.
- `events.js` bündelt Listener pro Komponente; `destroy()` entfernt sie wieder.

Ansichten importieren den Controller nicht. Der Controller entscheidet, ob eine
Kartenauswahl als Antwort oder zum Erkunden dient. Neue Module unter `src/`
werden automatisch in den Build und den Offline-Cache aufgenommen.

Zusätzlich zu `npm test` prüft `node scripts/browser-smoke.mjs` die Oberfläche
in Chromium, einschließlich gemischter Runden, Fehlerkorrektur, Timer-Abbruch,
Rekorden, Tastaturauswahl und Offline-Neuladen. Dafür zunächst `npm run build`
ausführen und `dist` mit `npm run serve:dist` bereitstellen. Chromium mit einem
**separaten Testprofil** und `--remote-debugging-port=9222` starten. Das Skript
löscht die Quizdaten im Testbrowser. `APP_URL` (Standard
`http://localhost:8000/`) und `CHROME_DEBUG_URL` (Standard
`http://127.0.0.1:9222`) können angepasst werden. Das Skript benötigt Node.js mit
integriertem `WebSocket` und verwendet keine zusätzlichen Testpakete.
