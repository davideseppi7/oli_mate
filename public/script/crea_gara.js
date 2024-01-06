const dati_nuova_gara = JSON.parse(localStorage.getItem('dati_nuova_gara')) || {};

dati_nuova_gara["id_gara"]=null;

localStorage.setItem('dati_nuova_gara', JSON.stringify(dati_nuova_gara));