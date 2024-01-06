const dati_nuova_gara = JSON.parse(localStorage.getItem('dati_nuova_gara')) || {};
if(!dati_nuova_gara["nome_dati_gara"]){
    dati_nuova_gara["nome_dati_gara"]={}
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
}
if(!dati_nuova_gara["dati_completi_gara"]){
    dati_nuova_gara["dati_completi_gara"]={}
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
}

//console.log(dati_nuova_gara["id_gara"]);
if(dati_nuova_gara["id_gara"]){
    document.querySelector(".gestisci-gare").classList.add('is-active');
}else{
    document.querySelector(".crea-gara").classList.add('is-active');
}

const inputs_nuova_gara_nome=["inserire-nome-gara","inserire-data-gara","inserire-inizio-gara","inserire-fine-gara"];
const remappings_nuova_gara_nome=["nome_gara","data_prog_gara","inizio_prog_gara","fine_prog_gara"];


function render_nome_nuova_gata_nome(){
    if(dati_nuova_gara["nome_dati_gara"]){
        remappings_nuova_gara_nome.forEach((element,i)=>{
            const class_ = document.querySelector(`.${inputs_nuova_gara_nome[i]}`);
            if(class_&&dati_nuova_gara["nome_dati_gara"][element]){
                class_.value=dati_nuova_gara["nome_dati_gara"][element];
            }
        });
    }
    
    //coloro se imput errato
    inputs_nuova_gara_nome.forEach((element,i)=>{
        const class_ = document.querySelector(`.${element}`);
        if(!dati_nuova_gara["nome_dati_gara"][remappings_nuova_gara_nome[i]]&&dati_nuova_gara["dati_completi_gara"]["crea_gara_nome"]===-1){
            class_.setAttribute('style', 'background-color: var(--red)');
        }else if(dati_nuova_gara["dati_completi_gara"]["crea_gara_nome"]===-1){
            class_.setAttribute('style', 'background-color: var(--green)');
        }else{
            class_.setAttribute('style', '');
        }
    });

    //data
    const inputData = new Date(`${document.querySelector('.inserire-data-gara').value}T23:59`);
    const dataOggi = new Date();
    if(inputData < dataOggi){
        document.querySelector('.inserire-data-gara').setAttribute('style', 'background-color: var(--red)');
    }

    //ora
    const ora1 = new Date(`1970-01-01T${document.querySelector('.inserire-inizio-gara').value}`);
    const ora2 = new Date(`1970-01-01T${document.querySelector('.inserire-fine-gara').value}`);
    if(ora2 <= ora1){
        document.querySelector('.inserire-fine-gara').setAttribute('style', 'background-color: var(--red)');
    }
}
render_nome_nuova_gata_nome();

const sava_data_nome_dati_gara = (i,value) => {
    dati_nuova_gara["nome_dati_gara"][remappings_nuova_gara_nome[i]]=value;
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    
    render_nome_nuova_gata_nome();
};

inputs_nuova_gara_nome.forEach((element,i)=>{
    const class_ = document.querySelector(`.${element}`);
    if(class_){
        class_.setAttribute('onfocusout', `sava_data_nome_dati_gara(${i},this.value)`);
        class_.setAttribute('onmouseout', `sava_data_nome_dati_gara(${i},this.value)`);
    }
});

      

      