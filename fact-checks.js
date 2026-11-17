"use strict";

const verificationSources = {
  wheel: {
    title: "Smithsonian Magazine — A Salute to the Wheel",
    url: "https://www.smithsonianmag.com/science-nature/a-salute-to-the-wheel-31805121/",
  },
  alphabet: {
    title: "Smithsonian Magazine — Who Invented the Alphabet?",
    url: "https://www.smithsonianmag.com/history/inventing-alphabet-180976520/",
  },
  cartwright: {
    title: "Science Museum Group — Edmund Cartwright",
    url: "https://collection.sciencemuseumgroup.org.uk/people/ap13666",
  },
  fulton: {
    title: "PBS — Who Made America? Robert Fulton",
    url: "https://www.pbs.org/wgbh/theymadeamerica/whomade/fulton_lo.html",
  },
  tyres: {
    title: "Niemiecki Urząd Patentowy DPMA — Dunlop i opona pneumatyczna",
    url: "https://www.dpma.de/english/our_office/publications/milestones/inventionsthatmadehistory/dunlop/index.html",
  },
  thomson: {
    title: "Science Museum Group — opona według patentu Thomsona z 1845",
    url: "https://collection.sciencemuseumgroup.org.uk/objects/co25892/replica-of-a-thomson-pneumatic-tyre-replicas",
  },
  bridge: {
    title: "Narodowy Instytut Dziedzictwa — most na Słudwi",
    url: "https://zabytek.pl/pl/obiekty/maurzyce-spawany-most-stalowy-na-rzece-sludwi",
  },
  leonardo: {
    title: "Victoria and Albert Museum — notatniki Leonarda",
    url: "https://www.vam.ac.uk/articles/leonardo-da-vincis-notebooks",
  },
  suez: {
    title: "Suez Canal Authority — historia kanału",
    url: "https://www.suezcanal.gov.eg/English/About/SuezCanal/Pages/CanalHistory.aspx",
  },
  electricity: {
    title: "Godalming Museum — publiczne dostawy energii elektrycznej",
    url: "https://www.godalmingmuseum.co.uk/articles/electricity",
  },
  cement: {
    title: "Mineral Products Association — 200 lat cementu portlandzkiego",
    url: "https://mineralproducts.org/MPA/media/root/Publications/2024/Portland_Cement_200_Years_of_Building_for_the_Future.pdf",
  },
  nylon: {
    title: "American Chemical Society — Carothers i nylon",
    url: "https://www.acs.org/education/whatischemistry/landmarks/carotherspolymers.html",
  },
  typewriter: {
    title: "Smithsonian Institution — Sholes & Glidden Type Writer",
    url: "https://www.si.edu/object/sholes-gildden-type-writer:nmah_850542",
  },
  alcock: {
    title: "Royal Air Force Museum — lot Alcocka i Browna",
    url: "https://collections.rafmuseum.org.uk/story/a-transatlantic-tale/",
  },
  nc4: {
    title: "National Naval Aviation Museum — NC-4",
    url: "https://www.history.navy.mil/content/history/museums/nnam/explore/collections/aircraft/n/nc-4.html",
  },
  bobrka: {
    title: "Muzeum Przemysłu Naftowego i Gazowniczego — kopalnia Bóbrka",
    url: "https://bobrka.pl/kopalnia-bobrka/",
  },
  sputnik: {
    title: "NASA — Sputnik i początek ery kosmicznej",
    url: "https://www.nasa.gov/history/65-years-ago-sputnik-ushers-in-the-space-age/",
  },
  gagarin: {
    title: "NASA — pierwszy lot człowieka w kosmos",
    url: "https://science.nasa.gov/resource/yuri-gagarin-first-human-in-space/",
  },
  laser: {
    title: "RP Photonics, dr Rüdiger Paschotta — rozbieżność wiązki",
    url: "https://www.rp-photonics.com/beam_divergence.html",
  },
  transistor: {
    title: "Computer History Museum — tranzystor ostrzowy, 1947",
    url: "https://www.computerhistory.org/siliconengine/invention-of-the-point-contact-transistor/",
  },
  nobel: {
    title: "NobelPrize.org — Nagroda Nobla z fizyki 1956",
    url: "https://www.nobelprize.org/prizes/physics/1956/summary/",
  },
  cyclotron: {
    title: "Lawrence Berkeley National Laboratory — Ernest Lawrence",
    url: "https://www.lbl.gov/ernest-orlando-lawrence/",
  },
  nuclear: {
    title: "Międzynarodowa Agencja Energii Atomowej — Obnińsk i EBR-I",
    url: "https://www.iaea.org/newscenter/news/obninsk-beyond-nuclear-power-conference-looks-future",
  },
  geography: {
    title: "UPRP — nowy unijny system oznaczeń geograficznych",
    url: "https://uprp.gov.pl/pl/aktualnosci/informacje/wejscie-w-zycie-nowego-systemu-ochrony-oznaczen-geograficznych-dla-produktow-rzemieslniczych-i-przemyslowych",
  },
};

