const path="/Users/davideseppi/";
const port=5050;

const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const PDFParser = require('pdf-parse');
dotenv.config();

const upload = multer();

const dbService = require('./dbService');

app.use('/css', express.static(`${path}oli_mate/public/css`));
app.use(express.json());
app.use(express.urlencoded({ extended : false }));
app.use(cors());

/*const scripts=["google_login","render_pages","crea_gara"]
scripts.forEach(element=>{
    app.post(`/script/${element}`, (request, response) => {
        res.type('application/javascript');
        response.sendFile(`${path}oli_mate/public/script/${element}.js`);
    });
    
    app.get(`/script/${element}`, (request, response) => {
        response.type('application/javascript');
        response.sendFile(`${path}oli_mate/public/script/${element}.js`);
    });
});*/

/*app.get('/script/google_login.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(`${path}oli_mate/public/script/google_login.js`);
});

app.get('/script/render_pages.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(`${path}oli_mate/public/script/render_pages.js`);
});

app.get('/script/crea_gara.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(`${path}oli_mate/public/script/crea_gara.js`);
});*/

const scripts=["google_login","render_pages","crea_gara_nome","crea_gara_testo","crea_gara_squadre","crea_gara_admin","crea_gara_salva","gestisci_gare","crea_gara","gestisci_gare_gara_live","gestisci_gare_gara_live_inserimento","gestisci_gare_modifica","home","gara_live_live","storico_gare","storico_gare_gara","fake_login"]

scripts.forEach(element=>{
    app.get(`/script/${element}.js`, (req, res) => {
        res.type('application/javascript');
        res.sendFile(`${path}oli_mate/public/script/${element}.js`);
    });
});

app.post(`/`, (request, response) => {
    response.sendFile(`${path}oli_mate/public/home.html`);
});

app.get(`/`, (request, response) => {
    response.sendFile(`${path}oli_mate/public/home.html`);
});

const pages=["crea_gara_admin","crea_gara_nome","crea_gara_squadre","crea_gara_testo","crea_gara","gara_live_live","gestisci_gare_gara_live_inserimento","gestisci_gare_modifica","gestisci_gare","home","storico_gare_gara","storico_gare","crea_gara_salva","prova","fake_login"]

pages.forEach(element=>{
    app.post(`/${element}`, (request, response) => {
        response.sendFile(`${path}oli_mate/public/${element}.html`);
    });
    
    app.get(`/${element}`, (request, response) => {
        response.sendFile(`${path}oli_mate/public/${element}.html`);
    });
});

app.post(`/immagini/freccia.png`, (request, response) => {
    response.sendFile(`${path}oli_mate/public/immagini/freccia.png`);
});

app.get(`/immagini/freccia.png`, (request, response) => {
    response.sendFile(`${path}oli_mate/public/immagini/freccia.png`);
});

app.post(`/immagini/zoom-in.svg`, (request, response) => {
    response.sendFile(`${path}oli_mate/public/immagini/zoom-in.svg`);
});

app.get(`/immagini/zoom-in.svg`, (request, response) => {
    response.sendFile(`${path}oli_mate/public/immagini/zoom-in.svg`);
});

app.post(`/immagini/zoom-out.svg`, (request, response) => {
    response.sendFile(`${path}oli_mate/public/immagini/zoom-out.svg`);
});

app.get(`/immagini/zoom-out.svg`, (request, response) => {
    response.sendFile(`${path}oli_mate/public/immagini/zoom-out.svg`);
});

function isNumeric(str) {
    return /^\d+$/.test(str);
}

app.post('/upload_pdf', upload.single('pdfFile'), async (req, res) => {
    last4NumericCharactersArray=[];
    
    if (!req.file) {
        const last4NumericCharactersArray = [-1];
    }else{

        // Access the uploaded file's buffer directly
        const pdfDataBuffer = req.file.buffer;
    
        // Use pdf-parse to parse the PDF content
        const pdfData = await PDFParser(pdfDataBuffer);

        const entirePdfText=pdfData.text;

        const markerText = 'Nr.ProblemaSoluzione';

        // Find the index of the marker text
        const markerIndex = entirePdfText.indexOf(markerText);

        if (markerIndex !== -1) {
            // Extract the text after the marker text
            const textAfterMarker = entirePdfText.substring(markerIndex + markerText.length+1);

            //console.log('Text after marker:', textAfterMarker);

            const lines = textAfterMarker.split('\n');

            // Extract the last 4 numeric characters from each line
            lines.forEach(line => {
                let numericCharacters = '';
                for (let i = line.length - 1; i >= 0; i--) {
                const character = line.charAt(i);
                if (isNumeric(character)) {
                    numericCharacters = character + numericCharacters;
                    if (numericCharacters.length === 4) {
                    break; // Stop when 4 numeric characters are collected
                    }
                } else {
                    break; // Stop when a non-numeric character is encountered
                }
                }
                if (numericCharacters.length === 4) {
                    last4NumericCharactersArray.push(numericCharacters);
                }
            });
            //console.log(last4NumericCharactersArray)

        } else {
            last4NumericCharactersArray=[-1]
        }
    }
  
    res.json({risposte:last4NumericCharactersArray});
});

