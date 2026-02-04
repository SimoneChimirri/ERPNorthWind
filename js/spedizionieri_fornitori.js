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

function validateFormSpedizionieri(fieldDaValidare){
    var form = document.getElementById("formSpedizionieri");

    function validateField(fieldDaValidare){
        var isCampoValid = true;
        var fieldElement = form[fieldDaValidare];
        var fieldValue = fieldElement.value;

        if(fieldDaValidare === "COMPANY_NAME"){
                if(!fieldValue || fieldValue === ""){
                    addErrorMessage(fieldElement, "Campo richiesto");
                    isCampoValid = false;
                } else{
                    removeErrorMessage(fieldElement);
                }
        }

        if(fieldDaValidare === "PHONE"){
            if(!fieldValue || fieldValue === ""){
                addErrorMessage(fieldElement, "Campo richiesto");
                isCampoValid = false;
            } else if (!/^[0-9+\-\s()]+$/.test(fieldValue)){
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
        for(var i=0; i < formSpedizionieriFields.length; i++){
            var isCampoValid = validateField(formSpedizionieriFields[i].name);
            if(!isCampoValid){
                isValid = false;
            }
        }
    }

    return isValid;
}

function handlerFormSpedizionieriSubmitButtonClick(event){
    event.preventDefault();

    if(validateFormSpedizionieri()){
        var valori={}

        for(var i=0; i < formSpedizionieriFields.length; i++){
            var fieldIterato = formSpedizionieriFields[i];
            if(fieldIterato.value && fieldIterato.value !== ""){
                valori[fieldIterato.name] = fieldIterato.value;
            }
        }

        function aggiungiOAggiornaSpedizioniereSuFile(valori,callback){
            var httpReq = new XMLHttpRequest();

            httpReq.onreadystatechange = function(){
                if(httpReq.readyState === 4){
                    if(httpReq.status === 200){
                        console.info("Spedizioniere aggiunto o aggiornato con successo");
                        var record = JSON.parse(httpReq.responseText);
                        callback(record);
                    } else{
                        console.error(httpReq.responseText);
                        alert("Errore durante l'aggiornamento o l'inserimento dello spedizioniere");
                    }
                }
            }

            httpReq.open("POST","json/spedizionieri.json");
            httpReq.setRequestHeader("Content-Type","application/json");
            httpReq.send(JSON.stringify(valori));
        }

        if(valori.SHIPPER_ID && valori.SHIPPER_ID !== "" && selectedRow){
            aggiungiOAggiornaSpedizioniereSuFile(valori,function(spedizioniereAggiornato){
                aggiornaRigaTableSpedizionieri(spedizioniereAggiornato);
                document.getElementById("formSpedizionieri").reset();
            })
        } else{
            aggiungiOAggiornaSpedizioniereSuFile(valori, function(spedizioniereAggiunto){
                aggiungiRigaTableSpedizionieri(spedizioniereAggiunto);
                document.getElementById("formSpedizionieri").reset();
            })
        }

        var sidebar = document.getElementById("sidebar");
        sidebar.classList.add("collapsed");
    } else{

    }
}

var formSpedizionieriFields = document.getElementById("formSpedizionieri").querySelectorAll('input:not(.btn), select');

var submitButtonSpedizionieri = document.getElementById("formSpedizionieri").querySelectorAll('input[type="submit"]')[0];

submitButtonSpedizionieri.addEventListener("click", handlerFormSpedizionieriSubmitButtonClick);

function handlerFieldFormSpedizionieriChange(event){
    validateFormSpedizionieri(this.name);
}

for(var indiceFormField = 0; indiceFormField < formSpedizionieriFields.length; indiceFormField ++){
    formSpedizionieriFields[indiceFormField].addEventListener("input", handlerFieldFormSpedizionieriChange);
    formSpedizionieriFields[indiceFormField].addEventListener("blur", handlerFieldFormSpedizionieriChange);
}


function aggiungiRigaTableSpedizionieri(valori){
    var tr = document.createElement("tr");

    var tableSpedizionieri = document.getElementById("tableSpedizionieri");

    var headerFieldList = tableSpedizionieri.tHead.getElementsByTagName("th");

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
            iEl.addEventListener("click", handlerTableSpedizionieriDeleteButtonClick);
            td.appendChild(iEl);
        }
        tr.appendChild(td);
    }

    tableSpedizionieri.tBodies[0].insertBefore(tr, tableSpedizionieri.tBodies[0].firstElementChild);
}

