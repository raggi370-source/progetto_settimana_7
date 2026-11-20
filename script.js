// SportsHub — Week Project Settimana VII
//
// Devi fare 4 cose per la Versione Base:
// 1. Definire le classi Squadra ed Evento (mappano i dati di TheSportsDB)
// 2. Funzione async cercaSquadre(query) che chiama /searchteams.php
// 3. Funzione async caricaDettagli(idTeam) che chiama in parallelo
//    eventsnext.php + eventslast.php usando Promise
// 4. Render dinamico: card squadre, lista prossimi eventi, lista risultati
//
// Endpoint base: https://www.thesportsdb.com/api/v1/json/3/
// Il `3` nell'URL è la chiave API pubblica di test di TheSportsDB: gratis, non serve registrarsi.
//



// Per le versioni Intermedia/Avanzata: localStorage preferiti, debounce, Promise.all multi.
const API_BASE = "https://www.thesportsdb.com/api/v1/json/123";

//Classi API

class Squadra {
  constructor(dati) {
    this.id = dati.idTeam;
    this.nome = dati.strTeam;
    this.logo = dati.strBadge;
    this.lega = dati.strLeague ?? "—";
    this.paese = dati.strCountry ?? "—";
    this.sport = dati.strSport;
  }
}

class Evento {
  constructor(dati) {
    this.nome = dati.strEvent ?? "Evento";
    this.data = dati.dateEvent ?? "Data non disponibile";
    this.ora = dati.strTime ?? "—";
    this.lega = dati.strLeague ?? "—";
    this.stagione = dati.strSeason ?? "—";
    this.stadio = dati.strVenue ?? "—";
    this.casa = dati.strHomeTeam ?? "—";
    this.ospite = dati.strAwayTeam ?? "—";

    const golCasa = dati.intHomeScore ?? "—";
    const golOspite = dati.intAwayScore ?? "—";
    this.risultato = golCasa + " - " + golOspite;
  }
}

//Modal evento

function apriModalEvento(evento) {
  const modalElemento = document.querySelector("#modal-evento");
  const titolo = document.querySelector("#modal-titolo");
  const corpo = document.querySelector("#modal-corpo");

  if (!modalElemento || !titolo || !corpo) {
    console.error("Controlla che il modal e i suoi ID siano presenti nell'HTML.");
    return;
  }

  titolo.textContent = evento.casa + " vs " + evento.ospite;
  corpo.replaceChildren();

  const dettagli = [
    ["Data:", evento.data],
    ["Ora:", evento.ora],
    ["Risultato:", evento.risultato],
    ["Lega:", evento.lega],
    ["Stagione:", evento.stagione],
    ["Stadio:", evento.stadio]
  ];

  for (const [etichetta, valore] of dettagli) {
    const paragrafo = document.createElement("p");
    const forte = document.createElement("strong");

    forte.textContent = etichetta + " ";
    paragrafo.append(forte, document.createTextNode(valore || "Non disponibile"));
    corpo.append(paragrafo);
  }

  bootstrap.Modal.getOrCreateInstance(modalElemento).show();
}

//Richieste API

async function cercaSquadre(query) {
  const url =
    API_BASE + "/searchteams.php?t=" + encodeURIComponent(query);

  const risposta = await fetch(url);
  const dati = await risposta.json();
  const squadre = [];

  if (dati.teams) {
    for (const datiSquadra of dati.teams) {
      squadre.push(new Squadra(datiSquadra));
    }
  }

  return squadre;
}

async function caricaDettagli(idTeam) {
  const [rispostaProssimi, rispostaPrecedenti] = await Promise.all([
    fetch(API_BASE + "/eventsnext.php?id=" + idTeam),
    fetch(API_BASE + "/eventslast.php?id=" + idTeam)
  ]);

  const [datiProssimi, datiPrecedenti] = await Promise.all([
    rispostaProssimi.json(),
    rispostaPrecedenti.json()
  ]);

  const prossimi = [];
  const precedenti = [];

  if (datiProssimi.events) {
    for (const datiEvento of datiProssimi.events) {
      prossimi.push(new Evento(datiEvento));
    }
  }

  const risultatiPrecedenti =
    datiPrecedenti.results || datiPrecedenti.events || [];

  for (const datiEvento of risultatiPrecedenti) {
    precedenti.push(new Evento(datiEvento));
  }

  return {
    prossimi: prossimi,
    precedenti: precedenti
  };
}

//Preferiti 
function aggiornaMessaggioPreferiti() {
  const contenitore = document.querySelector("#preferiti");
  const messaggio = document.querySelector(".para_prefe");

  if (!contenitore || !messaggio) return;

  messaggio.hidden = contenitore.children.length !== 0;
}

function aggiungiAiPreferiti(card, squadra, bottonePreferiti) {
  const preferiti = document.querySelector("#preferiti");

  if (!preferiti) {
    console.error("Manca l'elemento HTML con id='preferiti'.");
    return;
  }

  preferiti.append(card);
  bottonePreferiti.remove();

  const bottoneRimuovi = document.createElement("button");
  bottoneRimuovi.type = "button";
  bottoneRimuovi.className = "bottone-rimuovi";
  bottoneRimuovi.textContent = "Rimuovi dai preferiti";
  card.append(bottoneRimuovi);

  bottoneRimuovi.addEventListener("click", (evento) => {
    evento.stopPropagation();

    document.querySelector("#squadre").append(card);
    bottoneRimuovi.remove();
    card.append(bottonePreferiti);
    aggiornaMessaggioPreferiti();
  });

  aggiornaMessaggioPreferiti();
}

