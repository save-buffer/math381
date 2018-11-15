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
items = []
for line in f:
    substrs = line.split('\t')
    dims = [float(x) for x in substrs[1].split('x')]
    prob = float(substrs[-1])
    area = min(dims[0], dims[1]) * dims[2]
    items.append({
        'name' : substrs[0],
        'area' : area,
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
    area = dims[0] * dims[1]
    shelves.append({
        'dist' : dist,
        'area' : area,
        'comp' : component
    })
f.close()

m = Model()

# Create decision variable matrix
decisions = []
for shelf in shelves:
    decisions.append([])
    for item in items:
        decisions[-1].append(m.addVar(vtype=GRB.BINARY))

assert len(decisions) == len(shelves)

# Area constraints per shelf
for i in range(len(decisions)):
    assert len(decisions[i]) == len(items)
    shelf_area_expr = decisions[i][0] * items[0]['area']    
    for j in range(len(decisions[i]) - 1):
        shelf_area_expr = shelf_area_expr + decisions[i][j + 1] * items[j + 1]['area']
    m.addConstr(shelf_area_expr <= shelves[i]['area'])

# Items can only go into one spot
for i in range(len(items)):
    constr = decisions[0][i]
    for j in range(len(shelves) - 1):
        constr = constr + decisions[j + 1][i]
    m.addConstr(constr == 1)

# Items from the same subsystem must be in the same connected component
for sub in range(len(subs)):
    item_indices = [i for i in range(len(items)) if items[i]['sub'] == sub]
    for component in range(3):
        shelf_indices = [i for i in range(len(shelves)) if shelves[i]['comp'] == component]
        expr = sum(sum([decisions[j][i] for j in shelf_indices]) for i in item_indices)
        m.addConstr(expr == [0, len(item_indices)])

# Objective Function
obj = sum(sum([shelf['dist'] / item['prob'] for item in items]) for shelf in shelves)
m.setObjective(obj, GRB.MINIMIZE)

m.update()
m.optimize()
