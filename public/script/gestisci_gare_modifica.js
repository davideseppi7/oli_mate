const urlPaginaCorrente = window.location.href;
const partiUrl = urlPaginaCorrente.split('/');
const id_gara = partiUrl[partiUrl.length - 1];

if(partiUrl[partiUrl.length - 2]=="gestisci_gare_modifica_storica"){
    document.querySelector(".storico-gare").classList.add('is-active');
}else{
    document.querySelector(".gestisci-gare").classList.add('is-active');
}

function elimina_risposta_jolly(id_risposta_jolly,tipo){
    const popup = document.querySelector(".popup-elimina-risposta-jolly-external-container");
    if(id_risposta_jolly&&tipo){
        fetch('/elimina_risposta_jolly', {
            headers: {
                'Content-type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ id_risposta_jolly : id_risposta_jolly,tipo: tipo})
        })
        .then(response => {
            response.json();
            popup.style.display="none";
            render_modifca();
        });
    }
}

function elimina_risposta_jolly_torna_indietro(){
    const popup = document.querySelector(".popup-elimina-risposta-jolly-external-container");
    popup.style.display="none";
}

function popup_elimina_risposta_jolly(id_risposta_jolly,nome_squadra,numero_domanda,ora,risposta,tipo){
    const popup = document.querySelector(".popup-elimina-risposta-jolly-external-container");
    if(tipo=="risposta"){
        document.querySelector(".p-popup").innerHTML=`
            <p align="center">Sei sicuro di voler ELIMINARE la risposta?</p>
            <p align="center">Ora: ${ora}</p>
            <p align="center">Nome squadra: ${nome_squadra}</p>
            <p align="center">Problema: Prob. ${numero_domanda}</p>
            <p align="center">Risposta: ${risposta}</p>
            `
        //cambio testo pulsante
        document.querySelector(".bottoni-elimina-risposta-jolly-container").innerHTML=`
            <button class="elimina-risposta-jolly" onclick="elimina_risposta_jolly(${id_risposta_jolly},'${tipo}');">ELIMINA risposta</button>
            <button class="elimina-risposta-jolly-torna-inietro" onclick="elimina_risposta_jolly_torna_indietro();">Torna indietro</button>`
    }else if(tipo=="jolly"){
        document.querySelector(".p-popup").innerHTML=`
            <p align="center">Sei sicuro di voler ELIMINARE il jolly?</p>
            <p align="center">Ora: ${ora}</p>
            <p align="center">Nome squadra: ${nome_squadra}</p>
            <p align="center">Problema jolly: Prob. ${numero_domanda}</p>
            `
        //cambio testo pulsante
        document.querySelector(".bottoni-elimina-risposta-jolly-container").innerHTML=`
            <button class="elimina-risposta-jolly" onclick="elimina_risposta_jolly(${id_risposta_jolly},'${tipo}');">ELIMINA jolly</button>
            <button class="elimina-risposta-jolly-torna-inietro" onclick="elimina_risposta_jolly_torna_indietro();">Torna indietro</button>`
    }
    popup.style.display = "flex";
}

function aggiorna_risposta_jolly_torna_indietro(){
    const popup = document.querySelector(".popup-elimina-risposta-jolly-external-container");
    popup.style.display="none";
}

function aggiorna_risposta_jolly(id_risposta_jolly,nome_squadra,numero_domanda,risposta,tipo){
    const popup = document.querySelector(".popup-elimina-risposta-jolly-external-container");
    if(id_risposta_jolly&&nome_squadra&&numero_domanda&&(risposta||tipo=="jolly")&&tipo){//per i jolly non ci sono risposte
        fetch('/aggiorna_risposta_jolly', {
            headers: {
                'Content-type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({id_risposta_jolly:id_risposta_jolly,nome_squadra:nome_squadra,numero_domanda:numero_domanda,risposta:risposta,tipo:tipo})
        })
        .then(response => {
            response.json();
            popup.style.display="none";
            render_modifca();
        });
    }
}

function popup_cambia_risposta_jolly(id_risposta_jolly,nome_squadra,numero_domanda,ora,risposta,tipo){
    const popup = document.querySelector(".popup-elimina-risposta-jolly-external-container");
    if(tipo=="risposta"){
        document.querySelector(".p-popup").innerHTML=`
            <p align="center">Sei sicuro di voler CAMBIARE la risposta al problema ${numero_domanda} delle ${ora}?</p>
            <p align="center">Dati aggiornati:</p>
            <p align="center">Nome squadra: ${nome_squadra}</p>
            <p align="center">Risposta: ${risposta}</p>
            `
        //cambio testo pulsante
        document.querySelector(".bottoni-elimina-risposta-jolly-container").innerHTML=`
            <button class="elimina-risposta-jolly" onclick="aggiorna_risposta_jolly(${id_risposta_jolly},'${nome_squadra}','${numero_domanda}','${risposta}','${tipo}');">CONFERMA</button>
            <button class="elimina-risposta-jolly-torna-inietro" onclick="aggiorna_risposta_jolly_torna_indietro();">Torna indietro</button>`
    }else if(tipo=="jolly"){
        document.querySelector(".p-popup").innerHTML=`
            <p align="center">Sei sicuro di voler CAMBIARE l'invio del jolly delle ${ora}?</p>
            <p align="center">Dati aggiornati:</p>
            <p align="center">Nome squadra: ${nome_squadra}</p>
            <p align="center">Problema jolly: Prob. ${numero_domanda}</p>
            `
        //cambio testo pulsante
        document.querySelector(".bottoni-elimina-risposta-jolly-container").innerHTML=`
            <button class="elimina-risposta-jolly" onclick="aggiorna_risposta_jolly(${id_risposta_jolly},'${nome_squadra}','${numero_domanda}','${risposta}','${tipo}');">CONFERMA</button>
            <button class="elimina-risposta-jolly-torna-inietro" onclick="aggiorna_risposta_jolly_torna_indietro();">Torna indietro</button>`
    
    }
    popup.style.display = "flex";
}

function popup_aggiungi_risposta(){
    const popup = document.querySelector(".popup-aggingi-risposta-external-container");
    popup.style.display = "flex";
}

function popup_aggiungi_jolly(){
    const popup = document.querySelector(".popup-aggingi-jolly-external-container");
    popup.style.display = "flex";
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
    if(dati_nuova_gara.email_creatore!=get_email()&&!dati_nuova_gara.admin_gara.includes(get_email())){
        const overlayElement = document.getElementById('overlay');
        if (overlayElement) {
            overlayElement.style.display = 'block';
        }
    }


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
    const input_ora=document.querySelector(".input-ora");
    const input_ora_jolly=document.querySelector(".input-ora-jolly");

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
        nuova_risposta["ora"]=`${input_ora.value}:00`;
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
                document.querySelector(".popup-aggingi-risposta-external-container").style.display="none";
                render_modifca();
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
        nuovo_jolly["ora"]=`${input_ora_jolly.value}:00`;
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
                document.querySelector(".popup-aggingi-jolly-external-container").style.display="none";
                render_modifca();
            });
        }
    });
    document.querySelector(".pulsante-torna-inietro-risposte").addEventListener("click",()=>{
        document.querySelector(".popup-aggingi-risposta-external-container").style.display="none";
        render_modifca();
    })
    document.querySelector(".pulsante-torna-inietro-jolly").addEventListener("click",()=>{
        document.querySelector(".popup-aggingi-jolly-external-container").style.display="none";
        render_modifca();
    })     
});

