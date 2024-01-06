const dati_nuova_gara = JSON.parse(localStorage.getItem('dati_nuova_gara')) || {};
if(!dati_nuova_gara["dati_completi_gara"]){
    dati_nuova_gara["dati_completi_gara"]={}
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

//controllo correttezza dati gara_nome
const remappings_nuova_gara_nome=["nome_gara","data_prog_gara","inizio_prog_gara","fine_prog_gara"];

dati_nuova_gara["dati_completi_gara"]["crea_gara_nome"]=1;
localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
remappings_nuova_gara_nome.forEach(element=>{
    if(!dati_nuova_gara["nome_dati_gara"][element]){
        dati_nuova_gara["dati_completi_gara"]["crea_gara_nome"]=-1;
        localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    }
});

if(dati_nuova_gara["nome_dati_gara"]&&dati_nuova_gara["nome_dati_gara"]["data_prog_gara"]){
    const inputData = new Date(`${dati_nuova_gara["nome_dati_gara"]["data_prog_gara"]}T23:59`);
    const dataOggi = new Date();
    if(inputData < dataOggi){
        dati_nuova_gara["dati_completi_gara"]["crea_gara_nome"]=-1;
        localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    }
}

if(dati_nuova_gara["nome_dati_gara"]&&dati_nuova_gara["nome_dati_gara"]["inizio_prog_gara"]&&dati_nuova_gara["nome_dati_gara"]["fine_prog_gara"]){
    const ora1 = new Date(`1970-01-01T${dati_nuova_gara["nome_dati_gara"]["inizio_prog_gara"]}`);
    const ora2 = new Date(`1970-01-01T${dati_nuova_gara["nome_dati_gara"]["fine_prog_gara"]}`);
    if(ora2 <= ora1){
        document.querySelector('.inserire-fine-gara').setAttribute('style', 'background-color: var(--red)');
        dati_nuova_gara["dati_completi_gara"]["crea_gara_nome"]=-1;
        localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
    }
}

if(dati_nuova_gara["dati_completi_gara"]["crea_gara_nome"]===-1){
    document.querySelector('.container').innerHTML=`
        <h1 align="center" class="h1-gara-salvata">Nella pagina Nome gara / Dati squadra sono presenti dati INCOMPLETI, verrai reinirizzato a tale pagina tra qualche secono, completa i dati e poi salva nuovamente</h1>
    `;
    setTimeout(function() {
        window.location.href = "/crea_gara_nome";
      }, 5000);
}

//controllo correttezza dati testo
const contieneSoloCifre = (value) =>{
    if(!value){
        return -1;
    }
    const regex = /^0*[0-9]{4}$/; // Regex che corrisponde a esattamente 4 cifre con zeri iniziali facoltativi
    return regex.test(value)?1:0;
};

dati_nuova_gara["dati_completi_gara"]["crea_gara_testo"]=1;
if(!dati_nuova_gara["testo_gara"]||dati_nuova_gara["testo_gara"].length===0){

    document.querySelector('.container').innerHTML=`
        <h1 align="center" class="h1-gara-salvata">Nella pagina Testo gara NON è presente ALCUNA RISPOSTA ALLE DOMANDE, verrai reinirizzato a tale pagina tra qualche secono, completa i dati e poi salva nuovamente</h1>
    `;

    dati_nuova_gara["dati_completi_gara"]["crea_gara_testo"]=-1;
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));

    setTimeout(function() {
        window.location.href = "/crea_gara_testo";
    }, 5000);
}else{
    dati_nuova_gara["testo_gara"].forEach(element=>{
        if(!contieneSoloCifre(element)||!element){
            dati_nuova_gara["dati_completi_gara"]["crea_gara_testo"]=-1;
        }
    });

    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));

    if(dati_nuova_gara["dati_completi_gara"]["crea_gara_testo"]===-1){
        document.querySelector('.container').innerHTML=`
                <h1 align="center" class="h1-gara-salvata">Nella pagina Testo gara una o più risposte NON SONO A 4 CIFRE, verrai reinirizzato a tale pagina tra qualche secono, sistema i dati e poi salva nuovamente</h1>
            `;
        setTimeout(function() {
            window.location.href = "/crea_gara_testo";
        }, 5000);
    }
}

//contollo che ci sia almeno una squadra
dati_nuova_gara["dati_completi_gara"]["crea_gara_squadre"]=1;
let squadre_non_trovate=false
if(!dati_nuova_gara["squadre_gara"]||dati_nuova_gara["squadre_gara"].length===0){
    dati_nuova_gara["dati_completi_gara"]["crea_gara_squadre"]=-1;
    squadre_non_trovate=true;
}else{
    //controllo se ci sono squadre con lo stesso nome
    dati_nuova_gara["dati_completi_gara"]["crea_gara_squadre"]=1;
    if(dati_nuova_gara["squadre_gara"]){
        for(let i=0; i<dati_nuova_gara["squadre_gara"].length;i++){
            for(let j=i+1; j<dati_nuova_gara["squadre_gara"].length;j++){
                if(dati_nuova_gara["squadre_gara"][i]==dati_nuova_gara["squadre_gara"][j]){
                    dati_nuova_gara["dati_completi_gara"]["crea_gara_squadre"]=-1;
                    break;
                }
            }
        }
    }
}

