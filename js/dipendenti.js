var selectedRow;
const STORAGE_KEY = "dipendenti";

function getDipendenti(){
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function setDipendenti(lista){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

function risolviManager(managerId){
    if(!managerId) return { first: "", last: "" };

    var dipendenti = getDipendenti();

    for(var i=0; i < dipendenti.length; i++){
        if(dipendenti[i].EMPLOYEE_ID === managerId){
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

function validateFormDipendenti(fieldDaValidare){

    var form = document.getElementById("formDipendenti");

    function addErrorMessage(element, message){

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
            case "BIRTHDATE":
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
            case "REPORTS_TO":
                if(fieldValue || fieldValue !== ""){
                    if(isInt(fieldValue)){
                        removeErrorMessage(fieldElement);
                    } else{
                        addErrorMessage(fieldElement, "Deve essere un numero");
                        isCampoValid = false;
                    }
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
        for(var i=0; i < formDipendentiFields.length; i++){
            var isCampoValid = validateField(fieldDaValidare);
            if(!isCampoValid){
                isValid = false;
            }
        }
    }

    return isValid;

}

function handlerFormDipendentiSubmitButtonClick(event){
    event.preventDefault();

    if(validateFormDipendenti()){
        var valori={}

        for(var i=0; i < formDipendentiFields.length; i++){
            var fieldIterato = formDipendentiFields[i];
            
            if(fieldIterato.tagName.toUpperCase() === 'SELECT'){
                valori[fieldIterato.name] = fieldIterato.options[fieldIterato.selectedIndex].innerText;
            } else if(fieldIterato.type === "date"){
                var dateValue = fieldIterato.valueAsDate;

                valori[fieldIterato.name] = formatDate(dateValue);
            } else{
                valori[fieldIterato.name] = fieldIterato.value;
            }
        }
    }

    function aggiungiOAggiornaDipendenteSuFile(valori, callback){
        var httpReq = new XMLHttpRequest();

        httpReq.onreadystatechange = function(){
            if(httpReq.readyState === 4){
                if(httpReq.status === 200){
                    console.info("Dipendente aggiunto o aggiornato con successo");
                    var record = JSON.parse(httpReq.responseText);
                    callback(record);
                } else{
                    console.error(httpReq.responseText);
                    alert("Errore durante l'aggiornamento o l'aggiunta del dipendente");
                }
            }
        }

        httpReq.open("POST", "json/dipendenti.json");
        httpReq.setRequestHeader("Content-Type", "application/json");
        httpReq.send(JSON.stringify(valori));
    }

    if(valori.EMPLOYEE_ID && valori.EMPLOYEE_ID !== "" && selectedRow){
        aggiungiOAggiornaDipendenteSuFile(valori, function(dipendenteAggiornato){
            aggiornaRigaTableDipendenti(dipendenteAggiornato);
            document.getElementById("formDipendenti").reset();
        })
    } else{
        aggiungiOAggiornaDipendenteSuFile(valori, function(dipendenteAggiunto){
            aggiungiRigaTableDipendenti(dipendenteAggiunto);
            document.getElementById("formDipendenti").reset();
        })
    }

    var sidebar = document.getElementById("sidebar");
    sidebar.classList.add("collapsed");
}

var formDipendentiFields = document.getElementById("formDipendenti").querySelectorAll('input:not(.btn), select');

var submitButton = document.getElementById("formDipendenti").querySelectorAll('input[type="submit"]')[0];

submitButton.addEventListener("click", handlerFormDipendentiSubmitButtonClick);

document.getElementById("tableDipendenti").tBodies[0].addEventListener("dblclick", handlerTableDipendentiRowClick);

function handlerFormDipendentiChange(event){
    validateFormDipendenti(this.name);
}

for(var indiceFormFields =0; indiceFormFields < formDipendentiFields.length; indiceFormFields++){
    formDipendentiFields[indiceFormFields].addEventListener("input", handlerFormDipendentiChange);
    formDipendentiFields[indiceFormFields].addEventListener("blur", handlerFormDipendentiChange);
}

function aggiungiRigaTableDipendenti(valori){

    var tr = document.createElement("tr");

    var tableDipendenti = document.getElementById("tableDipendenti");

    var headerFieldList = tableDipendenti.tHead.getElementsByTagName("th");

    var dipendentiData = getDipendenti();

    for(var i=0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        var td = document.createElement("td");

        if(fieldName){
            if(valori[fieldName]){
                if(fieldName === "MANAGER_FIRSTNAME" || fieldName === "MANAGER_LASTNAME"){
                    var managerId1 = valori["MANAGER_FIRSTNAME"];
                    var managerId2 = valori["MANAGER_LASTNAME"];
                    for(var k=0; k < dipendentiData.length; k++){
                        if(dipendentiData[k].LASTNAME == managerId2 || dipendentiData[k].FIRSTNAME == managerId1){
                            if(fieldName === "MANAGER_FIRSTNAME"){
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
                iEl.style["font-size"] = "16px";
                iEl.addEventListener("click", handlerTableDipendentiDeleteButtonClick);
                td.appendChild(iEl);
        }
        

        tr.appendChild(td);
    }

    tableDipendenti.tBodies[0].insertBefore(tr, tableDipendenti.tBodies[0].firstElementChild);

}

function aggiornaRigaTableDipendenti(valori){

    var tr = selectedRow;
    var tDataList = tr.querySelectorAll("td");
    var tableDipendenti = document.getElementById("tableDipendenti");
    var headerFieldList = tableDipendenti.tHead.getElementsByTagName("th");

    for(var i=0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");

        if(fieldName && fieldName!==""){
            if(valori[fieldName]){
                if(fieldName === "MANAGER_FIRSTNAME" || fieldName === "MANAGER_LASTNAME"){
                    var managerNames = risolviManager(valori["MANAGER_ID"]);
                    if(fieldName === "MANAGER_FIRSTNAME"){
                        tDataList[i].innerHTML = managerNames.first;
                    } else{
                        tDataList[i].innerHTML = managerNames.last;
                    }
                } else{
                    tDataList[i].innerHTML = valori[fieldName];
                }
            } else{
                tDataList[i].innerHTML = "";
            }
        }
    }
}

function handlerTableDipendentiRowClick(event){
    event.stopPropagation();

    var target = event.target;
    var tr;

    var sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("collapsed");

    if(target.tagName.toUpperCase() === "TD" && target.querySelectorAll("i").length > 0){
        return;
    }

    var tBody = document.getElementById("tableDipendenti").tBodies[0];

    var previousSelectedElement = tBody.querySelectorAll("tr.selected");

    if(previousSelectedElement.length > 0){
        previousSelectedElement[0].classList.remove("selected");
    }

    if(target.tagName.toUpperCase() === "TD"){
        tr = target.parentNode;
    } else{
        tr = target;
    }

    tr.classList.add("selected");
    selectedRow = tr;

    var tDataList = tr.querySelectorAll("td");
    var headerFieldList = document.getElementById("tableDipendenti").tHead.getElementsByTagName("th");
    var form = document.getElementById("formDipendenti");

    for(var i=0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        if(fieldName && fieldName!==""){
            var valore = tDataList[i].innerText;
            var formField = form[fieldName];

            if(fieldName === "BIRTHDATE" || fieldName === "HIREDATE"){
                if(valore !== ""){
                    var splittedStringDate = valore.split("-");

                    valore = "19" + splittedStringDate[2] + "-" + splittedStringDate[1] + "-" + splittedStringDate[0];
                }
            } else if(fieldName === "TITLE" || fieldName === "TITLE_OF_COURTESY"){
                if(valore && valore != null){
                    var selectOptions = formField.options;
                    for(var j=0; j < selectOptions.length; j++){
                        if(selectOptions[j].innerText === valore){
                            valore = selectOptions[j].value;
                            break;
                        }
                    }
                }
            } else if(fieldName === "MANAGER_FIRSTNAME" || fieldName === "MANAGER_LASTNAME"){
                if(valore && valore != null){
                    var managerId = "";
                    var dipendentiData = getDipendenti();
                    for(var k=0; k < dipendentiData.length; k++){
                        if((dipendentiData[k].FIRSTNAME === tDataList[i].innerText || dipendentiData[k].LASTNAME === tDataList[i].innerText)){
                            managerId = dipendentiData[k].EMPLOYEE_ID;
                            break;
                        }
                    }
                    valore = managerId;
                }
                fieldName = "MANAGER_ID";
                formField = form[fieldName];
            }

            if(formField){
                formField.value = valore;
            }
        }
    }

}

function handlerTableDipendentiDeleteButtonClick(event){
    event.stopPropagation();

    var target = event.target;
    var tr = target.parentNode.parentNode;

    var EmployeeId = tr.firstElementChild.innerText;

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                tr.parentNode.removeChild(tr);
                console.info("Eliminazione avvenuta con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante l'eliminazione del dipendente");
            }
        }
    }

    httpReq.open("DELETE", "json/dipendenti.json?EMPLOYEE_ID="+EmployeeId);
    httpReq.send();

}

function ricercaDipendenti(){

    var valoreDaRicercare = document.getElementById("searchFieldDipendenti").value.toLowerCase();

    var rows = document.getElementById("tableDipendenti").tBodies[0].querySelectorAll("tr");

    for(var i=0; i < rows.length; i++){
        if(!valoreDaRicercare || valoreDaRicercare === ""){
            rows[i].style.display = "";
        } else if(rows[i].innerText.toLowerCase().indexOf(valoreDaRicercare) !== -1){
            rows[i].style.display = "";
        } else{
            rows[i].style.display = "none";
        }
    }

}

function caricaDipendenti(){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var listaDipendenti = JSON.parse(httpReq.responseText);                
                setDipendenti(listaDipendenti);       
                for(var i=listaDipendenti.length, counter = 0; i > 0 && counter < 50; i--, counter++){
                    aggiungiRigaTableDipendenti(listaDipendenti[i-1]);
                }
                console.info("Caricamento avvenuto con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante il caricamento");
            }
        }
    }

    httpReq.open("GET", "json/dipendenti.json");

    httpReq.send();

}

function selezionaDipendente(){
    var valoreDaRicercare = document.getElementById("updateFieldDipendenti").value;

    if(!valoreDaRicercare || valoreDaRicercare === "" || !isInt(valoreDaRicercare)){
        return;
    }   

    var rows = document.getElementById("tableDipendenti").tBodies[0].querySelectorAll("tr");
 
    for(var i=0; i < rows.length; i++){
        if(rows[i].firstElementChild.innerText === valoreDaRicercare){
            targetRow = rows[i];
            break;
        }
    }

    if(targetRow){
        var dblClickEvent = new MouseEvent('dblclick', {
                bubbles: true,
                composed: true,
                view: window
            });

            targetRow.dispatchEvent(dblClickEvent);
    }
}

function eliminaDipendente(){
    var valoreDaRicercare = document.getElementById("deleteFieldDipendenti").value;

    if(!valoreDaRicercare || valoreDaRicercare === "" || !isInt(valoreDaRicercare)){
        return;
    }   

    var rows = document.getElementById("tableDipendenti").tBodies[0].querySelectorAll("tr");
    var targetIcon = null;
 
    for(var i=0; i < rows.length; i++){
        if(rows[i].firstElementChild.innerText === valoreDaRicercare){
            targetIcon = rows[i].querySelectorAll("i")[0];
            break;
        }
    }

    if(targetIcon){
        var clickEvent = new MouseEvent('click', {
                bubbles: true,
                composed: true,
                view: window
            });

            targetIcon.dispatchEvent(clickEvent);
    }
}
