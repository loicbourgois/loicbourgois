const patch_10 = (add_node, connect) => {
    add_node(3, 5, "gA", "gain", 1)
    add_node(6, 5, "gD", "gain", 0.05)
    add_node(0, 3, "gf1", "gain", 0.05)
    add_node(1, 3, "gf2", "gain", 0.05)
    add_node(2, 3, "gf3", "gain", 0.05)
    add_node(3, 3, "gf4", "gain", 0.05)
    add_node(4, 3, "gf5", "gain", 0.05)
    add_node(5, 3, "gf6", "gain", 0.05)
    add_node(6, 3, "gf7", "gain", 0.05)
    add_node(7, 3, "gf8", "gain", 0.05)
    add_node(5, 0, "o3", "osc", "sine", 719.15)
    add_node(5, 1, "g3", "gain", 91.53)
    add_node(4, 0, "o2", "osc", "sine", 669.95)
    add_node(3, 0, "g2", "gain", 6000)
    add_node(4, 1, "o1", "osc", "sine", 194.22)
    add_node(3, 2, "g1", "gain", 51.36815294527349)
    add_node(3, 1, "s8", "shaper", 7.4062359698167153)
    add_node(2, 2, "m3", "clock_mult", 3)
    add_node(2, 0, "c1", "clock", 138)
    add_node(0, 0, "k1", "kick")
    add_node(4, 2, "d", "delay", 0.02)
    
    add_node(5, 2, "g8", "gain", 0.8)

    add_node(6, 0, "k2", "kick")

    connect("c1", "k1/m")
    connect("c1", "k2/m")
    connect("k1/g", "gf2")
    // connect("k2/g", "gf8")
    connect("o1", "g1")
    connect("g1", "gf4")
    connect("gf8", "gA")
    connect("o2", "g2")
    connect("gA", "gD")
    connect("g2", "o1.detune")
    connect("c1", "m3")
    connect("m3", "s8")
    connect("s8", "g2")
    connect("s8", "g1")
    connect("o3", "g3")
    connect("g3", "o2.detune")
    connect("gf2", "gA")
    connect("gf3", "gA")
    connect("gf4", "gA")
    connect("gf5", "gA")
    connect("gf6", "gA")

    connect("g1", "d")
    connect("d", "gf5")

    connect("d", "gf5")
    connect("d", "g8")

    connect("g8", "d")
}

export {
    patch_10
}