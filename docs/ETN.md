# Electronic Traineeship Notebook
This is the Electronic Traineeship Notebook of Nicolas Vannieuwkerke for his traineeship at Centrum Medical Genetics. 

## Content table
For the content table, use the upper left menu icon next to the amount of lines in this document at the top of the page.

## Introduction
For my traineeship I was tasked with creating a visualization of the genetic variants in the context of human disease on the genomic scale. After some reading we decided that a circos plot is the best way to visualize these variants. A circos plot is a circular visualization of the genome that is highly adaptable. 

In this notebook I will explain step by step how I made the visualization possible using JavaScript and the D3 library. 

## HTML
The HTML code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" href="data:;base64,iVBORw0KGgo="> <!--This code is necessary to fix a warning for GET-->
    <script src="frontend/libraries/jquery.v3.3.1.min.js"></script> <!--Creating a link to the JQuery library-->
    <script src="frontend/libraries/d3.v4.min.js"></script> <!--Creating a link to the D3 library-->
    <script src="frontend/libraries/jqueryUI.v1.12.1..min.js"></script>
    <link rel="stylesheet" type="text/css" href="frontend/css/circosStyles.css"> <!--Creating a link to the circos styles-->
    <link rel="stylesheet" type="text/css" href="frontend/css/uiStyles.css"> <!--Creating a link to the UI styles-->
</head>
<body>
    <script src="frontend/js/functions.js"></script> <!--Creating a link to the functions-->
    <script src="frontend/js/circos.js"></script> <!--Creating a link to the circos script-->
    <script src="frontend/js/webPage.js"></script> <!--Creating a link to the webPage script-->
    <script src="frontend/js/submitActions.js"></script> <!--Creating a link to the webPage script-->
    <script src="frontend/js/circosEvents.js"></script> <!--Creating a link to the events-->
    <script src="frontend/js/variables.js"></script> <!--Creating a link to the variables-->
    <script src="frontend/js/UIfunction.js"></script> <!--Creating a link to the userInterface script-->
</body>
</html>
```

The [index.html](../frontend/index.html) file contains all links to the scripts (JavaScript and CSS). This file can be seen as the hub where everything comes together to form the final visualization.

## CSS
The CSS code used will be displayed together with the relevant parts of the code for clarification. The CSS scripts used are [circosStyles.css](../frontend/css/circosStyles.css) for the styles used in the circos plot and [uiStyles.css](../frontend/css/uiStyles.css) for the styles used in the user interface.

The main CSS styles for the whole webpage are:

```css
body {
    font-family: Arial, Helvetica, sans-serif;
    color: rgb(92, 92, 92);
}
```

## User Interface (JavaScript (JQuery and D3))
The user interface is used to interact with the visualization on three different levels: the disease, the chromosomes and the tracks.

The UI structure was created using a simple `<div>` element and some CSS styles:

```javascript
var UI = d3.select("body").append("div").attr("class","UI")
```

```css
/*Global UI*/
.UI{ 
    width: 350px;
    display: inline-block;
    vertical-align: top;
    margin: 10px;
    margin-bottom: 0px;
    margin-right: 0px;
    border: 1px solid steelblue;
    border-radius: 5px;
    padding: 8px;
    padding-top: 2px;
    background-color: whitesmoke;
}

/*Paragraph*/
.UI p{ 
    margin-top: 5px;
    margin-bottom: 5px;
    border-bottom: 2px solid lightgray;
    padding: 0;
}
```

At every part of the UI, an info button will be available with extra information. For the way the pop-up is made, click [here](#Tooltip) The styles for the info buttons are:

```css
.infoCircle{ 
    float: right;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: lightgray;
    text-align: center;
    font-weight: bold;
    padding: 0;
    border: none;
    color: gray;
    cursor: pointer;
}

.infoCircle:hover{
    background-color: gray;
    color: lightgray;
    transition: background-color 0.1s;
}

.infoCircle:not(:hover){
    background-color: lightgray;
    transition: background-color 0.1s;
}
```

### Search bar for selecting diseases
The next code shows how I added the title for the search bar and the search bar itself. This search bar was given it's functionality by calling the [autocomplete()](#autocomplete) function. This function will be called when the requested data is returned from the backend server, since the array containing all search results is part of the requested data.

```javascript
UI.append("p").text("Search for a disease to visualize") //Adding the title of the search bar
    .append("button").attr("class","infoCircle").attr("id","infoSearch").text("i") //Adding the info button

UI.append("form").attr("class","formAutocomplete").attr("autocomplete","off") //Adding the search bar
        .append("div").attr("class","autocomplete").style("width","328px")
        .append("input").attr("id","myInput").attr("type","text").attr("name","diseaseInput").attr("placeholder","Disease")
```

The CSS styles for the search bar are:

```css
.autocomplete {
    position: relative;
    display: block;
    width: 100%;
}

input {
    border: 1px solid transparent;
    background-color: #f1f1f1;
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
}

input[type=text] {
    background-color: rgba(211, 211, 211, 0.842);
    width: 100%;
}

.autocomplete-items {
    position: absolute;
    border: 1px solid #d4d4d4;
    border-bottom: none;
    border-top: none;
    z-index: 99;
    top: 100%;
    left: 0;
    right: 0;
}

.autocomplete-items div {
    padding: 10px;
    cursor: pointer;
    background-color: #fff;
    border-bottom: 1px solid #d4d4d4;
}

.autocomplete-items div:hover {
    background-color: #e9e9e9;
}

.autocomplete-active {
    background-color: steelblue !important;
    color: #ffffff;
}
```

The code that gives functionality to the info button for the search bar is:
```javascript
$("#infoSearch").click(function(){

    //Show the pop-up and remove the previous text
    d3.select("#geneTooltip")
        .style("visibility", "visible")
        .selectAll("p")
        .remove()

    //Adding the text to the pop-up
    textfiller = [
        "Type the disease you want to visualize here.",
        "The bar will automatically give auto-fill suggestions.",
        "This bar access to all disease names in the ClinVar dataset."
    ]
    d3.select("#geneTooltip")
        .style("top", (event.pageY-15)+"px")
        .style("left",(event.pageX+25)+"px")
        .selectAll("p")
        .data(textfiller)
        .enter().append("p")
        .attr("class","staticContent")
        .text(function(d,i){
            return d
        });
})
```

### Selection menu for the chromosomes
The chromosome selection can happen in two different ways, namely the automatic selection and the manual selection. The automatic selection tells the code to only visualize the chromsomes that contain structural variants. The manual selection can be used to select the chromosomes you only want to see. 

```javascript
UI.append("p").text("Select Chromosomes") //Adding the title of the chromosome selection
    .append("button").attr("class","infoCircle").attr("id","infoChromosomes").text("i") //Adding the info button

//Adding the radio buttons for automatic or manual selection
var selectOptions = UI.append("div").attr("id","optionChromosomes") //Adding a div that hold the radio buttons

var automatic = selectOptions.append("input") //Adding the automatic button
                .attr("type","radio")
                .attr("name","options")
                .attr("value","auto")
                .attr("checked",true)
selectOptions.append("label").text("Automatic") //Adding the automatic label

var manual = selectOptions.append("input") //Adding the manual button
                .attr("type","radio")
                .attr("name","options")
                .attr("value","manual")
selectOptions.append("label").text("Manual") //Adding the manual label

//Adding the checkboxes for manual selection
var selectChromosome = UI.append("div").attr("id","chromosomeSelection") //Creating a div that will pop-up when manual selection is chosen
                                            .attr("class","selectionDiv")
                                            .style("display","none")

selectChromosome.append("div").append("input") //Adding the select/deselect all chromosomes checkbox
                                .attr("type","checkbox")
                                .attr("id","checkAllChrs")
                                .attr("name","checkAllChrs")
                                .attr("checked",true)
selectChromosome.select("div").append("label") //Adding the label to the select/deselect all chromosomes checkbox
                                .text("Select/deselect all chromosomes")

var allChrs = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24] //All chromosomes in integer format
checkCount = 0 //Counter that stores the amount of checkboxes added
for(i in allChrs){ //Loop over all chromosomes
    chromosome = allChrs[i]
    //Start a new row if 8 checkboxes have been added to the current row
    if(checkCount%8==0){
        tablerow = selectChromosome.append("tr")
    }

    tabledata = tablerow.append("td") //Add a column for the current chromosome
    tabledata.append("input") //Adding the checkbox for the current chromosome
                    .attr("type","checkbox")
                    .attr("id","checkChr"+chromosome)
                    .attr("name","checkChr")
                    .attr("checked",true)

    tabledata.append("label") //Adding the label for the current chromosome
                    .text(chrToString(chromosome))

    checkCount++ //Increase the count of the checkboxes
}
```

The CSS styles used for the chromosome selection are:
```css
.selectionDiv { 
    border: solid 1px steelblue;
    border-radius: 5px;
    margin-top: 5px;
    margin-bottom: 5px;
}
```

The code that gives functionality to the info button of the chromosomes is:

```javascript
$("#infoChromosomes").click(function(){
    //Show the pop-up and remove the previous text
    d3.select("#geneTooltip")
        .style("visibility", "visible")
        .selectAll("p")
        .remove()

    //Adding the text to the pop-up
    textfiller = [
        "Select the chromosomes you want to visualize",
        "Automatic = the visualization will automatically",
        "search for all chromosomes linked to the current",
        "disease and only show these chromosomes.",
        "Manual = select manually which chromosomes you",
        "want to visualize."
    ]
    d3.select("#geneTooltip")
        .style("top", (event.pageY-15)+"px")
        .style("left",(event.pageX+25)+"px")
        .selectAll("p")
        .data(textfiller)
        .enter().append("p")
        .attr("class","staticContent")
        .text(function(d,i){
            return d
        });
})
```

### Selection menu for the tracks
This menu contains the possibility to select which tracks can be shown and some tracks can even be dragged in a different order to change the order in which the tracks are shown. 

```javascript
UI.append("p").text("Select Tracks") //Add the title to the track selector
    .append("button").attr("class","infoCircle").attr("id","infoTracks").text("i") //Add the info button to the track selector

var allTracks = ["Giemsa Stains","CNV Analysis","Big Structural Variants","Small Structural Variants","Translocations"] //An array holding all tracks

var selectTrack = UI.append("div").attr("id","tracksSelection").attr("class","selectionDiv") //A div housing all track selection
selectTrack.append("p").text("Rearrange the order of the tracks") //Add the title to the sortable tracks

var selectTrackUL = selectTrack.append("ul").attr("id","tracksSorter") //Add the unordered list element storing the sortable tracks

for(i in allTracks){ //Loop over all tracks

    track = allTracks[i]
    if(track != "Translocations"){ //Check if the track isn't the translocation track

        selectTrackList = selectTrackUL.append("li") //Add a list element to the unordered list
    
        selectTrackList.append("input") //Add the checkbox for the track
                        .attr("type","checkbox")
                        .attr("class","checkTrack")
                        .attr("id","checkTrack"+track.replace(/ /g,''))
                        .attr("name",track)
                        .attr("value",track)
                        .property("checked",true)
    
        selectTrackList.append("text") //Add the track label
                        .text(track)
    } 
    else { //If the track is translocations

        translocationDiv = d3.select("#tracksSelection").append("div").attr("id","translocationSelection") //Add a div holding the translocations checkbox

        translocationDiv.append("input") //Add the checkbox for the translocations
                                    .attr("type","checkbox")
                                    .attr("class","checkTrack")
                                    .attr("id","checkTrack"+track.replace(/ /g,''))
                                    .attr("name",track)
                                    .attr("value",track)
                                    .property("checked",true)

        translocationDiv.append("label") //Add the translocation label
                                    .text(track)
    }
}
```

The CSS styles for the tracks selector are:

```css
/*Global sorting of the tracks*/
#tracksSorter { 
    list-style-type: none; 
    margin: 0.1em; 
    padding: 0; 
}

