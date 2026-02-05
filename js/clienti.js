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

function validateFormClienti(fieldDaValidare){
    var form = document.getElementById("formClienti");

    function validateField(fieldDaValidare){
        var isCampoValid = true;
        var fieldElement = form[fieldDaValidare];
        var fieldValue = fieldElement.value;

        switch(fieldDaValidare){
            case "CUSTOMER_CODE":
            case "COMPANY_NAME":
            case "CONTACT_NAME":
            case "ADDRESS":
            case "CITY":
            case "COUNTRY":
                if(!fieldValue || fieldValue === ""){
                    addErrorMessage(fieldElement, "Campo richiesto");
                    isCampoValid = false;
                } else{
                    removeErrorMessage(fieldElement);
                }
                break;
            case "PHONE":
                if(!fieldValue || fieldValue === ""){
                    addErrorMessage(fieldElement, "Campo richiesto");
                    isCampoValid = false;
                } else if(!/^[0-9+\-\s()]+$/.test(fieldValue)){
                    addErrorMessage(fieldElement, "Formato numero di telefono non valido");
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

            if(fieldIterato.tagName.toUpperCase() == "SELECT"){
                valori[fieldIterato.name] = fieldIterato.options[fieldIterato.selectedIndex].innerText;
            } else if(fieldIterato.value !== null && fieldIterato.value !== ""){
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
            httpReq.setRequestHeader("Content-Type","application/json");
            httpReq.send(JSON.stringify(valori));
        }

        if(valori.CUSTOMER_ID && valori.CUSTOMER_ID !== "" && selectedRow){
            aggiungiOAggiornaClienteSuFile(valori,function(clienteAggiornato){
                aggiornaRigaTableClienti(clienteAggiornato);
                document.getElementById("formClienti").reset();
            })
        } else{
            aggiungiOAggiornaClienteSuFile(valori, function(clienteAggiunto){
                aggiungiRigaTableClienti(clienteAggiunto);
                document.getElementById("formClienti").reset();
            })
        }

        var sidebar = document.getElementById("sidebar");
        sidebar.classList.add("collapsed");
    } else{

    }
}

var formClientiFields = document.getElementById("formClienti").querySelectorAll('input:not(.btn), select');

var submitButton = document.getElementById("formClienti").querySelectorAll('input[type="submit"]')[0];

submitButton.addEventListener("click", handlerFormClientiSubmitButtonClick);

function handlerFieldFormClientiChange(event){
    validateFormClienti(this.name);
}
for(var indiceFormField = 0; indiceFormField < formClientiFields.length; indiceFormField ++){
    formClientiFields[indiceFormField].addEventListener("input", handlerFieldFormClientiChange);
    formClientiFields[indiceFormField].addEventListener("blur", handlerFieldFormClientiChange);
}


function aggiungiRigaTableClienti(valori){

    var tr = document.createElement("tr");

    var tableClienti = document.getElementById("tableClienti");

    var headerFieldList = tableClienti.tHead.getElementsByTagName("th");

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
            iEl.addEventListener("click", handlerTableClientiDeleteButtonClick);
            td.appendChild(iEl);
        }
        tr.appendChild(td);
    }

    tableClienti.tBodies[0].insertBefore(tr, tableClienti.tBodies[0].firstElementChild);
    hideExtraRows();
}

function aggiornaRigaTableClienti(valori){

    var tr = selectedRow;
    var tDataList = tr.querySelectorAll("td");
    var tableClienti = document.getElementById("tableClienti");
    var headerFieldList = tableClienti.tHead.getElementsByTagName("th");

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
    hideExtraRows();
}

function handlerTableClientiRowClick(event){
    event.stopPropagation();
    var target = event.target;

    var sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("collapsed");

    if(target.tagName.toUpperCase() === "TD" && target.querySelectorAll("i").length > 0){
        return;
    }

    var tBody = document.getElementById("tableClienti").tBodies[0];

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
    var headerFieldList = document.getElementById("tableClienti").tHead.getElementsByTagName("th");
    var form = document.getElementById("formClienti");

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        if(fieldName && fieldName!== ""){
            var valore = tDataList[i].innerText;
            var formField = form[fieldName];
            if(fieldName === "CONTACT_TITLE"){
                if(valore && valore != null){
                    var selectOptions = formField.options;
                    for(var j=0; j < selectOptions.length; j++){
                        if(selectOptions[j].innerText === valore){
                            valore = selectOptions[j].value;
                            break;
                        }
                    }
                }
            }

            formField.value = valore;
        }
    }

}

document.getElementById("tableClienti").tBodies[0].addEventListener("dblclick", handlerTableClientiRowClick);

function handlerTableClientiDeleteButtonClick(event){
    event.stopPropagation();
    var target = event.target;

    var tr = target.parentNode.parentNode;

    var customerId = tr.firstElementChild.innerText;

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                tr.parentNode.removeChild(tr);
                hideExtraRows();
                console.info("Eliminazione avvenuta con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante l'eliminazione del cliente");
            }
        }
    }

    httpReq.open("DELETE", "json/clienti.json?CUSTOMER_ID="+customerId);

    httpReq.send();
}

