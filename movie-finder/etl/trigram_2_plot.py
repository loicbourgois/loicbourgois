# raise TypeError(f'Object of type {o.__class__.__name__} '
# TypeError: Object of type set is not JSON serializable
# TODO: fix this error 
import csv
from pathlib import Path
import os
from collections import defaultdict
from .shared import write_force
import json
import hashlib
import numpy as np


def normalize(s: str) -> str:
    """Convert string to lowercase and strip whitespace."""
    return s.lower().strip()[0:512]


def generate_trigrams(s: str, size: int = 3) -> set[str]:
    """Generate padded trigrams (fixed size substrings)."""
    if not s:
        return set()
    padded = f"{' ' * size}{s}{' ' * size}"
    return {padded[i:i+size] for i in range(len(padded) - size + 1)}


def trigram_2_plot() -> dict[str, set[str]]:
    """
    Build trigram-to-search-string mapping from plot_to_qid.csv.
    This replicates the behavior from the Rust code.
    """
    home_dir = os.environ['HOME']
    csv_path = Path(home_dir) / "github.com/loicbourgois/loicbourgois/movie-finder/data/csv/plot_to_qid.csv"
    trigram_to_search = defaultdict(set)
    with csv_path.open(encoding="utf-8") as f:
        reader = csv.reader(f)
        records = list(reader)
    total = len(records)
    step = max(1, total // 100)
    plot_hash_to_plot = {}
    plot_hash_2_qid = {}
    plot_sizes = []
    for i, (qid, plot) in enumerate(records[1:]):
        if i % step == 0:
            print(f"trigram_2_plot: {i}/{total} ({i/total*100:.1f}%)")
        plot_sizes.append(len(plot))
        normalized_plot = normalize(plot)
        normalized_plot_hash = hashlib.sha256(normalized_plot.encode()).hexdigest()
        plot_hash_to_plot[normalized_plot_hash] = normalized_plot
        plot_hash_2_qid[normalized_plot_hash] = qid
        for trigram in generate_trigrams(normalized_plot):
            trigram_to_search[trigram].add(normalized_plot_hash)
    plot_sizes_avg = sum(plot_sizes) / len(plot_sizes)
    plot_sizes_p90 = np.percentile(plot_sizes, 90)
    plot_sizes_p10 = np.percentile(plot_sizes, 10)
    plot_sizes_p50 = np.percentile(plot_sizes, 50)
    print(f"plot_sizes_avg: {plot_sizes_avg}")
    print(f"plot_sizes_p90: {plot_sizes_p90}")
    print(f"plot_sizes_p10: {plot_sizes_p10}")
    print(f"plot_sizes_p50: {plot_sizes_p50}")
    trigram_to_search_serializable = {
        trigram: list(searches)
        for trigram, searches in trigram_to_search.items()
    }
    write_force(
        f"{home_dir}/github.com/loicbourgois/loicbourgois/movie-finder/data/json/trigram_2_plot_hash.json",
        json.dumps(trigram_to_search_serializable, indent=2)
    )
    write_force(
        f"{home_dir}/github.com/loicbourgois/loicbourgois/movie-finder/data/json/plot_hash_2_plot.json",
        json.dumps(plot_hash_to_plot, indent=2)
    )
    write_force(
        f"{home_dir}/github.com/loicbourgois/loicbourgois/movie-finder/data/json/plot_hash_2_qid.json",
        json.dumps(plot_hash_2_qid, indent=2)
    )
