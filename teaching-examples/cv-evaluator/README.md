# CV Evaluator Static App

Applicazione statica pensata per GitHub Pages.

## Cosa fa questa prima versione

- accetta una `OpenAI API key` inserita manualmente dall'utente
- carica un PDF del CV nel browser
- estrae il testo del PDF con `pdf.js`
- invia il testo a `gpt-5-mini` tramite `Responses API`
- restituisce in interfaccia:
  - generalita del candidato
  - formazione
  - esperienza professionale
  - competenze, lingue, certificazioni e note
  - score da `0` a `100`
  - preview del testo grezzo estratto

## File principali

- `index.html`
- `styles.css`
- `app.js`

## Avvio locale

Per i test locali e meglio servire la cartella via HTTP invece di aprire `index.html` direttamente dal disco.

Esempio:

```bash
python3 -m http.server 8008
```

Poi apri `http://127.0.0.1:8008`.

In produzione puoi pubblicare direttamente la cartella su GitHub Pages.

## Nota importante

Questa app e completamente statica. Di conseguenza:

- la chiave API viene inserita dall'utente nel browser
- il prompt interno non compare nella UI, ma il codice frontend puo comunque essere ispezionato

Se vuoi che il prompt resti davvero privato, serve una seconda versione con backend.
