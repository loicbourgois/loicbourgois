import csv
from pathlib import Path
import os
from collections import defaultdict
from .shared import write_force
import json
import hashlib
import numpy as np
from .trigram_2_plot import generate_trigrams, normalize


def trigram_2_review() -> dict[str, set[str]]:
    """
    Build trigram-to-search-string mapping from review_to_qid.csv.
    This replicates the behavior from the Rust code.
    """
    home_dir = os.environ['HOME']
    csv_path = Path(home_dir) / "github.com/loicbourgois/loicbourgois/movie-finder/data/csv/review_to_qid.csv"
    trigram_to_search = defaultdict(set)
    with csv_path.open(encoding="utf-8") as f:
        reader = csv.reader(f)
        records = list(reader)
    total = len(records)
    step = max(1, total // 100)
    review_hash_to_review = {}
    review_hash_2_qid = {}
    review_sizes = []
    for i, (qid, review) in enumerate(records[1:]):
        if i % step == 0:
            print(f"trigram_2_review: {i}/{total} ({i/total*100:.1f}%)")
        review_sizes.append(len(review))
        normalized_review = normalize(review)
        normalized_review_hash = hashlib.sha256(normalized_review.encode()).hexdigest()
        review_hash_to_review[normalized_review_hash] = normalized_review
        review_hash_2_qid[normalized_review_hash] = qid
        for trigram in generate_trigrams(normalized_review):
            trigram_to_search[trigram].add(normalized_review_hash)
    review_sizes_avg = sum(review_sizes) / len(review_sizes)
    review_sizes_p90 = np.percentile(review_sizes, 90)
    review_sizes_p10 = np.percentile(review_sizes, 10)
    review_sizes_p50 = np.percentile(review_sizes, 50)
    print(f"review_sizes_avg: {review_sizes_avg}")
    print(f"review_sizes_p90: {review_sizes_p90}")
    print(f"review_sizes_p10: {review_sizes_p10}")
    print(f"review_sizes_p50: {review_sizes_p50}")
    trigram_to_search_serializable = {
        trigram: list(searches)
        for trigram, searches in trigram_to_search.items()
    }
    write_force(
        f"{home_dir}/github.com/loicbourgois/loicbourgois/movie-finder/data/json/trigram_2_review_hash.json",
        json.dumps(trigram_to_search_serializable, indent=2)
    )
    write_force(
        f"{home_dir}/github.com/loicbourgois/loicbourgois/movie-finder/data/json/review_hash_2_review.json",
        json.dumps(review_hash_to_review, indent=2)
    )
    write_force(
        f"{home_dir}/github.com/loicbourgois/loicbourgois/movie-finder/data/json/review_hash_2_qid.json",
        json.dumps(review_hash_2_qid, indent=2)
    )
