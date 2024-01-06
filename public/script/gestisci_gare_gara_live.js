
/*if(!get_email()){
    for(let i=0;i<hide.length;i++){
        const overlayElement = document.getElementById('overlay');
        if (overlayElement) {
            overlayElement.style.display = 'block';
        }
        const hederButton = document.querySelector(hide[i]);
        if(hederButton){
            hederButton.classList.add('display-none');
        }
    }*/

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

function termina_gara_in_anticipo(id_gara){
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
            const fine_eff_gara=`${hours}:${minutes}`;

            const durata_eff_gara=(calcolaDifferenzaOrario(inizio_eff_gara)["minuti"]*-1)-1;//altimenti bisogna aspettare un minuto che si disoscuri la home

            fetch('/termina_gara_in_anticipo', {
                headers: {
                    'Content-type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({"id_gara":id_gara,fine_eff_gara:fine_eff_gara,durata_eff_gara:durata_eff_gara})
            })
            .then(response => {
                vai_alla_gara(id_gara);
            });
    })
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

//riduci inserimento
document.querySelector(".pulsanti-gare-live-espandi-inserimento").addEventListener('click',()=>{
    window.location.href = `/gestisci_gare_gara_live_inserimento/${id_gara}`;
});

//modifica gara
document.querySelector(".pulsanti-gare-live-modifica").addEventListener('click',()=>{
    window.location.href = `/gestisci_gare_modifica/${id_gara}`;
});

function termina_gara_torna_indietro(){
    const popup = document.querySelector(".popup-termina-gara-external-container");
    popup.style.display = "none";
}

function open_popup_termina_in_anticipo(id_gara){
    const popup = document.querySelector(".popup-termina-gara-external-container");
    popup.style.display = "flex";

    document.querySelector(".bottoni-termina-gara-container").innerHTML=`
        <button class="termina-gara" onclick="termina_gara_in_anticipo(${id_gara});">TERMINA la gara</button>
        <button class="gestisci-gare-termina-torna-inietro" onclick="termina_gara_torna_indietro();">Torna indietro</button>`
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

    //se non è un admin nascondo pulsante termina in anticipo
    if(dati_nuova_gara.email_creatore!=get_email()&&!dati_nuova_gara.admin_gara.includes(get_email())){
        document.querySelector(".info-gara").innerHTML=`<p align=center class="p-gara-live titolo-gara-live">Gara 1 trento lavis</p>
                                                        <p align=center class="p-gara-live conto-alla-rovascia">- 90 min 60 sec</p>
                                                        <button class="pulsanti-gare-live pulsanti-gare-live-anteprima-gara">Anteprima gara</button>`;
    }else{
        document.querySelector(".info-gara").innerHTML=`<p align=center class="p-gara-live titolo-gara-live">Gara 1 trento lavis</p>
        <button class="pulsanti-gare-live pulsanti-gare-live-termina-gara" onclick="open_popup_termina_in_anticipo(${id_gara})">Termina in anticipo</button>
        <p align=center class="p-gara-live conto-alla-rovascia">- 90 min 60 sec</p>
        <button class="pulsanti-gare-live pulsanti-gare-live-anteprima-gara" onclick="vai_alla_gara(${id_gara});">Anteprima gara</button>`;
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

    //titolo gara
    document.querySelector('.titolo-gara-live').textContent=dati_nuova_gara["nome_dati_gara"]["nome_gara"];
    //altezza del p del titolo
    let elements_height=document.querySelector('.titolo-gara-live').offsetHeight;
    try{//per gli inseritiru il pulsante termina gara non esiste
        elements_height+=document.querySelector('.pulsanti-gare-live-termina-gara').offsetHeight;
    }catch(error){
        elements_height-=20;//tolgo il margin che ha il pulsante termina gara
    }
    elements_height+=document.querySelector('.conto-alla-rovascia').offsetHeight;
    elements_height+=document.querySelector('.pulsanti-gare-live-anteprima-gara').offsetHeight;
    //iposto l'h max in base al contenuto del p
    document.querySelector(".info-gara").style.maxHeight=`${114+elements_height}px`;


    const risposte_squadra=document.querySelector(".scroll-menu-risposta-squadra");
    const jolly_squadra=document.querySelector(".scroll-menu-squadra-jolly");
    let squadre_html='<option value="" align="center" disabled selected>Squadra</option>';
    for(const element of dati_nuova_gara.squadre_gara){
        const html=`<option align="center" value="${element}">${element}</option>`
        squadre_html+=html;
    }
    risposte_squadra.innerHTML=squadre_html;
    jolly_squadra.innerHTML=squadre_html;
    
    const problemi_jolly=document.querySelector(".scroll-menu-problemi-jolly");
    const problemi_risposte=document.querySelector(".scroll-menu-risposta-problema");
    let problemi_jolly_html='<option value="" align="center" disabled selected>Problema</option>';
    let risposte_html='<option value="" align="center" disabled selected>Prob.</option>';
    dati_nuova_gara.testo_gara.forEach((element,i) => {
        var html=`<option align="center" value="${i+1}">Problema ${i+1}</option>`
        problemi_jolly_html+=html;
        
        html=`<option align="center" value="${i+1}">Prob. ${i+1}</option>`
        risposte_html+=html;
    });
    problemi_jolly.innerHTML=problemi_jolly_html;
    problemi_risposte.innerHTML=risposte_html;

    const gestisci_gara_live_inivia_risposte=document.querySelector(".pulsante-invia-risposte");
    const gestisci_gara_live_invia_jolly=document.querySelector(".pulsante-invia-jolly");

    const input_gara_live=document.querySelector(".input-gara-live");

    //resetto dropdown menu a opzione vuota
    risposte_squadra.value='';
    problemi_risposte.value='';
    input_gara_live.value='';
    //gestisci_gara_live_inivia_risposte.removeEventListener
    gestisci_gara_live_inivia_risposte.addEventListener("click",()=>{
        const nuova_risposta={};
        nuova_risposta["nome_squadra"]=risposte_squadra.value;
        nuova_risposta["numero_domanda"]=problemi_risposte.value;
        nuova_risposta["risposta"]=input_gara_live.value;
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
                render_gestisci_gara_live();
            });
        }
    })

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
                render_gestisci_gara_live();
            });
        }
    });    
});

function render_gestisci_gara_live(){
    const risposte_squadra=document.querySelector(".scroll-menu-risposta-squadra");
    const jolly_squadra=document.querySelector(".scroll-menu-squadra-jolly");
    const problemi_jolly=document.querySelector(".scroll-menu-problemi-jolly");
    const problemi_risposte=document.querySelector(".scroll-menu-risposta-problema");
    const input_gara_live=document.querySelector(".input-gara-live");
    risposte_squadra.value='';
    problemi_risposte.value='';
    input_gara_live.value='';
    jolly_squadra.value='';
    problemi_jolly.value='';

    dropdown_menus=[".scroll-menu-risposta-squadra",".scroll-menu-risposta-problema",".scroll-menu-squadra-jolly",".scroll-menu-problemi-jolly"];
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

render_gestisci_gara_live();

setInterval(check_termina_gara, 5000);