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
    block_2: `
        aaaaaaaa
        aa1111aa
        a111111a
        a111111a
        a111111a
        a111111a
        aa1111aa
        aaaaaaaa
    `,
    down: `
        a------a
        --------
        ---xx---
        -xxxxxx-
        --xxxx--
        ---xx---
        --------
        a------a
    `
}

const translate = {
    '-': 128,
    'x': 255,
    'a': 0,
    '1': 1,
}

const imgs = [
    imgs_.block.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.down.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
]


export {
    imgs,
}
