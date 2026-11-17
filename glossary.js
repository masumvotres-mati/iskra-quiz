"use strict";

const glossaryHints = {
  "Wyłączność": "Rozróżnij osobę uprawnioną, obszar ochrony i granice korzystania. Pytanie może dotyczyć tylko jednej z tych kwestii.",
  "Przemysłowa stosowalność": "To jedno z ustawowych kryteriów oceny wynalazku. Rozważ, jaki przypadek opisano w pytaniu.",
  "Poziom wynalazczy": "To kryterium oceny rozwiązania, a nie wykształcenia lub sławy jego autora.",
  "Stan techniki": "To termin z ustawy, nie opis stopnia zużycia urządzenia. Zwróć uwagę na kontekst pytania.",
  "Pierwszeństwo": "Rozróżnij moment powstania pomysłu, zgłoszenia i publikacji. Nie muszą przypadać tego samego dnia.",
  "Zastrzeżenia patentowe": "To część dokumentacji wynalazku. Porównaj jej rolę z rolą tytułu, opisu i skrótu.",
  "Zakres ochrony": "Pytanie dotyczy granic pewnego uprawnienia. Oddziel to, co jest chronione, od sposobu opisania produktu.",
  "Prawo ochronne": "To nazwa konkretnego rodzaju prawa. Nie przenoś automatycznie reguł jednego rodzaju ochrony na inny.",
  "Prawo z rejestracji": "To ustawowa nazwa rodzaju ochrony. Sprawdź, jakiego przedmiotu dotyczy pytanie.",
  "Wzór użytkowy": "To jeden z przedmiotów ochrony przewidzianych w ustawie. Porównaj dokładnie wszystkie opisy produktu.",
  "Wzór przemysłowy": "To ustawowe określenie przedmiotu ochrony. Nie utożsamiaj różnych rodzajów wzorów tylko z powodu podobnej nazwy.",
  "Znak towarowy": "To pojęcie prawne związane z działalnością przedsiębiorstw. Jego dokładną rolę trzeba odróżnić od innych form ochrony.",
  "Oznaczenie geograficzne": "Sama nazwa miejsca nie rozstrzyga jeszcze o zastosowaniu przepisu. Zwróć uwagę na warunki opisane w pytaniu.",
  "Topografia układu scalonego": "To termin użyty w prawie własności przemysłowej. Nie opieraj odpowiedzi wyłącznie na potocznym znaczeniu słowa.",
  "Układ scalony": "To określenie z elektroniki. Rozróżnij sam przedmiot, jego części i cechy, o które pyta zadanie.",
  "Licencja przymusowa": "To szczególny rodzaj licencji. Nie zakładaj, że wszystkie licencje mają takie same zasady.",
  "Licencja otwarta": "To szczególny rodzaj licencji. Oddziel zasady składania oświadczenia od zasad korzystania z wynalazku.",
  "Licencja pełna": "To określenie rodzaju licencji. Sprawdź, jaką cechę umowy opisuje pytanie.",
  "Licencja niewyłączna": "To określenie rodzaju licencji. Porównaj prawa poszczególnych stron, nie tylko brzmienie nazwy.",
  "Licencja": "To pojęcie dotyczące relacji między stronami. Nie myl zasad umowy z samym czasem trwania ochrony.",
  "Sublicencja": "To termin związany z licencją. Zwróć uwagę, kto podejmuje czynność i czyjej zgody dotyczy pytanie.",
  "Licencjobiorca": "To nazwa jednej ze stron umowy. Pilnuj, której strony dotyczy opisane uprawnienie.",
  "Licencjodawca": "To nazwa jednej ze stron umowy. Nie zamieniaj ról stron przy czytaniu odpowiedzi.",
  "Patent": "To termin prawny. Rozróżnij rodzaj ochrony, jej czas, terytorium i dokument potwierdzający prawo.",
  "Uprawniony": "Zwróć uwagę, o jakie prawo chodzi w danym zdaniu. Autor, zgłaszający i strony umowy mogą pełnić różne role.",
  "Znawca": "To osoba przyjmowana jako punkt odniesienia w przepisie. Pomyśl, jaką wiedzę powinna mieć przy ocenie rozwiązania.",
  "Pod rygorem nieważności": "To określenie skutku prawnego. Odróżnij wymaganą formę czynności od terminu jej dokonania.",
  "Zbywalne": "To określenie cechy prawa. Porównaj czynności wymienione w odpowiedziach, zamiast kierować się samą nazwą.",
  "Dziedziczenie": "To pojęcie dotyczące losu praw. Nie utożsamiaj wszystkich sposobów zmiany osoby uprawnionej.",
  "Unieważnienie": "To jeden ze sposobów zakwestionowania ochrony. Zwróć uwagę, kiedy i z jakiej przyczyny pojawił się problem.",
  "Wygaśnięcie": "To pojęcie dotyczące zakończenia ochrony. Nie każdy przypadek zakończenia prawa ma tę samą podstawę.",
  "Jednolitość wynalazku": "To wymóg odnoszący się do zgłoszenia. Porównaj rodzaje powiązań wskazane w odpowiedziach.",
  "Indywidualny charakter": "To kryterium oceny wzoru. Zwróć uwagę na punkt widzenia i sposób porównania wskazane w pytaniu.",
  "Zorientowany użytkownik": "To osoba przyjmowana jako punkt odniesienia przy ocenie wzoru. Nie utożsamiaj automatycznie wszystkich grup odbiorców.",
  "Zła wiara": "To prawne określenie ocenianej postawy. Nie chodzi wyłącznie o to, kto jako pierwszy wypełnił formularz.",
  "Dobra wiara": "To prawne określenie ocenianej postawy. Samo przekonanie uczestnika sprawy trzeba rozpatrywać w jej okolicznościach.",
  "Opłata okresowa": "To rodzaj opłaty urzędowej. Oddziel ją od innych opłat i sprawdź, od jakiego zdarzenia liczy się termin.",
  "Projekt wynalazczy": "To zbiorcze określenie ustawowe. Nie musi oznaczać tego samego co wszystkie przedmioty własności przemysłowej.",
  "Irygacja": "To historyczne pojęcie związane z gospodarowaniem wodą. W pytaniu ważny jest sposób organizacji całego systemu.",
  "Pięściak": "To nazwa konkretnego dawnego narzędzia. Pytanie może dotyczyć jego budowy albo zastosowania.",
  "Brąz": "To nazwa materiału. Rozróżnij jego skład, właściwości i zastosowanie — to trzy różne kwestie.",
  "Stop": "To określenie materiałoznawcze. Nie myl składu materiału z jego kształtem lub metodą obróbki.",
  "Metoda traconego wosku": "To nazwa procesu wytwarzania. Spróbuj uporządkować etapy, zamiast kierować się tylko nazwą metody.",
  "Akwedukt": "To nazwa budowli. Zwróć uwagę na warunki jej działania, nie tylko wygląd zewnętrzny.",
  "Pucolana": "To historyczna nazwa materiału. Oddziel jego pochodzenie od gotowego wyrobu, w którym go stosowano.",
  "Chomąto": "To historyczna nazwa części końskiego wyposażenia. Porównaj jej możliwe funkcje, zamiast kierować się samym skojarzeniem z koniem.",
  "Koźlak": "To nazwa konstrukcji technicznej. Przy porównywaniu urządzeń zwróć uwagę, które części się poruszają.",
  "Soczewka skupiająca": "To określenie optyczne. Rozróżnij kształt elementu, jego działanie i zastosowanie.",
  "Śluza": "To nazwa urządzenia na drodze wodnej. Prześledź, co w danym rozwiązaniu zmienia położenie lub poziom.",
  "Barometr": "To nazwa przyrządu. Oddziel jego funkcję od funkcji innych urządzeń pomiarowych.",
  "Ciśnienie atmosferyczne": "To wielkość fizyczna. W doświadczeniu rozróżnij przyczynę zjawiska od obserwowanego skutku.",
  "Pompa próżniowa": "To nazwa urządzenia używanego w doświadczeniach. Zwróć uwagę na zmianę warunków wewnątrz badanego naczynia.",
  "Krosno": "To nazwa maszyny włókienniczej. Nie utożsamiaj różnych etapów wytwarzania materiału.",
  "Przędzalnictwo": "To pojęcie związane z produkcją włókienniczą. Oddziel surowiec, kolejne etapy pracy i gotowy wyrób.",
  "Żeliwo": "To nazwa materiału. Nie utożsamiaj wszystkich materiałów zawierających żelazo.",
  "Konwertor Bessemera": "To urządzenie przemysłowe. Rozróżnij surowiec, przebieg procesu i otrzymywany produkt.",
  "Surówka": "To słowo ma tutaj znaczenie hutnicze, nie kulinarne. Zwróć uwagę, o którym etapie produkcji mowa.",
  "Żelbet": "To nazwa materiału konstrukcyjnego. Rozważ rolę poszczególnych składników i rodzaje obciążeń.",
  "Indukcja elektromagnetyczna": "To nazwa zjawiska fizycznego. Oddziel odkrycie zjawiska od zbudowania urządzenia, które je wykorzystuje.",
  "Prądnica": "To nazwa urządzenia elektrycznego. Zwróć uwagę na kierunek przemiany energii.",
  "Telegraf": "To nazwa rozwiązania z dziedziny łączności. Rozróżnij sposób przesyłania informacji i jej postać.",
  "Kinematograf": "To historyczna nazwa urządzenia. Zwróć uwagę, czy pytanie dotyczy zapisu, odtwarzania czy przesyłania.",
  "Kondensator": "To element elektryczny. Nie utożsamiaj jego roli z działaniem całego urządzenia.",
  "Opona pneumatyczna": "To nazwa rozwiązania stosowanego w pojazdach. Odróżnij jego budowę od historii zastosowania.",
  "Batyskaf": "To nazwa specjalnego pojazdu. Pytanie może dotyczyć środowiska pracy, celu albo konstruktora.",
  "Wyczerpanie prawa": "To pojęcie prawne. Oddziel los konkretnego egzemplarza towaru od losu samego prawa.",
  "EOG": "To skrót nazwy obszaru. Zwróć uwagę, gdzie miało miejsce zdarzenie opisane w pytaniu.",
  "Przedawnienie": "To pojęcie związane z terminami. Sprawdź, od jakiego zdarzenia zaczyna się liczenie okresu.",
  "Roszczenie": "To termin prawny dotyczący relacji między stronami sporu. Nie utożsamiaj go z karą ani z okresem ochrony.",
  "Rzecznik patentowy": "To nazwa zawodu. Rozróżnij kompetencje zawodowe i sam fakt bycia autorem rozwiązania.",
  "Materiał biologiczny": "To ustawowe pojęcie z biotechnologii. Rozważ wszystkie cechy podane w danej odpowiedzi.",
  "Sekwencja genu": "To pojęcie biologiczne. W pytaniu odróżnij sam przedmiot badań od sposobu jego wykorzystania.",
  "Keson": "To określenie związane z konstrukcjami używanymi przy pracach inżynierskich. Prześledź rolę poszczególnych elementów opisu.",
  "Manufaktura": "To historyczny sposób organizacji produkcji. Porównaj organizację pracy z zastosowaną techniką.",
  "Koks": "To nazwa surowca przemysłowego. Nie utożsamiaj paliwa z materiałem otrzymywanym w procesie.",
  "Dziewiarka": "To nazwa maszyny włókienniczej. Rozróżnij urządzenia wykonujące różne czynności.",
  "Sterowiec": "To nazwa rodzaju statku powietrznego. Przy porównaniu konstrukcji nie kieruj się wyłącznie nazwiskiem.",
  "Cyklotron": "To nazwa przyrządu badawczego. Oddziel jego przeznaczenie od innych osiągnięć danej epoki.",
  "Spawanie": "To nazwa metody wykonywania połączeń. Nie utożsamiaj metody budowy z rodzajem materiału.",
};

