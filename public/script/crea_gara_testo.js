const dati_nuova_gara = JSON.parse(localStorage.getItem('dati_nuova_gara')) || {};
if(!dati_nuova_gara["testo_gara"]){
    dati_nuova_gara["testo_gara"]=[];
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
}
if(!dati_nuova_gara["dati_completi_gara"]){
    dati_nuova_gara["dati_completi_gara"]={}
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
}

console.log(dati_nuova_gara["id_gara"]);
if(dati_nuova_gara["id_gara"]){
    document.querySelector(".gestisci-gare").classList.add('is-active');
}else{
    document.querySelector(".crea-gara").classList.add('is-active');
}

const aggiungi_domanda_testo = () =>{
    dati_nuova_gara["testo_gara"].push(NaN);
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    render_risposte_testo_gara();
};

const inserisci_risposta_testo = (i,value) =>{
    dati_nuova_gara["testo_gara"][i]=value;
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    render_risposte_testo_gara();
};

const rimuovi_domanda_testo = (i) =>{
    dati_nuova_gara["testo_gara"].splice(i, 1);
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    render_risposte_testo_gara();
};

const contieneSoloCifre = (value) =>{
    if(!value){
        return -1;
    }
    const regex = /^0*[0-9]{4}$/; // Regex che corrisponde a esattamente 4 cifre con zeri iniziali facoltativi
    return regex.test(value)?1:0;
};

function render_risposte_testo_gara(){
    let risposte_testo_gara_html='';
    if(dati_nuova_gara["testo_gara"]){
        dati_nuova_gara["testo_gara"].forEach((element,i) => {
            const html=`
                <div class="domanda">
                    <p><button class="x-testo" onclick="rimuovi_domanda_testo(${i})">X</button> Problema ${i+1} <input class="box-domanda-testo" ${element?`value="${element}"`:''} style="${contieneSoloCifre(element)===1?'background-color: var(--green)':`${contieneSoloCifre(element)===0?'background-color: var(--red)':`${dati_nuova_gara["dati_completi_gara"]["crea_gara_testo"]===-1?'background-color: var(--red)':''}`}`}" type="text" placeholder="risposta" onfocusout="inserisci_risposta_testo(${i},this.value)" onmouseout="inserisci_risposta_testo(${i},this.value)"></p>
                </div>`;
            risposte_testo_gara_html+=html;
        });
    }
    document.querySelector('.container-domande-testo').innerHTML = risposte_testo_gara_html;
    document.querySelector('.button-aggiungi-domanda').addEventListener('click', aggiungi_domanda_testo);
}

const upload_testo = () =>{
    const fileInput = document.querySelector('.file-testo');

    const file = fileInput.files[0]; // Get the selected file
    
    if (file) {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('pdfFile', file, file.name);
      
      // Send a POST request to the server
      fetch('/upload_pdf', {
        method: 'POST',
        body: formData,
      })
      .then(response => {
        if (response.ok) {
          return response.json(); // Parse the JSON response
        } else {
          throw new Error('Errore nella richiesta al server.');
        }
      })
      .then(data => {
        const risposte = data.risposte;
        dati_nuova_gara["testo_gara"]=risposte;
        localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
        render_risposte_testo_gara();
      })
      .catch(error => {
        console.error(error);
      });
    }
};

document.querySelector('.upload-testo').addEventListener('click', upload_testo);

render_risposte_testo_gara();

