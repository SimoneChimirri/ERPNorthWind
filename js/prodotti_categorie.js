var selectedRow;

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

function validateFormProdotti(fieldDaValidare){
    var form = document.getElementById("formProdotti");

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
            case "PRODUCT_NAME":
            case "CATEGORY":
            case "SUPPLIER":
            case "QUANTITY_PER_UNIT":
                if(!fieldValue || fieldValue === ""){
                    addErrorMessage(fieldElement, "Campo richiesto");
                    isCampoValid = false;
                } else{
                    removeErrorMessage(fieldElement);
                }
                break;
            case "UNIT_PRICE":
                if(fieldValue && fieldValue !== ""){
                    if(!isNaN(fieldValue)){
                        if(fieldValue > 0){
                            removeErrorMessage(fieldElement);
                        } else{
                            addErrorMessage(fieldElement,"Deve essere un numero positivo");
                        }
                    } else{
                    addErrorMessage(fieldElement, "Deve essere un numero valido");
                    isCampoValid = false;
                    }
                } else{
                    addErrorMessage(fieldElement, "Campo richiesto");
                    isCampoValid = false;
                }
                break;
        }

        return isCampoValid;

    }

    var isValid = true;

    if(fieldDaValidare){
        validateField(fieldDaValidare);
    } else{
        for(var i=0; i < formProdottiFields.length; i++){
            var isCampoValid = validateField(formProdottiFields[i].name);
            if(!isCampoValid){
                isValid = false;
            }
        }
    }

    return isValid;
}

function handlerFormProdottiSubmitButtonClick(event){
    event.preventDefault();

    if(validateFormProdotti()){
        var valori={}

        for(var i=0; i < formProdottiFields.length; i++){
            var fieldIterato = formProdottiFields[i];
            if(fieldIterato.tagName.toUpperCase() == "CHECKBOX"){
                valori[fieldIterato.name] = fieldIterato.checked === true ? "Y" : "N";
            } else{
                valori[fieldIterato.name] = fieldIterato.value;
            }
        }

        function aggiungiOAggiornaProdottoSuFile(valori,callback){
            var httpReq = new XMLHttpRequest();

            httpReq.onreadystatechange = function(){
                if(httpReq.readyState === 4){
                    if(httpReq.status === 200){
                        console.info("Prodotto aggiunto o aggiornato con successo");
                        var record = JSON.parse(httpReq.responseText);
                        callback(record);
                    } else{
                        console.error(httpReq.responseText);
                        alert("Errore durante l'aggiornamento o l'inserimento del prodotto");
                    }
                }
            }

            httpReq.open("POST","json/prodotti.json");
            httpReq.setRequestHeader("Content-Type","application/json");
            httpReq.send(JSON.stringify(valori));
        }

        if(valori.PRODUCT_ID && valori.PRODUCT_ID !== "" && selectedRow){
            aggiungiOAggiornaProdottoSuFile(valori,function(prodottoAggiornato){
                aggiornaRigaTableProdotti(prodottoAggiornato);
                document.getElementById("formProdotti").reset();
            })
        } else{
            aggiungiOAggiornaProdottoSuFile(valori, function(prodottoAggiunto){
                aggiungiRigaTableProdotti(prodottoAggiunto);
                document.getElementById("formProdotti").reset();
            })
        }
    } else{

    }
}

var formProdottiFields = document.getElementById("formProdotti").querySelectorAll('input:not(.btn), select');

var submitButtonProdotti = document.getElementById("formProdotti").querySelectorAll('input[type="submit"]')[0];

submitButtonProdotti.addEventListener("click", handlerFormProdottiSubmitButtonClick);
function handlerFieldFormProdottiChange(event){
    validateFormProdotti(this.name);
}
for(var indiceFormField = 0; indiceFormField < formProdottiFields.length; indiceFormField ++){
    formProdottiFields[indiceFormField].addEventListener("input", handlerFieldFormProdottiChange);
    formProdottiFields[indiceFormField].addEventListener("blur", handlerFieldFormProdottiChange);
}


function aggiungiRigaTableProdotti(valori){

    var tr = document.createElement("tr");

    var tableProdotti = document.getElementById("tableProdotti");
    var headerFieldList = tableProdotti.tHead.getElementsByTagName("th");

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        var td = document.createElement("td");

        if(fieldName){
            if(valori[fieldName]){
                td.innerHTML =valori[fieldName];
            }
        } else{
            var iEl = document.createElement("i");
            iEl.classList.add("fa");
            iEl.classList.add("fa-trash");
            iEl.style["font-size"]="16px";
            iEl.addEventListener("click", handlerTableProdottiDeleteButtonClick);
            td.appendChild(iEl);
        }
        tr.appendChild(td);
    }

    tableProdotti.tBodies[0].insertBefore(tr, tableProdotti.tBodies[0].firstElementChild);
}

function aggiornaRigaTableProdotti(valori){

    var tr = selectedRow;
    var tDataList = tr.querySelectorAll("td");
    var tableProdotti = document.getElementById("tableProdotti");
    var headerFieldList = tableProdotti.tHead.getElementsByTagName("th");

    for(var i=0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");

        if(fieldName && fieldName !== ""){
            if(valori[fieldName]){
                tDataList[i].innerHTML = valori[fieldName];
            } else{
                tDataList[i].innerHTML = "";
            }
        }
    }
}

