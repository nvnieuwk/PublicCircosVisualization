////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Defining global variables
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Some basic variables
var svg = d3.select(".circosSVG"), //The svg element that houses the circos plot
    width = svg.attr("width"), //The width of the SVG element
    height = svg.attr("height"), //The height of the SVG element
    radiusCircos = Math.min(width,height)/2, //The radius of the Circos plot
    maxCNV = 0.8, //The maximum coverage
    paddingAngle = 0.01, //The angle between two chromosomes
    chrColors = {1:"#9acd32",2:"#66cdaa",3:"#a9a9a9",4:"#2f4f4f",5:"#0000ff",6:"#00008b",7:"#483d8b",8:"#1e90ff",9:"#00bfff",10:"#00fa9a",11:"#00ff00",12:"#008000",13:"#8b008b",14:"#ff00ff",15:"#ff1493",16:"#dc143c",17:"#db7093",18:"#ee82ee",19:"#bdb76b",20:"#ffff00",21:"#ffa500",22:"#ffa07a",23:"#ff4500",24:"#8b4513"},
    //The colors of the chromosomes
    radiusChange = 4, //The change of the radius for events
    eventDuration = 100, //The duration of events to complete in milliseconds
    marginRadius = 10 //The radius between different tracks

//Generating the pie function
var pie = d3.pie().value(function(d){
                            return d.size;
                        })
                    .padAngle(paddingAngle)
                    .sort(null)