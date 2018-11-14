#!/usr/local/bin/python3
from gurobipy import *

subs = {
    'Chassis' : 0,
    'Arm' : 1,
    'Science' : 2,
    'Electronics' : 3,
    'Software' : 4,
    'Misc' : 5
}

f = open('Robotics Closet Inventory - Sheet1.tsv', 'r')
parts = []
for line in f:
    substrs = line.split('\t')
    dims = [float(x) for x in substrs[1].split('x')]
    prob = float(substrs[-1])
    parts.append({
        'name' : substrs[0],
        'dims' : dims,
        'prob' : prob,
        'sub'  : subs[substrs[2]]
    })
f.close()

shelves = []
f = open('shelfdim.tsv')
for line in f:
    substrs = line.split('\t')
    dist = int(substrs[0])
    dims = [float(x) for x in substrs[1].split('x')]
    component = int(substrs[2])
    
    shelves.append({
        'dist' : dist,
        'dims' : dims,
        'comp' : component
    })
f.close()

m = Model()
