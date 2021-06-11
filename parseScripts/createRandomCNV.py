# Import modules
import json, random, itertools

# Parse the input file
stains = open("../data/stains.json")
stainsParsed = json.load(stains)

# Open the save file
save_file = open("../data/customCNV.tsv","w")

# Defining lists
allChrs = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","X","Y"]
header = "c\tcs\tce\tr\n"
save_file.write(header)
sampleList = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
weightsList = [86.5, 10, 0.5, 0.5, 0.5, 0, 0, 0.5, 0.5, 0.5, 0.5]
rList = [-0.7,0.7]

# Looping over the input data and writing it to the save file with a random R number
for i in allChrs:
    if i == "X":
        chr = 23
    elif i == "Y":
        chr = 24
    else:
        chr = i
    for stain in stainsParsed["cytoBandIdeo"]["chr"+i]:
        if stain["gieStain"] != "acen" and stain["gieStain"] != "stalk":
            multiplier = random.choices(sampleList, weights=weightsList)
            score = random.choice(rList)
            r = score*multiplier[0]
            save_file.write(str(chr) + "\t" + str(stain["chromStart"]) + "\t" + str(stain["chromEnd"]) + "\t" + str(r) + "\n")

# Closing the save file
save_file.close()

