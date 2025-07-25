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
let freqs_context
let WIDTH
let HEIGHT
const lines = []
const todos = []
const context = {
    focused: new Set(),
    keydowns: new Set(),
    node_ids_by_coords: {},
    midi_values: {},
}
// let midi = null;


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
    } else if (n[id_a] && (n[id_a].kind == "clock_mult" ||  n[id_a].kind=="clock") && n[id_b].kind == "shaper") {
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
            try {
                if (b_field) {
                    n[id_a].node.connect(n[id_b].node[b_field])
                } else {
                    n[id_a].node.connect(n[id_b].node)
                }
            } catch (error) {
                console.log(id_a, id_b, b_field)
                console.log(n[id_a])
                console.log(n[id_b])
                throw error
            }
        })
    }
    const ea = document.getElementById(id_a)
    const eb = document.getElementById(id_b)
    console.assert(ea, `invalid element: ${id_a}`)
    console.assert(eb, `invalid element: ${id_b}`)
    const pa = get_middle(ea) 
    const pb = get_middle(eb)
    lines.push({
        p1:pa,
        p2: pb,
        color: "#fff",
    })
}


const add_node = (x, y, name, kind, a, b, c) => {
    if (context.node_ids_by_coords[[x,y]]) {
        throw Error(`emplacement already used: ${x},${y} | ${context.node_ids_by_coords[[x,y]]} | ${name}`)
    }
    context.node_ids_by_coords[[x,y]] = name
    if (kind == "osc2") {
        context.node_ids_by_coords[[x,y+1]] = name + "/2"
        n[name + "/2"] = {
            ref: name,
            kind: "osc2/2",
        }
    }
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
            a:a,
            getx: (_) => {
                return 0
            },
            gety: (x) => {
                return Math.pow(1-x, n[name].a)
            }
        }
    } else if (kind == "gain") { 
        n[name] = {
            kind: kind,
            gain: a,
            get_gain: (t) => {
                return n[name].gain
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
    } else if (kind == "osc") { 
        n[name] = {
            kind: kind,
            freq: b,
            get_freq: (t) => {
                return n[name].freq
            }
        }
        todos.push(() => {
            n[name].node = get_new_node(kind, a, b)
        })
    } else {
        throw `not implemented: ${kind}`
    }
    let node_fields = ""
    if (kind == "gain") {
        node_fields = `
            <div>
                <span>gain:</span>
                <span id="${name}.gain">-</span>
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
                <span id="${name}.frequency">-</span>
            </div>
            <div>
                <span>l freq:</span>
                <span id="${name}.lf">-</span>
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
                <span id="${name}.f1">-</span>
            </div>
            <div>
                <span>f2:</span>
                <span id="${name}.f2">-</span>
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
                <span id="${name}.bpm">-</span>
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
                <span id="${name}.multiplier">-</span>
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
                <span>a:</span>
                <span id="${name}.a">-</span>
            </div>
            <div>
                <span>x:</span>
                <span id="${name}.x">-</span>
            </div>
            <div>
                <span>y:</span>
                <span id="${name}.y">-</span>
            </div>
            <canvas  id="${name}.canvas" class="shaper_canvas"></canvas>
        `
    } else {
        throw new Error(`invalid kind: ${kind}`);
    }
    let width = 100
    let height = 100
    if (kind == "osc2") {
        height = 220
    }
    document.body.insertAdjacentHTML('beforeend', `
        <div id="${name}" class="node" style="
            position: absolute;
            top: ${y*120 + 20}px;
            left: ${x*120 + 20}px;
            width: ${width}px;
            height: ${height}px;
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
    clear(freqs_context)
    for (let i = 0; i < WIDTH; i++) {
        if (data_2[i] === null) {
        } else {
            barHeight = data_2[i];
        }
        freqs_context.fillStyle = `rgb(${barHeight} ${barHeight/2} 0)`;
        freqs_context.fillRect(i, HEIGHT - barHeight, 1, barHeight);
    }
    for (const l of lines) {
        line_simple(freqs_context, l.p1, l.p2, l.color, 2)
    }
    for (const e of [
        ...document.getElementsByClassName('clock_canvas'), 
        ...document.getElementsByClassName('clock_mult_canvas'),
        ...document.getElementsByClassName('shaper_canvas'),
    ]) {
        e.width = 100
        e.height = 100
        const n_id = e.id.split(".")[0]
        const w = n[n_id]
        clear(w.context)
        const x = w.getx(current_time)
        const y = w.gety(x)
        document.getElementById(`${n_id}.x`).innerHTML = x.toFixed(2)
        document.getElementById(`${n_id}.y`).innerHTML = y.toFixed(2)
        for (let i = 0; i < 100; i++) {
            let j = 100 - w.gety(i/100)*100
            if (i > x*100) {
                line_simple(w.context, {x:i,y:100}, {x:i,y:j}, "#ddd", 2)
            } else {
                line_simple(w.context, {x:i,y:j+2}, {x:i,y:j}, "#ddd", 2)
            }
        }
        if (w.kind == "shaper") {
            document.getElementById(`${n_id}.a`).innerHTML = w.a.toFixed(2)
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
            document.getElementById(`${k}.gain`).innerHTML = node.gain.toFixed(2)
            if (audio_context) {
                for (let i = 0; i < resolution; i++) {
                    node.node.gain.linearRampToValueAtTime(node.get_gain(current_time + i*unit), current_time + i*unit);
                }
            }
        }
        if (node.kind == "osc2") {
            const lf = node.get_freq(current_time)
            document.getElementById(`${k}.lf`).innerHTML = lf.toFixed(2)
            document.getElementById(`${k}.f1`).innerHTML = node.f1.toFixed(2)
            document.getElementById(`${k}.f2`).innerHTML = node.f2.toFixed(2)
            if (audio_context) {
                for (let i = 0; i < resolution; i++) {
                    node.node.frequency.linearRampToValueAtTime(
                        node.get_freq(current_time + i*unit), current_time + i*unit
                    );
                }
            }
        }
        if (node.kind == "clock_mult") {
            document.getElementById(`${k}.multiplier`).innerHTML = node.mult.toFixed(2)
        }
        if (node.kind == "clock") {
            document.getElementById(`${k}.bpm`).innerHTML = node.bpm.toFixed(2)
        }
        if (node.kind == "osc") {
            const lf = node.get_freq(current_time)
            document.getElementById(`${k}.lf`).innerHTML = lf.toFixed(2)
            document.getElementById(`${k}.frequency`).innerHTML = node.freq.toFixed(2)
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
    analyser.fftSize = 2048*2;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    while (todos.length) {
        const f = todos.shift()
        f()
    }
    n.gA.node.connect(analyser);
    n.gD.node.connect(audio_context.destination);
}

let started = false

document.body.addEventListener("click", () => {
    if (!started) {
        start()
        started = true
    }
})

const set_focus = (eid) => {
    context.focused.add(eid)
    document.getElementById(eid).classList.add("focused")
}


const roll = 1.005


const roll_up_2 = (x,y) => {
    roll_up(context.node_ids_by_coords[[x,y]])
}


const roll_down_2 = (x,y) => {
    roll_down(context.node_ids_by_coords[[x,y]])
}


const roll_up = (nid) => {
    const w = n[nid]
    if (! w) {
        console.error(`roll_up - invalid nid: ${nid}`)
        return
    }
    if (w.kind == "osc2") {
        w.f1 = w.f1 * roll
    } else if (w.kind == "shaper") {
        w.a = w.a / roll
    } else if (w.kind == "osc2/2") {
        n[w.ref].f2 = n[w.ref].f2 * roll
    } else if (w.kind == "gain") {
        w.gain = w.gain * roll
    } else if (w.kind == "clock_mult") {
        w.mult = w.mult + 0.5
    } else if (w.kind == "clock") {
        w.bpm = w.bpm + 1
    } else if (w.kind == "osc") {
        w.freq = w.freq * roll
    } else {
        console.warn(`not implemented: ${w.kind}`)
    }
}

const roll_down = (nid) => {
    const w = n[nid]
    if (! w) {
        console.error(`roll_down - invalid nid: ${nid}`)
        return
    }
    if (w.kind == "osc2") {
        w.f1 = w.f1 / roll
    } else if (w.kind == "shaper") {
        w.a = w.a * roll
    } else if (w.kind == "osc2/2") {
        n[w.ref].f2 = n[w.ref].f2 / roll
    } else if (w.kind == "gain") {
        w.gain = w.gain / roll
    } else if (w.kind == "clock_mult") {
        w.mult = w.mult - 0.5
    } else if (w.kind == "clock") {
        w.bpm = w.bpm - 1.0
    } else if (w.kind == "osc") {
        w.freq = w.freq / roll
    } else {
        console.warn(`not implemented: ${w.kind}`)
    }
}

const test_1 = async () => {
    await sleep(100)
    set_focus("o5")
    roll_up("o5")
    roll_up("s1")
    roll_up_2(2,0)
}

const process_keys = () => {
    for (const k of context.keydowns) {
        if (k == "&") {
            roll_up_2(0,0)
        }
        if (k == "a") {
            roll_down_2(0,0)
        }
        if (k == "é") {
            roll_up_2(1,0)
        }
        if (k == "z") {
            roll_down_2(1,0)
        }
        if (k == "\"") {
            roll_up_2(2,0)
        }
        if (k == "e") {
            roll_down_2(2,0)
        }
        if (k == "'") {
            roll_up_2(3,0)
        }
        if (k == "r") {
            roll_down_2(3,0)
        }


        if (k == "q") {
            roll_up_2(0,1)
        }
        if (k == "w") {
            roll_down_2(0,1)
        }
        if (k == "s") {
            roll_up_2(1,1)
        }
        if (k == "x") {
            roll_down_2(1,1)
        }
        if (k == "d") {
            roll_up_2(2,1)
        }
        if (k == "c") {
            roll_down_2(2,1)
        }
        if (k == "f") {
            roll_up_2(3,1)
        }
        if (k == "v") {
            roll_down_2(3,1)
        }
        if (k == "g") {
            roll_up_2(4,1)
        }
        if (k == "b") {
            roll_down_2(4,1)
        }
    }
    setTimeout(process_keys, 0)
}

const main = async () => {
    const canvas = document.getElementById("canvas")
    resize(canvas, window.innerWidth, window.innerHeight)
    freqs_context = canvas.getContext("2d");
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    dataArray = new Uint8Array(0);
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


    add_node(4, 0, "o3", "osc", "sine", 719.15)
    add_node(4, 1, "g3", "gain", 91.53)
    add_node(5, 0, "o2", "osc", "sine", 669.95)
    add_node(5, 1, "g2", "gain", 1487.21)
    add_node(6, 0, "o1", "osc", "sine", 194.22)
    add_node(6, 1, "g1", "gain", 31.04)
    add_node(6, 2, "s8", "shaper", 3.78)

    add_node(5, 2, "m3", "clock_mult", 1.0)


    add_node(1, 0, "c1", "clock", 140)

    add_node(0, 1, "o5", "osc2", "sine", 40, 55*5)
    add_node(1, 2, "g5", "gain", 20)
    add_node(0, 0, "s1", "shaper", 26)
    add_node(1, 1, "s2", "shaper", 2.5)
    connect("g5", "gf2")



    add_node(2, 0, "m2", "clock_mult", -516.5)
    add_node(2, 1, "snare/s2", "shaper", 0.68)
    add_node(2, 2, "snare/g", "gain", 0.6)
    add_node(3, 0, "snare/s1", "shaper", 4.41)
    add_node(3, 1, "snare/o", "osc2", "sine", 770.76, 192.03)
    connect("m2", "snare/s1")
    connect("m2", "snare/s2")
    connect("snare/s1", "snare/o")
    connect("snare/s2", "snare/g")
    connect("snare/o", "snare/g")
    connect("snare/g", "gf3")


    connect("o1", "g1")
    connect("g1", "gf8")
    connect("gf8", "gA")
    connect("o2", "g2")
    connect("gA", "gD")
    connect("g2", "o1.detune")
    connect("c1", "m2")
    connect("c1", "s1")
    connect("c1", "s2")
    connect("c1", "m3")
    connect("m3", "s8")
    connect("s8", "g2")
    connect("s8", "g1")
    connect("s2", "g5")
    connect("s1", "o5")
    connect("o5", "g5")
    connect("o3", "g3")
    connect("g3", "o2.detune")
    connect("gf2", "gA")
    connect("gf3", "gA")
    connect("gf5", "gA")
    connect("gf6", "gA")


    document.addEventListener('keydown', function(event) {
        context.keydowns.add(event.key)
    });
    document.addEventListener('keyup', function(event) {
        context.keydowns.delete(event.key)
    });
    start_midi()
    draw()
    process_keys()
    // test_1()
}

const start_midi = () => {
    navigator.permissions.query({ name: "midi", sysex: true }).then((result) => {
        if (result.state === "granted") {
            console.log("granted")
        } else if (result.state === "prompt") {
            console.log("prompt")
        } else {
            console.log("error")
        }
    });
    const onMIDISuccess = async (midiAccess) => {
        console.log("MIDI ready!");
        // console.log(midiAccess.outputs);
        // for (const element of midiAccess.outputs) {
        //     console.log(element)
        // }
        const midi_output_id = "967857578"
        const midi_output = midiAccess.outputs.get(midi_output_id);
        console.assert(midi_output, `midi output not found: ${midi_output_id}`)
        midi_output.send([159,12,127]); // enable daw mode
        midi_output.send([182,69,127]); // switch relative mode on
        midi_output.send([182,72,127]); // switch relative mode on
        midi_output.send([182,73,127]); // switch relative mode on
        startLoggingMIDIInput(midiAccess)
    }
    function onMIDIFailure(msg) {
        console.error(`Failed to get MIDI access - ${msg}`);
    }
    function onMIDIMessage(event) {
        // console.log(event.data)
        const column = (event.data[1] - 77)%8
        const row = parseInt((event.data[1] - 77)/8)
        const value = event.data[2] - 64
        // console.log(column, row, value);
        for (let _ = 0; _ < Math.abs(value); _++) {
            if (value > 0) {
                roll_up_2(column, row)
            } else {
                roll_down_2(column, row)
            }
        }
    }
    function startLoggingMIDIInput(midiAccess) {
        midiAccess.inputs.forEach((entry) => {
            // console.log(entry)
            entry.onmidimessage = onMIDIMessage;
        });
    }
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}
main()
