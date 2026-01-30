var AUTH_STORAGE_KEY = "auth";
var AUTH_ADMIN_STORAGE_KEY = "auth_admin";

function isAuthenticated(){
	return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

function redirectIfAuthenticated(){
	if(isAuthenticated()){
		window.location.replace("index.html");
	}
}

function handleLoginSubmit(event){
	event.preventDefault();

	var usernameInput = document.getElementById("username");
	var passwordInput = document.getElementById("password");

	var username = usernameInput ? usernameInput.value.trim() : "";
	var password = passwordInput ? passwordInput.value.trim() : "";

	if(!username || !password){
        console.error("Campi richiesti");
		alert("Inserisci username e password");
		return;
	}

	localStorage.setItem(AUTH_STORAGE_KEY, "true");
    if(username === "admin" && password === "admin"){
        localStorage.setItem(AUTH_ADMIN_STORAGE_KEY, "admin");
    }
	window.location.replace("index.html");
}

document.addEventListener("DOMContentLoaded", function(){
	redirectIfAuthenticated();

	var form = document.querySelector("form");
	if(form){
		form.querySelectorAll('input[type="submit"]')[0].addEventListener("click", handleLoginSubmit);
	}
});