/*Seperate list for sorting the tracks*/
.ui-sortable-handle { 
    border: 1px solid steelblue;
    border-radius: 5px;
    width: auto;
    margin: 0.25em;
    background-color: rgba(230, 230, 230, 0.849);
    cursor: all-scroll;
}

.ui-sortable-handle:hover{
    background-color: lightgray;
    transition: background-color 0.1s;
}

.ui-sortable-handle:not(:hover){
    background-color: rgba(230, 230, 230, 0.849);
    transition: background-color 0.1s;
}

/*Selection for translocations*/
#translocationSelection{ 
    margin: 0.45em;
    border-top: 2px solid lightgray;
    padding-top: 0.2em;
}

/*Paragraphs in the track selector*/
#tracksSelection p { 
    margin: 0.5em;
}
```

The functionality for the info button for the track selector is coded like this:

```javascript
$("#infoTracks").click(function(){
    //Show the pop-up and remove the previous text
    d3.select("#geneTooltip")
        .style("visibility", "visible")
        .selectAll("p")
        .remove()

    //Adding the text to the pop-up
    textfiller = [
        "Select which tracks you would like to visualize",
        "on the circos plot.",
        "Some tracks can be dragged and dropped into a different",
        "order. This will change the order in which the tracks are",
        "visualized. The top track will be shown as the outer track",
        "and the bottom track will be shown as the inner track.",
        "",
        "Giemsa Stains:",
        "Shows the giemsa stains of all selected chromosomes.",
        "CNV Analysis:",
        "Shows the copy number variations of all selected chromsomes",
        "Big Structural Variants:",
        "Shows the structural variants bigger than 1 million bps",
        "Small Structural Variants:",
        "Shows a heatmap visualization of the density of structural",
        "variants between 50 bps and 1 million bps in a range of 5 million bps",
        "Translocations:",
        "Shows the translocation of the selected chromosomes"
    ]
    d3.select("#geneTooltip")
        .style("top", (event.pageY-15)+"px")
        .style("left",(event.pageX+25)+"px")
        .selectAll("p")
        .data(textfiller)
        .enter().append("p")
        .attr("class","staticContent")
        .text(function(d,i){
            return d
        });
})
```

Whenever a track is selected or deselected, the visualization automatically updates with the newly requested tracks. This executes the [warningOrCircos()](#warningOrCircos) function to create the new visualization. The `lastSubmitted` object contains all data from the last visualization created.

```javascript
$('.checkTrack').on('change', function() {

    //Create the circos or warning message
    warningOrCircos(lastSubmitted.data, lastSubmitted.trackOrder) 
})
```

Whenever the order of the tracks is changed, the visualization automatically updated too. The trackorder is defined and parsed to [warningOrCircos()](#warningOrCircos) with the last submitted data.

```javascript
$("#tracksSorter li").on("mouseup",function(){
    //Set a delay of 1 millisecond for the HTML to settle
    setTimeout(function(){ 

        //Determine which tracks should be made
        lastSubmitted.trackOrder= Array.from(document.querySelector('#tracksSorter').children, ({textContent}) => textContent);
        lastSubmitted.trackOrder.push("Translocations")

        //Create the circos or warning message
        warningOrCircos(lastSubmitted.data, lastSubmitted.trackOrder)         
    }, 1);
})
```

### Submit button
The last part of the `<div>` element encasing the UI is the submit button. When this button is clicked, a new request will be sent to the server, which will send the requested data back for the visualization. Again, the [warningOrCircos()](#warningOrCircos) function will be executed to create the plot after the necessary data is extracted from the page. The `backendUrl` tells the script where the backend is located. More information about this in the [docker](#setting-up-the-docker-containers) chapter

```javascript
//Defining the Url of the server script
const backendUrl="http://localhost:5487/index.js"

//When the submit button is pressed...
$("#submitPhen").click(function(){

    //Read the search bar for which disease is asked for and store it in the lastSubmitted object
    var disease = d3.select("#myInput").property("value")
    lastSubmitted.disease = disease

    //Determine the chromosome selection mode
    var chrOption = d3.select("input[name=options]:checked").property("value")
    var requestedChr
    if(chrOption == "manual"){ //Assign the selected chromosomes if the selection mode is "manual"
        requestedChr = []
        for(i in allChrs){
            chromosome = allChrs[i]
            checkboxChr = d3.select("#checkChr"+chromosome).property("checked")
            if(checkboxChr == true){
                requestedChr.push(chromosome)
            }
        }
    } else {
        requestedChr = chrOption //Assign auto if the selection mode is "automatic"
    }
    lastSubmitted.requestedChr = requestedChr //Add the requested chromosomes to the lastSubmitted object

    //Send the request to the backend server
    $.post(backendUrl,
        {
            phenotype: disease,
            chrRequest: requestedChr,
        },
        function(data){
            //Create the circos or warning message
            warningOrCircos(data, lastSubmitted.trackOrder) 

            //Update the manual chromosome selection dependent on the data
            deselect = false //Stating a variable if the select/deselect all chromosome checkbox should be selected or not
            for(i in allChrs){ //Loop over all chromosomes
                chr = allChrs[i]
                if(data.chrToKeep.includes(chr)){ //If the current chromosome is in the returned data, check the box of this chromosome
                    d3.select("#checkChr"+chr).property("checked",true)
                }else{ //If the current chromosome isn't in the returned data, uncheck the box of this chromosome
                    d3.select("#checkChr"+chr).property("checked",false)
                    deselect = true //Set the deselect to true
                }
            }
            if(deselect){ //If deselect is true, uncheck the select/deselect all chromosomes checkbox
                d3.select("#checkAllChrs").property("checked",false)
            }else{ //If deselect is false, check the select/deselect all chromosomes checkbox
                d3.select("#checkAllChrs").property("checked",true)
            }

            //Add the data to the lastSubmitted object
            lastSubmitted.data = data
        }
    );
})
```

The CSS styles are for the submit button are: 

```css
.submitPhen {
    border: solid 1px steelblue;
    background-color: steelblue;
    color: white;
    display: inline-block;
    padding: 0.5em 1em 0.5em 1em;
    border-radius: 5px;
    cursor: pointer;
}

.submitPhen:hover{
    background-color: whitesmoke;
    color: steelblue;
    transition: background-color 0.4s;
}

.submitPhen:not(:hover){
    background-color: steelblue;
    transition: background-color 0.4s;
}
```

### Circos frame
The frame that contains the circos visualization is also a simple div element with an `<svg>` element.

```javascript
d3.select("body")
    .append("div").attr("class","circosBorder")
    .append("svg").attr("width","800").attr("height","800").attr("class","circosSVG")
```

The CSS styles for the circos frame are:
```css
.circosBorder{
    border: solid 1px steelblue;
    fill: none;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    padding: 0;
    margin: 10px;
}
```

When the page is loaded, a default request will be sent to the backend server. The data sent back from this request will be used to create a visualization of the human genome when no disease is selected. The [warningOrCircos()](#warningOrCircos) function will be used to create the default plot and the [autocomplete()](#autocomplete) function will be used to create the functionality of the search bar.

```javascript
//Defining the Url of the server script
const backendUrl="http://127.0.0.1:8080/databaseConnection.js"

//Initial request on page load
var lastSubmitted = {} //An object holding the last submitted data
lastSubmitted.requestedChr = "auto"
lastSubmitted.disease = ""
lastSubmitted.trackOrder = allTracks

$.post(backendUrl,
	{
        phenotype: "",
        chrRequest: allChrs,
	},
	function(data){

        //Define the angles of the selected chromosomes     
        pieChrSizes = pie(data.chrSizes)

        //Make the circos plot using the data that has been sent back
        makeCircos(data.translocations,pieChrSizes,data.chrStains,data.bigSVs,data.smallSVs,data.CNVData,data.chrToKeep,allTracks)

        //Apply the functionality to the autocomplete search bar
        autocomplete(d3.select("#myInput"), data.phenotypes)

        //Add the data to the lastSubmitted object
        lastSubmitted.data = data
});
```

### Tooltip
The tooltip is used in a lot of different places: the pop-up after pressing the info button, the hover pop-up in the circos plot and the gene lists in the circos plot. The tooltip is created at the start of the script and called upon when a pop-up should be created. Two kinds of tooltips are created, the moveable tooltip and the static tooltip. The static tooltip contains a cross so it can be closed.

```javascript
///Create a moveable tooltip
d3.select("body")
    .append("div")
    .attr("class","tooltip")
    .attr("id","hoverTooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");

