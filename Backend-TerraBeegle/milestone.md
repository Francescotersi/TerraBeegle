# Milestone: API-uri User mai robuste

Stare actuală: CRUD complet pentru User (register, login, get all, get by id, patch, delete).

## 🔴 URGENT — endpoint-urile RAWG (funcționalitățile obligatorii din subiect)

Subiectul (`docs/en.game_explorer.pdf`, cap. IV.1) cere ca obligatorii: home page cu jocuri, căutare după nume,
căutare avansată (gen, platformă, an, rating, sortare), listă de carduri și pagina de detaliu. Valorează **10 puncte**
(„Correctness and completeness of the mandatory features”), iar bonusurile (auth, prietenii etc.) contează doar
după ce acestea sunt complete. Acum backend-ul are doar `GET /api/games/{rawgGameId}`, iar `GET /api/games`
întoarce jocurile din baza de date (goală). Ordinea de lucru: 35 → 32 → 36 → 37 → 38 → 39.

- [x] **35. 🔴 `IRawgService` — tot codul pentru RAWG într-un singur loc**
  Acum apelul RAWG e în `GameController`; cu punctele 36–38 și cu favoritele (32) ar apărea în mai multe locuri.
  Subiectul punctează explicit „modularity, code reuse and separation of concerns” (cod 10 puncte).
  - [x] `IRawgService` + `RawgService`, înregistrat în `Program.cs` (ca `ITokenService`)
  - [x] `HttpClient`-ul `"RawgAPI"`, cheia (`EnvironmentVariables:RAWG_API_KEY`) și `RawgJsonOptions` (snake_case)
        se mută în serviciu
  - [x] la pornire, verificare că `RAWG_API_KEY` există (ca la `Jwt:Key`) — fără cheie nimic nu merge
  - [x] `GameController` devine subțire: doar apelează serviciul și întoarce rezultatul

- [ ] **32. 🔴 Favorite (obligatoriu, IV.1.6) + wishlist (bonus, VII.4)**
  Subiectul cere ca userul să poată adăuga / scoate jocuri din favorite și să le vadă într-o secțiune separată.
  Wishlist-ul e bonus, dar e aproape același cod. Modelele și tabelele (`favorite_games`, `wishlist_games`) există deja.
  - Problema inițială: `UserPublicResponseDTO` are `Favorites` / `Whishlist`. `Whishlist` e mereu `null`
    (în `User` proprietatea e `WishlistItems`, și „Whishlist” e scris greșit), iar `Favorites` se încarcă (probabil)
    la fiecare user din `GetAll` și `Search` prin `ProjectToType`.
  - [x] în `IRawgService` (35): `GetOrCreateGameAsync(rawgGameId)` — caută jocul după `RawgGameId`, iar dacă nu
        există îl ia de la RAWG și îl salvează (cu genuri și platforme); joc inexistent la RAWG → 404
  - [x] endpoint-uri (controller nou, ex: `UserGamesController` cu `[Route("api/users/{userId:long}")]`):
        - `GET    /api/users/{userId}/favorites` — listă (fără paginare)
        - `POST   /api/users/{userId}/favorites/{rawgGameId}` — adaugă
        - `DELETE /api/users/{userId}/favorites/{rawgGameId}` — scoate
        - aceleași trei pentru `/wishlist`
  - [x] `POST` / `DELETE` doar pentru userul din token (`IsCurrentUser`)
  - [ ] `GET` favorite / wishlist doar pentru proprietar și prietenii lui (prietenie `Accepted`), altfel 403
        - perechea din `Friendships` e salvată ordonată (`User1Id` = id-ul mai mic), deci verificarea cu
          `Math.Min` / `Math.Max`, ca în `FriendshipController`
        - id-ul userului din token ca număr → extension method `User.GetUserId()` pe `ClaimsPrincipal`,
          folosit în locul celor 3 copii de `IsCurrentUser` (User, Friendship, UserGames)
  - [x] joc adăugat de două ori → de decis: 409 sau 204 fără eroare (mai simplu pentru frontend) → decis: 204
        (`DELETE` pentru un joc care nu e în listă → 404)
  - [x] adăugare cu `Include(u => u.Favorites.Where(g => g.Id == game.Id))` + `user.Favorites.Add(game)`;
        listare direct în SQL cu `SelectMany(u => u.Favorites)` + `ProjectToType`
  - [x] `Favorites` / `Whishlist` șterse din `UserPublicResponseDTO` → listele de useri nu mai încarcă jocuri
  - [x] de verificat: `Genre.RawgGenreId` / `Platform.RawgPlatformId` sunt enum-uri (`GameGenre`, `GamePlatform`) —
        genurile / platformele noi de la RAWG care nu sunt în enum trebuie să poată fi salvate

