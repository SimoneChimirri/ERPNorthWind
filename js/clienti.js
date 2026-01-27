function validateFormClienti(fieldDaValidare){
    var form = document.getElementById("formClienti");

    function addErrorMessage(element, message){

        var prossimoElemento = element.nextSibling;

        if(prossimoElemento.classList && prossimoElemento.classList.contains("invalid-feedback")){
            prossimoElemento.innerHTML = message;
        } else{

            element.classList.add("invalid");

            var errorDiv = document.createElement("div");
            errorDiv.classList.add("invalid-feedback");

            errorDiv.innerHTML = message;

            element.parentNode.insertBefore(errorDiv, element.nextSibling);
        }
    }

    function removeErrorMessage(element){
        element.classList.remove("invalid");

        var prossimoElemento = element.nextSibling;

        if(prossimoElemento.classList && prossimoElemento.classList.contains("invalid-feedback")){
            prossimoElemento.parentNode.removeChild(prossimoElemento);
        }
    }

    function validateField(fieldDaValidare){
        var isCampoValid = true;
        var fieldElement = form[fieldDaValidare];
        var fieldValue = fieldElement.value;

        switch(fieldDaValidare){
            case "CUSTOMER_CODE":
                break;
        }

        return isCampoValid;

    }

    var isValid = true;

    if(fieldDaValidare){
        validateField(fieldDaValidare);
    } else{
        for(var i=0; i < formClientiFields.length; i++){
            var isCampoValid = validateField(formClientiFields[i].name);
            if(!isCampoValid){
                isValid = false;
            }
        }
    }

    return isValid;
}

function handlerFormClientiSubmitButtonClick(event){
    event.preventDefault();

    if(validateFormClienti()){
        var valori={}

        for(var i=0; i < formClientiFields.length; i++){
            var fieldIterato = formClientiFields[i];

            if(fieldIterato.tagName.toUpperCase() == 'SELECT'){
                valori[fieldIterato.name] = fieldIterato.options[fieldIterato.selectedIndex].innerText;
            } else if(fieldIterato.type === "date"){
                var dateValue = fieldIterato.valueAsDate;

                valori[fieldIterato.name] = formatDate(dateValue);
            } else{
                valori[fieldIterato.name] = fieldIterato.value;
            }
        }

        function aggiungiOAggiornaClienteSuFile(valori,callback){
            var httpReq = new XMLHttpRequest();

            httpReq.onreadystatechange = function(){
                if(httpReq.readyState === 4){
                    if(httpReq.status === 200){
                        console.info("Cliente aggiunto o aggiornato con successo");
                        var record = JSON.parse(httpReq.responseText);
                        callback(record);
                    } else{
                        console.error(httpReq.responseText);
                        alert("Errore durante l'aggiornamento o l'inserimento del cliente");
                    }
                }
            }

            httpReq.open("POST","json/clienti.json");
            httpReq.setRequestHeader("Cntent-Type","application/json");
            httpReq.send();
        }

        if(valori.CUSTOMER_ID && valori.CUSTOMER_ID !== "" && selectedRow){
            aggiungiOAggiornaClienteSuFile(valori,function(clienteAggiornato){
                aggiornaRigaTableClienti(clienteAggiornato);
                document.getElementById("formClienti").reset();
            })
        } else{
            aggiungiOAggiornaClienteSuFile(valori, function(clienteAggiunto){
                aggiungiRigaTableCliente(giocatoreAggiunto);
                document.getElementById("formClienti").reset();
            })
        }
    } else{

    }
}

var formClientiFields = document.getElementById("formClienti").querySelectorAll('input:not(.btn), select');

var submitButton = document.getElementById("formClienti").querySelectorAll('input[type="submit"]')[0];

submitButton.addEventListener("click", handlerFormClientiSubmitButtonClick);

function handlerFormGiocatoriChange(event){
    validateFormClienti(this.name);
}

function formatDate(d){
            function pad(s){ return (s < 10) ? '0' + s : s;}

            return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join("-");
        }

function aggiungiRigaTableCliente(){

}

function aggiornaRigaTableClienti(){

}

function handlerTableClientiRowClick(event){

}

document.getElementById("tableClienti").tBodies[0].addEventListener("click", handlerTableClientiRowClick);

function handlerTableClientiDeleteButtonClick(event){

}

document.getElementById("tableGiocatori").tBodies[0].getElementsByTagName("i")[0];

function ricercaClienti(){

}

function caricaClienti(){
    
}