function aggiornaRigaTableSpedizionieri(valori){

    var tr = selectedRow;
    var tDataList = tr.querySelectorAll("td");
    var tableSpedizionieri = document.getElementById("tableSpedizionieri");
    var headerFieldList = tableSpedizionieri.tHead.getElementsByTagName("th");

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

function handlerTableSpedizionieriRowClick(event){
    event.stopPropagation();
    var target = event.target;

    var sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("collapsed");

    if(target.tagName.toUpperCase()==="TD" && target.querySelectorAll("i").length > 0){
        return;
    }

    var tBody = document.getElementById("tableSpedizionieri").tBodies[0];

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
    var headerFieldList = document.getElementById("tableSpedizionieri").tHead.getElementsByTagName("th");
    var form = document.getElementById("formSpedizionieri");

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        if(fieldName && fieldName!== ""){
            var valore = tDataList[i].innerText;
            var formField = form[fieldName];

            formField.value = valore;
        }
    }

}

document.getElementById("tableSpedizionieri").tBodies[0].addEventListener("dblclick", handlerTableSpedizionieriRowClick);

function handlerTableSpedizionieriDeleteButtonClick(event){
    event.stopPropagation();
    var target = event.target;

    var tr = target.parentNode.parentNode;

    var spedizioniereId = tr.firstElementChild.innerText;

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                tr.parentNode.removeChild(tr);
                console.info("Eliminazione avvenuta con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante l'eliminazione dello spedizioniere");
            }
        }
    }

    httpReq.open("DELETE", "json/spedizionieri.json?SHIPPER_ID="+spedizioniereId);

    httpReq.send();
}

document.getElementById("tableSpedizionieri").tBodies[0].getElementsByTagName("i")[0];

function ricercaSpedizionieri(){
    var valoreDaRicercare = document.getElementById("searchFieldSpedizionieri").value.toLowerCase();

    var rows = document.getElementById("tableSpedizionieri").tBodies[0].querySelectorAll("tr");

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

function caricaSpedizionieri(){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var listaSpedizionieri = JSON.parse(httpReq.responseText);
                for(var i=listaSpedizionieri.length, counter = 0; i > 0 && counter < 50; i--, counter++){
                    aggiungiRigaTableSpedizionieri(listaSpedizionieri[i-1]);
                }
                console.info("Caricamento degli spedizionieri avvenuto con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante il caricamento degli spedizionieri");
            }
        }
    }

    httpReq.open("GET","json/spedizionieri.json");
    httpReq.send();
}

