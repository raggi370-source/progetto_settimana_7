# SportsHub

Web app per cercare squadre sportive e consultare le prossime partite e gli ultimi risultati. I dati arrivano dall'API pubblica [TheSportsDB](https://www.thesportsdb.com/).

## Funzionalità

- **Ricerca live**: le squadre vengono cercate mentre si scrive, senza dover premere "Cerca" (il pulsante resta disponibile).
- **Card squadra**: stemma, nome, lega e paese, generate dinamicamente.
- **Dettagli squadra**: cliccando una card si caricano in parallelo i prossimi eventi e gli ultimi risultati.
- **Modal evento**: cliccando una partita si apre una finestra con data, ora, risultato, lega, stagione e stadio.
- **Preferiti**: ogni squadra può essere aggiunta o rimossa dai preferiti.
- **Filtri per sport**: i preferiti si filtrano per Calcio, Basket e Football.

## Tecnologie

| Tecnologia | Utilizzo |
|---|---|
| **HTML5** | Struttura: header con ricerca, filtri, preferiti, risultati, dettagli e modal |
| **CSS3** | Stile delle card e transizioni (`transition`, `transform`) per rendere graduali gli effetti hover sui bottoni |
| **Bootstrap 5** | Layout responsive (griglia `col-sm`), componente Modal |
| **JavaScript (ES6+)** | Classi, `async/await`, `fetch`, `Promise.all`, manipolazione del DOM |
| **TheSportsDB API** | Fonte dei dati su squadre ed eventi |

## Struttura del codice

**Classi**
- `Squadra` e `Evento`: trasformano i dati grezzi dell'API in oggetti con campi puliti e valori di default.

**Chiamate API**
- `cercaSquadre(query)`: cerca le squadre per nome (`searchteams.php`).
- `caricaDettagli(idTeam)`: recupera in parallelo, con `Promise.all`, prossimi eventi e risultati precedenti a partire dall'ID della squadra.

**Rendering**
- `mostraSquadre(squadre)`: crea le card con `createElement`, senza `innerHTML`, e gestisce i bottoni aggiungi/rimuovi preferiti.
- `mostraListaEventi(selettore, eventi)`: costruisce le liste di prossimi eventi e risultati.
- `selezionaSquadra(squadra)`: gestisce il click su una card e carica i dettagli.
- `apriModalEvento(evento)`: riempie e apre il modal con i dati della partita.

**Preferiti e filtri**
- `filtraPreferiti(sport)`: mostra solo le card dei preferiti dello sport scelto, usando l'attributo `data-sport`.
- `aggiornaMessaggioPreferiti()`: mostra o nasconde il messaggio "nessuna squadra salvata".

## Difficoltà incontrate

- **API asincrone**: capire `fetch`, `async/await` e il formato delle risposte JSON è stata la parte più impegnativa.
- **Filtro preferiti**: inizialmente non trovava nulla perché le card non avevano l'attributo `data-sport`. Salvando lo sport nella card, il filtro ha funzionato.
- **Creazione del DOM senza `innerHTML`**: più lunga da scrivere, ma più sicura e controllabile rispetto all'inserimento di stringhe HTML.

## Possibili miglioramenti

- Salvare i preferiti in `localStorage`, così non si perdono al refresh.
- Aggiungere il **debounce** alla ricerca live per ridurre le richieste all'API.
- Evitare i duplicati tra risultati di ricerca e preferiti.
- Creare un unico helper per costruire gli elementi del DOM ed evitare codice ripetuto.

## Extra implementati

Oltre alla versione base (classi, ricerca, caricamento in parallelo dei dettagli e render dinamico), ho aggiunto:

- **Filtro per sport sui preferiti**: i bottoni Tutti, Basket, Calcio e Football mostrano o nascondono le card salvate tra i preferiti. Ogni card porta con sé lo sport tramite l'attributo `data-sport`, che il filtro confronta con quello del bottone premuto.
- **Modal dettagli evento**: cliccando su una partita, nei prossimi eventi o nei risultati, si apre un modal Bootstrap con data, ora, risultato, lega, stagione e stadio. Per questo la classe `Evento` è stata estesa con i campi `ora`, `lega`, `stagione` e `stadio`.