- [ ] **36. 🔴 `GET /api/games` — căutare, filtre, sortare, paginare (Home, Basic + Advanced search, listă)**
  Trimite cererea mai departe la `GET /games` de la RAWG și întoarce o listă de carduri.
  - [x] parametri din query (`[FromQuery]` într-un DTO, ca `PaginationDTO`): `search`, `genres`, `platforms`,
        `year`, `ordering`, `metacritic`, `page`, `pageSize`
  - [ ] traducerea pentru RAWG: `year=2020` → `dates=2020-01-01,2020-12-31`; `genres` / `platforms` ca ID-uri
        separate prin virgulă; `page_size` maxim 40 (limita RAWG)
        → parțial: `genres` / `platforms` și `page_size` ≤ 40 sunt făcute; anul merge doar ca interval
        (`"2020,2022"`), un singur an e ignorat (vezi 46)
  - [x] `ordering` validat (doar `name`, `-released`, `-rating`, `-metacritic` și variantele lor) → 400 altfel
        (`SortBy` + `Ascending` cu regex; dar se trimite ca `order=` în loc de `ordering=`, vezi 46)
  - [x] **rating:** RAWG nu are filtru după rating — de decis: filtru după `metacritic` (ex: `80,100`), sau filtrare
        după `rating` pe pagina primită (atenție: strică numărul de rezultate pe pagină)
        → decis: filtru după `metacritic`
  - [ ] `GameCardDTO` cu ce cere subiectul pentru carduri: `rawgGameId`, `title`, `backgroundImage`, `releaseDate`,
        `rating`, platformele principale (`parent_platforms` de la RAWG)
  - [ ] răspuns `PagedResponseDTO<GameCardDTO>` (refolosit de la `GET /api/users`), `TotalCount` = `count` de la RAWG
        (vezi 40 și 48)
  - [ ] fără `search` și filtre → o selecție pentru Home (ex: `ordering=-rating`)
  - [ ] `GET /api/games` de acum (jocurile din baza de date) dispare — favoritele au endpoint-ul lor (32)

- [ ] **37. 🔴 Pagina de detaliu completă: developer, publisher, screenshots**
  Subiectul (IV.1.5) cere și developer, publisher și imagini / screenshots. Acum `Developer` / `Publisher` vin
  mereu `null` (nu sunt citite de la RAWG) și nu există screenshots.
  - [ ] în `RawgResponseDTO`: `Developers` și `Publishers` (liste cu `name`), `DescriptionRaw` (descrierea fără HTML)
  - [ ] în `GameResponseDTO`: listele de developeri / publisheri completate în ramura RAWG
  - [ ] screenshots de la `GET /games/{id}/screenshots` (RAWG): ori în același răspuns (`Screenshots: string[]`),
        ori endpoint separat `GET /api/games/{rawgGameId}/screenshots`
  - [ ] erori ca la punctul 31: joc inexistent → 404, RAWG picat → 503

- [ ] **38. 🔴 `GET /api/genres` și `GET /api/platforms` (pentru filtrele din căutarea avansată)**
  Frontend-ul are nevoie de lista de genuri / platforme ca să afișeze filtrele.
  - [ ] proxy către `GET /genres` și `GET /platforms/lists/parents` (sau `/platforms`) de la RAWG
  - [ ] DTO-uri mici: `id`, `name`, `slug`
  - [ ] cache cu `IMemoryCache` (ex: 24 de ore) — se schimbă rar, iar RAWG are limită de request-uri

- [ ] **39. 🔴 Testare cu Postman + colecție exportată**
  Subiectul (V.5) cere ca toate API-urile să fie verificate cu Postman și recomandă colecția ca documentație.
  - [ ] o colecție cu toate endpoint-urile (auth, users, friendship, games, genres, platforms, favorites)
  - [ ] cazuri de eroare: fără token (401), date invalide (400), joc inexistent (404), etc.
  - [ ] colecția exportată în repo (ex: `docs/TerraBeegle.postman_collection.json`)

## Securitate

- [x] **1. Autentificare cu JWT + autorizare**
  Acum oricine poate face `PATCH` / `DELETE` pe orice id. La login, clientul primește un token
  pe care îl trimite la fiecare request (`Authorization: Bearer ...`). Serverul află din token cine e
  userul și îi permite să modifice doar contul lui.
  - [x] pachetul `Microsoft.AspNetCore.Authentication.JwtBearer` (10.0.13)
  - [x] secțiunea `Jwt` în `appsettings.json` (`Issuer`, `Audience`, `ExpiresInMinutes`)
  - [x] cheia secretă în user-secrets, nu în `appsettings`
  - [x] `AddAuthentication().AddJwtBearer(...)` + `UseAuthentication()` / `UseAuthorization()` în `Program.cs`
  - [x] serviciu care generează token-ul
  - [x] login-ul returnează token-ul (DTO nou de răspuns)
  - [x] `[Authorize]` pe PATCH și DELETE + verificare că id-ul din token = id-ul din URL
  - [x] Swagger configurat să trimită token-ul

- [x] **2. Rate limiting pe login**
  Acum se pot încerca mii de parole pe secundă. Folosim rate limiter-ul inclus în ASP.NET Core
  (ex: max 5 încercări pe minut).

- [x] **3. `GET /api/users` expune email-urile tuturor**
  De decis cine are voie să vadă lista de useri și ce câmpuri.

- [x] **4. Secretele din `appsettings`**
  Parola de PostgreSQL e în `appsettings.Development.json`, care e în git. Cheia JWT și parola DB
  se mută în user-secrets / variabile de mediu.

## Corectitudine

- [x] **5. Race condition la username / email unic**
  `AnyAsync` urmat de `SaveChangesAsync` nu e atomic: două register-uri simultane cu același
  username pot trece amândouă de verificare, iar al doilea crapă cu 500.
  Soluție: prinzi `DbUpdateException` și returnezi 409.

- [x] **6. Tranzacție la DELETE**
  `ExecuteDeleteAsync` (prieteniile) și `SaveChangesAsync` (userul) sunt operații separate.
  Dacă a doua eșuează, prieteniile sunt deja șterse. Soluție: le pui într-o tranzacție.

## Calitatea API-ului

