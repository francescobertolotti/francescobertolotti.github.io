# Generatore Prove ADSS (JavaScript)

Questo progetto:
- legge tutte le prove PDF in `testi_vecchi/`
- genera due file Markdown di analisi in `analysis/`
- usa un LLM (`gpt-5-mini`) per creare nuove prove
- espone una GUI con bottone per lanciare analisi e generazione

## Setup

1. Installa dipendenze:
```bash
npm install
```

2. Configura variabili ambiente:
```bash
cp .env.example .env
```
Compila `OPENAI_API_KEY` in `.env`.

3. Genera i file di analisi:
```bash
npm run analyze
```

4. Avvia l'interfaccia:
```bash
npm start
```

Apri `http://localhost:3000`.

## Deploy GitHub Pages (solo push)

Il progetto ora supporta due modalità automatiche:
- `backend mode` (locale/server Node): usa `src/server.js`.
- `static mode` (GitHub Pages): genera la prova direttamente nel browser.

Per GitHub Pages è già pronto il workflow:
- `.github/workflows/deploy-pages.yml`

Passi:
1. Pusha il repository su GitHub nel branch `main`.
2. In GitHub vai su `Settings -> Secrets and variables -> Actions`.
3. Crea il secret:
   - `OPENAI_API_KEY` = tua chiave OpenAI.
4. (Opzionale) Crea le repository variables:
   - `OPENAI_MODEL` (default: `gpt-5-mini`)
   - `OPENAI_BASE_URL` (default: `https://api.openai.com/v1`)
5. In `Settings -> Pages` seleziona `Build and deployment: GitHub Actions`.
6. Esegui push: il workflow pubblica la cartella `dist` su Pages.

Note importanti:
- Su GitHub Pages non esiste backend Node/Express.
- I feedback backend non sono disponibili in static mode.
- Se metti la chiave direttamente in frontend, la chiave è leggibile lato client. Il workflow la inietta nel bundle statico, quindi usa questa modalità solo se accetti questo rischio.

## Output principali

- `analysis/tipi_domande.md`
- `analysis/stile_esame.md`
- `output/generated/*.md` (traccia testuale)
- `output/generated/*.pdf` (traccia formattata stile base prove)
- `output/generated/*.xlsx` (file Excel associato con celle output in giallo)
- `docs/software-flow.mmd` (diagramma di flusso Mermaid)
