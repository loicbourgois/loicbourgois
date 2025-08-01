const patch_08 = (add_node, connect) => {
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
add_node(0, 0, "o1", "osc", "sine", 8.39619780537622)
add_node(0, 1, "g1", "gain", 2329.525451061986)
add_node(0, 2, "gg1", "gain", 0.0003230870929733213)
add_node(1, 0, "o2", "osc", "sine", 67.52178072917444)
add_node(1, 1, "g2", "gain", 1130.2864075991033)
add_node(1, 2, "gg2", "gain", 0.0004166666666666667)
add_node(2, 0, "o3", "osc", "sine", 259.968553855972)
add_node(2, 1, "g3", "gain", 1200)
add_node(2, 2, "gg3", "gain", 0.0004166666666666667)
add_node(3, 0, "o4", "osc", "sine", 11.493157949598459)
add_node(3, 1, "g4", "gain", 1200)
add_node(3, 2, "gg4", "gain", 0.0004166666666666667)
add_node(4, 0, "o5", "osc", "sine", 0.09278140662204211)
add_node(4, 1, "g5", "gain", 1200)
add_node(4, 2, "gg5", "gain", 0.0004166666666666667)
add_node(5, 0, "o6", "osc", "sine", 0.530419556695814)
add_node(5, 1, "g6", "gain", 1200)
add_node(5, 2, "gg6", "gain", 0.0004166666666666667)
add_node(6, 0, "o7", "osc", "sine", 127.32693174555332)
add_node(6, 1, "g7", "gain", 1200)
add_node(6, 2, "gg7", "gain", 0.0007104890127511394)
add_node(7, 0, "o8", "osc", "sine", 501.2974972749313)
add_node(7, 1, "g8", "gain", 1200)
add_node(7, 2, "gg8", "gain", 0.03840668039790964)
    // add_node(3, 5, "gA", "gain", 0.05)
    // add_node(6, 5, "gD", "gain", 0.1)
    // add_node(0, 3, "gm1", "gain", 0.5)
    // add_node(1, 3, "gm2", "gain", 0.5)
    // add_node(2, 3, "gm3", "gain", 0.5)
    // add_node(3, 3, "gm4", "gain", 0.5)
    // add_node(4, 3, "gm5", "gain", 0.5)
    // add_node(5, 3, "gm6", "gain", 0.5)
    // add_node(6, 3, "gm7", "gain", 0.5)
    // add_node(7, 3, "gm8", "gain", 0.5)
    const c = 8
    const s = 0
    for (let i = s; i < c+s; i++) {
        const oid = `o${i+1}`;
        const gid = `g${i+1}`;
        const ggid = `gg${i+1}`;
        const gmid = `gm${i+1}`;
        const freq = 40*(i+1)
        const gain = 1200
        const ggain = 1/gain/2
        // add_node(i, 0, oid, "osc", "sine", freq)
        // add_node(i, 1, gid, "gain", gain)
        // add_node(i, 2, ggid, "gain", ggain)
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
        // connect(gid2, gidg)
        connect(oid, gid2)
    }
    connect("gm1", "gA")
    connect("gm2", "gA")
    connect("gm3", "gA")
    connect("gm4", "gA")
    connect("gm5", "gA")
    connect("gm6", "gA")
    connect("gm7", "gA")
    connect("gm8", "gA")
    connect("gA", "gD")
}

export {
    patch_08
}
