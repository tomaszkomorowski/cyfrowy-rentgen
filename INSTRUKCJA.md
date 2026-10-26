# Cyberlaboratorium LIVE — wdrożenie

## Co otrzymujesz
10 dylematów, widok uczestnika, panel prowadzącego, kod sesji, automatyczne wykresy z anonimowych głosów. Projekt jest prototypem edukacyjnym dla jednej klasy, nie profesjonalnym systemem egzaminacyjnym. Każde konto anonimowe może oddać jeden głos na pytanie; usunięcie danych przeglądarki lub zmiana urządzenia umożliwi ponowne głosowanie. Nie jest to system odporny na celowe manipulacje uczestników.

## 1. Firebase
1. Wejdź na https://console.firebase.google.com i utwórz projekt Firebase (np. `cyberlab-liceum`). Możesz wyłączyć Analytics.
2. W **Build → Authentication → Sign-in method** włącz metodę **Anonymous**.
3. W **Build → Realtime Database → Create database** utwórz bazę. Wybierz tryb zablokowany (locked mode). Skopiuj dokładny adres bazy.
4. W zakładce **Realtime Database → Rules** wklej zawartość `database.rules.json` i kliknij **Publish**. Nigdy nie ustawiaj `.read:true` i `.write:true` globalnie.
5. W **Project settings → General → Your apps** dodaj aplikację Web (ikona `</>`). Skopiuj pola z obiektu `firebaseConfig` do `firebase-config.js`; uzupełnij również `databaseURL` dokładnym adresem utworzonej bazy.
6. Zalecane: **Authentication → Settings → Authorized domains** — upewnij się, że domena `tomaszkomorowski.github.io` jest autoryzowana, jeśli wymaga tego Twój projekt.

UWAGA: Config aplikacji WWW nie jest tajnym kluczem, ale **reguły bazy** są niezbędne do ochrony sesji. Weryfikuj je przed publikacją. Publiczny kod pokoju nie jest hasłem.

## 2. GitHub Pages
1. Wejdź na https://github.com/tomaszkomorowski/cyfrowy-rentgen
2. Do katalogu głównego repozytorium wgraj razem: `index.html`, `questions.js`, `firebase-config.js` (każdy jako osobny plik). Możesz użyć `Add file → Upload files`. Upewnij się, że NIE wgrywasz samego ZIP-a.
3. Kliknij **Commit changes**.
4. W Settings → Pages pozostaw Branch: `main`, Folder: `/(root)` i `Deploy from a branch`.
5. Po zakończeniu Actions otwórz https://tomaszkomorowski.github.io/cyfrowy-rentgen/index.html
6. Kod QR może kierować na dotychczasowy adres strony; uczniowie wpisują widoczny na projektorze sześcioliterowy kod pokoju.

## 3. Test przed lekcją
- Na laptopie kliknij **Utwórz nową sesję** i zanotuj kod.
- Na innym smartfonie / innej przeglądarce wejdź na stronę i wpisz kod.
- Otwórz głosowanie. Wybierz odpowiedź na telefonie. Sprawdź, czy wynik pojawia się na projektorze.
- Zamknij głosowanie i kliknij **Pokaż komentarz**.
- Przejdź do następnego pytania.
- Pozostaw otwartą kartę prowadzącego: uprawnienia przypisane są do anonimowego konta tej przeglądarki.

## 4. Sposób prowadzenia (18–20 min)
- 2 min — dołączenie uczniów, wyjaśnienie zasad.
- 14–15 min — wybierz 6–7 pytań (w pliku questions.js można zmienić ich kolejność). Daj 25–35 sekund na głosowanie, 60–90 sekund na dyskusję.
- 2–3 min — puenta: bezpieczeństwo to decyzje + procesy + narzędzia (MFA, aktualizacje, kopie zapasowe, weryfikacja źródła).

## 5. Ograniczenia i prywatność
- Firebase Authentication anonimowo tworzy identyfikatory techniczne użytkowników. Głosy zapisują się pod tym identyfikatorem w Realtime Database; brak nazwisk, adresów e-mail i numerów telefonu.
- Wyniki i identyfikatory techniczne mogą być widoczne dla innych zalogowanych anonimowo uczestników sesji znających jej kod (aktualny prototyp). Nie zapewnia kryptograficznej anonimowości.
- Firebase/hosting mogą przechowywać dane techniczne i logi. Zapoznaj się z warunkami dostawcy oraz szkolnymi zasadami ochrony danych.
- Nie zbieraj identyfikatorów uczniów ani informacji o wrażliwych przekonaniach. Po pokazie usuń sesje z Realtime Database (konsola → Data → rooms).
- Jeśli wymagasz silnej ochrony przed manipulacją, ukrycia wszystkich danych jednostkowych i ścisłej kontroli dostępu, potrzebna będzie wersja z serwerem / Cloud Functions i uprawnieniami administratora.
