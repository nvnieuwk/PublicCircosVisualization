#! /bin/bash

mongoimport --host=mongodb --db=circosData --collection=stains --type=json --file=/seed/stains.json
mongoimport --host=mongodb --db=circosData --collection=bigSVs --type=json --jsonArray --file=/seed/bigSVandTranslocations.json
mongoimport --host=mongodb --db=circosData --collection=cnvdata --type=tsv --headerline --file=/seed/customCNV.tsv
mongoimport --host=mongodb --db=circosData --collection=smallSVs --type=json --jsonArray --file=/seed/densitySmallSV.json
mongoimport --host=mongodb --db=circosData --collection=phenotypes --type=json --jsonArray --file=/seed/allPhenotypes.json