const geographicalIndicationsUpdate = {
  material: "Pytanie odnosi się do krajowych przepisów przytoczonych w PDF-ie organizatora z 13.07.2023.",
  comparison: "Od 1.12.2025 stosowany jest też nowy system UE dla oznaczeń produktów rzemieślniczych i przemysłowych, z etapem krajowym i postępowaniem w EUIPO. UPRP opisuje go na podstawie rozporządzenia 2023/2411. Nie należy traktować odpowiedzi z dawnego materiału jako pełnego opisu aktualnej procedury.",
  sources: ["geography"],
};

const factCheckNotes = {
  "history-10": {
    material: "Orłowski umieszcza koło garncarskie kilkaset lat po kole jezdnym.",
    comparison: "Smithsonian Magazine przedstawia inne ujęcie: najwcześniejsze koła miały służyć garncarstwu przed zastosowaniem w transporcie. Początków różnych konstrukcji obrotowych nie warto sprowadzać do jednej bezspornej kolejności. Nasze pytanie sprawdza działanie urządzenia, nie to pierwszeństwo.",
    sources: ["wheel"],
  },
  "history-11": {
    material: "Podręcznik nazywa alfabet wynalazkiem Fenicjan.",
    comparison: "Smithsonian opisuje znacznie wcześniejsze inskrypcje alfabetyczne z Synaju, sprzed około 4000 lat. Fenicjanie odegrali ważną rolę w rozwoju i rozpowszechnianiu alfabetu, ale nie oznacza to stworzenia całego pisma alfabetycznego od zera.",
    sources: ["alphabet"],
  },
  "history-30": {
    material: "W cytacie z podręcznika krosno Cartwrighta datowane jest na 1787 rok.",
    comparison: "Science Museum Group podaje pierwszy patent na jego krosno w 1785 roku. Pierwszą konstrukcję, patent i późniejsze ulepszenia trzeba rozróżniać. Odpowiedź o rodzaju urządzenia pozostaje taka sama.",
    sources: ["cartwright"],
  },
  "history-35": {
    material: "Książka określa parostatek Fultona z 1807 roku jako pierwszy w pełni udany.",
    comparison: "PBS podkreśla, że Fulton nie wynalazł samego parostatku. Jego sukces wiązał się z niezawodną, opłacalną żeglugą komercyjną na Hudsonie. Nie należy utożsamiać tego z pierwszą konstrukcją napędzaną parą.",
    sources: ["fulton"],
  },
  "history-49": {
    material: "W książce opona pneumatyczna występuje jako wynalazek Dunlopa z 1888 roku.",
    comparison: "Science Museum Group dokumentuje wcześniejszy patent Roberta Williama Thomsona z 1845 roku. DPMA opisuje, jak Dunlop niezależnie rozwinął rozwiązanie dla trójkołowego roweru syna i przyczynił się do jego upowszechnienia. Pierwszeństwo patentowe i późniejszy sukces rynkowy to różne sprawy.",
    sources: ["thomson", "tyres"],
  },
  "history-57": {
    material: "Podręcznik podaje przy moście Bryły rok 1928 i opisuje jego pierwszeństwo w Europie.",
    comparison: "Narodowy Instytut Dziedzictwa opisuje most w Maurzycach jako pierwszy spawany most drogowy na świecie, budowany w latach 1928–1929 i oddany do użytku 12.08.1929. Warto rozróżniać rodzaj mostu, czas budowy i datę otwarcia.",
    sources: ["bridge"],
  },
  "history-68": {
    material: "Książka określa notatki Leonarda jako spisane szyfrem.",
    comparison: "V&A opisuje pismo lustrzane, czytane od prawej do lewej. Muzeum zaznacza, że nie wiadomo, czy chodziło o utajnianie notatek, czy np. o wygodę leworęcznego autora. Pismo lustrzane nie dowodzi samo w sobie stosowania tajnego szyfru.",
    sources: ["leonardo"],
  },
  "history-80": {
    material: "W pełnym tekście książki przy budowie Kanału Sueskiego pojawia się rok 1868.",
    comparison: "Suez Canal Authority podaje oficjalne otwarcie 17.11.1869. To tę datę należy wiązać z inauguracją kanału. Nie zmienia to odpowiedzi na pytanie o połączone morza.",
    sources: ["suez"],
  },
  "history-83": {
    material: "Podręcznik przypisuje nowojorskiej elektrowni Edisona z 1882 roku bezwzględne światowe pierwszeństwo elektrowni miejskiej.",
    comparison: "Godalming Museum dokumentuje publiczne dostawy prądu do ulic i domów już od 26.09.1881. Pierwszeństwo zależy więc od tego, jaki rodzaj instalacji i usługi porównujemy. Nowy Jork i rok 1882 pozostają poprawne dla opisanej instalacji Edisona.",
    sources: ["electricity"],
  },
  "history-85": {
    material: "Książka skrótowo mówi o wynalezieniu cementu przez Aspdina w 1824 roku.",
    comparison: "Opracowanie Mineral Products Association wskazuje patent na cement nazwany portlandzkim, udzielony 21.10.1824. Nie był to początek wszelkich spoiw cementowych; także technologię cementu portlandzkiego później rozwijano.",
    sources: ["cement"],
  },
  "history-89": {
    material: "Z tekstu podręcznika wynika rok 1937 jako data wynalezienia nylonu.",
    comparison: "American Chemical Society opisuje otrzymanie nylonu 6,6 w zespole Carothersa 28.02.1935. Historia nylonu obejmuje różne poliamidy i kolejne etapy komercjalizacji; daty doświadczeń nie są tym samym co daty uruchamiania fabryk.",
    sources: ["nylon"],
  },
  "history-93": {
    material: "Podręcznik wspomina produkcję maszyny Sholesa przez Remingtona od 1873 roku.",
    comparison: "Smithsonian podaje wprowadzenie maszyn Remingtona na rynek w 1874 roku. Rozpoczęcie produkcji i wejście do sprzedaży to różne etapy; nie traktuj tych dat jako dwóch dat wynalezienia maszyny.",
    sources: ["typewriter"],
  },
  "history-100": {
    material: "Książka opisuje Alcocka i Browna skrótowo jako pierwszych lotników nad Atlantykiem.",
    comparison: "Ich osiągnięcie z 14–15.06.1919 było przelotem bez lądowania. Wcześniej, w maju 1919, NC-4 ukończył przelot etapami, co opisuje muzeum lotnictwa US Navy. Lot etapowy, bez międzylądowania i samotny to różne rekordy.",
    sources: ["alcock", "nc4"],
  },
  "history-106": {
    material: "Podręcznik skupia opis założenia kopalni w Bóbrce w 1854 roku na Łukasiewiczu.",
    comparison: "Muzeum w Bóbrce wymienia trzech założycieli: Ignacego Łukasiewicza, Tytusa Trzecieskiego i Karola Klobassę-Zrenckiego. To uzupełnienie obrazu współpracy, nie zmiana odpowiedzi o miejscowości.",
    sources: ["bobrka"],
  },
  "history-114": {
    material: "Podręcznik nazywa Obnińsk z 1954 roku pierwszą elektrownią atomową.",
    comparison: "MAEA precyzuje, że chodzi o elektrownię dostarczającą prąd do sieci. Wcześniej, w 1951 roku, reaktor doświadczalny EBR-I w USA wytworzył już energię elektryczną. Pierwsze uzyskanie prądu i zasilanie publicznej sieci to różne osiągnięcia.",
    sources: ["nuclear"],
  },
  "history-116": {
    material: "Na tej samej stronie podręcznik podaje błędnie rok 1956 przy Sputniku 1, a rok 1961 przy Wostoku.",
    comparison: "NASA datuje start Sputnika 1 na 4.10.1957, a lot Gagarina w Wostoku 1 na 12.04.1961. Pierwszy sztuczny satelita i pierwszy lot człowieka to dwa odrębne wydarzenia.",
    sources: ["sputnik", "gagarin"],
  },
  "history-118": {
    material: "Książka opisuje światło lasera jako nieulegające rozproszeniu.",
    comparison: "Nie oznacza to idealnie równoległej wiązki o niezmiennej szerokości. Encyklopedia RP Photonics wyjaśnia mierzalną rozbieżność wiązek laserowych; jej wielkość zależy od wiązki i układu optycznego.",
    sources: ["laser"],
  },
  "history-119": {
    material: "Podręcznik umieszcza wynalezienie tranzystora w 1948 roku i wymienia Bardeena oraz Brattaina.",
    comparison: "Computer History Museum datuje działający tranzystor ostrzowy na grudzień 1947, a publiczne ogłoszenie na 30.06.1948. Bardeen i Brattain zbudowali tę wersję; Nagrodę Nobla za badania nad półprzewodnikami i efekt tranzystorowy otrzymali w 1956 razem z Williamem Shockleyem.",
    sources: ["transistor", "nobel"],
  },
  "history-120": {
    material: "Książka podaje rok 1932 przy cyklotronie Lawrence’a i Livingstona.",
    comparison: "Berkeley Lab opisuje wcześniejsze prototypy z 1930 i skuteczne przyspieszanie protonów w styczniu 1931. Rok 1932 wiąże m.in. ze zgłoszeniem patentowym. Nie należy łączyć pierwszego prototypu, kolejnych modeli i patentu w jedną datę.",
    sources: ["cyclotron"],
  },
  "law-54": geographicalIndicationsUpdate,
  "law-55": geographicalIndicationsUpdate,
  "law-88": geographicalIndicationsUpdate,
  "law-89": geographicalIndicationsUpdate,
  "law-90": geographicalIndicationsUpdate,
  "law-91": geographicalIndicationsUpdate,
};
