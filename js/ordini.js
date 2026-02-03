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

function validateFormOrdini(fieldDaValidare){
    var form = document.getElementById("formOrdini");

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

    if(target.tagName.toUpperCase() === "TD" && target.querySelectorAll("i").length > 0){
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

            formField.value = valore;
        }
    }

    caricaDettaglioOrdine(tDataList[0].innerText);
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

var timer;

function ricercaOrdini(){

    clearTimeout(timer);

    timer = setTimeout(function(){

    var valoreDaRicercare = document.getElementById("searchFieldOrdini").value.toLowerCase();

    var table = document.getElementById("tableOrdini");

    var rows = table.tBodies[0].querySelectorAll("tr");

    for(var i=0; i < rows.length; i++){
        if(!valoreDaRicercare || valoreDaRicercare===""){
            rows[i].style.display = "";
        } else if(rows[i].innerText.toLowerCase().indexOf(valoreDaRicercare) !== -1){
            rows[i].style.display = "";
        } else{
            rows[i].style.display = "none";
        }
    }

    }, 300);
}

function caricaOrdini(){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var listaOrdini = JSON.parse(httpReq.responseText);                
                setDipendenti();
                setProdotti();
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

function selezionaOrdine(){

    clearTimeout(timer);

    setTimeout(function(){

    var valoreDaRicercare = document.getElementById("updateFieldOrdini").value;

    if(!valoreDaRicercare || valoreDaRicercare===""){
        addErrorMessage(document.getElementById("updateFieldOrdini"), "Campo richiesto");
        return;
    } else if(!isInt(valoreDaRicercare) || valoreDaRicercare <= 0){
        addErrorMessage(document.getElementById("updateFieldOrdini"), "Deve essere un numero intero positivo");
        return;
    } else{
        removeErrorMessage(document.getElementById("updateFieldOrdini"));
    }

    var rows = document.getElementById("tableOrdini").tBodies[0].querySelectorAll("tr");

    for(var i=0; i < rows.length; i++){
        if(rows[i].firstElementChild.innerText === valoreDaRicercare){
            targetRow = rows[i];
            break;
        }
    }

    if(targetRow){
        const dblClickEvent = new MouseEvent('dblclick', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        targetRow.dispatchEvent(dblClickEvent);

    }

    }, 300);

}

function eliminaOrdine(){

    clearTimeout(timer);

    setTimeout(function(){

    var valoreDaRicercare = document.getElementById("deleteFieldOrdini").value;

    if(!valoreDaRicercare || valoreDaRicercare===""){
        addErrorMessage(document.getElementById("deleteFieldOrdini"), "Campo richiesto");
        return;
    } else if(!isInt(valoreDaRicercare) || valoreDaRicercare <= 0){
        addErrorMessage(document.getElementById("deleteFieldOrdini"), "Deve essere un numero intero positivo");
        return;
    } else{
        removeErrorMessage(document.getElementById("deleteFieldOrdini"));
    }

    var rows = document.getElementById("tableOrdini").tBodies[0].querySelectorAll("tr");
    var targetIcon = null;

    for(var i=0; i < rows.length; i++){
        if(rows[i].firstElementChild.innerText === valoreDaRicercare){
            targetIcon = rows[i].querySelectorAll("i")[0];
            break;
        }
    }

    if(targetIcon){
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        targetIcon.dispatchEvent(clickEvent);

    }

    }, 300);
}

function esportaOrdiniExcel(){
    var table = document.getElementById("tableOrdini");
    var wb = XLSX.utils.table_to_book(table, {sheet: "Ordini"});
    XLSX.writeFile(wb, "ordini.xlsx");
    console.info("Esportazione ordini in Excel avvenuta con successo");
}

function validateFormDettaglioOrdine(fieldDaValidare){
    var form = document.getElementById("formDettaglioOrdine");

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
                    if(dettaglioOrdine[i-1].ORDER_ID != orderId){
                        continue;
                    }
                    aggiungiRigaTableDettaglioOrdine(dettaglioOrdine[i-1]);
                }
                console.info("Caricamento del dettaglio ordine avvenuto con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante il caricamento del dettaglio ordine");
            }
        }
    }

    httpReq.open("GET","json/dettagli_ordini.json");
    httpReq.send();
}

