//sudo /Applications/XAMPP/xamppfiles/bin/mysql.server start

const mysql = require('mysql');
const dotenv = require('dotenv');
let instance = null;
dotenv.config();

/*const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "oli_mate",
    port: "3306"
});*/

var conn=mysql.createConnection({
  host:"olimate-server.mysql.database.azure.com", 
  user:"xmuyjfxfzu", 
  password:"8c7cuWKgo803", 
  database:"oli_mate", 
  port:3306, 
  ssl:{ca:fs.readFileSync("{ca-cert filename}")}});

connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    // console.log('db ' + connection.state);
});


class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    //solo gare da giocare o in corso
    async get_mie_gare(email) {
        return await new Promise((resolve, reject) => {
                const query = "SELECT * FROM gare g,admin_gara a where g.id_gara=a.id_gara and a.email=? and (giocata_gara=0 or giocata_gara=1) ORDER BY g.data_prog_gara ASC, a.ruolo ASC;";

                connection.query(query, [email],(err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
    }

    //solo gare da giocare o in corso
    async get_mie_gare_storiche(email) {
        return await new Promise((resolve, reject) => {
                const query = "SELECT * FROM gare g,admin_gara a where g.id_gara=a.id_gara and a.email=? and (giocata_gara=2) ORDER BY g.data_prog_gara DESC, a.ruolo ASC;";

                connection.query(query, [email],(err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
    }

    async get_object_gara(id_gara) {
        return await new Promise((resolve, reject) => {
                const object={"nome_dati_gara":{},"testo_gara":[],"squadre_gara":[],"admin_gara":[],"inseritori_gara":[]}
                object["id_gara"]=id_gara;

                let query = "SELECT * FROM gare where id_gara=?";
                connection.query(query, [id_gara],(err, results) => {
                    if (err) reject(new Error(err.message));
                    //console.log(results);
                    
                    try{//se la gara non esiste la promessa viene rifiutata
                        object["nome_dati_gara"]["nome_gara"]=results[0].nome_gara;
                        object["nome_dati_gara"]["data_prog_gara"]=results[0].data_prog_gara;
                        object["nome_dati_gara"]["inizio_prog_gara"]=results[0].inizio_prog_gara;
                        object["nome_dati_gara"]["fine_prog_gara"]=results[0].fine_prog_gara;
                        object["nome_dati_gara"]["giocata_gara"]=results[0].giocata_gara;
                        object["email_creatore"]=results[0].email_creatore;
                    }
                    catch(err){
                        reject(new Error(err.message));
                    }

                    query = "SELECT * FROM domande where id_gara=? order by numero_domanda ASC";
                    connection.query(query, [id_gara],(err, results) => {
                        if (err) reject(new Error(err.message));
                        for(const element of results){
                            object["testo_gara"].push(element.risposta);
                        }

                        query = "SELECT * FROM admin_gara where id_gara=? and ruolo=1";
                        connection.query(query, [id_gara],(err, results) => {
                            if (err) reject(new Error(err.message));
                            for(const element of results){
                                object["admin_gara"].push(element.email);
                            }

                            query = "SELECT * FROM admin_gara where id_gara=? and ruolo=2";
                            connection.query(query, [id_gara],(err, results) => {
                                if (err) reject(new Error(err.message));
                                for(const element of results){
                                    object["inseritori_gara"].push(element.email);
                                }

                                query = "SELECT * FROM squadre where id_gara=?";
                                connection.query(query, [id_gara],(err, results) => {
                                    if (err) reject(new Error(err.message));
                                    for(const element of results){
                                        object["squadre_gara"].push(element.nome_squadra);
                                    }

                                    //console.log(object);
                                    resolve(object);
                                })
                            })
                        })
                    })
                })
            });
    }

    async inizia_gara(id_gara,inizio_eff_gara,data_eff_gara) {
        return await new Promise((resolve, reject) => {
            let query = "UPDATE gare SET giocata_gara=1, inizio_eff_gara=?, data_eff_gara=? where id_gara=?";
            connection.query(query, [inizio_eff_gara,data_eff_gara,id_gara],(err, results) => {
                if (err) reject(new Error(err.message));
                resolve({})
            });
        });
    }

    async termina_gara(id_gara,fine_eff_gara) {
        return await new Promise((resolve, reject) => {
            let query = "UPDATE gare SET giocata_gara=2, fine_eff_gara=? where id_gara=? and not exists(select * from gare where id_gara=? and giocata_gara=2)";
            connection.query(query, [fine_eff_gara,id_gara,id_gara],(err, results) => {
                if (err) reject(new Error(err.message));
                resolve({})
            });
        });
    }

    async termina_gara_in_anticipo(id_gara,fine_eff_gara,durata_eff_gara) {
        return await new Promise((resolve, reject) => {
            //modifica durata_prog_gara voluta, leggere terminal.txt
            let query = "UPDATE gare SET giocata_gara=2, fine_eff_gara=?, durata_prog_gara=? where id_gara=? and not exists(select * from gare where id_gara=? and giocata_gara=2)";
            connection.query(query, [fine_eff_gara,durata_eff_gara,id_gara,id_gara],(err, results) => {
                if (err) reject(new Error(err.message));
                resolve({})
            });
        });
    }

    async elimina_gara(id_gara) {
        return await new Promise((resolve, reject) => {
            let query="";

            //elimino dati vecchi e sostituisco con i nuovi
            query = "DELETE FROM squadre where id_gara=?";
            connection.query(query, [id_gara] , (err, result) => {
                if (err) reject({result:"error",error:err.message});

                query = "DELETE FROM admin_gara where id_gara=?";
                connection.query(query, [id_gara] , (err, result) => {
                    if (err) reject({result:"error",error:err.message});

                    query = "DELETE FROM domande where id_gara=?";
                    connection.query(query, [id_gara] , (err, result) => {
                        if (err) reject({result:"error",error:err.message});

                        query = "DELETE FROM gare where id_gara=?";
                        connection.query(query, [id_gara] , (err, result) => {
                            if (err) reject({result:"error",error:err.message});
                            resolve({})
                        });
                    });
                });
            });
        });
    }

    async get_new_id_gara(object){
        return await new Promise((resolve, reject) => {
            let query="";
            //seleziono l'indice più grande e se non ne esistono 0
            query = "select max(mass) as mx from(select max(id_gara) as mass from gare UNION select 0 as mass)as t;";
            connection.query(query, (err, results) => {
                if (err) reject(new Error(err.message));
                const new_id_gara=results[0].mx+1;

                query = "INSERT INTO gare (id_gara) SELECT ?";
                connection.query(query, [new_id_gara] , (err, result) => {
                    if (err) reject({result:"error",error:err.message});
                    resolve(new_id_gara);
                })
            });
        });
    }


    async inserisci_nuova_gara(object) {
        return new Promise(async (resolve, reject) => {
            let query="";

            const foreign_key_delete = [
                //elimino dati vecchi e sostituisco con i nuovi
                connection.query("DELETE FROM squadre where id_gara=?", [object.id_gara]),
                connection.query("DELETE FROM admin_gara where id_gara=?", [object.id_gara]),
                connection.query("DELETE FROM domande where id_gara=?", [object.id_gara])
            ]
            await Promise.all(foreign_key_delete);

            query = "DELETE FROM gare where id_gara=?";
            await connection.query(query, [object.id_gara] , (err, result) => {
                if (err) reject({result:"error",error:err.message});
            });

            query = "INSERT INTO gare (id_gara,nome_gara,data_prog_gara,inizio_prog_gara,fine_prog_gara,durata_prog_gara,giocata_gara,codice_gara,email_creatore) SELECT ?,?,?,?,?,?,?,?,? where not exists(select * from gare where nome_gara=? and data_prog_gara=? and inizio_prog_gara=? and fine_prog_gara=? and durata_prog_gara=? and giocata_gara=? and email_creatore=?)";
            await connection.query(query, [object.id_gara,object.nome_dati_gara.nome_gara,object.nome_dati_gara.data_prog_gara,object.nome_dati_gara.inizio_prog_gara,object.nome_dati_gara.fine_prog_gara,object.nome_dati_gara.durata_prog_gara,0,`squadre${object.id_gara}`,object.email_creatore,   object.nome_dati_gara.nome_gara,object.nome_dati_gara.data_prog_gara,object.nome_dati_gara.inizio_prog_gara,object.nome_dati_gara.fine_prog_gara,object.nome_dati_gara.durata_prog_gara,0,object.email_creatore] , (err, result) => {
                if (err) reject({result:"error",error:err.message});
            });

            for(let i=0; i<object["testo_gara"].length; i++){
                query="INSERT INTO domande (numero_domanda,id_gara,risposta) SELECT ?,?,? where not exists(select * from domande where numero_domanda=? and id_gara=? and risposta=?);";
                await connection.query(query, [i+1,object.id_gara,object["testo_gara"][i],   i+1,object.id_gara,object["testo_gara"][i]] , (err, result) => {
                    if (err) reject({result:"error",error:err.message});
                });
            }

            //creatore
            query="INSERT INTO admin_gara (id_gara,ruolo,email) SELECT ?,?,? where not exists(select * from admin_gara where id_gara=? and ruolo=? and email=?);";
            await connection.query(query, [object.id_gara,0,object.email_creatore,   object.id_gara,0,object.email_creatore] , (err, result) => {
                if (err) reject({result:"error",error:err.message});
            });

            //admin
            for(const element of object["admin_gara"]){
                query="INSERT INTO admin_gara (id_gara,ruolo,email) SELECT ?,?,? where not exists(select * from admin_gara where id_gara=? and ruolo=? and email=?);";
                await connection.query(query, [object.id_gara,1,element,   object.id_gara,1,element] , (err, result) => {
                    if (err) reject({result:"error",error:err.message});
                });
            }

            //inseritori
            for(const element of object["inseritori_gara"]){
                query="INSERT INTO admin_gara (id_gara,ruolo,email) SELECT ?,?,? where not exists(select * from admin_gara where id_gara=? and ruolo=? and email=?);";
                await connection.query(query, [object.id_gara,2,element,   object.id_gara,2,element] , (err, result) => {
                    if (err) reject({result:"error",error:err.message});
                });
            }
            //squadre
            for(const element of object["squadre_gara"]){
                query="INSERT INTO squadre (id_gara,nome_squadra) SELECT ?,? where not exists(select * from squadre where id_gara=? and nome_squadra=?);";
                await connection.query(query, [object.id_gara,element,   object.id_gara,element] , (err, result) => {
                    if (err) reject({result:"error",error:err.message});
                }); 
            }
            resolve({})
        });
    }

    async inserisci_nuova_risposta(nuova_risposta) {
        return new Promise((resolve, reject) => {
            let query="";
            query = "SELECT risposta from domande where id_gara=? and numero_domanda=?";
            connection.query(query, [nuova_risposta.id_gara,nuova_risposta.numero_domanda] , (err, result) => {
                if (err) reject({result:"error",error:err.message});
                if(result){//se la domanda esiste (teoricamente sempre)
                    const risposta=result[0]["risposta"];
                    const corretta=nuova_risposta.risposta==risposta?1:0;

                    query = `INSERT INTO risposte (id_gara,nome_squadra,numero_domanda,risposta,ora,corretta) SELECT ?,?,?,?,?,${corretta} where not exists(select * from risposte where id_gara=? and nome_squadra=? and numero_domanda=? and risposta=? and ora=? and corretta=${corretta})`;
                    connection.query(query, [nuova_risposta.id_gara,nuova_risposta.nome_squadra,nuova_risposta.numero_domanda,nuova_risposta.risposta,nuova_risposta.ora,      nuova_risposta.id_gara,nuova_risposta.nome_squadra,nuova_risposta.numero_domanda,nuova_risposta.risposta,nuova_risposta.ora] , (err, result) => {
                        if (err) reject({result:"error",error:err.message});
                        resolve({});
                    });
                }
            });
        });
    }

    async inserisci_nuovo_jolly(nuovo_jolly) {
        return new Promise((resolve, reject) => {
            let query="";
            query = `INSERT INTO jolly (id_gara,nome_squadra,numero_domanda,ora) SELECT ?,?,?,? where not exists(select * from jolly where id_gara=? and nome_squadra=? and numero_domanda=? and ora=?)`;
            connection.query(query, [nuovo_jolly.id_gara,nuovo_jolly.nome_squadra,nuovo_jolly.numero_domanda,nuovo_jolly.ora,     nuovo_jolly.id_gara,nuovo_jolly.nome_squadra,nuovo_jolly.numero_domanda,nuovo_jolly.ora] , (err, result) => {
                if (err) reject({result:"error",error:err.message});
                resolve({});
            });
        });
    }

    async get_risposte_jolly(id_gara) {
        return new Promise((resolve, reject) => {
            let query="";
            query = `select * from (SELECT id_risposta as id_risposta_jolly,nome_squadra,numero_domanda,ora,risposta,"risposta" as tipo from risposte where id_gara=? union SELECT id_jolly as id_risposta_jolly,nome_squadra,numero_domanda,ora,"null" as risposta,"jolly" as tipo from jolly where id_gara=?)as t order by ora ASC`;
            connection.query(query, [id_gara,id_gara] , (err, result) => {
                if (err) reject({result:"error",error:err.message});
                resolve(result);
            });
        });
    }

    async elimina_risposta_jolly(id_risposta_jolly,tipo) {
        return new Promise((resolve, reject) => {
            let query="";
            if(tipo=="risposta"){
                query = `DELETE from risposte where id_risposta=?`;
                connection.query(query, [id_risposta_jolly] , (err, result) => {
                    if (err) reject({result:"error",error:err.message});
                    resolve({});
                });
            }else if(tipo=="jolly"){
                query = `DELETE from jolly where id_jolly=?`;
                connection.query(query, [id_risposta_jolly] , (err, result) => {
                    if (err) reject({result:"error",error:err.message});
                    resolve({});
                });
            }
        });
    }

    async aggiorna_risposta_jolly(id_risposta_jolly,nome_squadra,numero_domanda,risposta,tipo) {
        return new Promise((resolve, reject) => {
            let query="";
            if(tipo=="risposta"){
                query = `UPDATE risposte SET nome_squadra=?, numero_domanda=?, risposta=? where id_risposta=?`;
                connection.query(query, [nome_squadra,numero_domanda,risposta,id_risposta_jolly] , (err, result) => {
                    if (err) reject({result:"error",error:err.message});
                    query = "SELECT id_gara,numero_domanda from risposte where id_risposta=?";//ricavo id_gara e numeo domanda
                    
                    connection.query(query, [id_risposta_jolly] , (err, result) => {
                        if (err) reject({result:"error",error:err.message});
                        const id_gara=result[0]["id_gara"];
                        const numero_domanda=result[0]["numero_domanda"];

                        query = "SELECT risposta from domande where id_gara=? and numero_domanda=?";//ricavo id_gara e numeo domanda
                        connection.query(query, [id_gara,numero_domanda] , (err, result) => {        
                            if (err) reject({result:"error",error:err.message});
                            const risposta_corretta=result[0]["risposta"];

                            const bool_risposta_corretta=risposta==risposta_corretta?1:0;
                            query = `UPDATE risposte SET corretta=? where id_risposta=?`;
                            connection.query(query, [bool_risposta_corretta,id_risposta_jolly] , (err, result) => {        
                                if (err) reject({result:"error",error:err.message});
                                resolve({});
                            });
                        });
                    });
                });
            }else if(tipo=="jolly"){
                query = `UPDATE jolly SET nome_squadra=?, numero_domanda=? where id_jolly=?`;
                connection.query(query, [nome_squadra,numero_domanda,id_risposta_jolly] , (err, result) => {
                    if (err) reject({result:"error",error:err.message});
                    resolve({});
                });
            }
        });
    }

    async get_inizio_eff_durata_prog(id_gara) {
        return new Promise((resolve, reject) => {
            const query = `SELECT inizio_eff_gara,durata_prog_gara FROM gare WHERE id_gara=?;`;
            connection.query(query, [id_gara] , (err, result) => {
                if (err) reject({result:"error",error:err.message});
                resolve({inizio_eff_gara:result[0]["inizio_eff_gara"],durata_prog_gara:result[0]["durata_prog_gara"]});
            });
        });
    }

    async get_risposte_corrette(id_gara) {
        return new Promise((resolve, reject) => {
            const query = `SELECT nome_squadra,numero_domanda,min(ora) as ora FROM risposte WHERE id_gara=? and corretta=1 GROUP by numero_domanda,nome_squadra ORDER by ora,numero_domanda;`;
            connection.query(query, [id_gara] , (err, result) => {
                if (err) reject({result:"error",error:err.message});
                resolve({risposte_corrette:result});
            });
        });
    }

    async get_risposte_sbagliate_almeno_una_volta(id_gara) {
        return new Promise((resolve, reject) => {
            const query = `select numero_domanda,COUNT(DISTINCT(nome_squadra))as errori FROM risposte WHERE corretta=0 and id_gara=? GROUP by numero_domanda;`;
            connection.query(query, [id_gara] , (err, result) => {
                if (err) reject({result:"error",error:err.message});
                resolve({risposte_sbagliate_almeno_una_volta:result});
            });
        });
    }

    async get_jolly(id_gara) {
        return new Promise((resolve, reject) => {
            const query = `SELECT nome_squadra,numero_domanda,min(ora) as ora FROM jolly WHERE id_gara=? GROUP by nome_squadra ORDER by nome_squadra,ora;`;
            connection.query(query, [id_gara] , (err, result) => {
                if (err) reject({result:"error",error:err.message});
                resolve({jolly:result});
            });
        });
    }

    async get_risposte_sbagliate_squadre(id_gara) {
        return new Promise((resolve, reject) => {
            const query = `SELECT numero_domanda, nome_squadra,ora FROM risposte where corretta=0 and id_gara=? ORDER BY ora, numero_domanda, nome_squadra;`;
            connection.query(query, [id_gara] , (err, result) => {
                if (err) reject({risposte_sbagliate_squadre:"error",error:err.message});
                resolve({risposte_sbagliate_squadre:result});
            });
        });
    }

    async get_squadre_tutte_risposte_corrette(id_gara) {
        return new Promise((resolve, reject) => {
            const query = `select nome_squadra,numero_domanda,max(ora) as ora,count(nome_squadra) as numero_corrette from (SELECT nome_squadra,numero_domanda,min(ora) as ora FROM risposte WHERE id_gara=? and corretta=1 GROUP by numero_domanda,nome_squadra) as corrette group by nome_squadra having numero_corrette=(select count(numero_domanda) from domande where id_gara=?) ORDER by ora;`;
            connection.query(query, [id_gara,id_gara] , (err, result) => {
                if (err) reject({risposte_sbagliate_squadre:"error",error:err.message});
                resolve({squadre_tutte_risposte_corrette:result});
            });
        });
    }


    //////////
    
    async deleteRowById(id) {
        try {
            id = parseInt(id, 10); 
            const response = await new Promise((resolve, reject) => {
                const query = "DELETE FROM names WHERE id = ?";
    
                connection.query(query, [id] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                })
            });
    
            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async updateNameById(id, name) {
        try {
            id = parseInt(id, 10); 
            const response = await new Promise((resolve, reject) => {
                const query = "UPDATE names SET name = ? WHERE id = ?";
    
                connection.query(query, [name, id] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                })
            });
    
            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async searchByName(name) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM names WHERE name = ?;";

                connection.query(query, [name], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });

            return response;
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = DbService;