- [x] **7. Format de eroare consistent**
  Validările automate returnează `ProblemDetails` (JSON structurat), dar `BadRequest("...")` /
  `Conflict("...")` returnează doar un string. Frontend-ul ar trebui să trateze un singur format.
  **Decizie (27.10.2026):** erorile cu mesaj scrise de noi sunt string-uri — `BadRequest("...")`, `NotFound("...")`,
  `Conflict("...")`, `Unauthorized("...")`, iar pentru 403 / 503 `StatusCode(StatusCodes.Status403Forbidden, "...")`.
  Nu se mai folosește `Problem(...)`. Rămân `ProblemDetails` (JSON) doar cele generate de ASP.NET: validările
  automate din DTO-uri, `ValidationProblem(ModelState)` din `ModifyUser`, 500-urile din `GlobalExceptionHandler`
  și răspunsurile goale (`NotFound()`, `Forbid()`, 401 de la `[Authorize]`) prin `UseStatusCodePages`.
  Frontend-ul: dacă răspunsul e JSON citește `detail` / `errors`, altfel afișează textul.

- [x] **8. Handler global de excepții**
  Orice excepție neprinsă dă acum 500 cu stack trace în Development. În producție: răspuns curat
  + log.

- [x] **9. Paginare la `GET /api/users`**
  Acum returnează toți userii deodată.

## Structură

- [ ] **10. Service layer**
  Logica de register / login / update iese din controller într-un `UserService`. Controller-ul devine
  subțire, iar logica poate fi testată.

## GameController

- [x] **11. `GET /api/games` nu poate crea controller-ul**
  Constructorul cere `string ApiKey`, dar în DI nu e înregistrat niciun `string` (`var ApiKey` din
  `Program.cs` nu e folosit nicăieri). La primul request ASP.NET aruncă „Unable to resolve service
  for type System.String” → 500. Soluție: cheia se citește din `IConfiguration` (sau o clasă de
  opțiuni) în loc de un `string` în constructor.

- [x] **12. Cheia RAWG ajunge în log-uri**
  `Console.WriteLine($"Request URL: {url}")` scrie URL-ul cu `?key=...` în consolă / log-urile Docker.
  Soluție: scoți `Console.WriteLine` sau folosești `ILogger` fără cheie în mesaj.

## Cont

- [x] **13. Schimbarea parolei**
  `UpdatePasswordDTO` există, dar nu e folosit de niciun endpoint.
  - [x] endpoint `[Authorize]` (ex: `PATCH /api/users/{id}/password`) + verificare că id-ul din token = id-ul din URL
  - [x] DTO-ul cere și parola curentă; dacă e greșită → 401 / 400
  - [x] parola nouă validată la fel ca la register (`[Required]`, `[MinLength(8)]`)
  - [x] parola nouă se hash-uiește cu `IPasswordHasher<User>`

- [ ] **14. Schimbarea email-ului**
  `UpdateEmailDTO` există, dar nu e folosit de niciun endpoint.
  - [ ] endpoint `[Authorize]` (ex: `PATCH /api/users/{id}/email`) + verificare că id-ul din token = id-ul din URL
  - [ ] DTO-ul cere și parola curentă (cine fură token-ul nu poate prelua contul)
  - [ ] email-ul validat (`[Required]`, `[EmailAddress]`, `[MaxLength(255)]`) și normalizat (`Trim().ToLowerInvariant()`)
  - [ ] email deja folosit → 409 (verificare + `catch` pe `UniqueViolation`, ca la register)

## După merge-ul cu `fracerba` — grave

- [x] **15. Lipsește migrația pentru modelele modificate**
  `Game` are coloane noi (`Website`, `RatingCount`, `Rating1count`…`Rating5count`, `NameOriginal`) și
  `CoverImageUrl` a fost redenumit în `BackgroundImage`; `Friendship` are `UpdatedAt`. În `Migrations/` nu e
  nicio migrație nouă (snapshot-ul are încă `CoverImageUrl` și nu are `Friendship.UpdatedAt`).
  În EF Core 10 `Migrate()` aruncă `PendingModelChangesException`, `catch`-ul din `Program.cs` o ascunde cu
  mesajul „Impossibile connettersi a PostgreSQL”, iar apoi `GET .../friendship` și citirile din `Games` dau 500
  („column does not exist”).
  - [x] `dotnet ef migrations add UpdateGameAndFriendship` (redenumirea e `RenameColumn`, nu drop + add)
  - [x] `catch`-ul de la pornire prinde doar `NpgsqlException` și loghează excepția reală; orice altă eroare oprește aplicația

- [x] **16. `Forbid("mesaj")` dă 500 în `FriendshipController`**
  Parametrul lui `Forbid(string)` e numele unei **scheme de autentificare**, nu un mesaj. ASP.NET caută schema
  „SenderId must match...”, nu o găsește și aruncă excepție. Apare la liniile 81, 149, 152, 155, 184, 187, 190.
  Soluție (după decizia de la punctul 7): `StatusCode(StatusCodes.Status403Forbidden, "...")`, sau `Forbid()`
  fără argument dacă nu e nevoie de mesaj. **Niciodată `Forbid("mesaj")`.**

- [x] **17. `CreateFriendship` dă (probabil) 500 după ce salvează**
  `CreatedAtAction(nameof(GetFriendships), new { id = friendship.Id }, ...)`: ruta cere `userId`, iar
  `GetFriendships` nu are parametru `id`. Generarea URL-ului eșuează → prietenia e salvată, dar clientul
  primește 500. De confirmat cu un request. Soluție: `new { userId }` în route values.
  Rezolvat: `GetFriendships` e `[HttpGet]` cu `?query=friends|sent|received`, iar `CreatedAtAction` primește
  `new { userId, query = "sent" }` → `Location: /api/users/{userId}/friendship?query=sent`.