///Create a static tooltip
d3.select("body")
    .append("div")
    .attr("class","tooltip")
    .attr("id","geneTooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    //Adding the rectangle for the cross
    .append("svg")
    .attr("class","closingCross")
    .attr("width","12")
    .attr("height","12")
    .append("rect")
    .attr("width",d3.select(".closingCross").attr("width"))
    .attr("height",d3.select(".closingCross").attr("height"))
    .on("mouseover",function(){
        crossOver()
    })
    .on("mouseout",function(){
        crossOut()
    })

//Stating some variables
var crossLarge = d3.select(".closingCross").attr("width")-2 //Variable for the highest x or y pos
var crossSmall = 2 //Variable for the lowest x or y pos

var crossPoints = [
    {"x1":crossSmall,"y1":crossSmall,"x2":crossLarge,"y2":crossLarge},
    {"x1":crossSmall,"y1":crossLarge,"x2":crossLarge,"y2":crossSmall}
]; //Array that stores the x and y positions for the cross

//Adding the cross to close the pop-up
d3.select(".closingCross")
    .selectAll(".cross")
    .data(crossPoints)
    .enter().append("line")
    .attr("class","cross")
    .attr("x1",function(d){return d.x1})
    .attr("y1",function(d){return d.y1})
    .attr("x2",function(d){return d.x2})
    .attr("y2",function(d){return d.y2})
    .on("mouseover",function(){
        crossOver()
    })
    .on("mouseout",function(){
        crossOut()
    });
```

When clicking on the cross, the pop-up will close.

```javascript
$(".closingCross").click(function(){

    //Hide the static tooltip
    d3.select("#geneTooltip")
        .style("visibility", "hidden");
})
```

The [crossOver()](#crossOver) and [crossOut()](#crossOut) functions are used to change the styles of the cross when hovering over it.

The CSS styles for the tooltips are:

```css
/*Tooltip*/
.tooltip {
    font-size: 12px;
    border: 1.5px solid steelblue;
    background-color: whitesmoke;
    padding: 2px;
    border-radius: 5px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
}

.tooltip p {
    margin: 4px;
    display: flex;
}

/*Cross for the static tooltip*/
.closingCross {
    float: right;
    fill: lightgray;
    border-radius: 2px;
    opacity: 0.5;
}

.cross {
    stroke: black;
}

/*Content of the static tooltip*/
.staticContent {
    display: flex;
}
```

## Backend (JavaScript (Node.js))
The backend part of the JavaScript code is responsible for listening to the request of the frontend scripts, retrieving and filtering the data from the database and sending the data back to the frontend. This part runs on Node.js, so to run the backend, following command should be executed on the command line:

```bash
node backend/index.js 
```

### Setting up a webserver
Using the `http` module in Node.js, it is possible to create a webserver by running the script. Following code is used to create the webserver, parse the request and state a response. This code allows everyone to access the server! It is important to change the `Access-Control-Allow-Origin` parameter in the head of the response to the requred IP-address.

```javascript
//Loading modules and defining connection urls
const http = require('http'); //Loading the HTTP module
const qs = require('querystring'); //Loading the QueryString module

//Creating a webserver, which will be called upon by the frontend
http.createServer((request, response) => {
    const { headers, method, url } = request;
    let parameters = []

    //Stating some variables
    let parameters = [] //The array that will store all request parameters
    let responseData = {}; //The object that will store all response data
    let chrToKeep = []; //The array that will store all chromosomes that should be displayed
    
    //Reading the post parameters and parsing them into an easy to use format
    let body = '';
    
    request.on('error', (err) => { //Showing the error, if there are any
        console.error(err);
    }).on('data', function(data){ //Extracting the post data
        body += data
    }).on('end', () => { //Parsing the post data
        parameters = qs.parse(body);
    });

    //Showing response errors, if there are any
    response.on('error', (err) => {
        console.error(err);
    });

    //Defining the head of the response
    response.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' //This gives all sites access to the server!!!
    });

    /////////////////////////////////////////////////////////////////////
    //Here is the code responsible for getting the data from the database
    /////////////////////////////////////////////////////////////////////

    ///Waiting for all data to be fetched before sending the data to the frontend
    (async() => {
        while(
            responseData.chrSizes == undefined ||
            responseData.chrStains == undefined ||
            responseData.CNVData == undefined || 
            responseData.phenotypes == undefined
            )
            await new Promise(resolve => setTimeout(resolve, 5));
    })().then(() => {
        responseData.chrToKeep = chrToKeep //Add the chromosomes to the response data
        response.write(JSON.stringify(responseData)) //Write a response in json format
        response.end() //End the response
    })  

}).listen(8080); //Activates this server, listening on port 8080
```

The request from the frontend contains some POST data which specifies the data needed for the visualization. This POST data consists of an array of parameters. This array will be used to query the database.

### Querying the database
A MongoDB database was used to store and retrieve all data for the visualization.

#### The data
The database contains 5 collections of data:

1. The locations of the Giemsa stains in the genome
This collection is called `stains` and contains all locations of the Giemsa stains per chromosome. This collection is also used to determine the size of each chromosome. The command used to import this dataset into the database is:

```bash
mongoimport --host=mongodb --db=circosData --collection=stains --type=json --file=/seed/stains.json
```

2. Big structural variants (>= 1 million bp) & translocations
This collection was derived from Clinvar, which was downloaded from [ClinVar](https://ftp.ncbi.nlm.nih.gov/pub/clinvar/). The .tsv file was used, since this is easier to parse than a VCF file. To parse this dataset and make it more compatible for MongoDB, I used a python script called [parseClinVar.py](../parseScripts/parseClinVar.py) to transform the .tsv file to a .json file. The command used to import this dataset into the database is:

```bash
mongoimport --host=mongodb --db=circosData --collection=bigSVs --type=json --jsonArray --file=/seed/bigSVandTranslocations.json
```

3. The copy number variations of the chromosomes
Since the original CNV data is considered confidential, I created a [script](../parseScripts/createRandomCNV.py) that generates a random CNV dataset. This script uses the stain positions as ranges for the copy number variations to keep it simple. The command used to import this dataset into the database is:

```bash
mongoimport --host=mongodb --db=circosData --collection=cnvdata --type=tsv --headerline --file=/seed/customCNV.tsv
```

4. The density of smaller (<1 million bp) structural variants per 5 million bps
This data was derived from the clinvar dataset using [densityClinvar.py](../parsScripts/densityClinvar.py). The densities are sorted per phenotype. The command used to import this dataset into the database is:

```bash
mongoimport --host=mongodb --db=circosData --collection=smallSVs --type=json --jsonArray --file=/seed/densitySmallSV.json
```

5. The names of all phenotypes 
This collection was also derived from clinvar using [allPhenotypes.py](../parseScripts/allPhenotypes.py). The command used to import this dataset into the database is:

```bash
mongoimport --host=mongodb --db=circosData --collection=phenotypes --type=json --jsonArray --file=/seed/allPhenotypes.json
```

#### Fetching the desired data
For each collection, a different connection will be made. This is to make sure no premature closing of the connection will happen, which would cause some data not being fetched.  The `dbUrl` tells the script where the database is located. More information about this in the [docker](#setting-up-the-docker-containers) chapter

The basic code for fetching data from the database is always the same:

```javascript
//These variables should be declared at the start of the script, before the webserver is made
const mongo = require('mongodb'); //Loading the MongoDB module
const MongoClient = mongo.MongoClient; //Defining the MongoClient
const dbUrl = 'mongodb://mongodb:27017'; //Defining the URL of the Mongo server
const dbName = 'circosData' //Stating the name of the database

//Making the connection with the Mongo server from the URL for a collection called 'collectionName'
MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    //If there is an error, throw it
    if (err) throw err;

    //Selecting the database and collection
    const db = client.db(dbName).collection('collectionName');

    //Generating the query for the find function
    var query = {};

    //Fetch the data using the query
    db.find(query).toArray().then((docs) => {   
        //Do something with the data here
    }).catch((err) => { //Show the error
        console.log(err);
    }).finally(() => { //Close the connection with the MongoDB client
        client.close();
    }); 
});
```

This code opens the connection to the MongoDB server specified by the URL. After stating the database and collection, the find query is defined. With this query, the desired data will be fetched from the collection specified earlier. When the data is fetched and parsed, the connection with the MongoClient will be closed.

##### Big structural variants
Following code extracts all data requested and parses it to an easy to read format for the visualization. The translocations are stored in `responseData.translocations` and the big structural variants are stored in `responseData.bigSVs`. While getting this data, the `chrToKeep` array is defined, according to the method of selection that was used. If the manual selection was chosen the [defineChrSelection()](#defineChrSelection) function will be executed. If automatic selection is requested, the script will use [checkToKeep()](#checkToKeep) to add the chromosome to `chrToKeep`. If there is no phenotype requested, the script will send back all chromosomes. If there is a phenotype requested, the script will only send the chromosomes that apply to these variants back.


```javascript
//Making the connection with the Mongo server for the big structural variants and translocation collection
MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    //If there is an error, throw it
    if (err) throw err;

    //If there is no phenotype selected, there shouldn't be any structural variants in the response        
    if(parameters.phenotype == ''){
        //Add the requested data to the object, which will be the response to the frontend
        responseData.translocations = [] 
        responseData.bigSVs = []
        if(parameters.chrRequest == "auto"){
            chrToKeep = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
        }
        else{
            defineChrSelection()
        }
    }
    
    //If there is a phenotype selected, the structural variants belonging to this phenotype should be added to the response
    else{

        //Define which selection type is used for the selection of chromosomes and act accordingly
        defineChrSelection()

        //Selecting the collection
        const db = client.db(dbName).collection('bigSVs');

        ///Fetching the big structural variants
        db.aggregate([
            {$match:{
                "phenotypeList":{$in:[parameters.phenotype]}, //Only data of the current phenotype should be returned
                "type":{$nin:["Translocation"]} //The data cannot be a translocation
            }},
            {$project:{
                length:{$subtract:[{$toInt:"$stop"},{$toInt:"$start"}]}, //Determine the length of the SVs
                phenotypeList:1, 
                type:1,
                geneSymbol:1,
                chromosome:1,
                start:1,
                stop:1
            }},
            {$sort:{length:-1}} //Sort the data by length, biggest SV first
        ]).toArray().then((docs) => {
            var bigSVs = [] //An array that will store the parsed data

            //If the request for chromosomes is to determine them automatically...
            if(parameters.chrRequest == "auto"){
                docs.forEach(sv => { //Loop over all data
                    chr = chrToInt(sv.chromosome) //Define the chromosome               
                    if(bigSVs[chr] == undefined){ //If there are no big SVs for this chromosome, define the array for this chromosome
                        bigSVs[chr] = [];
                    }
                    bigSVs[chr].push(sv) //Add the data to the array
                    checkToKeep(chr) //Check if the current chromosome is already part of chrToKeep, otherwise add it to chrToKeep
                });
            }
            
            //If the request for chromosome is manually defined...
            else{
                docs.forEach(sv => { //Loop over all data
                    chr = chrToInt(sv.chromosome) //Define the chromosome
                    if(chrToKeep.includes(chr)){ //If the chromosome is part of chrToKeep...           
                        if(bigSVs[chr] == undefined){ //If there are no big SVs for this chromosome, define the array for this chromosome
                            bigSVs[chr] = [];
                        }
                        bigSVs[chr].push(sv) //Add the data to the array
                    }
                });
            }

            responseData.bigSVs = bigSVs //Add the requested data to the object, which will be the response to the frontend
        }).catch((err) => { //Show the error
            console.log(err);
        })

        ///Fetching the translocations
        db.find({
            "type":"Translocation", //The type needs to be a translocation
            "phenotypeList":{$in:[parameters.phenotype]} //Only return data from the current phenotype
        }).toArray().then((docs) => {

            var tempTranslocations = {} //Define the object that will temporarily store the translocations
            var translocationData = [] //Define the array that will store the parsed data

            docs.forEach(translocationpos => { //Loop over all data

                //If the selection option of the chromosomes is automatic...
                if(parameters.chrRequest == "auto"){
                    addTranslocations(translocationpos) //Add the position to the temp object
                    checkToKeep(translocationpos.chromosome) //Check if the current chromosome is already in chrToKeep, if not add it
                } 
                //If the selection option of the chromosomes is manual...
                else{
                    if(chrToKeep.includes(chrToInt(translocationpos.chromosome))){ //Check if the chromosome is part of chrToKeep
                        addTranslocations(translocationpos) //Add the position to the temp object
                    }
                }  
            })

            //Define a function that will add the translocations to the temp object
            function addTranslocations(translocationpos){
                key = translocationpos.alleleID.toString() //Define the alleleID as key
                if(tempTranslocations[key] == undefined){ //If there are no positions found for this alleleID, create an array in the temp object
                    tempTranslocations[key] = []
                    tempTranslocations[key].push(translocationpos) //Add the first position of the current alleleID
                }
                else{ //If the first position is already found, add the second one to the temp object
                    tempTranslocations[key].push(translocationpos)
                }
            }

            //Loop over all translocation pairs in the temp object
            for (var property in tempTranslocations) {
                //If the current alleleID contains a pair of positions, add it to the resulting array
                if(tempTranslocations[property].length == 2){
                    translocationData.push(tempTranslocations[property])
                }
            }

            responseData.translocations = translocationData //Add the requested data to the object, which will be the response to the frontend
        }).catch((err) => { //Show the error
            console.log(err);
        })    
    }
})
```

##### Densities of the small structural variants
This code extracts the data of the requested phenotype from the database. While getting this data, the `chrToKeep` array is defined, according to the method of selection that was used. If the manual selection was chosen the [defineChrSelection()](#defineChrSelection) function will be executed. If automatic selection is requested, the script will use [checkToKeep()](#checkToKeep) to add the chromosome to `chrToKeep`. If there is no phenotype requested, the script will send back all chromosomes. If there is a phenotype requested, the script will only send the chromosomes that apply to these variants back.

```javascript
//Making the connection with the Mongo server from the URL for the density of small SVs dataset
MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    //If there is an error, throw it
    if (err) throw err;

    //If no phenotype is selected...
    if(parameters.phenotype == ''){
        //Add the requested data to the object, which will be the response to the frontend
        responseData.smallSVs = []
        if(parameters.chrRequest == "auto"){
            chrToKeep = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
        }
        else{
            defineChrSelection()
        }
    }

    //If a phenotype is selected...
    else{

        //Define which selection type is used for the selection of chromosomes and act accordingly
        defineChrSelection()

        //Selecting the collection
        const db = client.db(dbName).collection('smallSVs');

        //Defining the query
        var querySmallSV = {}
        querySmallSV[parameters.phenotype] = {$exists:1} //Check for data where the current phenotype belongs to

        //Fetch the data using the query
        db.find(querySmallSV).toArray().then((docs) => {

            smallSVData = [] //Define the array that will store the data

            docs.forEach(obj => { //Loop over all data
                if(obj != undefined){ //Check if there is data
                    Object.keys(obj[parameters.phenotype]).forEach(chr => { //Loop over the data per chromosome
                        if(parameters.chrRequest == "auto"){ //If chromosome selection happens automatically...
                            checkToKeep(chr) //Check if the chromosome already is in chrToKeep
                            smallSVData[chrToInt(chr)] = obj[parameters.phenotype][chr] //Add the data to the result array
                        }
                        else{ //If chromosome selection happens manually...
                            if(chrToKeep.includes(chrToInt(chr))){ //If the chromosome is part of chrToKeep, add the data to the result array
                                smallSVData[chrToInt(chr)] = obj[parameters.phenotype][chr]
                            }
                        }
                    })
                }
            })
            
            responseData.smallSVs = smallSVData //Add the requested data to the object, which will be the response to the frontend
        }).catch((err) => { //Show the error
            console.log(err);
        }).finally(() => { //Close the connection with the server
            client.close();
        })
    }  
})
```

##### The sizes of the requested chromosomes and the positions of the stains
The sizes and stains of the chromosomes in the array `chrToKeep` were fetched from the database. The chromosome sizes were stored in `responseData.chrSizes` and the stains were stored in `responseData.chrStains`. An `async()` function was used to tell the script to wait until the `chrToKeep` array was fully defined. At the start of the fetching of this data, `chrToKeep` was sorted using [sortChrToKeep()](#sortChrToKeep).

```javascript
//Making the connection with the Mongo server for the stains collection
MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    //If there is an error, throw it
    if (err) throw err;

    //Wait for chrToKeep to be fully defined (through the structural variants)
    (async() => {
        while(responseData.translocations == undefined ||
            responseData.bigSVs == undefined ||
            responseData.smallSVs == undefined    
            )
            await new Promise(resolve => setTimeout(resolve, 5))
    })().then(() => {

        //Sort chrToKeep
        sortChrToKeep()

        //Selecting the collection
        const db = client.db(dbName).collection('stains')

        //Fetching the chrSizes,pieChrSizes and stains
        db.find({
            //Return all data
        }).toArray().then((docs) => {

            var chrStains = [] //State the array that will hold the positions of the stains
            var chrSizes = [] //State the array that will hold the sizes of all chromosomes

            for(i in chrToKeep){ //Loop over all selected chromosomes
                chrInt = chrToKeep[i] //Define the chromosome as integer
                chrString = chrToString(chrToKeep[i]) //Define the chromosome as string
                var chrSize = 0 //State a variable that will store the chromosome size
                chrStains[chrInt] = [] //State the array for for the current chromosome in chrStains
                docs[0].cytoBandIdeo["chr" + chrString].forEach(band => { //Loop over all stains of the current chromosome
                    var size = band.chromEnd - band.chromStart //Determine the size of the stain
                    chrSize += size //Add the stain size to the total chromosome size
                    chrStains[chrInt].push({"chrom":chrString,"start":band.chromStart,"end":band.chromEnd, "type":band.gieStain, "name":band.name}) //Add the stain the result array
                })
                chrSizes.push({"chrom":chrString,"size":chrSize}) //Add the chromsome size to chrSizes
            }

            //Add the requested data to the object, which will be the response to the frontend
            responseData.chrSizes = chrSizes
            responseData.chrStains = chrStains
        }).catch((err) => { //Show the error
            console.log(err)
        }).finally(() => { //Close the connection with the server
            client.close()
        })
    })     
})
```

##### Copy number variation of the genome
The copy number variation data from the requested chromosomes will be stored inside `responseData.CNVData`. Similarly to the defining of the sizes and stains of the chromosomes, an `async()` function was used to tell the script to wait until `chrToKeep` was fully defined. At the start of the fetching of this data, `chrToKeep` was sorted using [sortChrToKeep()](#sortChrToKeep).

```javascript
//Making the connection with the Mongo server from the URL for the cnv dataset
MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    //If there is an error, throw it
    if (err) throw err;

    //Wait for chrToKeep to be fully defined
    (async() => {
        while(responseData.translocations == undefined ||
            responseData.bigSVs == undefined ||
            responseData.smallSVs == undefined 
            )
            await new Promise(resolve => setTimeout(resolve, 5))
    })().then(() => {

        //Sort chrToKeep
        sortChrToKeep()

        //Selecting the collection
        const db = client.db(dbName).collection('cnvdata');
        
        //Fetch the cnv data
        db.find({
            "c":{$in:chrToKeep} //Only return the cnv of the selected chromosomes
        }).sort({
            "cs":1 //Sort the data according to the start position on the chromosome
        }).toArray().then((docs) => {

            //Parse the data and make it compatible for the visualization
            var CNVData = [] //Define the array that will store the parsed results
            docs.forEach(coveragePoint => { //Loop over all data
                var chr = coveragePoint.c //Define the chromosome
                if(CNVData[chr] == undefined){ //If the current chromosome isn't part of the result array, state it
                    CNVData[chr] = []
                }
                CNVData[chr].push({"chrom":chr,"start":coveragePoint.cs,"end":coveragePoint.ce,"r":coveragePoint.r}) //Add the current data
            })

            responseData.CNVData = CNVData //Add the requested data to the object, which will be the response to the frontend
        }).catch((err) => { //Show the error
            console.log(err)
        }).finally(() => { //Close the connection with the server
            client.close()
        })
    })
})
```

##### All phenotypes
For the search bar in the user interface, all phenotypes need to be fetched from the database.

```javascript
//Making the connection with the Mongo server from the URL for the phenotypes dataset
MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    //If there is an error, throw it
    if (err) throw err;

    //Selecting the collection
    const db = client.db(dbName).collection('phenotypes');

    //Fetch the data using the query
    db.find({
        //Return all data
    }).toArray().then((docs) => {
        responseData.phenotypes = docs[0].phenotypes.sort((a,b) => a.length - b.length) //Add all data, sorted by length
    }).catch((err) => { //Show the error
        console.log(err)
    }).finally(() => { //Close the connection with the server
        client.close()
    })
});
```

## Circos (JavaScript (D3))
This chapter will give an in-depth explanation on how the [makeCircos()](#makeCircos) function works.

### Defining some main variables
The following variables are used in more than 1 place in the code of the visualization.

```javascript
///Defining and stating some basic variables
var svg = d3.select("body").append("svg").attr("width",800).attr("height",800).attr("class","circosSVG"), //The svg element that houses the circos plot
    width = svg.attr("width"), //The width of the SVG element
    height = svg.attr("height"), //The height of the SVG element
    radiusCircos = Math.min(width,height)/2, //The radius of the Circos plot
    maxCoverage = 0.8, //The maximum coverage
    paddingAngle = 0.01, //The angle between two chromosomes
    chrColors = d3.scaleOrdinal(["#9acd32","#66cdaa","#a9a9a9","#2f4f4f","#0000ff","#00008b","#483d8b","#1e90ff","#00bfff","#00fa9a","#00ff00","#008000","#8b008b","#ff00ff","#ff1493","#dc143c","#db7093","#ee82ee","#bdb76b","#ffff00","#ffa500","#ffa07a","#ff4500","#8b4513"]),
    //The colors of the chromosomes
    radiusChange = 4, //The change of the radius for events
    eventDuration = 100; //The duration of events to complete in milliseconds
