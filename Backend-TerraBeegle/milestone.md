# Milestone: API-uri User mai robuste

Stare actuală: CRUD complet pentru User (register, login, get all, get by id, patch, delete).

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

- [ ] **13. Schimbarea parolei**
  `UpdatePasswordDTO` există, dar nu e folosit de niciun endpoint.
  - [ ] endpoint `[Authorize]` (ex: `PATCH /api/users/{id}/password`) + verificare că id-ul din token = id-ul din URL
  - [ ] DTO-ul cere și parola curentă; dacă e greșită → 401 / 400
  - [ ] parola nouă validată la fel ca la register (`[Required]`, `[MinLength(8)]`)
  - [ ] parola nouă se hash-uiește cu `IPasswordHasher<User>`

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

- [ ] **21. `GetById` are acum `[Authorize]`**
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

## După merge — minore

- [x] **24. `SenderId` e mereu 0 în lista `Friends`**
  `Friends` se mapează din `FriendshipDTO`, care nu are `SenderId`. Pentru prietenii acceptate ar fi mai util
  id-ul celuilalt user.

- [ ] **25. `Blocked` redenumit în `Rejected` în enum**
  `Status` e salvat ca string; rândurile existente cu `"Blocked"` nu mai pot fi citite. De verificat dacă există
  în baza de date (sau un `UPDATE` în migrația de la punctul 15).

- [ ] **26. `UpdateEmailDTO` fără `[MaxLength(255)]`**
  Coloana `Email` are 255 de caractere → un email mai lung dă excepție de la Postgres (500) în loc de 400.

- [ ] **27. Mesajul de la regex-ul pentru username nu corespunde**
  `^[-a-zA-Z0-9_]+$` permite și `-`, dar mesajul spune doar litere, cifre și underscore. De ales unul.

## GameController — jocuri din baza de date

Acum nu se văd pentru că tabela `Games` e (probabil) goală și totul vine de la RAWG. Apar când începeți să
salvați jocuri.

- [ ] **28. ID-urile se amestecă în `GET /api/games/{id}`**
  `db.Games.FindAsync(id)` caută după `Game.Id` (ID-ul intern), dar dacă nu găsește cere RAWG cu același `id`
  ca ID RAWG. `GET /api/games/3498` caută jocul cu `Id = 3498` din baza voastră, nu pe cel cu `RawgGameId = 3498`.
  Soluție: `db.Games.FirstOrDefaultAsync(g => g.RawgGameId == id)` (de decis împreună ce ID primește
  frontend-ul — cel mai simplu e mereu ID-ul RAWG).

- [ ] **29. Numele nu se potrivesc între `Game` și `GameResponseDTO`**
  Modelul are `Title` și `ReleaseDate` (`DateOnly?`), DTO-ul are `Name` și `Released` (`string?`).
  `game.Adapt<GameResponseDTO>()` și `ProjectToType<GameResponseDTO>()` din `GetAll` le lasă goale → un joc din
  baza de date vine fără nume și fără dată. Soluție: configurare Mapster (`TypeAdapterConfig`) cu
  `.Map(d => d.Name, s => s.Title)` etc., sau mapare manuală.

- [ ] **30. `Genres` și `Platforms` lipsesc pentru jocurile din baza de date**
  `FindAsync` nu încarcă relațiile → `Genres` și `Platforms` vin goale.
  Soluție: `.Include(g => g.Genres).Include(g => g.Platforms)` (sau `ProjectToType`, care le include în SELECT).

- [ ] **31. Joc inexistent la RAWG → 503 în loc de 404**
  RAWG răspunde 404, `GetFromJsonAsync` aruncă `HttpRequestException`, iar `catch`-ul întoarce 503 „External API
  is unavailable”. Frontend-ul ar afișa „serviciul e picat” pentru un joc care nu există.
  Soluție: `catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)` → 404, înaintea
  `catch`-ului general → 503.

## Useri — favorite / wishlist

- [ ] **32. `Favorites` / `Whishlist` în `UserPublicResponseDTO`**
  - `Whishlist` e mereu `null`: Mapster potrivește după nume, iar în `User` proprietatea e `WishlistItems`
    (și „Whishlist” e scris greșit).
  - `Favorites` se încarcă (probabil) la fiecare user din `GetAll` și `Search` prin `ProjectToType` → o pagină
    de 20 de useri aduce și toate jocurile lor favorite. De confirmat cu un request.
  - De decis împreună: un DTO separat pentru profil (`GetById`) sau endpoint-uri separate
    (`GET /api/users/{id}/favorites`, `.../wishlist`), iar `UserPublicResponseDTO` rămâne mic pentru liste.
