////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//The actions when data is submitted
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//When the submit button is pressed, send a new request
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

//Change the tracks automatically when selecting/deselecting the tracks
$('.checkTrack').on('change', function() {

    //Create the circos or warning message
    warningOrCircos(lastSubmitted.data, lastSubmitted.trackOrder) 
})

//Change the tracks automatically when order of the tracks changes
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

//A function checking which tracks are selected
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

//A function that will create the circos plot or show a warning message
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