```

Explanation of all variables:
- svg = the SVG element that will house the circos plot
- width = the width of the SVG element
- height = the height of the SVG element
- radiusCircos = the radius for the circos plot, calculated from half of the width or height, dependent on which one is the shortest
- marginCoverage = the margin of the highest value of the coverage. This is used to make sure the coverage won't overlap with other bands
- maxCoverage = a value defining the highest coverage
- paddingAngle = the angle between the different bands
- chrColors = the color scheme used for the bands (made on this [site](https://mokole.com/palette.html))
- radiusChange = the increase of the radius when hovering over certain parts of the plot
- eventDuration = the duration of the changes due to events to happen
- gCircos = a group element based at the center of the SVG element, which will be the base for constructing the circos plot on

This function will be used to generate an array which will contain the angles of the input data.

```javascript
//Generating the pie function
var pie = d3.pie().value(function(d){
                            return d.size;
                        })
                    .padAngle(paddingAngle)
                    .sort(null)
```

### makeCircos()
This function is responsible for creating a new circos plot in the circos frame. The first step is to create a `<g>` element which will house the whole circos plot. When this is done, all the other code will be appended to this one group.

```javascript
//Defining the function that creates the circos plot
function makeCircos(translocationData,pieChrSizes,chrStains,bigSVsData,smallSVsData,CNVData,chrToKeep,tracks){

    //Generating a group element for all elements in the circos plot
    var gCircos = svg.append("g")
                    .attr("transform","translate(" + width/2 + "," + height/2 + ")");

    /////////////////////////////////////////////////////////////////////////
    //Code that produces the circos plot
    /////////////////////////////////////////////////////////////////////////

})
```

The code that produces the plot itself is split into two main parts: 
1. The determination of the radii according to the order and content of the tracks
2. Defining the angles and creating the visual elements

### Determination of the radii according the the order and content of the tracks
The [makeCircos()](#makeCircos) function gets the order of the selected tracks as part of its input. The array that stores this information is called `tracks`. To check which track is first, a loop structure is created that loops over the `tracks` array. 

```javascript
var currentRadius = radiusCircos - 35 //Defining the outer radius of the plot
var lastTrack = "" //Stating the variable that will store the previously stated track
for(i in tracks){
    track = tracks[i]

    /////////////////////////////////////////////////////////////////////////
    //Code to determine radius of the currently selected track
    /////////////////////////////////////////////////////////////////////////

}
```

#### Giemsa stains track
This track contains simple bands, which are always the same width. This means that the calculation of the radii is simple. The inner and outer radius are defined and from these radii, an arc function is created using `d3.arc()`.

```javascript
if(track == "Giemsa Stains"){
            
    var outerRadiusChr = currentRadius - marginRadius
    var innerRadiusChr = outerRadiusChr - 20

    var arcChr = d3.arc() //The arc calculator for the chromosome bands
                    .outerRadius(outerRadiusChr)
                    .innerRadius(innerRadiusChr)


    var arcStain = d3.arc() //The arc calculator for the stains
                    .outerRadius(outerRadiusChr)
                    .innerRadius(innerRadiusChr);

    currentRadius = innerRadiusChr
    lastTrack = track
}
```

#### Copy number variation analysis track
For this track only one radius is determined, namely the radius of the zero point of the line graph, which will be created later. The margin is also defined here as `marginCNV`.

```javascript
else if(track == "CNV Analysis"){

    var radiusCNV = currentRadius - 25 //The middle radius of the CNV
    var marginCNV = 17.5 //The amount of pixels allowed on both sides of the radiusCNV

    currentRadius = currentRadius - 40 
    lastTrack = track  
} 
```

#### Big structural variants track
This track is the most calculations intensive to determine the radii. For this track, multiple layers of structural variants will be created to make sure they don't overlap. An array called `checkAngles` is created, which will house the angles of all structural variants divided over the differen layers. The [arcAngles()](#arcAngles) function was used to define the angles of the structural variants. Next, a loop structure was created which checks every structural variant on overlap with structural variants that already have a spot in the `checkAngles` array, starting from the lowest layer and gradually going up. When an empty spot is found, the structural variant will be added to this layer. The big structural variants are stored in `bigSVsData`, which is given as input to the [makeCircos()](#makeCircos) function. The radii and margins for the structural variants are also determined using `bigSVRadius` and `bigSVMargin` respectively. Lastly the radii for the background band are determined.

```javascript
else if(track == "Big Structural Variants"){

    var outerRadiusBigSVs = currentRadius - marginRadius
        
    var checkAngles = [] //The variable that will store the order of the layers of big structural variants
    //Loop over the big structural variants of each chromosome
    bigSVsData.forEach(chrSV => {
        if(chrSV != null){
            //Rewrite the object to be compatible with the arcAngles() function
            reworkedSV = [] 
            chrSV.forEach(sv => {
                reworkedSV.push({"chrom":sv.chromosome,"start":sv.start,"end":sv.stop,"type":sv.type.toLowerCase(),"geneSymbol":sv.geneSymbol})
            });
            //Define the layer where the current structural variant will be located
            arcAngles(reworkedSV).forEach(bigSV => {
                foundPlace = "nope"
                layerCount = 0
                //Execute this code until the current structural variant has found it's place
                while(foundPlace == "nope"){
                    //If this layer does not exist, add it and add the current SV to it
                    if(checkAngles[layerCount] == undefined){
                        checkAngles[layerCount] = []
                        checkAngles[layerCount].push(bigSV)
                        foundPlace = "first try!"
                    }
                    //If this layer exists, check if the current SV overlaps with a SV already on this layer
                    //if it does not overlap, add it to this layer, otherwise got to the next layer
                    else{
                        overlap = "nope" //Say that no overlap is detected yet
                        for(n in checkAngles[layerCount]){
                            variant = checkAngles[layerCount][n]
                            //Check for overlap
                            if((parseFloat(bigSV.startAngle) >= parseFloat(variant.startAngle) && parseFloat(bigSV.startAngle) <= parseFloat(variant.endAngle)) || 
                            (parseFloat(bigSV.endAngle) >= parseFloat(variant.startAngle) && parseFloat(bigSV.endAngle) <= parseFloat(variant.endAngle))){
                                overlap = "yes" 
                                break
                            }  
                        }
                        //Add the current SV to this layer if it has no overlap
                        if(overlap == "nope"){
                            checkAngles[layerCount].push(bigSV)
                            foundPlace = "I'm in!"
                        }
                    }
                    layerCount++ //increment the layer counter
                } 
            });
        }
    })
    var bigSVRadius = 5 //The radius of the bands representing the big SVs
    var bigSVMargin = 2.5 //The margin between the different bands
    var widthBigSVs = bigSVRadius*checkAngles.length + bigSVMargin*(checkAngles.length+1) //Define the total width of the big structural variants
    //Determine the inner radius of the band for the big structural variants
    if(bigSVsData.length == 0){ //A default width if there are no big SV found
        var innerRadiusBigSVs = outerRadiusBigSVs - 20 - bigSVMargin
    }else{
        var innerRadiusBigSVs = outerRadiusBigSVs - widthBigSVs
    }

    currentRadius = innerRadiusBigSVs
    lastTrack = track
} 
```

#### Small structural variants track
This track is defined in a similar way to the Giemsa stains track.

```javascript
else if(track == "Small Structural Variants"){

    var outerRadiusSmallSV = currentRadius - marginRadius
    var innerRadiusSmallSV = outerRadiusSmallSV - 20

    var arcSmallSVBands = d3.arc() //The arc calculator for the background bands
            .outerRadius(outerRadiusSmallSV)
            .innerRadius(innerRadiusSmallSV)

    var arcSmallSV = d3.arc() //The arc calculator for the small structural variants
            .outerRadius(outerRadiusSmallSV)
            .innerRadius(innerRadiusSmallSV)
    
    currentRadius = innerRadiusSmallSV
    lastTrack = track
} 
```

#### Translocations track
This track has two different possibilities for the determination of the radii, dependent on which track is next to it. If enclosed tracks, like the Giemsa stains are next to it, the outer radius of this track will be used as radius for the translocations. If a non-enclosed track, like the CNV analysis, is next to the translocations, a placeholder line will be created so the translocations won't overlap with the information of the non-enlosed track.

```javascript
else if(track == "Translocations"){

    //If the last made track was the CNV Analysis and there are translocations, the inner radius is a bit smaller and a line is created for the translocations to run into
    if((lastTrack == "CNV Analysis" || lastTrack == "") && translocationData.length != 0){
        var radiusTranslocations = currentRadius-marginRadius

        //Adding the lines
        gCircos.append("g").attr("id","translocationBands")
                    .selectAll(".translocationBandArc")
                    .data(pieChrSizes)
                    .enter().append("path")
                    .attr("class","translocationBandArc")
                    .attr("d",d3.arc()
                                .outerRadius(radiusTranslocations)
                                .innerRadius(radiusTranslocations)
                                .padAngle(paddingAngle)
                    )
                    .style("stroke",function(d,i){
                        return chrColors[chrToInt(d.data.chrom)];
                    }) 
            
    }
    //If the last made track is any other track, use the last known radius
    else{
        var radiusTranslocations = currentRadius
    }
}
```

The CSS styles for the background bands are: 

```css
.translocationBandArc{
    stroke-opacity: 0.25;
}
```

### Defining the angles and creating the visual elements
The defining of the radii and creation of the visual elements are split up because the order in which the visual elements are made is different than the order in which the radii are determined. For example, the translocations need to be made before the track next to it, so the translocations will be under this track instead of over it. This is visually important. The order in which the tracks are made are the same order as in this chapter.

#### Translocations tracks
The translocations are created using `d3.line().curve(d3.curveBasis)`. This creates curves, which only are accurate on the start and end positions, but not on the middle positions. This creates a good effect where the curve goes to the middle of the circle, but not all the way. The [translocationCurvePositions()](#translocationCurvePositions) function was used to determine the x and y coordinates of the start and end positions of the translocation.

```javascript
if(tracks.includes("Translocations")){ //Checking if the translocations are requested
    if(translocationData[0] != undefined){ //Checking if there are translocations available
        //A line generator for the translocations
        var lineGenerator = d3.line()
                            .curve(d3.curveBasis);

        //Determine the x and y positions of all translocations
        var translocationPositions = translocationCurvePositions(translocationData,radiusTranslocations,chrStains);

        //Create lines for all translocations and add them to a group
        gCircos.append("g")
            .attr("class","translocations")
            .selectAll(".translocationCurve")
            .data(translocationPositions)
            .enter().append("path")
            .attr("class","translocationCurve")
            .attr("id",function(d,i){
                return "int"+i;
            })
            .attr("d",function(pair){
                return lineGenerator([
                    [pair[0].x,pair[0].y],
                    [0,0],
                    [pair[1].x,pair[1].y]
                ])
            })
            .style("stroke-width","3")
            .on("mouseover", function(){mouseOverTranslocation(this)})
            .on("mousemove", function(d){mouseMoveTranslocation(d)})
            .on("mouseout", function(){mouseOutTranslocation(this)})
            .on("click", function(d,i){mouseClickTranslocation(translocationData[i],i)})    
    }
}
```

The event triggers used for the translocations are [mouseOverTranslocation()](#mouseOverTranslocation), [mouseMoveTranslocation()](#mouseMoveTranslocation), [mouseOutTranslocation()](#mouseOutTranslocation) and [mouseClickTranslocation()](#mouseClickTranslocation)

The CSS styles for the translocations are:

```css
.translocationCurve {
    fill: none;
    stroke: darkcyan;
    opacity: 0.5;
}
```

#### Giemsa stains
To add the giemsa stains, a background had to be created first. This background is color coded per chromosome using the `chrColors` object. When this background was added, the stain angles were calculated using [arcAngles()](#arcAngles).

```javascript
if(tracks.includes("Giemsa Stains")){ //Checking if the stains are requested

    //Adding a group for all chromosomes
    var gChromosomes = gCircos.append("g").attr("id","chromosomes")

    //Adding groups for the background paths
    var chrArc = gChromosomes.selectAll(".chrArc")
                .data(pieChrSizes)
                .enter().append("g")
                .attr("class","chrArc")
                .attr("id",function(d){
                    return "chrChr" + chrToInt(d.data.chrom);
                });              

    //Adding some white filler backgrounds for aesthetics to each chromosome
    chrArc.append("path")
        .attr("d",arcChr)
        .style("fill","white")
        .attr("class","filler")  

    //Producing the path for each chromosome
    chrArc.append("path")
        .attr("d",arcChr)
        .style("fill",function(d){
            return chrColors[chrToInt(d.data.chrom)];
        })     

    //Adding a group for all stains
    var gStains = gCircos.append("g").attr("id","stains")

    //Making an array to define the color for each type of stain
    var colorsStain = {"gneg":"white","gpos25":"lightgrey","gpos50":"grey","gpos75":"darkgrey","gpos100":"black","acen":"red","gvar":"lightblue","stalk":"darkblue"};

    //Adding in the stains for all selected chromosomes
    chrToKeep.forEach(chr => {
        gStains.append("g")
                .attr("id","stainsChr" + chr)
                .selectAll(".stainArc")
                .data(arcAngles(chrStains[chr]))
                .enter().append("path")
                .attr("class","stainArc")
                .attr("id",function(d,i){
                    return "stain"+i
                })
                .attr("d",arcStain)
                .style("fill",function(d,i){
                    return colorsStain[d.type];
                })
                .on("mouseover",function(){mouseOverStain(this)})
                .on("mousemove",function(d,i){mouseMoveStain(chrStains[chr][i])})
                .on("mouseout",function(){mouseOutStain(this)});               
    })
} 
```

The event triggers used for the stains are [mouseOverStain()](#mouseOverStain), [mouseMoveStain()](#mouseMoveStain) and [mouseOutStain()](#mouseOutStain).

The CSS styles of the stains and the background of the stains are:

```css
.chrArc path {
    opacity: 0.4;
    stroke: black;
    stroke-opacity: 0.25;
}

