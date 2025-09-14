const patch_04 = (add_node, connect) => {
    add_node(3, 5, "gA", "gain", 0.05)
    add_node(6, 5, "gD", "gain", 0.1)
    add_node(0, 3, "gm1", "gain", 0.5)
    add_node(1, 3, "gm2", "gain", 0.5)
    add_node(2, 3, "gm3", "gain", 0.5)
    add_node(3, 3, "gm4", "gain", 0.5)
    add_node(4, 3, "gm5", "gain", 0.5)
    add_node(5, 3, "gm6", "gain", 0.5)
    add_node(6, 3, "gm7", "gain", 0.5)
    add_node(7, 3, "gm8", "gain", 0.5)
    const c = 8
    const s = 0
    for (let i = s; i < c+s; i++) {
        const oid = `o${i+1}`;
        const gid = `g${i+1}`;
        const ggid = `gg${i+1}`;
        const gmid = `gm${i+1}`;
        const freq = 40*(i+1)
        const gain = 1*(i+1)
        const ggain = 1/gain/2
        add_node(i, 0, oid, "osc", "sine", freq)
        add_node(i, 1, gid, "gain", gain)
        add_node(i, 2, ggid, "gain", ggain)
        connect(oid, gid)
        connect(gid, ggid)
        connect(ggid, gmid)
    }
    for (let i = s; i < c-1+s; i++) {
        const gid = `g${i+1}`;
        const oid2 = `o${i+2}.detune`;
        const oid = `o${i+1}`;
        const gid2 = `g${i+2}`;
        const gidg = `g${i+1}.gain`;
        connect(gid, oid2)
        connect(gid2, gidg)
        connect(oid, gid2)
    }

    // add_node(0, 0, "o1", "osc", "sine", 1.7480197219711617)
    // add_node(0, 1, "g1", "gain", 11247.877154035854)
    // add_node(1, 0, "o2", "osc", "sine", 6.44820972005019)
    // add_node(1, 1, "g2", "gain", 1.259429670806432)
    // add_node(2, 0, "o3", "osc", "sine", 17.39323106438967)
    // add_node(2, 1, "g3", "gain", 2.746159741940098)
    // add_node(3, 0, "o4", "osc", "sine", 1.5859620120613287)
    // add_node(3, 1, "g4", "gain", 1318.5343242933818)
    // add_node(4, 0, "o5", "osc", "sine", 232.23469722654883)
    // add_node(4, 1, "g5", "gain", 64.23216240074295)
    // add_node(5, 0, "o6", "osc", "sine", 59.71975974133895)
    // add_node(5, 1, "g6", "gain", 467.5633489326785)
    // add_node(6, 0, "o7", "osc", "sine", 961.2652178686754)
    // add_node(6, 1, "g7", "gain", 377.99183179533185)
    // add_node(7, 0, "o8", "osc", "sine", 1770.5241330045562)
    // add_node(7, 1, "g8", "gain", 3.321237874795716)

    // connect("g3", "g4.gain")
    // connect("o4", "g4")
    // connect("o3", "g3")
    // connect("g4", "g5.gain")
    // connect("g1", "o2.detune")
    // connect("g2", "o3.detune")

    // connect("o1", "g1")
    // connect("o2", "g2")

    // connect("g1", "gm1")
    // connect("g2", "gm2")
    // connect("g3", "gm3")
    // connect("g4", "gm4")
    // connect("g5", "gm5")
    // connect("g6", "gm6")
    // connect("g7", "gm7")
    // connect("g8", "gm8")

    connect("gm1", "gA")
    connect("gm2", "gA")
    connect("gm3", "gA")
    connect("gm4", "gA")
    connect("gm5", "gA")
    connect("gm6", "gA")
    connect("gm7", "gA")
    connect("gm8", "gA")
    connect("gA", "gD")
    // connect("o8", "g8")
    // connect("o7", "g7")
    // connect("g7", "o8.detune")
    // connect("o6", "g6")
    // connect("g6", "o8.detune")
    // connect("o5", "g5")
    // connect("g5", "o6.detune")
}

export {
    patch_04
}