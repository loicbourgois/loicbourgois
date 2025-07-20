import { 
    resize,
    line_simple,
    clear,
 } from "./canvas.js"

const n = {}
let audio_context = null
let analyser
let bufferLength
let dataArray
let ctx
let WIDTH
let HEIGHT
const lines = []
const todos = []


const get_new_node = (kind, a, b) => {
    if (kind == "gain") {
        const n = audio_context.createGain();
        n.gain.setValueAtTime(a, audio_context.currentTime);
        return n
    } else if (kind == "osc") {
        const n = audio_context.createOscillator();
        n.type = a;
        n.frequency.setValueAtTime(b, audio_context.currentTime);
        n.start()
        return n
    } else if (kind == "osc2") {
        const n = audio_context.createOscillator();
        n.type = a;
        n.frequency.setValueAtTime(b, audio_context.currentTime);
        n.start()
        return n
    } else if (kind == "clock") {
        // pass
    } else if (kind == "clock_mult") {
        // pass
    } else {
        throw `invalid kind: ${kind}`
    }
}


const get_middle = (e) => {
    const rect = e.getBoundingClientRect();
    const middleX = rect.left + rect.width / 2;
    const middleY = rect.top + rect.height / 2;
    return {x:middleX,y:middleY}
}


const connect = (a,b) => {
    const bs = b.split(".")
    let id_a = a
    let id_b = b
    let b_field = null
    if (bs.length == 2 && bs[1] == "detune") {
        id_b = bs[0]
        b_field = "detune"
    } else {
        // pass
    }
    if (n[id_a] && n[id_a].kind == "clock" && n[id_b].kind == "clock_mult") {
        n[id_b].getx = (time) => {
            return (n[id_a].getx(time) * n[id_b].mult) % 1
        }
    } else if (n[id_a] && n[id_a].kind == "clock_mult" && n[id_b].kind == "shaper") {
        n[id_b].getx = (time) => {
            return n[id_a].getx(time)
        }
    } else if (n[id_a] && n[id_a].kind == "shaper" && n[id_b].kind == "gain") {
        n[id_b].get_gain = (time) => {
            const x = n[id_a].getx(time)
            const y = n[id_a].gety(x)
            return n[id_b].gain * y
        }
    } else if (n[id_a] && n[id_a].kind == "shaper" && n[id_b].kind == "osc2") {
        n[id_b].get_freq = (time) => {
            const x = n[id_a].getx(time)
            const y = n[id_a].gety(x)
            return (n[id_b].f2 - n[id_b].f1) * y + n[id_b].f1
        }
    } else {
        todos.push(() => {
            if (b_field) {
                n[id_a].node.connect(n[id_b].node[b_field])
            } else {
                n[id_a].node.connect(n[id_b].node)
            }
        })
    }
    const ea = document.getElementById(id_a)
    const eb = document.getElementById(id_b)
    const pa = get_middle(ea) 
    const pb = get_middle(eb)
    lines.push({
        p1:pa,
        p2: pb,
        color: "#fff",
    })
}