.chrArc .filler {
    opacity: 1;
}

.stainArc {
    stroke-width: 0;
    opacity: 0.5;
    stroke-opacity: 0.75;
    stroke: black;
}
```

#### The chromosome labels
The labels are always created on the outer layer of the plot and show which bands stand for which chromosome.

```javascript
//The arc generator for the labels
var arcLabel = d3.arc()
    .outerRadius(radiusCircos-20)
    .innerRadius(radiusCircos-20);

//Adding the labels
gCircos.append("g")
    .attr("class","chrText")
    .selectAll("text")
    .data(pieChrSizes)
    .enter()
    .append("text")
    .attr("transform",function(d){
        return "translate(" + arcLabel.centroid(d) + ")";
    })
    .text(function(d){return "chr"+d.data.chrom})
```

The CSS styles for the labels are:

```css
.chrText text {
    font-size: 12px;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: bold;
    text-anchor: middle;
    stroke: none;
    fill: rgb(92, 92, 92);
}
```

#### Big structural variants
First, some background bands were created using the radii defined in the first part of the [makeCircos()](#makeCircos) function. Next up, the different layers are constructed of the big structural variants using the `checkAngles` array created earlier.

```javascript
if(tracks.includes("Big Structural Variants")){//Checking if the big structural variants are requested

    ///Produce the bands behind the big SVs
    //Adding a group for all bands
    var gBigSVband = gCircos.append("g").attr("class","bigSVBandArc")

    //Adding groups for the paths per chromosome
    var bigSVArc = gBigSVband.selectAll(".chrArc")
                .data(pieChrSizes)
                .enter().append("g")
                .attr("class","bigSVArc")
                .attr("id",function(d){
                    return "bigSVChr" + chrToInt(d.data.chrom);
                });              

    //Adding some white filler backgrounds for aesthetics to each group
    bigSVArc.append("path")
        .attr("d",d3.arc()
                    .outerRadius(outerRadiusBigSVs)
                    .innerRadius(innerRadiusBigSVs))
        .style("fill","white")
        .attr("class","filler")  

    //Producing the background band itself
    bigSVArc.append("path")
    .attr("d",d3.arc()
                .outerRadius(outerRadiusBigSVs)
                .innerRadius(innerRadiusBigSVs)
    )

    ///Produce the big structural variants
    //Adding the group for all big structural variants
    var gBigSVs = gCircos.append("g").attr("id","bigSVs")

    //Making an array to define the color
    var colorsBigSVs = {"deletion":"red",
                            "duplication":"forestgreen",
                            "inversion":"#0047ab",
                            "indel":"purple",
                            "copy number gain":"orange",
                            "copy number loss":"brown"
                        };

    //Loop over every layer and create the bands that show the big structural variants
    for(k in checkAngles){

        //Defining the radii of the current layer
        innerRadiusLayer = innerRadiusBigSVs + (+k+1)*bigSVMargin + k*bigSVRadius
        outerRadiusLayer = innerRadiusBigSVs + (+k+1)*(bigSVRadius+bigSVMargin)
        
        //Create a group for every layer and add the paths to it
        gBigSVs.append("g")
                .attr("id","layer" + k)
                .selectAll(".bigSVsArc")
                .data(checkAngles[k])
                .enter().append("path")
                .attr("class","bigSVsArc")
                .attr("id",function(d,i){
                    return "sv"+i;
                })
                .attr("d",d3.arc().outerRadius(function(d){
                                    return outerRadiusLayer
                                })
                                .innerRadius(function(d){
                                    return innerRadiusLayer
                                })
                )
                .style("fill",function(d,i){
                    return colorsBigSVs[d.type];
                })
                .style("stroke",function(d,i){
                    return colorsBigSVs[d.type];
                })
                .on("mouseover",function(){mouseOverBigSV(this)})
                .on("mousemove",function(d){mouseMoveBigSV(d)})
                .on("mouseout",function(){mouseOutBigSV(this)})
                .on("click",function(d){mouseClickBigSV(d)}); 
    }
}
```

The event triggers for the big structural variants are [mouseOverBigSV()](#mouseOverBigSV), [mouseMoveBigSV()](#mouseMoveBigSV), [mouseOutBigSV()](#mouseOutBigSV) and [mouseClickBigSV()](#mouseClickBigSV).

The CSS styles used for the big structural variants and its background bands are:

```css
.bigSVBandArc path{
    opacity: 0.25;
    fill: lightgray;
    stroke: black;
    stroke-opacity: 0.25;
}