const glossary = [
  ["Wyłączność", ["wyłączność", "wyłączności", "wyłącznością", "wyłącznego", "wyłącznej", "wyłączny", "wyłączne", "wyłącznym"], "Prawo zastrzega określone korzystanie z rozwiązania dla osoby, która ma ochronę. Inni zwykle potrzebują jej zgody, ale ustawa przewiduje wyjątki."],
  ["Przemysłowa stosowalność", ["przemysłowa stosowalność", "przemysłowej stosowalności", "przemysłową stosowalność", "przemysłowego stosowania", "przemysłowego zastosowania"], "Rozwiązanie da się wykorzystać w praktyce: wytworzyć opisany produkt albo zastosować opisany sposób w działalności przemysłowej, także w rolnictwie."],
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
].map(([title, forms, definition]) => ({ title, forms, definition, hint: glossaryHints[title] }));

const glossaryHeadwords = new Map([
  ["Wyłączny", ["wyłącznego", "wyłącznej", "wyłączny", "wyłączne", "wyłącznym"]],
  ["Przemysłowe stosowanie", ["przemysłowego stosowania"]],
  ["Przemysłowe zastosowanie", ["przemysłowego zastosowania"]],
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
  const headword = glossaryHeadwords.get(button.textContent.toLocaleLowerCase("pl")) ?? entry.title;
  document.getElementById("glossary-title").textContent = revealDefinition ? entry.title : headword;
  document.getElementById("glossary-stage").textContent = revealDefinition
    ? "Pełne wyjaśnienie" : "Wskazówka — pełna definicja po odpowiedzi";
  document.getElementById("glossary-definition").textContent = revealDefinition ? entry.definition : entry.hint;
  button.setAttribute("aria-expanded", "true");
  glossaryPopover.hidden = false;
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
