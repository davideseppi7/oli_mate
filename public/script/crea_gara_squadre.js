const dati_nuova_gara = JSON.parse(localStorage.getItem('dati_nuova_gara')) || {};
if(!dati_nuova_gara["squadre_gara"]){
    dati_nuova_gara["squadre_gara"]=[];
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

const aggiungi_n_squadre = () =>{
    const n = document.querySelector('.aggiungi-n-squadre').value;
    for(let i=0;i<n;i++){
        dati_nuova_gara["squadre_gara"].push(NaN);
        localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));  
    }
    render_squadre_gara();
};

const inserisci_squadra = (i,value) =>{
    dati_nuova_gara["squadre_gara"][i]=value;
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    render_squadre_gara();
};

const rimuovi_squadra = (i) =>{
    dati_nuova_gara["squadre_gara"].splice(i, 1);
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    render_squadre_gara();
};

function contieneElementiDuplicati(array, elementoDaControllare) {
    let conteggio = 0;
  
    for (const elemento of array) {
      if (elemento === elementoDaControllare) {
        conteggio++;
      }
      if (conteggio > 1) {
        return true;
      }
    }
    return false;
}
  

function render_squadre_gara(){
    let squadre_gara_html='';
    if(dati_nuova_gara["squadre_gara"]){
        dati_nuova_gara["squadre_gara"].forEach((element,i) => {
            //console.log(dati_nuova_gara["squadre_gara"][i]);
            if(!dati_nuova_gara["squadre_gara"][i]){
                dati_nuova_gara["squadre_gara"][i]=`Squadra ${i+1}`;
                localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));  
                element=dati_nuova_gara["squadre_gara"][i];
            }
            
            const html=`
                <div class="domanda">
                    <p><button class="x-testo" onclick="rimuovi_squadra(${i})"> X </button><input class="box-squadra" value="${element}" type="text" onfocusout="inserisci_squadra(${i},this.value)" onmouseout="inserisci_squadra(${i},this.value)" style="${contieneElementiDuplicati(dati_nuova_gara['squadre_gara'],element)?'background-color: var(--red)':'background-color: var(--green)'}"></p>
                </div>`;
            squadre_gara_html+=html;
        });
    }
    document.querySelector('.container-squadre').innerHTML = squadre_gara_html;
    document.querySelector('.button-aggiungi-squadra').addEventListener('click', aggiungi_n_squadre);
    
    const aggiungiSquadreButton = document.querySelector('.button-aggiungi-squadra');
    const inputNumeroSquadre = document.querySelector('.aggiungi-n-squadre');

    inputNumeroSquadre.addEventListener('mouseover', function (event) {
        // Disabilita il pulsante durante l'interazione con l'input number
        aggiungiSquadreButton.disabled = true;

        // Aggiungi un ascoltatore per il blur (perdita di focus) dell'input number
        inputNumeroSquadre.addEventListener('mouseout', function () {
            // Riabilita il pulsante dopo aver completato l'interazione
            aggiungiSquadreButton.disabled = false;

            // Rimuovi l'ascoltatore 
            inputNumeroSquadre.removeEventListener('mouseout', this);
        });
    });
}

render_squadre_gara();

