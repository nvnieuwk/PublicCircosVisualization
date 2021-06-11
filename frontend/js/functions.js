////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Defining functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///Functions used to visualize data
//Generating a function to determine the start angle and end angle for positions in a chromosome
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

//Generating a function to determine the location of interactors
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

//Generating the function that defines the angles of the small SVs
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

///Functions used for common calculations
//Generating the function that converts chromosomes to integers
function chrToInt(chr){
    if(chr == "X"){
        chr = 23
    }else if(chr == "Y"){
        chr = 24
    }
    return parseInt(chr)
}

//Generating the function that converts chromosomes to strings
function chrToString(chr){
    if(chr == 23){
        chr = "X"
    }else if(chr == 24){
        chr = "Y"
    }
    return chr.toString()
}

//Generating a function that calculates the x and y positions for a given angle and radius
function determinePosition(angle, radiusPoint){
    var x = Math.sin(angle)*radiusPoint //x-coordinate of the angle
    if(angle>(90*Math.PI/180) && angle<(270*Math.PI/180)){ 
        var y = Math.sqrt(Math.pow(radiusPoint,2)-Math.pow(x,2)) //y-coordinate of the angle
    }else{
        var y = -Math.sqrt(Math.pow(radiusPoint,2)-Math.pow(x,2)) //y-coordinate of the angle
    }
    return [x,y] //Return an array of the X and Y coordinates
}