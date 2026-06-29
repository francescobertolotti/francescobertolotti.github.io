# MNIST in allenamento

Piccola demo statica pensata per spiegare il principio dell'addestramento di una rete neurale senza entrare nei dettagli tecnici della backpropagation.

## Cosa mostra

- Una cifra MNIST alla volta, presa da un campione locale di 3000 immagini.
- Una rete neurale semplificata con 12 neuroni nascosti e 10 neuroni di uscita.
- Nodi colorati in base all'attivazione sulla cifra corrente.
- Collegamenti colorati in base al peso.
- Possibilita di cliccare un nodo, modificarne il bias e forzarne manualmente l'attivazione per l'esempio corrente.

## Struttura

- `index.html`: interfaccia e testo didattico.
- `styles.css`: stile responsive, pronto per telefono e desktop.
- `app.js`: logica della simulazione e visualizzazione.
- `data/mnist-sample-3000.json`: 3000 esempi MNIST salvati nel repository.

## Avvio locale

Puoi servire la cartella con un server statico semplice, per esempio:

```bash
python3 -m http.server 8000
```

Poi apri `http://127.0.0.1:8000/`.

## Pubblicazione su GitHub Pages

1. Crea un repository GitHub e carica questi file.
2. Nelle impostazioni del repository attiva GitHub Pages sulla branch principale.
3. Usa l'URL pubblicato da GitHub Pages come destinazione del QR code.

## Nota didattica

La demo usa davvero un piccolo aggiornamento dei pesi a ogni esempio, ma l'interfaccia racconta il fenomeno in modo intuitivo: la rete vede esempi, cambia i propri collegamenti e migliora gradualmente.
