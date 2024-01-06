function open_storico_gare_gara(id_gara){
    window.location.href = `/storico_gare_gara/${id_gara}`;
}

function render_storico_gare(){
    let mie_gare_html='<p align="center" class="storico-gare-titolo">Storico gare</p>';

    fetch('/get_mie_gare_storiche', {
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
            console.log(response)
            for(const element of response){
                if(element.ruolo<=2&&element.giocata_gara==2){
                    const html=`
                        <div class="gara-passata">
                            <button class="button-gara-passata" onclick="open_storico_gare_gara(${element.id_gara})">
                                <div class="storico-dati-gara">
                                    <p class="p-titolo-gara-storica">${element.nome_gara}</p>
                                </div>
                                <div class="storico-dati-gara">
                                    <p class="p-dati-gara-storica">(${element["data_prog_gara"].substring(8,10)}/${element["data_prog_gara"].substring(5,7)}/${element["data_prog_gara"].substring(0,4)}) ${element["inizio_eff_gara"]} - ${element["fine_eff_gara"]}</p>
                                </div>
                            </button>
                        </div>`
                    mie_gare_html+=html;
                }
            }
        }
        document.querySelector(".mie-gare-passate").innerHTML=mie_gare_html;
    });

    
    /*if(dati_nuova_gara["testo_gara"]){
        dati_nuova_gara["testo_gara"].forEach((element,i) => {
            
            risposte_testo_gara_html+=html;
        });
    }
    document.querySelector('.container-domande-testo').innerHTML = risposte_testo_gara_html;
    document.querySelector('.button-aggiungi-domanda').addEventListener('click', aggiungi_domanda_testo);*/
}

render_storico_gare();