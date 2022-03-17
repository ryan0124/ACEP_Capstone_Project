[![Python 3.6](https://img.shields.io/badge/python-3.4+-orange.svg)](https://www.python.org/download/releases/3.4.0/)
# ACEP_Capstone_Project

## Use Cases and Component Specification - ACEP- group

### Project description:

This project is about developing publicly accessible Alaska-based power systemmodels, developed in Siemens PSS/e, PowerWorld, OpenDSS, and/or Milsoft Windmil, and associated load and generation data representing seasonal and futruistic scenarios.

###### Source: University of Washington Engineerging Capstone - https://www.engr.washington.edu/capstone/

### Software Dependencies
* Python3
* Tableau
* OpenStreetMap
*  For python packages see requirements.txt

### OpenStreetMap

OpenStreetMap (OSM) is a collaborative project to create a free editable geographic database of the world. It contains almost everything you can think of, including gas pipelines, power lines and power plants etc.

#### Map features
OpenStreetMap represents physical features on the ground (e.g., roads or buildings) using tags attached to its basic data structures (its nodes, ways, and     relations). Each tag describes a geographic attribute of the feature being shown by that specific node, way or relation. (For more features, check     https://wiki.openstreetmap.org/wiki/Map_features)

#### Why OSM
First of all, the flexibility. OSM is ready for any styling you need to apply for your project. The second reason is that OpenStreetMap is and always will be available for free to users, developers and companies. It even allows you to download all of the map offline if you need to and render it in your own language

### User Stories:

#### Tom is a data scientist works in one of the energy generator/ plant companies. He wants to know how much electricity needs to be generated for a summer festival. Also, what portion should be distributed to the festival area.  Tom is proficient in understanding electrical grids and the usage of electricity.
#### Becky is a student researcher who is working on developing new grids for electricity transmission/distribution. She wants to know the usage patterns in Alaska. She wants an easy-to-understand interface that is publicly accessible.

### Describing Use Case:

#### Info provides by user
#### •	Time, Location (Both in float or int type)
#### Systems response
#### •	Grid graph on map with the expected electricity use, error
#### Output will be in csv file and python plot

### Authenticate User Use Case:
#### * Open python and input the py file which contains model and ML coding
#### User --> Input time such as (dd-mm-yyyy) and location (Longitude and latitude)
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


#### What components are already available?

##### •	The grid usage data (ChemE)
##### •	General geographical data (ChemE)
##### •	Python function for reading online data (ChemE)
##### •	Minor Alaska power plant data
##### •	Model is being developed (EE)

#### What are the sub-components needed to implement those components that aren't already available?
##### •	Modelling software such as PSSE (EE)
##### •	Most Alaska power generator data
##### •	The main function for machine learning (ChemE)
##### •	Model for and from the data (EE)

###### *Data refers to Database

### Current process:
#### Electricity Monthly Usage:
![MonthlyUsage](../master/Result/MonthlyUsage.png)
#### Transmission Lines and Location:
![LocationLines](../master/Result/LocationLines.png)


### Future Steps
#### All the electricity usage and location data has been collected, modify, and visualized.
#### Parallel process on machine learning model development using Python while Electrical Engineering subgroup modeling electricity Grid.
