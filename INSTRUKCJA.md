# Cyberlaboratorium — konkurs 10 pytań: instalacja i aktualizacja

## Co otrzymujesz

- `index.html` — strona uczniów i prowadzącego (pod tym samym adresem QR co wcześniej).
- `firebase-config.js` — konfiguracja klienta; uzupełnij wartości z obecnego projektu Firebase.
- `functions/index.js` — **serwerowa** logika konkursu, 10 pytań i klucze odpowiedzi; punktacja i czas są wyznaczane na serwerze.
- `functions/package.json` — zależności funkcji.
- `database.rules.json` — reguły, w których tylko Firebase Admin zapisuje sesje, a zalogowani uczestnicy i właściciel mogą je czytać.
- `firebase.json` — konfiguracja wdrożenia funkcji i reguł.

## WAŻNE: koszt i zgodność

Wersja serwerowa wykorzystuje Cloud Functions (2nd gen), więc **wymaga Firebase Blaze i podpięcia rozliczeń**. Google oferuje limity bezpłatne, ale nie należy obiecywać kosztu zerowego. Ustaw alert budżetowy w Google Cloud. Jeśli nie chcesz Blaze, nie uruchomisz tego wariantu bez zmian w architekturze.

**Nowe reguły RTDB nadpisują reguły dotychczasowej aplikacji w tej bazie!** Jeśli obecna aplikacja LIVE ma działać dalej, załóż osobny projekt Firebase zamiast zamieniać reguły jej bazy. Zalecana metoda: zachowaj istniejącą domenę GitHub Pages, ale stwórz **nowy projekt Firebase** wyłącznie dla quizu i wklej jego konfigurację. Jeżeli stara aplikacja ma zostać całkowicie zastąpiona, możesz wykorzystać dotychczasowy projekt.

## 1. Firebase Console

1. Wejdź do https://console.firebase.google.com/ i wybierz projekt docelowy (lub utwórz nowy).
2. W **Authentication > Sign-in method** włącz **Anonymous**.
3. W **Build > Realtime Database** utwórz bazę w trybie **Locked mode** (region np. europe-west1, jeżeli dostępny). Zapamiętaj jej URL.
4. W **Project settings > Your apps** utwórz aplikację WWW (ikonka `</>`) lub otwórz dotychczasową; z zakładki **Config** skopiuj `apiKey`, `authDomain`, `projectId`, `appId`; `databaseURL` skopiuj z **Realtime Database > Data**.
5. W **Billing** przejdź na Blaze, jeżeli Cloud Functions nie są jeszcze dostępne. Ustaw alert budżetowy w Cloud Billing. Nie zlecaj bez zgody aktywacji rozliczeń.
6. Otwórz lokalny `firebase-config.js` i podmień wszystkie wartości `WPISZ_...`. Zostaw `window.FIREBASE_CONFIG = {...}`.

## 2. Instalacja Firebase CLI (Windows)

1. Zainstaluj aktualny Node.js LTS z https://nodejs.org/ (Node 22 jest wspieranym środowiskiem funkcji w pakiecie).
2. Rozpakuj ZIP do folderu, np. `C:\cyberlaboratorium-quiz`.
3. Otwórz PowerShell w folderze z `firebase.json`.
4. Wpisz kolejno:

```powershell
npm install -g firebase-tools
firebase login
firebase projects:list
firebase use --add
```

W ostatnim poleceniu wskaż **właściwy projekt Firebase** i nadaj alias `default`. Sprawdź, czy nie wdrażasz do innego projektu.

5. Zainstaluj zależności funkcji:

```powershell
cd functions
npm install
cd ..
```

6. Wdróż funkcję i reguły (upewnij się, że baza nie obsługuje innej aplikacji):

```powershell
firebase deploy --only functions,database
```

Proces tworzenia funkcji może potrwać kilka minut i może wymagać włączenia usług Google Cloud. Pomyślnie wdrożona funkcja nazywa się `quizAction`, region `europe-west1`.

Jeżeli `firebase use --add` zgłasza błąd, uruchom `firebase login` i upewnij się, że masz uprawnienia do projektu. W przypadku pomyłki projektu **nie uruchamiaj `deploy`**.

## 3. Aktualizacja GitHub Pages

Repozytorium: https://github.com/tomaszkomorowski/cyfrowy-rentgen

1. W repozytorium otwórz `index.html`, kliknij ołówek i zastąp całą zawartość nowym `index.html`, a następnie **Commit changes**.
2. Otwórz `firebase-config.js`, kliknij ołówek i zastąp jego zawartość nowym, uzupełnionym `firebase-config.js` (lub użyj **Add file > Upload files** jeśli pliku nie ma). **Commit changes**.
3. **Nie przesyłaj folderu `functions` na GitHub Pages jako zamiennika funkcji**; ten folder wdraża się komendą `firebase deploy` z komputera. Możesz przechowywać kod jako źródła w repozytorium, ale sam GitHub nie uruchamia tych funkcji.
4. W `Settings > Pages` sprawdź `Deploy from a branch`, `main`, `/(root)`.
5. W `Actions` poczekaj na zielony status publikacji. Otwórz:

   https://tomaszkomorowski.github.io/cyfrowy-rentgen/index.html

