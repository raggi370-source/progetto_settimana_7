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


// La classe trasforma i dati ricevuti dall'API in un oggetto Squadra.
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

// Stessa idea per i dati di una partita.
class Evento {
    constructor(dati) {
        this.nome = dati.strEvent ?? "Evento";
        this.data = dati.dateEvent ?? "Data non disponibile";
        this.casa = dati.strHomeTeam ?? "—";
        this.ospite = dati.strAwayTeam ?? "—";

        const golCasa = dati.intHomeScore ?? "—";
        const golOspite = dati.intAwayScore ?? "—";
        this.risultato = `${golCasa} - ${golOspite}`;
    }
}

// Cerca le squadre in base al testo inserito.
async function cercaSquadre(query) {
    const url = API_BASE + "/searchteams.php?t=" + encodeURIComponent(query);
    const response = await fetch(url);
    const dati = await response.json();

    const squadre = [];

    if (dati.teams) {
        for (const squadra of dati.teams) {
            squadre.push(new Squadra(squadra));
        }
    }

    return squadre;
}

// Carica insieme gli eventi futuri e quelli passati usando l'ID della squadra.
async function caricaDettagli(idTeam) {
    
    const [rispostaProssimi, rispostaPrecedenti] = await Promise.all([
        fetch(API_BASE + "/eventsnext.php?id=" + idTeam),
        fetch(API_BASE + "/eventslast.php?id=" + idTeam)
    ]);
    const [datiProssimi, datiPrecedenti] = await Promise.all([
        rispostaProssimi.json(),
        rispostaPrecedenti.json()
    ]);

    // Crea due liste vuote
    const prossimi = [];
    const precedenti = [];

    // Aggiunge alla prima lista gli eventi futuri
    if (datiProssimi.events) {
        for (const evento of datiProssimi.events) {
            prossimi.push(new Evento(evento));
        }
    }

    // Aggiunge alla seconda lista gli eventi precedenti
    if (datiPrecedenti.results) {
        for (const evento of datiPrecedenti.results) {
            precedenti.push(new Evento(evento));
        }
    } else if (datiPrecedenti.events) {
        for (const evento of datiPrecedenti.events) {
            precedenti.push(new Evento(evento));
        }
    }

    // Restituisce entrambe le liste
    return {
        prossimi: prossimi,
        precedenti: precedenti
    };
}

// Mostra le card delle squadre trovate.
function mostraSquadre(squadre) {
    const contenitore = document.querySelector("#squadre");
    contenitore.replaceChildren();

    if (squadre.length === 0) {
        document.querySelector("#messaggio").textContent = "Nessuna squadra trovata.";
        return;
    }


    for (const squadra of squadre) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "card-squadra";

        const nome_squadra = document.createElement("span");
        nome_squadra.className = "nome_squadra"
        nome_squadra.textContent = squadra.nome;
        card.append(nome_squadra);


        if (squadra.logo) {
            const logo = document.createElement("img");
            logo.src = squadra.logo;
            logo.alt = `Stemma ${squadra.nome}`;
            logo.width = 60;
            card.prepend(logo);

        }
        //serie
        const pLega = document.createElement("p");
        pLega.className = "seria"
        pLega.textContent = squadra.lega
        card.append(pLega)
        //paese
        const pPaese = document.createElement("p");
        pPaese.className = "paese";
        pPaese.textContent = squadra.paese;
        card.append(pPaese);

        //bottone aggiungi hai preferiti
        const bPrefe = document.createElement("button")
        bPrefe.className = "bottone_preferiti"
        bPrefe.textContent = "Aggiungi preferiti"
        card.append(bPrefe)


        card.addEventListener("click", () => selezionaSquadra(squadra));
        contenitore.append(card);


        bPrefe.addEventListener("click", (evento) => {
            evento.stopPropagation();

            const sezionePreferiti = document.querySelector("#preferiti");


            sezionePreferiti.append(card);
            bPrefe.remove();

            const bottoneRimuovi = document.createElement("button");
            bottoneRimuovi.className = "bottone-rimuovi";
            bottoneRimuovi.textContent = "Rimuovi ";
            card.append(bottoneRimuovi);

            bottoneRimuovi.addEventListener("click", (evento) => {
                evento.stopPropagation();


                document.querySelector("#squadre").append(card);
                bottoneRimuovi.remove();


                card.append(bPrefe);
            });
        });

    }
}



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

        const data = document.createElement("small");
        data.className = "data-evento";
        data.textContent = evento.data;

        const partita = document.createElement("span");
        partita.className = "nome-partita";

        if (sonoRisultati) {
            partita.textContent = evento.casa + " vs " + evento.ospite;
        } else {
            partita.textContent = evento.casa + " vs " + evento.ospite;
        }

        voce.append(data, partita);

        if (sonoRisultati) {
            const punteggio = document.createElement("span");
            punteggio.className = "punteggio";
            punteggio.textContent = evento.risultato;
            voce.append(punteggio);
        }

        lista.append(voce);
    }
}

// Quando clicchi una card, passa l'ID della squadra alle due richieste eventi.

async function selezionaSquadra(squadra) {
    document.querySelector("#dettagli-section").hidden = false;
    document.querySelector("#titolo-squadra").textContent = squadra.nome;
    document.querySelector("#messaggio").textContent = "Caricamento eventi...";

    try {
        const dettagli = await caricaDettagli(squadra.id);

        mostraListaEventi("#prossimi-eventi", dettagli.prossimi);
        mostraListaEventi("#risultati", dettagli.precedenti, true);
        document.querySelector("#messaggio").textContent = "";
    } catch (errore) {
        document.querySelector("#messaggio").textContent = errore.message;
    }
}







// Avvia la ricerca quando premi il pulsante cerca.
const bottone = document.querySelector("#cerca_button")
bottone.addEventListener("click", async () => {
    const query = document.querySelector("#cerca").value.trim();

    if (!query) {
        document.querySelector("#messaggio").textContent =
            "Scrivi il nome di una squadra da cercare.";
        return;
    }

    document.querySelector("#messaggio").textContent = "Ricerca in corso...";

    try {
        const squadre = await cercaSquadre(query);
        mostraSquadre(squadre);
    } catch (errore) {
        document.querySelector("#messaggio").textContent = errore.message;
    }
});

const para_scritta = document.querySelector("#ptrovate")
const input_value = document.querySelector("#cerca")

input_value.addEventListener("input", async (evento) => {

    para_scritta.hidden = false;
    const query = evento.target.value.trim();

    if (query.length < 1) {
        document.querySelector("#squadre");
        document.querySelector("#messaggio").textContent = "";
        return;
    }

    try {
        const squadre = await cercaSquadre(query);
        mostraSquadre(squadre);
    } catch (errore) {
        document.querySelector("#messaggio").textContent = errore.message;
    }
});
// Filtro: agisce sulle card dei preferiti
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

// Mostra/nasconde il messaggio "nessun preferito"
function aggiornaMessaggioPreferiti() {
    const vuoto = document.querySelectorAll("#preferiti .card-squadra").length === 0;
    document.querySelector(".para_prefe").hidden = !vuoto;
}
aggiornaMessaggioPreferiti();