function handlerTableProdottiRowClick(event){
    event.stopPropagation();
    var target = event.target;

    if(target.querySelectorAll("i").length > 0){
        return;
    }

    var tBody = document.getElementById("tableProdotti").tBodies[0];

    var previousSelectedElement = tBody.querySelectorAll("tr.selected");

    if(previousSelectedElement.length > 0){
        previousSelectedElement[0].classList.remove("selected");
    }

    var tr;

    if(target.tagName.toUpperCase() === "TD"){
        tr = target.parentNode;
    } else{
        tr = target;
    }

    tr.classList.add("selected");
    selectedRow = tr;

    var tDataList = tr.querySelectorAll("td");
    var headerFieldList = document.getElementById("tableProdotti").tHead.getElementsByTagName("th");
    var form = document.getElementById("formProdotti");

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        if(fieldName && fieldName!== ""){
            var valore = tDataList[i].innerText;
            var formField = form[fieldName];
            if(fieldName === "DISCONTINUED"){
                if(valore && valore != null){
                    console.log("Valore DISCONTINUED: "+valore);
                    formField.checked = valore === "Y";
                    continue;
                }
            }

            formField.value = valore;
        }
    }

}

document.getElementById("tableProdotti").tBodies[0].addEventListener("click", handlerTableProdottiRowClick);

function handlerTableProdottiDeleteButtonClick(event){
    event.stopPropagation();
    var target = event.target;

    var tr = target.parentNode.parentNode;

    var productId = tr.firstElementChild.innerText;

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                tr.parentNode.removeChild(tr);
                console.info("Eliminazione avvenuta con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante l'eliminazione del prodotto");
            }
        }
    }

    httpReq.open("DELETE", "json/prodotti.json?PRODUCT_ID="+productId);

    httpReq.send();
}

document.getElementById("tableProdotti").tBodies[0].getElementsByTagName("i")[0];

function ricercaProdotti(){
    var valoreDaRicercare = document.getElementById("searchFieldProdotti").value.toLowerCase();

    var rows = document.getElementById("tableProdotti").tBodies[0].querySelectorAll("tr");

    for(var i=0; i < rows.length; i++){
        if(!valoreDaRicercare || valoreDaRicercare===""){
            rows[i].style.display = "";
        } else if(rows[i].innerText.toLowerCase().indexOf(valoreDaRicercare) !== -1){
            rows[i].style.display = "";
        } else{
            rows[i].style.display = "none";
        }
    }
}

function caricaProdotti(){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var listaProdotti = JSON.parse(httpReq.responseText);
                for(var i=listaProdotti.length; i > 0; i--){
                    aggiungiRigaTableProdotti(listaProdotti[i-1]);
                }
                console.info("Caricamento dei prodotti avvenuto con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante il caricamento dei prodotti");
            }
        }
    }

    httpReq.open("GET","json/prodotti.json");
    httpReq.send();
}

function validateFormCategorie(fieldDaValidare){
    var form = document.getElementById("formCategorie");

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

        if(fieldDaValidare === "CATEGORY_NAME"){
                if(!fieldValue || fieldValue === ""){
                    addErrorMessage(fieldElement, "Campo richiesto");
                    isCampoValid = false;
                } else{
                    removeErrorMessage(fieldElement);
                }
        }

        return isCampoValid;

    }

    var isValid = true;

    if(fieldDaValidare){
        validateField(fieldDaValidare);
    } else{
        for(var i=0; i < formCategorieFields.length; i++){
            var isCampoValid = validateField(formCategorieFields[i].name);
            if(!isCampoValid){
                isValid = false;
            }
        }
    }

    return isValid;
}

function handlerFormCategorieSubmitButtonClick(event){
    event.preventDefault();

    if(validateFormCategorie()){
        var valori={}

        for(var i=0; i < formCategorieFields.length; i++){
            var fieldIterato = formCategorieFields[i];
            valori[fieldIterato.name] = fieldIterato.value;
        }

        function aggiungiOAggiornaCategoriaSuFile(valori,callback){
            var httpReq = new XMLHttpRequest();

            httpReq.onreadystatechange = function(){
                if(httpReq.readyState === 4){
                    if(httpReq.status === 200){
                        console.info("Categoria aggiunta o aggiornata con successo");
                        var record = JSON.parse(httpReq.responseText);
                        callback(record);
                    } else{
                        console.error(httpReq.responseText);
                        alert("Errore durante l'aggiornamento o l'inserimento della categoria");
                    }
                }
            }

            httpReq.open("POST","json/categorie.json");
            httpReq.setRequestHeader("Content-Type","application/json");
            httpReq.send(JSON.stringify(valori));
        }

        if(valori.CATEGORY_ID && valori.CATEGORY_ID !== "" && selectedRow){
            aggiungiOAggiornaCategoriaSuFile(valori,function(categoriaAggiornata){
                aggiornaRigaTableCategorie(categoriaAggiornata);
                document.getElementById("formCategorie").reset();
            })
        } else{
            aggiungiOAggiornaCategoriaSuFile(valori, function(categoriaAggiunta){
                aggiungiRigaTableCategorie(categoriaAggiunta);
                document.getElementById("formCategorie").reset();
            })
        }
    } else{

    }
}