.bigSVBandArc .filler {
    opacity: 1;
    fill: white;
}

.bigSVsArc {
    stroke-width: 0;
    fill-opacity: 0.5;
    stroke-opacity: 0.65;
}
```

#### Copy number variation analysis
The axes were added before the line graph visualizing the CNV data. To determine the angles of the line graph, the [arcAngles()](#arcAngles) function was used. 

```javascript
if(tracks.includes("CNV Analysis")){ //Checking if the CNV analysis is requested

    //Defining some variables
    var gCNV = gCircos.append("g").attr("id","CNV") //A group for the CNV data

    //Adding axis lines for the CNV
    var thresholds = [-0.8,-0.6,-0.4,-0.2,0,0.2,0.4,0.6,0.8] //Assigning values to each axis
    gCNV.append("g")
            .attr("id","axis")
            .selectAll(".CNVAxis")
            .data(thresholds)
            .enter().append("path")
            .attr("class","CNVAxis")
            .attr("d",d3.arc()
                        .innerRadius(function(d){
                            return radiusCNV + d/maxCNV*marginCNV
                        })
                        .outerRadius(function(d){
                            return radiusCNV + d/maxCNV*marginCNV
                        })
                        .startAngle(0)
                        .endAngle(360/Math.PI)
            )
            .style("stroke-width",function(d){
                if(d == 0){return "1.5"}
                else{return "0.5"}
            })
            .style("stroke",function(d){
                if(d == 0){return "red"}
                else{return "black"}
            })

    //Adding the bands visualizing the CNV
    for(i in chrToKeep){ //Loop over each requested chromosome
        chrCNV = chrToKeep[i] //The current chromosome
        if(CNVData[chrCNV] != null){ //Check if the chromosome contains CNV data
            
            //Add the bands visualizing the CNV data
            gCNV.append("g")
                .attr("id","CNVChr" + chrCNV)
                .selectAll(".CNVCurve")
                .data(arcAngles(CNVData[chrCNV]))
                .enter().append("path")
                .attr("class","CNVCurve")
                .attr("d",d3.arc().outerRadius(function(d){
                                        if(d.r <= 0){return radiusCNV}
                                        else{return radiusCNV+(d.r/maxCNV*marginCNV)}
                                    })
                                    .innerRadius(function(d){
                                        if(d.r > 0){return radiusCNV}
                                        else{return radiusCNV+(d.r/maxCNV*marginCNV)}
                                    }))
                .style("stroke",function(d,i){
                    if(d.r < -0.35){return "red"} 
                    else if(d.r > 0.35){return "blue"} 
                    else{return "gray"}
                })
                .style("fill",function(d,i){
                    if(d.r < -0.35){return "red"} 
                    else if(d.r > 0.35){return "blue"} 
                    else{return "gray"}
                })
        }
    }
}
```

The CSS styles for the axes and the graph are:

```css
.CNVAxis {
    opacity: 0.25;
}

.CNVCurve {
    stroke-width: 1.5;
}
```

#### Small structural variants
The small structural variants were added in a similar way to the stains, also using [arcAngles()](#arcAngles) to define the angles of the ranges of small structural variants.

```javascript
if(tracks.includes("Small Structural Variants")){ //Checking if the small structural variants are requested

    //Adding the group for all small structural variants
    var gSmallSV = gCircos.append("g").attr("id","smallSV")

    //Making the group for each chromosome
    var smallSVBandArc = gSmallSV.selectAll(".smallSVBandArc")
                                .data(pieChrSizes)
                                .enter().append("g")
                                .attr("class","smallSVBandArc")
                                .attr("id",function(d){
                                    return "smallSVBandChr" + chrToInt(d.data.chrom);
                                })
    
    //Adding the fillers for better visuals
    smallSVBandArc.append("path")
                .attr("d",arcSmallSVBands)
                .attr("class","filler")

    //Adding the chromosomes
    smallSVBandArc.append("path")
                .attr("d",arcSmallSVBands)
    
    //Adding the heatmap visualization of the small SVs
    var smallAngles = smallSVAngles(smallSVsData) //Defining the angles 

    var colorRange = d3.scaleLinear() //Creating the color scale for the heatmap
        .domain([0, 10])
        .range(["yellow", "orange", "red"]);

    smallAngles.forEach(chrSV => { //Add the heatmap visualization
        if(chrSV != undefined){
            gSmallSV.append("g")
                .attr("id","smallSVChr" + chrToInt(chrSV[0].chrom))
                .attr("class","smallSVArc")
                .selectAll(".smallSVArc")
                .data(chrSV)
                .enter().append("path")
                .attr("d",arcSmallSV)
                .style("fill",function(d){return colorRange(d.density)})
                .style("stroke",function(d){return colorRange(d.density)})
                .attr("id",function(d,i){return "smallSV" + i})
                .on("mouseover",function(){mouseOverSmallSV(this)})
                .on("mousemove",function(d,i){mouseMoveSmallSV(d)})
                .on("mouseout",function(){mouseOutSmallSV(this)})
        }
    });
}
```

The event triggers for the small structural variants are [mouseOverSmallSV()](#mouseOverSmallSV), [mouseMoveSmallSV()](#mouseMoveSmallSV) and [mouseOutSmallSV()](#mouseOutSmallSV).

The CSS styles for the small structural variants and its background bands are:

```css
.smallSVBandArc path {
    opacity: 0.25;
    fill: lightgray;
    stroke: black;
    stroke-opacity: 0.25;
}

.smallSVBandArc .filler {
    opacity: 1;
    fill: white;
}