app.get('/get_new_id_gara', (request, response) => {
    const db = dbService.getDbServiceInstance();
    
    const result = db.get_new_id_gara();

    result
    .then(data => {console.log(data);response.json(data);})
    .catch(err => {console.log(err); response.status(500).json(err);});
    
});

app.post('/insert', (request, response) => {
    const { object } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.inserisci_nuova_gara(object);

    console.log(result)

    result
    .then(data => {response.json(data)})
    .catch(err => {console.log(err); response.status(500).json(err);});
    
});

app.post('/get_mie_gare', (request, response) => {
    const { email } = request.body;

    const db = dbService.getDbServiceInstance();

    const result = db.get_mie_gare(email);
    
    result
    .then(data => response.json(data))
    .catch(err => console.log(err));
})

app.post('/get_mie_gare_storiche', (request, response) => {
    const { email } = request.body;

    const db = dbService.getDbServiceInstance();

    const result = db.get_mie_gare_storiche(email);
    
    result
    .then(data => response.json(data))
    .catch(err => console.log(err));
})

app.post('/get_object_gara', (request, response) => {
    const { id_gara } = request.body;

    const db = dbService.getDbServiceInstance();

    const result = db.get_object_gara(id_gara);
    
    result
    .then(data => response.json(data))
    .catch(err => response.json("not exists"));
})

app.post('/inizia_gara', (request, response) => {
    const { id_gara } = request.body;
    const { inizio_eff_gara } = request.body;
    const { data_eff_gara } = request.body;

    const db = dbService.getDbServiceInstance();

    const result = db.inizia_gara(id_gara,inizio_eff_gara,data_eff_gara);
    
    result
    .then(data => response.json(data))
    .catch(err => console.log(err));
})

app.post('/termina_gara', (request, response) => {
    const { id_gara } = request.body;
    const { fine_eff_gara } = request.body;

    const db = dbService.getDbServiceInstance();

    const result = db.termina_gara(id_gara,fine_eff_gara);
    
    result
    .then(data => response.json(data))
    .catch(err => console.log(err));
})

app.post('/termina_gara_in_anticipo', (request, response) => {
    const { id_gara } = request.body;
    const { fine_eff_gara } = request.body;
    const { durata_eff_gara } = request.body;

    const db = dbService.getDbServiceInstance();

    const result = db.termina_gara_in_anticipo(id_gara,fine_eff_gara,durata_eff_gara);
    
    result
    .then(data => response.json(data))
    .catch(err => console.log(err));
})

app.post('/elimina_gara', (request, response) => {
    const { id_gara } = request.body;

    const db = dbService.getDbServiceInstance();

    const result = db.elimina_gara(id_gara);
    
    result
    .then(data => response.json(data))
    .catch(err => console.log(err));
})

app.post('/gestisci_gare_gara_live/:id_gara', (request, response) => {
    const id_gara = request.params.id_gara; // Ottieni il valore dinamico nnnn dalla URL

    response.sendFile(`${path}oli_mate/public/gestisci_gare_gara_live.html`);
});

app.get('/gestisci_gare_gara_live/:id_gara', (request, response) => {
    const id_gara = request.params.id_gara; // Ottieni il valore dinamico nnnn dalla URL

    response.sendFile(`${path}oli_mate/public/gestisci_gare_gara_live.html`);
});

app.post('/inserisci_nuova_risposta', (request, response) => {
    const { nuova_risposta } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.inserisci_nuova_risposta(nuova_risposta);

    console.log(result)

    result
    .then(data => {response.json(data)})
    .catch(err => {console.log(err); response.status(500).json(err);});
});

app.post('/inserisci_nuovo_jolly', (request, response) => {
    const { nuovo_jolly } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.inserisci_nuovo_jolly(nuovo_jolly);

    console.log(result)

    result
    .then(data => {response.json(data)})
    .catch(err => {console.log(err); response.status(500).json(err);});   
});

app.post('/gestisci_gare_gara_live_inserimento/:id_gara', (request, response) => {
    const id_gara = request.params.id_gara; // Ottieni il valore dinamico nnnn dalla URL

    response.sendFile(`${path}oli_mate/public/gestisci_gare_gara_live_inserimento.html`);
});

