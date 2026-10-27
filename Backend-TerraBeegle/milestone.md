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

- [ ] **16. `Forbid("mesaj")` dă 500 în `FriendshipController`**
  Parametrul lui `Forbid(string)` e numele unei **scheme de autentificare**, nu un mesaj. ASP.NET caută schema
  „SenderId must match...”, nu o găsește și aruncă excepție. Apare la liniile 81, 149, 152, 155, 184, 187, 190.
  Soluție: `Problem(detail: "...", statusCode: StatusCodes.Status403Forbidden)`.

- [ ] **17. `CreateFriendship` dă (probabil) 500 după ce salvează**
  `CreatedAtAction(nameof(GetFriendships), new { id = friendship.Id }, ...)`: ruta cere `userId`, iar
  `GetFriendships` nu are parametru `id`. Generarea URL-ului eșuează → prietenia e salvată, dar clientul
  primește 500. De confirmat cu un request. Soluție: `new { userId }` în route values.

- [ ] **18. `BackgroundImage` și `NameOriginal` din RAWG vin mereu `null`**
  RAWG trimite `background_image` / `name_original`; `GetFromJsonAsync` ignoră majusculele, dar nu și
  underscore-ul. Doar `Platform` și `ReleasedAt` au `[JsonPropertyName]`.
  Soluție: `[JsonPropertyName("background_image")]` etc. pe câmpurile din `RawgResponseDTO`.

## După merge — medii

- [ ] **19. Swagger nu mai trimite token-ul**
  `AddSecurityRequirement` e comentat în `Program.cs` → toate endpoint-urile `[Authorize]` dau 401 din Swagger.
  De întrebat colegul de ce l-a comentat (poate o eroare de compilare cu versiunea lui de Swashbuckle).

- [ ] **20. Regex-ul de parolă limitează caracterele permise**
  `[A-Za-z\d@$!%*?&]{8,}` (în `RegisterDTO` și `UpdatePasswordDTO`) respinge orice parolă cu `#`, `.`, `-`,
  spațiu etc. (ex: `Parola#2026`), deși mesajul de eroare spune altceva. Soluție: păstrezi lookahead-urile și
  înlocuiești partea de final cu `.{8,}`.

- [ ] **21. `GetById` are acum `[Authorize]`**
  La punctul 3 s-a decis că profilul public e accesibil oricui, iar `GetAll` a rămas public → reguli
  inconsistente. De decis împreună: ori ambele publice, ori ambele cu `[Authorize]`.

- [ ] **22. Erori ca string în codul nou**
  `Search` și tot `FriendshipController` folosesc `BadRequest("...")` / `NotFound("...")` / `Conflict("...")` →
  nu respectă formatul `ProblemDetails` de la punctul 7. Soluție: `Problem(detail: ..., statusCode: ...)`.

- [ ] **23. `Search` fără paginare și case-sensitive**
  Întoarce toți userii găsiți și „vlad” nu-l găsește pe „Vlad”. Soluție: `PaginationDTO` ca la `GetAll` +
  `EF.Functions.ILike(u.Username, $"%{query}%")` (cu `%` / `_` din query escapate).

## După merge — minore

- [ ] **24. `SenderId` e mereu 0 în lista `Friends`**
  `Friends` se mapează din `FriendshipDTO`, care nu are `SenderId`. Pentru prietenii acceptate ar fi mai util
  id-ul celuilalt user.

- [ ] **25. `Blocked` redenumit în `Rejected` în enum**
  `Status` e salvat ca string; rândurile existente cu `"Blocked"` nu mai pot fi citite. De verificat dacă există
  în baza de date (sau un `UPDATE` în migrația de la punctul 15).

- [ ] **26. `UpdateEmailDTO` fără `[MaxLength(255)]`**
  Coloana `Email` are 255 de caractere → un email mai lung dă excepție de la Postgres (500) în loc de 400.

- [ ] **27. Mesajul de la regex-ul pentru username nu corespunde**
  `^[-a-zA-Z0-9_]+$` permite și `-`, dar mesajul spune doar litere, cifre și underscore. De ales unul.
