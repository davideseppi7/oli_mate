function modifica_gara(id_gara){
    let dati_nuova_gara={};
    dati_nuova_gara["id_gara"]=id_gara;

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
        localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
        window.location.href = "/crea_gara_nome";
    });
    
}

function gestisci_gara(id_gara){
    window.location.href = `/gestisci_gare_gara_live/${id_gara}`;
}

function vai_alla_gara(id_gara){
    window.location.href = `/gara_live_live/${id_gara}`;
}

function render_mie_gare(){
    let mie_gare_html='<p align="center" class="gestisci-gare-modifica">Le mie gare</p>';

    fetch('/get_mie_gare', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ email : get_email()})
    })
    .then(response => response.json())
    .then(response => {
        if(response.result==="error"){
            console.log(response.error)
        }else{
            for(const element of response){
                if(element.ruolo==0&&element.giocata_gara!==2){
                    const html=`
                        <div class="gara">
                            <div class="p-x-gara">
                                <p class="p-gestisci-gare-titolo-gara">${element.giocata_gara==0?`<button class="x-testo" onclick="open_popup_elimina_gara(${element.id_gara})"> X</button>`:''} ${element.nome_gara} CODICE GARA: ${element.codice_gara}</p>
                            </div>
                            <p class="p-gestisci-gare">${element.giocata_gara==0?`<button class="button-inizia-gara" onclick="open_popup_inizia_gara(${element.id_gara})">Inizia gara</button>`:`<button class="button-vai-alla-gara" onclick="vai_alla_gara(${element.id_gara});">Vai alla gara</button> <button class="button-gestisci-gara" onclick="gestisci_gara(${element.id_gara})">Gestisci gara</button>`} ${element.giocata_gara==0?`<button class="button-modifica" onclick="modifica_gara(${element.id_gara})">Modifica</button>`:''}</p>
                        </div>`;
                    mie_gare_html+=html;
                }else if(element.ruolo==1&&element.giocata_gara!==2){
                    const html=`
                        <div class="gara">
                            <div class="p-x-gara">
                                <p class="p-gestisci-gare-titolo-gara">${element.nome_gara} CODICE GARA: ${element.codice_gara}</p>
                            </div>
                            <p class="p-gestisci-gare">${element.giocata_gara==0?`<button class="button-inizia-gara" onclick="open_popup_inizia_gara(${element.id_gara})">Inizia gara</button>`:`<button class="button-vai-alla-gara" onclick="vai_alla_gara(${element.id_gara});">Vai alla gara</button> <button class="button-gestisci-gara" onclick="gestisci_gara(${element.id_gara})">Gestisci gara</button>`} ${element.giocata_gara==0?`<button class="button-modifica" onclick="modifica_gara(${element.id_gara})">Modifica</button>`:''}</p>
                        </div>`;
                    mie_gare_html+=html;
                }else if(element.ruolo==2&&element.giocata_gara!==2){
                    const html=`
                        <div class="gara">
                            <div class="p-x-gara">
                                <p class="p-gestisci-gare-titolo-gara">${element.nome_gara} CODICE GARA: ${element.codice_gara}</p>
                            </div>
                            <p class="p-gestisci-gare"><button class="button-vai-alla-gara" onclick="vai_alla_gara(${element.id_gara});">Vai alla gara</button> ${element.giocata_gara==1?`<button class="button-inserisci-risposte" onclick="gestisci_gara(${element.id_gara})">Inserisci risposte</button>`:''}</p>
                        </div>`;
                    mie_gare_html+=html;
                }
            }
        }
        document.querySelector(".mie-gare").innerHTML=mie_gare_html;
    });

    
    /*if(dati_nuova_gara["testo_gara"]){
        dati_nuova_gara["testo_gara"].forEach((element,i) => {
            
            risposte_testo_gara_html+=html;
        });
    }
    document.querySelector('.container-domande-testo').innerHTML = risposte_testo_gara_html;
    document.querySelector('.button-aggiungi-domanda').addEventListener('click', aggiungi_domanda_testo);*/
}

//////////
function elimina_gara(id_gara){
    const popup = document.querySelector(".popup-elimina-gara-external-container");
    fetch('/elimina_gara', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({"id_gara":id_gara})
    })
    .then(response => {response.json()
        popup.style.display = "none";
        render_mie_gare();
    })
}

function elimina_gara_torna_indietro(){
    const popup = document.querySelector(".popup-elimina-gara-external-container");
    popup.style.display = "none";
}

function open_popup_elimina_gara(id_gara) {
    const popup = document.querySelector(".popup-elimina-gara-external-container");
    popup.style.display = "flex";

    document.querySelector(".bottoni-elimina-gara-container").innerHTML=`
        <button class="elimina-gara" onclick="elimina_gara(${id_gara});">ELIMINA gara</button>
        <button class="elimina-gara-torna-inietro" onclick="elimina_gara_torna_indietro();">Torna indietro</button>`
}
//////////

///////
function inizia_gara(id_gara){
    const popup = document.querySelector(".popup-inizia-gara-external-container");
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const inizio_eff_gara=`${hours}:${minutes}`;
    const anno = currentTime.getFullYear();
    const mese = (currentTime.getMonth() + 1).toString().padStart(2, "0");
    const giorno = currentTime.getDate().toString().padStart(2, "0");
    const data_eff_gara = anno + "-" + mese + "-" + giorno;

    fetch('/inizia_gara', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({"id_gara":id_gara,inizio_eff_gara:inizio_eff_gara,data_eff_gara:data_eff_gara})
    })
    .then(response => {
        response.json();
        popup.style.display = "none";
        render_mie_gare();
    });
}

function gestisci_gare_torna_inietro(){
    const popup = document.querySelector(".popup-inizia-gara-external-container");
    popup.style.display = "none";
}

function open_popup_inizia_gara(id_gara) {
    const popup = document.querySelector(".popup-inizia-gara-external-container");
    popup.style.display = "flex";

    document.querySelector(".bottoni-inizio-gara-container").innerHTML=`
        <button class="inizia-gara" onclick="inizia_gara(${id_gara});">Inizia la gara</button>
        <button class="gestisci-gare-torna-inietro" onclick="gestisci_gare_torna_inietro();">Torna indietro</button>`
}
///////

render_mie_gare();

