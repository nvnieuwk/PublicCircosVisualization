////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Making the circos plot
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Defining the function that creates the circos plot
function makeCircos(translocationData,pieChrSizes,chrStains,bigSVsData,smallSVsData,CNVData,chrToKeep,tracks){

    //Generating a group element for all elements in the circos plot
    var gCircos = svg.append("g")
                    .attr("transform","translate(" + width/2 + "," + height/2 + ")");

    //Defining the radii of the tracks
    var currentRadius = radiusCircos - 35 //Defining the outer radius of the plot
    var lastTrack = "" //Stating the variable that will store the previously stated track
    for(i in tracks){
        track = tracks[i]
        //Define the radii of the Giemsa Stains track 
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
        //Define the middle radius of the CNV Analysis track 
        else if(track == "CNV Analysis"){

            var radiusCNV = currentRadius - 25 //The middle radius of the CNV
            var marginCNV = 17.5 //The amount of pixels allowed on both sides of the radiusCNV

            currentRadius = currentRadius - 40 
            lastTrack = track  
        } 
        //Define the radii of the Big Structural Variants track
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
        //Define the radii of the Small Structural Variants track
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
        //Define the radius of the translocations
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
    }


    
    ///Creating curves for translocations in the plot
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

    ///Adding the chromosome stains to the plot
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

    ///Assigning the chromosome name to each piece of the circos plot
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
    
    ///Adding arcs to visualize the big structural variants
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

    ///Adding visualizations for the CNV of the data
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

    ///Adding in the heatmap visualization for the small SVs
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
}
