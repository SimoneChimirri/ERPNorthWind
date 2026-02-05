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

function validateFormProdotti(fieldDaValidare){
    var form = document.getElementById("formProdotti");

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
            if(fieldIterato.type === "checkbox"){
                console.log("Checkbox trovato: "+fieldIterato.name+" con valore: "+fieldIterato.checked);
                valori[fieldIterato.name] = fieldIterato.checked === true ? "Y" : "N";
            } else if(fieldIterato.type === "number"){
                valori[fieldIterato.name] = parseFloat(fieldIterato.value);
            }else if(fieldIterato.value && fieldIterato.value !== ""){
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

        var sidebar = document.getElementById("sidebar");
        sidebar.classList.add("collapsed");
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
    hideExtraRows("tableProdotti");
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
    hideExtraRows("tableProdotti");
}

function handlerTableProdottiRowClick(event){
    event.stopPropagation();
    var target = event.target;

    var sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("collapsed");

    if(target.tagName.toUpperCase()==="TD" && target.querySelectorAll("i").length > 0){
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

document.getElementById("tableProdotti").tBodies[0].addEventListener("dblclick", handlerTableProdottiRowClick);

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
                hideExtraRows("tableProdotti");
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

var isRicerca = false;

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
    isRicerca = true;
    hideExtraRows("tableProdotti");
    isRicerca = false;
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
                hideExtraRows("tableProdotti");
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

function selezionaProdotto(){
    var valoreDaRicercare = document.getElementById("updateFieldProdotti").value;

    if(!valoreDaRicercare || valoreDaRicercare===""){
        addErrorMessage(document.getElementById("updateFieldProdotti"), "Campo richiesto");
        return;
    } else if(!isInt(valoreDaRicercare) || valoreDaRicercare <= 0){
        addErrorMessage(document.getElementById("updateFieldProdotti"), "Deve essere un numero intero positivo");
        return;
    } else{
        removeErrorMessage(document.getElementById("updateFieldProdotti"));
    }

    var rows = document.getElementById("tableProdotti").tBodies[0].querySelectorAll("tr");
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

function eliminaProdotto(){

    var valoreDaRicercare = document.getElementById("deleteFieldProdotti").value;

    if(!valoreDaRicercare || valoreDaRicercare===""){
        addErrorMessage(document.getElementById("deleteFieldProdotti"), "Campo richiesto");
        return;
    } else if(!isInt(valoreDaRicercare) || valoreDaRicercare <= 0){
        addErrorMessage(document.getElementById("deleteFieldProdotti"), "Deve essere un numero intero positivo");
        return;
    } else{
        removeErrorMessage(document.getElementById("deleteFieldProdotti"));
    }

    var rows = document.getElementById("tableProdotti").tBodies[0].querySelectorAll("tr");
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

function esportaProdottiExcel(){
    var table = document.getElementById("tableProdotti");
    var wb = XLSX.utils.table_to_book(table, {sheet: "Prodotti"});
    XLSX.writeFile(wb, "prodotti.xlsx");
    console.info("Esportazione prodotti in Excel avvenuta con successo");
}

tHeadProdotti = document.getElementById("tableProdotti").tHead.querySelectorAll("tr")[0];
var lastSortedColumn = null;
var sortDirection = 'asc';

tHeadProdotti.addEventListener('click', handlerTableProdottiHeaderClick);

function handlerTableProdottiHeaderClick(event){
    event.preventDefault();
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

    var columnIndex = -1;
    var headerFieldList = tHeadProdotti.getElementsByTagName("th");

    for(var i=0; i < headerFieldList.length; i++){
        if(headerFieldList[i].getAttribute("data-index") === fieldName){
            columnIndex = i;
            break;
        }
    }

    if(columnIndex === -1){
        return;
    }

    var tBody = document.getElementById("tableProdotti").tBodies[0];
    var rows = tBody.querySelectorAll("tr");
    rows = Array.from(rows);

    rows.sort(function(rowA, rowB){
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

}

function validateFormCategorie(fieldDaValidare){
    var form = document.getElementById("formCategorie");

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
            if(!fieldIterato.value || fieldIterato.value === ""){
                continue;
            }
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
    hideExtraRows("tableCategorie");
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
    hideExtraRows("tableCategorie");
}

function handlerTableCategorieRowClick(event){
    event.stopPropagation();
    var target = event.target;

    var sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("collapsed");

    if(target.tagName.toUpperCase()==="TD" && target.querySelectorAll("i").length > 0){
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

document.getElementById("tableCategorie").tBodies[0].addEventListener("dblclick", handlerTableCategorieRowClick);

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
                hideExtraRows("tableCategorie");
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
    isRicerca = true;
    hideExtraRows("tableCategorie");
    isRicerca = false;
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
                hideExtraRows("tableCategorie");
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

function selezionaCategoria(){

    var valoreDaRicercare = document.getElementById("updateFieldCategorie").value;

    if(!valoreDaRicercare || valoreDaRicercare===""){
        addErrorMessage(document.getElementById("updateFieldCategorie"), "Campo richiesto");
        return;
    } else if(!isInt(valoreDaRicercare) || valoreDaRicercare <= 0){
        addErrorMessage(document.getElementById("updateFieldCategorie"), "Deve essere un numero intero positivo");
        return;
    } else{
        removeErrorMessage(document.getElementById("updateFieldCategorie"));
    }

    var rows = document.getElementById("tableCategorie").tBodies[0].querySelectorAll("tr");
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

function eliminaCategoria(){

    var valoreDaRicercare = document.getElementById("deleteFieldCategorie").value;

    if(!valoreDaRicercare || valoreDaRicercare===""){
        addErrorMessage(document.getElementById("deleteFieldCategorie"), "Campo richiesto");
        return;
    } else if(!isInt(valoreDaRicercare) || valoreDaRicercare <= 0){
        addErrorMessage(document.getElementById("deleteFieldCategorie"), "Deve essere un numero intero positivo");
        return;
    } else{
        removeErrorMessage(document.getElementById("deleteFieldCategorie"));
    }

    var rows = document.getElementById("tableCategorie").tBodies[0].querySelectorAll("tr");
    var targetIcon = null;

    for(var i=0; i < rows.length; i++){
        if(valoreDaRicercare === rows[i].firstElementChild.innerText){
            targetIcon= rows[i].querySelectorAll("i")[0];
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

function esportaCategorieExcel(){
    var table = document.getElementById("tableCategorie");
    var wb = XLSX.utils.table_to_book(table, {sheet: "Categorie"});
    XLSX.writeFile(wb, "categorie.xlsx");
    console.info("Esportazione categorie in Excel avvenuta con successo");
}


var tHeadCategorie = document.getElementById("tableCategorie").tHead.querySelectorAll("tr")[0];
var sortDirection = 'asc';
var lastSortedColumn = null;

tHeadCategorie.addEventListener('click',handlerTableCategorieHeaderClick);

function handlerTableCategorieHeaderClick(event){
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

    var columnIndex = -1;
    var headerFieldList = tHeadCategorie.querySelectorAll("th");

    for(var i=0; i < headerFieldList.length; i++){
        if(headerFieldList[i].getAttribute("data-index") === fieldName){
            columnIndex = i;
            break;
        }
    }

    if(columnIndex === -1){
        return;
    }

    var tBody = document.getElementById("tableCategorie").tBodies[0];
    var rows = tBody.querySelectorAll("tr");
    rows = Array.from(rows);

    rows.sort(function(rowA,rowB){
        var a = rowA.cells[columnIndex].innerText.trim();
        var b = rowB.cells[columnIndex].innerText.trim();
        var comparison;

        if(!isNaN(a) && !isNaN(b)){
            var numA = parseFloat(a);
            var numB = parseFloat(b);
            comparison = numA-numB;
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
}

function hideExtraRows(tableName){
    var rows = document.getElementById(tableName).tBodies[0].querySelectorAll("tr");

    if(!isRicerca){
        rows.forEach(function(row){
            row.style.display = "";
        });
    }

    for(var i=50; i < rows.length; i++){
        rows[i].style.display = "none";
    }
}