function selezionaSpedizioniere(){

    var valoreDaRicercare = document.getElementById("updateFieldSpedizionieri").value;

    if(!valoreDaRicercare || valoreDaRicercare===""){
        addErrorMessage(document.getElementById("updateFieldSpedizionieri"), "Campo richiesto");
        return;
    } else if(!isInt(valoreDaRicercare) || valoreDaRicercare <= 0){
        addErrorMessage(document.getElementById("updateFieldSpedizionieri"), "Deve essere un numero intero positivo");
        return;
    } else{
        removeErrorMessage(document.getElementById("updateFieldSpedizionieri"));
    }

    var rows = document.getElementById("tableSpedizionieri").tBodies[0].querySelectorAll("tr");
    var targetRow = null;

    for(var i=0; i < rows.length; i++){
        if(valoreDaRicercare === rows[i].firstElementChild.innerText){
            targetRow = rows[i];
            break;
        }
    }

    if(targetRow){
        var dblClickEvent = new MouseEvent('dblclick', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        targetRow.dispatchEvent(dblClickEvent);
    }


}

function eliminaSpedizioniere(){

    var valoreDaRicercare = document.getElementById("deleteFieldSpedizionieri").value;

    if(!valoreDaRicercare || valoreDaRicercare===""){
        addErrorMessage(document.getElementById("deleteFieldSpedizionieri"), "Campo richiesto");
        return;
    } else if(!isInt(valoreDaRicercare) || valoreDaRicercare <= 0){
        addErrorMessage(document.getElementById("deleteFieldSpedizionieri"), "Deve essere un numero intero positivo");
        return;
    } else{
        removeErrorMessage(document.getElementById("deleteFieldSpedizionieri"));
    }

    var rows = document.getElementById("tableSpedizionieri").tBodies[0].querySelectorAll("tr");
    var targetIcon = null;

    for(var i=0; i < rows.length; i++){
        if(valoreDaRicercare === rows[i].firstElementChild.innerText){
            targetIcon = rows[i].querySelectorAll("i")[0];
            break;
        }
    }

    if(targetIcon){
        var clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        targetIcon.dispatchEvent(clickEvent);
    }


}

function esportaSpedizionieriExcel(){
    var table = document.getElementById("tableSpedizionieri");
    var wb = XLSX.utils.table_to_book(table, {sheet: "Spedizionieri"});
    XLSX.writeFile(wb, "spedizionieri.xlsx");
    console.info("Esportazione spedizionieri in Excel avvenuta con successo");
}

tHeadSpedizionieri = document.getElementById("tableSpedizionieri").tHead.querySelectorAll("tr")[0];
var lastSortedColumn = null;
var sortDirection = 'asc';

tHeadSpedizionieri.addEventListener('click', handlerTableSpedizionieriHeaderClick);

function handlerTableSpedizionieriHeaderClick(event){
    event.preventDefault();
    target = event.target;

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

    var headerFieldList = tHeadSpedizionieri.querySelectorAll("th");
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

    var tBody = document.getElementById("tableSpedizionieri").tBodies[0];
    var rows = tBody.querySelectorAll("tr");
    rows = Array.from(rows);

    rows.sort(function(rowA,rowB){
        var a = rowA.cells[columnIndex].innerText.trim();
        var b = rowB.cells[columnIndex].innerText.trim();
        var comparison;

        if(!isNaN(a) && !isNaN(b)){
            var numA = parseFloat(a);
            var numB = parseFloat(b);
            comparison = numA - numB;
        } else{
            a = a.toLowerCase();
            b = b.toLowerCase();
            comparison = a.localeCompare(b);
        }

        return sortDirection === 'asc' ? comparison : -comparison;

    })

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

}

function validateFormFornitori(fieldDaValidare){
    var form = document.getElementById("formFornitori");

    function validateField(fieldDaValidare){
        var isCampoValid = true;
        var fieldElement = form[fieldDaValidare];
        var fieldValue = fieldElement.value;

        switch(fieldDaValidare){
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
                } else if (!/^[0-9+\-\s()]+$/.test(fieldValue)){
                    addErrorMessage(fieldElement, "Formato numero di telefono non valido");
                    isCampoValid = false;
                } else{
                    removeErrorMessage(fieldElement);
                }
                break;
        }

        return isCampoValid;

    }

    var isValid = true;

    if(fieldDaValidare){
        validateField(fieldDaValidare);
    } else{
        for(var i=0; i < formFornitoriFields.length; i++){
            var isCampoValid = validateField(formFornitoriFields[i].name);
            if(!isCampoValid){
                isValid = false;
            }
        }
    }

    return isValid;
}

