var selectedRow;

const STORAGE_KEY = "dipendenti";
const STORAGE_KEY_PRODOTTI = "prodotti";

function getDipendenti(){
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function setDipendenti(lista){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var listaDipendenti = JSON.parse(httpReq.responseText);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(listaDipendenti));
                console.info("Caricamento dei dipendenti avvenuto con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante il caricamento dei dipendenti");
            }
        }
    }

    httpReq.open("GET","json/dipendenti.json");
    httpReq.send();
}

function getProdotti(){
    return JSON.parse(localStorage.getItem(STORAGE_KEY_PRODOTTI)) || [];
}

function setProdotti(lista){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var listaProdotti = JSON.parse(httpReq.responseText);
                localStorage.setItem(STORAGE_KEY_PRODOTTI, JSON.stringify(listaProdotti));
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

function risolviProdotti(ProductId){
    if(!ProductId) return { name: "" };
    var prodotti = getProdotti();

    for(var i=0; i < prodotti.length; i++){ 
        if(prodotti[i].PRODUCT_ID === ProductId){
            return {
                name: prodotti[i].PRODUCT_NAME
            };
        }
    }
    return { name: "" };
}

function risolviDipendenti(EmployeeId){
    if(!EmployeeId) return { first: "", last: "" };

    var dipendenti = getDipendenti();

    for(var i=0; i < dipendenti.length; i++){
        if(dipendenti[i].EMPLOYEE_ID === EmployeeId){
            return {
                first: dipendenti[i].FIRSTNAME,
                last: dipendenti[i].LASTNAME
            };
        }
    }
    return { first: "", last: "" };
}

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

function validateFormOrdini(fieldDaValidare){
    var form = document.getElementById("formOrdini");

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
            case "CUSTOMER":
            case "EMPLOYEE_FIRSTNAME":
            case "EMPLOYEE_LASTNAME":
            case "ORDER_DATE":
                if(!fieldValue || fieldValue === ""){
                    addErrorMessage(fieldElement, "Campo richiesto");
                    isCampoValid = false;
                } else{
                    removeErrorMessage(fieldElement);
                }
                break;
            case "FREIGHT":
                if(fieldValue && fieldValue !== ""){
                    if(!isNaN(fieldValue)){
                        if(fieldValue > 0){
                            removeErrorMessage(fieldElement);
                        } else{
                            addErrorMessage(fieldElement,"Deve essere un numero positivo");
                            isCampoValid = false;
                        }
                    } else{
                        addErrorMessage(fieldElement, "Deve essere un numero valido");
                        isCampoValid = false;
                    }
                } else{
                    removeErrorMessage(fieldElement);
                }
                break;
            case "EMPLOYEE_ID":
                if(fieldValue && fieldValue !== ""){
                if(isInt(fieldValue)){
                    if(fieldValue > 0){
                        removeErrorMessage(fieldElement);
                    } else{
                        addErrorMessage(fieldElement,"Deve essere un numero positivo");
                        isCampoValid = false;
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
        for(var i=0; i < formOrdiniFields.length; i++){
            var isCampoValid = validateField(formOrdiniFields[i].name);
            if(!isCampoValid){
                isValid = false;
            }
        }
    }

    return isValid;
}

function handlerFormOrdiniSubmitButtonClick(event){
    event.preventDefault();

    if(validateFormOrdini()){
        var valori={}

        for(var i=0; i < formOrdiniFields.length; i++){
            var fieldIterato = formOrdiniFields[i];
            if(fieldIterato.type === "date"){
                var dateValue = fieldIterato.valueAsDate;

                valori[fieldIterato.name] = formatDate(dateValue);
            } else{
                valori[fieldIterato.name] = fieldIterato.value;
            }
        }

        function aggiungiOAggiornaOrdineSuFile(valori,callback){
            var httpReq = new XMLHttpRequest();

            httpReq.onreadystatechange = function(){
                if(httpReq.readyState === 4){
                    if(httpReq.status === 200){
                        console.info("Ordine aggiunto o aggiornato con successo");
                        var record = JSON.parse(httpReq.responseText);
                        callback(record);
                    } else{
                        console.error(httpReq.responseText);
                        alert("Errore durante l'aggiornamento o l'inserimento dell'ordine");
                    }
                }
            }

            httpReq.open("POST","json/ordini.json");
            httpReq.setRequestHeader("Content-Type","application/json");
            httpReq.send(JSON.stringify(valori));
        }

        if(valori.ORDER_ID && valori.ORDER_ID !== "" && selectedRow){
            aggiungiOAggiornaOrdineSuFile(valori,function(ordineAggiornato){
                aggiornaRigaTableOrdini(ordineAggiornato);
                document.getElementById("formOrdini").reset();
            })
        } else{
            aggiungiOAggiornaOrdineSuFile(valori, function(ordineAggiunto){
                aggiungiRigaTableOrdini(ordineAggiunto);
                document.getElementById("formOrdini").reset();
            })
        }

        var sidebar = document.getElementById("sidebar");
        sidebar.classList.add("collapsed");
    } else{

    }
}

var formOrdiniFields = document.getElementById("formOrdini").querySelectorAll('input:not(.btn), select');

var submitButton = document.getElementById("formOrdini").querySelectorAll('input[type="submit"]')[0];

submitButton.addEventListener("click", handlerFormOrdiniSubmitButtonClick);
function handlerFieldFormOrdiniChange(event){
    validateFormOrdini(this.name);
}
for(var indiceFormField = 0; indiceFormField < formOrdiniFields.length; indiceFormField ++){
    formOrdiniFields[indiceFormField].addEventListener("input", handlerFieldFormOrdiniChange);
    formOrdiniFields[indiceFormField].addEventListener("blur", handlerFieldFormOrdiniChange);
}


function aggiungiRigaTableOrdini(valori){
    var tr = document.createElement("tr");

    var tableOrdini = document.getElementById("tableOrdini");

    var headerFieldList = tableOrdini.tHead.getElementsByTagName("th");

    var dipendentiData = getDipendenti();

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        var td = document.createElement("td");

        if(fieldName){
            if(valori[fieldName]){
                if(fieldName === "EMPLOYEE_FIRSTNAME" || fieldName === "EMPLOYEE_LASTNAME"){
                    var managerId1 = valori["EMPLOYEE_FIRSTNAME"];
                    var managerId2 = valori["EMPLOYEE_LASTNAME"];
                    for(var k=0; k < dipendentiData.length; k++){
                        if(dipendentiData[k].LASTNAME == managerId2 || dipendentiData[k].FIRSTNAME == managerId1){
                            if(fieldName === "EMPLOYEE_FIRSTNAME"){
                                td.innerHTML = dipendentiData[k].FIRSTNAME;
                            } else{
                                td.innerHTML = dipendentiData[k].LASTNAME;
                            }
                            break;
                        }
                    }
                } else{
                    td.innerHTML = valori[fieldName];
                }
            }
        } else{
            var iEl = document.createElement("i");
            iEl.classList.add("fa");
            iEl.classList.add("fa-trash");
            iEl.style["font-size"]="16px";
            iEl.addEventListener("click", handlerTableOrdiniDeleteButtonClick);
            td.appendChild(iEl);
        }
        tr.appendChild(td);
    }

    tableOrdini.tBodies[0].insertBefore(tr, tableOrdini.tBodies[0].firstElementChild);
}

function aggiornaRigaTableOrdini(valori){

    var tr = selectedRow;
    var tDataList = tr.querySelectorAll("td");
    var tableOrdini = document.getElementById("tableOrdini");
    var headerFieldList = tableOrdini.tHead.getElementsByTagName("th");

    for(var i=0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");

        if(fieldName && fieldName !== ""){
            if(valori[fieldName]){
                if(fieldName === "EMPLOYEE_FIRSTNAME" || fieldName === "EMPLOYEE_LASTNAME"){
                    var employeeNames = risolviDipendenti(valori["EMPLOYEE_ID"]);
                    if(fieldName === "EMPLOYEE_FIRSTNAME"){
                        tDataList[i].innerHTML = employeeNames.first;
                    } else{
                        tDataList[i].innerHTML = employeeNames.last;
                    }
                } else{
                    tDataList[i].innerHTML = valori[fieldName];
                }
            } else{
                tDataList[i].innerHTML = "";
            }
        } else{
            tDataList[i].innerHTML = "";
        }
    }
}

function handlerTableOrdiniRowClick(event){
    event.stopPropagation();
    var target = event.target;

    //var sidebar = document.getElementById("sidebar");
    //sidebar.classList.remove("collapsed");

    if(target.querySelectorAll("i").length > 0){
        return;
    }

    var tBody = document.getElementById("tableOrdini").tBodies[0];

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
    var headerFieldList = document.getElementById("tableOrdini").tHead.getElementsByTagName("th");
    var form = document.getElementById("formOrdini");

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        if(fieldName && fieldName!== ""){
            var valore = tDataList[i].innerText;
            var formField = form[fieldName];
            if(fieldName === "EMPLOYEE_FIRSTNAME" || fieldName === "EMPLOYEE_LASTNAME"){
                if(valore && valore != null){
                    var employeeId = "";
                    var dipendentiData = getDipendenti();
                    for(var k=0; k < dipendentiData.length; k++){
                        if((dipendentiData[k].FIRSTNAME === tDataList[i].innerText || dipendentiData[k].LASTNAME === tDataList[i].innerText)){
                            employeeId = dipendentiData[k].EMPLOYEE_ID;
                            break;
                        }
                    }
                    valore = employeeId;
                }
                fieldName = "EMPLOYEE_ID";
                formField = form[fieldName];
            }

            if(formField){
                formField.value = valore;
            }
        }
    }

    caricaDettaglioOrdine(form["ORDER_ID"].value);
}

document.getElementById("tableOrdini").tBodies[0].addEventListener("dblclick", handlerTableOrdiniRowClick);

function handlerTableOrdiniDeleteButtonClick(event){
    event.stopPropagation();
    var target = event.target;

    var tr = target.parentNode.parentNode;

    var orderId = tr.firstElementChild.innerText;

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                tr.parentNode.removeChild(tr);
                console.info("Eliminazione avvenuta con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante l'eliminazione dell'ordine");
            }
        }
    }

    httpReq.open("DELETE", "json/ordini.json?ORDER_ID="+orderId);

    httpReq.send();
}

