function handleCredentialResponse(response){
    //console.log(response)
    // Post JWT token to server-side
    const decode = token => decodeURIComponent(atob(token.split('.')[1].replace('-', '+').replace('_', '/')).split('').map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`).join(''));
    const email=JSON.parse(decode(response.credential)).email;
    //console.log(email);
    localStorage.setItem('email', JSON.stringify(email));
    //console.log(JSON.stringify(email))
    render_lognin();
    render_pages();
    window.location.href = `/home`;
}

function get_email(){
    const email = JSON.parse(localStorage.getItem('email')) || null
    return email
}

function login(){
    document.querySelector(".button-login").style.display = "none";
    document.querySelector(".google-login").style.display = "flex";
}

function logout(){
    render_lognin();
    localStorage.setItem('email', JSON.stringify(""));
    render_pages();
}

function render_lognin(){
    if(get_email()){
        document.querySelector(".button-login").style.display = "none";
        document.querySelector(".google-login").style.display = "none";
        document.querySelector(".button-logout").style.display = "flex";
    }else{
        document.querySelector(".button-login").style.display = "flex";
        document.querySelector(".google-login").style.display = "none";
        document.querySelector(".button-logout").style.display = "none";
    }
}

render_lognin()