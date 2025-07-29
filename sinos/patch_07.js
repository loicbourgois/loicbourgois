const patch_07 = (add_node, connect) => {
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
    patch_07
}