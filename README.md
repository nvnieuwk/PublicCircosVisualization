# Interactive visualization of clinical structural variants in the human genome by a circos plot, implemented with the D3 library in JavaScript. Data stored and retrieved with MongoDB database.
The set-up for the visualization is explained in the [docker set-up](#setting-up-the-docker-containers) chapter.

## Abstract
During the last couple of years genetic diagnostics has risen in popularity because of its importance in the medical world. Due to this rise in popularity there is an increasing need for efficient and intuitive visualizations of the complex data received from the field. (Yokoyama & Kasahara, 2019)

Due to the large amounts of complex and often confidential data, a web application is an ideal option for the visualization. A web application is split up into a backend and a frontend. The frontend contains the visualizations and the ability to ask data from the backend. The backend is located on a secure server, where all the data will be stored. This way the data is safe in one database and this makes sure the users can only see the data they are supposed to see.

After reading the article about visualization of structural variants, we decided to go for a Circos plot. This is a circular visualization of the genetic data, where the interactions between the different chromosomes can be easily visualized. This plot is used to get a global view of the data, which makes it useful to easily pinpoint the location of the problem. If the location is known, a more detailed visualization can be used to have a closer look.

In the frontend, the Circos plot is created using D3, which is designed to create interactive plots on the web. This interactivity makes it easier to navigate through the complex genetic data visualized in the Circos plot. The frontend also creates requests for data using JQuery and sends these to the backend, which is a Node.js server connected with a MongoDB database.

The Circos plot consists of multiple tracks of which the order can be changed (with exception of the Translocations track). The Giemsa Stains track shows the Giemsa stains combined with a color code for each chromosome, which is used to differentiate the different locations in the genome. The CNV Analysis tracks shows the copy number variation data, which is useful to check deletions and duplications in the patient. The Big Structural Variants track shows a layered view of all structural variants which are bigger than 1 million base pairs. The Small Structural Variants track shows a heatmap representation of the density of structural variants smaller than 1 million base pairs in a range of 5 million base pairs. And lastly, the Translocations tracks shows all the translocations. The last three tracks are used to visualize the structural variants requested.

The search bar in the user interface can be used to select a certain disease of which the structural variants will be shown after pressing the submit button. There also is an option to choose which chromosomes are shown.

Yokoyama, T. T., & Kasahara, M. (2019). Visualization tools for human structural variations identified by whole-genome sequencing. 

## File structure
- The [backend](backend/) folder contains all scripts and folders necessary for the running of the backend server which will connect to the MongoDB database. This folder contains a yarn package for version control of all dependencies.
- The [frontend](frontend/) folder contains all scripts linked to [index.html](frontend/index.html). These script are responsible for asking the data to the backend and visualizing the recieved data.
- The [docs](docs/) folder contains the [Electronic Traineeship Notebeek (ETN)](docs/ETN.md). This notebook explains all the code.
- The [parseScripts](parseScripts/) folder contains Python script that are used to parse the data and generate the random CNV data.
- The [data](data/) folder contains all parsed data, ready to be added to the database.

## Setting up the docker containers
To set up the docker containers, you need to have [docker](https://docs.docker.com/engine/install/) and [docker-compose](https://docs.docker.com/compose/install/) installed. Clicking on the names will direct you to the installation documentation.

If docker and docker-compose are installed, simply move to the InternshipHoWest directory, which is the cloned repository and execute this command to build and execute the containers:

```bash
sudo docker-compose up -d
```

If you go to [http://localhost:5488](http://localhost:5488) in your favorite browser, you will see the visualisation.

To turn off the containers execute this command:

```bash
sudo docker-compose down
```

### Some remarks
The docker containers make use of the localhost ports 5487 and 5488. In some occasions you will have to give these ports access through the firewall, for the application to work.

## Updating the data
The version currently available in the repository is from the 2nd of July 2021. To update this dataset, execute following commands:

1. Go to the data folder
```bash
cd data/
```

2. Download the latest clinvar dataset
```bash
wget https://ftp.ncbi.nlm.nih.gov/pub/clinvar/tab_delimited/variant_summary.txt.gz
```

3. Go to the parseScripts folder
```bash
cd ../parseScripts/
```

4. Execute the python scripts to update the parsed data files
```bash
python allPhenotypes.py
python densityClinvar.py
python parseClinvar.py
```

5. Optional: Create a new custom CNV dataset (This script creates a random dataset)
```bash
python createRandomCNV.py
```

It is recommended to rebuild the containers after updating the data.