if(dati_nuova_gara["dati_completi_gara"]["crea_gara_squadre"]===-1){
    if(squadre_non_trovate){
        document.querySelector('.container').innerHTML=`
        <h1 align="center" class="h1-gara-salvata">Nella pagina squadre NON è stata trovata ALCUNA, verrai reinirizzato a tale pagina tra qualche secono, sistema i dati e poi salva nuovamente</h1>
        `;
        setTimeout(function() {
        window.location.href = "/crea_gara_squadre";
        }, 5000);
    }else{
        document.querySelector('.container').innerHTML=`
            <h1 align="center" class="h1-gara-salvata">Nella pagina squadre ve ne sono 2 o più CON LO STESSO NOME, verrai reinirizzato a tale pagina tra qualche secono, sistema i dati e poi salva nuovamente</h1>
        `;
        setTimeout(function() {
        window.location.href = "/crea_gara_squadre";
        }, 5000);
    }
}

//controllo se ci sono inseritori/admin con lo stesso nome

//è una pagina che si può anche saltare quindi in tal caso inizializzo qui
if(!dati_nuova_gara["admin_gara"]){
    dati_nuova_gara["admin_gara"]=[];
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
}
if(!dati_nuova_gara["inseritori_gara"]){
    dati_nuova_gara["inseritori_gara"]=[];
    localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));
}

dati_nuova_gara["dati_completi_gara"]["crea_gara_admin"]=1;

if(dati_nuova_gara["admin_gara"]){
    for(let i=0; i<dati_nuova_gara["admin_gara"].length;i++){
        for(let j=i+1; j<dati_nuova_gara["admin_gara"].length;j++){
            if(dati_nuova_gara["admin_gara"][i]==dati_nuova_gara["admin_gara"][j]){
                dati_nuova_gara["dati_completi_gara"]["crea_gara_admin"]=-1;
                break;
            }
        }
    }
}
if(dati_nuova_gara["dati_completi_gara"]["admin_gara"]!==-1&&dati_nuova_gara["inseritori_gara"]){
    for(let i=0; i<dati_nuova_gara["inseritori_gara"].length;i++){
        for(let j=i+1; j<dati_nuova_gara["inseritori_gara"].length;j++){
            if(dati_nuova_gara["inseritori_gara"][i]==dati_nuova_gara["inseritori_gara"][j]){
                dati_nuova_gara["dati_completi_gara"]["crea_gara_admin"]=-1;
                break;
            }
        }
    } 
}
if(dati_nuova_gara["dati_completi_gara"]["admin_gara"]!==-1){
    if(dati_nuova_gara["admin_gara"]){
        for(const element of dati_nuova_gara["admin_gara"]){
            if(!element){
                dati_nuova_gara["dati_completi_gara"]["crea_gara_admin"]=-1;
                break;
            }
        }
    }else{
        dati_nuova_gara["dati_completi_gara"]["crea_gara_admin"]=-1;
    }
}
if(dati_nuova_gara["dati_completi_gara"]["admin_gara"]!==-1){
    if(dati_nuova_gara["inseritori_gara"]){
        for(const element of dati_nuova_gara["inseritori_gara"]){
            if(!element){
                dati_nuova_gara["dati_completi_gara"]["crea_gara_admin"]=-1;
                break;
            }
        }
    }else{
        dati_nuova_gara["dati_completi_gara"]["crea_gara_admin"]=-1;
    }
}

localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));

if(dati_nuova_gara["dati_completi_gara"]["crea_gara_admin"]===-1){
    document.querySelector('.container').innerHTML=`
            <h1 align="center" class="h1-gara-salvata">Nella pagina Amministratori / Inseritori ve ne sono 2 o più CON LA STESSA EMAIL o SPAZI VUOTI o EMAIL NON VALIDE, verrai reinirizzato a tale pagina tra qualche secono, sistema i dati e poi salva nuovamente</h1>
        `;
    setTimeout(function() {
        window.location.href = "/crea_gara_admin";
    }, 5000);
}

let tutti_dati_corretti_crea_gara=true;
for(const element in dati_nuova_gara["dati_completi_gara"]){
    if(dati_nuova_gara["dati_completi_gara"][element]!==1){
        tutti_dati_corretti_crea_gara=false;
    }
}

if(tutti_dati_corretti_crea_gara){
    //calcolo durata
    const data1 = new Date(`1970-01-01T${dati_nuova_gara["nome_dati_gara"]["inizio_prog_gara"]}`);
    const data2 = new Date(`1970-01-01T${dati_nuova_gara["nome_dati_gara"]["fine_prog_gara"]}`);

    const differenzaInMillisecondi = data2 - data1;

    dati_nuova_gara["nome_dati_gara"]["durata_prog_gara"]=differenzaInMillisecondi / (1000 * 60);
    
    if(!dati_nuova_gara["id_gara"]){
        dati_nuova_gara["email_creatore"]=get_email();
    }
    
    if(!dati_nuova_gara["id_gara"]){
        fetch('/get_new_id_gara', {
            headers: {
                'Content-type': 'application/json'
            },
            method: 'GET'
        })
        .then(response => response.json())
        .then(response => {
            dati_nuova_gara["id_gara"]=response;
            //console.log(response);
            fetch('/insert', {
                headers: {
                    'Content-type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ object : dati_nuova_gara})
            })
            .then(response => response.json())
            .then(response => {
                if(response.result==="error"){
                    console.log(response.error)
                }

                //resetto local storage
                localStorage.setItem('dati_nuova_gara', JSON.stringify({}));
                setTimeout(function() {
                    window.location.href = "";
                }, 5000);
            });
        });
    }else{
        fetch('/insert', {
            headers: {
                'Content-type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ object : dati_nuova_gara})
        })
        .then(response => response.json())
        .then(response => {
            if(response.result==="error"){
                console.log(response.error)
            }

            //resetto local storage
            localStorage.setItem('dati_nuova_gara', JSON.stringify({}));
            setTimeout(function() {
                window.location.href = "";
            }, 5000);
        });
    }
}
