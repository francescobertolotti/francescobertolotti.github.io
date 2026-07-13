# Dilemma del prigioniero iterato vs LLM

Mini web app statica pensata per essere pubblicata facilmente su GitHub Pages.

## Cosa fa

- chiede all'utente la propria OpenAI API key all'inizio
- permette di scegliere il modello tra:
  - `gpt-5-nano`
  - `gpt-5-mini`
  - `gpt-5`
  - `gpt-5.4-nano`
  - `gpt-5.4-mini`
- permette di scegliere il numero di turni, fino a un massimo di `25`
- permette di scegliere quanti turni precedenti l'LLM può vedere
- permette di scegliere tra due modalità:
  - `senza dichiarazione`
  - `con dichiarazione`
- permette di attivare una riflessione post turno dell'LLM, fino a 3 righe
- permette di scegliere tra:
  - dilemma del prigioniero
  - gioco del pollo
  - stag hunt
  - battle of the sexes
- esegue una scelta simultanea: l'LLM riceve solo le regole del gioco e lo storico consentito, non la scelta corrente del giocatore
- nella modalità con dichiarazione:
  - il giocatore scrive una dichiarazione di massimo `200` caratteri
  - l'LLM produce una dichiarazione breve, fino a due frasi
  - poi il giocatore vede la scelta già decisa dall'LLM e seleziona la propria
- mostra una matrice di payoff aggiornata dinamicamente e un popup che spiega come leggerla
- include un popup `Statistiche` con andamento storico di scelte e punti
- include anche una serie storica dei punti cumulati di giocatore e LLM
- scarica automaticamente a fine partita un file `csv` con il log completo del match
- attiva in modo automatico, una partita ogni tre, una variante di prompt che suggerisce all'LLM di fregare il giocatore: questa informazione viene salvata nel log

## File

- `index.html`
- `style.css`
- `app.js`
- `README.md`

## Avvio locale

Per testarla in locale conviene servirla con un server statico semplice. Esempio:

```bash
python3 -m http.server
```

Poi apri `http://localhost:8000`.

## Pubblicazione su GitHub Pages

1. carica questi file in un repository GitHub
2. vai nelle impostazioni del repository
3. attiva GitHub Pages sulla branch desiderata
4. pubblica la root del progetto

## Nota importante sulla sicurezza

Questa app usa la chiave API direttamente dal browser dell'utente e invia le richieste a `https://api.openai.com/v1/responses`.

Questo approccio va bene per:

- demo personali
- prototipi
- uso controllato da parte del singolo giocatore

Non va bene per:

- distribuire una tua chiave segreta
- un sito pubblico in cui vuoi proteggere credenziali, rate limit o costi

Per una versione più robusta, in futuro conviene spostare la chiamata API dietro un piccolo backend o proxy serverless.

## Giochi inclusi

### Dilemma del prigioniero

- `C/C = 3,3`
- `D/C = 5,0`
- `C/D = 0,5`
- `D/D = 1,1`

### Gioco del pollo

- `C/C = 2,2`
- `D/C = 4,1`
- `C/D = 1,4`
- `D/D = 0,0`

### Stag Hunt

- `C/C = 4,4`
- `D/C = 3,0`
- `C/D = 0,3`
- `D/D = 2,2`

### Battle of the Sexes

- `C/C = 3,2`
- `D/C = 0,0`
- `C/D = 0,0`
- `D/D = 2,3`

## Estensioni naturali

- aggiungere altri giochi statici nello stesso formato
- mostrare una spiegazione opzionale della strategia dell'LLM
- esportare lo storico della partita
- aggiungere un seed o una "persona strategica" per l'LLM
