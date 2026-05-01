const imgs_ = {
    block: `
        a111111a
        11111111
        11111111
        11111111
        11111111
        11111111
        11111111
        a111111a
    `,
    down: `
        a------a
        --------
        --------
        --------
        --------
        ---xx---
        ---xx---
        a--xx--a
    `,
    left: `
        a------a
        --------
        --------
        xxx-----
        xxx-----
        --------
        --------
        a------a
    `,
    up: `
        a--xx--a
        ---xx---
        ---xx---
        --------
        --------
        --------
        --------
        a------a
    `,
    right: `
        a------a
        --------
        --------
        -----xxx
        -----xxx
        --------
        --------
        a------a
    `,
    split_left_right: `
        a------a
        --------
        --------
        xxx--xxx
        xxx--xxx
        --------
        --------
        a------a
    `,
    split_up_down: `
        a--xx--a
        ---xx---
        ---xx---
        --------
        --------
        ---xx---
        ---xx---
        a--xx--a
    `,
    mix_to_left: `
        a--xx--a
        ---xx---
        ---xx---
        xxxxx---
        xxxxx---
        ---xx---
        ---xx---
        a--xx--a
    `,
    mix_to_right: `
        a--xx--a
        ---xx---
        ---xx---
        ---xxxxx
        ---xxxxx
        ---xx---
        ---xx---
        a--xx--a
    `,
    mix_to_up: `
        a--xx--a
        ---xx---
        ---xx---
        xxxxxxxx
        xxxxxxxx
        --------
        --------
        a------a
    `,
    mix_to_down: `
        a------a
        --------
        --------
        xxxxxxxx
        xxxxxxxx
        ---xx---
        ---xx---
        a--xx--a
    `,
    create: `
        11111111
        13333331
        13111131
        13133131
        13133131
        13111131
        13333331
        11111111
    `,
    consume: `
        a-a-a-a-
        -a-a-a-a
        a-a-a-a-
        -a-a-a-a
        a-a-a-a-
        -a-a-a-a
        a-a-a-a-
        -a-a-a-a
    `,
}


const translate = {
    '-': 128,
    'x': 255,
    'a': 0,
    '1': 1,
    '2': 2,
    '3': 3,
}

const imgs = [
    imgs_.block.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.down.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.right.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.left.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.up.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.split_left_right.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.split_up_down.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.mix_to_left.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.mix_to_right.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.mix_to_up.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.mix_to_down.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.create.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.consume.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
]


export {
    imgs,
}
