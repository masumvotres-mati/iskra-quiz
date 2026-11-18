"use strict";

const glossaryExamples = {
  "Wyłączność": "Konkurent co do zasady potrzebuje zgody uprawnionego z polskiego patentu, by w Polsce zarobkowo produkować chronioną pompę.",
  "Przemysłowa stosowalność": "Nowy sposób nawadniania może być wykorzystywany w gospodarstwach rolnych, nie tylko w fabryce.",
  "Poziom wynalazczy": "Sama zamiana koloru obudowy zwykle nie wnosi nieoczywistego rozwiązania technicznego.",
  "Stan techniki": "Publiczny katalog z opisem takiej samej pompy, dostępny przed datą pierwszeństwa, może należeć do stanu techniki.",
  "Pierwszeństwo": "Pierwsze prawidłowe zgłoszenie z 2 marca może dać pierwszeństwo przed zgłoszeniem konkurenta z 10 marca.",
  "Zastrzeżenia patentowe": "W zastrzeżeniu opisano zawór z konkretnym układem części; tytuł „Nowy zawór” sam nie wyznacza ochrony.",
  "Zakres ochrony": "Ochrona konkretnego układu części zaworu nie musi obejmować każdego zaworu sprzedawanego na rynku.",
  "Prawo ochronne": "Firma otrzymuje prawo ochronne na znak swoich butów, nie patent na tę nazwę.",
  "Prawo z rejestracji": "Na nowy wygląd lampy, spełniający warunki ustawy, można uzyskać prawo z rejestracji wzoru przemysłowego.",
  "Wzór użytkowy": "Nowy kształt uchwytu narzędzia może być wzorem użytkowym, jeśli jest rozwiązaniem technicznym spełniającym ustawowe warunki.",
  "Wzór przemysłowy": "Ozdobny kształt obudowy lampy to przykład jej wyglądu; sposób działania instalacji elektrycznej to osobna sprawa.",
  "Znak towarowy": "Nazwa na pudełku butów pozwala klientowi rozpoznać, od jakiej firmy pochodzi produkt.",
  "Oznaczenie geograficzne": "Nazwą regionu opisuje się wyrób, którego szczególna jakość lub renoma wiąże się z tym miejscem.",
  "Topografia układu scalonego": "Projekt pokazuje rozmieszczenie elementów i połączeń w warstwach układu, nie jego nazwę handlową.",
  "Układ scalony": "Kalkulator zawiera mały układ elektroniczny z wieloma połączonymi elementami, który wykonuje obliczenia.",
  "Licencja przymusowa": "Urząd Patentowy może w ustawowej sytuacji pozwolić fabryce produkować chronioną pompę bez zgody uprawnionego. Fabryka płaci mu opłatę licencyjną.",
  "Licencja otwarta": "Uprawniony z patentu na zawór zgłasza gotowość udzielania licencji każdemu zainteresowanemu na zasadach licencji otwartej.",
  "Licencja pełna": "Umowa pozwala licencjobiorcy korzystać z opatentowanej maszyny w takim zakresie jak uprawniony, bez dodatkowych ograniczeń umownych.",
  "Licencja niewyłączna": "Właściciel patentu udziela licencji fabryce A, ale może też udzielić jej fabryce B.",
  "Licencja": "Firma płaci za zgodę na produkowanie chronionej pompy, lecz sam patent nadal należy do dotychczasowego uprawnionego.",
  "Sublicencja": "Fabryka A ma licencję i za zgodą uprawnionego udziela fabryce B dalszej zgody na korzystanie z wynalazku.",
  "Licencjobiorca": "Fabryka produkująca pompę na podstawie licencji jest licencjobiorcą, nawet jeśli nie posiada patentu.",
  "Licencjodawca": "Właściciel patentu udzielający innej firmie licencji na produkowanie chronionej pompy występuje jako licencjodawca.",
  "Patent": "Firma uzyskuje polski patent na nowy mechanizm pompy; nie daje jej to automatycznie ochrony w Niemczech.",
  "Uprawniony": "Pracownik stworzył wynalazek w ramach obowiązków służbowych, lecz prawo do patentu może przysługiwać pracodawcy.",
  "Znawca": "Przy ocenie pompy punktem odniesienia będzie fachowiec od odpowiednich urządzeń, a nie przypadkowy klient sklepu.",
  "Pod rygorem nieważności": "Strony tylko ustnie uzgodniły sprzedaż patentu. Taka umowa nie spełnia wymaganej formy pisemnej pod rygorem nieważności.",
  "Zbywalne": "Uprawniony może sprzedać patent innej firmie, zachowując wymaganą formę umowy.",
  "Dziedziczenie": "Po śmierci właściciela prawo do patentu może przypaść jego spadkobiercom.",
  "Unieważnienie": "Po udzieleniu patentu wykazano, że rozwiązanie nie było nowe; może to być podstawą jego unieważnienia.",
  "Wygaśnięcie": "Właściciel nie opłacił kolejnego okresu ochrony i upłynęły właściwe terminy; patent może wygasnąć.",
  "Jednolitość wynalazku": "Nowy zawór i specjalna metoda jego wytwarzania mogą należeć do jednego zgłoszenia, jeśli łączy je jeden ogólny pomysł wynalazczy.",
  "Indywidualny charakter": "Wygląd nowej lampy daje zorientowanemu użytkownikowi inne ogólne wrażenie niż wcześniejsze wzory; sama drobna zmiana może nie wystarczyć.",
  "Zorientowany użytkownik": "Osoba dobrze znająca dostępne modele krzeseł ocenia wygląd nowego krzesła; nie musi sama projektować mebli.",
  "Zła wiara": "Ktoś świadomie próbuje zarejestrować cudze oznaczenie, aby zablokować konkurenta; okoliczności mogą wskazywać na złą wiarę.",
  "Dobra wiara": "Mały sprzedawca używa oznaczenia, mając w danych okolicznościach usprawiedliwione przekonanie, że nie narusza cudzych praw.",
  "Opłata okresowa": "Po opłacie za pierwszy okres ochrony patent wymaga kolejnych opłat, aby utrzymać go w mocy.",
  "Projekt wynalazczy": "Techniczna budowa uchwytu może być wzorem użytkowym, a jego wygląd wzorem przemysłowym; oba należą do projektów wynalazczych.",
  "Irygacja": "Rolnicy doprowadzają wodę kanałami do pól, na których opady nie wystarczają do upraw.",
  "Pięściak": "Kawałek kamienia obrobiono z dwóch stron, tworząc ostrą krawędź przydatną do cięcia i rozłupywania.",
  "Brąz": "Odlewnik łączy miedź z cyną i otrzymuje brąz, z którego można wykonać narzędzie.",
  "Stop": "Mosiądz jest stopem miedzi i cynku; nie jest tym samym stopem co brąz cynowy.",
  "Metoda traconego wosku": "Jubiler robi woskowy model pierścionka, usuwa wosk z formy i wlewa w jego miejsce ciekły metal.",
  "Akwedukt": "Kanał prowadzi wodę z wyżej położonego źródła do miasta; tylko część trasy może biec po arkadach.",
  "Pucolana": "Dodatek popiołu wulkanicznego do spoiwa wapiennego pomaga otrzymać materiał budowlany odporniejszy na działanie wody.",
  "Chomąto": "Koń ciągnący wóz naciska barkami na chomąto, a uprząż przenosi jego siłę na pojazd.",
  "Koźlak": "Młynarz obraca korpus wiatraka, aby skrzydła ustawiły się do wiatru; nie obraca tylko samego dachu.",
  "Soczewka skupiająca": "Lupa skupia światło; przez odpowiednio ustawioną lupę można też zobaczyć powiększony obraz małego druku.",
  "Śluza": "Statek wpływa do komory, wrota się zamykają, a dopuszczenie wody podnosi go do poziomu wyższego odcinka kanału.",
  "Barometr": "Na tarczy barometru odczytujesz 1013 hPa, a nie liczbę stopni temperatury.",
  "Ciśnienie atmosferyczne": "Przyssawka trzyma się szyby dzięki różnicy ciśnień po jej obu stronach.",
  "Pompa próżniowa": "Pompa odsysa powietrze spod szklanego klosza, dzięki czemu ciśnienie wewnątrz maleje.",
  "Krosno": "Na krośnie nitka wątku przechodzi między nićmi osnowy i powstaje tkanina.",
  "Przędzalnictwo": "Z luźnych włókien bawełny powstaje długa przędza, z której dopiero później można utkać materiał.",
  "Żeliwo": "Ciężki korpus maszyny można odlać z żeliwa; nie jest to stalowe zbrojenie betonu.",
  "Konwertor Bessemera": "Przez ciekłą surówkę przedmuchuje się powietrze, co pomaga usunąć nadmiar węgla i otrzymać stal.",
  "Surówka": "Z wielkiego pieca otrzymuje się surówkę, którą można dalej przerabiać na stal.",
  "Żelbet": "W betonowej belce umieszcza się stalowe pręty, które przejmują siły rozciągające przy zginaniu.",
  "Indukcja elektromagnetyczna": "Przesuwanie magnesu do wnętrza zwojnicy zmienia pole obejmujące jej zwoje i może wytworzyć napięcie.",
  "Prądnica": "Mała prądnica napędzana kołem roweru dostarcza energię elektryczną do lampki.",
  "Telegraf": "Operator przesyła serię krótkich i długich sygnałów, z których odbiorca odczytuje wiadomość alfabetem Morse’a.",
  "Kinematograf": "To samo historyczne urządzenie mogło rejestrować kolejne klatki filmu, a potem wyświetlać je na ekranie.",
  "Kondensator": "W lampie błyskowej kondensator gromadzi energię, którą następnie szybko oddaje podczas błysku.",
  "Opona pneumatyczna": "Powietrze w oponie roweru pomaga łagodzić uderzenia podczas przejazdu przez nierówności.",
  "Batyskaf": "Batyskaf „Trieste” badał wielkie głębokości oceanu z ludźmi na pokładzie.",
  "Wyczerpanie prawa": "Uprawniony sprzedaje oznaczone buty w EOG. Ich zwykła odsprzedaż co do zasady nie wymaga jego ponownej zgody.",
  "EOG": "Norwegia należy do EOG, choć nie należy do Unii Europejskiej; Szwajcaria do EOG nie należy.",
  "Przedawnienie": "Właściciel patentu zbyt długo zwleka z pozwem, a pozwany broni się zarzutem przedawnienia. Nie oznacza to automatycznie wygaśnięcia patentu.",
  "Roszczenie": "Właściciel patentu żąda, żeby firma przestała bezprawnie produkować chronione urządzenie; żądanie zaniechania jest roszczeniem.",
  "Rzecznik patentowy": "Przygotowując zgłoszenie nowego zaworu, wynalazca korzysta z pomocy rzecznika przy opracowaniu dokumentacji i zastrzeżeń.",
  "Materiał biologiczny": "Żywa komórka drożdży zawiera informację genetyczną i może się namnażać w odpowiednich warunkach.",
  "Sekwencja genu": "Fragment DNA można zapisać jako ciąg A, C, G i T; zmiana kolejności tych liter oznacza inną sekwencję.",
  "Keson": "Robotnicy mogą pracować przy fundamencie mostu pod wodą, bo sprężone powietrze utrzymuje suchą przestrzeń w kesonie.",
  "Manufaktura": "W jednym zakładzie kilku rękodzielników ręcznie wykonuje różne etapy produkcji, np. przygotowanie części i ich składanie.",
  "Koks": "W wielkim piecu koks dostarcza ciepła i uczestniczy w procesie otrzymywania żelaza z rudy.",
  "Dziewiarka": "Maszyna tworzy kolejne oczka przędzy przy robieniu pończochy, zamiast przeplatać osnowę i wątek jak krosno.",
  "Sterowiec": "Wydłużony statek powietrzny unosi się dzięki gazowi lżejszemu od powietrza, a silniki pozwalają nim kierować.",
  "Cyklotron": "Proton krąży w polu magnetycznym i przy kolejnych przejściach przez szczelinę zyskuje energię od pola elektrycznego.",
  "Spawanie": "Dwa stalowe elementy mostu łączy spoina powstała po miejscowym stopieniu materiału, zamiast szeregu nitów.",
};

