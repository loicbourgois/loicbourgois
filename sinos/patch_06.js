const patch_06 = (add_node, connect) => {
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
add_node(0, 0, "o1", "osc", "sine", 0.11287695985052087)
add_node(0, 1, "g1", "gain", 4600.557152111067)
add_node(0, 2, "gg1", "gain", 0.0007564105845663078)
add_node(1, 0, "o2", "osc", "sine", 11.962458875256143)
add_node(1, 1, "g2", "gain", 9109.78867277754)
add_node(1, 2, "gg2", "gain", 0.0028509041296942896)
add_node(2, 0, "o3", "osc", "sine", 84.63634946236562)
add_node(2, 1, "g3", "gain", 1222.4347057217283)
add_node(2, 2, "gg3", "gain", 0.0028325415851306254)
add_node(3, 0, "o4", "osc", "sine", 7.6718067624054065)
add_node(3, 1, "g4", "gain", 262.6550800892735)
add_node(3, 2, "gg4", "gain", 0.02149266220105106)
add_node(4, 0, "o5", "osc", "sine", 247.83957244022216)
add_node(4, 1, "g5", "gain", 516.90107799522)
add_node(4, 2, "gg5", "gain", 0.009080803856792356)
add_node(5, 0, "o6", "osc", "sine", 16.56540812808495)
add_node(5, 1, "g6", "gain", 49.47609028808144)
add_node(5, 2, "gg6", "gain", 0.013699489949780945)
add_node(6, 0, "o7", "osc", "sine", 63.65575736387016)
add_node(6, 1, "g7", "gain", 18.421034705690236)
add_node(6, 2, "gg7", "gain", 0.018395142926164967)
add_node(7, 0, "o8", "osc", "sine", 11.549225165066064)
add_node(7, 1, "g8", "gain", 311.1568141871817)
add_node(7, 2, "gg8", "gain", 0.0013361228864113733)
    const c = 8
    const s = 0
    for (let i = s; i < c+s; i++) {
        const oid = `o${i+1}`;
        const gid = `g${i+1}`;
        const ggid = `gg${i+1}`;
        const gmid = `gm${i+1}`;
        const gain = 1*(i+1)
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
    patch_06
}