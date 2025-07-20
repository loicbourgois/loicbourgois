import { 
    resize_to_window,
    resize,
    // line,
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
    // console.log(n[id_a].kind)
    if (n[id_a] && n[id_a].kind == "clock" && n[id_b].kind == "clock_mult") {
        n[id_b].get_value = (time) => {
            return (n[id_a].get_value(time) * n[id_b].mult) % 1
        }
    } else {
        todos.push(() => {
            if (b_field) {
                n[id_a].connect(n[id_b][b_field])
            } else {
                n[id_a].connect(n[id_b])
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


const add_node = (x, y, name, kind, a, b) => {
    if (kind == "clock") {
        n[name] = {
            kind: kind,
            get_value: (current_time) => {
                return (current_time / n[name].bpm * 60) % 1
            }
        } 
    } else if (kind == "clock_mult") {
        n[name] = {
            kind: kind,
            get_value: (current_time) => {
                return (current_time  / n[name].bpm / 60) % 1
            }
        } 
    } else {
        todos.push(() => {
            n[name] = get_new_node(kind, a, b)
        })
    }
    let node_fields = ""
    if (kind == "gain") {
        node_fields = `
            <div>
                <span>gain:</span>
                <span id="${name}.gain">${a}</span>
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
    } else if (kind == "clock") { 
        node_fields = `
            <div>
                <span>bpm:</span>
                <span id="${name}.bpm">${a}</span>
            </div>
            <div>
                <span>value:</span>
                <span id="${name}.value">0</span>
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
                <span>value:</span>
                <span id="${name}.value">0</span>
            </div>
            <canvas  id="${name}.canvas" class="clock_mult_canvas"></canvas>
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
        n[name].bpm = a
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
            continue
        } else {
            barHeight = data_2[i];
        }
        ctx.fillStyle = `rgb(${barHeight + 100} 50 50)`;
        ctx.fillRect(i, HEIGHT - barHeight / 2, 1, barHeight);
    }
    for (const l of lines) {
        line_simple(ctx, l.p1, l.p2, l.color, 2)
    }
    for (const e of document.getElementsByClassName('clock_canvas')) {
        e.width = 100
        e.height = 100
        const n_id = e.id.split(".")[0]
        clear(n[n_id].context)
        line_simple(n[n_id].context, {x:0,y:0}, {x:100,y:100}, "#ddd", 2)
        const ii = n[n_id].get_value(current_time)
        document.getElementById(`${n_id}.value`).innerHTML = ii.toFixed(2)
        for (let i = 0; i < 100; i++) {
            if (i > ii*100) {
                line_simple(n[n_id].context, {x:i,y:100}, {x:i,y:i}, "#ddd", 2)
            }
        }
    }
    for (const e of document.getElementsByClassName('clock_mult_canvas')) {
        e.width = 100
        e.height = 100
        const n_id = e.id.split(".")[0]
        clear(n[n_id].context)
        line_simple(n[n_id].context, {x:0,y:0}, {x:100,y:100}, "#ddd", 2)
        const uu = 60 / n[n_id].get_value()
        const ii = (current_time  / uu) % 1
        document.getElementById(`${n_id}.value`).innerHTML = ii.toFixed(2)
        for (let i = 0; i < 100; i++) {
            if (i > ii*100) {
                line_simple(n[n_id].context, {x:i,y:100}, {x:i,y:i}, "#ddd", 2)
            }
        }
    }
    requestAnimationFrame(draw);
}


const sleep = ms => new Promise(r => setTimeout(r, ms));


const start = async () => {
    audio_context = new AudioContext();
    analyser = audio_context.createAnalyser();
    analyser.fftSize = 2048*8*2;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    while (todos.length) {
        const f = todos.shift()
        f()
    }
    n.gA.connect(analyser);
    n.gD.connect(audio_context.destination);
    n.gA.gain.setValueCurveAtTime([0.0, 1], audio_context.currentTime, 0.1);
    // n.gD.gain.setValueCurveAtTime([0.0, 0.005], audio_context.currentTime, 0.1);
}

document.body.addEventListener("click", () => {
    start()
})

const main = () => {
    const canvas = document.getElementById("canvas")
    resize(canvas, window.innerWidth, window.innerHeight)
    ctx = canvas.getContext("2d");
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    dataArray = new Uint8Array(0);
    add_node(8, 0, "gA", "gain", 0)
    add_node(9, 0, "gD", "gain", 0)
    add_node(6, 0, "o1", "osc", "sin", 55*4)
    add_node(4, 0, "o2", "osc", "sin", 55/20)
    add_node(4, 1, "g2", "gain", 1200/2)
    add_node(6, 1, "o3", "osc", "sin", 55*2)
    add_node(0, 0, "c1", "clock", 25)
    add_node(1, 0, "m1", "clock_mult", 4)
    connect("o1", "gA")
    connect("o2", "g2")
    connect("gA", "gD")
    connect("g2", "o1.detune")
    connect("c1", "m1")
    draw()
}

main()
