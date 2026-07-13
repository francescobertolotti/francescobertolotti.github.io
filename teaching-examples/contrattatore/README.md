# Contrattatore

Mini app statica per GitHub Pages: l'utente inserisce la propria OpenAI API key, passa un link Amazon, ottiene un profilo prodotto e tratta con un venditore LLM.

## Come usarla

1. Pubblica questi file su GitHub Pages.
2. Apri il sito.
3. Inserisci una `OpenAI API key`.
4. Incolla un link Amazon e premi `Analizza link`.
5. Correggi se serve `nome`, `prezzo` o `descrizione`.
6. Premi `Avvia partita`.
7. Tratta il prezzo nella chat.

## Note pratiche

- Il parsing del link Amazon prova a leggere la pagina, ma spesso Amazon blocca il fetch lato browser.
- Quando succede, l'app usa un fallback basato su URL e segnali parziali, poi puoi correggere i campi manualmente.
- Gli stati interni e la cronologia restano in `localStorage`.
- La chiave API resta nel browser dell'utente e non passa da un backend tuo.
