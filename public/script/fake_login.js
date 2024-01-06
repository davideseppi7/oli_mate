const urlPaginaCorrente = window.location.href;
const partiUrl = urlPaginaCorrente.split('/');
if(partiUrl[partiUrl.length-2]=="fake_login"){
    const email=partiUrl[partiUrl.length-1];
    //console.log(email);
    localStorage.setItem('email', JSON.stringify(email));
    window.location.href = `/home`;
}