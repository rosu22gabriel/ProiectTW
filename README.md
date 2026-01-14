Proiect Tehnologii Web - Notes App

Cerinte locale
- Node.js (LTS)
- MySQL (local)

Back-end
1) Instalare dependinte:
   cd back-end
   npm install
2) Configurare env:
   - Creeaza un fisier back-end/.env (sau copiaza back-end/.env.example)
   - Seteaza JWT_SECRET si PORT
3) Configureaza baza de date:
   - MySQL trebuie sa ruleze
   - Baza de date folosita: bd-proiect-tw (configurata in back-end/db/db-config.js)
4) Pornire server:
   npm run nodemon
5) (Optional) Reset DB:
   - POST http://localhost:8080/resetDatabase

Front-end
1) Instalare dependinte:
   cd front-end
   npm install
2) Pornire:
   npm run dev
3) (Optional) Seteaza API URL:
   - Creeaza front-end/.env si adauga:
     VITE_API_URL=http://localhost:8080

Testare
Back-end (server pornit, JWT_SECRET setat):
- npm run test:validation
- npm run test:routes
- npm run test:flows

Flux rapid
1) Inregistreaza un user in UI (/register) sau foloseste API
2) Autentificare in UI (/login)
3) Creeaza note, grupe, invitatii si atasamente din UI
