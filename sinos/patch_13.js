const patch_13 = (add_node, connect) => {
    add_node(2, 4, `gA`, `gain`, 1)
    add_node(5, 4, `gD`, `gain`, 0.15)
    // connect(`gA`, `gD`)
    const l8 = `01234567`
    const i8 = []
    for (const l of l8) {
        i8.push(parseInt(l))
    }
    for (const i of i8) {
        add_node(i, 3, `gf${i}`, `gain`, 1.0)
        connect(`gf${i}`, `gA`)
    }
    
    add_node(0, 0, `m2`, `osc`, `sine`, 6000)
    add_node(0, 1, `g2`, `gain`, 5000)
    add_node(1, 1, `o2`, `osc`, `sine`, 194)
    add_node(1, 0, `g3`, `gain`, 5000)
   
    connect(`m2`, `g2`)
    connect(`g2`, `o2.detune`)
    // connect(`o2`, `gf2`)

    connect(`o2`, `g3`)
    connect(`g3`, `m2.detune`)

    
    add_node(4, 1, 'l1', 'filter', 'lowpass', 100)
    add_node(5, 1, 'l2', 'filter', 'lowpass', 50)
    add_node(3, 1, 'h1', 'filter', 'highpass', 100)

    add_node(4, 2, `g4`, `gain`, 1)
    add_node(5, 2, `g5`, `gain`, 30)

    connect(`o2`, `h1`)
    connect(`l1`, `l2`)
    connect(`l1`, `g4`)
    connect(`l2`, `g5`)
    // connect(`l2`, `h1`)
    connect(`h1`, `l1`)
    connect(`g4`, `gf4`)
    connect(`g5`, `gf5`)

    // const biquadFilter = audioCtx.createBiquadFilter();

    // // Configure it as a low-pass filter
    // biquadFilter.type = 'lowpass';

    // // Set filter parameters
    // biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime); // Cutoff frequency in Hz
    // biquadFilter.Q.setValueAtTime(1, audioCtx.currentTime);    
}


export {
    patch_13
}
