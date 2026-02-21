
import os
import csv
from pathlib import Path
import os


HOME = os.environ['HOME']


def read(path):
    with Path(path).open("r", encoding="utf-8") as file:
        return file.read()


def create_parent_folder(path):
    folder = path.replace(path.split("/")[-1], "")
    if not os.path.exists(folder):
        os.makedirs(folder)


def write_force(path, content):
    folder = path.replace(path.split("/")[-1], "")
    if not os.path.exists(folder):
        os.makedirs(folder)
    with Path(path).open("w", encoding="utf-8") as f:
        f.write(content)


def write_force_csv(path, rows):
    create_parent_folder(path)
    with Path(path).open("w", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerows(rows)


# def path_local(path):
#     return path.replace("/root/", "$HOME/")


# def align_right(str_, length):
#     return str_.rjust(length)


# def aligned_advancement(i, total):
#     l = len(str(total))
#     ii = align_right(str(i+1), l)
#     return f"{ii}/{total}"


def list_all_files(path, filter_):
    return list(Path(path).rglob(filter_))

