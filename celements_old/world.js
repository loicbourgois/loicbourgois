import {
    fill_circle,
  } from "./canvas.js"
import {
    collision_response,
    intersection_delta,
    normalize,
} from "./math.js"


const I_X =     0*4
const I_Y =     1*4
const I_PX =    2*4
const I_PY =    3*4
const I_C_X =   4*4
const I_C_Y =   5*4
const I_C_VX =  6*4
const I_C_VY =  7*4
const I_PID =   8*4
const I_GID =   9*4
const I_K =     10*4
const I_M =     11*4
const I_D =     12*4
const I_VX =    13*4
const I_VY =    14*4
const I_LIVE =  15*4


const K_DEFAULT = 1;
const K_WATER = 2;


const key_downs = {}
const key_press = {}
const down_key = (k) => {
    if (!key_downs[k]) {
        if (!key_press[k]) {
            key_press[k] = 0
        }
        key_press[k] += 1
    }
    key_downs[k] = true
}
const up_key = (k) => {
    key_downs[k] = false
}
const colors = [
    [{
        [K_DEFAULT]: '#f008',
        [K_WATER]: '#08f4',
    }, 1.5],
    [{
        [K_DEFAULT]: '#ff08',
        [K_WATER]: '#0ff8',
    }, .75],
    // [{
    //     [K_DEFAULT]: '#fff8',
    //     [K_WATER]: '#fff8',
    // }, .25],
]


const draw_world = ({
    world,
    context,
}) => {
    const n_last_draw = world.last_draw
    world.last_draw = performance.now()
    world.fps = 1000 / (world.last_draw - n_last_draw)
    fill_circle({
        context: context, 
        p: {x:0.5,y:0.5} , 
        diameter: 5, 
        color: '#1013'
    })
    for (const color of colors) {
        for (let i = 0 ; i < world.buffer.byteLength ; i += world.particle.size) {
            const live = world.view.getUint8( i + I_LIVE )
            if (live) {
                const x = world.view.getFloat32( i + I_X )
                const y = world.view.getFloat32( i + I_Y )
                const k = world.view.getUint32( i + I_K )
                fill_circle({
                    context: context, 
                    p: {x:x,y:y} , 
                    diameter: world.d * color[1], 
                    color: color[0][k]
                })
            }
        }
    }
    document.querySelector("#fps").innerHTML = `FPS: ${parseInt(world.fps)}`
    document.querySelector("#draw").innerHTML = `graphics: ${parseInt(world.draw_duration)}ms`
    document.querySelector("#particles_count").innerHTML = `Particles: ${parseInt(world.particle.count)}`
    document.querySelector("#compute").innerHTML = `physics: ${parseInt(world.compute_duration)}ms`
    world.draw_duration = performance.now() - world.last_draw
}


const gid_ = (x,y,w) => {
    x = parseInt(x * w)
    y = parseInt(y * w)
    x = Math.min(Math.max(0,x),w-1)
    y = Math.min(Math.max(0,y),w-1)
    return x + y * w
}


const update_grid = ({
    world,
}) => {
    for (const cell of world.grid.cells) {
        cell.clear()
    }
    for (let i = 0 ; i < world.buffer.byteLength ; i += world.particle.size) {
        const live = world.view.getUint8( i + I_LIVE )
        if (live) {
            const x = world.view.getFloat32( i + I_X )
            const y = world.view.getFloat32( i + I_Y )
            const pid = world.view.getUint32( i + I_PID )
            const gid = gid_(x,y,world.grid.width)
            world.view.setInt32( i + I_GID, gid )
            world.grid.cells[gid].add(pid)
        }
    }
}


const upsize = ({
    world,
    count,
}) => {
    for (let i = world.particle.count; i < world.particle.count + count; i++) {
        world.free_pids.add(i)
    } 
    const new_buffer = new ArrayBuffer(world.buffer.byteLength + world.particle.size * count);
    const new_data = new Uint8Array(new_buffer);
    new_data.set(new Uint8Array(world.buffer));
    world.buffer = new_buffer
    world.view = new DataView(world.buffer)
}