document.getElementById("tableOrdini").tBodies[0].getElementsByTagName("i")[0];

function ricercaOrdini(){
    var valoreDaRicercare = document.getElementById("searchFieldOrdini").value.toLowerCase();

    var rows = document.getElementById("tableOrdini").tBodies[0].querySelectorAll("tr");

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

function caricaOrdini(){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var listaOrdini = JSON.parse(httpReq.responseText);                
                setDipendenti();
                for(var i=listaOrdini.length; i > 0; i--){
                    aggiungiRigaTableOrdini(listaOrdini[i-1]);
                }
                console.info("Caricamento degli ordini avvenuto con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante il caricamento degli ordini");
            }
        }
    }

    httpReq.open("GET","json/ordini.json");
    httpReq.send();
}

function validateFormDettaglioOrdine(fieldDaValidare){
    var form = document.getElementById("formDettaglioOrdine");

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
            case "UNIT_PRICE":
            case "DISCOUNT":
                if(fieldValue && fieldValue !== ""){
                    if(!isNaN(fieldValue)){
                        if(fieldValue > 0){
                            removeErrorMessage(fieldElement);
                        } else{
                            addErrorMessage(fieldElement,"Deve essere un numero positivo");
                            isCampoValid = false;
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
            case "PRODUCT_ID":
            case "QUANTITY":
                if(fieldValue && fieldValue !== ""){
                if(isInt(fieldValue)){
                    if(fieldValue > 0){
                        removeErrorMessage(fieldElement);
                    } else{
                        addErrorMessage(fieldElement,"Deve essere un numero positivo");
                        isCampoValid = false;
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
        for(var i=0; i < formDettaglioOrdineFields.length; i++){
            var isCampoValid = validateField(formDettaglioOrdineFields[i].name);
            if(!isCampoValid){
                isValid = false;
            }
        }
    }

    return isValid;
}

function handlerFormDettaglioOrdineSubmitButtonClick(event){
    event.preventDefault();

    if(validateFormDettaglioOrdine()){
        var valori={}

        for(var i=0; i < formDettaglioOrdineFields.length; i++){
            var fieldIterato = formDettaglioOrdineFields[i];
            valori[fieldIterato.name] = fieldIterato.value;
        }

        function aggiungiOAggiornaDettaglioOrdineSuFile(valori,callback){
            var httpReq = new XMLHttpRequest();

            httpReq.onreadystatechange = function(){
                if(httpReq.readyState === 4){
                    if(httpReq.status === 200){
                        console.info("Dettaglio ordine aggiunto o aggiornato con successo");
                        var record = JSON.parse(httpReq.responseText);
                        callback(record);
                    } else{
                        console.error(httpReq.responseText);
                        alert("Errore durante l'aggiornamento o l'inserimento del dettaglio ordine");
                    }
                }
            }

            httpReq.open("POST","json/dettagli_ordini.json");
            httpReq.setRequestHeader("Content-Type","application/json");
            httpReq.send(JSON.stringify(valori));
        }

        if(valori.PRODUCT_ID && valori.PRODUCT_ID !== "" && selectedRow){
            aggiungiOAggiornaDettaglioOrdineSuFile(valori,function(dettaglioOrdineAggiornato){
                aggiornaRigaTableOrdini(dettaglioOrdineAggiornato);
                document.getElementById("formDettaglioOrdine").reset();
            })
        } else{
            aggiungiOAggiornaDettaglioOrdineSuFile(valori, function(dettaglioOrdineAggiunto){
                aggiungiRigaTableOrdini(dettaglioOrdineAggiunto);
                document.getElementById("formDettaglioOrdine").reset();
            })
        }

        var sidebar = document.getElementById("sidebar");
        sidebar.classList.add("collapsed");
    } else{

    }
}

var formDettaglioOrdineFields = document.getElementById("formDettaglioOrdine").querySelectorAll('input:not(.btn), select');

var submitButtonDettaglioOrdine = document.getElementById("formDettaglioOrdine").querySelectorAll('input[type="submit"]')[0];

submitButtonDettaglioOrdine.addEventListener("click", handlerFormDettaglioOrdineSubmitButtonClick);
function handlerFieldFormDettaglioOrdineChange(event){
    validateFormDettaglioOrdine(this.name);
}
for(var indiceFormField = 0; indiceFormField < formDettaglioOrdineFields.length; indiceFormField ++){
    formDettaglioOrdineFields[indiceFormField].addEventListener("input", handlerFieldFormDettaglioOrdineChange);
    formDettaglioOrdineFields[indiceFormField].addEventListener("blur", handlerFieldFormDettaglioOrdineChange);
}


function aggiungiRigaTableDettaglioOrdine(valori){
    var tr = document.createElement("tr");

    var tableDettaglioOrdine = document.getElementById("tableDettaglioOrdine");

    var headerFieldList = tableDettaglioOrdine.tHead.getElementsByTagName("th");

    var prodottiData = getProdotti();

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        var td = document.createElement("td");

        if(fieldName){
            if(valori[fieldName]){
                if(fieldName === "PRODUCT_NAME"){
                    var productName = valori["PRODUCT_NAME"];
                    for(var k=0; k < prodottiData.length; k++){
                        if(prodottiData[k].PRODUCT_NAME === productName){
                            td.innerHTML = prodottiData[k].PRODUCT_ID;
                            break;
                        }
                    }
                } else{
                    td.innerHTML = valori[fieldName];
                }
            }
        } else{
            var iEl = document.createElement("i");
            iEl.classList.add("fa");
            iEl.classList.add("fa-trash");
            iEl.style["font-size"]="16px";
            iEl.addEventListener("click", handlerTableDettaglioOrdineDeleteButtonClick);
            td.appendChild(iEl);
        }
        tr.appendChild(td);
    }

    tableDettaglioOrdine.tBodies[0].insertBefore(tr, tableDettaglioOrdine.tBodies[0].firstElementChild);
}

function aggiornaRigaTableDettaglioOrdine(valori){

    var tr = selectedRow;
    var tDataList = tr.querySelectorAll("td");
    var tableDettaglioOrdine = document.getElementById("tableDettaglioOrdine");
    var headerFieldList = tableDettaglioOrdine.tHead.getElementsByTagName("th");

    for(var i=0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        prodottiData = getProdotti();

        if(fieldName && fieldName !== ""){
            if(valori[fieldName]){
                if(fieldName === "PRODUCT_NAME"){
                    var productName = valori["PRODUCT_NAME"];
                    if(productName === prodottiData[i].PRODUCT_NAME){
                        tDataList[i].innerHTML = prodottiData[i].PRODUCT_ID;
                    }
                } else{
                    tDataList[i].innerHTML = valori[fieldName];
                }
            } else{
                tDataList[i].innerHTML = "";
            }
        } else{
            tDataList[i].innerHTML = "";
        }
    }
}

function handlerTableDettaglioOrdineRowClick(event){
    event.stopPropagation();
    var target = event.target;

    var sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("collapsed");

    if(target.querySelectorAll("i").length > 0){
        return;
    }

    var tBody = document.getElementById("tableDettaglioOrdine").tBodies[0];

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
    var headerFieldList = document.getElementById("tableDettaglioOrdine").tHead.getElementsByTagName("th");
    var form = document.getElementById("formDettaglioOrdine");

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        if(fieldName && fieldName!== ""){
            var valore = tDataList[i].innerText;
            var formField = form[fieldName];

            if(formField){
                formField.value = valore;
            }
        }
    }

    caricaDettaglioOrdine(form["ORDER_ID"].value);
}

document.getElementById("tableDettaglioOrdine").tBodies[0].addEventListener("dblclick", handlerTableDettaglioOrdineRowClick);

function handlerTableDettaglioOrdineDeleteButtonClick(event){
    event.stopPropagation();
    var target = event.target;

    var tr = target.parentNode.parentNode;

    var orderId = tr.firstElementChild.innerText;

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                tr.parentNode.removeChild(tr);
                console.info("Eliminazione avvenuta con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante l'eliminazione del dettaglio ordine");
            }
        }
    }

    httpReq.open("DELETE", "json/dettagli_ordini.json?ORDER_ID="+orderId);

    httpReq.send();
}