function sendEmailWithPDFOrdine(){
    var orderId = document.getElementById("sendPDFByEmailOrdini").value;
    var fieldElement = document.getElementById("sendPDFByEmailOrdini");

    var rows = document.getElementById("tableOrdini").tBodies[0].querySelectorAll("tr");
    var rowTarget = null;

    for(var i=0; i < rows.length; i++){
        if(orderId && orderId !== ""){
                if(isInt(orderId)){
                    if(orderId > 0){
                        removeErrorMessage(fieldElement);
                        if(rows[i].firstElementChild.innerText === orderId){
                            rowTarget = rows[i];
                            fieldElement.value = "";
                            break;
                        }
                        
                    } else{
                        addErrorMessage(fieldElement,"Deve essere un numero positivo");
                    }
                } else{
                    addErrorMessage(fieldElement, "Deve essere un numero valido");
                }
        } else{
            addErrorMessage(fieldElement, "Campo richiesto");
        }

    }

    if(rowTarget){
        var tDataList = rowTarget.querySelectorAll("td");
        var tableOrdini = document.getElementById("tableOrdini");
        var headerFieldList = tableOrdini.tHead.getElementsByTagName("th");
        
        var ordineData = {};
        for(var j = 0; j < headerFieldList.length; j++){
            var fieldName = headerFieldList[j].getAttribute("data-index");
            if(fieldName && fieldName !== ""){
                ordineData[fieldName] = tDataList[j].innerText;
            }
        }
        
        var httpReq = new XMLHttpRequest();
        
        httpReq.onreadystatechange = function(){
            if(httpReq.readyState === 4){
                if(httpReq.status === 200){
                    var dettaglioOrdine = JSON.parse(httpReq.responseText);
                    var dettagliPerOrdine = [];
                    
                    for(var k = 0; k < dettaglioOrdine.length; k++){
                        if(dettaglioOrdine[k].ORDER_ID == orderId){
                            dettagliPerOrdine.push(dettaglioOrdine[k]);
                        }
                    }
                    
                    console.info("Caricamento dei dettagli dell'ordine avvenuto con successo");
                    generaPDFOrdine(ordineData, dettagliPerOrdine, orderId);
                } else{
                    console.error(httpReq.responseText);
                    alert("Errore durante il caricamento dei dettagli dell'ordine");
                }
            }
        }
        
        httpReq.open("GET","json/dettagli_ordini.json");
        httpReq.send();
    }
}

