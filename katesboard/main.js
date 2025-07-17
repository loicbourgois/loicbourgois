import {
    resize,
    line_cc,
    stroke_circle_cc,
    clear,
    set_center
} from "./canvas.js"
import * as level_1 from "./level_1.js"
console.log("ee")
document.body.innerHTML = `
    <canvas id="canvas"></canvas>
    <div id="overlay">
        <p>Tick:  <span id="tick"></span></p>
        <p>Frame: <span id="frame"></span></p>
        <p>FPS: <span id="fps"></span></p>
        <p id="player_input"></p>
        <p id="player_status"></p>
        <p id="player_speed"></p>
    </div>
`
const canvas = document.getElementById("canvas")
resize(canvas)
const context = canvas.getContext('2d')
context.imageSmoothingEnabled = false;
context.mozImageSmoothingEnabled = false;
context.webkitImageSmoothingEnabled = false;
context.msImageSmoothingEnabled = false;
context.translate(0.5, 0.5);
set_center(context)
const player = {
    p: {
        x: 0,
        y: 0,
    },
    d: {
        x: 0,
        y: 0,
    },
    input: {
        right: false,
        up: false,
        left: false,
        time_slow: false,
    },
    status: {
        jumping: false,
        falling: false,
        run_right: false,
    }
}
const frames = []
const p = player.p
const size = 10
const render = () => {
    const line_width = 1
    const color = "#ff0"
    const p1 = {
        x: p.x - size,
        y: p.y ,
    };
    const p2 = {
        x: p.x + size,
        y: p.y,
    };
    const p3 = {
        x: p.x,
        y: p.y - size,
    };
    const p4 = {
        x: p.x,
        y: p.y + size,
    };
    const p5 = {
        x: p.x,
        y: p.y,
    };
    clear(context)
    const color2 = "#dd0"
    for (const v of level_1.map) {
        line_cc(
            context,
            {
                x: v.a.x ,
                y: v.a.y ,
            },
            {
                x: v.b.x ,
                y: v.b.y ,
            },
            color2, 
            line_width
        )
    }
    line_cc(
        context,
        p1, 
        p2, 
        color, 
        line_width
    )
    line_cc(
        context,
        p3, 
        p4, 
        color, 
        line_width
    )
    stroke_circle_cc(
        context,
        p5,
        size,
        "#ff0",
        1
    )
}
document.addEventListener(
    "keydown",
    (event) => {
        const k = event.key;
        if (k == "d") {
            player.input.right = true
        }
        if (k == "q") {
            player.input.left = true
        }
        if (k == "z") {
            player.input.up = true
        }
        if (k == "t") {
            player.input.time_slow = true
        }
    },
    false,
);
document.addEventListener(
    "keyup",
    (event) => {
        const k = event.key;
        if (k == "d") {
            player.input.right = false
        }
        if (k == "q") {
            player.input.left = false
        }
        if (k == "z") {
            player.input.up = false
        }
        if (k == "t") {
            player.input.time_slow = false
        }
    },
    false,
);
const events = (frame) => {
    const e = level_1.events[frame]
    if (e) {
        for (const k in e) {
            player.input[k] = e[k]
        }
    }
}

const is_floor = (v) => {
    return v.k == "floor"
}

const player_bot_below_floor = (p, v) => {
    return p.y - size <= v.a.y 
}

const player_top_above_floor = (p, v) => {
    return p.y +size >= v.a.y
}

const gravity = 0.001
const max_speed_x = 0.3
const max_speed_y = 0.32
const acceleration = 0.001

const physics = () => {
    if (player.input.stop) {
        throw "de"
    }
    player.status.stop_run_right = false
    player.status.falling = false
    player.status.run_right = false
    player.status.stop_run_left = false
    player.status.run_left = false
    player.status.wall_right = false
    player.status.wall_left = false
    player.d.y -= gravity
    player.status.falling = true
    player.d.y = Math.max(-max_speed_y, player.d.y)
    p.x += player.d.x
    p.y += player.d.y
    for (const v of level_1.map) {
        if (
            is_floor(v)
            && player_bot_below_floor(p, v)
            && player_top_above_floor(p,v)
        ) {
            player.d.y = 0
            p.y = size + v.a.y
            player.status.falling = false
        }
        if (v.k == "wall" 
            && p.x + size >= v.a.x 
            && p.x < v.a.x
            && p.y > Math.min(v.a.y, v.b.y)
            && p.y < Math.max(v.a.y, v.b.y)
            && player.d.x >= 0
        ) {
            player.d.x = 0
            p.x = v.a.x - size
            player.status.wall_right = true
        }
        if (v.k == "wall" 
            && p.x - size <= v.a.x 
            && p.x > v.a.x
            && p.y > Math.min(v.a.y, v.b.y)
            && p.y < Math.max(v.a.y, v.b.y)
            && player.d.x <= 0
        ) {
            player.d.x = 0
            p.x = v.a.x + size
            player.status.wall_left = true
        }
    }
    if (!player.status.falling && player.input.right && !player.status.wall_right) {
        player.status.run_right = true
        player.d.x += acceleration
        player.d.x = Math.min(max_speed_x, player.d.x)
    }
    if (!player.status.falling && !player.input.right && player.d.x > 0) {
        player.status.stop_run_right = true
        player.d.x -= acceleration
        player.d.x = Math.max(0, player.d.x)
    }

    if (!player.status.falling && player.input.left) {
        player.status.run_left = true
        player.d.x -= acceleration
        player.d.x = Math.max(-max_speed_x, player.d.x)
    }

    if (!player.status.falling && !player.input.left && player.d.x < 0) {
        player.status.stop_run_left = true
        player.d.x += acceleration
        player.d.x = Math.min(0, player.d.x)
    }

    if (!player.status.falling && player.input.up && !player.status.jumping) {
        player.d.y = max_speed_y
        player.status.jumping = true
    }

    if (player.status.wall_right && player.input.up && !player.status.jumping) {
        player.d.y = max_speed_y
        player.d.x = -max_speed_x
        player.status.jumping = true
    }

    if (player.status.wall_left && player.input.up && !player.status.jumping) {
        player.d.y = max_speed_y
        player.d.x = max_speed_x
        player.status.jumping = true
    }

    if (!player.input.up ) {
        player.status.jumping = false
    }
}
const fps_span = document.getElementById("fps")
const frame_span = document.getElementById("frame")
const tick_span = document.getElementById("tick")
let frame = 0
let tick = 0
let speed = 3
const step = () => {
    // if (player.input.time_slow) {
    //     frame_speed += 1
    //     frame_speed = Math.min(frame_speed, 4)
    // } else {
    //     frame_speed -= 1
    //     frame_speed = Math.max(frame_speed, 1)
    // }
    // if (tick%frame_speed != 0) {
    //     requestAnimationFrame(step)
    //     return
    // }
    frame += 1
    frame_span.innerHTML = frame
    const last = performance.now()
    frames.push(last)
    let fps = null
    const sample = 10
    while ( frames.length > sample ) {
        const first = frames.shift()
        fps = Math.round(1000*sample/((last - first)))
        fps_span.innerHTML = fps
    }
    for (let i = 0; i < speed; i++) {
        tick += 1
        events(tick)
        physics()
    }
    tick_span.innerHTML = tick
    render()
    document.getElementById('player_status').innerHTML = JSON.stringify(player.status, null, 4)
    document.getElementById('player_input').innerHTML = JSON.stringify(player.input, null, 4)
    document.getElementById('player_speed').innerHTML = JSON.stringify(player.d, null, 4)
    requestAnimationFrame(step)
}
step()