function aggiungiRigaTableDettaglioOrdine(valori){
    var tr = document.createElement("tr");
    var tableDettaglioOrdine = document.getElementById("tableDettaglioOrdine");
    var headerFieldList = tableDettaglioOrdine.tHead.getElementsByTagName("th");
    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        var td = document.createElement("td");
        if(fieldName){
            if(valori[fieldName]){
                if(fieldName === "PRODUCT_NAME"){
                    var nomeProdotto = risolviProdotti(valori["PRODUCT_ID"]);
                    td.innerHTML = nomeProdotto.name;
                } else{
                    td.innerHTML = valori[fieldName];
                }
            }   
        } else{
            var iEl = document.createElement("i");
            iEl.classList.add("fa");
            iEl.classList.add("fa-trash");
            iEl.style["font-size"]="16px";
            iEl.addEventListener("click", handlerTableDettaglioOrdineDeleteButtonClick);
            td.appendChild(iEl);
        }
        tr.appendChild(td);
    }
    var tbody = tableDettaglioOrdine.tBodies[0];
    tbody.appendChild(tr);
}

function caricaDettaglioOrdine(orderId){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var dettaglioOrdine = JSON.parse(httpReq.responseText);
                for(var i=dettaglioOrdine.length; i > 0; i--){
                    aggiungiRigaTableDettaglioOrdine(dettaglioOrdine[i-1]);
                }
                console.info("Caricamento del dettaglio ordine avvenuto con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante il caricamento del dettaglio ordine");
            }
        }
    }

    httpReq.open("GET","json/dettagli_ordini.json?ORDER_ID="+orderId);
    httpReq.send();
}