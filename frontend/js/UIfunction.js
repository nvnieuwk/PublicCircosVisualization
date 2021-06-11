////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Assigning the functionality to the UI
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///Generating the function that adds the functionality to the search bar
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

//Hides the manual selection when automatic chromosome selection is selected and vice versa
$('[name="options"]').on('change', function() {  
    if($(this).val() === "manual") {
        $('#chromosomeSelection').slideDown();
    } else {
        $('#chromosomeSelection').slideUp();
    }
})

//Checks all chromosomes if the select/deselect button is selected and vice versa
$('[name="checkAllChrs"]').on('change', function() {  
    if($(this).prop("checked") == true) {
        d3.selectAll('[name="checkChr"]').property("checked",true)
    } else {
        d3.selectAll('[name="checkChr"]').property("checked",false)
    }
})

//Adding the functionality to sort the tracks
$( function() {
    $( "#tracksSorter" ).sortable();
    $( "#tracksSorter" ).disableSelection();
});

///Tooltip functionality
//When clicking the cross, close the pop-up
$(".closingCross").click(function(){

    //Hide the static tooltip
    d3.select("#geneTooltip")
        .style("visibility", "hidden");
})

//Generating the crossOver function
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

//Generating the crossOut function
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

///Generating the info button events
//Info button for the search bar
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

//Info button for the chromosome selector
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

//Info button for the track selector
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