function generaPDFOrdine(ordineData, dettagliPerOrdine, orderId){
    var contentHTML = '<div style="font-family: Arial, sans-serif; padding: 20px;">';
    contentHTML += '<h1 style="text-align: center; color: #333;">ORDINE #' + orderId + '</h1>';
    contentHTML += '<hr style="border: 1px solid #ccc; margin: 20px 0;">';
    
    contentHTML += '<div style="margin-bottom: 20px;">';
    contentHTML += '<h2 style="color: #555;">Informazioni Ordine</h2>';
    contentHTML += '<table style="width: 100%; border-collapse: collapse;">';
    
    var rowHTML = '<tr>';
    rowHTML += '<td style="padding: 8px; border: 1px solid #ddd;"><strong>Cliente:</strong></td>';
    rowHTML += '<td style="padding: 8px; border: 1px solid #ddd;">' + (ordineData.CUSTOMER || '') + '</td>';
    rowHTML += '<td style="padding: 8px; border: 1px solid #ddd;"><strong>Data Ordine:</strong></td>';
    rowHTML += '<td style="padding: 8px; border: 1px solid #ddd;">' + (ordineData.ORDER_DATE || '') + '</td>';
    rowHTML += '</tr>';
    
    rowHTML += '<tr>';
    rowHTML += '<td style="padding: 8px; border: 1px solid #ddd;"><strong>Dipendente:</strong></td>';
    rowHTML += '<td style="padding: 8px; border: 1px solid #ddd;">' + (ordineData.EMPLOYEE_FIRSTNAME || '') + ' ' + (ordineData.EMPLOYEE_LASTNAME || '') + '</td>';
    rowHTML += '<td style="padding: 8px; border: 1px solid #ddd;"><strong>Spedizioniere:</strong></td>';
    rowHTML += '<td style="padding: 8px; border: 1px solid #ddd;">' + (ordineData.SHIPPER_NAME || '') + '</td>';
    rowHTML += '</tr>';
    
    rowHTML += '<tr>';
    rowHTML += '<td style="padding: 8px; border: 1px solid #ddd;"><strong>Data Richiesta:</strong></td>';
    rowHTML += '<td style="padding: 8px; border: 1px solid #ddd;">' + (ordineData.REQUIRED_DATE || '') + '</td>';
    rowHTML += '<td style="padding: 8px; border: 1px solid #ddd;"><strong>Data Spedizione:</strong></td>';
    rowHTML += '<td style="padding: 8px; border: 1px solid #ddd;">' + (ordineData.SHIPPED_DATE || '') + '</td>';
    rowHTML += '</tr>';
    
    contentHTML += rowHTML + '</table>';
    contentHTML += '</div>';
    
    contentHTML += '<div style="margin-bottom: 20px;">';
    contentHTML += '<h2 style="color: #555;">Indirizzo Spedizione</h2>';
    contentHTML += '<table style="width: 100%; border-collapse: collapse;">';
    contentHTML += '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Nome:</strong> ' + (ordineData.SHIP_NAME || '') + '</td></tr>';
    contentHTML += '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Indirizzo:</strong> ' + (ordineData.SHIP_ADDRESS || '') + '</td></tr>';
    contentHTML += '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Città:</strong> ' + (ordineData.SHIP_CITY || '') + ' - <strong>CAP:</strong> ' + (ordineData.SHIP_POSTAL_CODE || '') + '</td></tr>';
    contentHTML += '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Regione:</strong> ' + (ordineData.SHIP_REGION || 'N/A') + ' - <strong>Paese:</strong> ' + (ordineData.SHIP_COUNTRY || '') + '</td></tr>';
    contentHTML += '</table>';
    contentHTML += '</div>';
    
    contentHTML += '<div style="margin-bottom: 20px;">';
    contentHTML += '<h2 style="color: #555;">Dettagli Prodotti</h2>';
    contentHTML += '<table style="width: 100%; border-collapse: collapse;">';
    contentHTML += '<thead><tr style="background-color: #e8e8e8;">';
    contentHTML += '<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Product ID</th>';
    contentHTML += '<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Product Name</th>';
    contentHTML += '<th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Quantità</th>';
    contentHTML += '<th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Prezzo Unitario</th>';
    contentHTML += '<th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Sconto</th>';
    contentHTML += '<th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Totale</th>';
    contentHTML += '</tr></thead><tbody>';
    
    var totalOrdine = 0;
    var prodotti = getProdotti();
    
    for(var m = 0; m < dettagliPerOrdine.length; m++){
        var dettaglio = dettagliPerOrdine[m];
        var nomeProdotto = '';
        
        for(var p = 0; p < prodotti.length; p++){
            if(prodotti[p].PRODUCT_ID == dettaglio.PRODUCT_ID){
                nomeProdotto = prodotti[p].PRODUCT_NAME;
                break;
            }
        }
        
        var subtotale = dettaglio.QUANTITY * dettaglio.UNIT_PRICE;
        var sconto = subtotale * dettaglio.DISCOUNT;
        var totaleRiga = subtotale - sconto;
        totalOrdine += totaleRiga;
        
        contentHTML += '<tr>';
        contentHTML += '<td style="padding: 8px; border: 1px solid #ddd;">' + dettaglio.PRODUCT_ID + '</td>';
        contentHTML += '<td style="padding: 8px; border: 1px solid #ddd;">' + nomeProdotto + '</td>';
        contentHTML += '<td style="padding: 8px; border: 1px solid #ddd; text-align: center;">' + dettaglio.QUANTITY + '</td>';
        contentHTML += '<td style="padding: 8px; border: 1px solid #ddd; text-align: right;">€ ' + dettaglio.UNIT_PRICE.toFixed(2) + '</td>';
        contentHTML += '<td style="padding: 8px; border: 1px solid #ddd; text-align: right;">' + (dettaglio.DISCOUNT * 100).toFixed(0) + '%</td>';
        contentHTML += '<td style="padding: 8px; border: 1px solid #ddd; text-align: right;">€ ' + totaleRiga.toFixed(2) + '</td>';
        contentHTML += '</tr>';
    }
    
    contentHTML += '</tbody></table>';
    contentHTML += '</div>';
    
    contentHTML += '<div style="margin-top: 20px; text-align: right;">';
    contentHTML += '<p style="font-size: 16px;"><strong>Totale Ordine:</strong> € ' + totalOrdine.toFixed(2) + '</p>';
    contentHTML += '<p style="font-size: 16px;"><strong>Spese di Spedizione:</strong> € ' + (ordineData.FREIGHT || '0.00') + '</p>';
    var totaleFinale = totalOrdine + parseFloat(ordineData.FREIGHT || 0);
    contentHTML += '<p style="font-size: 18px; color: #d9534f;"><strong>Importo Totale:</strong> € ' + totaleFinale.toFixed(2) + '</p>';
    contentHTML += '</div>';
    
    contentHTML += '<hr style="border: 1px solid #ccc; margin: 20px 0;">';
    contentHTML += '<p style="text-align: center; color: #999; font-size: 12px;">Documento generato automaticamente il ' + new Date().toLocaleDateString('it-IT') + '</p>';
    contentHTML += '</div>';
    
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentHTML;
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);
    
    var opt = {
        margin: 10,
        filename: 'ordine_' + orderId + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    if(typeof html2pdf !== 'undefined'){
        html2pdf().set(opt).from(tempDiv).toPdf().get('pdf').then(function(pdf) {
            inviaEmailConPDF(ordineData, pdf, orderId);
            document.body.removeChild(tempDiv);
        });
    } else{
        console.error('html2pdf library not found. Please include html2pdf.js in your HTML file.');
        alert('Errore: libreria html2pdf non disponibile.');
        document.body.removeChild(tempDiv);
    }
}