const add_particle = ({
    world,
    x,
    y,
    dx,
    dy,
    k,
}) => {
    if (!world.free_pids.size) {
        upsize({
            world: world,
            count: world.width,
        })
    }
    const pid = world.free_pids.keys().next().value
    world.particle.count += 1
    world.free_pids.delete(pid)
    const bid = pid * world.particle.size
    world.view.setFloat32(bid + I_X, x)
    world.view.setFloat32(bid + I_Y, y)
    world.view.setFloat32(bid + I_PX, x-dx)
    world.view.setFloat32(bid + I_PY, y-dy)
    world.view.setUint32(bid + I_PID, pid)
    world.view.setUint32(bid + I_K, k)
    world.view.setUint8(bid + I_LIVE, 1)
    world.view.setFloat32(bid + I_D, world.d)
    world.view.setFloat32(bid + I_M, 1.0)
    return bid
}


const are_colliding = (x,y,d,x2,y2,d2) => {
    const diams = (d + d2) * 0.5
    const dx = x-x2
    const dy = y-y2
    const d_sqrd = dx*dx+dy*dy
    return d_sqrd < diams*diams
} 
let steps = 0
const start = performance.now()


const tick = ({
    world,
}) => {
    const start_ = performance.now()
    for (let index = 0; index < world.ticks; index++) {
        tick_inner({world:world})
    }
    world.compute_duration = performance.now() - start_
}


