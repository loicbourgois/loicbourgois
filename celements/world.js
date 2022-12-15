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

const cr_ratio = 0.13215
const interd_ratio = 0.04


const K_DEFAULT = 1;


const draw_world = ({
    world,
    context,
}) => {
    fill_circle({
        context: context, 
        p: {x:0.5,y:0.5} , 
        diameter: world.d*2000, 
        color: '#1014'
    })
    for (let i = 0 ; i < world.buffer.byteLength ; i += world.particle.size) {
        const live = world.view.getUint8( i + I_LIVE )
        if (live) {
            const x = world.view.getFloat32( i + I_X )
            const y = world.view.getFloat32( i + I_Y )
            fill_circle({
                context: context, 
                p: {x:x,y:y} , 
                diameter: world.d*1.5, 
                color: '#d00'
            })
            fill_circle({
                context: context, 
                p: {x:x,y:y} , 
                diameter: world.d*0.5, 
                color: '#ffff'
            })
            fill_circle({
                context: context, 
                p: {x:x,y:y} , 
                diameter: world.d*2, 
                color: '#ff4d'
            })
        }
    }
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
    update_grid({
        world: world,
    })
    for (let i = 0 ; i < world.buffer.byteLength ; i += world.particle.size) {
        const live = world.view.getUint8( i + I_LIVE )
        if (live) {
            const x = world.view.getFloat32( i + I_X )
            const y = world.view.getFloat32( i + I_Y )

            const n = normalize({
                x: 0.5-x,
                y: 0.5-y,
            })

            // let dx = 0.0001
            // let dy = 0.0001
            // if (x > 0.5) {
            //     dx = -dx
            // }
            // if (y > 0.5) {
            //     dy = -dy
            // }

            world.view.setFloat32( i + I_C_X, n.x * 0.0002)
            world.view.setFloat32( i + I_C_Y, n.y * 0.0002)
            // world.view.setFloat32( i + I_C_Y, 0.0 )
            const px = world.view.getFloat32( i + I_PX )
            const py = world.view.getFloat32( i + I_PY )
            world.view.setFloat32( i + I_VX, x-px )
            world.view.setFloat32( i + I_VY, y-py )
        }
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
            // const gid = parseInt(x * world.grid.width) + parseInt(y * world.grid.height) * world.grid.width
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
                                        world.view.getFloat32(i + I_C_X) - cr.x * cr_ratio
                                    )
                                    world.view.setFloat32(
                                        i + I_C_Y, 
                                        world.view.getFloat32(i + I_C_Y) - cr.y * cr_ratio
                                    )

                                    world.view.setFloat32(
                                        j + I_C_X, 
                                        world.view.getFloat32(j + I_C_X) + cr.x * cr_ratio
                                    )
                                    world.view.setFloat32(
                                        j + I_C_Y, 
                                        world.view.getFloat32(j + I_C_Y) + cr.y * cr_ratio
                                    )
                                }
                                const interd = intersection_delta(p1, p2)
                                if (!isNaN(interd.x * interd.y)) {
                                    // console.log("ee")
                                    world.view.setFloat32(
                                        i + I_C_X, 
                                        world.view.getFloat32(i + I_C_X) + interd.x * interd_ratio
                                    )
                                    world.view.setFloat32(
                                        i + I_C_Y, 
                                        world.view.getFloat32(i + I_C_Y) + interd.y * interd_ratio
                                    )

                                    world.view.setFloat32(
                                        j + I_C_X, 
                                        world.view.getFloat32(j + I_C_X) - interd.x * interd_ratio
                                    )
                                    world.view.setFloat32(
                                        j + I_C_Y, 
                                        world.view.getFloat32(j + I_C_Y) - interd.y * interd_ratio
                                    )

                                //     p1.compute.intersects += 1.0
                                //     p2.compute.intersects += 1.0
                                //     p1.compute.p.x += interd.x * interd_ratio
                                //     p1.compute.p.y += interd.y * interd_ratio
                                //     p2.compute.p.x -= interd.x * interd_ratio
                                //     p2.compute.p.y -= interd.y * interd_ratio
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
            // const nx = Math.min(Math.max(
            //     x,
            //     world.d * 0.5
            // ), 1.0 - world.d * 0.5)
            const nx = x
            if (x != nx) {
                dx = -dx*(0.5+cr_ratio)
            }
            const npx = nx - dx;

            const ppy = world.view.getFloat32( i + I_PY )
            const py = world.view.getFloat32( i + I_Y )
            let dy = py - ppy + world.view.getFloat32( i + I_C_Y )
            const y = dy + py
            // const ny = Math.min(Math.max(
            //     y,
            //     world.d * 0.5
            // ), 1.0 - world.d * 0.5)
            const ny = y
            if (y != ny) {
                dy = -dy*(0.5+cr_ratio)
            }
            const npy = ny - dy;

            world.view.setFloat32( i + I_X, nx )
            world.view.setFloat32( i + I_Y, ny )
            world.view.setFloat32( i + I_PX, npx)
            world.view.setFloat32( i + I_PY, npy )
        }
    }
    // console.log( )
    // const ups = 1000/()
    const compute_duration = performance.now() - start_
    steps += 1
    let avg_ups = 1000 / (performance.now() - start) * steps
    document.querySelector("#avg_ups").innerHTML = `AVG UPS: ${parseInt(avg_ups)}`
    document.querySelector("#compute").innerHTML = `Compute duration: ${parseInt(compute_duration)}ms`
    document.querySelector("#ups").innerHTML = `UPS: ${parseInt(ups)}`
    document.querySelector("#particles_count").innerHTML = `Parts: ${parseInt(world.particle.count)}`
}


const new_world = ({
    width,
    height,
}) => {
    const world = {
        buffer: new ArrayBuffer(0),
        particle: {
            size: Float32Array.BYTES_PER_ELEMENT * 12
                + Int32Array.BYTES_PER_ELEMENT * 3
                + Uint8Array.BYTES_PER_ELEMENT * 1,
            count: 0
        },
        d: 1/width,
        width: width,
        height: height,
        grid: {
            cells: [],
            width: width,
            height: height,
            cs: 1/width, // center spacing
        },
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


    for (let x = 0.1; x < 0.9; x+=world.d*1.25) {
        for (let y = 0.1 ; y < 0.9; y+=world.d*1.25) {
          add_particle({
            world: world,
            x: x + Math.random() * world.d*0.1,
            y: y,
            k: K_DEFAULT,
            dx: 0,
            dy: 0,
          })
        }
      }


    // add_particle({
    //     world: world,
    //     x: 0.25,
    //     y: 0.25,
    //     dx: 0.0,
    //     dy: 0.0,
    //     k: K_DEFAULT,
    // })
    // add_particle({
    //     world: world,
    //     x: 0.5,
    //     y: 0.25,
    //     dx: -0.001,
    //     dy: 0.0,
    //     k: K_DEFAULT,
    // })

    // add_particle({
    //     world: world,
    //     x: 0.75,
    //     y: 0.25,
    //     dx: 0.0,
    //     dy: 0.0,
    //     k: K_DEFAULT,
    // })
    // add_particle({
    //     world: world,
    //     x: 0.75,
    //     y: 0.15,
    //     dx: 0.0,
    //     dy: 0.01,
    //     k: K_DEFAULT,
    // })

    update_grid({
        world: world,
    })
    return world
}


export {
    new_world,
    draw_world,
    tick,
}
