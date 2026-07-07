# Storia della tua vita

Versione statica del gioco, pronta per GitHub Pages.

## Cosa fa adesso

- chiede al giocatore la sua chiave OpenAI all'inizio;
- permette di compilare la scheda iniziale del personaggio;
- esporta e ricarica la scheda in JSON;
- avvia il gioco vero e proprio con `gpt-5-mini`;
- usa output strutturati per:
  - data e ora narrative;
  - testo del narratore;
  - accettazione o rifiuto della scelta;
- blocca le scelte fuori trama con popup di warning;
- permette di iniziare una nuova storia mantenendo la stessa scheda;
- assegna uno `story_id` a ogni sessione narrativa;
- puo' salvare i turni in un Google Sheet tramite Google Apps Script.

## File principali

- `index.html`: struttura della pagina
- `styles.css`: interfaccia
- `app.js`: logica del gioco, output strutturati e logging
- `config.js`: configurazione del webhook Google Sheets
- `google-apps-script/Code.gs`: script server-side da incollare in Apps Script

## Pubblicazione su GitHub Pages

1. Carica questi file in un repository GitHub.
2. Vai in `Settings > Pages`.
3. Seleziona il branch principale e la root del repository.
4. Salva.
5. GitHub pubblichera' il sito statico.

## Google Sheets

Per salvare i turni dei giocatori su un foglio Google:

1. Crea un nuovo Google Sheet.
2. Apri `Extensions > Apps Script`.
3. Incolla il contenuto di [google-apps-script/Code.gs](/Users/janalopi/Library/Mobile%20Documents/com~apple~CloudDocs/Python/Didattica/AI%20Generico/Storia%20della%20tua%20vita/google-apps-script/Code.gs:1).
4. Salva il progetto.
5. In alto a destra scegli `Deploy > New deployment`.
6. Seleziona `Web app`.
7. Imposta:
   - `Execute as`: `Me`
   - `Who has access`: `Anyone`
8. Fai deploy e copia la URL finale `/exec`.
9. Apri [config.js](/Users/janalopi/Library/Mobile%20Documents/com~apple~CloudDocs/Python/Didattica/AI%20Generico/Storia%20della%20tua%20vita/config.js:1) e inserisci la URL in `sheetsWebhookUrl`.
10. Ripubblica il sito statico.

Il foglio ricevera' queste quattro colonne:

- `story_id`
- `specifiche`
- `timestamp`
- `ultima_coppia_narratore_scelta`

La colonna `story_id` identifica in modo univoco ogni sessione narrativa.

La colonna `specifiche` contiene:

- nome
- eta
- genere
- professione/ruolo
- epoca
- luogo

La colonna `timestamp` e' la data reale di salvataggio sul foglio.

La colonna `ultima_coppia_narratore_scelta` contiene:

- il timestamp narrativo della storia;
- il testo del narratore;
- l'ultima scelta accettata del giocatore.

Nota:

- se avevi gia' pubblicato una versione precedente dello script Apps Script, aggiorna il file `Code.gs` e fai un nuovo deploy della web app;
- in questo modo il foglio iniziera' a ricevere anche `story_id`.

## Nota importante

Questa soluzione funziona anche su GitHub Pages, ma ha un limite strutturale:

- l'URL del webhook Apps Script resta pubblica nel frontend;
- quindi e' adatta a logging leggero, non a sicurezza forte;
- se vuoi protezione vera contro spam o abuso, serve un backend tuo.

## Nota tecnica

Il gioco usa `gpt-5-mini` via Responses API con output JSON strutturato.
