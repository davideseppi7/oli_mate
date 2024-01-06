const dati_nuova_gara = JSON.parse(localStorage.getItem('dati_nuova_gara')) || {};
if(!dati_nuova_gara["admin_gara"]){
    dati_nuova_gara["admin_gara"]=[];
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
}
if(!dati_nuova_gara["inseritori_gara"]){
    dati_nuova_gara["inseritori_gara"]=[];
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

const aggiungi_admin = () =>{
    dati_nuova_gara["admin_gara"].push(NaN);
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    render_admin_gara();
};

const aggiungi_inseritori = () =>{
    dati_nuova_gara["inseritori_gara"].push(NaN);
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    render_inseritori_gara();
};


const inserisci_admin = (i,value) =>{
    dati_nuova_gara["admin_gara"][i]=value;
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    render_admin_gara();
};

const inserisci_inseritori = (i,value) =>{
    dati_nuova_gara["inseritori_gara"][i]=value;
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    render_inseritori_gara();
};


const rimuovi_admin = (i) =>{
    dati_nuova_gara["admin_gara"].splice(i, 1);
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    render_admin_gara();
};

const rimuovi_inseritori = (i) =>{
    dati_nuova_gara["inseritori_gara"].splice(i, 1);
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    render_inseritori_gara();
};

function isValidEmail(email) {
    if(!email){
        return -1;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  
    return emailRegex.test(email)?1:0;
}

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

function render_admin_gara(){
    let admin_gara_html='';
    if(dati_nuova_gara["admin_gara"]){
        dati_nuova_gara["admin_gara"].forEach((element,i) => {
            const html=`
                <div class="domanda">
                    <p><button class="x-testo" onclick="rimuovi_admin(${i})">X</button> <input class="box-admin" type="email" placeholder="email" ${element?`value="${element}"`:''} onfocusout="inserisci_admin(${i},this.value)" onmouseout="inserisci_admin(${i},this.value)" style="${isValidEmail(element)===1?`${contieneElementiDuplicati(dati_nuova_gara["admin_gara"],element)?'background-color: var(--red)':'background-color: var(--green)'}`:`${isValidEmail(element)===0?'background-color: var(--red)':`${dati_nuova_gara["dati_completi_gara"]["crea_gara_admin"]===-1?'background-color: var(--red)':''}`}`}"></p>
                </div>`;
                admin_gara_html+=html;
        });
    }
    document.querySelector('.vedi-admin-container').innerHTML = admin_gara_html;
    document.querySelector('.aggiungi-admin-button').addEventListener('click', aggiungi_admin);
}

function render_inseritori_gara(){
    let inseritori_gara_html='';
    if(dati_nuova_gara["inseritori_gara"]){
        dati_nuova_gara["inseritori_gara"].forEach((element,i) => {
            const html=`
                <div class="domanda">
                    <p><button class="x-testo" onclick="rimuovi_inseritori(${i})">X</button> <input class="box-admin" type="email" placeholder="email" ${element?`value="${element}"`:''} onfocusout="inserisci_inseritori(${i},this.value)" onmouseout="inserisci_inseritori(${i},this.value)" style="${isValidEmail(element)===1?`${contieneElementiDuplicati(dati_nuova_gara["inseritori_gara"],element)?'background-color: var(--red)':'background-color: var(--green)'}`:`${isValidEmail(element)===0?'background-color: var(--red)':`${dati_nuova_gara["dati_completi_gara"]["crea_gara_admin"]===-1?'background-color: var(--red)':''}`}`}"></p>
                </div>`;
                inseritori_gara_html+=html;
        });
    }
    document.querySelector('.vedi-inseritori-container').innerHTML = inseritori_gara_html;
    document.querySelector('.aggiungi-inseritori-button').addEventListener('click', aggiungi_inseritori);
}

render_admin_gara();
render_inseritori_gara();