6. Wykonaj wymuszone odświeżenie (`Ctrl+F5`) lub uruchom stronę w oknie incognito.

**Dotychczasowy kod QR nadal działa**, bo nie zmienia się adres ucznia.

## 4. Uruchomienie konkursu

1. Na laptopie otwórz stronę i wybierz **Jestem prowadzącym > Utwórz sesję**.
2. Zapisz 6-znakowy kod wyświetlony na ekranie. Nie zamykaj panelu prowadzącego. Jeśli odświeżysz stronę, adres URL z `&host=1` pozwala wznowić panel na tym samym profilu przeglądarki z tym samym anonimowym kontem Firebase.
3. Wyświetl uczniom dotychczasowy QR, po jego zeskanowaniu wpisują kod sesji i własny nick (2–24 znaki). Nicki muszą być unikalne w sesji.
4. Po dołączeniu uczniów wybierz **Rozpocznij pytanie 1**.
5. Uczniowie otrzymują po 30 sekund na każde pytanie; **czas jest liczony w chmurze**, a odpowiedź po terminie jest odrzucana.
6. Kliknij **Zamknij i ujawnij odpowiedź**, omów wyniki i **Następne pytanie**. Kolejne pytanie nie otworzy się, dopóki nie zamkniesz aktualnego.
7. Po zamknięciu pytania 10 kliknij **Zakończ i pokaż zwycięzcę**.
8. Ranking: +100 pkt za poprawną odpowiedź; przy tej samej liczbie punktów wygrywa niższa suma czasów **tylko poprawnych odpowiedzi**. Jeśli punkty i czas są identyczne, kolejność nicków jest technicznym rozstrzygnięciem — można ogłosić remis.

## 5. Test przed wejściem do klasy

- Otwórz laptop i telefon w **różnych przeglądarkach**.
- Utwórz sesję, dołącz nickiem `Test1`, spróbuj dołączyć z innego telefonu tym samym nickiem (powinno zostać odrzucone).
- Uruchom pytanie, oddaj poprawną odpowiedź i obserwuj licznik głosów.
- Spróbuj oddać drugi głos (powinien być zablokowany).
- Uruchom następne pytanie i sprawdź ranking.
- Pozostaw pytanie bez odpowiedzi przez ponad 30 sekund — nowy głos powinien zostać odrzucony.
- Przeprowadź pytania 1–10 oraz wyświetl końcowego zwycięzcę.

## 6. Ochrona prywatności i ograniczenia

- Nicki i wynik są widoczne dla osób w sesji. **Nick nie potwierdza realnej tożsamości ucznia**. Aby mieć jednoznaczne przypisanie osoby, sporządź poza systemem listę nicków przypisanych do uczestników lub wydaj każdemu unikalny nick.
- Identyfikatory Firebase Auth oraz odpowiedzi są przechowywane w Realtime Database. Inni uprawnieni uczestnicy mają dostęp do całej sesji (w tym do identyfikatorów i odpowiedzi), ponieważ reguły dopuszczają odczyt sesji. Nie używaj nazwisk, e-maili ani innych wrażliwych danych jako nicków.
- Nie ma automatycznej obrony przed użyciem kilku urządzeń / kont anonimowych przez jedną osobę. Nicki są unikalne, ale nie weryfikowane z dokumentem.
- Osoba działająca z własnym zmodyfikowanym klientem może poznać treść bieżącego pytania, ale **nie otrzymuje klucza poprawnych odpowiedzi z serwera** i nie może sama dopisać sobie punktów przez RTDB.
- Po konkursie usuń sesje w Firebase Console > Realtime Database > Data > `quizSessions` (wybierz właściwą sesję); nie usuwaj danych innych aplikacji.
- Cloud Functions wymagają planu Blaze, a budżetowy alert NIE jest twardym limitem kosztów.

## 7. Gdy coś nie działa

- `Uzupełnij firebase-config.js` — wartości `WPISZ` pozostały w pliku.
- `auth/operation-not-allowed` — włącz Anonymous Authentication.
- `functions/not-found` — nie wdrożono `quizAction` lub wybrano inny projekt/region.
- `Permission denied` — sprawdź `database.rules.json`, prawidłowość projektu i UID.
- Brak aktualizacji rankingu — sprawdź Realtime Database URL oraz uprawnienia.
- `Billing account` — funkcje Cloud wymagają Blaze.