- [x] **18. `BackgroundImage` și `NameOriginal` din RAWG vin mereu `null`**
  RAWG trimite `background_image` / `name_original`; `GetFromJsonAsync` ignoră majusculele, dar nu și
  underscore-ul. Doar `Platform` și `ReleasedAt` au `[JsonPropertyName]`.
  Soluție: `[JsonPropertyName("background_image")]` etc. pe câmpurile din `RawgResponseDTO`.

## După merge — medii

- [x] **19. Swagger nu mai trimite token-ul**
  `AddSecurityRequirement` e comentat în `Program.cs` → toate endpoint-urile `[Authorize]` dau 401 din Swagger.
  De întrebat colegul de ce l-a comentat (poate o eroare de compilare cu versiunea lui de Swashbuckle).

- [x] **20. Regex-ul de parolă limitează caracterele permise**
  `[A-Za-z\d@$!%*?&]{8,}` (în `RegisterDTO` și `UpdatePasswordDTO`) respinge orice parolă cu `#`, `.`, `-`,
  spațiu etc. (ex: `Parola#2026`), deși mesajul de eroare spune altceva. Soluție: păstrezi lookahead-urile și
  înlocuiești partea de final cu `.{8,}`.

- [x] **21. `GetById` are acum `[Authorize]`**
  La punctul 3 s-a decis că profilul public e accesibil oricui, iar `GetAll` a rămas public → reguli
  inconsistente. De decis împreună: ori ambele publice, ori ambele cu `[Authorize]`.

- [x] **22. Erori ca string în codul nou**
  `Search` și tot `FriendshipController` folosesc `BadRequest("...")` / `NotFound("...")` / `Conflict("...")` →
  nu respectă formatul `ProblemDetails` de la punctul 7. Soluție: `Problem(detail: ..., statusCode: ...)`.
  **Înlocuit de decizia de la punctul 7:** s-a făcut invers — toate `Problem(...)` din controllere au devenit
  string-uri, ca tot codul nostru să folosească același format.

- [ ] **23. `Search` fără paginare și case-sensitive**
  Întoarce toți userii găsiți și „vlad” nu-l găsește pe „Vlad”. Soluție: `PaginationDTO` ca la `GetAll` +
  `EF.Functions.ILike(u.Username, $"%{query}%")` (cu `%` / `_` din query escapate).
  - [x] paginare (`PaginationDTO` + `Utils.CreatePagedResponse`)
  - [ ] case-insensitive (`ILike`) — tot `Contains`
  - [ ] numărul total nu corespunde cu lista (vezi 51)

## După merge — minore

- [x] **24. `SenderId` e mereu 0 în lista `Friends`**
  `Friends` se mapează din `FriendshipDTO`, care nu are `SenderId`. Pentru prietenii acceptate ar fi mai util
  id-ul celuilalt user.

- [x] **25. `Blocked` redenumit în `Rejected` în enum**
  `Status` e salvat ca string; rândurile existente cu `"Blocked"` nu mai pot fi citite. De verificat dacă există
  în baza de date (sau un `UPDATE` în migrația de la punctul 15).

- [x] **26. `UpdateEmailDTO` fără `[MaxLength(255)]`**
  Coloana `Email` are 255 de caractere → un email mai lung dă excepție de la Postgres (500) în loc de 400.

- [x] **27. Mesajul de la regex-ul pentru username nu corespunde**
  `^[-a-zA-Z0-9_]+$` permite și `-`, dar mesajul spune doar litere, cifre și underscore. De ales unul.

## GameController — jocuri din baza de date

Acum nu se văd pentru că tabela `Games` e (probabil) goală și totul vine de la RAWG. Apar când începeți să
salvați jocuri.

- [x] **28. ID-urile se amestecă în `GET /api/games/{id}`**
  `db.Games.FindAsync(id)` caută după `Game.Id` (ID-ul intern), dar dacă nu găsește cere RAWG cu același `id`
  ca ID RAWG. `GET /api/games/3498` caută jocul cu `Id = 3498` din baza voastră, nu pe cel cu `RawgGameId = 3498`.
  Soluție: `db.Games.FirstOrDefaultAsync(g => g.RawgGameId == id)` (de decis împreună ce ID primește
  frontend-ul — cel mai simplu e mereu ID-ul RAWG).

- [x] **29. Numele nu se potrivesc între `Game` și `GameResponseDTO`**
  Modelul are `Title` și `ReleaseDate` (`DateOnly?`), DTO-ul are `Name` și `Released` (`string?`).
  `game.Adapt<GameResponseDTO>()` și `ProjectToType<GameResponseDTO>()` din `GetAll` le lasă goale → un joc din
  baza de date vine fără nume și fără dată. Soluție: configurare Mapster (`TypeAdapterConfig`) cu
  `.Map(d => d.Name, s => s.Title)` etc., sau mapare manuală.
  Rezolvat altfel: în `GameResponseDTO` câmpurile au fost redenumite ca în model (`Title`, `ReleaseDate` de tip
  `DateOnly?`), deci Mapster le potrivește singur. Fără migrație (modelul nu s-a schimbat). În JSON cheile sunt
  acum `title` și `releaseDate` (nu `name` / `released`) — de anunțat frontend-ul.