const tick_inner = ({
    world,
}) => {
    update_grid({
        world: world,
    })
    for (let i = 0 ; i < world.buffer.byteLength ; i += world.particle.size) {
        const live = world.view.getUint8( i + I_LIVE )
        if (live) {
            const x = world.view.getFloat32( i + I_X )
            const y = world.view.getFloat32( i + I_Y )
            let n = normalize({
                x: 0.5-x,
                y: 0.5-y,
            })
            // n.x = 0.5 - n.x*0.25
            // n.y = 0.5 - n.y*0.25
            // n = normalize({
            //     x: n.x-x,
            //     y: n.y-y,
            // })
            if (!isNaN(n.x*n.y)) {
                world.view.setFloat32( i + I_C_X, n.x * world.gravity)
                world.view.setFloat32( i + I_C_Y, n.y * world.gravity)
            } else {
                world.view.setFloat32( i + I_C_X, (Math.random()-0.5) * world.gravity)
                world.view.setFloat32( i + I_C_Y, (Math.random()-0.5) * world.gravity)
            }
            const px = world.view.getFloat32( i + I_PX )
            const py = world.view.getFloat32( i + I_PY )
            world.view.setFloat32( i + I_VX, x-px )
            world.view.setFloat32( i + I_VY, y-py )
        }
    }
    if (key_press[world.players[0].up]) {
        key_press[world.players[0].up] -= 1;
        const bid = world.players[0].bid
        const cx = world.view.getFloat32( bid + I_C_X)
        const cy = world.view.getFloat32( bid + I_C_Y)
        const x = world.view.getFloat32( bid + I_X )
        const y = world.view.getFloat32( bid + I_Y )
        let n = normalize({
            x: 0.5-x,
            y: 0.5-y,
        })
        world.view.setFloat32( bid + I_C_X, cx - n.x * world.acceleration.y)
        world.view.setFloat32( bid + I_C_Y, cy - n.y * world.acceleration.y)
    }
    if (key_press[world.players[0].down]) {
        key_press[world.players[0].down] -= 1;
        const bid = world.players[0].bid
        const cx = world.view.getFloat32( bid + I_C_X)
        const cy = world.view.getFloat32( bid + I_C_Y)
        const x = world.view.getFloat32( bid + I_X )
        const y = world.view.getFloat32( bid + I_Y )
        let n = normalize({
            x: 0.5-x,
            y: 0.5-y,
        })
        world.view.setFloat32( bid + I_C_X, cx + n.x * world.acceleration.y)
        world.view.setFloat32( bid + I_C_Y, cy + n.y * world.acceleration.y)
    }
    if (key_press[world.players[0].right]) {
        key_press[world.players[0].right] -= 1;
        const bid = world.players[0].bid
        const cx = world.view.getFloat32( bid + I_C_X)
        const cy = world.view.getFloat32( bid + I_C_Y)
        const x = world.view.getFloat32( bid + I_X )
        const y = world.view.getFloat32( bid + I_Y )
        let n = normalize({
            x: 0.5-x,
            y: 0.5-y,
        })
        const aa = n.x
        n.x = -n.y
        n.y = aa
        world.view.setFloat32( bid + I_C_X, cx + n.x * world.acceleration.x)
        world.view.setFloat32( bid + I_C_Y, cy + n.y * world.acceleration.x)
    }
    if (key_press[world.players[0].left]) {
        key_press[world.players[0].left] -= 1;
        const bid = world.players[0].bid
        const cx = world.view.getFloat32( bid + I_C_X)
        const cy = world.view.getFloat32( bid + I_C_Y)
        const x = world.view.getFloat32( bid + I_X )
        const y = world.view.getFloat32( bid + I_Y )
        let n = normalize({
            x: 0.5-x,
            y: 0.5-y,
        })
        const aa = n.x
        n.x = -n.y
        n.y = aa
        world.view.setFloat32( bid + I_C_X, cx - n.x * world.acceleration.x)
        world.view.setFloat32( bid + I_C_Y, cy - n.y * world.acceleration.x)
    }
    for (let i = 0 ; i < world.buffer.byteLength ; i += world.particle.size) {
        const live = world.view.getUint8( i + I_LIVE )
        if (live) {
            const x = world.view.getFloat32( i + I_X )
            const y = world.view.getFloat32( i + I_Y )
            const vx = world.view.getFloat32( i + I_VX )
            const vy = world.view.getFloat32( i + I_VY )
            const m = world.view.getFloat32( i + I_M )
            const d = world.view.getFloat32( i + I_D )
            const pid1 = world.view.getUint32( i + I_PID )
            const gid = gid_(x,y,world.grid.width)
            for (const ngid of world.ngids[gid] ) {
                for (const pid2 of world.grid.cells[ngid]) {
                    if (pid1 < pid2) {
                        const j = pid2 * world.particle.size
                        const p2_live = world.view.getUint8( j + I_LIVE )
                        if (p2_live) {
                            const x2 =  world.view.getFloat32( j + I_X )
                            const y2 =  world.view.getFloat32( j + I_Y )
                            const d2 = world.view.getFloat32( j + I_D )
                            const vx2 = world.view.getFloat32( j + I_VX )
                            const vy2 = world.view.getFloat32( j + I_VY )
                            const m2 = world.view.getFloat32( j + I_M )
                            if ( are_colliding(x,y,d,x2,y2,d2) ) {
                                const p1 = {
                                    p: {
                                        x:x,
                                        y:y,
                                    },
                                    v: {
                                        x:vx,
                                        y:vy,
                                    },
                                    m: m,
                                    d:d,
                                }
                                const p2 ={
                                        p: {
                                        x:x2,
                                        y:y2,
                                    },
                                    v: {
                                        x:vx2,
                                        y:vy2,
                                    },
                                    m: m2,
                                    d:d2,
                                }
                                const cr = collision_response(p1,p2)
                                if (!isNaN(cr.x * cr.y)) {
                                    world.view.setFloat32(
                                        i + I_C_X, 
                                        world.view.getFloat32(i + I_C_X) - cr.x * world.cr_ratio
                                    )
                                    world.view.setFloat32(
                                        i + I_C_Y, 
                                        world.view.getFloat32(i + I_C_Y) - cr.y * world.cr_ratio
                                    )

                                    world.view.setFloat32(
                                        j + I_C_X, 
                                        world.view.getFloat32(j + I_C_X) + cr.x * world.cr_ratio
                                    )
                                    world.view.setFloat32(
                                        j + I_C_Y, 
                                        world.view.getFloat32(j + I_C_Y) + cr.y * world.cr_ratio
                                    )
                                }
                                const interd = intersection_delta(p1, p2)
                                if (!isNaN(interd.x * interd.y)) {
                                    world.view.setFloat32(
                                        i + I_C_X, 
                                        world.view.getFloat32(i + I_C_X) + interd.x * world.interd_ratio
                                    )
                                    world.view.setFloat32(
                                        i + I_C_Y, 
                                        world.view.getFloat32(i + I_C_Y) + interd.y * world.interd_ratio
                                    )

                                    world.view.setFloat32(
                                        j + I_C_X, 
                                        world.view.getFloat32(j + I_C_X) - interd.x * world.interd_ratio
                                    )
                                    world.view.setFloat32(
                                        j + I_C_Y, 
                                        world.view.getFloat32(j + I_C_Y) - interd.y * world.interd_ratio
                                    )
                                }
                            }
                        }
                    }
                }
            }
        } 
    }
    for (let i = 0 ; i < world.buffer.byteLength ; i += world.particle.size) {
        const live = world.view.getUint8( i + I_LIVE )
        if (live) {
            const ppx = world.view.getFloat32( i + I_PX )
            const px = world.view.getFloat32( i + I_X )
            let dx = px - ppx + world.view.getFloat32( i + I_C_X )
            const x = dx + px
            const nx = x
            const npx = nx - dx*world.drag;
            const ppy = world.view.getFloat32( i + I_PY )
            const py = world.view.getFloat32( i + I_Y )
            let dy = py - ppy + world.view.getFloat32( i + I_C_Y )
            const y = dy + py
            const ny = y
            const npy = ny - dy*world.drag;
            world.view.setFloat32( i + I_X, nx )
            world.view.setFloat32( i + I_Y, ny )
            world.view.setFloat32( i + I_PX, npx)
            world.view.setFloat32( i + I_PY, npy )
        }
    }
}