var formCategorieFields = document.getElementById("formCategorie").querySelectorAll('input:not(.btn), select');

var submitButtonCategorie = document.getElementById("formCategorie").querySelectorAll('input[type="submit"]')[0];

submitButtonCategorie.addEventListener("click", handlerFormCategorieSubmitButtonClick);
function handlerFieldFormCategorieChange(event){
    validateFormCategorie(this.name);
}
for(var indiceFormField = 0; indiceFormField < formCategorieFields.length; indiceFormField ++){
    formCategorieFields[indiceFormField].addEventListener("input", handlerFieldFormCategorieChange);
    formCategorieFields[indiceFormField].addEventListener("blur", handlerFieldFormCategorieChange);
}


function aggiungiRigaTableCategorie(valori){

    var tr = document.createElement("tr");

    var tableCategorie = document.getElementById("tableCategorie");
    var headerFieldList = tableCategorie.tHead.getElementsByTagName("th");

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        var td = document.createElement("td");

        if(fieldName){
            if(valori[fieldName]){
                td.innerHTML =valori[fieldName];
            }
        } else{
            var iEl = document.createElement("i");
            iEl.classList.add("fa");
            iEl.classList.add("fa-trash");
            iEl.style["font-size"]="16px";
            iEl.addEventListener("click", handlerTableCategorieDeleteButtonClick);
            td.appendChild(iEl);
        }
        tr.appendChild(td);
    }

    tableCategorie.tBodies[0].insertBefore(tr, tableCategorie.tBodies[0].firstElementChild);
}

function aggiornaRigaTableCategorie(valori){

    var tr = selectedRow;
    var tDataList = tr.querySelectorAll("td");
    var tableCategorie = document.getElementById("tableCategorie");
    var headerFieldList = tableCategorie.tHead.getElementsByTagName("th");

    for(var i=0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");

        if(fieldName && fieldName !== ""){
            if(valori[fieldName]){
                tDataList[i].innerHTML = valori[fieldName];
            } else{
                tDataList[i].innerHTML = "";
            }
        }
    }
}

function handlerTableCategorieRowClick(event){
    event.stopPropagation();
    var target = event.target;

    if(target.querySelectorAll("i").length > 0){
        return;
    }

    var tBody = document.getElementById("tableCategorie").tBodies[0];

    var previousSelectedElement = tBody.querySelectorAll("tr.selected");

    if(previousSelectedElement.length > 0){
        previousSelectedElement[0].classList.remove("selected");
    }

    var tr;

    if(target.tagName.toUpperCase() === "TD"){
        tr = target.parentNode;
    } else{
        tr = target;
    }

    tr.classList.add("selected");
    selectedRow = tr;

    var tDataList = tr.querySelectorAll("td");
    var headerFieldList = document.getElementById("tableCategorie").tHead.getElementsByTagName("th");
    var form = document.getElementById("formCategorie");

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        if(fieldName && fieldName!== ""){
            var valore = tDataList[i].innerText;
            var formField = form[fieldName];

            formField.value = valore;
        }
    }

}

document.getElementById("tableCategorie").tBodies[0].addEventListener("click", handlerTableCategorieRowClick);

function handlerTableCategorieDeleteButtonClick(event){
    event.stopPropagation();
    var target = event.target;

    var tr = target.parentNode.parentNode;

    var categoryId = tr.firstElementChild.innerText;

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                tr.parentNode.removeChild(tr);
                console.info("Eliminazione avvenuta con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante l'eliminazione della categoria");
            }
        }
    }

    httpReq.open("DELETE", "json/categorie.json?CATEGORY_ID="+categoryId);

    httpReq.send();
}

document.getElementById("tableCategorie").tBodies[0].getElementsByTagName("i")[0];

function ricercaCategorie(){
    var valoreDaRicercare = document.getElementById("searchFieldCategorie").value.toLowerCase();

    var rows = document.getElementById("tableCategorie").tBodies[0].querySelectorAll("tr");

    for(var i=0; i < rows.length; i++){
        if(!valoreDaRicercare || valoreDaRicercare===""){
            rows[i].style.display = "";
        } else if(rows[i].innerText.toLowerCase().indexOf(valoreDaRicercare) !== -1){
            rows[i].style.display = "";
        } else{
            rows[i].style.display = "none";
        }
    }
}

function caricaCategorie(){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var listaCategorie = JSON.parse(httpReq.responseText);
                for(var i=listaCategorie.length; i > 0; i--){
                    aggiungiRigaTableCategorie(listaCategorie[i-1]);
                }
                console.info("Caricamento delle categorie avvenuto con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante il caricamento delle categorie");
            }
        }
    }

    httpReq.open("GET","json/categorie.json");
    httpReq.send();
}