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

// for (let _ = 0; _ < 100; _+=1) {
//     const x = parseInt (center.x + ( (Math.random() - 0.5) * r ) )
//     const y = parseInt (center.y + ( (Math.random() - 0.5) * r ) )
//     if (x > 0 && x < canvas.width && y > 0 && y < canvas.height) {
//         const i = ( x + y * canvas.width ) * 4
//         data[i] = c[0]
//         data[i + 1] = c[1]
//         data[i + 2] = c[2]
//         data[i + 3] = c[3]
//     }
// }

const Color = {
    Yellow: [
        255,
        255,
        0,
        255,
    ]
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
    y: parseInt(canvas.height*0.75),
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
    // console.log(lives)
    return lives
}

const run_step = (idx, limit) => {
    if (idx > limit) {
        return
    }
    console.log(idx)
    for (let _ = 0; _ <= 400; _++) {
        const xy = {
            x: base.x + (parseInt(Math.random()*7)-3)*150,
            y: base.y,
        }
        let go = true
        let cc = Math.random() * 4
        let dd = Math.random() * 4
        for (let b = 0; b < 2000 && go; b++) {
            const color = get_pixel(xy)
            if (color[0] == 0 || Math.abs(xy.y - base.y) > 700 ) {
                go = false
            }
            // set_pixel(xy, [
            //     color[0] % 255 + 1,
            //     color[1] % 255 + 1,
            //     color[2] % 255 + 1,
            //     255,
            // ])

            set_pixel(xy, [
                color[0] + 1,
                color[1] + 1,
                color[2] + 1,
                255,
            ])

            const aa = 1.25
            const bb = 10
            const up = get_pixel({
                x: xy.x, 
                y: xy.y - 1, 
            })[0] / bb + Math.random() * aa
            const left = get_pixel({
                x: xy.x - 1, 
                y: xy.y, 
            })[0] / bb + Math.random() * aa * cc
            const right = get_pixel({
                x: xy.x + 1, 
                y: xy.y, 
            })[0] / bb + Math.random() * aa * dd

            const r = parseInt(
                Math.random() * ( up + left + right)
            )
            // console.log(r, up, up + left)

            if (r < left -0.3 ) {
                xy.x -= parseInt(1 + Math.random() * 1)
            } else if (r < left + right) {
                xy.x += parseInt(1 + Math.random() * 1)
            }  else {
                xy.y -= 1
            }
            // if (live_neighbours_8(xy) >= 8) {
            //     set_pixel(xy, [
            //         0,
            //         0,
            //         0,
            //         255,
            //     ])
            //     break
            // }
        }
    }
    context.putImageData(image_data, 0, 0);
    window.requestAnimationFrame(() => {
        run_step(idx+1, limit)
    })
}

run_step(1, 2000)

// const draw = () => {
//   context.putImageData(image_data, 0, 0);
// //   window.requestAnimationFrame(draw)
// }
// draw()