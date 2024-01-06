document.querySelector(".vai-alla-gara").addEventListener("click",()=>{
    const codice_gara=document.querySelector(".input-codice").value;
    if(codice_gara){
        window.location.href = `/gara_live_live/${codice_gara}`;
    }
});

document.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        const codice_gara=document.querySelector(".input-codice").value;
        if(codice_gara){
            window.location.href = `/gara_live_live/${codice_gara}`;
        }
    }
  });