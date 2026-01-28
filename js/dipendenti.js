var selectedRow;

function formatDate(d){
    function pad(s){ return (s < 10) ? '0' + s : s;}

    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join("-");
}

function isInt(value){
    try {
        if (isNaN(value)){
            return false;
        }
        var x = parseFloat(value);
        return Math.floor(x) === x;
    } catch (e) {
        return false;
    }
}

function validateFormDipendenti(fieldDaValidare){

    var form = document.getElementById("formDipendenti");

    function addErrorMessage(message, element){

        var prossimoElemento = element.nextSibling;

        if(prossimoElemento.classList && prossimoElemento.classList.contains("invalid-feedback")){
            prossimoElemento.innerHTML = message;
        } else{

            element.classList.add("invalid");

            var errorDiv = document.createElement("div");
            errorDiv.classList.add("invalid-feedback");
            errorDiv.innerHTML = message;

            element.parentNode.insertBefore(errorDiv, prossimoElemento);
        }
    }

    function removeErrorMessage(element){
        element.classList.remove("invalid");

        var prossimoElemento = element.nextSibling;

        prossimoElemento.classList.remove("invalid-feedback");
        element.parentNode.removeChild(prossimoElemento);

    }

    function validateField(fieldDaValidare){
        var isCampoValid = true;
        var fieldElement = form[fieldDaValidare];
        var fieldValue = fieldElement.value;

        switch(fieldDaValidare){
            case "LASTNAME":
            case "FIRSTNAME":
            case "ADDRESS":
            case "CITY":
            case "COUNTRY":
                break;
            case "BIRTHDATE":
            case "HIREDATE":
                break;
            case "REPORTS_TO":
                break;
        }

        return isCampoValid;

    }

}
