from .config import (
    entities,
    languages,
    wikidata_items,
    wikidata_properties,
)
import os
from .shared import (
    write_force,
    read,
)


HOME = os.environ['HOME']


def item_field_subfield(item, field, subfield):
    print(f"{item}/{field}/{subfield}")
    item_q = wikidata_items[item]
    field_p = wikidata_properties[field]
    subfield_p = wikidata_properties[subfield]
    write_force(
        f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/etl/queries/{item}/{field}/{subfield}.sparql",
        read(
            f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/etl/templates/item_field_subfield.sparql"
        ).format(
            item=item,
            field=field,
            subfield=subfield,
            item_q=item_q,
            field_p=field_p,
            subfield_p=subfield_p,
        )
    )


def item_field(item, field):
    print(f"{item}/{field}")
    item_q = wikidata_items[item]
    field_p = wikidata_properties[field]
    write_force(
        f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/etl/queries/{item}/{field}.sparql",
        read(
            f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/etl/templates/item_field.sparql"
        ).format(
            item=item,
            item_q=item_q,
            field=field,
            field_p=field_p,
        )
    )


def item_label_language(item, language):
    print(f"{item}/label/{language}")
    item_q = wikidata_items[item]
    write_force(
        f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/etl/queries/{item}/label/{language}.sparql",
        read(
            f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/etl/templates/item_label_language.sparql"
        ).format(
            item=item,
            item_q=item_q,
            language=language,
        )
    )


def item_field_label_language(item, field, language):
    print(f"{item}/{field}/label/{language}")
    item_q = wikidata_items[item]
    field_p = wikidata_properties[field]
    write_force(
        f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/etl/queries/{item}/{field}/label/{language}.sparql",
        read(
            f"{HOME}/github.com/loicbourgois/loicbourgois/movie-finder/etl/templates/item_field_label_language.sparql"
        ).format(
            item=item,
            item_q=item_q,
            language=language,
            field=field,
            field_p=field_p,
        )
    )


if __name__ == "__main__":
    print("# Build")
    for k, v in entities.items():
        # item(k)
        for l in languages:
            item_label_language(k, l)
        for k2, v2 in v.items():
            item_field(k, k2)
            for l in languages:
                item_field_label_language(k, k2, l)
            for k3, v3 in v2.items():
                item_field_subfield(k, k2, k3)
