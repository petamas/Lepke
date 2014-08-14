Lepke
=====

Kiegészítő a Moly.hu oldalhoz

# Telepítés Firefoxba és Chromeba

Első telepítés:

1. Ha még nincs fenn, akkor telepítsd fel Firefox esetén a [Greasemonkey](http://goo.gl/7gZwzM) nevű kiegészítőt, Chrome esetén a [Tampermonkey](http://goo.gl/1BfYvs) nevű kiegészítőt.

2. Menj fel [erre](https://github.com/petamas/Lepke/blob/master/Lepke.user.js) az oldalra. 

3. Kattints a kód jobb felső sarkában található _RAW_ feliratú gombra. 

4. A megjelenő ablakban kattints az _Install_ gombra. 

5. Frissítsd az éppen nyitva lévő molyos oldalakat.

Új verzióra frissítés esetén kövesd ugyanezeket a lépéseket a 2. ponttól kezdve. (Vagy, ha a program kezdeményezte a frissítést, akkor a 4. ponttól.)

# Telepítés Google Chrome-ba (Tampermonkey nélkül)

Ez a bonyolultabb verzió, ha nincs különösebb okod rá, ne használd.

A kiegészítő első telepítésekor a következők szerint járj el:

1. Csinálj egy mappát a gépeden, amiben a kiegészítő kódját fogod tárolni. Ezt a mappát nem törölheted, amíg használni akarod a kiegészítőt!

2. Töltsd le a Lepke.user.js és a manifest.json fájlokat [erről](https://github.com/petamas/Lepke/) az oldalról, és tedd bele a mappába.

3. A böngésző címsorába írd be: "chrome://extensions"

4. Jobb fölső sarokban pipáld be a _Developer mode_ (_Fejlesztői mód_) dobozt, majd kattints a megjelenő _Load unpacked extension..._ (_Kicsomagolt bővítmények betöltése…_) gombra.

5. Válaszd ki az 1-es pontban létrehozott mappát, majd kattints az OK gombra.

Új verzióra frissítés:

1. Töltsd le az új Lepke.user.js és manifest.json fájlokat, és írd velük felül a régieket.

2. A böngésző címsorába írd be: chrome://extensions

3. Kattints a Lepke kiegészítő alatt lévő _Reload_ (_Újratöltés_) linkre.

4. Ellenőrizd, hogy frissült-e a verziószám.

5. Frissítsd az éppen nyitva lévő molyos oldalakat.

Sajnos a Chrome minden indulás után emlékeztet rá, hogy a fejlesztői módban telepített szkriptek veszélyesek lehetnek, és le akarja tiltatni a futtatásukat. Bátran nyomjatok rá, hogy ne tegye.