import {
  resize_square,
  fill_circle,
  clear,
  fill_text,
  to_rgb,
} from "./canvas.js"
import { 
  collision_response,
  are_colliding,
  intersection_delta,
} from "./math.js"
const canvas = document.body.querySelector("#canvas")
const context = canvas.getContext('2d')

let image_data = undefined
resize_square(canvas, 1)
const dim = canvas.width


const aa = 5
const draw_circle = (c) => {
  let x_ = aa;
  let y_ = aa;
  const aaaa = aa*aa
  for ( let a = x_ - aa ; a <= x_ + aa ; a ++) {
    for ( let b = y_ - aa ; b <= y_ + aa ; b ++) {
      const dx = x_-a
      const dy = y_-b 
      if (dx*dx+dy*dy < aaaa) {
        draw_pixel_2(a,b,c)
      }
      //  else {
      //   draw_pixel_2(a,b,[0,0,0,0])
      // }
    }
  }
}

const draw_pixel_2 = (roundedX, roundedY, c) => {
  let index = 4 * parseInt(aa*2 * roundedY + roundedX );
  image_data[index + 0] = c[0];
  image_data[index + 1] = c[1];
  image_data[index + 2] = c[2];
  image_data[index + 3] = c[3];
}


const draw_pixel = (x, y, c) => {
  let roundedX = Math.round(x*dim);
  let roundedY = Math.round(y*dim);
  let index = 4 * (canvas.width * roundedY + roundedX);
  image_data[index + 0] = c[0];
  image_data[index + 1] = c[1];
  image_data[index + 2] = c[2];
  image_data[index + 3] = c[3];
}


const pp_ratio = 0.09
// const ppv_ratio = 0.9
const velocity_damping = 0.999
const cr_ratio = 0.025
const interd_ratio = 0.5
const gravity = 0.00001
const LOOPINGS = 10


const cell_a = {
  life_force: 100,
  energy: 100,
  hydration: 100,
  water: 100,
  rice: 100,
  x: 8,
  y: 5,
  dx: 0.,
  dy: 0.0,
}

const WIDTH = 64 
const HEIGHT = WIDTH
const D = 1/WIDTH

const world = {
  width: WIDTH,
  height: HEIGHT,
  items: {},
  map: [],
  particles : [],
  deltas : [],
  grid: {
    width: WIDTH ,
    height: HEIGHT  ,
    data: []
  },
  ngids: [],
  max_particles: WIDTH*WIDTH/2,
  free_particles: new Set(),
}
for (let x = 0; x < world.width; x++) {
  world.map.push([])
  for (let y = 0; y < world.width; y++) {
    world.map[x].push({})
  }
}