const glossary = [
  ["Wyłączność", ["wyłączność", "wyłączności", "wyłącznością", "wyłącznego", "wyłącznej", "wyłączny", "wyłączne", "wyłącznym"], "Prawo zastrzega określone korzystanie z rozwiązania dla osoby, która ma ochronę. Inni zwykle potrzebują jej zgody, ale ustawa przewiduje wyjątki."],
  ["Przemysłowa stosowalność", ["przemysłowa stosowalność", "przemysłowej stosowalności", "przemysłową stosowalność", "przemysłowego stosowania", "przemysłowego zastosowania", "przemysłowo stosowalnym"], "Rozwiązanie da się wykorzystać w praktyce: wytworzyć opisany produkt albo zastosować opisany sposób w działalności przemysłowej, także w rolnictwie."],
  ["Poziom wynalazczy", ["poziom wynalazczy", "poziomu wynalazczego", "poziomem wynalazczym"], "Rozwiązanie nie może być oczywistym kolejnym krokiem dla fachowca znającego dotychczasowe rozwiązania. Sama nowość jeszcze nie wystarcza."],
  ["Stan techniki", ["stan techniki", "stanu techniki", "stanem techniki"], "Wiedza o rozwiązaniach udostępniona publicznie przed datą, według której bada się pierwszeństwo. Może pochodzić np. z publikacji, pokazu lub używania produktu; ustawa uwzględnia też szczególne przypadki wcześniejszych zgłoszeń."],
  ["Pierwszeństwo", ["pierwszeństwo", "pierwszeństwa", "pierwszeństwem", "pierwszeństwie"], "Ustala, kto ma wcześniejszą datę istotną dla uzyskania ochrony. Zwykle liczy się zgłoszenie w urzędzie, ale przy spełnieniu warunków można powołać się np. na wcześniejsze zgłoszenie zagraniczne."],
  ["Zastrzeżenia patentowe", ["zastrzeżenia patentowe", "zastrzeżeń patentowych", "zastrzeżeniami patentowymi", "zastrzeżenie patentowe", "zastrzeżeniach patentowych"], "Część dokumentacji opisująca cechy rozwiązania, które mają być chronione. Wyznacza granice patentu — czyli to, co dokładnie obejmuje ochrona."],
  ["Zakres ochrony", ["zakres ochrony", "zakres ochrony patentowej", "zakres przedmiotowy", "przedmiotowy zakres patentu"], "Granice prawa: co dokładnie jest chronione, a co pozostaje poza ochroną. W przypadku patentu ustala się je na podstawie zastrzeżeń patentowych."],
  ["Prawo ochronne", ["prawo ochronne", "prawa ochronnego", "prawem ochronnym", "prawa ochronne", "praw ochronnych"], "Rodzaj prawa przewidziany m.in. dla wzoru użytkowego i znaku towarowego. Pozwala korzystać z chronionego przedmiotu na wyłączność w granicach ustawy."],
  ["Prawo z rejestracji", ["prawo z rejestracji", "prawa z rejestracji", "prawem z rejestracji", "praw z rejestracji"], "Rodzaj ochrony uzyskiwanej przez rejestrację, np. wzoru przemysłowego lub topografii układu scalonego. To inny rodzaj prawa niż patent."],
  ["Wzór użytkowy", ["wzór użytkowy", "wzoru użytkowego", "wzorem użytkowym", "wzory użytkowe", "wzorów użytkowych"], "Techniczne rozwiązanie dotyczące kształtu lub budowy przedmiotu, który ma trwałą postać, także gdy składa się z połączonych funkcjonalnie części. Dotyczy budowy, nie tylko ozdobnego wyglądu."],
  ["Wzór przemysłowy", ["wzór przemysłowy", "wzoru przemysłowego", "wzorem przemysłowym", "wzory przemysłowe", "wzorów przemysłowych"], "Wygląd produktu lub jego części — np. kształt, kolory, faktura albo ozdoby. Dla ochrony musi być nowy i mieć indywidualny charakter."],
  ["Znak towarowy", ["znak towarowy", "znaku towarowego", "znakiem towarowym", "znaki towarowe", "znaków towarowych"], "Oznaczenie pozwalające odróżniać towary lub usługi jednej firmy od innych. Może to być np. nazwa, logo, a przy spełnieniu warunków również dźwięk."],
  ["Oznaczenie geograficzne", ["oznaczenie geograficzne", "oznaczenia geograficznego", "oznaczeniem geograficznym", "oznaczenia geograficzne", "oznaczeń geograficznych"], "Oznaczenie wiążące towar z określonym miejscem, gdy jego jakość, dobra opinia lub inne cechy wynikają przede wszystkim z tego pochodzenia."],
  ["Topografia układu scalonego", ["topografia układu scalonego", "topografii układu scalonego", "topografię układu scalonego", "topografię", "topografia", "topografii", "topografią"], "Sposób przestrzennego rozmieszczenia elementów i połączeń w układzie scalonym. Tutaj nie chodzi o mapę terenu, tylko o budowę układu elektronicznego."],
  ["Układ scalony", ["układ scalony", "układu scalonego", "układzie scalonym", "układy scalone"], "Mały element elektroniczny, w którym wiele współpracujących elementów i ich połączeń tworzy jedną całość, np. w procesorze."],
  ["Licencja przymusowa", ["licencja przymusowa", "licencji przymusowej", "licencję przymusową", "licencją przymusową"], "Zezwolenie urzędu na korzystanie z cudzego opatentowanego wynalazku w szczególnych sytuacjach określonych ustawą. Nie oznacza automatycznie korzystania za darmo."],
  ["Licencja otwarta", ["licencja otwarta", "licencji otwartej", "licencję otwartą"], "Właściciel patentu składa w urzędzie oświadczenie, że jest gotów udzielać licencji. Taka licencja jest pełna i niewyłączna; ustawa określa też zasady opłat."],
  ["Licencja pełna", ["licencja pełna", "licencji pełnej", "licencję pełną", "licencją pełną"], "Licencja bez umownego ograniczenia zakresu korzystania z wynalazku: wolno korzystać z niego w takim zakresie jak udzielający licencji. Pełna nie znaczy automatycznie wyłączna."],
  ["Licencja niewyłączna", ["licencja niewyłączna", "licencji niewyłącznej", "licencję niewyłączną", "licencją niewyłączną", "niewyłączna", "niewyłączny", "niewyłącznym"], "Zgoda dla jednej osoby nie zamyka drogi innym. Właściciel patentu może nadal korzystać z wynalazku i udzielać kolejnych licencji."],
  ["Licencja", ["licencja", "licencji", "licencję", "licencją", "licencje", "licencyjna", "licencyjnej"], "Zgoda na korzystanie z cudzego chronionego rozwiązania na ustalonych warunkach. Nie jest tym samym co zakup lub przejęcie patentu."],
  ["Sublicencja", ["sublicencja", "sublicencji", "sublicencję"], "Dalsza licencja udzielona przez kogoś, kto sam korzysta już z licencji. Przy patencie wymaga zgody uprawnionego; dalsza sublicencja jest niedozwolona."],
  ["Licencjobiorca", ["licencjobiorca", "licencjobiorcy", "licencjobiorcę"], "Osoba lub firma, która otrzymała zgodę na korzystanie z chronionego rozwiązania. Nie musi być właścicielem patentu."],
  ["Licencjodawca", ["licencjodawca", "licencjodawcy", "licencjodawcę"], "Osoba lub firma udzielająca zgody na korzystanie z chronionego rozwiązania."],
  ["Patent", ["patent", "patentu", "patentem", "patencie", "patenty", "patentów"], "Prawo do wyłącznego korzystania z wynalazku zarobkowo lub zawodowo na danym terytorium, w granicach ustawy. Nie oznacza automatycznej ochrony na całym świecie."],
  ["Uprawniony", ["uprawniony", "uprawnionego", "uprawnionemu", "uprawnionym"], "Osoba lub firma, której przysługuje dane prawo, np. patent. Nie zawsze jest to twórca — prawo może należeć np. do pracodawcy albo nabywcy."],
  ["Znawca", ["znawca", "znawcy", "znawcę"], "Fachowiec z danej dziedziny techniki, znający jej typowe rozwiązania. W przepisach jest punktem odniesienia przy ocenie wynalazku."],
  ["Pod rygorem nieważności", ["pod rygorem nieważności"], "Jeśli nie zachowasz wskazanej formy, np. pisemnej, umowa nie będzie ważna."],
  ["Zbywalne", ["zbywalne", "zbywalny", "zbywalna"], "Takie prawo można przenieść na inną osobę lub firmę, np. sprzedać albo podarować."],
  ["Dziedziczenie", ["dziedziczeniu", "dziedziczenie", "dziedziczenia"], "Przejście praw po zmarłej osobie na jej spadkobierców."],
  ["Unieważnienie", ["unieważniony", "unieważniona", "unieważnienie", "unieważnienia", "unieważnieniu"], "Stwierdzenie, że prawa nie powinno było się udzielić, np. dlatego, że wynalazek nie spełniał wymaganych warunków. To nie to samo co wygaśnięcie ochrony z upływem czasu."],
  ["Wygaśnięcie", ["wygaśnięcie", "wygaśnięcia", "wygaśnięciu", "wygasa"], "Zakończenie ochrony, np. po upływie jej okresu albo z powodu nieuiszczenia wymaganej opłaty."],
  ["Jednolitość wynalazku", ["jednolitość wynalazku", "jednolitości wynalazku", "jednolitości"], "Wynalazki w jednym zgłoszeniu muszą łączyć się w jeden pomysł wynalazczy. Sam wspólny autor nie wystarcza."],
  ["Indywidualny charakter", ["indywidualny charakter", "indywidualnego charakteru", "indywidualnym charakterem"], "Wzór ma wywoływać u zorientowanego użytkownika inne ogólne wrażenie niż wcześniejsze wzory. Chodzi o całościowy wygląd, nie tylko drobny szczegół."],
  ["Zorientowany użytkownik", ["zorientowany użytkownik", "zorientowanego użytkownika", "zorientowanym użytkowniku"], "Osoba znająca produkty danego rodzaju i zwracająca uwagę na ich wygląd. Nie musi być projektantem ani technicznym ekspertem."],
  ["Zła wiara", ["zła wiara", "złej wierze", "złej wiary"], "Nieuczciwe działanie przy zgłoszeniu znaku, np. świadoma próba przejęcia cudzego oznaczenia. Ocenia się okoliczności konkretnej sprawy."],
  ["Dobra wiara", ["dobra wiara", "dobrej wierze", "dobrej wiary"], "Usprawiedliwione przekonanie, że działa się zgodnie z prawem i nie narusza cudzych praw."],
  ["Opłata okresowa", ["opłata okresowa", "opłaty okresowej", "opłaty okresowe", "opłat okresowych", "opłatami okresowymi"], "Opłata za kolejny okres utrzymywania ochrony. Sama opłata za zgłoszenie nie zapewnia ochrony na cały jej możliwy czas."],
  ["Projekt wynalazczy", ["projekt wynalazczy", "projektu wynalazczego", "projekty wynalazcze", "projektów wynalazczych"], "Zbiorcza nazwa ustawowa obejmująca wynalazki, wzory użytkowe i przemysłowe, topografie układów scalonych oraz projekty racjonalizatorskie."],
  ["Irygacja", ["irygacja", "irygacyjne", "irygacyjnych", "irygacji"], "Sztuczne nawadnianie pól, np. doprowadzanie wody kanałami."],
  ["Pięściak", ["pięściak", "pięściaka", "pięściakiem", "pięściaków"], "Dawne narzędzie z obrobionego kamienia, które można było trzymać w dłoni i wykorzystywać m.in. do cięcia lub rozłupywania."],
  ["Brąz", ["brąz", "brązu", "brązem"], "W omawianym materiale: stop miedzi i cyny, używany m.in. do narzędzi, broni i odlewów."],
  ["Stop", ["stop", "stopu", "stopem"], "Materiał otrzymany z połączenia metalu z innym pierwiastkiem lub pierwiastkami. Przykład: brąz z miedzi i cyny."],
  ["Metoda traconego wosku", ["metodą traconego wosku", "metoda traconego wosku", "metody traconego wosku"], "Robi się woskowy model, otacza go formą, usuwa wosk, a puste miejsce wypełnia płynnym metalem."],
  ["Akwedukt", ["akwedukt", "akweduktu", "akwedukcie", "akweduktem", "akwedukty"], "Budowla doprowadzająca wodę, zwykle dzięki odpowiedniemu spadkowi terenu. Nie musi na całej długości wyglądać jak most."],
  ["Pucolana", ["pucolana", "pucolany", "pucolanów"], "Materiał pochodzenia wulkanicznego stosowany jako dodatek do spoiw budowlanych, znany m.in. z rzymskiego betonu."],
  ["Chomąto", ["chomąto", "chomąta", "chomątem"], "Część końskiej uprzęży oparta wokół szyi i barków. Pomaga przekazać siłę konia na ciągnięty ciężar bez uciskania tchawicy."],
  ["Koźlak", ["koźlak", "koźlaka", "koźlakiem"], "Typ wiatraka, którego cały korpus można obracać, aby ustawić skrzydła do wiatru."],
  ["Soczewka skupiająca", ["soczewki skupiające", "soczewkę skupiającą", "skupiające", "wypukłe"], "Soczewka skupiająca zbiera promienie światła. W typowej szklanej soczewce w powietrzu wypukły kształt daje taki efekt; pomaga ona m.in. przy dalekowzroczności."],
  ["Śluza", ["śluza", "śluzy", "śluzę", "śluz", "śluzie"], "Zamykana komora na drodze wodnej. Zmienia się w niej poziom wody, aby statek mógł przepłynąć wyżej albo niżej."],
  ["Barometr", ["barometr", "barometru", "barometrem"], "Przyrząd mierzący ciśnienie atmosferyczne, czyli nacisk powietrza."],
  ["Ciśnienie atmosferyczne", ["ciśnienie atmosferyczne", "ciśnienia atmosferycznego", "ciśnieniem atmosferycznym"], "Nacisk wywierany przez otaczające nas powietrze na powierzchnie przedmiotów."],
  ["Pompa próżniowa", ["pompa próżniowa", "pompy próżniowej", "pompę próżniową"], "Urządzenie usuwające gaz, np. powietrze, z zamkniętego naczynia, aby obniżyć w nim ciśnienie."],
  ["Krosno", ["krosno", "krosna", "krosnem"], "Urządzenie do tkania: przeplatania nici tak, aby powstała tkanina."],
  ["Przędzalnictwo", ["przędzalnictwo", "przędzalnictwem", "przędzalnictwa", "przędzalniczą", "przędzarek"], "Wytwarzanie przędzy, czyli długich nici z włókien. To inny etap niż tkanie z nich materiału."],
  ["Żeliwo", ["żeliwo", "żeliwa", "żeliwem"], "Stop żelaza z dużą zawartością węgla, dobrze nadający się do odlewania. Zwykle jest bardziej kruchy niż stal."],
  ["Konwertor Bessemera", ["konwertor Bessemera", "konwertora Bessemera", "konwertorze", "konwertor"], "Naczynie hutnicze, w którym przetwarzano ciekłą surówkę w stal, przedmuchując ją powietrzem."],
  ["Surówka", ["surówka", "surówki", "surówkę"], "W hutnictwie: produkt wytopu rudy żelaza, zawierający dużo węgla i domieszki. Przerabia się go m.in. na stal."],
  ["Żelbet", ["żelbet", "żelbetu", "żelbetem", "żelbecie", "żelazobeton"], "Beton wzmocniony stalowym zbrojeniem. Beton dobrze znosi ściskanie, a stal pomaga przenosić rozciąganie."],
  ["Indukcja elektromagnetyczna", ["indukcja elektromagnetyczna", "indukcją elektromagnetyczną", "indukcji elektromagnetycznej"], "Zmieniające się pole magnetyczne może wywołać napięcie elektryczne. Dzięki temu prądnica może zamieniać ruch w energię elektryczną."],
  ["Prądnica", ["prądnica", "prądnicy", "prądnicę"], "Urządzenie zamieniające energię mechaniczną, czyli ruch, w energię elektryczną."],
  ["Telegraf", ["telegraf", "telegrafu", "telegrafem"], "Urządzenie lub system przesyłający zakodowane wiadomości na odległość, np. sygnałami alfabetu Morse’a."],
  ["Kinematograf", ["kinematograf", "kinematografu", "kinematografem"], "Wczesny aparat do rejestrowania i wyświetlania ruchomych obrazów."],
  ["Kondensator", ["kondensator", "kondensatorów", "kondensatory", "kondensatorami"], "Element elektryczny, który gromadzi ładunek i energię w polu elektrycznym, a potem może je oddać do obwodu."],
  ["Opona pneumatyczna", ["opona pneumatyczna", "oponę pneumatyczną", "opony pneumatyczne"], "Opona wypełniona sprężonym gazem, zwykle powietrzem. Łagodzi wstrząsy podczas jazdy."],
  ["Batyskaf", ["batyskaf", "batyskafu", "batyskafem", "batyskafom"], "Pojazd podwodny do badania bardzo dużych głębokości."],
  ["Wyczerpanie prawa", ["wyczerpanie prawa", "wyczerpania prawa"], "Po legalnym wprowadzeniu konkretnego egzemplarza do obrotu na odpowiednim obszarze właściciel prawa co do zasady nie kontroluje już jego dalszej odsprzedaży. Nie daje to zgody na produkcję nowych kopii."],
  ["EOG", ["EOG", "Europejski Obszar Gospodarczy", "Europejskiego Obszaru Gospodarczego"], "Europejski Obszar Gospodarczy: państwa Unii Europejskiej oraz Norwegia, Islandia i Liechtenstein. W pytaniach ważne jest, gdzie towar został legalnie wprowadzony do obrotu."],
  ["Przedawnienie", ["przedawnienie", "przedawnienia", "przedawnieniu", "przedawnia"], "Upływ ustawowego terminu może pozwolić drugiej stronie uchylić się od zaspokojenia roszczenia. To nie jest to samo co wygaśnięcie patentu."],
  ["Roszczenie", ["roszczenie", "roszczenia", "roszczeń"], "Żądanie skierowane do konkretnej osoby, np. żeby przestała naruszać patent albo naprawiła szkodę."],
  ["Rzecznik patentowy", ["rzecznik patentowy", "rzecznika patentowego"], "Specjalista z uprawnieniami do pomocy w sprawach własności przemysłowej, np. przy zgłoszeniu wynalazku i ochronie patentu."],
  ["Materiał biologiczny", ["materiał biologiczny", "materiału biologicznego", "materiałem biologicznym"], "Materiał zawierający informację genetyczną, który potrafi się powielać sam albo można go powielać w systemie biologicznym."],
  ["Sekwencja genu", ["sekwencja genu", "sekwencji genu", "sekwencji lub częściowej sekwencji genu"], "Kolejność elementów zapisujących informację genetyczną w genie. Samo znalezienie takiej kolejności nie oznacza jeszcze stworzenia wynalazku."],
  ["Keson", ["keson", "kesonu", "kesonów", "kesony", "kesonowa", "kesonową", "kesonowej"], "Komora używana przy pracach pod wodą, np. przy fundamentach mostu. Sprężone powietrze może powstrzymywać napływ wody do jej wnętrza."],
  ["Manufaktura", ["manufaktura", "manufaktury", "manufaktur", "manufakturami", "manufakturę"], "Zakład skupiający ludzi wykonujących produkcję ręcznie. Różni się od późniejszej fabryki opartej na pracy maszyn."],
  ["Koks", ["koks", "koksu", "koksem"], "Paliwo otrzymywane przez ogrzewanie węgla kamiennego bez dostępu powietrza. Ma duże znaczenie w hutnictwie."],
  ["Dziewiarka", ["dziewiarka", "dziewiarkę", "dziewiarki"], "Maszyna robiąca dzianinę przez tworzenie i łączenie oczek z nici, podobnie do robienia na drutach."],
  ["Sterowiec", ["sterowiec", "sterowca", "sterowców", "sterowce", "sterowcami"], "Statek powietrzny unoszony przez gaz lżejszy od powietrza, wyposażony we własny napęd i sterowanie."],
  ["Cyklotron", ["cyklotron", "cyklotronem", "cyklotronu"], "Urządzenie przyspieszające cząstki naładowane elektrycznie. Wykorzystuje się je w badaniach fizycznych i zastosowaniach medycznych."],
  ["Spawanie", ["spawanie", "spawania", "spawaniem"], "Łączenie części, zwykle metalowych, przez miejscowe stopienie materiału i utworzenie spoiny."],
].map(([title, forms, definition]) => ({ title, forms, definition, example: glossaryExamples[title] }));

