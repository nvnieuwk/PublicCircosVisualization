////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Defining events
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///Stains events
//Generating the mouseOverBigSV function
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

//Generating the mouseMoveBigSV function
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

//Generating the mouseOutBigSV function
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

///Big structural variants events
//Generating the mouseOverBigSV function
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

//Generating the mouseMoveBigSV function
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

//Generating the mouseOutBigSV function
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

//Generating the mouseClickBigSV function
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

///Translocation events
//Generating the mouseOverTranslocation function
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

//Generating the mouseMoveTranslocation function
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

//Generating the mouseOutTranslocation function
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

//Generating the mouseClickTranslocation function
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

///Small structural variants events
//Generating the mouseOverSmallSV function
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

//Generating the mouseMoveBigSV function
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

//Generating the mouseOutSmallSV function
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