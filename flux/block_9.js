const imgs_ = {
    void: `
        000000000
        000000000
        000000000
        000000000
        000000000
        000000000
        000000000
        000000000
        000000000
    `,
    block: `
        111111111
        111111111
        111111111
        111111111
        111111111
        111111111
        111111111
        111111111
        111111111
    `,
    up: `
        a-------a
        ---------
        ---------
        ----x----
        ---x-x---
        --x---x--
        ---------
        ---------
        a-------a
    `,
    left: `
        a-------a
        ---------
        -----x---
        ----x----
        ---x-----
        ----x----
        -----x---
        ---------
        a-------a
    `,
    down: `
        a-------a
        ---------
        ---------
        --x---x--
        ---x-x---
        ----x----
        ---------
        ---------
        a-------a
    `,
    right: `
        a-------a
        ---------
        ----x----
        -----x---
        ------x--
        -----x---
        ----x----
        ---------
        a-------a
    `,
    create: `
        111111111
        133333331
        131111131
        131333131
        131333131
        131333131
        131111131
        133333331
        111111111
    `,
    consume: `
        a-a-a-a-a
        -a-a-a-a-
        a-a-a-a-a
        -a-a-a-a-
        a-a-a-a-a
        -a-a-a-a-
        a-a-a-a-a
        -a-a-a-a-
        a-a-a-a-a
    `,
    buffer: `
        a-a-a-a-a
        -a-a-a-a-
        a-a-a-a-a
        -a-----a-
        a-a---a-a
        -a-----a-
        a-a-a-a-a
        -a-a-a-a-
        a-a-a-a-a
    `,
    split_left_right: `
        a-------a
        ---------
        ---------
        --x---x--
        -x-----x-
        --x---x--
        ---------
        ---------
        a-------a
    `,
}
imgs_['split_up_down'] = imgs_.block
imgs_['mix_to_left'] = imgs_.block
imgs_['mix_to_right'] = imgs_.block
imgs_['mix_to_up'] = imgs_.block
imgs_['mix_to_down'] = imgs_.block


const translate = {
    '-': 0.5,
    'x': 1.0,
    'a': 0.0,
    '0': 0.0,
    '1': 1.0,
    '2': 0.5,
    '3': 0.75,
}
// const arrow_up = `
//     0-------0
//     0-------0
//     0-------0
//     0-------0
//     0---x---0
//     0-------0
//     0-------0
//     0-------0
//     0-------0
// `
const arrow_up = `
    0xxxxxxx0
    0xxxxxxx0
    0xxxxxxx0
    0xxxxxxx0
    0xxx-xxx0
    0xxxxxxx0
    0xxxxxxx0
    0xxxxxxx0
    0xxxxxxx0
`
const arrow_down = arrow_up
// const arrow_left = `
//     000000000
//     ---------
//     ---------
//     ---------
//     ----x----
//     ---------
//     ---------
//     ---------
//     000000000
// `
const arrow_left = `
    000000000
    xxxxxxxxx
    xxxxxxxxx
    xxxxxxxxx
    xxxx-xxxx
    xxxxxxxxx
    xxxxxxxxx
    xxxxxxxxx
    000000000
`
const arrow_right = arrow_left
const d2l = `
    000000000
    --------0
    --------0
    --------0
    xxxxx---0
    ----x---0
    ----x---0
    ---xxx--0
    0--xxx--0
`
const d2r = `
    000000000
    0--------
    0--------
    0--------
    0---xxxxx
    0---x----
    0---x----
    0--xxx---
    0--xxx--0
`
const r2u = `
    0---x---0
    0---x----
    0---x----
    0---x--xx
    0---xxxxx
    0------xx
    0--------
    0--------
    000000000
`
const d2l_ = `
    000000000
    ---------
    ---------
    ---------
    xxxxx---x
    ----x----
    ----x----
    ---xxx---
    0--xxx--0
`
const d2r_ = `
    000000000
    ---------
    ---------
    ---------
    x---xxxxx
    ----x----
    ----x----
    ---xxx---
    0--xxx--0
`
const d2u = `
    0---x---0
    0---x---0
    0---x---0
    0---x---0
    0---x---0
    0---x---0
    ----x----
    ---xxx---
    ---xxx---
`
const r2l = `
    0000000--
    ---------
    ---------
    -------xx
    xxxxxxxxx
    -------xx
    ---------
    ---------
    0000000--
`
const l2u = `
    0---x---0
    ----x---0
    ----x---0
    xx--x---0
    xxxxx---0
    xx------0
    --------0
    --------0
    000000000
`
const l2d = `
    000000000
    --------0
    --------0
    xx------0
    xxxxx---0
    xx--x---0
    ----x---0
    ----x---0
    0---x---0
`
const d2lr = `
    000000000
    ---------
    ---------
    ---------
    xxxxxxxxx
    ----x----
    ----x----
    ---xxx---
    0--xxx--0
`
const l2r = `
    --0000000
    ---------
    ---------
    xx-------
    xxxxxxxxx
    xx-------
    ---------
    ---------
    --0000000
`
const ld2r = `
    000000000
    ---------
    ---------
    xx-------
    xxxxxxxxx
    xx--x----
    ----x----
    ---xxx---
    0--xxx--0
`
const r1l = `
    0000000--
    ---------
    ---------
    -------xx
    x-x-x-xxx
    -------xx
    ---------
    ---------
    0000000--
`
const u1d = `
    ---xxx---
    ---xxx---
    ----x----
    ---------
    ----x----
    ---------
    ----x----
    ---------
    ----x----
`


const imgs = [
    imgs_.void.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
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
    arrow_up.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    arrow_down.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    arrow_left.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    arrow_right.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    d2l.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    r2u.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    d2r.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    d2l_.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    d2r_.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    d2u.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    r2l.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    l2u.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    l2d.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    d2lr.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    l2r.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    ld2r.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    r1l.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    u1d.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.buffer.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.buffer.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.buffer.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.buffer.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.buffer.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.buffer.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.buffer.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.buffer.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.buffer.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.buffer.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.buffer.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
    imgs_.buffer.replaceAll(" ", "").replaceAll("\n", "").split("").map(a => translate[a]),
]


export {
    imgs,
    arrow_up,
}
