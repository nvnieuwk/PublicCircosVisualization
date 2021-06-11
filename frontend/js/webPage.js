////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Creating the web page
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////Creating the UI
///The div enclosing the UI
var UI = d3.select("body").append("div").attr("class","UI")

///Adding the search bar
UI.append("p").text("Search for a disease to visualize") //Adding the title of the search bar
    .append("button").attr("class","infoCircle").attr("id","infoSearch").text("i") //Adding the info button

UI.append("form").attr("class","formAutocomplete").attr("autocomplete","off") //Adding the search bar
        .append("div").attr("class","autocomplete").style("width","328px")
        .append("input").attr("id","myInput").attr("type","text").attr("name","diseaseInput").attr("placeholder","Disease")

///Adding the chromosome selection
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

///Adding checkboxes for the tracks
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

//Adding the submit button
UI.append("button").attr("id","submitPhen").attr("class","submitPhen").text("Submit")

////Adding the circos plot
///Creating the container for the circos plot
d3.select("body")
    .append("div").attr("class","circosBorder")
    .append("svg").attr("width","800").attr("height","800").attr("class","circosSVG")

///Creating the initial circos plot
//Defining the Url of the server script
const backendUrl="http://localhost:5487/index.js"

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

////Adding the tooltip
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
