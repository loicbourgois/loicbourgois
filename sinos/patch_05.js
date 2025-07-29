const patch_05 = (add_node, connect) => {
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
add_node(0, 0, "o1", "osc", "sine", 268.8410496149889)
add_node(0, 1, "g1", "gain", 37.3732473518113)
add_node(0, 2, "gg1", "gain", 0.010168942052034792)
add_node(1, 0, "o2", "osc", "sine", 291.1387291465291)
add_node(1, 1, "g2", "gain", 207.79423335407785)
add_node(1, 2, "gg2", "gain", 0.005109893381147485)
add_node(2, 0, "o3", "osc", "sine", 27.692303941328678)
add_node(2, 1, "g3", "gain", 330.9157904781277)
add_node(2, 2, "gg3", "gain", 0.00549873142812771)
add_node(3, 0, "o4", "osc", "sine", 30.39)
add_node(3, 1, "g4", "gain", 497.326624450874)
add_node(3, 2, "gg4", "gain", 0.17286378864790497)
add_node(4, 0, "o5", "osc", "sine", 52.80700134226053)
add_node(4, 1, "g5", "gain", 516.90107799522)
add_node(4, 2, "gg5", "gain", 0.02888355349004101)
add_node(5, 0, "o6", "osc", "sine", 366.71315622299784)
add_node(5, 1, "g6", "gain", 56.32652763166919)
add_node(5, 2, "gg6", "gain", 0.006076259761631984)
add_node(6, 0, "o7", "osc", "sine", 532.8193617001781)
add_node(6, 1, "g7", "gain", 3.9841259704363607)
add_node(6, 2, "gg7", "gain", 0.01689974364157865)
add_node(7, 0, "o8", "osc", "sine", 9.181507803882875)
add_node(7, 1, "g8", "gain", 12.595099619032652)
add_node(7, 2, "gg8", "gain", 0.016584698859053684)
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
    patch_05
}