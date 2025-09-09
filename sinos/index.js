import { 
    resize,
    line_simple,
    clear,
} from "./canvas.js"
import {
    patch_01
} from "./patch_01.js"
import {
    patch_02
} from "./patch_02.js"
import {
    patch_03
} from "./patch_03.js"
import {
    patch_04
} from "./patch_04.js"
import {
    patch_05
} from "./patch_05.js"
import {
    patch_06
} from "./patch_06.js"
import {patch_07} from "./patch_07.js"
import {patch_08} from "./patch_08.js"
import {patch_09} from "./patch_09.js"
import {patch_10} from "./patch_10.js"
import {get_node_fields} from "./get_node_fields.js"
import {
    sleep
} from "./time.js"
import {
    get_middle
} from "./ui.js"


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
    node_name_evented: null,
}
const roll = 1.005


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
    } else if (kind == "delay") {
        const n = audio_context.createDelay(100);
        n.delayTime.setValueAtTime(a, audio_context.currentTime)
        return n
    } else {
        throw `get_new_node invalid kind: ${kind}`
    }
}


const connect = (a,b) => {
    const bs = b.split(".")
    let id_a = a
    let id_b = b
    let b_field = null
    if (bs.length == 2 && bs[1] == "detune") {
        id_b = bs[0]
        b_field = "detune"
    } else if (bs.length == 2 && bs[1] == "gain") {
        id_b = bs[0]
        b_field = "gain"
    } else {
        // pass
    }
    console.assert(n[id_a], `${id_a} not found`)
    console.assert(n[id_b], `${id_b} not found`)
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
    if (kind == "kick") {
        // pass
    } else { 
        context.node_ids_by_coords[[x,y]] = name
    }
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
            shape: a,
            get_freq: (t) => {
                return n[name].freq
            }
        }
        todos.push(() => {
            n[name].node = get_new_node(kind, a, b)
        })
    } else if (kind == "kick") { 
        add_node(x+0, y+1, name+"/o", "osc2", "sine", 38, 233)
        add_node(x+1, y+2, name+"/g", "gain", 202)
        add_node(x+0, y+0, name+"/s1", "shaper", 14)
        add_node(x+1, y+1, name+"/s2", "shaper", 5)
        add_node(x+1, y+0, name+"/m", "clock_mult", 1)
        connect(name+"/s2", name+"/g")
        connect(name+"/s1", name+"/o")
        connect(name+"/o", name+"/g")
        connect(name+"/m", name+"/s1")
        connect(name+"/m", name+"/s2")
        return
    } else if (kind == "delay") { 
        n[name] = {
            kind: kind,
            delay: a,
            get_delay: (t) => {
                return n[name].delay
            }
        }
        todos.push(() => {
            n[name].node = get_new_node(kind, a)
        })
    } else {
        throw `add_node not implemented: ${kind}`
    }
    n[name].coords = [x,y]
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
                ${get_node_fields(kind, name, a)}
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
    n[name].x = x
    n[name].y = y
    document.getElementById(name).addEventListener("mousedown", (e)=> {
        context.node_evented = {
            name: name,
            x: e.clientX,
            y: e.clientY,
        }
    })
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
        } else if (node.kind == "osc2") {
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
        } else if (node.kind == "clock_mult") {
            document.getElementById(`${k}.multiplier`).innerHTML = node.mult.toFixed(2)
        } else if (node.kind == "clock") {
            document.getElementById(`${k}.bpm`).innerHTML = node.bpm.toFixed(2)
        } else if (node.kind == "osc") {
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
        } else if (node.kind == "shaper") {
            document.getElementById(`${k}.a`).innerHTML = node.a.toFixed(2)
        } else if (node.kind == "osc2/2") {
            // pass
        } else if (node.kind == "delay") {
            if (audio_context) {
                node.node.delayTime.setValueAtTime(node.delay, audio_context.currentTime)
            }
            document.getElementById(`${k}.delay`).innerHTML = node.delay.toFixed(4)
        } else {
            throw `draw: kind not implemented: ${node.kind}`
        }
    }
    requestAnimationFrame(draw);
}

