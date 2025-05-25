import { 
    resize_to_window
 } from "./canvas.js"

const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")
context.imageSmoothingEnabled= false
context.mozImageSmoothingEnabled = false;

document.body.style.background = '#111'
resize_to_window(canvas)
const image_data = context.getImageData(0, 0, canvas.width, canvas.height)
const data = image_data.data

const config = {
    height_soil:0.77,
}

const set_pixel = (xy, color) => {
    const x = xy.x
    const y = xy.y
    if (x !== parseInt(x)) {
        throw new Error(`invalid x: ${x}`);
    }
    if (y !== parseInt(y)) {
        throw new Error(`invalid x: ${y}`);
    }
    const i = ( x + y * canvas.width ) * 4
    data[i] = color[0]
    data[i + 1] = color[1]
    data[i + 2] = color[2]
    data[i + 3] = color[3]
}

const center = {
    x: canvas.width/2,
    y: canvas.height/2,
}
const r = 100;
const c = [
    255,
    255,
    255,
    255,
]
console.log(canvas.width, canvas.height)


const raw_data = new Int32Array(canvas.width * canvas.height);
for (let index = 0; index < raw_data.length; index++) {
    raw_data[index] = 0
    const i = index*4
    data[i] = 8
    data[i + 1] = 8
    data[i + 2] = 0
    data[i + 3] = 255
}

for (let x = 0; x < canvas.width; x++) {
    for (let y = parseInt(canvas.height*config.height_soil); y < canvas.height; y++) {
        const value = 10
        const color_value = parseInt(Math.sqrt(value+1)*2)
        set_pixel({x:x,y:y}, [color_value, color_value, color_value, 255])
        let index = ( x + y * canvas.width )
        raw_data[index] = value
    }
}


const Color = {
    Yellow: [
        255,
        255,
        0,
        255,
    ]
}

const set_datapoint = (xy, value) => {
    const x = xy.x
    const y = xy.y
    if (x !== parseInt(x)) {
        throw new Error(`invalid x: ${x}`);
    }
    if (y !== parseInt(y)) {
        throw new Error(`invalid x: ${y}`);
    }
    const i = ( x + y * canvas.width )
    raw_data[i] = value
}

const get_datapoint = (xy) => {
    const i = ( xy.x + xy.y * canvas.width )
    return raw_data[i]
}

const get_pixel = (xy) => {
    const i = ( xy.x + xy.y * canvas.width ) * 4
    return [ 
        data[i],
        data[i + 1],
        data[i + 2],
        data[i + 3]
    ]
}

const base = {
    x: parseInt(canvas.width*0.5),
    y: parseInt(canvas.height*config.height_soil),
}

const live_neighbours_4 = (xy) => {
    let lives = 0
    const dxys = [
        [0,1],
        [1,0],
        [-1,0],
        [0,-1],
    ]
    for (const dxy of dxys) {
        const color = get_pixel({
            x: xy.x + dxy[0],
            y: xy.y + dxy[1],
        })
        if (color[0] > 0) {
            lives += 1;
        }
    }
    return lives
}

const live_neighbours_8 = (xy) => {
    let lives = 0
    const dxys = [
        [0,1],
        [0,-1],
        [1,0],
        [1,1],
        [1,-1],
        [-1,0],
        [-1,1],
        [-1,-1],

    ]
    for (const dxy of dxys) {
        const color = get_pixel({
            x: xy.x + dxy[0],
            y: xy.y + dxy[1],
        })
        if (color[0] > 0) {
            lives += 1;
        }
    }
    return lives
}

const run_step = (idx, limit) => {
    if (idx > limit) {
        return
    }
    console.log(`idx: ${idx}`)
    for (let _ = 0; _ <= 400; _++) {
        // const xy = {
        //     x: base.x + (parseInt(Math.random()*7)-3)*150,
        //     y: base.y,
        // }
        const xx = canvas.width*0.7
        const yy = canvas.height*0.1
        const xy = {
            x: base.x + parseInt(Math.random()*xx-xx/2),
            y: base.y + parseInt(Math.random()*yy),
        }
        let go = true
        let cc = Math.random() * 5
        let dd = Math.random() * 5
        for (let b = 0; b < 3000 && go; b++) {
            const value = get_datapoint(xy)
            if (value == 0 ) {
                go = false
            }
            set_datapoint(xy, value+1);
            // const color_value = parseInt((value+1)/10)
            const color_value = parseInt(Math.sqrt(value+1)*2)
            // const color_value = 1000
            set_pixel(xy, [
                color_value,
                color_value,
                color_value,
                255,
            ])
            const aa = 1.25
            const bb = 10
            const up = Math.min(get_datapoint({
                x: xy.x, 
                y: xy.y - 1, 
            }), 255) / bb + Math.random() * aa
            const left = Math.min(get_datapoint({
                x: xy.x - 1, 
                y: xy.y, 
            }), 255) / bb + Math.random() * aa * cc
            const right = Math.min(get_datapoint({
                x: xy.x + 1, 
                y: xy.y, 
            }), 255) / bb + Math.random() * aa * dd
            let down = (Math.min(get_datapoint({
                x: xy.x, 
                y: xy.y - 1, 
            }), 255) / bb + Math.random() * aa) * 0.9
            down = 0
            const r = parseInt(
                Math.random() * ( up + left + right + down)
            )
            if (r < left -0.3 ) {
                xy.x -= parseInt(1 + Math.random() * 1)
            } else if (r < left + right) {
                xy.x += parseInt(1 + Math.random() * 1)
            }  else if (r < left + right + down) { 
                xy.y += 1
            } else {
                const r2 = Math.random()
                if (r2 < 0.85) {
                    xy.y -= 1
                } else {
                    xy.y += 1
                }
            }
        }
    }
    context.putImageData(image_data, 0, 0);
    window.requestAnimationFrame(() => {
        run_step(idx+1, limit)
    })
}
run_step(1, Infinity)
