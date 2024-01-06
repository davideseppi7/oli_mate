const urlPaginaCorrente = window.location.href;
const partiUrl = urlPaginaCorrente.split('/');
const codice_gara = partiUrl[partiUrl.length - 1];
let id_gara=0;
if(codice_gara.substring(0,7)=="squadre"){
    const partiCode = codice_gara.split('e');
    id_gara = partiCode[partiCode.length - 1];
}else{
    id_gara=codice_gara;
}
if(partiUrl[partiUrl.length - 2]=="gara_live_live_storica"){
    document.querySelector(".storico-gare").classList.add('is-active');
}else{
    document.querySelector(".gara-live").classList.add('is-active');
}

let dati_nuova_gara={};

function calcolaDifferenzaOrario(orarioFornito) {
    // Otteniamo l'orario attuale
    const orarioAttuale = new Date();
  
    // Estraiamo l'orario fornito in hh e mm
    const [hh, mm] = orarioFornito.split(':').map(Number);
  
    // Creiamo un oggetto Data per l'orario fornito con l'anno, il mese e il giorno attuali
    const orarioFornitoData = new Date(orarioAttuale.getFullYear(), orarioAttuale.getMonth(), orarioAttuale.getDate(), hh, mm);
  
    // Calcoliamo la differenza in millisecondi
    const differenzaMillisecondi = orarioFornitoData - orarioAttuale;
  
    // Convertiamo la differenza in minuti e secondi
    const differenzaMinuti = Math.floor(differenzaMillisecondi / (1000 * 60));
    const differenzaSecondi = Math.floor((differenzaMillisecondi % (1000 * 60)) / 1000);
  
    return {
      minuti: differenzaMinuti,
      secondi: differenzaSecondi,
    };
}

function termina_gara(id_gara,inizio_eff_gara,durata_prog_gara){//termina solo a fine tempo
    const fine_eff_gara=aggiungiMinuti(inizio_eff_gara,durata_prog_gara);

    fetch('/termina_gara', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({"id_gara":id_gara,fine_eff_gara:fine_eff_gara})
    })
    .then(response => {
        render_gara_live();
    });
}

function aggiungiMinuti(orario, n) {
    // Dividi l'orario in ore e minuti
    var orarioParti = orario.split(":");
    var ore = parseInt(orarioParti[0], 10);
    var minuti = parseInt(orarioParti[1], 10);
  
    // Aggiungi i minuti
    minuti += n;
  
    // Calcola le ore e i minuti risultanti
    var oreRisultanti = Math.floor(minuti / 60);
    var minutiRisultanti = minuti % 60;
  
    // Aggiungi le ore risultanti alle ore originali
    ore += oreRisultanti;
  
    // Assicurati che le ore rimangano nell'intervallo 0-23
    ore = ore % 24;
  
    // Formatta l'orario risultante
    var orarioRisultante = (ore < 10 ? "0" : "") + ore + ":" + (minutiRisultanti < 10 ? "0" : "") + minutiRisultanti;
  
    return orarioRisultante;
}

function differenzaInMinuti(orario1, orario2) {
    // Converti gli orari in minuti totali dalla mezzanotte
    var orario1Parti = orario1.split(":");
    var orario2Parti = orario2.split(":");
    
    var minuti1 = parseInt(orario1Parti[0], 10) * 60 + parseInt(orario1Parti[1], 10);
    var minuti2 = parseInt(orario2Parti[0], 10) * 60 + parseInt(orario2Parti[1], 10);
    
    // Calcola la differenza in minuti
    var differenza = minuti2 - minuti1;
    
    return differenza;
}