const glossaryHeadwords = new Map([
  ["Wyłączny", ["wyłącznego", "wyłącznej", "wyłączny", "wyłączne", "wyłącznym"]],
  ["Przemysłowe stosowanie", ["przemysłowego stosowania"]],
  ["Przemysłowe zastosowanie", ["przemysłowego zastosowania"]],
  ["Przemysłowo stosowalny", ["przemysłowo stosowalnym"]],
  ["Zastrzeżenie patentowe", ["zastrzeżenie patentowe"]],
  ["Zakres ochrony patentowej", ["zakres ochrony patentowej"]],
  ["Zakres przedmiotowy", ["zakres przedmiotowy"]],
  ["Przedmiotowy zakres patentu", ["przedmiotowy zakres patentu"]],
  ["Topografia", ["topografię", "topografia", "topografii", "topografią"]],
  ["Niewyłączny", ["niewyłączna", "niewyłączny", "niewyłącznym"]],
  ["Licencyjny", ["licencyjna", "licencyjnej"]],
  ["Zbywalny", ["zbywalne", "zbywalny", "zbywalna"]],
  ["Unieważniony", ["unieważniony", "unieważniona"]],
  ["Wygasać", ["wygasa"]],
  ["Jednolitość", ["jednolitości"]],
  ["Irygacyjny", ["irygacyjne", "irygacyjnych"]],
  ["Skupiający", ["skupiające"]],
  ["Wypukły", ["wypukłe"]],
  ["Przędzalniczy", ["przędzalniczą"]],
  ["Przędzarka", ["przędzarek"]],
  ["Konwertor", ["konwertorze", "konwertor"]],
  ["Żelazobeton", ["żelazobeton"]],
  ["Europejski Obszar Gospodarczy", ["Europejski Obszar Gospodarczy", "Europejskiego Obszaru Gospodarczego"]],
  ["Przedawniać", ["przedawnia"]],
  ["Sekwencja lub częściowa sekwencja genu", ["sekwencji lub częściowej sekwencji genu"]],
  ["Kesonowy", ["kesonowa", "kesonową", "kesonowej"]],
].flatMap(([title, forms]) => forms.map((form) => [form.toLocaleLowerCase("pl"), title])));

