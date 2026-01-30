var AUTH_STORAGE_KEY = "auth";
var AUTH_ADMIN_STORAGE_KEY = "auth_admin";

function isAuthenticated(){
    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

function isAuthenticatedAdmin(){
    return localStorage.getItem(AUTH_ADMIN_STORAGE_KEY) === "admin";
}

function requireAuth(){
    if(!isAuthenticated()){
        window.location.replace("login.html");
    }
}

function redirectIfAuthenticated(){
    if(isAuthenticated()){
        window.location.replace("index.html");
    }
}

function logout(){
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_ADMIN_STORAGE_KEY);
    window.location.replace("login.html");
}