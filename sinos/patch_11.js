const patch_11 = (add_node, connect) => {
    add_node(3, 5, "gA", "gain", 1)
    add_node(6, 5, "gD", "gain", 0.05)
    connect(`gA`, "gD")

    const l8 = "01234567"
    const i8 = []
    for (const l of l8) {
        i8.push(parseInt(l))
    }
    for (const i of i8) {
        add_node(i, 3, `gf${i}`, "gain", 0.1)
        connect(`gf${i}`, "gA")
        // add_node(i, 2, `o${i}`, "osc", "sine", 100)
    }



    add_node(1, 0, `m1`, "osc", "sine", 30)
    add_node(1, 1, `g1`, "gain", 1400)
    add_node(1, 2, `o1`, "osc", "sine", 50)

    add_node(2, 0, `m2`, "osc", "sine", 30)
    add_node(2, 1, `g2`, "gain", 1400)

    add_node(0, 0, `m0`, "osc", "sine", 30)
    add_node(0, 1, `g0`, "gain", 1400)
    
    connect("m1", "g1")
    connect("g1", "o1.detune")
    connect("o1", "gf1")

    connect("m2", "g2")
    connect("g2", "o1.detune")
    connect("g2", "m1.detune")
    connect("g1", "m2.detune")

    connect("m0", "g0")
    connect("g0", "o1.detune")
    connect("g0", "m1.detune")
    connect("g1", "m0.detune")








    add_node(4, 0, `m${4}`, "osc", "sine", 30)
    add_node(4, 1, `g${4}`, "gain", 1400)
    add_node(4, 2, `o${4}`, "osc", "sine", 50)
    
    connect("m4", "g4")
    connect("g4", "o4.detune")
    connect("o4", "gf4")


    add_node(5, 0, `m${5}`, "osc", "sine", 15)
    add_node(5, 1, `g${5}`, "gain", 45)
    // add_node(2, 2, `o${2}`, "osc", "sine", 100)


    connect("m5", "g5")
    connect("g5", "m4.detune")
    // connect("o2", "gf2")

    add_node(3, 0, `m${3}`, "osc", "sine", 15)
    add_node(3, 1, `g${3}`, "gain", 45)

    connect("m3", "g3")
    connect("g3", "g4.gain")

    connect("o4", "g3.gain")
    connect("o4", "g3")



    // add_node(0, 0, "k1", "kick")
    // add_node(0, 3, "gf1", "gain", 0.05)
    // add_node(1, 3, "gf2", "gain", 0.05)
    // add_node(2, 3, "gf3", "gain", 0.05)
    // add_node(3, 3, "gf4", "gain", 0.05)
    // add_node(4, 3, "gf5", "gain", 0.05)
    // add_node(5, 3, "gf6", "gain", 0.05)
    // add_node(6, 3, "gf7", "gain", 0.05)
    // add_node(7, 3, "gf8", "gain", 0.05)
    // add_node(5, 0, "o3", "osc", "sine", 719.15)
    // add_node(5, 1, "g3", "gain", 91.53)
    // add_node(4, 0, "o2", "osc", "sine", 669.95)
    // add_node(3, 0, "g2", "gain", 6000)
    // add_node(4, 1, "o1", "osc", "sine", 194.22)
    // add_node(3, 2, "g1", "gain", 51.36815294527349)
    // add_node(3, 1, "s8", "shaper", 7.4062359698167153)
    // add_node(2, 2, "m3", "clock_mult", 3)
    // add_node(2, 0, "c1", "clock", 138)
    // add_node(0, 0, "k1", "kick")
    // add_node(4, 2, "d", "delay", 0.02)
    // add_node(5, 2, "g8", "gain", 0.85)
    // add_node(6, 0, "k2", "kick")
    // connect("c1", "k1/m")
    // connect("c1", "k2/m")
    // connect("k1/g", "gf2")
    // connect("o1", "g1")
    // connect("g1", "gf4")
    // connect("gf8", "gA")
    // connect("o2", "g2")
    // connect("gA", "gD")
    // connect("g2", "o1.detune")
    // connect("c1", "m3")
    // connect("m3", "s8")
    // connect("s8", "g2")
    // connect("s8", "g1")
    // connect("o3", "g3")
    // connect("g3", "o2.detune")
    // connect("gf2", "gA")
    // connect("gf3", "gA")
    // connect("gf4", "gA")
    // connect("gf5", "gA")
    // connect("gf6", "gA")
    // connect("g1", "d")
    // connect("d", "gf5")
    // connect("d", "gf5")
    // connect("d", "g8")
    // connect("g8", "d")
}


export {
    patch_11
}
