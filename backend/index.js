//Loading modules and defining connection urls
const http = require('http'); //Loading the HTTP module
const mongo = require('mongodb'); //Loading the MongoDB module
const qs = require('querystring'); //Loading the QueryString module
const MongoClient = mongo.MongoClient; //Defining the MongoClient
const dbUrl = 'mongodb://mongodb:27017'; //Defining the URL of the Mongo server
const dbName = 'circosData' //Stating the name of the database

//Creating a webserver, which will be called upon by the frontend
http.createServer((request, response) => {
    const { headers, method, url } = request;

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
        'Content-Type': 'application/json', //Telling the script, the response should be in json format
        'Access-Control-Allow-Origin': '*' //This gives all sites access to the server!!!
    });
    
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

    ///Defining some basic functions
    //A function responsible for turning the chromosomes to integers
    function chrToInt(chr){
        if(chr == "X"){
            chr = 23
        }else if(chr == "Y"){
            chr = 24
        }
        return parseInt(chr)
    }

    //A function responsible for turning the chromosomes to strings
    function chrToString(chr){
        if(chr == 23){
            chr = "X"
        }else if(chr == 24){
            chr = "Y"
        }
        return chr.toString()
    }

    //A function that checks if the chromosome is already in chrToKeep and adds it if false
    function checkToKeep(chr){
        chr = chrToInt(chr) //Define the chromosome
        if(chrToKeep.includes(parseInt(chr)) == false){ //If this chromosome isn't in chrToKeep, add it
            chrToKeep.push(parseInt(chr))
        }
    }

    //A function that defines chrToKeep if a manual selection is used
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

    //A function that sort chrToKeep
    function sortChrToKeep(){
        chrToKeep = chrToKeep.sort(function (a, b) {  return a - b;  }) //Sort chrToKeep
        for(i in chrToKeep){ //Parse chrToKeep as integers
            chrToKeep[i] = parseInt(chrToKeep[i])
        } 
    }

}).listen(8080); //Activates this server, listening on port 8080