function inviaEmailConPDF(ordineData, pdf, orderId){
    emailjs.init("YOUR_PUBLIC_KEY");
    
    var emailDestinazione = prompt('Inserire l\'email del destinatario:');
    
    if(!emailDestinazione || !isValidEmail(emailDestinazione)){
        alert('Email non valida');
        return;
    }
    
    var pdfBase64 = pdf.output('datauristring');
    
    var templateParams = {
        to_email: emailDestinazione,
        customer_name: ordineData.CUSTOMER,
        order_id: orderId,
        order_date: ordineData.ORDER_DATE,
        employee_name: ordineData.EMPLOYEE_FIRSTNAME + ' ' + ordineData.EMPLOYEE_LASTNAME,
        shipper: ordineData.SHIPPER_NAME,
        ship_address: ordineData.SHIP_ADDRESS,
        ship_city: ordineData.SHIP_CITY,
        ship_country: ordineData.SHIP_COUNTRY,
        message: 'Gentile ' + ordineData.CUSTOMER + ',\n\nIn allegato troverete i dettagli dell\'ordine #' + orderId + ' del ' + ordineData.ORDER_DATE + '.\n\nCordiali saluti,\nNorthWind'
    };
    
    emailjs.send("SERVICE_ID", "TEMPLATE_ID", templateParams)
        .then(function(response) {
            console.log("Email inviata con successo!", response.status, response.text);
            alert('Email inviata con successo a ' + emailDestinazione + '!');
        }, function(error) {
            console.error("Errore nell'invio dell'email:", error);
            alert('Errore durante l\'invio della email: ' + error.text);
        });
}

function isValidEmail(email){
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

var tHeadOrdini = document.getElementById("tableOrdini").tHead.querySelectorAll("tr")[0];
var lastSortedColumn = null;
var sortDirection = 'asc';

tHeadOrdini.addEventListener('click', handlerTableOrdiniHeaderClick);

function handlerTableOrdiniHeaderClick(event){
    event.preventDefault();
    var target = event.target;

    var fieldName = target.getAttribute("data-index");
    
    if(!fieldName){
        return;
    }

    if(lastSortedColumn === fieldName){
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else{
        sortDirection = 'asc';
        lastSortedColumn = fieldName;
    }

    var headerFieldList = tHeadOrdini.getElementsByTagName("th");
    var columnIndex = -1;

    for(var i = 0; i < headerFieldList.length; i++){
        if(headerFieldList[i].getAttribute("data-index") === fieldName){
            columnIndex = i;
            break;
        }
    }

    if(columnIndex === -1){
        return;
    }

    var tBody = document.getElementById("tableOrdini").tBodies[0];
    var rows = document.getElementById("tableOrdini").tBodies[0].querySelectorAll("tr");
    rows = Array.from(rows);

    rows.sort(function(rowA, rowB){
        var a = rowA.cells[columnIndex].innerText.trim();
        var b = rowB.cells[columnIndex].innerText.trim();

        if(!isNaN(a) && !isNaN(b)){
            var numA = parseFloat(a);
            var numB = parseFloat(b);
            var comparison = numA - numB;
        } else if(fieldName.toUpperCase() === "ORDER_DATE" || fieldName.toUpperCase() === "REQUIRED_DATE" || fieldName.toUpperCase() === "SHIPPED_DATE"){
            day = a.split("-")[0];
            month = a.split("-")[1];
            year = "19" + a.split("-")[2];
            var dateA = new Date(year, month - 1, day);
            day = b.split("-")[0];
            month = b.split("-")[1];
            year = "19" + b.split("-")[2];
            var dateB = new Date(year, month - 1, day);
            console.log(dateA.getDate());
            var comparison = dateA - dateB;
        } else{
            a = a.toLowerCase();
            b = b.toLowerCase();
            var comparison = a.localeCompare(b);
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    while(tBody.firstChild){
        tBody.removeChild(tBody.firstChild);
    }

    rows.forEach(function(row){
        tBody.appendChild(row);
    });

    headerFieldList.forEach(function(header){
        header.classList.remove("sort-asc", "sort-desc");
    });
    
    target.classList.add(sortDirection === 'asc' ? "sort-asc" : "sort-desc");
}