const set_focus = (eid) => {
    context.focused.add(eid)
    document.getElementById(eid).classList.add("focused")
}


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
        // w.mult = w.mult + 0.5
    } else if (w.kind == "clock") {
        w.bpm = w.bpm + 1
    } else if (w.kind == "osc") {
        w.freq = w.freq * roll
    } else if (w.kind == "delay") {
        w.delay = w.delay * roll
    } else {
        console.warn(`roll_up: not implemented: ${w.kind}`)
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
        // w.mult = w.mult - 0.5
    } else if (w.kind == "clock") {
        w.bpm = w.bpm - 1.0
    } else if (w.kind == "osc") {
        w.freq = w.freq / roll
    } else if (w.kind == "delay") {
        w.delay = w.delay / roll
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


const print_config = () => {
    let lines = []
    for (const k in n) {
        if (Object.prototype.hasOwnProperty.call(n, k)) {
            const e = n[k];
            if (e.kind == 'osc') {
                lines.push(`add_node(${e.x}, ${e.y}, "${k}", "${e.kind}", "${e.shape}", ${e.freq})`)
            }
            else if (e.kind == 'gain') {
                lines.push(`add_node(${e.x}, ${e.y}, "${k}", "${e.kind}", ${e.gain})`)
            } 
            else if (e.kind == 'shaper') {
                lines.push(`add_node(${e.x}, ${e.y}, "${k}", "${e.kind}", ${e.a})`)
            } 
            else if (e.kind == 'clock_mult') {
                lines.push(`add_node(${e.x}, ${e.y}, "${k}", "${e.kind}", ${e.mult})`)
            } 
            else if (e.kind == 'osc2') {
                lines.push(`add_node(${e.x}, ${e.y}, "${k}", "${e.kind}", "${e.type}", ${e.f1}, ${e.f2})`)
            } 
            else if (e.kind == 'clock') {
                lines.push(`add_node(${e.x}, ${e.y}, "${k}", "${e.kind}", ${e.bpm})`)
            } 
            // else {
            //     console.error(e)
            // }
        }
    }
    console.log(lines.join("\n"))
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
        print_config()
    }
    function startLoggingMIDIInput(midiAccess) {
        midiAccess.inputs.forEach((entry) => {
            // console.log(entry)
            entry.onmidimessage = onMIDIMessage;
        });
    }
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}


const start = async () => {
    audio_context = new AudioContext();
    analyser = audio_context.createAnalyser();
    analyser.fftSize = 2048*4*2;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    while (todos.length) {
        const function_ = todos.shift()
        function_()
    }
    n.gA.node.connect(analyser);
    n.gD.node.connect(audio_context.destination);
}


let started = false


const main = async () => {
    document.body.addEventListener("click", () => {
        if (!started) {
            start()
            started = true
        }
    })
    document.body.addEventListener("mouseup", (e)=> {
        if (context.node_evented) {
            context.node_evented = null
        } else {

        }
    })
    document.body.addEventListener("mousemove", (e)=> {
        if (context.node_evented) {
            if (context.node_evented.x != null && context.node_evented.y != null) {
                const dx = e.clientX - context.node_evented.x
                const dy = context.node_evented.y - e.clientY
                // console.log(context.node_evented.name)
                // console.log(n[context.node_evented.name].coords)
                const d = parseInt(Math.sqrt(dx*dx+dy*dy))
                if (dx >= 0 && dy >= 0) {
                    for (let _ = 0; _ < d; _++) {
                        roll_up(context.node_evented.name)
                    }
                }
                if (dx <= 0 && dy <= 0) {
                    for (let _ = 0; _ < d; _++) {
                        roll_down(context.node_evented.name)
                    }
                } 
            } 
            context.node_evented.x = e.clientX
            context.node_evented.y = e.clientY
        } else {
            
        }
    })

    // const x = event.clientX;
	// 	const y = event.clientY;
	// 	view.set_mouse(x, y);
	// });
	// document.addEventListener("mousemove", (e) => {
	// 	const x = e.offsetX;
	// 	const y = e.offsetY;
	// 	view.set_mouse(x, y);

    const canvas = document.getElementById("canvas")
    resize(canvas, window.innerWidth , window.innerHeight)
    freqs_context = canvas.getContext("2d")
    WIDTH = canvas.width
    HEIGHT = canvas.height
    console.log(WIDTH)
    dataArray = new Uint8Array(0)
    patch_10(add_node, connect)
    document.addEventListener('keydown', function(event) {
        context.keydowns.add(event.key)
    });
    document.addEventListener('keyup', function(event) {
        context.keydowns.delete(event.key)
    });
    start_midi()
    draw()
    process_keys()
    print_config()
}


main()
