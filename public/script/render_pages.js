function zoom_in(){ 
    let zoom = JSON.parse(localStorage.getItem('zoom')) || 100;
    zoom+=10;
    localStorage.setItem('zoom', JSON.stringify(zoom));
    render_pages();
    console.log(zoom)
}

function zoom_out(){ 
    let zoom = JSON.parse(localStorage.getItem('zoom')) || 100;
    zoom-=10;
    localStorage.setItem('zoom', JSON.stringify(zoom));
    render_pages();
    //console.log(zoom)
}

function render_pages(){
    const hide = [".crea-gara",".gestisci-gare",".storico-gare"];
    const urlPaginaCorrente = window.location.href;
    const partiUrl = urlPaginaCorrente.split('/');
    if(!get_email()){
        for(let i=0;i<hide.length;i++){
            if(partiUrl[partiUrl.length-2]!="gara_live_live"){//gare live visibili senza login
                const overlayElement = document.getElementById('overlay');
                if (overlayElement) {
                    overlayElement.style.display = 'block';
                }
            }
            
            const hederButton = document.querySelector(hide[i]);
            if(hederButton){
                hederButton.classList.add('display-none');
            }
        }    
    }else{
        for(let i=0;i<hide.length;i++){
            const overlayElement = document.getElementById('overlay');
            if (overlayElement) {
                overlayElement.style.display = 'none';
            }
            const hederButton = document.querySelector(hide[i]);
            if(hederButton){
                hederButton.classList.remove('display-none');
            }
        }  
    }

    //<p align="right" style="position: absolute; margin: 0px; bottom: 0px;">by Davide Seppi</p>  
    var newElement = document.createElement("p");
        newElement.setAttribute("align", "right");
        newElement.setAttribute("style", "position: absolute; margin: 0px; bottom: 10px; right: 15px; z-index:-100");
        newElement.innerHTML = "by Davide Seppi";

        document.body.appendChild(newElement);

    //setto lo zoom
    let zoom = JSON.parse(localStorage.getItem('zoom')) || 100;
    document.body.style.zoom = `${zoom}%`    
}

render_pages();