[![Python 3.9](https://img.shields.io/badge/python-3.7+-orange.svg)](https://www.python.org/download/releases/3.9.0/)
# Alaska Center Energy and Power Capstone: Synthetic Electrical Grid and Data Model
![image](https://user-images.githubusercontent.com/19913928/172478159-d85c14f7-3cda-490b-bc8d-3698920945e2.png)

-----
### Project description:
This project is about developing publicly accessible Alaska-based power systemmodels, developed in Siemens PSS/e, PowerWorld, OpenDSS, and/or Milsoft Windmil, and associated load and generation data representing seasonal and futruistic scenarios.

-----
###### Source: University of Washington Engineerging Capstone - https://www.engr.washington.edu/capstone/
-----
### Software Dependencies
* Python3
* Tableau
* OpenStreetMap
*  For python packages see requirements.txt
*  Colab pro
*  Hyak NextGen Supercomputer
-----

### Organization
```
├── Capstone_Gnatt.xlsx
├── Data
│   ├── Building Data from OSM
│   │   ├── com_central.csv
│   │   ├── com_geva.csv
│   │   ├── ins_central.csv
│   │   ├── ins_gvea.csv
│   │   ├── res_central.csv
│   │   └── res_gvea.csv
│   └── Feeders Data
│       ├── Buses_pmax.csv
│       └── Feeders.csv
├── LICENSE.md
├── Packages
│   ├── Clustering
│   │   ├── Clustering.ipynb
│   │   └── SecondClustering_PmaxCalculation.ipynb
│   ├── Get_Data_From_OSM
│   │   └── Get_open_street_map_lines.ipynb
│   └── Linear Regression and Multi-output Models
│       ├── LinearRegression.ipynb
│       └── Multi-output.ipynb
├── README.md
├── Requirement.txt
└── acep_poster.pptx
```
-----
### OpenStreetMap

OpenStreetMap (OSM) is a collaborative project to create a free editable geographic database of the world. It contains almost everything you can think of, including gas pipelines, power lines and power plants etc.

#### Map Features
OpenStreetMap represents physical features on the ground (e.g., roads or buildings) using tags attached to its basic data structures (its nodes, ways, and     relations). Each tag describes a geographic attribute of the feature being shown by that specific node, way or relation. (For more features, check     https://wiki.openstreetmap.org/wiki/Map_features)

#### Why OSM

First of all, the flexibility. OSM is ready for any styling you need to apply for your project. The second reason is that OpenStreetMap is and always will be available for free to users, developers and companies. It even allows you to download all of the map offline if you need to and render it in your own language

-----

### Hierarchical Clustering
We employed a hierarchical agglomerative clustering algorithm implementation. The algorithm starts by placing each data point in a cluster by itself and then repeatedly merges two clusters until some stopping condition is met. The stopping condition in our case was the cluster size. 
#### Clustering process
Algorithm should stop the clustering process when all data points are placed in a single cluster or the cluster size condition is met. Algorithm also keeps track of the merging process: for each merging step, remembers which clusters are merged to produce which new cluster. Such information is similar to a dendrogram (e.g., shown below), except that dendrogram also remembers the distance of two clusters when they are merged. With the above information, this algorithm can then allow users to specify a desired number of clusters k or the cluster size, and returns the clusters and their centroids based on the clustering result. 

![image](https://user-images.githubusercontent.com/19913928/172250114-c117211f-c975-4557-af56-9571916a6a6a.png)


The main code for the algorithm was cloned from https://github.com/ZwEin27/Hierarchical-Clustering and changed as per our requirements. 

-----
### Machine Learning Models
We have one independent variable(X) and two dependents variables(Y1, Y2). In this case we try two methods. The first one is creating two linear regression models for X, Y1 and X, Y2. The second method is using multi-output regression. The accuracy from these two methods shows that linear regression method is more accurate than multi-output regression

-----

### User Stories:

#### Tom is a data science student in college and he is proficient in understanding electrical grids and the usage of electricity. He wants to know where he can find and download different types of buildings data for his synthetic power system models. He can use our script to download different types of buildings for OSM. After downloading the data he needs, he can use our clustering to cluster buildings in certain area and then apply our ML models to get QMax,QMin that he wants.  
#### Becky is a student researcher who is working on developing new grids for electricity transmission/distribution. She wants to know the usage patterns in Alaska. She wants an easy-to-understand interface that is publicly accessible.

### Describing Use Case:

#### Info provides by user
#### •	Data of different types of buildings and power grid system
#### Systems response
#### •	Grid graph on map with the expected electricity use, feeders, buses
#### Output will be in csv file and python plot

### Authenticate User Use Case:
#### * Open python and input the py file which contains model and ML coding
#### User --> Download the building types you want to download and then use it as inputs to get clusters feeders and buses
#### Program --> [Readable] Output plot of the electricity grid (Python's Plot)
####             [Not Readable] Report error (Expect error)
#### User --> Ask for more data or raw data (Import y or n for data detail)
#### Program --> [Readable] Output data file  (Output CSV file with location and usage)
####	           [Not Readable/ Sensitive data] Report error

### Component Specification:

| Name | What it Does | Input | Output |
|------|--------------|-------|--------|
| Model prepared  | Takes input data | Time, load, location, and weather | Prediction of load in the future use case scenarios |
| Interface| To show prediction and compare using statistical tools from the current usage | Current, voltage, Impedance, Capacitance,Reactants| Statistical values such as SD, mean and difference in the prediction and use |


-----