for (let x = 0; x < world.grid.width; x++) {
  for (let y = 0; y < world.grid.height; y++) {
    world.grid.data.push(new Set())
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


for (let i = 0; i < world.max_particles; i++) {
  world.free_particles.add(i)
  world.particles.push({})
}


const add_particle = ({x,y}) => {
  const pid = world.free_particles.keys().next().value
  const gid = parseInt(x * world.grid.width) + parseInt(y * world.grid.height) * world.grid.width
  world.free_particles.delete(pid)
  world.particles[pid] = {
    p: {
      x:x,
      y:y
    },
    pp: {
      x:x,
      y:y,
    },
    ppp: {
      x:x,
      y:y,
    },
    pppp: {
      x:x,
      y:y,
    },
    m: 1.0,
    v: {
      x:0,
      y:0,
    },
    d: D,
    gid: gid,
    live: true,
    pid: pid,
    compute: {
      p: {
        x:x,
        y:y
      },
      v: {
        x:0,
        y:0,
      },
    }
  }
  world.grid.data[gid].add(pid)
}


const add_particles = () => {
  for (let x = 0; x < WIDTH/2; x++) {
    for (let y = 0; y < WIDTH; y++) {
      add_particle({
        x: x/WIDTH*1. + D/2 + Math.random() * D/4,
        y: y/WIDTH*1. + D/2,
      })
    }
  }
}
add_particles()



const add_item = (world, k, p) => {
  if ( ! world['items'][k] ) {
    world['items'][k] = {}
  }
  if ( ! world['items'][k][p.x] ) {
    world['items'][k][p.x] = {}
  }
  if ( ! world['items'][k][p.x][p.y] ) {
    world['items'][k][p.x][p.y] = 0
  }
  world['items'][k][p.x][p.y] += 1
  if ( ! world['map'][p.x][p.y][k] ) {
    world['map'][p.x][p.y][k] = 0
  }
  world['map'][p.x][p.y][k] += 1
}


const add = (x, k, c=1) => {
  x[k] = x[k] ? x[k] + c : c
}
const remove = (x, k, c=1) => {
  x[k] = x[k] ? x[k] - c : -c
}


const actions = {
  'cook rice': (x) => {
    remove(x, 'rice')
    remove(x, 'water')
    remove(x, 'energy')
    add(x, 'cooked_rice')
  },
  'eat cooked rice': (x) => {
    remove(x, 'cooked_rice')
    add(x, 'energy')
  },
  'cook kilo rice': (x) => {
    for (let index = 0; index < 10; index++) {
      actions['cook rice'](x)
    }
  },
  'eat kilo cooked rice': (x) => {
    for (let index = 0; index < 10; index++) {
      actions['eat cooked rice'](x)
    }
  },
  'go _1_': (cell, {_1_}) => {
    if (_1_ == 'left') {
      remove(cell, 'x')
      remove(cell, 'energy')
    }
  },
  'collect wood _1_ _2_': (cell, {_1_, _2_}, world) => {
    const count = _1_
    const dx = {
      'left': -1
    }[_2_]
    for (let i = 0; i < count; i++) {
      let x = cell.x + dx * i
      let y = cell.y
      let q = world.map[x][y]['wood']
      let d = Math.sqrt(dx * dx * i * i)
      q = q ? q : 0
      add(cell, 'dead_wood', q)
      remove(world.map[x][y], 'wood', q)
      remove(cell, 'energy', d*q)
    }
  },
}

let image = context.createImageData(aa*2, aa*2);
image_data = image.data;
let color = "#dd8"
const c = to_rgb(color)
draw_circle( c )


const draw = () => {
  const start = performance.now()
  clear(context)
  for (const p1 of world.particles) {
    if (p1.live) {
      context.putImageData(image, (p1.p.x-D/2)*canvas.width, (1.0-p1.p.y+D/2)*canvas.width);
    }
  }
  window.requestAnimationFrame(draw)
}


const key_downs = {}
document.addEventListener("keydown", (e) => {
  if ( key_downs[e.key] !== 'locked' ) {
    key_downs[e.key] = true
  }
});
document.addEventListener("keyup", (e) => {
  if (key_downs[e.key]) {
    key_downs[e.key] = false
  }
});


const step = () => {
  cell_a.x += cell_a.dx 
  cell_a.dx *= 0.95
  cell_a.y += cell_a.dy
  cell_a.dy -= 0.005
  if (key_downs['d']  === true) {
    cell_a.dx += 0.15
    key_downs['d'] = 'locked'
  }
  if (key_downs['s'] === true) {
    cell_a.dx -= 0.15
    key_downs['s'] = 'locked'
  }
  if (key_downs[' '] === true) {
    cell_a.dy += 0.15
    cell_a.y += 0.15
    key_downs[' '] = 'locked'
  }
  if (cell_a.y < 5) {
    cell_a.y = 5
    cell_a.dy = 0
  }
  for (const particle of world.particles) {
    if(particle.live) {
      particle.compute.p.x = 0.0
      particle.compute.p.y = 0.0
      particle.compute.v.x = 0.0
      particle.compute.v.y = 0.0
      particle.compute.intersects = 0.0
      particle.collisions = 0
    }
  }
  for (const p1 of world.particles) {
    if(p1.live) {
      let n = 0    
      for (const ngid of world.ngids[p1.gid] ) {
        for (const pid2 of world.grid.data[ngid]) {
          if (pid2 != p1.pid) {
            n += 1;
          }
          const p2 = world.particles[pid2]
          if (p2.live && p2.pid > p1.pid && are_colliding(p1,p2) ) {
            const cr = collision_response(p1,p2)
            p1.collisions += 1
            p2.collisions += 1
            if (!isNaN(cr.x * cr.y)) {
              p1.compute.v.x -= cr.x * cr_ratio
              p1.compute.v.y -= cr.y * cr_ratio
              p2.compute.v.x += cr.x * cr_ratio
              p2.compute.v.y += cr.y * cr_ratio
            }
            const interd = intersection_delta(p1, p2)
            if (!isNaN(interd.x * interd.y)) {
              p1.compute.intersects += 1.0
              p2.compute.intersects += 1.0
              p1.compute.p.x += interd.x * interd_ratio
              p1.compute.p.y += interd.y * interd_ratio
              p2.compute.p.x -= interd.x * interd_ratio
              p2.compute.p.y -= interd.y * interd_ratio
            }
          }
        }
      }
      p1.n = n
    }
  }
  for (const p1 of world.particles) {
    if(p1.live) {
      let dpx = (p1.p.x - p1.pp.x) * velocity_damping
      const abs_ = Math.abs( p1.v.x) + Math.abs( p1.v.y)
      const applied_gravity = Math.min( Math.sqrt( abs_  / gravity * 100000 ) + 0.01, 1.0) * gravity
      let dpy = (p1.p.y - p1.pp.y) * velocity_damping - applied_gravity
      p1.pppp.x = p1.ppp.x
      p1.pppp.y = p1.ppp.y
      p1.ppp.x = p1.pp.x
      p1.ppp.y = p1.pp.y
      p1.pp.x = p1.p.x + p1.compute.p.x * pp_ratio
      p1.pp.y = p1.p.y + p1.compute.p.y * pp_ratio
      p1.p.x += dpx + p1.compute.p.x + p1.compute.v.x
      p1.p.y += dpy + p1.compute.p.y + p1.compute.v.y
    }
  }
  for (const particle of world.particles) {
    if(particle.live) {
      particle.p.x = Math.max(particle.p.x, D/2)
      particle.p.x = Math.min(particle.p.x, 1.0-D/2)
      particle.p.y = Math.max(particle.p.y, D/2)
      particle.p.y = Math.min(particle.p.y, 1.0-D/2)
      particle.v.x = particle.p.x - particle.pp.x
      particle.v.y = particle.p.y - particle.pp.y
    }
  }
  for (const cell of world.grid.data) {
    cell.clear()
  }
  for (const particle of world.particles) {
    if (particle.live){
      particle.gid = parseInt(particle.p.y * world.grid.width) + parseInt(particle.p.x * world.grid.height) * world.grid.width
      world.grid.data[particle.gid].add(particle.pid)
    }
  }
}

const compute = () => {
  for (let index = 0; index < LOOPINGS; index++) {
    step()
  }
  setTimeout(compute, 0)
}

window.requestAnimationFrame(draw)
compute()






// for (const cell of particles) {
//   fill_circle({
//     context: context,
//     p: cell.p,
//     diameter: cell.d,
//     color: cell.c
//   })
// }


// const f = (t, a, b) => {
//   const dx = b.x - a.x
//   const dy = b.y - a.y
//   const c = {
//     x: a.x,
//     y: b.y,
//   }
//   return {
//     x: a.x + dx * t,
//     y: a.y + dy * t,
//   }
// }


// const l = 100
// for (let i = 0; i <= l; i++) {
//   fill_circle({
//     context: context,
//     p: f(i/l , particles[0].p, particles[1].p ),
//     diameter: 0.005,
//     color: "#cc2"
//   })
// }


// life force
// energy
// life / death
// heat / cold
// water
// fuel
// movement / static


// sugar + energy -> alcohol + CO2


// life fire -> warm up
// cool down / cook


// Con cin mas aq


// A concentration of lots of moving water 


// mas / poco 


// spark + wood -> burning_wood

// energy -> spark

// rice + heat -> cooked_rice

// x.eat(cooked_rice) -> x.energy += 1

// x = {
//   energy: 100,
//   rice: 100,
// }


// poc fire wod
// tak wod 

/*
 water
 cold
 hot
 droplet
 torrent
 ice
 fire
 health
 strong
 group
*/