const new_world = ({
    width,
    height,
    cr_ratio,
    interd_ratio,
    gravity,
    acceleration,
    drag,
    ticks,
    players,
}) => {
    const world = {
        buffer: new ArrayBuffer(0),
        particle: {
            size: Float32Array.BYTES_PER_ELEMENT * 12
                + Int32Array.BYTES_PER_ELEMENT * 3
                + Uint8Array.BYTES_PER_ELEMENT * 1,
            count: 0
        },
        cr_ratio: cr_ratio,
        interd_ratio: interd_ratio,
        gravity: gravity,
        acceleration:acceleration,
        d: 1/width,
        width: width,
        ticks:ticks,
        height: height,
        drag: drag,
        fps: 0,
        last_draw: performance.now(),
        grid: {
            cells: [],
            width: width,
            height: height,
            cs: 1/width, // center spacing
        },
        players: [{
            up: 'z',
            down: 's',
            right: 'd',
            left: 'q',
        }, {
            up: 'o',
        }],
        ngids: [],
        free_pids: new Set(),
    }
    for (let x = 0; x < world.grid.width; x++) {
        for (let y = 0; y < world.grid.height; y++) {
            world.grid.cells.push(new Set())
        }
    }
    for (let y = 0; y < world.grid.height; y++) {
        for (let x = 0; x < world.grid.width; x++) {
          const gid = x + y * world.grid.width
          const x_min = Math.max(x-1, 0)
          const x_max = Math.min(x+1, world.grid.width-1)
          const y_min = Math.max(y-1, 0)
          const y_max = Math.min(y+1, world.grid.height-1)
          let ngids = []
          for (let x2 = x_min; x2 <= x_max; x2++) {
                for (let y2 = y_min; y2 <= y_max; y2++) {
                    const gid2 = x2 + y2 * world.grid.width
                    ngids.push(gid2)
                }
            }
            world.ngids.push(ngids)
            world.ngids[gid] = ngids
        }
    }
    for (let x = 0.25; x < 0.75; x+=world.d) {
        for (let y = 0.25 ; y < 0.75; y+=world.d) {
            add_particle({
                world: world,
                x: x,
                y: y,
                k: K_DEFAULT,
                dx: 0,
                dy: 0,
            })
        }
    }
    if (players > 0) {
        world.players[0].bid = add_particle({
            world: world,
            x: 0.5,
            y: 0.9,
            dx: 0.0,
            dy: 0.0,
            k: K_WATER,
        })
    }
    document.addEventListener("keydown", (e) => {
        console.log("ee")
        down_key(e.key)
    });
    document.addEventListener("keyup", (e) => {
        up_key(e.key)
    });
    return world
}


export {
    new_world,
    draw_world,
    tick,
}
