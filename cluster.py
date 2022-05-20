# Import packages
import pandas as pd
import numpy as np
import sys
import math
import os
import heapq
import itertools
import matplotlib.pyplot as plt

##import industrial data for KNN clustering

cdf_final_string=["com_central_1","com_central_2","com_central_3","com_central_4"]

com_central_1=pd.read_csv(path+'Commercial_divided/Divided/com_central_1.csv', low_memory=False)
com_central_2=pd.read_csv(path+'Commercial_divided/Divided/com_central_2.csv', low_memory=False)
com_central_3=pd.read_csv(path+'Commercial_divided/Divided/com_central_3.csv', low_memory=False)
com_central_4=pd.read_csv(path+'Commercial_divided/Divided/com_central_4.csv', low_memory=False)


df_final_list=[com_central_1,com_central_2,com_central_3,com_central_4]
final_size_list=[1513,1513,1513,1513]

for ind in range(len(df_final_list)):
  df=df_final_list[ind]
  print(df_final_string[ind],len(df))
class Hierarchical_Clustering:
    def __init__(self, ipt_data, max_size):
        self.input_file_name = ipt_data
        self.dataset = None
        self.dataset_size = 0
        self.dimension = 0
        self.cluster_max_size = max_size
        self.heap = []
        self.clusters = []


    def initialize(self):
        """
        Initialize and check parameters
        """
        # check file exist and if it's a file or dir
        # if not os.path.isfile(self.input_file_name):
        #     self.quit("Input file doesn't exist or it's not a file")

        self.dataset, self.clusters = self.load_data(self.input_file_name)
        self.dataset_size = len(self.dataset)

        if self.dataset_size == 0:
            self.quit("Input file doesn't include any data")

        self.dimension = len(self.dataset[0]["data"])

        if self.dimension == 0:
            self.quit("dimension for dataset cannot be zero")

    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    """                      Hierarchical Clustering Functions                       """
    """                                                                              """
    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    def euclidean_distance(self, data_point_one, data_point_two):
        """
        euclidean distance: https://en.wikipedia.org/wiki/Euclidean_distance
        assume that two data points have same dimension
        """
        size = len(data_point_one)
        result = 0.0
        for i in range(size):
            f1 = float(data_point_one[i])   # feature for data one
            f2 = float(data_point_two[i])   # feature for data two
            tmp = f1 - f2
            result += pow(tmp, 2)
        result = math.sqrt(result)
        return result

    def compute_pairwise_distance(self, dataset):
        result = []
        dataset_size = len(dataset)
        for i in range(dataset_size-1):    # ignore last i
            for j in range(i+1, dataset_size):     # ignore duplication
                dist = self.euclidean_distance(dataset[i]["data"], dataset[j]["data"])
                result.append( (dist, [dist, [[i], [j]]]) )

        return result

    def build_priority_queue(self, distance_list):
        heapq.heapify(distance_list)
        self.heap = distance_list
        return self.heap

    def compute_centroid_two_clusters(self, current_clusters, data_points_index):
        size = len(data_points_index)
        dim = self.dimension
        centroid = [0.0]*dim
        for index in data_points_index:
            dim_data = current_clusters[str(index)]["centroid"]
            for i in range(dim):
                centroid[i] += float(dim_data[i])
        for i in range(dim):
            centroid[i] /= size
        return centroid

    def compute_centroid(self, dataset, data_points_index):
        size = len(data_points_index)
        dim = self.dimension
        centroid = [0.0]*dim
        for idx in data_points_index:
            dim_data = dataset[idx]["data"]
            for i in range(dim):
                centroid[i] += float(dim_data[i])
        for i in range(dim):
            centroid[i] /= size
        return centroid

    def hierarchical_clustering(self):
        """
        Main Process for hierarchical clustering
        """
        dataset = self.dataset
        current_clusters = self.clusters
        old_clusters = []
        heap = self.compute_pairwise_distance(dataset)
        heap = self.build_priority_queue(heap)

        while True:
            dist, min_item = heapq.heappop(heap)
            if dist >= float('inf'):
                break
            # pair_dist = min_item[0]
            pair_data = min_item[1]
            # judge if include old cluster
            if not self.valid_heap_node(min_item, old_clusters):
                continue

            new_cluster = {}
            new_cluster_elements = sum(pair_data, [])

            if len(new_cluster_elements) > self.cluster_max_size:
                dist = float('inf')
                heapq.heappush(heap, (dist, [dist, pair_data]))
                continue
            new_cluster_cendroid = self.compute_centroid(dataset, new_cluster_elements)
            new_cluster_elements.sort()
            new_cluster.setdefault("centroid", new_cluster_cendroid)
            new_cluster.setdefault("elements", new_cluster_elements)
            for pair_item in pair_data:
                old_clusters.append(pair_item)
                del current_clusters[str(pair_item)]
            self.add_heap_entry(heap, new_cluster, current_clusters)
            current_clusters[str(new_cluster_elements)] = new_cluster
        return current_clusters

    def valid_heap_node(self, heap_node, old_clusters):
        pair_dist = heap_node[0]
        pair_data = heap_node[1]
        for old_cluster in old_clusters:
            if old_cluster in pair_data:
                return False
        return True

    def add_heap_entry(self, heap, new_cluster, current_clusters):
        for ex_cluster in current_clusters.values():
            new_heap_entry = []
            dist = self.euclidean_distance(ex_cluster["centroid"], new_cluster["centroid"])
            new_heap_entry.append(dist)
            new_heap_entry.append([new_cluster["elements"], ex_cluster["elements"]])
            heapq.heappush(heap, (dist, new_heap_entry))


    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    """                             Helper Functions                                 """
    """                                                                              """
    """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
    def load_data(self, input_file):
        """
        load data and do some preparations
        """
        #input_file = open(input_file_name, 'rU')
        dataset = []
        clusters = {}
        id = 0
        for row in input_file:
            # line = line.strip('\n')
            # row = str(line)
            # row = row.split(",")
            iris_class =0

            data = {}
            data.setdefault("id", id)   # duplicate
            data.setdefault("data", row)
            data.setdefault("class", iris_class)
            dataset.append(data)

            clusters_key = str([id])
            clusters.setdefault(clusters_key, {})
            clusters[clusters_key].setdefault("centroid", row)
            clusters[clusters_key].setdefault("elements", [id])



            id += 1
        return dataset, clusters

    def quit(self, err_desc):
        raise SystemExit('\n'+ "PROGRAM EXIT: " + err_desc + ', please check your input' + '\n')

    def loaded_dataset(self):
        """
        use for test only
        """
        return self.dataset

    def display(self, current_clusters, dataset):
        colors = plt.cm.rainbow(np.linspace(0, 1, len(current_clusters)))
        plt.figure(figsize=(15,15))
        for ind, (_, clusterDict) in enumerate(current_clusters.items()):
            elems = clusterDict['elements']
            centroid = clusterDict['centroid']
            plt.scatter(dataset[elems][:, 0], dataset[elems][:, 1], color=colors[ind], marker='x', s=10)
        plt.legend()
        plt.show()
#Plotting the Clusters
def display(current_clusters, dataset):
        colors = plt.cm.rainbow(np.linspace(0, 1, len(current_clusters)))
        plt.figure(figsize=(10,15))
        for ind, (_, clusterDict) in enumerate(current_clusters.items()):
            elems = clusterDict['elements']
            centroid = clusterDict['centroid']
            plt.scatter(dataset[elems][:, 0], dataset[elems][:, 1], color=colors[ind], marker='x', s=10, label=ind)
        plt.legend()
        plt.show()
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
"""                               Main Method                                    """
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
def MainMethod(X_input,size):
    """
    inputs:
    - ipt_data: a text file name for the input data
    - imax_size  Max size of cluster
    """
    ipt_data = X_input      # input data, e.g. iris.dat
    max_size = size       # Max size of cluster

    hc = Hierarchical_Clustering(ipt_data, max_size)
    hc.initialize()
    current_clusters = hc.hierarchical_clustering()
    return current_clusters
for ind in range(len(df_final_list)):
  df=df_final_list[ind]
  size=final_size_list[ind]
  X = df.values[:,:]
  print('Working on '+df_final_string[ind])
  current_clusters=MainMethod(X,size)
  outputText = ""
  for centr, valDict in current_clusters.items():
    outputText += 'Size:' + str(len(valDict['elements'])) + ' Centroid:' + str(valDict['centroid'][0]) + ' ' + str(valDict['centroid'][1]) + '\n'
    #print('Size:', len(valDict['elements']),'Centroid:', valDict['centroid'])
  with open('outpue'+df_string[ind]+'_output.txt', 'w') as f:
    f.write(outputText)