const add_node = (x, y, name, kind, a, b, c) => {
    if (kind == "clock") {
        n[name] = {
            kind: kind,
            getx: (current_time) => {
                return (current_time * n[name].bpm / 60) % 1
            },
            gety: (x) => {
                return 1-x
            }
        } 
    } else if (kind == "clock_mult") {
        n[name] = {
            kind: kind,
            mult: a,
            getx: (_) => {
                return 0
            },
            gety: (x) => {
                return 1-x
            }
        } 
    } else if (kind == "shaper") {
        n[name] = {
            kind: kind,
            getx: (_) => {
                return 0
            },
            gety: (x) => {
                const aa = 1-x
                return Math.pow(aa, a)
            }
        }
    } else if (kind == "gain") { 
        n[name] = {
            kind: kind,
            gain: a,
            get_gain: (t) => {
                return a
            }
        }
        todos.push(() => {
            n[name].node = get_new_node(kind, a, b)
        })
    } else if (kind == "osc2") { 
        n[name] = {
            kind: kind,
            f1: b,
            f2: c,
            get_freq: (t) => {
                return b
            }
        }
        todos.push(() => {
            n[name].node = get_new_node(kind, a, b)
        })
    } else {
        n[name] = {
            kind: kind,
        }
        todos.push(() => {
            n[name].node = get_new_node(kind, a, b)
        })
    }
    let node_fields = ""
    if (kind == "gain") {
        node_fields = `
            <div>
                <span>gain:</span>
                <span id="${name}.gain">${a}</span>
            </div>
            <div>
                <span>l gain:</span>
                <span id="${name}.l_gain">-</span>
            </div>
        `
    } else if (kind == "osc") {
        node_fields = `
            <div>
                <span>type:</span>
                <span id="${name}.type">${a}</span>
            </div>
            <div>
                <span>freq:</span>
                <span id="${name}.frequency">${b}</span>
            </div>
        `
    } else if (kind == "osc2") {
        node_fields = `
            <div>
                <span>type:</span>
                <span id="${name}.type">${a}</span>
            </div>
            <div>
                <span>f1:</span>
                <span id="${name}.f1">${b}</span>
            </div>
            <div>
                <span>f2:</span>
                <span id="${name}.f2">${c}</span>
            </div>
            <div>
                <span>l freq:</span>
                <span id="${name}.lf">-</span>
            </div>
        `
    } else if (kind == "clock") { 
        node_fields = `
            <div>
                <span>bpm:</span>
                <span id="${name}.bpm">${a}</span>
            </div>
            <div>
                <span>x:</span>
                <span id="${name}.x">-</span>
            </div>
            <div>
                <span>y:</span>
                <span id="${name}.y">-</span>
            </div>
            <canvas  id="${name}.canvas" class="clock_canvas"></canvas>
        `
    } else if (kind == "clock_mult") { 
        node_fields = `
            <div>
                <span>mult:</span>
                <span id="${name}.multiplier">${a}</span>
            </div>
            <div>
                <span>x:</span>
                <span id="${name}.x">0</span>
            </div>
            <div>
                <span>y:</span>
                <span id="${name}.y">0</span>
            </div>
            <canvas  id="${name}.canvas" class="clock_mult_canvas"></canvas>
        `
    } else if (kind == "shaper") {
        node_fields = `
            <div>
                <span>x:</span>
                <span id="${name}.x">0</span>
            </div>
            <div>
                <span>y:</span>
                <span id="${name}.y">0</span>
            </div>
            <canvas  id="${name}.canvas" class="shaper_canvas"></canvas>
        `
    } else {
        throw new Error(`invalid kind: ${kind}`);
    }
    document.body.insertAdjacentHTML('beforeend', `
        <div id="${name}" class="node" style="
            position: absolute;
            top: ${y*120 + 20}px;
            left: ${x*120 + 20}px;
            width: 100px;
            height: 100px;
            background: #203;
        ">
            <div class="node_title">
                <span class="node_kind">${kind}</span>
                <span class="node_name">${name}</span>
            </div>
            <div class="node_fields">
                ${node_fields}
            </div>
        </div>
    `)
    if (kind == "clock") {
        n[name].canvas = document.getElementById(`${name}.canvas`)
        n[name].context = n[name].canvas.getContext("2d");
        n[name].bpm = a
    } else if (kind == "clock_mult") { 
        n[name].canvas = document.getElementById(`${name}.canvas`)
        n[name].context = n[name].canvas.getContext("2d");
    } else if (kind == "shaper") { 
        n[name].canvas = document.getElementById(`${name}.canvas`)
        n[name].context = n[name].canvas.getContext("2d");
    }
}


const draw = () => {
    let current_time = performance.now() / 1000
    if (audio_context) {
        analyser.getByteFrequencyData(dataArray);
        current_time = audio_context.currentTime
    }
    let data_2 = new Array(WIDTH).fill(null);
    let barHeight = 0;
    const max_left = bufferLength-1
    const max_right = WIDTH
    const aa = Math.log(max_right+1)
    const bb = max_right / aa
    for (let i = 0; i < bufferLength; i++) {
        const i2 = i / max_left * max_right
        const i3 = parseInt(Math.log(i2 + 1) * bb)
        data_2[i3] = Math.max(data_2[i3], dataArray[i])
    }
    clear(ctx)
    for (let i = 0; i < WIDTH; i++) {
        if (data_2[i] === null) {
        } else {
            barHeight = data_2[i];
        }
        ctx.fillStyle = `rgb(${barHeight} ${barHeight/2} 0)`;
        ctx.fillRect(i, HEIGHT - barHeight, 1, barHeight);
    }
    for (const l of lines) {
        line_simple(ctx, l.p1, l.p2, l.color, 2)
    }
    for (const e of [
        ...document.getElementsByClassName('clock_canvas'), 
        ...document.getElementsByClassName('clock_mult_canvas'),
        ...document.getElementsByClassName('shaper_canvas'),
    ]) {
        e.width = 100
        e.height = 100
        const n_id = e.id.split(".")[0]
        clear(n[n_id].context)
        const x = n[n_id].getx(current_time)
        const y = n[n_id].gety(x)
        document.getElementById(`${n_id}.x`).innerHTML = x.toFixed(2)
        document.getElementById(`${n_id}.y`).innerHTML = y.toFixed(2)
        for (let i = 0; i < 100; i++) {
            let j = 100 - n[n_id].gety(i/100)*100
            if (i > x*100) {
                line_simple(n[n_id].context, {x:i,y:100}, {x:i,y:j}, "#ddd", 2)
            } else {
                line_simple(n[n_id].context, {x:i,y:j+2}, {x:i,y:j}, "#ddd", 2)
            }
        }
    }
    const resolution = 20
    const duration = 1/60 * 3
    const unit = duration / resolution;
    for (const k in n) {
        const node = n[k];
        if (node.kind == "gain") {
            const l_gain = node.get_gain(current_time)
            document.getElementById(`${k}.l_gain`).innerHTML = l_gain.toFixed(2)
            if (audio_context) {
                for (let i = 0; i < resolution; i++) {
                    node.node.gain.linearRampToValueAtTime(node.get_gain(current_time + i*unit), current_time + i*unit);
                }
            }
        }
        if (node.kind == "osc2") {
            const l_gain = node.get_freq(current_time)
            document.getElementById(`${k}.lf`).innerHTML = l_gain.toFixed(2)
            if (audio_context) {
                for (let i = 0; i < resolution; i++) {
                    node.node.frequency.linearRampToValueAtTime(
                        node.get_freq(current_time + i*unit), current_time + i*unit
                    );
                }
            }
        }
    }
    requestAnimationFrame(draw);
}