- [x] **30. `Genres` și `Platforms` lipsesc pentru jocurile din baza de date**
  `FindAsync` nu încarcă relațiile → `Genres` și `Platforms` vin goale.
  Soluție: `.Include(g => g.Genres).Include(g => g.Platforms)` (sau `ProjectToType`, care le include în SELECT).
  Rezolvat cu `ProjectToType<GameResponseDTO>()` în `GetById`, ca în `GetAll` (verificat cu `ToQueryString()`:
  genurile și platformele vin în același SELECT). `Slug` / `ReleasedAt` din `GenreDTO` / `PlatformDTO` rămân `null`
  pentru jocurile din baza de date, pentru că nu există în modele.

- [x] **31. Joc inexistent la RAWG → 503 în loc de 404**
  RAWG răspunde 404, `GetFromJsonAsync` aruncă `HttpRequestException`, iar `catch`-ul întoarce 503 „External API
  is unavailable”. Frontend-ul ar afișa „serviciul e picat” pentru un joc care nu există.
  Soluție: `catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)` → 404, înaintea
  `catch`-ului general → 503.

## Frontend ↔ backend

- [ ] **33. În Docker frontend-ul nu poate ajunge la backend**
  `frontend-TerraBeegle/proxy.conf.json` trimite `/api` către `http://localhost:5144`. Local (`npm start`) merge,
  dar în containerul `terrabeegle-frontend` `localhost` e chiar containerul frontend-ului → orice apel `/api/...`
  dă eroare de conexiune. Nu se vede încă pentru că frontend-ul nu face niciun apel HTTP.
  În rețeaua Docker backend-ul e la `http://backend:8080` (numele serviciului + portul intern, nu 5144).
  - [ ] `proxy.conf.json` → `proxy.conf.js` cu `target: process.env.API_URL || "http://localhost:5144"`
  - [ ] `package.json` (`start`, `dev`) și `angular.json` (`proxyConfig`) arată spre `proxy.conf.js`
  - [ ] în `docker-compose.yml`, la serviciul `frontend`: `environment: API_URL: http://backend:8080`
  - [ ] de vorbit cu colegul care a făcut imaginea Docker a frontend-ului

## Verificare email