function handlerFormFornitoriSubmitButtonClick(event){
    event.preventDefault();

    if(validateFormFornitori()){
        var valori={}

        for(var i=0; i < formFornitoriFields.length; i++){
            var fieldIterato = formFornitoriFields[i];
            if(fieldIterato.tagName.toUpperCase() == "SELECT"){
                valori[fieldIterato.name] = fieldIterato.options[fieldIterato.selectedIndex].innerText;
            }else if(!fieldIterato.value && fieldIterato.value === ""){
                continue;
            } else{
                valori[fieldIterato.name] = fieldIterato.value;
            }
        }

        function aggiungiOAggiornaFornitoreSuFile(valori,callback){
            var httpReq = new XMLHttpRequest();

            httpReq.onreadystatechange = function(){
                if(httpReq.readyState === 4){
                    if(httpReq.status === 200){
                        console.info("Fornitore aggiunto o aggiornato con successo");
                        var record = JSON.parse(httpReq.responseText);
                        callback(record);
                    } else{
                        console.error(httpReq.responseText);
                        alert("Errore durante l'aggiornamento o l'inserimento del fornitore");
                    }
                }
            }

            httpReq.open("POST","json/fornitori.json");
            httpReq.setRequestHeader("Content-Type","application/json");
            httpReq.send(JSON.stringify(valori));
        }

        if(valori.SUPPLIER_ID && valori.SUPPLIER_ID !== "" && selectedRow){
            aggiungiOAggiornaFornitoreSuFile(valori,function(fornitoreAggiornato){
                aggiornaRigaTableFornitori(fornitoreAggiornato);
                document.getElementById("formFornitori").reset();
            })
        } else{
            aggiungiOAggiornaFornitoreSuFile(valori, function(fornitoreAggiunto){
                aggiungiRigaTableFornitori(fornitoreAggiunto);
                document.getElementById("formFornitori").reset();
            })
        }
    } else{

    }
}

var formFornitoriFields = document.getElementById("formFornitori").querySelectorAll('input:not(.btn), select');

var submitButtonFornitori = document.getElementById("formFornitori").querySelectorAll('input[type="submit"]')[0];

submitButtonFornitori.addEventListener("click", handlerFormFornitoriSubmitButtonClick);
function handlerFieldFormFornitoriChange(event){
    validateFormFornitori(this.name);
}
for(var indiceFormField = 0; indiceFormField < formFornitoriFields.length; indiceFormField ++){
    formFornitoriFields[indiceFormField].addEventListener("input", handlerFieldFormFornitoriChange);
    formFornitoriFields[indiceFormField].addEventListener("blur", handlerFieldFormFornitoriChange);
}


function aggiungiRigaTableFornitori(valori){
    var tr = document.createElement("tr");

    var tableFornitori = document.getElementById("tableFornitori");

    var headerFieldList = tableFornitori.tHead.getElementsByTagName("th");

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
            iEl.addEventListener("click", handlerTableFornitoriDeleteButtonClick);
            td.appendChild(iEl);
        }
        tr.appendChild(td);
    }

    tableFornitori.tBodies[0].insertBefore(tr, tableFornitori.tBodies[0].firstElementChild);
}

function aggiornaRigaTableFornitori(valori){

    var tr = selectedRow;
    var tDataList = tr.querySelectorAll("td");
    var tableFornitori = document.getElementById("tableFornitori");
    var headerFieldList = tableFornitori.tHead.getElementsByTagName("th");

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

function handlerTableFornitoriRowClick(event){
    event.stopPropagation();
    var target = event.target;

    var sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("collapsed");

    if(target.tagName.toUpperCase()==="TD" && target.querySelectorAll("i").length > 0){
        return;
    }

    var tBody = document.getElementById("tableFornitori").tBodies[0];

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
    var headerFieldList = document.getElementById("tableFornitori").tHead.getElementsByTagName("th");
    var form = document.getElementById("formFornitori");

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

document.getElementById("tableFornitori").tBodies[0].addEventListener("dblclick", handlerTableFornitoriRowClick);

function handlerTableFornitoriDeleteButtonClick(event){
    event.stopPropagation();
    var target = event.target;

    var tr = target.parentNode.parentNode;

    var supplierId = tr.firstElementChild.innerText;

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                tr.parentNode.removeChild(tr);
                console.info("Eliminazione avvenuta con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante l'eliminazione del fornitore");
            }
        }
    }

    httpReq.open("DELETE", "json/fornitori.json?SUPPLIER_ID="+supplierId);

    httpReq.send();
}

document.getElementById("tableFornitori").tBodies[0].getElementsByTagName("i")[0];

