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
let midi = null;


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
    context.node_ids_by_coords[[x,y]] = name
    if (kind == "osc2") {
        context.node_ids_by_coords[[x+1,y]] = name + "/2"
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
    if (kind == "osc2") {
        width = 220
    }
    document.body.insertAdjacentHTML('beforeend', `
        <div id="${name}" class="node" style="
            position: absolute;
            top: ${y*120 + 20}px;
            left: ${x*120 + 20}px;
            width: ${width}px;
            height: 100px;
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
            const l_gain = node.get_freq(current_time)
            document.getElementById(`${k}.lf`).innerHTML = l_gain.toFixed(2)
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
        w.a = w.a * roll
    } else if (w.kind == "osc2/2") {
        n[w.ref].f2 = n[w.ref].f2 * roll
    } else if (w.kind == "gain") {
        w.gain = w.gain * roll
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
        w.a = w.a / roll
    } else if (w.kind == "osc2/2") {
        n[w.ref].f2 = n[w.ref].f2 / roll
    } else if (w.kind == "gain") {
        w.gain = w.gain / roll
    }
}

const set_value = (x, y, value) => {
    const nid = context.node_ids_by_coords[[x-1,y-1]]
    const w = n[nid]
    if (! w) {
        console.error(`set_value - invalid nid: ${nid}`)
        return
    }
    if (w.kind == "osc2") {
        w.f1 = value / (128*128-1) * 10000
    } else if (w.kind == "shaper") {
        w.a = value / (128*128-1) * 100
    } else if (w.kind == "osc2/2") {
        n[w.ref].f2 = value / (128*128-1) * 10000
    } else if (w.kind == "gain") {
        // w.gain = w.gain / roll
    }
}

const test_1 = async () => {
    await sleep(100)
    set_focus("o5")
    roll_up("o5")
    roll_up("s1")
    roll_up_2(2,0)
    // set_value(2,0, 10)
    // roll_up("s1")
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
    add_node(6, 1, "o1", "osc", "sine", 55*4)
    add_node(7, 1, "g1", "gain", 0)
    add_node(5, 2, "o2", "osc", "sine", 55)
    add_node(5, 1, "g2", "gain", 1200/2)
    // add_node(6, 1, "o3", "osc", "sin", 55*2)
    add_node(1, 2, "c1", "clock", 60)
    add_node(1, 0, "m1", "clock_mult", 2)
    add_node(2, 0, "s1", "shaper", 26)
    add_node(3, 0, "s2", "shaper", 2.5)

    add_node(2, 3, "o4", "osc", "sine", 55*2)
    add_node(3, 3, "g4", "gain", 20)


    add_node(2, 1, "o5", "osc2", "sine", 40, 55*5)
    add_node(4, 1, "g5", "gain", 20)


    add_node(1, 4, "gf1", "gain", 0.05)
    add_node(2, 4, "gf2", "gain", 1)
    add_node(3, 4, "gf3", "gain", 1)
    add_node(4, 4, "gf4", "gain", 1)
    add_node(5, 4, "gf5", "gain", 0.05)
    add_node(6, 4, "gf6", "gain", 1)
    add_node(7, 4, "gf7", "gain", 1)
    add_node(8, 4, "gf8", "gain", 1)
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
    // connect("s1", "g4")
    connect("s2", "g5")
    connect("g4", "gf4")
    connect("s1", "o5")
    connect("o5", "g5")
    connect("g5", "gf5")
    // connect("gf4", "gA")
    connect("gf5", "gA")


    document.addEventListener('keydown', function(event) {
        context.keydowns.add(event.key)
    });
    document.addEventListener('keyup', function(event) {
        context.keydowns.delete(event.key)
    });
    start_midi()
    draw()
    process_keys()
    test_1()
}

const test_usb = async () => {
    const aa = navigator.usb.getDevices()
    console.log(aa)
    const bb = await aa
    console.log(bb)
    // navigator.usb.getDevices().then((devices) => {
    //   devices.forEach((device) => {
    //     console.log(device.productName); // "Arduino Micro"
    //     console.log(device.manufacturerName); // "Arduino LLC"
    //   });
    // });
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
    function onMIDISuccess(midiAccess) {
        // console.log(midiAccess.outputs);
        // for (const element of midiAccess.outputs) {
        //     console.log(element)
        // }
        // const oo = midiAccess.outputs.get("-631276577");
        // oo.send([176,1,118]);
        // const oo2 = midiAccess.outputs.get("967857578");
        // oo2.send([176,1,118]);
        console.log("MIDI ready!");
        midi = midiAccess;
        startLoggingMIDIInput(midiAccess)
    }
    function onMIDIFailure(msg) {
        console.error(`Failed to get MIDI access - ${msg}`);
    }
    function onMIDIMessage(event) {
        // let str = `MIDI message received at timestamp ${event.timeStamp.toFixed(2)}[${event.data.length} bytes]: `;
        // for (const character of event.data) {
        //     // str += `0x${character.toString(16)} `;
        //     str += `${character} `;
        // }
        // console.log(str)
        const column = event.data[0] - 175
        const row = event.data[1] % 32
        const part = parseInt(event.data[1] / 32)
        const value = event.data[2]
        // console.log(row, column, part, value);
        if (part === 0) {
            context.midi_values[[row, column, part]] = value * 128
            context.midi_values[[row, column, 1]] = null
        } else {
            context.midi_values[[row, column, part]] = value
        }
        if (context.midi_values[[row, column, 1]] !== null) {
            // const previous_value = context.midi_values[[row, column, 2]]
            context.midi_values[[row, column, 2]] = context.midi_values[[row, column, 0]] + context.midi_values[[row, column, 1]]
            // console.log(row, column, context.midi_values[[row, column, 2]])
            // if (previous_value !== null && previous_value < context.midi_values[[row, column, 2]]) {
            //     roll_up_2(row-1, column-1)
            // } else if (previous_value !== null && previous_value > context.midi_values[[row, column, 2]]) {
            //     roll_down_2(row-1, column-1)
            // }
            set_value(row, column, context.midi_values[[row, column, 2]])
        }
        
    }
    function startLoggingMIDIInput(midiAccess) {
        midiAccess.inputs.forEach((entry) => {
            entry.onmidimessage = onMIDIMessage;
        });
    }
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

// test_usb()
main()
