const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {initializeApp}=require('firebase-admin/app');
const {getDatabase}=require('firebase-admin/database');
const crypto=require('crypto');
initializeApp();
const DB=()=>getDatabase();
const REGION='europe-west1';
const QUESTIONS=[
{t:'W szkolnej grupie pojawia się nagranie nauczyciela. Autor twierdzi, że jest autentyczne, nauczyciel — że to deepfake. Które działanie daje najlepszą podstawę do oceny?',o:['Sprawdzam liczbę udostępnień','Szukam pierwotnego źródła i niezależnego potwierdzenia','Analizuję tylko ruch ust','Wierzę osobie, którą bardziej lubię'],a:1,e:'Popularność ani pojedynczy artefakt wizualny nie potwierdza autentyczności. Kluczowe są pochodzenie materiału i niezależne dowody.'},
{t:'Kolega prosi o pilny przelew BLIK przez konto, z którego zwykle pisze. Co najskuteczniej ogranicza ryzyko przejętego konta?',o:['Proszę o zdjęcie profilowe','Potwierdzam przez znany wcześniej drugi kanał, np. telefon','Czekam pięć minut','Pytam o datę jego urodzin'],a:1,e:'Niezależny kanał komunikacji weryfikuje tożsamość lepiej niż kolejne wiadomości w tym samym przejętym koncie.'},
{t:'Łączysz się z Wi-Fi w kawiarni. Co jest najbardziej uzasadnioną obawą?',o:['Operator odczyta każdą zaszyfrowaną wiadomość','Każdy hotspot automatycznie instaluje wirusy','Właściciel sieci może zobaczyć część metadanych połączeń','HTTPS przestaje działać'],a:2,e:'Szyfrowanie HTTPS i E2EE chroni treść; sieć może ujawniać część informacji o połączeniach, zależnie od protokołów.'},
{t:'Wyszukiwanie identycznego zdjęcia pokazuje je w kilku serwisach. Co to przede wszystkim dowodzi?',o:['Zdjęcie jest prawdziwe','Zdjęcie ma więcej niż jedną publikację, niekoniecznie niezależną','Wszyscy autorzy są wiarygodni','AI nie miało udziału'],a:1,e:'Wiele kopii nie stanowi wielu niezależnych źródeł. Sprawdzaj daty i pierwotnego publikującego.'},
{t:'Twoje hasło wyciekło z małego sklepu. Dlaczego zagrożone może być konto pocztowe?',o:['Każdy sklep ma dostęp do poczty','Przy ponownym użyciu hasła ktoś może spróbować go na poczcie','Hasła automatycznie synchronizują się między stronami','Adres e-mail jest równy hasłu'],a:1,e:'Credential stuffing polega na próbach wykorzystania wyciekłych par login/hasło w innych usługach.'},
{t:'Aplikacja prosi o dostęp do lokalizacji „zawsze”, chociaż potrzebuje jej tylko przy wyznaczaniu trasy. Co wybierasz?',o:['Przyznaję zawsze, bo aplikacje są sprawdzane','Udzielam dostępu tylko podczas używania, jeśli funkcja tego wymaga','Wyłączam GPS na stałe','Podaję nieprawdziwy numer telefonu'],a:1,e:'Zasada minimalizacji uprawnień ogranicza zakres danych dostępnych aplikacji.'},
{t:'Ktoś publikuje zrzut ekranu z rzekomej rozmowy. Która cecha najsłabiej potwierdza autentyczność?',o:['Weryfikowalne niezależne źródła','Zgodność z innymi dowodami','Samo realistyczne wyglądanie interfejsu','Oryginalne metadane, jeśli można je sprawdzić'],a:2,e:'Interfejs czatu można łatwo odtworzyć i sfałszować. Wygląd zrzutu nie wystarcza.'},
{t:'Masz włączone MFA. Która sytuacja nadal może doprowadzić do przejęcia konta?',o:['Potwierdzisz fałszywą prośbę logowania lub przekażesz kod','Zmienisz tapetę','Wyłączysz Bluetooth','Usuniesz stare zdjęcia'],a:0,e:'MFA zwiększa bezpieczeństwo, lecz próby socjotechniczne mogą nakłonić użytkownika do zatwierdzenia nieautoryzowanego logowania.'},
{t:'W serwisie społecznościowym reklama trafia niezwykle precyzyjnie w Twoje zainteresowania. Co z tego wynika?',o:['Aplikacja na pewno podsłuchiwała mikrofon','Reklama może wynikać z danych behawioralnych i profilowania','Reklamodawca zna Twoje hasło','Telefon ma złośliwe oprogramowanie'],a:1,e:'Profilowanie i sygnały zachowań mogą wystarczyć do trafnego targetowania. Sama reklama nie dowodzi podsłuchu.'},
{t:'Dostałeś link do dokumentu „tylko dla klasy”, który wymaga ponownego logowania przez konto szkolne. Co najrozsądniejsze?',o:['Loguję się, bo logo szkoły jest prawidłowe','Sprawdzam rzeczywisty adres domeny i otwieram usługę z własnej zakładki','Przesyłam link całej klasie','Wyłączam antywirusa, jeśli strona nie działa'],a:1,e:'Fałszywe strony potrafią kopiować wygląd prawdziwych usług. Weryfikuj domenę i otwieraj serwis niezależnie od linku.'}
];
function fail(code,msg){throw new HttpsError(code,msg)}
function uid(req){if(!req.auth?.uid)fail('unauthenticated','Wymagane logowanie anonimowe Firebase.');return req.auth.uid}
function code(){return crypto.randomBytes(5).toString('hex').slice(0,6).toUpperCase()}
function nickClean(n){return typeof n==='string'?n.trim().replace(/\s+/g,' ').slice(0,24):''}
function validNick(n){return n.length>=2&&n.length<=24&&/^[\p{L}\p{N} _.-]+$/u.test(n)}
function results(s){const ps=Object.entries(s.players||{}).map(([id,p])=>({id,nick:p.nick,score:p.score||0,totalMs:p.totalMs||0,correct:p.correct||0,answered:p.answered||0}));ps.sort((a,b)=>b.score-a.score||a.totalMs-b.totalMs||a.nick.localeCompare(b.nick,'pl'));return ps.map((p,i)=>({...p,rank:i+1,id:undefined}))}
function publicQuestion(i){return {number:i+1,total:QUESTIONS.length,text:QUESTIONS[i].t,options:QUESTIONS[i].o}}
exports.quizAction=onCall({region:REGION,cors:['https://tomaszkomorowski.github.io','http://localhost:8000','http://127.0.0.1:8000'],maxInstances:10},async(req)=>{
 const me=uid(req), data=req.data||{},action=data.action;let c=String(data.code||'').trim().toUpperCase();
 if(action==='create'){
   for(let i=0;i<8;i++){const candidate=code();const ref=DB().ref(`quizSessions/${candidate}`);const initial={owner:me,createdAt:Date.now(),phase:'lobby',index:-1,players:{},answers:{},distribution:[0,0,0,0],question:null,openedAt:0,deadlineAt:0,closedAt:0};const tx=await ref.transaction(s=>s===null?initial:undefined,undefined,false);if(tx.committed)return {code:candidate};}
   fail('resource-exhausted','Nie udało się utworzyć kodu. Spróbuj ponownie.');
 }
 if(!/^[A-Z0-9]{6}$/.test(c))fail('invalid-argument','Podaj poprawny kod sesji.');
 const ref=DB().ref(`quizSessions/${c}`);
 if(action==='join'){
  const n=nickClean(data.nick);if(!validNick(n))fail('invalid-argument','Nick: 2–24 znaki, litery, cyfry, spacje, _, . lub -.');
  let reason='';const tx=await ref.transaction(s=>{
    if(!s){reason='notfound';return;}
    if(s.phase!=='lobby'&&!s.players?.[me]){reason='started';return;}
    if(s.players?.[me])return s;
    if(Object.values(s.players||{}).some(p=>p.nick.toLocaleLowerCase('pl')===n.toLocaleLowerCase('pl'))){reason='taken';return;}
    if(Object.keys(s.players||{}).length>=50){reason='full';return;}
    s.players=s.players||{};s.players[me]={nick:n,score:0,correct:0,answered:0,totalMs:0};return s;
  },undefined,false);
  if(!tx.committed)fail('failed-precondition',({notfound:'Sesja nie istnieje.',started:'Konkurs już się rozpoczął.',taken:'Ten nick jest zajęty.',full:'Limit 50 osób.'})[reason]||'Nie udało się dołączyć.');return {ok:true,nick:tx.snapshot.val().players[me].nick};
 }
 if(action==='answer'){
  const ans=Number(data.answer);if(!Number.isInteger(ans)||ans<0||ans>3)fail('invalid-argument','Błędna odpowiedź.');
  const idx=Number(data.index);if(!Number.isInteger(idx)||idx<0||idx>=QUESTIONS.length)fail('invalid-argument','Błędny numer pytania.');
  let reason='';let saved=null; const tx=await ref.transaction(s=>{
   if(!s){reason='notfound';return;}
   if(!s.players?.[me]){reason='notjoined';return;}
   if(s.phase!=='open'||s.index!==idx){reason='closed';return;}
   const now=Date.now();if(now>s.deadlineAt){reason='time';return;}
   s.answers=s.answers||{};s.answers[idx]=s.answers[idx]||{};
   if(s.answers[idx][me]){reason='duplicate';return;}
   const correct=ans===QUESTIONS[idx].a,elapsed=Math.max(0,now-s.openedAt);
   s.answers[idx][me]={choice:ans,correct,ms:elapsed};
   s.players[me].answered++;if(correct){s.players[me].correct++;s.players[me].score+=100;s.players[me].totalMs+=elapsed;}
   s.distribution[ans]=(s.distribution[ans]||0)+1;
   saved={correct,elapsed};return s;
  },undefined,false);
  if(!tx.committed)fail('failed-precondition',({notfound:'Sesja nie istnieje.',notjoined:'Najpierw dołącz.',closed:'To pytanie jest zamknięte.',time:'Czas minął.',duplicate:'Odpowiedź została już zapisana.'})[reason]||'Nie udało się zapisać.');
  return {ok:true,elapsedMs:tx.snapshot.val().answers[idx][me].ms};
 }
 if(['next','close','finish'].includes(action)){
  let reason='';const tx=await ref.transaction(s=>{
   if(!s){reason='notfound';return;}
   if(s.owner!==me){reason='owner';return;}
   if(action==='next'){
     if(!(s.phase==='lobby'||s.phase==='closed')){reason='phase';return;}
     if(s.index>=QUESTIONS.length-1){reason='ended';return;}
     s.index++;s.phase='open';s.question=publicQuestion(s.index);s.openedAt=Date.now();s.deadlineAt=s.openedAt+30000;s.distribution=[0,0,0,0];s.closedAt=0;
   }else if(action==='close'){
     if(s.phase!=='open'){reason='phase';return;}
     s.phase='closed';s.closedAt=Date.now();s.correctOption=QUESTIONS[s.index].a;s.explanation=QUESTIONS[s.index].e;
   }else{
     if(!(s.phase==='closed'&&s.index===QUESTIONS.length-1)){reason='phase';return;}
     s.phase='finished';s.finishedAt=Date.now();
   }
   return s;
  },undefined,false);
  if(!tx.committed)fail('failed-precondition',({owner:'Tylko prowadzący może sterować sesją.',phase:'Nieprawidłowa kolejność etapów.',ended:'To było ostatnie pytanie.',notfound:'Sesja nie istnieje.'})[reason]||'Błąd operacji.');return {ok:true};
 }
 fail('invalid-argument','Nieznana operacja.');
});
