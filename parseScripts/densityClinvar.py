#### Determining the density of small SVs per phenotype
import re

#Defining the output file and making it writable
save_file = open("../data/densitySmallSV.json","w")

densities = {} # Define the main dictionary

#Opening the ClinVar tsv file and parsing it
with open("../data/variant_summary.txt") as tsv_file:
    #Parsing the data and writing it to the output file
    for line in tsv_file:
        row = line.split("\t") #Split the line on tabs
        if row[16] == "GRCh38" and row[9] == "-1" and int(row[20]) - int(row[19]) < 1000000: # Filter out the old assembly, the SNPs and the large SVs
            row[-1] = row[-1].strip() #Remove the newline at the end
            for phenotype in row[13].split("|"): # Loop over all phenotypes from the current SV
                if phenotype != "not provided" and phenotype != "not specified" and phenotype != "10 conditions" and phenotype != "-": # Filter out the phenotype which hold no informational value
                    if phenotype not in densities: # Create a dict inside "densities" for the phenotype if it does not exist yet
                        densities[phenotype] = {}
                    if row[18] not in densities[phenotype]: # Define the chromosome if it is not already in the dictionary
                        densities[phenotype][row[18]] = {}
                    meanpos = (int(row[20]) + int(row[19]))/2
                    upperthreshold = 5000000
                    while meanpos > upperthreshold: # Define the position of the SV per 5 million basepairs
                        upperthreshold += 5000000
                    position = int(upperthreshold/5000000)
                    if position not in densities[phenotype][row[18]]: # Check if there is already a variable for this position in the dictionary
                        densities[phenotype][row[18]][position] = 0
                    densities[phenotype][row[18]][position] += 1 # Increment the count of the current position

               
# Writing to the output file
save_file.write("[\n")

phencount = 0 # A counter variable
for phen in densities:
    save_file.write("{\n")
    save_file.write("\t\"" + phen + "\":\n")
    save_file.write("\t{\n")
    chromcount = 0
    for chrom in densities[phen]:
        save_file.write("\t\t\"" + chrom + "\":\n")
        save_file.write("\t\t{\n")
        chromcount += 1
        poscount = 0
        for pos in densities[phen][chrom]:
            save_file.write("\t\t\t\"" + str(pos) + "\":" + str(densities[phen][chrom][pos]))
            poscount += 1
            if poscount == len(densities[phen][chrom]):
                save_file.write("\n")
            else:
                save_file.write(",\n")
        if chromcount == len(densities[phen]):
            save_file.write("\t\t}\n")
        else:
            save_file.write("\t\t},\n")
    save_file.write("\t}\n")
    phencount += 1
    if phencount == len(densities):
        save_file.write("}\n")
    else:
        save_file.write("},\n")
              
                        
save_file.write("]")
