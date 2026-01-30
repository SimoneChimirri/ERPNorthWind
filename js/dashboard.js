function caricaGraficoOrdiniPerCategoria(){
    var ordini = [];
    var dettagliOrdini = [];
    var prodotti = [];
    var categorie = [];

    var loadedFiles = 0;

    function checkAllLoaded(){
        loadedFiles++;
        if(loadedFiles === 4){
            creaGraficoPerCategoria(dettagliOrdini, prodotti, categorie);
        }
    }

    var httpReq1 = new XMLHttpRequest();
    httpReq1.onreadystatechange = function(){
        if(httpReq1.readyState === 4 && httpReq1.status === 200){
            ordini = JSON.parse(httpReq1.responseText);
            checkAllLoaded();
        }
    }
    httpReq1.open("GET","json/ordini.json");
    httpReq1.send();

    var httpReq2 = new XMLHttpRequest();
    httpReq2.onreadystatechange = function(){
        if(httpReq2.readyState === 4 && httpReq2.status === 200){
            dettagliOrdini = JSON.parse(httpReq2.responseText);
            checkAllLoaded();
        }
    }
    httpReq2.open("GET","json/dettagli_ordini.json");
    httpReq2.send();

    var httpReq3 = new XMLHttpRequest();
    httpReq3.onreadystatechange = function(){
        if(httpReq3.readyState === 4 && httpReq3.status === 200){
            prodotti = JSON.parse(httpReq3.responseText);
            checkAllLoaded();
        }
    }
    httpReq3.open("GET","json/prodotti.json");
    httpReq3.send();

    var httpReq4 = new XMLHttpRequest();
    httpReq4.onreadystatechange = function(){
        if(httpReq4.readyState === 4 && httpReq4.status === 200){
            categorie = JSON.parse(httpReq4.responseText);
            checkAllLoaded();
        }
    }
    httpReq4.open("GET","json/categorie.json");
    httpReq4.send();
}

function creaGraficoPerCategoria(dettagliOrdini, prodotti, categorie){
    var prodottiMap = {};
    for(var i = 0; i < prodotti.length; i++){
        prodottiMap[prodotti[i].PRODUCT_ID] = prodotti[i];
    }

    var categorieCount = {};
    for(var i = 0; i < categorie.length; i++){
        categorieCount[categorie[i].CATEGORY_NAME] = 0;
    }

    for(var i = 0; i < dettagliOrdini.length; i++){
        var dettaglio = dettagliOrdini[i];
        var prodotto = prodottiMap[dettaglio.PRODUCT_ID];
        if(prodotto){
            var categoria = prodotto.CATEGORY;
            if(categoria in categorieCount){
                categorieCount[categoria]++;
            } else {
                categorieCount[categoria] = 1;
            }
        }
    }

    var labels = [];
    var data = [];
    var colors = [
        'FF6384',
        '36A2EB',
        'FFCE56',
        '4BC0C0',
        '9966FF',
        'FF9F40',
        'FF6384',
        'C9CBCF'
    ];

    var colorIndex = 0;
    for(var categoria in categorieCount){
        if(categorieCount[categoria] > 0){
            labels.push(categoria);
            data.push(categorieCount[categoria]);
            colorIndex++;
        }
    }

    var ctx = document.getElementById("categoriesChart").getContext("2d");
    var pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.map(function(color){ return '#' + color; }),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: false
                }
            }
        }
    });

    console.info("Grafico delle categorie creato con successo");
}

function aggiungiRigaTableOrdini(valori){
    var tr = document.createElement("tr");

    var tableOrdini = document.getElementById("tableOrdini");

    var headerFieldList = tableOrdini.tHead.getElementsByTagName("th");

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        var td = document.createElement("td");

        if(fieldName && valori[fieldName]){
            td.innerHTML = valori[fieldName];
        }
        tr.appendChild(td);
    }

    tableOrdini.tBodies[0].insertBefore(tr, tableOrdini.tBodies[0].firstElementChild);
}

function caricaOrdini(){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var listaOrdini = JSON.parse(httpReq.responseText);
                for(var i=listaOrdini.length; i > listaOrdini.length - 10; i--){
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

function aggiungiRigaTableProdotti(valori){

    var tr = document.createElement("tr");

    var tableLowQuantityProducts = document.getElementById("tableProdottiConStockBasso");
    var headerFieldList = tableLowQuantityProducts.tHead.getElementsByTagName("th");

    for(var i = 0; i < headerFieldList.length; i++){
        var fieldName = headerFieldList[i].getAttribute("data-index");
        var td = document.createElement("td");

        if(fieldName){
            if(valori[fieldName]){
                td.innerHTML =valori[fieldName];
            }
        }
        tr.appendChild(td);
    }

    tableLowQuantityProducts.tBodies[0].insertBefore(tr, tableLowQuantityProducts.tBodies[0].firstElementChild);
}

function caricaProdottiConBassoStock(){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var listaProdotti = JSON.parse(httpReq.responseText);
                for(var i=listaProdotti.length; i > 0; i--){
                    if(listaProdotti[i-1]["UNITS_IN_STOCK"] < 10){
                        aggiungiRigaTableProdotti(listaProdotti[i-1]);
                    }
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

function contaOrdiniTotali(){

    var httpReq = new XMLHttpRequest();

    httpReq.onreadystatechange = function(){
        if(httpReq.readyState === 4){
            if(httpReq.status === 200){
                var listaOrdini = JSON.parse(httpReq.responseText);
                var totalOrders = listaOrdini.length;
                document.getElementById("totalOrdersData").innerHTML = totalOrders;
                console.info("Conteggio degli ordini avvenuto con successo");
            } else{
                console.error(httpReq.responseText);
                alert("Errore durante il conteggio degli ordini");
            }
        }
    }

    httpReq.open("GET","json/ordini.json");
    httpReq.send();
}