const sleep = ms => new Promise(r => setTimeout(r, ms));


const start = async () => {
    audio_context = new AudioContext();
    analyser = audio_context.createAnalyser();
    analyser.fftSize = 2048*4;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    while (todos.length) {
        const f = todos.shift()
        f()
    }
    n.gA.node.connect(analyser);
    n.gD.node.connect(audio_context.destination);
    // n.gA.node.gain.setValueCurveAtTime([0.0, 1], audio_context.currentTime, 0.1);
    // n.gD.node.gain.setValueCurveAtTime([0.0, 0.005], audio_context.currentTime, 0.1);
}

let started = false

document.body.addEventListener("click", () => {
    if (!started) {
        start()
        started = true
    }
})

const main = () => {
    const canvas = document.getElementById("canvas")
    resize(canvas, window.innerWidth, window.innerHeight)
    ctx = canvas.getContext("2d");
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    dataArray = new Uint8Array(0);
    add_node(3, 5, "gA", "gain", 1)
    add_node(6, 5, "gD", "gain", 0.05)
    add_node(6, 0, "o1", "osc", "sine", 55*4)
    add_node(7, 0, "g1", "gain", 0)
    add_node(4, 0, "o2", "osc", "sine", 55)
    add_node(5, 0, "g2", "gain", 1200/2)
    // add_node(6, 1, "o3", "osc", "sin", 55*2)
    add_node(2, 0, "c1", "clock", 60)
    add_node(1, 0, "m1", "clock_mult", 2)
    add_node(1, 1, "s1", "shaper", 100)
    add_node(3, 1, "s2", "shaper", 3)

    add_node(2, 2, "o4", "osc", "sine", 55*2)
    add_node(3, 2, "g4", "gain", 20)


    add_node(5, 1, "o5", "osc2", "sine", 60, 55*5)
    add_node(5, 2, "g5", "gain", 20)


    add_node(1, 3, "gf1", "gain", 0.05)
    add_node(2, 3, "gf2", "gain", 1)
    add_node(3, 3, "gf3", "gain", 1)
    add_node(4, 3, "gf4", "gain", 1)
    add_node(5, 3, "gf5", "gain", 0.05)
    add_node(6, 3, "gf6", "gain", 1)
    add_node(7, 3, "gf7", "gain", 1)
    add_node(8, 3, "gf8", "gain", 1)
    // add_node(2, 2, "o4", "osc", "sin", 55*2)
    // add_node(2, 1, "g4", "gain", 20)
    connect("o1", "g1")
    connect("g1", "gf8")
    connect("gf8", "gA")
    connect("o2", "g2")
    connect("gA", "gD")
    connect("g2", "o1.detune")
    connect("c1", "m1")
    connect("m1", "s1")
    connect("m1", "s2")
    connect("o4", "g4")
    connect("s1", "g4")
    connect("s2", "g5")
    connect("g4", "gf4")
    connect("s1", "o5")
    connect("o5", "g5")
    connect("g5", "gf5")
    // connect("gf4", "gA")
    connect("gf5", "gA")
    draw()
}

main()
