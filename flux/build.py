import os
from pathlib import Path
import json


HOME = os.environ['HOME']


def read(path):
    with open(path, "r") as file:
        return file.read()


def write_force(path, content):
    folder = path.replace(path.split("/")[-1], "")
    if not os.path.exists(folder):
        os.makedirs(folder)
    with open(path, "w") as f:
        f.write(content)


if __name__ == "__main__":
    print("start")
    directions = ["r", "l", "u", "d"]


    kinds = {}
    kinds['void'] = 0
    kinds['pixel'] = 1
    kinds['create'] = 2
    kinds['consume'] = 3
    i = 4
    for d1 in directions:
        for d2 in directions:
            if d1 != d2:
                id_ = f"{d1}2{d2}"
                kinds[id_] = i
                i += 1
    
    for d1 in directions:
        for d2 in directions:
            for d3 in directions:
                if d1 != d2 and d2 != d3 and d3 != d1:
                    id_ = f"{d1}2{d2}{d3}"
                    kinds[id_] = i
                    i += 1

    write_force(
        f"{HOME}/github.com/loicbourgois/loicbourgois/flux/kind.js.2.js",
        read(
            f"{HOME}/github.com/loicbourgois/loicbourgois/flux/kind.js.template.js"
        ).format(
            kinds= json.dumps(kinds, indent=2)
        )
    )