const glossaryForms = new Map(glossary.flatMap((entry) =>
  entry.forms.map((form) => [form.toLocaleLowerCase("pl"), entry])));
const glossaryPattern = new RegExp(
  `(?<![\\p{L}\\p{N}])(?:${[...glossaryForms.keys()]
    .sort((left, right) => right.length - left.length)
    .map((form) => form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})(?![\\p{L}\\p{N}])`,
  "giu",
);
const glossaryPopover = document.getElementById("glossary-popover");
let glossaryTrigger = null;

function closeGlossary(restoreFocus = false) {
  const trigger = glossaryTrigger;
  glossaryPopover.hidden = true;
  document.getElementById("glossary-definition").textContent = "";
  document.getElementById("glossary-example-text").textContent = "";
  if (trigger) trigger.setAttribute("aria-expanded", "false");
  glossaryTrigger = null;
  if (restoreFocus && trigger?.isConnected) trigger.focus({ preventScroll: true });
}

function positionGlossary() {
  if (glossaryPopover.hidden || !glossaryTrigger) return;
  const anchor = glossaryTrigger.getBoundingClientRect();
  const box = glossaryPopover.getBoundingClientRect();
  const left = Math.max(12, Math.min(anchor.left + anchor.width / 2 - box.width / 2, innerWidth - box.width - 12));
  const preferredTop = anchor.bottom + 10 + box.height <= innerHeight - 12
    ? anchor.bottom + 10 : anchor.top - box.height - 10;
  const top = Math.max(12, Math.min(preferredTop, innerHeight - box.height - 12));
  glossaryPopover.style.left = `${left}px`;
  glossaryPopover.style.top = `${top}px`;
}