function ricercaFornitori(){
    var valoreDaRicercare = document.getElementById("searchFieldFornitori").value.toLowerCase();

    var rows = document.getElementById("tableFornitori").tBodies[0].querySelectorAll("tr");

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

function caricaFornitori(){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var listaFornitori = JSON.parse(httpReq.responseText);
                for(var i=listaFornitori.length, counter = 0; i > 0 && counter < 50; i--, counter++){
                    aggiungiRigaTableFornitori(listaFornitori[i-1]);
                }
                console.info("Caricamento dei fornitori avvenuto con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante il caricamento dei fornitori");
            }
        }
    }

    httpReq.open("GET","json/fornitori.json");
    httpReq.send();
}

function selezionaFornitore(){

    var valoreDaRicercare = document.getElementById("updateFieldFornitori").value;

    if(!valoreDaRicercare || valoreDaRicercare===""){
        addErrorMessage(document.getElementById("updateFieldFornitori"), "Campo richiesto");
        return;
    } else if(!isInt(valoreDaRicercare) || valoreDaRicercare <= 0){
        addErrorMessage(document.getElementById("updateFieldFornitori"), "Deve essere un numero intero positivo");
        return;
    } else{
        removeErrorMessage(document.getElementById("updateFieldFornitori"));
    }

    var rows = document.getElementById("tableFornitori").tBodies[0].querySelectorAll("tr");
    var targetRow = null;

    for(var i=0; i < rows.length; i++){
        if(valoreDaRicercare === rows[i].firstElementChild.innerText){
            targetRow = rows[i];
            break;
        }
    }

    if(targetRow){
        var dblClickEvent = new MouseEvent('dblclick',{
            bubbles: true,
            cancelable: true,
            view: window
        });

        targetRow.dispatchEvent(dblClickEvent);
    }
}

function eliminaFornitore(){

    var valoreDaRicercare = document.getElementById("deleteFieldFornitori").value;

    if(!valoreDaRicercare || valoreDaRicercare===""){
        addErrorMessage(document.getElementById("deleteFieldFornitori"), "Campo richiesto");
        return;
    } else if(!isInt(valoreDaRicercare) || valoreDaRicercare <= 0){
        addErrorMessage(document.getElementById("deleteFieldFornitori"), "Deve essere un numero intero positivo");
        return;
    } else{
        removeErrorMessage(document.getElementById("deleteFieldFornitori"));
    }

    var rows = document.getElementById("tableFornitori").tBodies[0].querySelectorAll("tr");
    var targetIcon = null;

    for(var i=0; i < rows.length; i++){
        if(valoreDaRicercare === rows[i].firstElementChild.innerText){
            targetIcon = rows[i].querySelectorAll("i")[0];
            break;
        }
    }

    if(targetIcon){
        var clickEvent = new MouseEvent('click',{
            bubbles: true,
            cancelable: true,
            view: window
        });

        targetIcon.dispatchEvent(clickEvent);
    }
}

function esportaFornitoriExcel(){
    var table = document.getElementById("tableFornitori");
    var wb = XLSX.utils.table_to_book(table, {sheet: "Fornitori"});
    XLSX.writeFile(wb, "fornitori.xlsx");
    console.info("Esportazione fornitori in Excel avvenuta con successo");
}

tHeadFornitori = document.getElementById("tableFornitori").tHead.querySelectorAll("tr")[0];
var lastSortedColumn = null;
var sortDirection = 'asc';

tHeadFornitori.addEventListener('click', handlerTableFornitoriHeaderClick);
function handlerTableFornitoriHeaderClick(event){
    event.preventDefault();
    target = event.target;

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

    var headerFieldList = tHeadFornitori.querySelectorAll("th");
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

    var tBody = document.getElementById("tableFornitori").tBodies[0];
    var rows = tBody.querySelectorAll("tr");
    rows = Array.from(rows);

    rows.sort(function(rowA,rowB){
        var a = rowA.cells[columnIndex].innerText.trim();
        var b = rowB.cells[columnIndex].innerText.trim();
        var comparison;

        if(!isNaN(a) && !isNaN(b)){
            var numA = parseFloat(a);
            var numB = parseFloat(b);
            comparison = numA - numB;
        } else{
            a = a.toLowerCase();
            b = b.toLowerCase();
            comparison = a.localeCompare(b);
        }

        return sortDirection === 'asc' ? comparison : -comparison;

    })

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

}