####Parsing the ClinVar tsv file and filtering out the hg38 data
import re

#Defining the output file and making it writable
save_file = open("../data/bigSVandTranslocation.json","w")

header = [
    "alleleID","type","name","geneID","geneSymbol","hgncID","clinicalSignificance",
    "clinSigSimple","lastEvaluated","dbSnpID","dbVarID","rcvAccession","phenotypeIDs",
    "phenotypeList","origin","originSimple","assembly","chromosomeAccession","chromosome",
    "start","stop","referenceAllele","alternateAllele","cytogenetic","reviewStatus",
    "numberSubmitters","guidelines","testedInGTR","otherIDs","submitterCategories",
    "variationID","positionVCF","refenceAlleleVCF","alternateAlleleVCF"
    ]

save_file.write("[\n")

#Opening the ClinVar tsv file and reading it
with open("../data/variant_summary.txt") as tsv_file:
    #Parsing the data and writing it to the output file
    lineCount = 0 #Start a header status checker
    for line in tsv_file:
        row = line.split("\t") #Split the line on tabs
        row[-1] = row[-1].strip() #Remove the newline at the end
        # Check if the assembly is GRCh38

        if lineCount == 0:
            lineCount += 1
            continue
            
        if row[16] == "GRCh38" and int(row[20]) - int(row[19]) >= 1000000 and row[9] == "-1" or (row[1] == "Translocation" and row[18] != "na"):
            if lineCount == 1:
                save_file.write("{\n")
            else:
                save_file.write(",\n{\n")
            dataCount = 0 #Start a data counter
            for field in row:
                #Write the last piece of data on the line
                if dataCount == 33:
                    save_file.write("\"" + header[dataCount] + "\":\"" + field + "\"\n")
                #Write the genesymbols as a document
                elif dataCount == 4:
                    save_file.write("\"" + header[dataCount] + "\":[")
                    if re.match("subset of",field):
                        genes = field.split(" ")[-1].split(":")
                    else:
                        genes = field.split(";")
                    geneCount = 0
                    for gene in genes:
                        if geneCount == len(genes)-1:
                            save_file.write("\"" + gene + "\"")
                        else:
                            save_file.write("\"" + gene + "\",")
                        geneCount += 1
                    save_file.write("],\n")
                elif dataCount == 13:
                    save_file.write("\"" + header[dataCount] + "\":[")
                    phenotypes = field.split(";")
                    phenotypeCount = 0
                    for phen in phenotypes:
                        if phenotypeCount == len(phenotypes)-1:
                            save_file.write("\"" + phen + "\"")
                        else:
                            save_file.write("\"" + phen + "\",")
                        phenotypeCount += 1 
                    save_file.write("],\n")
                else:
                    save_file.write("\"" + header[dataCount] + "\":\"" + field + "\",\n")
                dataCount = dataCount+1
            save_file.write("}")
            lineCount += 1
save_file.write("\n]") 

#Closing all files
tsv_file.close()
save_file.close()