- [x] **34. Verificarea email-ului cu un cod de 8 caractere**
  La register contul are `EmailVerified = false` și primește pe email un cod random de 8 caractere. Userul
  introduce codul → `EmailVerified = true`.
  **Decizii (27.10.2026):**
  - se trimit **emailuri reale**, prin SMTP (nu Mailpit)
  - ~~un cont neverificat **poate face login** (register întoarce în continuare token-ul)~~ → schimbat pe 02.11.2026
  - un cont neverificat e **șters automat după 2 zile**

  **Decizii (02.11.2026), înlocuiesc login-ul de mai sus:**
  - register **nu** mai întoarce token; codul ajunge **doar** pe email
  - un cont neverificat **nu poate face login** fără cod: login-ul cere `emailOrUsername` + `password` + `code`
  - un cont verificat face login doar cu `emailOrUsername` + `password`
  - `POST /api/auth/verify-email` nu mai există — verificarea se face direct la login
  - `resend-email` e public și primește doar `{ email }`

  **Pasul 1 — furnizorul SMTP + serviciul de email**
  - [x] ales furnizorul SMTP (codul e același, se schimbă doar setările) → ales: **Gmail** cu App Password:
        - **Gmail** cu „App Password” — cel mai simplu pentru un proiect de facultate: contul trebuie să aibă
          verificarea în 2 pași, apoi se generează o parolă de aplicație; `smtp.gmail.com`, port `587`;
          limită ~500 emailuri / zi; expeditorul e adresa de Gmail
        - **Brevo** — gratuit 300 / zi, adresa expeditorului trebuie verificată în contul Brevo
  - [x] în `.env`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
        (și în `.env.example` fără valori, ca restul variabilelor); **parola SMTP nu ajunge în git**
  - [x] la serviciul `backend` din `docker-compose.yml`: `Smtp__Host: ${SMTP_HOST}`, `Smtp__Port: ${SMTP_PORT}`,
        `Smtp__User: ${SMTP_USER}`, `Smtp__Password: ${SMTP_PASSWORD}`, `Smtp__From: ${SMTP_FROM}`
  - [x] fiecare coleg își pune propriile date SMTP în `.env`-ul lui (sau folosiți un cont comun al proiectului)
        → cont Gmail comun, făcut pentru TerraBeegle
  - [x] pachetul `MailKit`
  - [x] `IEmailService` + `EmailService` cu `SendAsync(to, subject, body)`, înregistrat în `Program.cs`
        (la fel ca `ITokenService` / `TokenService`); conexiune cu `SecureSocketOptions.StartTls` pe portul 587
  - [x] la pornire, verificare că setările `Smtp:*` există (ca la `Jwt:Key`)
  - [x] testat că un email ajunge în inbox-ul real (verificat și folderul Spam)
  - [x] la teste folosiți adrese proprii — fiecare register trimite un email real

  **Pasul 2 — modelul + migrația**
  - [x] în `User`: `EmailVerified` (`bool`), `EmailVerificationCodeHash` (`string?`),
        `EmailVerificationCodeExpiration` (`DateTime?`), `EmailVerificationAttempts` (`int`)
  - [x] migrația (`AddEmailVerification`) + `UPDATE "Users" SET "EmailVerified" = true;` în `Up()` → userii
        existenți nu sunt considerați neverificați (și nu sunt șterși de pasul 6)
  - [x] `EmailVerified` în `UserResponseDTO`, ca frontend-ul să poată afișa „Verifică-ți email-ul” (`GET /me`)
  - [x] verificările de la pornire din `Program.cs` sar peste `dotnet ef` (`EF.IsDesignTime`) — altfel
        `dotnet ef migrations add` se oprește, pentru că valorile din `.env` există doar în Docker

  **Pasul 3 — generarea și trimiterea codului la register**
  - [x] cod cu `RandomNumberGenerator.GetString(alfabet, 8)` (nu `Random`), alfabet fără caractere care se
        confundă (`0/O`, `1/I/L`) → doar litere mari + cifre: `ABCDEFGHJKMNPQRSTUVWXYZ23456789`
  - [x] în baza de date se salvează doar hash-ul codului (`SHA256`), nu codul
        (`HashCode` face și `Trim().ToUpperInvariant()`, deci la pasul 4 codul introdus nu trebuie normalizat)
  - [x] expirare după 15 minute, `EmailVerificationAttempts = 0`
  - [x] emailul se trimite după `SaveChangesAsync`; dacă trimiterea eșuează, contul rămâne creat și userul
        cere un cod nou (pasul 5)
  - [x] totul în `IEmailVerificationService` / `EmailVerificationService` (`SetNewCode`, `VerifyCode`,
        `SendCodeAsync`), refolosit la pașii 4, 5 și la punctul 14
  - [x] register întoarce 201 cu `UserResponseDTO`, fără token (decizia din 02.11)

  **Pasul 4 — verificarea codului la `POST /api/auth/login`** (până pe 02.11 era un endpoint separat, `verify-email`)
  - [x] `LoginDTO` are `Code` opțional (`string?`, `[StringLength(8, MinimumLength = 8)]`)
  - [x] ordinea în `Login`: user găsit → parolă corectă (altfel 401) → email verificat? → token
  - [x] email neverificat fără `code` → 403 (frontend-ul afișează câmpul pentru cod)
  - [x] email neverificat cu `code` → `VerifyCode`, apoi `SaveChangesAsync` în orice caz:
        expirat → 400; prea multe încercări (`MaxAttempts = 5`) → 400 + trebuie cerut alt cod; cod greșit → 400
        (`Attempts++`); cod corect → `EmailVerified = true`, hash-ul / expirarea / încercările se șterg + token
  - [x] codul se verifică **după** parolă → doar proprietarul contului poate consuma cele 5 încercări
  - [x] comparare cu `CryptographicOperations.FixedTimeEquals` pe hash-uri, în
        `EmailVerificationService.VerifyCode` (întoarce `CodeVerificationResult`; nu salvează, salvează controller-ul)

  **Pasul 5 — `POST /api/auth/resend-email`**
  - [x] public, body `{ email }` (`ResendEmailDTO`); userul se caută după email normalizat
  - [x] același 200 în toate cazurile (email inexistent, deja verificat, trimis, trimitere eșuată) → endpoint-ul
        nu poate fi folosit ca să afli ce emailuri sunt înregistrate; eroarea de trimitere ajunge doar în log
  - [x] cod nou, expirare nouă, `Attempts = 0`, email trimis
  - [x] rate limiting `resend-email`: 3 pe 10 minute **per IP** (nu per user: fără token nu există user)

  **Pasul 6 — ștergerea conturilor neverificate după 2 zile**
  - [x] `BackgroundService` care rulează periodic (ex: o dată pe oră) și șterge userii cu
        `!EmailVerified && CreatedAt < UtcNow - 2 zile`
  - [x] ca la `DeleteUser`: prieteniile au `DeleteBehavior.Restrict`, deci se șterg întâi prieteniile, apoi userii,
        într-o tranzacție (favoritele / wishlist-ul se șterg automat, cascade pe tabelele de legătură)
  - [x] `DbContext` se ia dintr-un scope nou (`IServiceScopeFactory`), pentru că `BackgroundService` e singleton
  - [x] log cu câți useri au fost șterși

  **De decis mai târziu**
  - [ ] punctul 14 (schimbarea email-ului) refolosește același mecanism: noul email se salvează doar după ce
        codul trimis pe el e confirmat

## După merge-ul din 02.11.2026 — grave

- [x] **40. Proiectul nu compilează**
  `RawgService.cs:53`: `RawgSearchDTO.Results` e o listă de `RawgGameDTO`, dar i se dă o listă de `GameCardDTO`
  (`ToGameCardDTO`) → CS0029. Nimeni nu poate porni backend-ul.
  Soluție: `SearchGamesAsync` întoarce direct `PagedResponseDTO<GameCardDTO>` (ce declară și `GameController.Search`),
  iar `RawgSearchDTO` rămâne doar pentru deserializarea răspunsului de la RAWG.
  → rezolvat de coleg („Fixed Game Search”): `SearchGamesAsync` întoarce `GameSearchResponseDTO` (`Results` de tip
  `GameCardDTO`). `GameController.Search` declară încă `PagedResponseDTO<GameResponseDTO>` (vezi 48).

- [x] **41. Lipsește migrația pentru modelele modificate (din nou, ca la punctul 15)**
  Modificări fără migrație: `Game.Title` → `Game.Name`, `RatingCount` `int` → `long`, `Game.DLCs` / `ParentGames` /
  `Series`, `User.IsChangingMail`, indexul nou pe `Friendship.User2Id`. La pornire `Migrate()` aruncă
  `PendingModelChangesException` și aplicația se oprește (comportamentul ales la 15).
  - [x] `RawgObject` e `abstract` și nu are nicio clasă concretă derivată → EF nu poate construi modelul
        („cannot be instantiated, and there is no derived entity type”). De decis: clase concrete
        (ex: `GameSeries`, `Dlc`) sau scoase până sunt folosite — acum nu le completează nimeni
  - [x] `dotnet ef migrations add ...` + verificat în fișierul generat că `Title` → `Name` e `RenameColumn`,
        nu `DropColumn` + `AddColumn` (altfel se pierd titlurile jocurilor salvate)

