####Parsing the ClinVar tsv file and filtering out the hg38 data
import re

#Defining the output file and making it writable
save_file = open("../data/allPhenotypes.json","w")

save_file.write("[\n{\n\"phenotypes\":[")

#Opening the ClinVar tsv file and reading it
with open("../data/variant_summary.txt") as tsv_file:
    phenList = []
    #Parsing the data and writing it to the output file
    lineCount = 0 #Start a header status checker
    for line in tsv_file:
        row = line.split("\t") #Split the line on tabs
        row[-1] = row[-1].strip() #Remove the newline at the end
        # Check if the assembly is GRCh38

        if lineCount == 0:
            lineCount += 1
            continue
            
        diseases = row[13].split("|")
        for disease in diseases:
            phenotypes = disease.split(";")
            for phen in phenotypes:
                if phen not in ["See cases","-","not provided","not specified"] and phen not in phenList:
                    phenList.append(phen)
    
    phenCount = 1
    for phen in phenList:
        if phenCount == len(phenList):
            save_file.write("\"" + phen + "\"")
        else:
            save_file.write("\"" + phen + "\",\n")
        phenCount += 1

save_file.write("\n]\n}\n]") 

#Closing all files
tsv_file.close()
save_file.close()