//Mostra squadre

function mostraSquadre(squadre) {
  const contenitore = document.querySelector("#squadre");
  const messaggio = document.querySelector("#messaggio");

  contenitore.replaceChildren();

  if (squadre.length === 0) {
    messaggio.textContent = "Nessuna squadra trovata.";
    return;
  }

  messaggio.textContent = "";

  for (const squadra of squadre) {
    const card = document.createElement("div");
    card.className = "card-squadra";
    card.dataset.sport = squadra.sport;

    const logo = document.createElement("img");
    logo.className="img_"
    if (squadra.logo) {
      logo.src = squadra.logo;
      logo.alt = "Stemma " + squadra.nome;
      card.append(logo);
    }

    const nome = document.createElement("span");
    nome.className = "nome_squadra";
    nome.textContent = squadra.nome;
    card.append(nome);

    const lega = document.createElement("p");
    lega.className = "seria";
    lega.textContent = squadra.lega;
    card.append(lega);

    const paese = document.createElement("p");
    paese.className = "paese";
    paese.textContent = squadra.paese;
    card.append(paese);

    const bottonePreferiti = document.createElement("button");
    bottonePreferiti.type = "button";
    bottonePreferiti.className = "bottone_preferiti";
    bottonePreferiti.textContent = "Aggiungi ai preferiti";
    card.append(bottonePreferiti);

    card.addEventListener("click", () => selezionaSquadra(squadra));

    bottonePreferiti.addEventListener("click", (evento) => {
      evento.stopPropagation();
      aggiungiAiPreferiti(card, squadra, bottonePreferiti);
    });

    contenitore.append(card);
  }
}

//Mostra eventi 

function mostraListaEventi(selettore, eventi, sonoRisultati = false) {
  const lista = document.querySelector(selettore);
  lista.replaceChildren();

  if (eventi.length === 0) {
    const voce = document.createElement("li");
    voce.textContent = "Nessun evento trovato.";
    lista.append(voce);
    return;
  }

  for (const evento of eventi) {
    const voce = document.createElement("li");
    voce.className = "lista_risultati";
    voce.style.cursor = "pointer";

    const data = document.createElement("small");
    data.className = "data-evento";
    data.textContent = evento.data;

    const partita = document.createElement("span");
    partita.className = "nome-partita";
    partita.textContent = evento.casa + " vs " + evento.ospite;

    voce.append(data, partita);

    if (sonoRisultati) {
      const punteggio = document.createElement("span");
      punteggio.className = "punteggio";
      punteggio.textContent = evento.risultato;
      voce.append(punteggio);
    }

    // Il click apre i dettagli di questo singolo evento
    voce.addEventListener("click", () => apriModalEvento(evento));

    lista.append(voce);
  }
}

//Seleziona squadra 

async function selezionaSquadra(squadra) {
  const sezioneDettagli = document.querySelector("#dettagli-section");
  const titolo = document.querySelector("#titolo-squadra");
  const messaggio = document.querySelector("#messaggio");

  sezioneDettagli.hidden = false;
  titolo.textContent = squadra.nome;
  messaggio.textContent = "Caricamento eventi...";

  try {
    const dettagli = await caricaDettagli(squadra.id);

    mostraListaEventi("#prossimi-eventi", dettagli.prossimi);
    mostraListaEventi("#risultati", dettagli.precedenti, true);

    messaggio.textContent = "";
  } catch (errore) {
    messaggio.textContent = "Non è stato possibile caricare gli eventi.";
    console.error(errore);
  }
}

//Ricerca

async function eseguiRicerca() {
  const input = document.querySelector("#cerca");
  const messaggio = document.querySelector("#messaggio");
  const query = input.value.trim();

  if (!query) {
    messaggio.textContent = "Scrivi il nome di una squadra da cercare.";
    return;
  }

  messaggio.textContent = "Ricerca in corso...";

  try {
    const squadre = await cercaSquadre(query);
    mostraSquadre(squadre);
  } catch (errore) {
    messaggio.textContent = "La ricerca non è riuscita.";
    console.error(errore);
  }
}

document.querySelector("#cerca_button")
  .addEventListener("click", eseguiRicerca);

document.querySelector("#cerca")
  .addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
      eseguiRicerca();
    }
  });
//Ricerca live
  let timerRicerca;

document.querySelector("#cerca").addEventListener("input", () => {
  clearTimeout(timerRicerca);

  const query = document.querySelector("#cerca").value.trim();

  if (query === "") {
    document.querySelector("#squadre").replaceChildren();
    document.querySelector("#messaggio").textContent = "";
    return;
  }

  timerRicerca = setTimeout(() => {
    eseguiRicerca();
  }, 400);
});

//Filtri dei preferiti

function filtraPreferiti(sport) {
  const cards = document.querySelectorAll("#preferiti .card-squadra");

  for (const card of cards) {
    card.hidden = !(sport === "tutti" || card.dataset.sport === sport);
  }
}

for (const bottone of document.querySelectorAll(".filtro")) {
  bottone.addEventListener("click", () => {
    filtraPreferiti(bottone.dataset.sport);
  });
}

aggiornaMessaggioPreferiti();