- [x] **42. Login blocat pentru conturile neverificate → userul nu mai poate verifica niciodată**
  În `Login` s-a adăugat `if (!user.EmailVerified) return Unauthorized(...)`. Contrazice decizia de la 34 („un cont
  neverificat poate face login”) și strică fluxul: `verify-email` și `resend-email` sunt `[Authorize]`, deci după ce
  expiră token-ul de la register (60 de minute) userul nu mai poate obține alt token → nu poate verifica și nu poate
  cere cod nou → contul e șters după 2 zile.
  În plus, verificarea e făcută **înainte** de parolă: oricine poate afla, fără parolă, dacă un email / username
  există și e neverificat. Mesajul vorbește de „verification token”, dar e un cod.
  De decis împreună: ori se scoate verificarea (decizia de la 34), ori se schimbă tot fluxul (register fără token,
  `verify-email` / `resend-email` publice cu `{ email, code }` / `{ email }`, răspuns identic indiferent dacă
  emailul există).
  → rezolvat pe 02.11: un cont neverificat nu poate face login fără cod, iar codul se trimite direct la login
  (vezi punctul 34, pașii 4–5). `verify-email` a fost șters.

- [x] **43. `ChangePassword` răspunde „Password changed successfully”, dar nu salvează nimic**
  În `UserController.ChangePassword` lipsește `await db.SaveChangesAsync()` → parola rămâne cea veche.
  - [x] `SaveChangesAsync` după `HashPassword`
  - [x] `OldPassword` are regex-ul de complexitate → cine are o parolă creată înainte de regex-ul actual (punctul 20)
        primește 400 și nu-și poate schimba parola. Parola veche are nevoie doar de `[Required]`
  - [x] parolă veche greșită → 401 îl poate deloga pe user în frontend; mai bine 400 / 403
  - [x] după rezolvare, bifat și punctul 13

- [ ] **44. Cheia RAWG ajunge la client prin `Next` / `Previous`**
  `SearchGamesAsync` copiază `response.Next` / `response.Previous` de la RAWG, care sunt URL-uri complete cu
  `&key=...`. Oricine folosește aplicația vede cheia în răspunsul JSON (ca la punctul 12, dar mai grav).
  Soluție: `PreviousPageUrl` / `NextPageUrl` construite de noi (`Utils.CreatePagedResponse` + `Url.Action`), ca la
  celelalte liste.
  - [x] colegul scoate acum cheia cu `Replace(key, "")` din `Next` / `Previous` → cheia nu mai ajunge la client
  - [ ] de verificat URL-ul rezultat: dacă RAWG pune `key` primul (`?key=...&page=2`), `Replace("?&", "&")` dă
        `api/games&page=2` (fără `?`); în plus parametrii RAWG (`page_size`) nu se potrivesc cu ai noștri (`PageSize`).
        Varianta sigură rămâne cea de mai sus: URL-uri construite de noi

## După merge-ul din 02.11.2026 — `GET /api/games` (punctul 36)

- [x] **45. `Search` nu primește parametrii din query**
  `Search(GameSearchDTO search)` fără `[FromQuery]`: cu `[ApiController]`, un parametru de tip clasă se citește din
  **body** → `GET /api/games?title=witcher` dă 415 / 400. Soluție: `[FromQuery] GameSearchDTO search`.
  → rezolvat de coleg („Fixed api/games”): `[FromQuery] GameSearchDTO search`; testat — căutarea funcționează.

- [ ] **46. Parametri greșiți trimiși la RAWG**
  - [x] sortarea se trimite ca `order=`, dar RAWG cere `ordering=` → sortarea nu are niciun efect
  - [x] `Updated` se trimite tot ca `dates=` (copiat de la `ReleaseDate`) → RAWG primește două `dates`;
        trebuie `updated=`
  - [ ] valorile nu sunt encodate: `title=Ratchet & Clank` taie căutarea la `Ratchet` și adaugă un parametru
        `Clank`; un `title` cu `&...=` poate adăuga orice parametru în cererea către RAWG.
        Soluție: `Uri.EscapeDataString(...)` sau `QueryHelpers.AddQueryString(...)`
  - [ ] `ReleaseDate` acceptă doar `"2020,2022"`; un singur an (`"2020"`) sau o valoare greșită (`"abc,def"`) sunt
        ignorate în tăcere → userul primește rezultate nefiltrate fără să știe. Subiectul cere filtru după **an**:
        ori `Year` (`int?`), ori 400 pentru format invalid

- [ ] **47. RAWG picat → 500, nu 503**
  `GetById` prinde `HttpRequestException` și întoarce 503, `Search` nu → excepția ajunge la `GlobalExceptionHandler`.
  La fel pentru un filtru pe care RAWG îl respinge (ex: gen inexistent) → tot 500.
  - [ ] nou după fix: `SearchGamesAsync` întoarce `null` la 404 de la RAWG (ex: pagină după ultima), iar
        `Ok(null)` devine **204 No Content** fără body → frontend-ul primește un răspuns gol în loc de o listă goală.
        Soluție: la 404 aceeași listă goală ca la `response is null` (`Count = 0`, `Results = []`)