document.getElementById("tableClienti").tBodies[0].getElementsByTagName("i")[0];

var isRicerca = false;

function ricercaClienti(){
    var valoreDaRicercare = document.getElementById("searchFieldClienti").value.toLowerCase();

    var rows = document.getElementById("tableClienti").tBodies[0].querySelectorAll("tr");

    for(var i=0; i < rows.length; i++){
        if(!valoreDaRicercare || valoreDaRicercare===""){
            rows[i].style.display = "";
        } else if(rows[i].innerText.toLowerCase().indexOf(valoreDaRicercare) !== -1){
            rows[i].style.display = "";
        } else{
            rows[i].style.display = "none";
        }
    }

    isRicerca = true;
    hideExtraRows();
    isRicerca = false;
}

function caricaClienti(){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var listaClienti = JSON.parse(httpReq.responseText);
                for(var i=listaClienti.length; i > 0; i--){
                    aggiungiRigaTableClienti(listaClienti[i-1]);
                }
                hideExtraRows();
                console.info("Caricamento dei clienti avvenuto con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante il caricamento dei clienti");
            }
        }
    }

    httpReq.open("GET","json/clienti.json");
    httpReq.send();
}

function selezionaCliente(){
    var valoreDaRicercare = document.getElementById("updateFieldClienti").value;

    if(!valoreDaRicercare || valoreDaRicercare===""){
        addErrorMessage(document.getElementById("updateFieldClienti"), "Campo richiesto");
        return;
    } else if(!isInt(valoreDaRicercare) || valoreDaRicercare <= 0){
        addErrorMessage(document.getElementById("updateFieldClienti"),"Deve essere un numero intero positivo");
        return;
    } else{
        removeErrorMessage(document.getElementById("updateFieldClienti"));
    }

    var rows = document.getElementById("tableClienti").tBodies[0].querySelectorAll("tr");

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
}

function eliminaCliente(){
    var valoreDaRicercare = document.getElementById("deleteFieldClienti").value;

    if(!valoreDaRicercare || valoreDaRicercare===""){
        addErrorMessage(document.getElementById("deleteFieldClienti"), "Campo richiesto");
        return;
    } else if(!isInt(valoreDaRicercare) || valoreDaRicercare <= 0){
        addErrorMessage(document.getElementById("deleteFieldClienti"), "Deve essere un numero intero positivo");
        return;
    } else{
        removeErrorMessage(document.getElementById("deleteFieldClienti"));
    }

    var rows = document.getElementById("tableClienti").tBodies[0].querySelectorAll("tr");
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
}

function esportaClientiExcel(){
    var table = document.getElementById("tableClienti");
    var wb = XLSX.utils.table_to_book(table, {sheet: "Clienti"});
    XLSX.writeFile(wb, "clienti.xlsx");
    console.info("Esportazione clienti in Excel avvenuta con successo");
}

var tHeadClienti = document.getElementById("tableClienti").tHead.querySelectorAll("tr")[0];
var lastSortedColumn = null;
var sortDirection = 'asc';

tHeadClienti.addEventListener('click', handlerTableClientiHeaderClick);

function handlerTableClientiHeaderClick(event){

    var target = event.target;

    var fieldName = target.getAttribute("data-index");

    if(!fieldName){
        return;
    }

    if(lastSortedColumn === fieldName){
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else{
        lastSortedColumn = fieldName;
        sortDirection = 'asc';
    }

    var headerFieldList = tHeadClienti.getElementsByTagName("th");
    var columnIndex = -1;

    for(var i=0; i < headerFieldList.length; i++){
        if(headerFieldList[i].getAttribute("data-index") === fieldName){
            columnIndex = i;
            break;
        }
    }

    if(columnIndex === -1){
        return;
    }

    var tBody = document.getElementById("tableClienti").tBodies[0];
    var rows = tBody.querySelectorAll("tr");
    rows = Array.from(rows);

    rows.sort(function(rowA, rowB){
        var a = rowA.cells[columnIndex].innerText.trim();
        var b = rowB.cells[columnIndex].innerText.trim();
        var comparison;

        if(!isNaN(b) && !isNaN(a)){
            var numA = parseFloat(a);
            var numB = parseFloat(b);
            comparison = numA - numB;
        } else{
            a = a.toLowerCase();
            b = b.toLowerCase();
            comparison = a.localeCompare(b);
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    while(tBody.firstChild){
        tBody.removeChild(tBody.firstChild);
    };

    rows.forEach(function(row){
        tBody.appendChild(row);
    });

    Array.from(headerFieldList).forEach(function(header){
        header.classList.remove("sort-asc","sort-desc");
    });

    target.classList.add(sortDirection === 'asc' ? "sort-asc" : "sort-desc");

    hideExtraRows();
}

function hideExtraRows(){
    var rows = document.getElementById("tableClienti").tBodies[0].querySelectorAll("tr");
    if(!isRicerca){
        rows.forEach(function(row){
            row.style.display = "";
        });
    }

    for(var i=50; i < rows.length; i++){
        rows[i].style.display = "none";
    }
}