function render_gara_live(){
    fetch('/get_object_gara', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({"id_gara":id_gara})
    })
    .then(response => response.json())
    .then(response => {
        dati_nuova_gara=response;
        if(response=="not exists"){
            document.querySelector(".table-container").innerHTML='<p align="center" style="font-size: x-large; color:var(--primary);">Codice inserito errato</p>';
        }else if(dati_nuova_gara["nome_dati_gara"]["giocata_gara"]==0){
            document.querySelector(".table-container").innerHTML='<p align="center" style="font-size: x-large; color:var(--primary);">Gara non ancora iniziata</p>';
        }else{
            fetch('/get_inizio_eff_durata_prog', {
            headers: {
                'Content-type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({"id_gara":id_gara})
            })
            .then(response => response.json())
            .then(response => {
                //inizio effettivo
                const {inizio_eff_gara}=response;
                const {durata_prog_gara}=response;
                fetch('/get_risposte_corrette', {
                    headers: {
                        'Content-type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({"id_gara":id_gara})
                })
                .then(response => response.json())
                .then(response => {
                    //tutte le risposte corrette ordinate per numero domanda, se più risposte corrette dalla stessa squadra —> quella che è stata inviata prima
                    const {risposte_corrette}=response;

                    fetch('/get_risposte_sbagliate_almeno_una_volta', {
                        headers: {
                            'Content-type': 'application/json'
                        },
                        method: 'POST',
                        body: JSON.stringify({"id_gara":id_gara})
                    })
                    .then(response => response.json())
                    .then(response => {
                        //per ogni risposta da quante squadre è stata sbagliata almeno 1 volata
                        const {risposte_sbagliate_almeno_una_volta}=response;
                        
                        fetch('/get_jolly', {
                            headers: {
                                'Content-type': 'application/json'
                            },
                            method: 'POST',
                            body: JSON.stringify({"id_gara":id_gara})
                        })
                        .then(response => response.json())
                        .then(response => {
                            //selezioni i jolly di ogni squadra, ordinati per le squadre e poi ora, elimino doppi, non controllo >10min
                            const {jolly}=response;

                            fetch('/get_risposte_sbagliate_squadre', {
                                headers: {
                                    'Content-type': 'application/json'
                                },
                                method: 'POST',
                                body: JSON.stringify({"id_gara":id_gara})
                            })
                            .then(response => response.json())
                            .then(response => {
                                //quante risposte sbagliate ha dato una squadra per ogni problema
                                const {risposte_sbagliate_squadre}=response;
                                const punti_problemi={};

                                //inizialmente ogni problema vale 20pt.
                                for(let i=0; i<dati_nuova_gara.testo_gara.length; i++){
                                    punti_problemi[i+1]=20;
                                }
                                
                                //fino a 20min dal termine +1pt fino a n risp. corrette (n=3 semif. n=2 fin.)
                                let n=2;
                                if(Number(dati_nuova_gara["nome_dati_gara"]["durata_prog_gara"])<=90){
                                    n=3;
                                }

                                //20esimo minuto compreso
                                const orario_fino_a_20_min_dal_termine=aggiungiMinuti(inizio_eff_gara,(Number(durata_prog_gara)-20)>0?(Number(durata_prog_gara)-20):0);
                                
                                //fino a 20min dal termine +1pt fino a n risp. corrette (n=3 semif. n=2 fin.)
                                let prev_domanda='';
                                let prev_risp_corrette=0;
                                let iterations=0;
                                let risposte_corrette_per_ogni_problema=[]

                                //creo una lista con sottoliste vuote in posizione i-1 di ogni problema i con le rispettive risposte corrette
                                for(let i=0; i<dati_nuova_gara.testo_gara.length; i++){
                                    risposte_corrette_per_ogni_problema[i]=[];
                                }

                                //inserisco tutte le risposte corrette nelle rispettive sottoliste (già in ordine cronologico per struttura della query)
                                for(const element of risposte_corrette){
                                    risposte_corrette_per_ogni_problema[element.numero_domanda-1].push(element);
                                }
                                
                                //ricavo l'ora corrente
                                const _currentTime = new Date();
                                const _hours = _currentTime.getHours().toString().padStart(2, '0');
                                const _minutes = _currentTime.getMinutes().toString().padStart(2, '0');
                                let ora_corrente=`${_hours}:${_minutes}`;
                                
                                //fino a 20min dal termine +1pt fino a n risp. corrette (n=3 semif. n=2 fin.)
                                let max_punti_tempo=differenzaInMinuti(inizio_eff_gara,orario_fino_a_20_min_dal_termine);//puti massimi =durata-20(perchè 1 pt.min -20 min finali)
                                max_punti_tempo=(max_punti_tempo>=0)?max_punti_tempo:0;//se la gara dura meno di 20 min i pt. sarebbero negativi
                                for(let i=0; i<dati_nuova_gara.testo_gara.length; i++){
                                    if (risposte_corrette_per_ogni_problema[i].length>=n){//se ho n o più risposte uso l'orario in posizione n-1(indici da 0)
                                        punti_problemi[risposte_corrette_per_ogni_problema[i][n-1].numero_domanda]+=differenzaInMinuti(inizio_eff_gara,risposte_corrette_per_ogni_problema[i][n-1].ora.substring(0,5));
                                    }else{
                                        if(dati_nuova_gara["nome_dati_gara"]["giocata_gara"]==2){//se non sono arrivane almeno n risposte e la gara è finita allora i punti sono aumentati fino alla fine
                                            const punti_tempo=differenzaInMinuti(inizio_eff_gara,aggiungiMinuti(inizio_eff_gara,durata_prog_gara));

                                            if(punti_tempo<=max_punti_tempo){//a 20 min dalla fine i pt. non aumentano
                                                punti_problemi[i+1]+=punti_tempo;
                                            }else{
                                                punti_problemi[i+1]+=max_punti_tempo;
                                            }
                                        }else{
                                            //il problema aumenta fino all'orario corrente
                                            const punti_tempo=differenzaInMinuti(inizio_eff_gara,ora_corrente);
                                            if(punti_tempo<=max_punti_tempo){//a 20 min dalla fine i pt. non aumentano
                                                punti_problemi[i+1]+=punti_tempo;
                                            }else{
                                                punti_problemi[i+1]+=max_punti_tempo;
                                            }
                                        }
                                    }
                                }

                                //+2pt. x ogni risposta sbagliata da 1 squadra almeno 1 volta
                                for(const element of risposte_sbagliate_almeno_una_volta){
                                    punti_problemi[element.numero_domanda]+=(element.errori*2);
                                }

                                //oggetto con tutte le squadre
                                const punti_squadre={};

                                for(const element of dati_nuova_gara.squadre_gara){
                                    //punti iniziali 10*numero donande
                                    punti_squadre[element]={};
                                    punti_squadre[element]["punti_totali"]=dati_nuova_gara.testo_gara.length*10;
                                    punti_squadre[element]["jolly"]=0;//jolly predefinito a 0 => nessuno
                                    for(let i=0; i<dati_nuova_gara.testo_gara.length; i++){
                                        //all'inizio ogni squadra ha fatto 0 pt. per ogni problema
                                        punti_squadre[element][i+1]=0;
                                    }
                                    punti_squadre[element]["blinking"]=[];//aggiungo l'array che verrà popolato con i problemi da far lampeggiare
                                }

                                //se passati 10 min da inizio inserisco 1 come jolly
                                const currentTime = new Date();
                                const hours = currentTime.getHours().toString().padStart(2, '0');
                                const minutes = currentTime.getMinutes().toString().padStart(2, '0');
                                const current_time=`${hours}:${minutes}`;
                                const orario_dopo_10_min=aggiungiMinuti(inizio_eff_gara,10);
                                if(current_time>=orario_dopo_10_min){
                                    let squadre_con_jolly=[];
                                    for(const element of jolly){
                                        if(element.ora<orario_dopo_10_min){
                                            squadre_con_jolly.push(element.nome_squadra);
                                        }
                                    }
                                    if(squadre_con_jolly.length!==dati_nuova_gara.squadre_gara.length){//se la lunghezza è diversa qualcuno non ha consegnato il jolly
                                        for(const element of dati_nuova_gara.squadre_gara){
                                            if(!squadre_con_jolly.includes(element)){
                                                //inserisco un nuovo jolly
                                                const nuovo_jolly={};
                                                nuovo_jolly["nome_squadra"]=element;
                                                nuovo_jolly["numero_domanda"]=1;
                                                nuovo_jolly["ora"]=aggiungiMinuti(inizio_eff_gara,9);
                                                nuovo_jolly["id_gara"]=id_gara;
                                                if(nuovo_jolly["nome_squadra"]&&nuovo_jolly["numero_domanda"]){
                                                    fetch('/inserisci_nuovo_jolly', {
                                                        headers: {
                                                            'Content-type': 'application/json'
                                                        },
                                                        method: 'POST',
                                                        body: JSON.stringify({ nuovo_jolly : nuovo_jolly})
                                                    })
                                                    .then(response => {
                                                        response.json();
                                                    });
                                                }
                                            }
                                        }
                                        render_gara_live();
                                    }
                                }
                                
                                //calcolo l'ultima risposta che è stata data, per capire la stiuazione precedente e => disegnare le freccie laterali
                                const ultima_risposta_data={}
                                //(se ho risposte corrette e non ne ho di sabgliate) o (se ho risposte sia giunste che sabgliate; e l'ultima giunsta è stata registrata temporalmente dopo l'ultima sbagliata)
                                if((risposte_corrette.length!=0 && risposte_sbagliate_squadre.length==0) || (risposte_corrette.length!=0 && risposte_sbagliate_squadre.length!=0 && risposte_corrette[risposte_corrette.length-1].ora>=risposte_sbagliate_squadre[risposte_sbagliate_squadre.length-1].ora)){
                                    ultima_risposta_data["corretta"]=1;
                                    ultima_risposta_data["nome_squadra"]=risposte_corrette[risposte_corrette.length-1].nome_squadra;
                                    ultima_risposta_data["numero_domanda"]=risposte_corrette[risposte_corrette.length-1].numero_domanda;
                                    ultima_risposta_data["ora"]=risposte_corrette[risposte_corrette.length-1].ora;
                                }else if((risposte_sbagliate_squadre.length!=0 && risposte_corrette.length==0) || (risposte_sbagliate_squadre.length!=0 && risposte_corrette.length!=0 && risposte_sbagliate_squadre[risposte_sbagliate_squadre.length-1].ora>=risposte_corrette[risposte_corrette.length-1].ora)){
                                    //(se ho risposte sbagliate e non ne ho di corrette) o (se ho risposte sia giunste che sabgliate; e l'ultima sbagliata è stata registrata temporalmente dopo l'ultima giusta)
                                    ultima_risposta_data["corretta"]=0;
                                    ultima_risposta_data["nome_squadra"]=risposte_sbagliate_squadre[risposte_sbagliate_squadre.length-1].nome_squadra;
                                    ultima_risposta_data["numero_domanda"]=risposte_sbagliate_squadre[risposte_sbagliate_squadre.length-1].numero_domanda;
                                    ultima_risposta_data["ora"]=risposte_sbagliate_squadre[risposte_sbagliate_squadre.length-1].ora;
                                }
                                const prev_punti_squadre=JSON.parse(JSON.stringify(punti_squadre));//creo una depp copy

                                //assegno punti a problemi per risposte giuste, considero anche jolly
                                for(const element of risposte_corrette){
                                    //controllo se quella risposta, data da quella squadra è stata da loro indicata come jolly prima della consegna di quella risposta (giusta)
                                    const valido_come_jolly = jolly.some(_jolly => {
                                        // Verifica se l'oggetto ha il nome_squadra e il numero_domanda di questa risposta e se l'orario di inserimento jolly è minore (considera anche i seconi => non considero il caso uguale)
                                        return _jolly.nome_squadra == element.nome_squadra && _jolly.numero_domanda == element.numero_domanda && _jolly.ora < element.ora;
                                    });

                                    if(valido_come_jolly){//se valido come jolly raddoppio i punti
                                        punti_squadre[element.nome_squadra][element.numero_domanda]+=punti_problemi[element.numero_domanda]*2;
                                        punti_squadre[element.nome_squadra]["punti_totali"]+=punti_problemi[element.numero_domanda]*2;

                                        //se l'ultima risposta è sbagliata allora inserisco tutte quelle corrette; altrimenti inserisco solo se non è l'ultima risposta
                                        if(ultima_risposta_data.corretta==0 || !(element.nome_squadra==ultima_risposta_data.nome_squadra && element.numero_domanda==ultima_risposta_data.numero_domanda && element.ora==ultima_risposta_data.ora)){
                                            prev_punti_squadre[element.nome_squadra][element.numero_domanda]+=punti_problemi[element.numero_domanda]*2;
                                            prev_punti_squadre[element.nome_squadra]["punti_totali"]+=punti_problemi[element.numero_domanda]*2;
                                        }
                                    }else{
                                        punti_squadre[element.nome_squadra][element.numero_domanda]+=punti_problemi[element.numero_domanda];
                                        punti_squadre[element.nome_squadra]["punti_totali"]+=punti_problemi[element.numero_domanda];

                                        //se l'ultima risposta è sbagliata allora inserisco tutte quelle corrette; altrimenti inserisco solo se non è l'ultima risposta
                                        if(ultima_risposta_data.corretta==0 || !(element.nome_squadra==ultima_risposta_data.nome_squadra && element.numero_domanda==ultima_risposta_data.numero_domanda && element.ora==ultima_risposta_data.ora)){
                                            prev_punti_squadre[element.nome_squadra][element.numero_domanda]+=punti_problemi[element.numero_domanda];
                                            prev_punti_squadre[element.nome_squadra]["punti_totali"]+=punti_problemi[element.numero_domanda];
                                        }
                                    }

                                    //fino a un minuto dopo l'inserimeto faccio lampeggiare il punteggio della risposta di quella squadra
                                    if((aggiungiMinuti(element.ora,1))>=current_time){
                                        punti_squadre[element.nome_squadra]["blinking"].push(element.numero_domanda);
                                    }
                                }

                                //tolgo punti a problemi con risposte sbagliate, considero anche jolly
                                for(const element of risposte_sbagliate_squadre){
                                    //controllo se quella risposta, data da quella squadra è stata da loro indicata come jolly prima della consegna di quella risposta (sbagliata)
                                    const valido_come_jolly = jolly.some(_jolly => {
                                        // Verifica se l'oggetto ha il nome_squadra e il numero_domanda di questa risposta e se l'orario di inserimento jolly è minore (considera anche i seconi => non considero il caso uguale)
                                        return _jolly.nome_squadra == element.nome_squadra && _jolly.numero_domanda == element.numero_domanda && _jolly.ora < element.ora;
                                    });

                                    if(valido_come_jolly){//se valido come jolly raddoppio i punti (in negativo)
                                        punti_squadre[element.nome_squadra][element.numero_domanda]-=10*2;
                                        punti_squadre[element.nome_squadra]["punti_totali"]-=10*2;

                                        //se l'ultima risposta è corretta allora inserisco tutte quelle sbagliate; altrimenti inserisco solo se non è l'ultima risposta
                                        if(ultima_risposta_data.corretta==1 || !(element.nome_squadra==ultima_risposta_data.nome_squadra && element.numero_domanda==ultima_risposta_data.numero_domanda && element.ora==ultima_risposta_data.ora)){
                                            prev_punti_squadre[element.nome_squadra][element.numero_domanda]-=10*2;
                                            prev_punti_squadre[element.nome_squadra]["punti_totali"]-=10*2;
                                        }
                                    }else{
                                        punti_squadre[element.nome_squadra][element.numero_domanda]-=10;
                                        punti_squadre[element.nome_squadra]["punti_totali"]-=10;

                                        //se l'ultima risposta è corretta allora inserisco tutte quelle sbagliate; altrimenti inserisco solo se non è l'ultima risposta
                                        if(ultima_risposta_data.corretta==1 || !(element.nome_squadra==ultima_risposta_data.nome_squadra && element.numero_domanda==ultima_risposta_data.numero_domanda && element.ora==ultima_risposta_data.ora)){
                                            prev_punti_squadre[element.nome_squadra][element.numero_domanda]-=10;
                                            prev_punti_squadre[element.nome_squadra]["punti_totali"]-=10;
                                        }
                                    }

                                    //fino a un minuto dopo l'inserimeto faccio lampeggiare il punteggio della risposta di quella squadra
                                    if((aggiungiMinuti(element.ora,1))>=current_time){
                                        punti_squadre[element.nome_squadra]["blinking"].push(element.numero_domanda);
                                    }
                                }

                                //inserisco quale jolly è stato scelto nell'arry punti_squadre che vine utilizzato per la visualizzazione finale
                                for(const element of jolly){
                                    punti_squadre[element.nome_squadra]["jolly"]=element.numero_domanda;//una squadra ha scelto un certo jolly
                                    prev_punti_squadre[element.nome_squadra]["jolly"]=element.numero_domanda;
                                }

                                //bonus prime squadre a dare la risposta corretta e bonus prime squadre a rispondere a tutte le domande
                                if(dati_nuova_gara["nome_dati_gara"]["giocata_gara"]==2){//se la gara è terminata mostro anche i bonus
                                    //bonus prime squadre a dare la risposta corretta
                                    let prev_domanda='';
                                    let prev_risp_corrette=0;
                                    const bonus_prima_risoluzione=[20,15,10,5,3]
                                    for(const element of risposte_corrette){
                                        if(!prev_domanda || prev_domanda!=element.numero_domanda){
                                            prev_domanda=element.numero_domanda;
                                            prev_risp_corrette=0;
                                        }
                                        if(element.numero_domanda==prev_domanda){
                                            prev_risp_corrette++;
                                            if(prev_risp_corrette<=5){//solo le prime 5 squdre che risolvono per prime un problema ricevono un bonus
                                                punti_squadre[element.nome_squadra][element.numero_domanda]+=bonus_prima_risoluzione[prev_risp_corrette-1];
                                                punti_squadre[element.nome_squadra]["punti_totali"]+=bonus_prima_risoluzione[prev_risp_corrette-1];
                                            }
                                        }
                                    }

                                    //bonus prime squadre a rispondere a tutte le domande
                                    fetch('/get_squadre_tutte_risposte_corrette', {
                                        headers: {
                                            'Content-type': 'application/json'
                                        },
                                        method: 'POST',
                                        body: JSON.stringify({"id_gara":id_gara})
                                    })
                                    .then(response => response.json())
                                    .then(response => {//codice ripetuto due volte perchè altimenti non aspetta l'esecuzione della query se la gara è terminata perchè il tutto viene eseguito in modo asincrono
                                        const {squadre_tutte_risposte_corrette}=response;
                                        const bonus_tutte_risposte_corrette=[50,30,20,15,10]
                                        let numero_squadre_tutte_risposte_corrette=0;
                                        for(const element of squadre_tutte_risposte_corrette){
                                            numero_squadre_tutte_risposte_corrette++;
                                            if(numero_squadre_tutte_risposte_corrette<=5){//solo le prime 5 squdre che risolvono per prime tutti i problemi
                                                punti_squadre[element.nome_squadra]["punti_totali"]+=bonus_tutte_risposte_corrette[numero_squadre_tutte_risposte_corrette-1];    
                                            }
                                        }

                                        let punti_squadre_parimerito=[]//calcolo un nuovo array perchè se a parimerito => chi ha fatto più pt. nel jolly, se pari nel primo problema con +pt ... (=>ordino i problemi secondo i punti, jolly separato)
                                        //{Squadra 1: {1: 40, 2: 0, 3: 37, punti_totali: 107, jolly: 3}...} trasformo questo in questo {Squadra 1: {punti_problemi:[40,37,0], punti_totali: 107, punti_jolly: 37}...}
                                        for(let chiave in punti_squadre){
                                            punti_squadre_parimerito.push({chiave: chiave, valori: {punti_problemi:[]}})
                                            for(let chiave_interna in punti_squadre[chiave]){
                                                if(chiave_interna=="punti_totali"){
                                                    punti_squadre_parimerito[punti_squadre_parimerito.length-1]["valori"]["punti_totali"]=punti_squadre[chiave][chiave_interna];
                                                }else if(chiave_interna==punti_squadre[chiave]["jolly"]){
                                                    punti_squadre_parimerito[punti_squadre_parimerito.length-1]["valori"]["punti_jolly"]=punti_squadre[chiave][chiave_interna];
                                                }else if(chiave_interna!="jolly"){//se la chaive è jolly (cioè il sui indice), non è un punteggio dei problemi
                                                    punti_squadre_parimerito[punti_squadre_parimerito.length-1]["valori"]["punti_problemi"].push(punti_squadre[chiave][chiave_interna]);
                                                }
                                            }
                                            //punti_squadre_parimerito=[{chiave: chiave, valori: {punti_problemi:[40,30,20,10,2...], punti_totali: {}, punti_jolly: 37}}]
                                        }

                                        //ordino gli array punti_problemi
                                        for(let i=0; i<punti_squadre_parimerito.length; i++){
                                            punti_squadre_parimerito[i]["valori"]["punti_problemi"].sort((a, b) => b - a);//ordine decrescente
                                        }

                                        //calcolo un array di oggetti che contengono: nome_squadra, punti_totali, punti_parimerito
                                        let punti_squadre_parimerito_finali=[]
                                        for(const element of punti_squadre_parimerito){
                                            punti_squadre_parimerito_finali.push({chiave: element.chiave, punti_totali:element.valori.punti_totali})
                                            let e=200;
                                            punti_squadre_parimerito_finali[punti_squadre_parimerito_finali.length-1]["punti_parimerito"]=element.valori.punti_totali*(10**e);
                                            //ogni elemento (in base alla sua importanza: prima jolly poi primo pb con + pt, secondo...)vine, prima di essere sommato, moltiplicato con 10^x (con x che diminuusce di 2 ogni volta => max 99 risposte)
                                            //=> chi ha totaliazzato parallelamente più pt. avrà un numero più grande
                                            for(const punti_problema in element.valori.punti_problemi){
                                                e-=2;
                                                punti_squadre_parimerito_finali[punti_squadre_parimerito_finali.length-1]["punti_parimerito"]+=punti_problema*(10**e);
                                            }
                                        }

                                        //punti_squadre

                                        // Ordina l'array in base ai valori
                                        punti_squadre_parimerito_finali.sort(function(a, b) {
                                            return b.punti_parimerito - a.punti_parimerito;
                                        });

                                        // Estrai solo le chiavi ordinate in un nuovo array
                                        var chiaviOrdinate = punti_squadre_parimerito_finali.map(function(coppia) {//squadre nell'ordine di vincita
                                            return coppia.chiave;
                                        });

                                        //creao tabella
                                        const min_sec =calcolaDifferenzaOrario(aggiungiMinuti(inizio_eff_gara,Number(durata_prog_gara)));
                                        const {minuti}=min_sec;
                                        const {secondi}=min_sec;

                                        let gara_html='';
                                        gara_html+=`<p align="center" class="container-titolo-gara-live"> <span class="titolo-gara-live">${dati_nuova_gara["nome_dati_gara"]["nome_gara"]} </span><span class="data-gara-live">(${dati_nuova_gara["nome_dati_gara"]["data_prog_gara"].substring(8,10)}/${dati_nuova_gara["nome_dati_gara"]["data_prog_gara"].substring(5,7)}/${dati_nuova_gara["nome_dati_gara"]["data_prog_gara"].substring(0,4)})</span></p>`;
                                        if(current_time<aggiungiMinuti(inizio_eff_gara,durata_prog_gara-5) || current_time>=aggiungiMinuti(inizio_eff_gara,durata_prog_gara)){//oscuro a 5 min dalla fine e mostro nuovamente a fine gara
                                            if(current_time>=aggiungiMinuti(inizio_eff_gara,durata_prog_gara)||aggiungiMinuti(current_time,15)<inizio_eff_gara){//se il tempo è finito termino la gara (seconda condizione se non si apre la pagina fino al gg successivo, tolleranza di 15 min)
                                                termina_gara(id_gara,inizio_eff_gara,durata_prog_gara);
                                                gara_html+='<p align="center" class="titolo-gara-live" style="margin:0px; margin-bottom:15px; padding:0px;">GARA TERMINATA</p>';
                                            }
                                            if(dati_nuova_gara["nome_dati_gara"]["giocata_gara"]==2){//se la gara è teminata non mostro il tempo rimanate
                                                gara_html+=`
                                                <table>
                                                    <tr style="font-size:large;">
                                                    <th class="th0"></th>`
                                            }else{
                                                gara_html+=`
                                                <table>
                                                    <tr style="font-size:large;">
                                                    <th class="th0" style="font-size:medium; font-weight:400;">- ${minuti} min e ${secondi} sec</th>`
                                            }
                                            for(let i=0; i<dati_nuova_gara.testo_gara.length; i++){
                                                if(i===0){
                                                    gara_html+=`<th class="th1 th1-left">D.1 ${punti_problemi[i+1]}</th>`
                                                }else if(i===dati_nuova_gara.testo_gara.length-1){
                                                    gara_html+=`<th class="th1">D.${i+1} ${punti_problemi[i+1]}</th>`
                                                }else{
                                                    gara_html+=`<th class="th1 th1-righ">D.${i+1} ${punti_problemi[i+1]}</th>`
                                                }
                                            }
                                            gara_html+=`</tr>`

                                            chiaviOrdinate.forEach((element,i) => {
                                                gara_html+=`<tr>`;
                                                if(i===0){
                                                    gara_html+=`
                                                        <td class="td0 td0-top">
                                                            <div class="split-text">
                                                                <div class="classifica-live-container">
                                                                    <div class="numero-classifica-live" align="center">${i+1}</div>
                                                                        <div>${element}</div>
                                                                    </div>
                                                                <div>${punti_squadre[element]["punti_totali"]}</div>
                                                            </div>
                                                        </td>`;
                                                }else if(i===chiaviOrdinate.length-1){
                                                    gara_html+=`<td class="td0 td0-bottom">
                                                                    <div class="split-text">
                                                                        <div class="classifica-live-container">
                                                                            <div class="numero-classifica-live" align="center">${i+1}</div>
                                                                                <div>${element}</div>
                                                                            </div>
                                                                        <div>${punti_squadre[element]["punti_totali"]}</div>
                                                                    </div>
                                                                </td>`;
                                                }else{
                                                    gara_html+=`<td class="td0">
                                                                    <div class="split-text">
                                                                        <div class="classifica-live-container">
                                                                            <div class="numero-classifica-live" align="center">${i+1}</div>
                                                                                <div>${element}</div>
                                                                            </div>
                                                                        <div>${punti_squadre[element]["punti_totali"]}</div>
                                                                    </div>
                                                                </td>`;
                                                }
                                                for(let j=0; j<dati_nuova_gara.testo_gara.length; j++){
                                                    gara_html+=`<td class="td1 ${punti_squadre[element][j+1]==0?'':punti_squadre[element][j+1]>0?'green-cell':'red-cell'}">${punti_squadre[element][j+1]}${punti_squadre[element]["jolly"]==j+1?'<div class="j">J</div>':''}</td>`;
                                                }
                                                gara_html+=`<td class="td-right"></td> 
                                                            </tr>`;
                                            });
                                            gara_html+=`<tr>
                                                            <td class="td-bottom-left"> </td>`;

                                            for(let i=0; i<dati_nuova_gara.testo_gara.length; i++){
                                                gara_html+=`<td class="td-bottom"></td>`;
                                            }
                                            gara_html+=`</tr>
                                                        </table>`;
                                        }    
                                        document.querySelector(".table-container").innerHTML=gara_html;
                                    })
                                }else{//codice ripetuto due volte perchè altimenti non aspetta l'esecuzione della query se la gara è terminata perchè il tutto viene eseguito in modo asincrono
                                    //ordino al primo posto la squadra con più pt.
                                    let arrayCoppieChiaveValore = [];
                                    let prev_arrayCoppieChiaveValore = [];

                                    // Estrai le coppie chiave-valore in un array di oggetti
                                    for (let chiave in punti_squadre) {
                                        arrayCoppieChiaveValore.push({ chiave: chiave, valore: punti_squadre[chiave]["punti_totali"] });
                                    }
                                    for (let chiave in prev_punti_squadre) {
                                        prev_arrayCoppieChiaveValore.push({ chiave: chiave, valore: prev_punti_squadre[chiave]["punti_totali"] });
                                    }

                                    // Ordina l'array in base ai valori
                                    arrayCoppieChiaveValore.sort(function(a, b) {
                                        return b.valore - a.valore;
                                    });
                                    prev_arrayCoppieChiaveValore.sort(function(a, b) {
                                        return b.valore - a.valore;
                                    });

                                    // Estrai solo le chiavi ordinate in un nuovo array
                                    var chiaviOrdinate = arrayCoppieChiaveValore.map(function(coppia) {
                                        return coppia.chiave;
                                    });
                                    var prev_chiaviOrdinate = prev_arrayCoppieChiaveValore.map(function(coppia) {
                                        return coppia.chiave;
                                    });

                                    //creo 2 oggetti del tipo Squadra: classifica {Squadra 1: 0 , Squadra : 4...} //per disegnare frecce
                                    const classifica={}
                                    for(let i=0; i<chiaviOrdinate.length; i++){
                                        classifica[chiaviOrdinate[i]]=i;
                                    }
                                    const prev_classifica={}
                                    for(let i=0; i<prev_chiaviOrdinate.length; i++){
                                        prev_classifica[prev_chiaviOrdinate[i]]=i;
                                    }

                                    //creao tabella
                                    const min_sec =calcolaDifferenzaOrario(aggiungiMinuti(inizio_eff_gara,Number(durata_prog_gara)));
                                    const {minuti}=min_sec;
                                    const {secondi}=min_sec;

                                    let gara_html='';
                                    gara_html+=`<p align="center" class="container-titolo-gara-live"> <span class="titolo-gara-live">${dati_nuova_gara["nome_dati_gara"]["nome_gara"]} </span><span class="data-gara-live">(${dati_nuova_gara["nome_dati_gara"]["data_prog_gara"].substring(8,10)}/${dati_nuova_gara["nome_dati_gara"]["data_prog_gara"].substring(5,7)}/${dati_nuova_gara["nome_dati_gara"]["data_prog_gara"].substring(0,4)})</span></p>`;

                                    if(current_time<aggiungiMinuti(inizio_eff_gara,durata_prog_gara-5) || current_time>=aggiungiMinuti(inizio_eff_gara,durata_prog_gara)){//oscuro a 5 min dalla fine e mostro nuovamente a fine gara
                                        if(current_time>=aggiungiMinuti(inizio_eff_gara,durata_prog_gara)||aggiungiMinuti(current_time,15)<inizio_eff_gara){//se il tempo è finito termino la gara (seconda condizione se non si apre la pagina fino al gg successivo, tolleranza di 15 min)
                                            termina_gara(id_gara,inizio_eff_gara,durata_prog_gara);
                                            gara_html+='<p align="center" class="titolo-gara-live" style="margin:0px; margin-bottom:15px; padding:0px;">GARA TERMINATA</p>';
                                        }
                                        if(dati_nuova_gara["nome_dati_gara"]["giocata_gara"]==2){//se la gara è teminata non mostro il tempo rimanate
                                            gara_html+=`
                                            <table>
                                                <tr style="font-size:large;">
                                                <th class="th0"></th>`
                                        }else{
                                            gara_html+=`
                                            <table>
                                                <tr style="font-size:large;">
                                                <th class="th0" style="font-size:medium; font-weight:400;">- ${minuti} min e ${secondi} sec</th>`
                                        }
                                        for(let i=0; i<dati_nuova_gara.testo_gara.length; i++){
                                            if(i===0){
                                                gara_html+=`<th class="th1 th1-left">D.1 ${punti_problemi[i+1]}</th>`
                                            }else if(i===dati_nuova_gara.testo_gara.length-1){
                                                gara_html+=`<th class="th1">D.${i+1} ${punti_problemi[i+1]}</th>`
                                            }else{
                                                gara_html+=`<th class="th1 th1-righ">D.${i+1} ${punti_problemi[i+1]}</th>`
                                            }
                                        }
                                        gara_html+=`</tr>`

                                        chiaviOrdinate.forEach((element,i) => {
                                            gara_html+=`<tr>`;
                                            if(i===0){
                                                gara_html+=`
                                                    <td class="td0 td0-top">
                                                        <div class="split-text">
                                                            <div class="classifica-live-container">
                                                                <div class="numero-classifica-live" align="center">${i+1}</div>
                                                                    <div>${element}</div>
                                                                </div>
                                                            <div>${punti_squadre[element]["punti_totali"]}</div>
                                                        </div>
                                                    </td>`;
                                            }else if(i===chiaviOrdinate.length-1){
                                                gara_html+=`<td class="td0 td0-bottom">
                                                                <div class="split-text">
                                                                    <div class="classifica-live-container">
                                                                        <div class="numero-classifica-live" align="center">${i+1}</div>
                                                                            <div>${element}</div>
                                                                        </div>
                                                                    <div>${punti_squadre[element]["punti_totali"]}</div>
                                                                </div>
                                                            </td>`;
                                            }else{
                                                gara_html+=`<td class="td0">
                                                                <div class="split-text">
                                                                    <div class="classifica-live-container">
                                                                        <div class="numero-classifica-live" align="center">${i+1}</div>
                                                                            <div>${element}</div>
                                                                        </div>
                                                                    <div>${punti_squadre[element]["punti_totali"]}</div>
                                                                </div>
                                                            </td>`;
                                            }
                                            for(let j=0; j<dati_nuova_gara.testo_gara.length; j++){
                                                gara_html+=`<td class="td1 ${punti_squadre[element][j+1]==0?'':punti_squadre[element][j+1]>0?'green-cell':'red-cell'}"><span class="${punti_squadre[element].blinking.includes(j+1)?`${punti_squadre[element][j+1]>0?'blinking-red':'blinking-green'}`:''}">${punti_squadre[element][j+1]}</span>${punti_squadre[element]["jolly"]==j+1?'<div class="j">J</div>':''}</td>`;
                                            }
                                            //classifica[element]<prev_classifica[element] perchè se passa da 1 a zero in classifica è migliorato
                                            gara_html+=`<td class="td-right">${classifica[element]<prev_classifica[element]?'<span style="margin-right:5px; color:var(--green)">&#11014;</span>':`${classifica[element]>prev_classifica[element]?'<span style="margin-right:5px; color:var(--red);">&#11015;</span>':'<span style="margin-right:5px; color:var(--yellow);">&#11013;</span>'}`}</td> 
                                                        </tr>`;
                                        });
                                        gara_html+=`<tr>
                                                        <td class="td-bottom-left"> </td>`;

                                        for(let i=0; i<dati_nuova_gara.testo_gara.length; i++){
                                            gara_html+=`<td class="td-bottom"></td>`;
                                        }
                                        gara_html+=`</tr>
                                                    </table>`;
                                    }    
                                    document.querySelector(".table-container").innerHTML=gara_html;
                                }
                            });
                        });
                        
                    });
                });
            });
        }
    });

}

render_gara_live();

setInterval(render_gara_live, 1000);//aggiorno la pagina ogni 1 (perchè conto alla rovescia) sec