app.get('/gestisci_gare_gara_live_inserimento/:id_gara', (request, response) => {
    const id_gara = request.params.id_gara; // Ottieni il valore dinamico nnnn dalla URL

    response.sendFile(`${path}oli_mate/public/gestisci_gare_gara_live_inserimento.html`);
});

app.get('/gestisci_gare_modifica/:id_gara', (request, response) => {
    const id_gara = request.params.id_gara; // Ottieni il valore dinamico nnnn dalla URL

    response.sendFile(`${path}oli_mate/public/gestisci_gare_modifica.html`);
});

app.get('/gestisci_gare_modifica_storica/:id_gara', (request, response) => {
    const id_gara = request.params.id_gara; // Ottieni il valore dinamico nnnn dalla URL

    response.sendFile(`${path}oli_mate/public/gestisci_gare_modifica.html`);
});

app.post('/get_risposte_jolly', (request, response) => {
    const { id_gara } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.get_risposte_jolly(id_gara);

    console.log(result)

    result
    .then(data => {response.json(data)})
    .catch(err => {console.log(err); response.status(500).json(err);});   
});

app.post('/elimina_risposta_jolly', (request, response) => {
    const { id_risposta_jolly } = request.body;
    const { tipo } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.elimina_risposta_jolly(id_risposta_jolly,tipo);

    console.log(result)

    result
    .then(data => {response.json(data)})
    .catch(err => {console.log(err); response.status(500).json(err);});   
});

app.post('/aggiorna_risposta_jolly', (request, response) => {
    const { id_risposta_jolly } = request.body;
    const { nome_squadra } = request.body;
    const { numero_domanda } = request.body;
    const { risposta } = request.body;
    const { tipo } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.aggiorna_risposta_jolly(id_risposta_jolly,nome_squadra,numero_domanda,risposta,tipo);

    console.log(result)

    result
    .then(data => {response.json(data)})
    .catch(err => {console.log(err); response.status(500).json(err);});   
});

app.get('/gara_live_live/:id_gara', (request, response) => {
    const id_gara = request.params.id_gara; // Ottieni il valore dinamico nnnn dalla URL

    response.sendFile(`${path}oli_mate/public/gara_live_live.html`);
});

app.get('/gara_live_live_storica/:id_gara', (request, response) => {
    const id_gara = request.params.id_gara; // Ottieni il valore dinamico nnnn dalla URL

    response.sendFile(`${path}oli_mate/public/gara_live_live.html`);
});

app.get('/storico_gare_gara/:id_gara', (request, response) => {
    const id_gara = request.params.id_gara; // Ottieni il valore dinamico nnnn dalla URL

    response.sendFile(`${path}oli_mate/public/storico_gare_gara.html`);
});

app.post('/get_inizio_eff_durata_prog', (request, response) => {
    const { id_gara } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.get_inizio_eff_durata_prog(id_gara);

    console.log(result)

    result
    .then(data => {response.json(data)})
    .catch(err => {console.log(err); response.status(500).json(err);});   
});

app.post('/get_risposte_corrette', (request, response) => {
    const { id_gara } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.get_risposte_corrette(id_gara);

    console.log(result)

    result
    .then(data => {response.json(data)})
    .catch(err => {console.log(err); response.status(500).json(err);});   
});

app.post('/get_risposte_sbagliate_almeno_una_volta', (request, response) => {
    const { id_gara } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.get_risposte_sbagliate_almeno_una_volta(id_gara);

    console.log(result)

    result
    .then(data => {response.json(data)})
    .catch(err => {console.log(err); response.status(500).json(err);});   
});

app.post('/get_jolly', (request, response) => {
    const { id_gara } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.get_jolly(id_gara);

    console.log(result)

    result
    .then(data => {response.json(data)})
    .catch(err => {console.log(err); response.status(500).json(err);});   
});

app.post('/get_risposte_sbagliate_squadre', (request, response) => {
    const { id_gara } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.get_risposte_sbagliate_squadre(id_gara);

    console.log(result)

    result
    .then(data => {response.json(data)})
    .catch(err => {console.log(err); response.status(500).json(err);});   
});

app.post('/get_squadre_tutte_risposte_corrette', (request, response) => {
    const { id_gara } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.get_squadre_tutte_risposte_corrette(id_gara);

    console.log(result)

    result
    .then(data => {response.json(data)})
    .catch(err => {console.log(err); response.status(500).json(err);});   
});

app.get('/fake_login/:email', (request, response) => {
    const email = request.params.email; // Ottieni il valore dinamico nnnn dalla URL
    response.sendFile(`${path}oli_mate/public/fake_login.html`);
});

app.listen(port, () => console.log('app is running'));
