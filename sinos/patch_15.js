const patch_14 = (add_node, connect) => {
    add_node(0, 0, `o1`, `osc`, `sine`, 0.92)
    add_node(1, 0, `o2g`, `gain`, 699)
    add_node(2, 0, `o2`, `osc`, `sine`, 3.54)
    add_node(0, 2, `o1g`, `gain`, 12.16)
    add_node(2, 4, `gA`, `gain`, 0.01)
    add_node(5, 4, `gD`, `gain`, 1.1)
    
    add_node(3, 1, 'h1', 'filter', 'highpass', 51.69)
    add_node(4, 1, 'l1', 'filter', 'lowpass', 198.93)
    add_node(5, 1, 'l2', 'filter', 'lowpass', 218.77)
    add_node(6, 1, 'l3', 'filter', 'lowpass', 209.50)

    add_node(5, 2, `g5`, `gain`, 4.76)
    add_node(6, 2, `g3`, `gain`, 10.53)

    add_node(2, 3, 'h2', 'filter', 'highpass', 130.72)
    
    connect(`o1`, `o1g`)
    connect(`o2`, `o2g`)
    connect(`o2g`, `o1.detune`)
    connect(`o1g`, `l3.frequency`)
    connect(`l1`, `l2`)
    connect(`l3`, `g3`)
    connect(`l2`, `l3`)
    connect(`l2`, `g5`)
    connect(`h1`, `l1`)
    connect(`g5`, `h2`)
    connect(`g3`, `h2`)
    connect(`h2`, `gA`)
}


export {
    patch_14
}
