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

- [ ] **11. `GET /api/games` nu poate crea controller-ul**
  Constructorul cere `string ApiKey`, dar în DI nu e înregistrat niciun `string` (`var ApiKey` din
  `Program.cs` nu e folosit nicăieri). La primul request ASP.NET aruncă „Unable to resolve service
  for type System.String” → 500. Soluție: cheia se citește din `IConfiguration` (sau o clasă de
  opțiuni) în loc de un `string` în constructor.

- [ ] **12. Cheia RAWG ajunge în log-uri**
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