function openGlossary(button, entry, revealDefinition = false) {
  if (glossaryTrigger === button) {
    closeGlossary(true);
    return;
  }
  closeGlossary();
  glossaryTrigger = button;
  glossaryPopover.dataset.stage = revealDefinition ? "definition" : "locked";
  const headword = glossaryHeadwords.get(button.textContent.toLocaleLowerCase("pl")) ?? entry.title;
  document.getElementById("glossary-title").textContent = revealDefinition ? entry.title : headword;
  document.getElementById("glossary-stage").textContent = revealDefinition
    ? "Pełna definicja" : "Pełna definicja po odpowiedzi";
  document.getElementById("glossary-locked").hidden = revealDefinition;
  document.getElementById("glossary-definition").hidden = !revealDefinition;
  document.getElementById("glossary-example").hidden = !revealDefinition;
  document.getElementById("glossary-definition").textContent = revealDefinition ? entry.definition : "";
  document.getElementById("glossary-example-text").textContent = revealDefinition ? entry.example : "";
  glossaryPopover.setAttribute("aria-describedby", revealDefinition
    ? "glossary-stage glossary-definition glossary-example" : "glossary-stage glossary-locked");
  button.setAttribute("aria-expanded", "true");
  glossaryPopover.hidden = false;
  glossaryPopover.scrollTop = 0;
  positionGlossary();
  glossaryPopover.focus({ preventScroll: true });
}

