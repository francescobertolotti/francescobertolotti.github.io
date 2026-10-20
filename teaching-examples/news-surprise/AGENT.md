# Istruzioni per l’agente che aggiorna le notizie

## Obiettivo

Aggiorna `news.json` con un’edizione di **5 notizie reali, recenti, verificabili e distribuite nel mondo**. Il file alimenta un’attività didattica in cui gli studenti valutano quanto una notizia li sorprenda e quanto sembri vera.

Sostituisci sempre tutte le notizie dimostrative: non aggiungere le notizie reali in coda a quelle fittizie.

## Composizione obbligatoria dell’edizione

Inserisci esattamente una notizia per ciascuna di queste aree:

1. **Italia** — fatto avvenuto principalmente in Italia.
2. **USA** — fatto avvenuto principalmente negli Stati Uniti.
3. **Europa** — fatto avvenuto in un paese europeo diverso dall’Italia.
4. **Africa** — fatto avvenuto in un paese africano chiaramente indicato.
5. **Asia** — fatto avvenuto in un paese asiatico chiaramente indicato.

L’insieme deve inoltre rispettare tutti questi vincoli:

- esattamente **2 notizie politiche** e 3 non politiche;
- nessuna notizia di sport;
- nessuna notizia di moda;
- paesi, temi e protagonisti diversi tra loro;
- preferenza per scienza, tecnologia, ambiente, salute pubblica, cultura, società ed economia;
- niente curiosità irrilevanti scelte soltanto perché bizzarre;
- niente duplicati o cinque prospettive sullo stesso evento.

Considera politica una notizia il cui nucleo riguarda governi, partiti, elezioni, leggi, politiche pubbliche, diplomazia o conflitti. Imposta `political` di conseguenza.

## Ricerca e verifica

1. Cerca fatti pubblicati preferibilmente negli ultimi 7 giorni e comunque non oltre gli ultimi 14, salvo eventi ancora in corso e chiaramente aggiornati.
2. Verifica ogni notizia con almeno due fonti indipendenti affidabili, oppure con una fonte primaria e una testata giornalistica affidabile.
3. Usa link diretti agli articoli o ai comunicati: non usare homepage, pagine di ricerca o risultati di motori di ricerca.
4. Controlla che titolo, luogo, data, persone, cifre e stato dell’evento coincidano tra le fonti.
5. Distingui ciò che è già accaduto da annunci, proposte, previsioni e dichiarazioni.
6. Se una notizia non è sufficientemente verificabile, scartala e cercane un’altra. Non colmare lacune inventando dettagli.

## Scrittura

- Scrivi in italiano chiaro e neutrale.
- Formula titolo, sommario e corpo con parole originali: non copiare lunghi passaggi dalle fonti.
- Mantieni il titolo sotto 110 caratteri, il sommario entro 40 parole e il corpo entro 90 parole.
- Non rivelare se una notizia “sembra vera” o “sembra falsa”: la valutazione spetta agli studenti.
- Non usare toni sensazionalistici, domande retoriche o formule acchiappa-clic.
- Riporta l’incertezza quando le fonti la riportano.
- Non inserire immagini: il prototipo non ne prevede.

## Formato di `news.json`

Mantieni esattamente questa struttura generale e produci JSON valido, senza commenti Markdown:

```json
{
  "edition": "Edizione del 20 ottobre 2026",
  "updatedAt": "2026-10-20T09:00:00+02:00",
  "items": [
    {
      "id": "2026-10-20-paese-breve-descrizione",
      "region": "Italia",
      "country": "Italia",
      "category": "Ambiente",
      "political": false,
      "headline": "Titolo della notizia",
      "summary": "Sommario breve della notizia.",
      "body": "Testo sintetico della notizia, riscritto e verificato.",
      "publishedAt": "2026-10-20",
      "isDemo": false,
      "sources": [
        {
          "name": "Nome della prima fonte",
          "url": "https://esempio.org/articolo"
        },
        {
          "name": "Nome della seconda fonte",
          "url": "https://esempio.com/verifica"
        }
      ]
    }
  ]
}
```

Regole tecniche:

- `edition` deve indicare la data dell’aggiornamento.
- `updatedAt` deve essere una data e ora ISO 8601 con fuso orario.
- `items` deve contenere esattamente 5 oggetti.
- `id` deve essere stabile, univoco e composto da data e parole minuscole separate da trattini.
- `region` deve essere uno tra `Italia`, `USA`, `Europa`, `Africa`, `Asia`, usato una sola volta.
- `publishedAt` deve usare il formato `AAAA-MM-GG`.
- `isDemo` deve essere sempre `false` per le notizie reali.
- `sources` deve contenere almeno 2 fonti verificate con URL `https://`.
- Non modificare `index.html` o `app.js` se la struttura JSON resta invariata.

## Controllo finale prima di salvare

- [ ] Ci sono esattamente 5 notizie.
- [ ] Le cinque aree richieste compaiono una volta ciascuna.
- [ ] Esattamente 2 notizie hanno `political: true`.
- [ ] Non ci sono sport o moda.
- [ ] Tutte le notizie sono reali, recenti e sostenute da almeno 2 fonti.
- [ ] Nessun elemento ha `isDemo: true`.
- [ ] Tutti gli ID sono univoci.
- [ ] Il JSON è valido e l’interfaccia lo carica senza errori.