function render_modifca(){
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
        const dati_nuova_gara=response;
        if(dati_nuova_gara.email_creatore!=get_email()&&!dati_nuova_gara.admin_gara.includes(get_email())){
            const overlayElement = document.getElementById('overlay');
            if (overlayElement) {
                overlayElement.style.display = 'block';
            }
        }else{
            fetch('/get_risposte_jolly', {
                headers: {
                    'Content-type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({"id_gara":id_gara})
            })
            .then(response => response.json())
            .then(response => {
                const jolly_risposte=response;
                let html_modifica='<p align="center" class="titolo-modifica">Modifica o aggiungi risposte e jolly (scorrere in basso per vedere i pulsanti)</p>';
                jolly_risposte.forEach(element => {
                    if(element.tipo=="risposta"){
                        html_modifica+=`
                            <div class="risposta-colonna">
                            <p align="center" class="p-titolo-problema">Risposta problema: ${element.numero_domanda}</p>
                            <div class="risposta-riga">
                                <div class="colonnine-inputs">
                                    <p><button class="x-testo" onclick="popup_elimina_risposta_jolly('${element.id_risposta_jolly}','${element.nome_squadra}','${element.numero_domanda}','${element.ora.substring(0, 5)}','${element.risposta}','${element.tipo}');">X</button> ${element.ora.substring(0, 5)}</p>
                                </div>
                                <div class="colonnine-inputs">
                                    <select class="scroll-menu-risposta" onchange="popup_cambia_risposta_jolly('${element.id_risposta_jolly}',this.value,'${element.numero_domanda}','${element.ora.substring(0, 5)}','${element.risposta}','${element.tipo}');">`
                                    
                        for(const ele of dati_nuova_gara.squadre_gara){
                            html_modifica+=`<option value="${ele}" ${element.nome_squadra==ele?'selected':''}>${ele}</option>`
                        }

                        html_modifica+=`                
                                    </select>
                                </div>
                                <div class="colonnine-inputs">
                                    <input type="text" value="${element.risposta}" class="risposta-input" placeholder="_ _ _ _" onchange="popup_cambia_risposta_jolly('${element.id_risposta_jolly}','${element.nome_squadra}','${element.numero_domanda}','${element.ora.substring(0, 5)}',this.value,'${element.tipo}');">
                                </div>        
                            </div>
                        </div>`

                    }else if(element.tipo=="jolly"){
                        html_modifica+=`
                            <div class="jolly-colonna">
                            <p align="center" class="p-titolo-problema">Jolly</p>
                            <div class="jolly-riga">
                                <div class="colonnine-inputs">
                                    <p><button class="x-testo" onclick="popup_elimina_risposta_jolly('${element.id_risposta_jolly}','${element.nome_squadra}','${element.numero_domanda}','${element.ora.substring(0, 5)}','${element.risposta}','${element.tipo}');">X</button> ${element.ora.substring(0, 5)}</p>
                                </div>
                                <div class="colonnine-inputs">
                                    <select class="scroll-menu-jolly" onchange="popup_cambia_risposta_jolly('${element.id_risposta_jolly}',this.value,'${element.numero_domanda}','${element.ora.substring(0, 5)}','${element.risposta}','${element.tipo}');">` 
                        for(const ele of dati_nuova_gara.squadre_gara){
                            html_modifica+=`<option value="${ele}" ${element.nome_squadra==ele?'selected':''}>${ele}</option>`
                        }
                        html_modifica+=`
                            </select>
                                </div>
                                <div class="colonnine-inputs">
                                    <select class="scroll-menu-jolly" onchange="popup_cambia_risposta_jolly('${element.id_risposta_jolly}','${element.nome_squadra}',this.value,'${element.ora.substring(0, 5)}','${element.risposta}','${element.tipo}');">`
                        for(let i=0; i<dati_nuova_gara.testo_gara.length; i++){
                            html_modifica+=`<option value="${i+1}" ${element.numero_domanda==(i+1)?'selected':''}>Prob. ${i+1}</option>`
                        }
                        html_modifica+=`
                                </select>
                                    </div>
                                </div>
                            </div>`
                    }  
                });
                //pulsanti azioni
                html_modifica+=`
                    <div class="aggiungi-risposta">
                        <button class="pulsanti-bottom pulsanti-bottom-risposta" onclick="popup_aggiungi_risposta();">Aggiungi risposta</button>
                        <button class="pulsanti-bottom pulsanti-bottom-jolly" onclick="popup_aggiungi_jolly();">Aggiungi jolly</button>
                    </div>`
                document.querySelector(".vedi-risposte").innerHTML=html_modifica;
            });
        }

    });

    //gestione colore elementi dropdown menu
    const risposte_squadra=document.querySelector(".scroll-menu-risposta-squadra");
    const jolly_squadra=document.querySelector(".scroll-menu-squadra-jolly");
    const problemi_jolly=document.querySelector(".scroll-menu-problemi-jolly");
    const problemi_risposte=document.querySelector(".scroll-menu-risposta-problema");
    const input_gara_live=document.querySelector(".input-gara-live");
    const input_ora=document.querySelector(".input-ora");
    const input_ora_jolly=document.querySelector(".input-ora-jolly");
    risposte_squadra.value='';
    problemi_risposte.value='';
    input_gara_live.value='';
    jolly_squadra.value='';
    problemi_jolly.value='';
    input_ora.value='';
    input_ora_jolly.value='';

    dropdown_menus=[".scroll-menu-risposta-squadra",".scroll-menu-risposta-problema",".scroll-menu-squadra-jolly",".scroll-menu-problemi-jolly",".input-ora",".input-ora-jolly"];
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

render_modifca();