function annotateTerms(container, text, canRevealDefinition = () => false) {
  const fragment = document.createDocumentFragment();
  let position = 0;
  for (const match of text.matchAll(glossaryPattern)) {
    fragment.append(document.createTextNode(text.slice(position, match.index)));
    const button = document.createElement("button");
    const entry = glossaryForms.get(match[0].toLocaleLowerCase("pl"));
    button.type = "button";
    button.className = "glossary-term";
    button.textContent = match[0];
    button.setAttribute("aria-label", `Wyjaśnij pojęcie: ${match[0]}`);
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", "glossary-popover");
    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", () => openGlossary(button, entry, canRevealDefinition()));
    fragment.append(button);
    position = match.index + match[0].length;
  }
  fragment.append(document.createTextNode(text.slice(position)));
  container.replaceChildren(fragment);
}

document.getElementById("glossary-close").addEventListener("click", () => closeGlossary(true));
document.addEventListener("pointerdown", (event) => {
  if (!glossaryPopover.hidden && !glossaryPopover.contains(event.target) &&
      !glossaryTrigger?.contains(event.target)) closeGlossary();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !glossaryPopover.hidden) {
    event.preventDefault();
    closeGlossary(true);
  }
});
document.addEventListener("focusin", (event) => {
  if (!glossaryPopover.hidden && !glossaryPopover.contains(event.target) &&
      !glossaryTrigger?.contains(event.target)) closeGlossary();
});
document.addEventListener("scroll", (event) => {
  if (event.target === document) positionGlossary();
}, true);
window.addEventListener("resize", positionGlossary);