- [x] **48. Tipul de răspuns nu corespunde**
  Semnătura spune `PagedResponseDTO<GameResponseDTO>`, dar se întoarce `RawgSearchDTO` (alte câmpuri: `Count`,
  `Results`, `Next`, `Previous`). Swagger și frontend-ul văd alt format decât cel real. Se rezolvă împreună cu 40:
  `PagedResponseDTO<GameCardDTO>`, ca la favorite.
  → rezolvat altfel: semnătura e acum `ActionResult<GameSearchResponseDTO>`, adică exact ce se întoarce
  (`Count` / `Next` / `Previous` / `Results`). Nu e `PagedResponseDTO` ca la celelalte liste, dar e consecvent.

- [ ] **49. Construirea query-ului e în controller**
  ~90 de linii de `if`-uri în `GameController.Search`. Punctul 35 a mutat tot ce ține de RAWG în `RawgService`;
  aici se întoarce invers. Soluție: `rawgService.SearchGamesAsync(GameSearchDTO search)`, controller-ul doar
  apelează. Merită și un DTO mai scurt: `Stores`, `Creators`, `Tags`, `Updated`, `PlatformsCount`, `Exclude*` nu
  sunt cerute de subiect și fiecare e un loc în plus pentru bug-uri (ex: 46).

## După merge-ul din 02.11.2026 — medii

- [x] **50. Favoritele / wishlist-ul vin fără titlu**
  `Game.Title` a devenit `Game.Name`, dar `GameCardDTO` are tot `Title` → `ProjectToType<GameCardDTO>()` nu mai
  găsește câmpul și `Title` e mereu `null`. De ales un singur nume (`Name` peste tot, ca la RAWG și la
  `GameResponseDTO`), sau o regulă Mapster `Map(dest => dest.Title, src => src.Name)`.
  → decis inițial `Title` peste tot, dar după merge-ul cu `fracerba` a rămas **`Name` peste tot** (`Game`,
  `GameCardDTO`, `GameResponseDTO`); coloana a fost redenumită în migrația `RenameTitleToNameAndAddIndexes`
  (`RenameColumn`, fără pierdere de date). Frontend-ul citește `name`.

- [ ] **51. `Search` pe useri: numărul total nu corespunde cu lista**
  `totalCount` numără toți userii găsiți, dar lista are în plus `&& u.EmailVerified` → `TotalPages` greșit și pagini
  goale.
  - [ ] 0 rezultate → 404; pentru o căutare, „nimic găsit” e 200 cu listă goală (frontend-ul afișează mesajul)
  - [ ] `GetAll` și `GetById` arată și userii neverificați, `Search` nu → de decis o regulă comună
  - [ ] tot case-sensitive (punctul 23 rămâne deschis)

- [ ] **52. Același joc căutat de două ori în baza de date**
  `GameController.GetById` caută jocul în DB, apoi `rawgService.GetGameAsync` îl caută din nou. Ramura din serviciu
  (`game.Adapt<Game, GameResponseDTO>()`) nu face `Include` → ar întoarce `Genres` / `Platforms` goale (bug-ul de
  la punctul 30). Acum nu se ajunge acolo, dar e cod mort care poate fi folosit greșit. Soluție: o singură căutare,
  în serviciu, cu `ProjectToType`.

- [ ] **53. Joc deja adăugat la favorite / wishlist: 204 sau 409?**
  La 32 s-a decis 204, dar `catch`-ul nou pe `UniqueViolation` întoarce 409 → același caz, două răspunsuri
  (204 de obicei, 409 la două request-uri simultane). De ales unul. `catch`-ul pe `ForeignKeyViolation` la
  ștergere nu poate apărea (se șterge doar un rând din tabela de legătură) — de scos.

## După merge-ul din 02.11.2026 — minore

- [ ] **54. `Utils` e în namespace-ul `Controllers`, iar `RawgService` îl importă**
  Un serviciu nu ar trebui să depindă de controllere. `Utils.IsCurrentUser(User, id)` → extension method pe
  `ClaimsPrincipal` (ex: `User.GetUserId()`, cum scrie la 32). (`AuthController` nu mai citește token-ul deloc
  după 02.11, deci nu mai are cod copiat.)

- [ ] **55. Cod nefolosit**
  - [ ] `User.IsChangingMail` — nefolosit (probabil pentru punctul 14); de scos până atunci, altfel intră degeaba în migrație
  - [ ] `RawgGameDTO.ParentPlatforms` se deserializează, dar nu ajunge în `GameCardDTO` (`ParentPlatformDTO` e comentat).
        Subiectul cere „main platforms” pe card → exact `parent_platforms`
  - [ ] `RawgObjectDTO`, `GameStore` — nefolosite
  - [ ] `GET /api/games/all` — la 36 s-a decis că dispare; acum întoarce `GameResponseDTO` complet (cu descriere)

- [ ] **56. Mesaje / documentație care nu mai corespund**
  - [ ] rate limit: „Try again in a minute”, dar `resend-email` are fereastră de 10 minute
  - [x] la 34, pasul 5: ruta e `resend-verification`, în cod e `resend-email`, iar limita e per IP, nu per user
        (actualizat în milestone pe 02.11)
  - [ ] textul emailului: „Thank you for creating an account” se trimite și la resend; „contact our support team” fără adresă
  - [ ] `CreateGameAsync` întoarce și jocuri existente → numele vechi `GetOrCreateGameAsync` era mai corect
