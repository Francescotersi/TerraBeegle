# Milestone: API-uri User mai robuste

Stare actuală: CRUD complet pentru User (register, login, get all, get by id, patch, delete).

## Securitate

- [ ] **1. Autentificare cu JWT + autorizare**
  Acum oricine poate face `PATCH` / `DELETE` pe orice id. La login, clientul primește un token
  pe care îl trimite la fiecare request (`Authorization: Bearer ...`). Serverul află din token cine e
  userul și îi permite să modifice doar contul lui.
  - [x] pachetul `Microsoft.AspNetCore.Authentication.JwtBearer` (10.0.13)
  - [x] secțiunea `Jwt` în `appsettings.json` (`Issuer`, `Audience`, `ExpiresInMinutes`)
  - [ ] cheia secretă în user-secrets, nu în `appsettings`
  - [ ] `AddAuthentication().AddJwtBearer(...)` + `UseAuthentication()` / `UseAuthorization()` în `Program.cs`
  - [ ] serviciu care generează token-ul
  - [ ] login-ul returnează token-ul (DTO nou de răspuns)
  - [ ] `[Authorize]` pe PATCH și DELETE + verificare că id-ul din token = id-ul din URL
  - [ ] Swagger configurat să trimită token-ul

- [ ] **2. Rate limiting pe login**
  Acum se pot încerca mii de parole pe secundă. Folosim rate limiter-ul inclus în ASP.NET Core
  (ex: max 5 încercări pe minut).

- [ ] **3. `GET /api/users` expune email-urile tuturor**
  De decis cine are voie să vadă lista de useri și ce câmpuri.

- [ ] **4. Secretele din `appsettings`**
  Parola de PostgreSQL e în `appsettings.Development.json`, care e în git. Cheia JWT și parola DB
  se mută în user-secrets / variabile de mediu.

## Corectitudine

- [ ] **5. Race condition la username / email unic**
  `AnyAsync` urmat de `SaveChangesAsync` nu e atomic: două register-uri simultane cu același
  username pot trece amândouă de verificare, iar al doilea crapă cu 500.
  Soluție: prinzi `DbUpdateException` și returnezi 409.

- [ ] **6. Tranzacție la DELETE**
  `ExecuteDeleteAsync` (prieteniile) și `SaveChangesAsync` (userul) sunt operații separate.
  Dacă a doua eșuează, prieteniile sunt deja șterse. Soluție: le pui într-o tranzacție.

## Calitatea API-ului

- [ ] **7. Format de eroare consistent**
  Validările automate returnează `ProblemDetails` (JSON structurat), dar `BadRequest("...")` /
  `Conflict("...")` returnează doar un string. Frontend-ul ar trebui să trateze un singur format.

- [ ] **8. Handler global de excepții**
  Orice excepție neprinsă dă acum 500 cu stack trace în Development. În producție: răspuns curat
  + log.

- [ ] **9. Paginare la `GET /api/users`**
  Acum returnează toți userii deodată.

## Structură

- [ ] **10. Service layer**
  Logica de register / login / update iese din controller într-un `UserService`. Controller-ul devine
  subțire, iar logica poate fi testată.