.smallSVArc path {
    fill-opacity: 0.6;
    stroke-opacity: 1;
    stroke-width: 0;
}
```

## Events (JavaScript (D3))
The events are used to make the plot more interactive.

### Pop-up events
The triggers created for the static pop-up are:

#### crossOver()
This trigger causes the cross styles to change when hovering over it

```javascript
function crossOver(){

    //Make the lines of the cross a bit bigger
    d3.select(".closingCross")
        .selectAll("line")
        .transition()
        .duration(40)
        .style("stroke-width","1.5")

    //Change the color of the background of the cross
    d3.select(".closingCross")
        .transition()
        .duration(40)
        .style("fill","gray")
}
```

#### crossOut()
This trigger causes the cross to go back to its original styles when the mouse moves away from it.

```javascript
function crossOut(){

    //Revert the lines of the cross to their original state
    d3.select(".closingCross")
    .selectAll("line")
    .transition()
    .duration(40)
    .style("stroke-width","1")

    //Revert the color of the background of the cross
    d3.select(".closingCross")
    .transition()
    .duration(40)
    .style("fill","lightgray")
}
```

### Circos triggers
In this chapter all event trigger of the circos plot will be listed.

#### mouseOverStain()
This trigger shows the pop-up for the stains and changes the styles when hovering over the stain

```javascript
function mouseOverStain(currentStain){

    //Show the tooltip and remove the previous text
    d3.select("#hoverTooltip")
        .style("visibility", "visible")
        .selectAll("p")
        .remove();

    //Increase the stroke-width of the stains by 2 pixels
    d3.select(currentStain)
        .transition()
        .duration(eventDuration-50)
        .style("stroke-width","2")
}
```

#### mouseMoveStain()
This trigger makes the pop-up follow the mouse when it moves over the stain and adds text to the pop-up.

```javascript
function mouseMoveStain(d){

    //The array storing the text that should be shown
    var textfiller = [
        "Position: " + d.chrom + ":" + d.start + "-" + d.end,
        "Size: " + (d.end - d.start),
        "Name: " + d.name
    ]

    //Let the tooltip follow the mouse and display the data
    d3.select("#hoverTooltip")
        .style("top", (d3.event.pageY-textfiller.length*28)+"px")
        .style("left",(d3.event.pageX-100)+"px")
        .selectAll("p")
        .data(textfiller)
        .enter().append("p")
        .text(function(d,i){
            return d
        });
}
```

#### mouseOutStain()
This trigger hides the pop-up and returns the styles of the stain back to normal.

```javascript
function mouseOutStain(currentStain){

    //Hide the tooltip
    d3.select("#hoverTooltip")
        .style("visibility", "hidden");

    //Revert the stroke-width
    d3.select(currentStain)
        .transition()
        .duration(eventDuration-50)
        .style("stroke-width","0")
}
```

#### mouseOverBigSV()
This trigger shows the pop-up and changes the styles of the big structural variants when hovering over it.

```javascript
function mouseOverBigSV(currentPath){

    //Show the tooltip and remove the previous text
    d3.select("#hoverTooltip")
        .style("visibility", "visible")
        .selectAll("p")
        .remove();

    //Changing the stroke-width of the currently hovered over SV
    d3.select(currentPath)
        .transition()
        .duration(eventDuration-50)
        .style("stroke-width",radiusChange-1)
}
```

#### mouseMoveBigSV()
This trigger makes the pop-up follow the mouse when it moves over the big structural variant and adds the text to the tooltip.

```javascript
function mouseMoveBigSV(d){

    //The array storing the text that should be shown
    var textfiller = [
        "Position: " + d.chrom + ":" + d.start + "-" + d.end,
        "Size: " + (d.end - d.start),
        "Type: " + d.type.charAt(0).toUpperCase() + d.type.slice(1),
        "Click to get a list of overlapping genes"
    ]

    //Let the tooltip follow the mouse and display the data
    d3.select("#hoverTooltip")
        .style("top", (d3.event.pageY-textfiller.length*28)+"px")
        .style("left",(d3.event.pageX-100)+"px")
        .selectAll("p")
        .data(textfiller)
        .enter().append("p")
        .text(function(d,i){
            return d
        });
}
```

#### mouseOutBigSV()
This trigger hides the pop-up and changes the styles of the big structural variant back to normal.

```javascript
function mouseOutBigSV(currentPath){

    //Hide the tooltip
    d3.select("#hoverTooltip")
        .style("visibility", "hidden");

    //Reverting the stroke-width of the currently hovered over SV
    d3.select(currentPath)
        .transition()
        .duration(eventDuration)
        .style("stroke-width","0")
}
```

#### mouseClickBigSV()
This trigger shows the static pop-up containing the gene list when the user clicks on the big structural variant.

```javascript
function mouseClickBigSV(d){

    //Show the pop-up and remove the previous text
    d3.select("#geneTooltip")
        .style("visibility", "visible")
        .selectAll("p")
        .remove()

    //Adding the text to the pop-up
    d3.select("#geneTooltip")
        .style("top", (d3.event.pageY-d.geneSymbol.length*28)+"px")
        .style("left",(d3.event.pageX-50)+"px")
        .selectAll("p")
        .data(d.geneSymbol)
        .enter().append("p")
        .attr("class","genesList")
        .text(function(d,i){
            return d
        });
}
```

#### mouseOverTranslocation()
This trigger shows the pop-up and changes the styles of the translocation when hovering over it.

```javascript
function mouseOverTranslocation(currentTranslocation){
    
    //Show the tooltip and remove the previous text
    d3.select("#hoverTooltip")
        .style("visibility", "visible")
        .selectAll("p")
        .remove();

    //Changing the width of the line to 6 pixels
    d3.select(currentTranslocation)
        .transition()
        .duration(eventDuration)
        .style("stroke-width","6") 
}
```

#### mouseMoveTranslocation()
This trigger adds the text to the pop-up and makes it follow the mouse when moving over the translocation.

```javascript
function mouseMoveTranslocation(d){

    //The array storing the text that should be shown
    var textfiller = [
        "Position 1: " + d[0].chrom + ":" + d[0].startpos + "-" + d[0].endpos,
        "Position 2: " + d[1].chrom + ":" + d[1].startpos + "-" + d[1].endpos,
        d[0].stainName + " - " + d[1].stainName,
        "Click to get a list of overlapping genes"
    ]

    //Let the tooltip follow the mouse and display the data
    d3.select("#hoverTooltip")
        .style("top", (d3.event.pageY-textfiller.length*28)+"px")
        .style("left",(d3.event.pageX-100)+"px")
        .selectAll("p")
        .data(textfiller)
        .enter().append("p")
        .text(function(d,i){
            return d
        });
}
```

#### mouseOutTranslocation()
This trigger hides the pop-up and changes the styles of the translocation back to normal.

```javascript
function mouseOutTranslocation(currentTranslocation){

    //Hide the tooltip
    d3.select("#hoverTooltip")
        .style("visibility", "hidden");

    //Reverting the changes to the width of the line
    d3.select(currentTranslocation)
        .transition()
        .duration(eventDuration)
        .style("stroke-width","3")
}
```

#### mouseClickTranslocation()
This trigger shows the static pop-up containing the gene list when the user clicks on the translocation.

```javascript
function mouseClickTranslocation(d){

    //Show the pop-up and remove the previous text
    d3.select("#geneTooltip")
        .style("visibility", "visible")
        .selectAll("p")
        .remove()

    //Adding the text to the pop-up
    d3.select("#geneTooltip")
        .style("top", (d3.event.pageY-d[0].geneSymbol.length*28)+"px")
        .style("left",(d3.event.pageX-50)+"px")
        .selectAll("p")
        .data(d[0].geneSymbol)
        .enter().append("p")
        .attr("class","genesList")
        .text(function(d,i){
            return d
        });
}
```

#### mouseOverSmallSV()
This trigger shows the pop-up and changes the styles of the small structural variant when hovering over it.

```javascript
function mouseOverSmallSV(currentPath){

    //Show the tooltip and remove the previous text
    d3.select("#hoverTooltip")
        .style("visibility", "visible")
        .selectAll("p")
        .remove();

    //Change the stroke width of the hovered over path element
    d3.select(currentPath)
        .transition()
        .duration(eventDuration-50)
        .style("stroke-width",radiusChange-1)
}
```

#### mouseMoveSmallSV()
This trigger makes the pop-up follow the mouse when it moves over the small structural variant and adds text to the pop-up.

```javascript
function mouseMoveSmallSV(d){

    //The array storing the text that should be shown
    var textfiller = [
        "Position: " + d.chrom + ":" + d.start + "-" + d.stop,
        "Amount of small SVs: " + d.density,
    ]

    //Let the tooltip follow the mouse and display the data
    d3.select("#hoverTooltip")
        .style("top", (d3.event.pageY-textfiller.length*28)+"px")
        .style("left",(d3.event.pageX-100)+"px")
        .selectAll("p")
        .data(textfiller)
        .enter().append("p")
        .text(function(d,i){
            return d
        });
}
```
#### mouseOutSmallSV()
This trigger hides the pop-up and changes the styles of the small structural variant back to normal.

```javascript
function mouseOutSmallSV(currentPath){
    //Hide the tooltip
    d3.select("#hoverTooltip")
        .style("visibility", "hidden");

    //Reverting the stroke width of the hovered over path element
    d3.select(currentPath)
        .transition()
        .duration(eventDuration-50)
        .style("stroke-width","0")
}
```

## Functions (JavaScript (D3))
All functions used in the code will be shown here. These are divided into several groups to clarify where they are used.

### Main functions
The main functions are common functions used in a lot of the code.

#### chrToInt()
This function turns a chromosomal input into the integers. X and Y are converted to 23 and 24 respectively.

```javascript
function chrToInt(chr){
    if(chr == "X"){
        chr = 23
    }else if(chr == "Y"){
        chr = 24
    }
    return parseInt(chr)
}
```

#### chrToString()
This function turns a chromosomal input into the strings. 23 and 24 are converted to X and Y respectively.

```javascript
function chrToString(chr){
    if(chr == 23){
        chr = "X"
    }else if(chr == 24){
        chr = "Y"
    }
    return chr.toString()
}
```

### Circos functions
The circos functions are functions solely used in the visualization

#### arcAngles()
This function takes positions of 1 chromosome as input, extracts the chromosome from the input and turn the chromosomal positions of the input into angles to visualize the linear data in a circular way. This function used [chrToString()](#chrToString) as way to convert the standard chromsomal integers to strings.

```javascript
function arcAngles (arcData){

    //Defining some variables
    if(arcData[0] != undefined){
        chr = chrToString(arcData[0].chrom) //The current chromosome
    } else{
        chr = chrToString(arcData.chrom) //The current chromosome
    }
    resultAngles = [] //The array that will store the result

    //Determining the chromosome size and selecting the angles from this chromosome
    pieChrSizes.forEach(pieceOfCake => {
        if(pieceOfCake.data.chrom == chr){
            startAngleChrom = pieceOfCake.startAngle + (paddingAngle)/2 //Determining the start angle 
            endAngleChrom = pieceOfCake.endAngle - (paddingAngle)/2 //Determining the end angle
            chromSize = pieceOfCake.data.size; //Determining the chromosome size       
        }
    }); 

    //Determining the start and end angles of every band in the input array
    if(arcData[0] != undefined){ //Checking if the array contains multiple elements or just one
        arcData.forEach(currentArc => { //Looping over all data
            startAngle = startAngleChrom + currentArc.start/chromSize*(endAngleChrom-startAngleChrom) //The start angle of the current band
            endAngle = startAngleChrom + currentArc.end/chromSize*(endAngleChrom-startAngleChrom) //The end angle of the current band
            angles = {"startAngle":startAngle,"endAngle":endAngle} //An object stroring the two angles
            Object.assign(angles,currentArc) //Adding all input information to the array with the angles
            resultAngles.push(angles) //Pushing the resulting array to the result array
        })
    } else{
        startAngle = startAngleChrom + arcData.start/chromSize*(endAngleChrom-startAngleChrom) //The start angle of the current band
        endAngle = startAngleChrom + arcData.end/chromSize*(endAngleChrom-startAngleChrom) //The end angle of the current band
        angles = {"startAngle":startAngle,"endAngle":endAngle} //An object stroring the two angles
        Object.assign(angles,currentArc) //Adding all input information to the array with the angles
        resultAngles.push(angles) //Pushing the resulting array to the result array
    }
    return resultAngles //Returning the resulting data
}
```

#### determinePosition()
This function gets an angle and radius as input and calculates the X and Y positions of the point where the angle and radius overlap.

```javascript
function determinePosition(angle, radiusPoint){
    var x = Math.sin(angle)*radiusPoint //x-coordinate of the angle
    if(angle>(90*Math.PI/180) && angle<(270*Math.PI/180)){ 
        var y = Math.sqrt(Math.pow(radiusPoint,2)-Math.pow(x,2)) //y-coordinate of the angle
    }else{
        var y = -Math.sqrt(Math.pow(radiusPoint,2)-Math.pow(x,2)) //y-coordinate of the angle
    }
    return [x,y] //Return an array of the X and Y coordinates
}
```

#### translocationCurvePositions()
This function gets all translocations, the radius of the translocations and all stains as input. From this input the function calculates the X and Y coordinates of the two positions of the translocation. It also determines with what stains the translocation overlaps. This function used [determinePosition()](#determinePosition) as method to calculate the individual positions.

```javascript
function translocationCurvePositions(allTranslocations,radiusTranslocations,chrStains){

    //Defining some variables
    var returnPositions = []; //The array that will store the results

    //Looping over the input data
    for(i in allTranslocations){ 
        translocationPositions = allTranslocations[i] //Defining the current positions of the translocation
        returnPositions[i] = [] //Defining the place for the current translocation in the return array

        //Looping over the two positions
        translocationPositions.forEach(pos => {

            //Determining the chromosome size and selecting the angles from this chromosome
            pieChrSizes.forEach(pieceOfCake => {
                if(pieceOfCake.data.chrom == pos.chromosome){
                    startAngleChrom = pieceOfCake.startAngle + paddingAngle/2; //Determining the start angle 
                    endAngleChrom = pieceOfCake.endAngle - paddingAngle/2; //Determining the end angle
                    chromSize = pieceOfCake.data.size; //Determining the chromosome size         
                }
            });
            
            //Determining the location (x and y) of the position
            startAngle = startAngleChrom + pos.start/chromSize*(endAngleChrom-startAngleChrom) //The start angle of the position
            endAngle = startAngleChrom + pos.stop/chromSize*(endAngleChrom-startAngleChrom) //The end angle of the position
            meanAngle = (startAngle+endAngle)/2 //The angle of the middle of the current position
            
            locations = determinePosition(meanAngle,radiusTranslocations) //Determine the X and Y position of this side of the translocation
            
            //Determine the stain name of the position
            meanpos = (+pos.start + +pos.stop)/2 //The middle chromosomal location of the position
            for(z in chrStains[pos.chromosome]){ //Loop over the stains in the current chromosome
                stain = chrStains[pos.chromosome][z]
                if(meanpos >= stain.start && meanpos < stain.end){
                    stainName = stain.name //If the location overlaps with the current stain, define the stain name
                }
            }

            //Push the data to the return array
            returnPositions[i].push({"chrom":pos.chromosome,"startpos":pos.start,"endpos":pos.stop,"x":locations[0],"y":locations[1],"stainName":stainName})
        })      
    }

    return returnPositions //Returning the object with positions as output of the function
}
```

#### smallSVAngles()
This function gets all small structural variant densities as input and calculates the angles of the positions and assigns a density value to each position. This couldn't be done with [arcAngles()](#arcAngles) because of the way the density data is stored.

```javascript
function smallSVAngles(data){

    var resultAngles = [] //Defining the array for the resulting angles
    
    //Looping over the data
    for(i in data){
        dataCurrentChromsosome = data[i] //Defining the data of the current chromosome
        if(dataCurrentChromsosome != null){ //Checking if there is data in the current chromosome
            positions = Object.keys(dataCurrentChromsosome) //Determining the positions on the chromosome that contain small structural variants
            currentChr = i //Defining the current chromsome
            resultAngles[currentChr] = [] //Defining the place for the small variants in this chromosome

            //Determining the chromosome size and selecting the angles from this chromosome
            pieChrSizes.forEach(pieceOfCake => {
                if(pieceOfCake.data.chrom == chrToString(currentChr)){
                    startAngleChrom = pieceOfCake.startAngle + paddingAngle/2 //Determining the start angle 
                    endAngleChrom = pieceOfCake.endAngle - paddingAngle/2 //Determining the end angle
                    chromSize = pieceOfCake.data.size //Determining the chromosome size         
                }
            })

            //Determining the positions of the small variants and their angles
            positions.forEach(pos => {
                endpos = pos*5000000 //Determining the end location of the current position
                startpos = endpos - 4999999 //Determining the start location of the current position
                if(endpos > chromSize){ //If the end location is bigger than the size of the chromosome, make the chromosome size the end position
                    endpos = chromSize
                }
                startAngle = startAngleChrom + startpos/chromSize*(endAngleChrom-startAngleChrom) //The start angle of the current position
                endAngle = startAngleChrom + endpos/chromSize*(endAngleChrom-startAngleChrom) //The end angle of the current position

                //Adding the data to the result array
                resultAngles[currentChr].push({"chrom":chrToString(currentChr),"startAngle":startAngle,"endAngle":endAngle,"density":dataCurrentChromsosome[pos],"start":startpos,"stop":endpos})
            });
        }
    };
    return resultAngles //Returning the results
}
```

### Backend functions
The backend functions are solely used in the backend script

#### checkToKeep()
This function checks if the chromosome, which is the input, is inside `chrToKeep`. If the chromosome is already in the array, nothing will happen. If the chromosome is not part of the array, it will be added.

```javascript
function checkToKeep(chr){
    chr = chrToInt(chr) //Define the chromosome
    if(chrToKeep.includes(parseInt(chr)) == false){ //If this chromosome isn't in chrToKeep, add it
        chrToKeep.push(parseInt(chr))
    }
}
```

#### defineChrSelection()
This function checks which type of chromosome selection was used and assigns all requested chromosomes to chrToKeep if the selection type is manual. 

```javascript
function defineChrSelection(){
    //If the request for chromosomes is manual, add these chromosomes to chrToKeep
    if(parameters["chrRequest[]"] != undefined){
        //If the request is not an array (aka if there is 1 chromosome selected), add the chromosome as an array to chrToKeep
        if(Array.isArray(parameters["chrRequest[]"]) == false){
            chrToKeep = [parameters["chrRequest[]"]]
        //If the request is an array (so more than 1 chromosome is selected), add the array to chrToKeep
        }else{
            chrToKeep = parameters["chrRequest[]"]
        }
        //Parse all chromosomes as integers
        for(i in chrToKeep){
            chrToKeep[i] = parseInt(chrToKeep[i])
        }
    }
}
```

#### sortChrToKeep()
This function sorts `chrToKeep` from lowest to highest.

```javascript
function sortChrToKeep(){
    chrToKeep = chrToKeep.sort(function (a, b) {  return a - b;  }) //Sort chrToKeep
    for(i in chrToKeep){ //Parse chrToKeep as integers
        chrToKeep[i] = parseInt(chrToKeep[i])
    } 
}
```

### UI functions
These functions are solely used when changes happen in the UI, that will have an impact on the visualization.

#### checkTracks()
This function takes the current order of the tracks as input and checks if they are selected to show up or not. If they are selected, they will be returned by the function.

```javascript
function checkTracks(order){
    returnTracks = [] //An array which will store the requested tracks
    for(i in order){ //Loop over the last submitted order of the tracks
        track = order[i]
        checkboxTrack = d3.select("#checkTrack"+track.replace(/ /g,'')).property("checked")
        if(checkboxTrack){ //If the checkbox of the current track is checked, add it to the requestTracks array
            returnTracks.push(track)
        }
    }
    return returnTracks //Return the selected tracks
}
```

#### warningOrCircos()
This function takes all data that should be visualized and the track order as input. The function will remove any previously shown visualization or warning message. Next it will check if there are structural variants found for the currently selected disease. If there are structural variants it will return the circos plot of these variants, otherwise it will return a warning message saying that there aren't any variants found. This function also makes use of the [checkTracks()](#checkTracks) function to check which tracks should be made.

```javascript
function warningOrCircos(data, trackOrder){

    //Remove the previous circos plot or warning message
    d3.select("body").select("svg").select("g").remove()
    d3.select(".circosBorder").select("div").remove()

    //Check if there are structural variants
    if(data.chrSizes.length == 0){
        d3.select(".circosBorder")
            .append("div")
            .attr("class","noSVText")
            .append("p")
            .text("No structural variants found for " + lastSubmitted.disease)
    }else{
        //Define the angles of the selected chromosomes 
        pieChrSizes = pie(data.chrSizes)

        //If there is one chromosome selected, add a padding extra
        if(pieChrSizes.length == 1){
            pieChrSizes[0].endAngle -= paddingAngle/2
        }

        //Make the circos plot using the data that has been sent back
        makeCircos(data.translocations,pieChrSizes,data.chrStains,data.bigSVs,data.smallSVs,data.CNVData,data.chrToKeep,checkTracks(trackOrder))
    }  
}
```

The CSS styles for the warning message are:
```css
.noSVText{
    position: absolute;
    z-index: 2;
    border: solid 1px steelblue;
    padding: 25px;
    border-radius: 5px;
    background-color: rgba(70, 130, 180, 0.7);
}

