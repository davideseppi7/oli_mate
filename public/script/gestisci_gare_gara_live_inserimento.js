const urlPaginaCorrente = window.location.href;
const partiUrl = urlPaginaCorrente.split('/');
const id_gara = partiUrl[partiUrl.length - 1];


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
        vai_alla_gara(id_gara);
    });
}

function check_termina_gara(){
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

            const currentTime = new Date();
            const hours = currentTime.getHours().toString().padStart(2, '0');
            const minutes = currentTime.getMinutes().toString().padStart(2, '0');
            const current_time=`${hours}:${minutes}`;
            if(current_time>=aggiungiMinuti(inizio_eff_gara,durata_prog_gara)||aggiungiMinuti(current_time,15)<inizio_eff_gara){//se il tempo è finito termino la gara (seconda condizione se non si apre la pagina fino al gg successivo, tolleranza di 15 min)
                termina_gara(id_gara,inizio_eff_gara,durata_prog_gara);
            }
    })
}

document.querySelector(".pulsanti-gare-inserimento-riduci-inserimento").addEventListener('click',()=>{
    window.location.href = `/gestisci_gare_gara_live/${id_gara}`;
});

let dati_nuova_gara={};

function gestisci_gara_inserimento_inivia_risposte(i){
    const nuova_risposta={};
    nuova_risposta["nome_squadra"]=dati_nuova_gara.squadre_gara[i];
    nuova_risposta["numero_domanda"]=document.querySelector(`.scroll-menu-squadre-${i}`).value;
    nuova_risposta["risposta"]=document.querySelector(`.input-inserimento-live-${i}`).value;
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    nuova_risposta["ora"]=`${hours}:${minutes}:${seconds}`;
    nuova_risposta["id_gara"]=id_gara;
    if(nuova_risposta["nome_squadra"]&&nuova_risposta["numero_domanda"]&&nuova_risposta["risposta"]){
        //console.log(nuova_risposta);
        fetch('/inserisci_nuova_risposta', {
            headers: {
                'Content-type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ nuova_risposta : nuova_risposta})
        })
        .then(response => {
            response.json();
            render_gestisci_gara_live_inserimento();
        });
    }
}

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

function vai_alla_gara(id_gara){
    window.location.href = `/gara_live_live/${id_gara}`;
}

fetch('/get_object_gara', {
    headers: {
        'Content-type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({"id_gara":id_gara})
})
.then(response => response.json())
.then(response => {
    //console.log(response);
    dati_nuova_gara=response;
    if(dati_nuova_gara.email_creatore!=get_email()&&!dati_nuova_gara.admin_gara.includes(get_email())&&!dati_nuova_gara.inseritori_gara.includes(get_email())){
        const overlayElement = document.getElementById('overlay');
        if (overlayElement) {
            overlayElement.style.display = 'block';
        }
    }

    fetch('/get_inizio_eff_durata_prog',{
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
        setInterval(()=>{
            const min_sec =calcolaDifferenzaOrario(aggiungiMinuti(inizio_eff_gara,Number(durata_prog_gara)));
            const {minuti}=min_sec;
            const {secondi}=min_sec;
            document.querySelector(".conto-alla-rovascia").textContent=`- ${minuti} min e ${secondi} sec`
        }, 1000);

    });

    document.querySelector(".anteprima-gara").addEventListener("click",()=>{
        vai_alla_gara(id_gara);
    });

    document.querySelector(".pulsanti-gare-inserimento-cronologia-modifica").addEventListener("click",()=>{
        window.location.href = `/gestisci_gare_modifica/${id_gara}`;
    });

    //titolo gara
    document.querySelector('.titolo-gara-live').textContent=dati_nuova_gara["nome_dati_gara"]["nome_gara"];

    const risposte_live_inserimento=document.querySelector(".riquadri-risposte");
    let risposte_live_inserimento_html='';
    dati_nuova_gara.squadre_gara.forEach((element,i)=>{
        let html=`
            <div class="riquadri-risposte-squadra">
                <p class="p-inserimento" align="center">${element}</p>
                <select class="scroll-menu-squadre scroll-menu-squadre-${i} select-not-selected">`;
        risposte_live_inserimento_html+=html;
        html='<option value="" align="center" disabled selected>Problema</option>';
        risposte_live_inserimento_html+=html;
        for(let j=0; j<dati_nuova_gara.testo_gara.length;j++){
            html=`<option value="${j+1}">Problema ${j+1}</option>`;
            risposte_live_inserimento_html+=html;
        }
        html=`</select>
                <input class="input-inserimento-live input-inserimento-live-${i}" type="text" placeholder="Risposta">
                <button class="pulsanti-gare-inserimento" onclick="gestisci_gara_inserimento_inivia_risposte(${i});">Invia risposta</button>
            </div>`
        risposte_live_inserimento_html+=html;
    });
    risposte_live_inserimento.innerHTML=risposte_live_inserimento_html;
    
    const jolly_squadra=document.querySelector(".scroll-menu-jolly");
    let squadre_html='<option value="" align="center" disabled selected>Squadra</option>';
    for(const element of dati_nuova_gara.squadre_gara){
        const html=`<option align="center" value="${element}">${element}</option>`
        squadre_html+=html;
    }
    jolly_squadra.innerHTML=squadre_html;
    
    const problemi_jolly=document.querySelector(".scroll-menu-problemi-jolly");
    let problemi_jolly_html='<option value="" align="center" disabled selected>Problema</option>';
    dati_nuova_gara.testo_gara.forEach((element,i) => {
        const html=`<option align="center" value="${i+1}">Problema ${i+1}</option>`
        problemi_jolly_html+=html;
    });
    problemi_jolly.innerHTML=problemi_jolly_html;

    const gestisci_gara_live_invia_jolly=document.querySelector(".pulsanti-gare-inserimento-invia-jolly");

    //resetto dropdown menu a opzione vuota
    jolly_squadra.value='';
    problemi_jolly.value='';
    gestisci_gara_live_invia_jolly.addEventListener("click",()=>{
        const nuovo_jolly={};
        nuovo_jolly["nome_squadra"]=jolly_squadra.value;
        nuovo_jolly["numero_domanda"]=problemi_jolly.value;
        const currentTime = new Date();
        const hours = currentTime.getHours().toString().padStart(2, '0');
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
        const seconds = currentTime.getSeconds().toString().padStart(2, '0');
        nuovo_jolly["ora"]=`${hours}:${minutes}:${seconds}`;
        nuovo_jolly["id_gara"]=id_gara;
        if(nuovo_jolly["nome_squadra"]&&nuovo_jolly["numero_domanda"]){
            //console.log(nuovo_jolly);
            fetch('/inserisci_nuovo_jolly', {
                headers: {
                    'Content-type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ nuovo_jolly : nuovo_jolly})
            })
            .then(response => {
                response.json();
                render_gestisci_gara_live_inserimento();
            });
        }
    });
    render_gestisci_gara_live_inserimento();//renderizzo solo dopo aver fatto la richiesta al db altrimenti non ho i dati per renderizzare subito    
});

function render_gestisci_gara_live_inserimento(){
    const jolly_squadra=document.querySelector(".scroll-menu-jolly");
    const problemi_jolly=document.querySelector(".scroll-menu-problemi-jolly");
    jolly_squadra.value='';
    problemi_jolly.value='';

    //jolly
    let dropdown_menus=[".scroll-menu-jolly",".scroll-menu-problemi-jolly"];
    for(const element of dropdown_menus){
        document.querySelector(element).classList.add("select-not-selected");//all'inizio deve essere tutto deselezionato
        document.querySelector(element).addEventListener('mouseout',()=>{
            if(!document.querySelector(element).value){
                //se vuoto allora grigino
                document.querySelector(element).classList.add("select-not-selected");
            }else{
                //altrimenti rimane nero
                document.querySelector(element).classList.remove("select-not-selected"); 
            }
        });
        document.querySelector(element).addEventListener('fucusout',()=>{
            if(!document.querySelector(element).value){
                document.querySelector(element).classList.add("select-not-selected");
            }else{
                document.querySelector(element).classList.remove("select-not-selected"); 
            }
        });
        document.querySelector(element).addEventListener('focusin',()=>{
            document.querySelector(element).classList.remove("select-not-selected");
        });
    }

    //altre risposte
    for(let i=0; i<dati_nuova_gara.squadre_gara.length; i++){

        //resetto input e dropdown menu risposte
        document.querySelector(`.scroll-menu-squadre-${i}`).value='';
        document.querySelector(`.input-inserimento-live-${i}`).value='';
        
        dropdown_menus=[`.scroll-menu-squadre-${i}`,`.input-inserimento-live-${i}`];
        for(const element of dropdown_menus){
            document.querySelector(element).classList.add("select-not-selected");//all'inizio deve essere tutto deselezionato
            document.querySelector(element).addEventListener('mouseout',()=>{
                if(!document.querySelector(element).value){
                    //se vuoto allora grigino
                    document.querySelector(element).classList.add("select-not-selected");
                }else{
                    //altrimenti rimane nero
                    document.querySelector(element).classList.remove("select-not-selected"); 
                }
            });
            document.querySelector(element).addEventListener('fucusout',()=>{
                if(!document.querySelector(element).value){
                    document.querySelector(element).classList.add("select-not-selected");
                }else{
                    document.querySelector(element).classList.remove("select-not-selected"); 
                }
            });
            document.querySelector(element).addEventListener('focusin',()=>{
                document.querySelector(element).classList.remove("select-not-selected");
            });
        }
    }
}

//renderizzo solo dopo aver fatto la richiesta al db altrimenti non ho i dati per renderizzare subito
//render_gestisci_gara_live_inserimento();

setInterval(check_termina_gara, 5000);