.noSVText p {
    padding: 0;
    margin: 0;
}
```

#### autocomplete()
This function adds the functionality to the search bar.

```javascript
function autocomplete(searchBar, diseases) {
    var currentFocus //A variable stating which of the suggested diseases is currently selected
    var maxListSize = 10 //A variable stating how many diseases will be shown by the list

    //Execute a function when someone writes in the text field
    searchBar.on("input", function() {
        val = this.value //The typed text
        expression = new RegExp(val,"i") //Create the expression with the pattern
        closeAllLists() //Close any already open lists of autocompleted values
        if (!val) { return false;} //If there is no value typed, return false
        currentFocus = -1 //Set the current focus to -1 (= the search bar)

        //Add the div which will house the list of autocomplete items
        d3.select(this.parentNode)
            .append("div")
            .attr("id", "autocomplete-list")
            .attr("class","autocomplete-items")

        //Looping over all diseases
        autoCompleteCount = 0 //State a counter of the amount of autocomplete items are found
        for (i in diseases) {

            //Defining the result of the expression
            result = diseases[i].search(expression)

            //Check if the result states there is a match
            if (result != -1) {

                //Make the typed in text bold in the search results
                autofillText = diseases[i].substr(0,result)
                autofillText += "<strong>" + diseases[i].substr(result, val.length) + "</strong>"
                autofillText += diseases[i].substr(result+val.length)

                //If the user clicks on an autocomplete item, assign it as value of the search bar
                d3.select(".autocomplete-items")
                    .append("div")
                    .on("click", function() {
                        d3.select("#myInput").property("value",this.textContent) //Set the value of the search bar to the test of the current item
                    })
                    .attr("id","autocompleteItem" + autoCompleteCount)
                    .html(autofillText)
                autoCompleteCount++ //Increment the counter
            }

            //If the maximum list size is reached, break the loop
            if(autoCompleteCount == maxListSize){break}
        }
    })

    //A function that tells the script what to do if someone presses a key when the search bar is selected
    searchBar.on("keydown", function() {

        var autoCompleteList = d3.select("#autocomplete-list") //Stating the autocomplete list

        //If the user presses the down key, set the item below to active
        if (d3.event.keyCode == 40) {
            if(currentFocus < maxListSize){
                currentFocus++
            }
            removeActive(autoCompleteList,currentFocus-1)
            addActive(autoCompleteList,currentFocus)
        } 
        
        //If the user presses the up key, set the item above to active
        else if (d3.event.keyCode == 38) { //up
            if(currentFocus > -1){
                currentFocus--
            }
            removeActive(autoCompleteList,currentFocus+1)
            addActive(autoCompleteList,currentFocus)
        } 
        
        //If the user presses enter, set the text from the currently selected item as value of the search bar
        else if (d3.event.keyCode == 13) {
            d3.event.preventDefault()
            if (currentFocus > -1) {
                d3.select("#myInput").property("value",autoCompleteList.select("#autocompleteItem" + currentFocus).text())
                closeAllLists()
            }
        }
    });

    //A function that sets the selected item to active
    function addActive(autoCompleteList,autoCompleteCount) {
        if (!autoCompleteList){return false} //If there is no autocomplete list, do nothing

        //Change the style of the selected item
        autoCompleteList.select("#autocompleteItem" + autoCompleteCount)
                        .attr("class","autocomplete-active")
    }

    //A function that sets the selected item to inactive
    function removeActive(autoCompleteList,autoCompleteCount) {

        //Revert the style of the selected item
        autoCompleteList.select("#autocompleteItem" + autoCompleteCount)
                        .attr("class",null)
    }

    //A function that removes the list div
    function closeAllLists() {
        d3.select("#autocomplete-list").selectAll("div").remove()
    }
    
    //If the user clicks outside anywhere, close the list
    d3.selectAll("*").on("click",function(){
        closeAllLists()
    })

}
```

## Setting up the docker containers
The docker containers are created using Docker and Docker-compose. Docker-compose makes it easy to make multi-container applications, which is the case for this visualization. The containers that were created are:

1. The mongoDB database
2. The mongoDB seed (this makes it possible to add the data to the container)
3. The backend
4. The frontend

The docker-compose file looks like this:

```yml
version: '3.4'

services:
  mongodb:
    image: mongo:4.4.6
    container_name: mongodb

  mongo_seed: 
    image: mongo:4.4.6
    links:
      - mongodb
    volumes:
      - ./data:/seed
    command:
      - /seed/seed.sh
  
  backend:
    build: ./backend
    container_name: backend
    depends_on: 
      - mongodb
    ports:
      - 5487:8080
  
  frontend:
    build: ./frontend
    container_name: frontend
    ports: 
      - 5488:80
```

The mongoDB container is built using the mongo:4.4.6 image and is named `mongodb`. This container is currently an empty mongoDB database. Using the `mongo_seed` container it is possible to add the data. This container is linked to `mongodb` which means they share a filesystem. When `mongo_seed` is activated, all data in the `./data` folder of the repository will be copied to the `/seed` folder in the container. Next the command is given to execute the `seed.sh` script. This script contains all commands to add the data to the database:

```bash
#! /bin/bash

mongoimport --host=mongodb --db=circosData --collection=stains --type=json --file=/seed/stains.json
mongoimport --host=mongodb --db=circosData --collection=bigSVs --type=json --jsonArray --file=/seed/bigSVandTranslocations.json
mongoimport --host=mongodb --db=circosData --collection=cnvdata --type=tsv --headerline --file=/seed/customCNV.tsv
mongoimport --host=mongodb --db=circosData --collection=smallSVs --type=json --jsonArray --file=/seed/densitySmallSV.json
mongoimport --host=mongodb --db=circosData --collection=phenotypes --type=json --jsonArray --file=/seed/allPhenotypes.json
```

Now that the mongodb container is built, the backend will be built according to the Dockerfile in the backend folder. This file looks like this:

```dockerfile
FROM node:16.3.0
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --production
COPY . .
CMD ["node", "index.js"]
```

This creates a docker image of the backend using node:16.3.0 as the base image. When the image is built, the package.json and the yarn.lock file are copied into the container. Next, the dependencies for the backend are installed using yarn. Lastly, all data from the backend folder is copied into the container and the Node server is started. 

As seen in the docker-compose file, backend is dependent on mongodb, this will create a link between the mongodb container and the backend container. This way, the data inside the mongodb container can only be accessed by the backend container. The backend container then uses port 5487 to create an acces point for the frontend.

The frontend image is built using the Dockerfile in the frontend folder:

```dockerfile
FROM httpd:2.4
COPY . /usr/local/apache2/htdocs/
```

This image uses the httpd:2.4 image as the basis. This image creates frontend webservers. When the base image is installed, the scripts that build up the frontend are placed in the `/usr/local/apache2/htdocs/` folder. This tells the container to use these files on the webserver.

As seen in the docker-compose file, the frontend uses the 5488 port to show the visualization. In the frontend scripts, the 5487 port is used to connect with the backend.