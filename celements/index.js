import { 
  collision_response,
  are_colliding,
  intersection_delta,
} from "./math.js"
import { 
  new_world,
  draw_world,
  tick,
} from "./world.js"
import { 
  resize,
  clear,
  fill_text,
} from "./canvas.js"


const pp_ratio = 0.09
const velocity_damping = 0.999
const cr_ratio = 0.05
const interd_ratio = 0.125
const gravity = 0.00002 * 0.8
const LOOPINGS = 1
const ENERGY_RATE = 10.025


const K_DEFAULT = 0
const K_ENERGY = 1
const K_P0 = 2
const K_P1 = 3
const K_WATER = 4
const K_LAVA = 5
const K_ROCK = 6
const K_BORDER = 7
const K_ACID = 8
const K_MAX = 9

const WIDTH = 100
const HEIGHT = WIDTH
const D = 1/WIDTH


const world_ = new_world({
  width: WIDTH,
  height: HEIGHT,
})



const debug_canvas = document.querySelector("#debug_canvas")
const debug_context = debug_canvas.getContext('2d')
resize(debug_canvas)
clear(debug_context)
// for (let y = 0; y < world_.grid.height; y++) {
//   for (let x = 0; x < world_.grid.width; x++) {
//     const gid = x + y * world_.grid.width
//     const fx = x / world_.grid.width + world_.grid.cs
//     const fy = y / world_.grid.height + world_.grid.cs
//     fill_text(debug_context, {
//       x: fx,
//       y: fy,
//     }, world_.grid.cells[gid].size ? world_.grid.cells[gid].size : "", 10)
//     // console.log(gid, fx + world_.grid.cs)
//   }
// }



// for
const plouf = () => {
  // clear(debug_context)
  tick({
    world: world_,
  })
  draw_world({
    world: world_, 
    context: debug_context
  })
  window.requestAnimationFrame(plouf)
}

plouf()
throw""

const world = {
  width: WIDTH,
  height: HEIGHT,
  items: {},
  d: D,
  map: [],
  particles : [],
  spheres: [],
  deltas : [],
  grid: {
    width: WIDTH ,
    height: HEIGHT  ,
    data: []
  },
  particle_count: 0,
  ngids: [],
  max_particles: 0,
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


const scene = new THREE.Scene();
const width = 2/D
const height = 2/D
const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerHeight, window.innerHeight );
document.querySelector("#three_render_wrapper").appendChild( renderer.domElement );
const materials = [new THREE.MeshBasicMaterial( { color: 0xdd44dd, wireframe: false } )]
for (let index = 0; index < K_MAX; index++) {
  materials.push(materials[K_DEFAULT])
}
materials[K_ENERGY] = new THREE.MeshBasicMaterial( { color: 0xdddd44, wireframe: false } )
materials[K_P0] = new THREE.MeshBasicMaterial( { color: 0xf74608, wireframe: false } )
materials[K_P1] = new THREE.MeshBasicMaterial( { color: 0x009fff, wireframe: false } )
materials[K_DEFAULT] = new THREE.MeshBasicMaterial( { color: 0x44dd44, wireframe: false } )
materials[K_WATER] = new THREE.MeshBasicMaterial( { color: 0x90E0FB, wireframe: false } )
materials[K_LAVA] = new THREE.MeshBasicMaterial( { color: 0xfbac90, wireframe: false } )
materials[K_ROCK] = new THREE.MeshBasicMaterial( { color: 0x6e4e2e, wireframe: false } )
materials[K_BORDER] = new THREE.MeshBasicMaterial( { color: 0x484441, wireframe: false } )
materials[K_ACID] = new THREE.MeshBasicMaterial( { color: 0x44dd44, wireframe: false } )
const geometry = new THREE.SphereGeometry(1, 6,6);
camera.position.z = 1/D * 1.5;
camera.position.x = 1/D ;
camera.position.y = 1/D;


for (let i = 0; i < world.max_particles; i++) {
  world.free_particles.add(i)
  world.particles.push({pid:i})
  world.spheres.push( new THREE.Mesh( geometry, materials[K_DEFAULT] ) )
  scene.add( world.spheres[i] );
}


const add_particle = ({x,y,k,dx,dy}) => {
  let pid = world.free_particles.keys().next().value
  if (pid === undefined) {
    pid = world.particles.length
    world.particles.push({pid:pid})
    world.spheres.push( new THREE.Mesh( geometry, materials[K_DEFAULT] ) )
    scene.add( world.spheres[pid] );
  }
  const gid = parseInt(x * world.grid.width) + parseInt(y * world.grid.height) * world.grid.width
  world.spheres[pid].material = materials[k]
  world.free_particles.delete(pid)
  world.particles[pid] = {
    p: {
      x:x,
      y:y
    },
    k:k,
    pp: {
      x:x-dx,
      y:y-dy,
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
  world.particle_count += 1
  return pid
}


const add_particles = () => {
  add_particle({
    x: 0.25,
    y: 0.19,
    k: K_P0,
    dx: 0,
    dy: 0,
  })
  add_particle({
    x: 0.75,
    y: 0.19,
    k: K_P1,
    dx: 0,
    dy: 0,
  })
  for (let x = WIDTH * 0.3; x < WIDTH*0.45; x++) {
    for (let y = WIDTH * 0.1; y < HEIGHT*0.3; y++) {
      add_particle({
        x: x/WIDTH*1. + D/2 + Math.random() * D/8,
        y: y/WIDTH*1. + D/2,
        k: K_LAVA,
        dx: 0,
        dy: 0,
      })
    }
  }
  for (let x = WIDTH * 0.55; x < WIDTH*0.7; x++) {
    for (let y = WIDTH * 0.1; y < HEIGHT*0.3; y++) {
      add_particle({
        x: x/WIDTH*1. + D/2 - Math.random() * D/8,
        y: y/WIDTH*1. + D/2,
        k: K_WATER,
        dx: 0,
        dy: 0,
      })
    }
  }
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < WIDTH; x++) {
      add_particle({
        x: x/WIDTH+D/2,
        y: y/HEIGHT+D*.5,
        k: K_BORDER,
        dx: 0,
        dy: 0,
      })
    }
  }
  for (let a = 0; a < WIDTH-1; a++) {
    add_particle({
      x: a*D + D,
      y: D,
      k: K_BORDER,
      dx: 0,
      dy: 0,
    })
  }
  for (let b = 0; b < 2; b++) {
    for (let a = 0; a < WIDTH; a++) {
      add_particle({
        y: a*D + D*.5,
        x: b*D + D*.5,
        k: K_BORDER,
        dx: 0,
        dy: 0,
      })
    }
  }
  for (let a = 0; a < WIDTH-1; a++) {
    add_particle({
      y: a*D + D,
      x: D,
      k: K_BORDER,
      dx: 0,
      dy: 0,
    })
  }


  for (let b = WIDTH-2; b < WIDTH; b++) {
    for (let a = 0; a < WIDTH; a++) {
      add_particle({
        y: a*D + D*.5,
        x: b*D + D*.5,
        k: K_BORDER,
        dx: 0,
        dy: 0,
      })
    }
  }
  for (let a = 0; a < WIDTH-1; a++) {
    add_particle({
      y: a*D + D,
      x: (WIDTH-1)*D,
      k: K_BORDER,
      dx: 0,
      dy: 0,
    })
  }

  for (let b = WIDTH-2; b < WIDTH; b++) {
    for (let a = 0; a < WIDTH; a++) {
      add_particle({
        x: a*D + D*.5,
        y: b*D + D*.5,
        k: K_BORDER,
        dx: 0,
        dy: 0,
      })
    }
  }
  for (let a = 0; a < WIDTH-1; a++) {
    add_particle({
      x: a*D + D,
      y: (WIDTH-1)*D,
      k: K_BORDER,
      dx: 0,
      dy: 0,
    })
  }


}
// add_particles()


const add_particles_2 = () => {
  for (let x = 0.25; x < 0.9; x+=world.d*1.1) {
    for (let y = 0.25 ; y < 0.9; y+=world.d*1.1) {
      add_particle({
        x: x + Math.random() * world.d*0.1,
        y: y,
        k: K_WATER,
        dx: 0,
        dy: 0,
      })
    }
  }
}

add_particles_2()


const update_grid = () => {
  for (const cell of world.grid.data) {
    cell.clear()
  }
  for (const particle of world.particles) {
    if (particle.live){
      particle.gid = parseInt(particle.p.y * world.grid.width) + parseInt(particle.p.x * world.grid.height) * world.grid.width
      world.grid.data[particle.gid].add(particle.pid)
      world.spheres[particle.pid].position.x = particle.p.x / D * 2
      world.spheres[particle.pid].position.y = particle.p.y / D * 2 
      world.spheres[particle.pid].position.z = 0
    } else {
      world.spheres[particle.pid].position.z = -10000
    }
  }
}


const key_downs = {}
const key_press = {}


const down_key = (id) => {
  if (!key_downs[id]) {
    if (!key_press[id]) {
      key_press[id] = 0
    }
    key_press[id] += 1
  }
  key_downs[id] = true
  // console.log( key_press[id] )
}
const up_key = (id) => {
  key_downs[id] = false
}


document.addEventListener("keydown", (e) => {
  down_key(e.key)
});
document.addEventListener("keyup", (e) => {
  up_key(e.key)
});


const players = [{
  energy: 32,
  life: 5000,
  keys: {
    up: 'z',
    right: 'd',
    left: 'q',
    down: 's',
    absorb: 'a',
    spell1: 'e',
    spell2: 'r', 
  }
}, {
  energy: 32,
  life: 5000,
  keys: {
    up: 'o',
    right: 'm',
    left: 'k',
    down: 'l',
    absorb: 'p',
    spell1: 'i',
    spell2: 'j',
  }
}]


const delete_particle = (pid) => {
  world.particles[pid].live = false
  world.free_particles.add(pid)
  world.particle_count -= 1
}


const step = () => {
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

  if (players[0].acceleration) {
    world.particles[0].compute.v.x += 0.000025 * players[0].acceleration.x;
    world.particles[0].compute.v.y += 0.00005 * players[0].acceleration.y;
  }
  


  //
  // Movements
  //
  if (key_press[players[0].keys.up]) {
    key_press[players[0].keys.up] -= 1;
    world.particles[0].compute.v.y += 0.002;
  }
  if (key_press[players[0].keys.down]) {
    key_press[players[0].keys.down] -= 1;
    world.particles[0].compute.v.y -= 0.0009;
  }
  if (key_press[players[0].keys.right]) {
    key_press[players[0].keys.right] -= 1;
    world.particles[0].compute.v.x += 0.0009;
  }
  if (key_press[players[0].keys.left]) {
    key_press[players[0].keys.left] -= 1;
    world.particles[0].compute.v.x -= 0.0009;
  }
  if (key_press[players[0].keys.absorb]) {
    key_press[players[0].keys.absorb] -= 1;
    const pid = 0;
    const p1 = world.particles[pid]
    for (const ngid of world.ngids[p1.gid] ) {
      for (const pid2 of world.grid.data[ngid]) {
        if (pid2 != p1.pid) {
          const p2 = world.particles[pid2]
          if ( (p2.k == K_ROCK || p2.k == K_LAVA) && are_colliding(p1,p2, 1.4) ) {
            delete_particle(pid2)
            players[pid].energy += 1
          }
        }
      }
    }
  }

  if (key_press[players[1].keys.up]) {
    key_press[players[1].keys.up] -= 1;
    world.particles[1].compute.v.y += 0.002;
  }
  if (key_press[players[1].keys.right]) {
    key_press[players[1].keys.right] -= 1;
    world.particles[1].compute.v.x += 0.0009;
  }
  if (key_press[players[1].keys.left]) {
    key_press[players[1].keys.left] -= 1;
    world.particles[1].compute.v.x -= 0.0009;
  }
  if (key_press[players[1].keys.absorb]) {
    key_press[players[1].keys.absorb] -= 1;
    const pid = 1;
    const p1 = world.particles[pid]
    for (const ngid of world.ngids[p1.gid] ) {
      for (const pid2 of world.grid.data[ngid]) {
        if (pid2 != p1.pid) {
          const p2 = world.particles[pid2]
          if ( (p2.k == K_ROCK || p2.k == K_WATER) && are_colliding(p1,p2, 1.4) ) {
            delete_particle(pid2)
            players[pid].energy += 1
          }
        }
      }
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
            if ( (p1.k === K_LAVA && p2.k === K_WATER) || (p2.k === K_LAVA && p1.k === K_WATER) ) {
              p1.k = K_ROCK
              p2.k = K_ROCK
              world.spheres[p1.pid].material = materials[K_ROCK] 
              world.spheres[p2.pid].material = materials[K_ROCK] 
            }
            if ( 
                ( p1.k === K_ACID && ( p2.k == K_ROCK || p2.k == K_LAVA ||  p2.k == K_WATER ))
              ||( p2.k === K_ACID && ( p1.k == K_ROCK || p1.k == K_LAVA ||  p1.k == K_WATER ))
            ) {
              delete_particle(p1.pid)
              delete_particle(p2.pid)
            }
            


            if ( p1.k === K_P0 && ( p2.k === K_ACID || p2.k === K_WATER ) ) {
              delete_particle(p2.pid)
              players[0].life -= 1;
            }
            if ( p2.k === K_P0 && ( p1.k === K_ACID || p1.k === K_WATER ) ) {
              delete_particle(p1.pid)
              players[0].life -= 1;
            }


            if ( p1.k === K_P1 && ( p2.k === K_ACID || p2.k === K_LAVA ) ) {
              delete_particle(p2.pid)
              players[1].life -= 1;
            }
            if ( p2.k === K_P1 && ( p1.k === K_ACID || p1.k === K_LAVA ) ) {
              delete_particle(p1.pid)
              players[1].life -= 1;
            }

            
            if ( players[0].life <= 0 ) {
              alert("#1 Wins")
            }
            if ( players[1].life <= 0 ) {
              alert("#0 Wins")
            }


            {
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
      }
      p1.n = n
    }
  }
  for (const p1 of world.particles) {
    if(p1.live) {
      let dpx = (p1.p.x - p1.pp.x) * velocity_damping
      const abs_ = Math.abs( p1.v.x) + Math.abs( p1.v.y)
      let applied_gravity = 0
      if (gravity) {
        applied_gravity = Math.min( Math.sqrt( abs_  / gravity * 100000 ) + 0.01, 1.0) * gravity
      }
      let dpy = (p1.p.y - p1.pp.y) * velocity_damping - applied_gravity
      p1.pppp.x = p1.ppp.x
      p1.pppp.y = p1.ppp.y
      p1.ppp.x = p1.pp.x
      p1.ppp.y = p1.pp.y
      if (p1.k !== K_BORDER && p1.k !== K_ROCK) {
        p1.pp.x = p1.p.x + p1.compute.p.x * pp_ratio
        p1.pp.y = p1.p.y + p1.compute.p.y * pp_ratio
        p1.p.x += dpx + p1.compute.p.x + p1.compute.v.x
        p1.p.y += dpy + p1.compute.p.y + p1.compute.v.y
      }
    }
  }
  for (const particle of world.particles) {
    if(particle.live) {
      particle.v.x = particle.p.x - particle.pp.x
      particle.v.y = particle.p.y - particle.pp.y
      if ( particle.p.x < D/2 || particle.p.x > 1.0-D/2 ) {
        particle.v.x = - particle.v.x*interd_ratio;
        particle.p.x += particle.v.x;
      }
      if ( particle.p.y < D/2 || particle.p.y > 1.0-D/2 ) {
        particle.v.y = - particle.v.y*interd_ratio;
        particle.p.y += particle.v.y;
      }
      particle.pp.x = particle.p.x - particle.v.x
      particle.pp.y = particle.p.y - particle.v.y
      particle.p.x = Math.max(particle.p.x, D/2)
      particle.p.x = Math.min(particle.p.x, 1.0-D/2)
      particle.p.y = Math.max(particle.p.y, D/2)
      particle.p.y = Math.min(particle.p.y, 1.0-D/2)
    }
  }

  //
  // Spells
  //
  if (key_press[players[0].keys.spell1]) {
    key_press[players[0].keys.spell1] -= 1;
    if ( players[0].energy >= 4) { 
      players[0].energy -= 4
      const pid = 0;
      const p1 = world.particles[pid]
      add_particle({
        x:p1.p.x+D*1.0,
        y:p1.p.y+D*0.0,
        k:K_LAVA,
        dx: D*0.25,
        dy: D*0.0000,
      })
      add_particle({
        x:p1.p.x+D*2.0,
        y:p1.p.y+D*0.0,
        k:K_LAVA,
        dx: D*0.25,
        dy: D*0.0000,
      })
      add_particle({
        x:p1.p.x+D*2.0,
        y:p1.p.y+D*1.0,
        k:K_LAVA,
        dx: D*0.25,
        dy: D*0.0000,
      })
      add_particle({
        x:p1.p.x+D*1.0,
        y:p1.p.y+D*1.0,
        k:K_LAVA,
        dx: D*0.25,
        dy: D*0.0000,
      })
    }
  }
  if (key_press[players[0].keys.spell2] ) {
    key_press[players[0].keys.spell2] -= 1;
    if (players[0].energy >= 8) {
      players[0].energy -= 8
      const pid = 0;
      const p1 = world.particles[pid]
      add_particle({
        x:p1.p.x+D*1.0,
        y:p1.p.y+D*0.0,
        k:K_ACID,
        dx: D*0.25,
        dy: D*0.0000,
      })
      add_particle({
        x:p1.p.x+D*2.0,
        y:p1.p.y+D*0.0,
        k:K_ACID,
        dx: D*0.25,
        dy: D*0.0000,
      })
      add_particle({
        x:p1.p.x+D*2.0,
        y:p1.p.y+D*1.0,
        k:K_ACID,
        dx: D*0.25,
        dy: D*0.0000,
      })
      add_particle({
        x:p1.p.x+D*1.0,
        y:p1.p.y+D*1.0,
        k:K_ACID,
        dx: D*0.25,
        dy: D*0.0000,
      })
    }
  }
  if (key_press[players[1].keys.spell1]) {
    key_press[players[1].keys.spell1] -= 1;
    if ( players[1].energy >= 4) { 
      players[1].energy -= 4
      const pid = 1;
      const p1 = world.particles[pid]
      add_particle({
        x:p1.p.x-D*1.0,
        y:p1.p.y+D*0.0,
        k:K_WATER,
        dx: -D*0.25,
        dy: D*0.0000,
      })
      add_particle({
        x:p1.p.x-D*2.0,
        y:p1.p.y+D*0.0,
        k:K_WATER,
        dx: -D*0.25,
        dy: D*0.0000,
      })
      add_particle({
        x:p1.p.x-D*2.0,
        y:p1.p.y+D*1.0,
        k:K_WATER,
        dx: -D*0.25,
        dy: D*0.0000,
      })
      add_particle({
        x:p1.p.x-D*1.0,
        y:p1.p.y+D*1.0,
        k:K_WATER,
        dx: -D*0.25,
        dy: D*0.0000,
      })
    }
  }
  if (key_press[players[1].keys.spell2] ) {
    key_press[players[1].keys.spell2] -= 1;
    if (players[1].energy >= 8) {
      players[1].energy -= 8
      const pid = 1;
      const p1 = world.particles[pid]
      add_particle({
        x:p1.p.x-D*1.0,
        y:p1.p.y+D*0.0,
        k:K_ACID,
        dx: -D*0.25,
        dy: D*0.0000,
      })
      add_particle({
        x:p1.p.x-D*2.0,
        y:p1.p.y+D*0.0,
        k:K_ACID,
        dx: -D*0.25,
        dy: D*0.0000,
      })
      add_particle({
        x:p1.p.x-D*2.0,
        y:p1.p.y+D*1.0,
        k:K_ACID,
        dx: -D*0.25,
        dy: D*0.0000,
      })
      add_particle({
        x:p1.p.x-D*1.0,
        y:p1.p.y+D*1.0,
        k:K_ACID,
        dx: -D*0.25,
        dy: D*0.0000,
      })
    }
  }
  update_grid()
}


let fps = 0
let ups = 0
let avg_fps = 0
let avg_ups = 0
let last_draw = performance.now()
let last_compute = performance.now()
let frames = 0
let start = performance.now()
let steps = 0
let compute_duration = 0

const draw = () => {
  renderer.render( scene, camera );
  fps = 1000/(performance.now()-last_draw)
  last_draw = performance.now()
  document.querySelector("#fps").innerHTML = `FPS: ${parseInt(fps)}`
  document.querySelector("#ups").innerHTML = `UPS: ${parseInt(ups)}`
  document.querySelector("#avg_fps").innerHTML = `AVG FPS: ${parseInt(avg_fps)}`
  document.querySelector("#avg_ups").innerHTML = `AVG UPS: ${parseInt(avg_ups)}`
  document.querySelector("#player_0_energy").innerHTML = `#0.energy: ${parseInt(players[0].energy)}`
  document.querySelector("#player_1_energy").innerHTML = `#0.energy: ${parseInt(players[1].energy)}`
  document.querySelector("#player_0_life").innerHTML = `#0.life: ${parseInt(players[0].life)}`
  document.querySelector("#player_1_life").innerHTML = `#0.life: ${parseInt(players[1].life)}`
  document.querySelector("#particles_count").innerHTML = `Parts: ${parseInt(world.particle_count)}`
  document.querySelector("#compute").innerHTML = `Compute duration: ${parseInt(compute_duration)}ms`
  frames += 1
  avg_fps = 1000 / (performance.now() - start) * frames
  window.requestAnimationFrame(draw)
}


const compute = () => {
  const start_ = performance.now()
  players[0].energy += ENERGY_RATE;
  players[1].energy += ENERGY_RATE;
  players[0].energy = Math.min(players[0].energy, 100);
  players[1].energy = Math.min(players[1].energy, 100);
  for (let index = 0; index < LOOPINGS; index++) {
    step()
  }
  ups = 1000/(performance.now()-last_compute)
  last_compute = performance.now()
  steps += 1
  avg_ups = 1000 / (performance.now() - start) * steps
  compute_duration = performance.now() - start_
  setTimeout(compute, 0)
}


window.addEventListener("gamepadconnected", (e) => {
  if (!players[0].gamepad_id) {
    players[0].gamepad_id = e.gamepad.index
    console.log(`#0: gamepad = ${players[0].gamepad_id}`)
    console.log(navigator.getGamepads()[0])
    players[0].gamepad = navigator.getGamepads()[0]
  }
});

const gamepad_events = () => {
  if (players[0].gamepad) {
    const buttons_mappings = {
      // 0: 'z', // A 
      15: 'e', // gachett gauche
      16: 'r', // gachette droite
      // 3: 'e', // X
      // 4: 'r', // Y
      1: 's', // b
    }
    for (let index = 0; index < players[0].gamepad.buttons.length; index++) {
      if ( players[0].gamepad.buttons[index].pressed ) {
        down_key(buttons_mappings[index])
        console.log(index)
      } else {
        up_key(buttons_mappings[index])
      }
    }
    const arrows_value = parseInt(players[0].gamepad.axes[4] * 100)
    if ( arrows_value == -42 ) {
      down_key('d')
    } else {
      up_key('d')
    }
    if ( arrows_value == 71 ) {
      down_key('q')
    } else {
      up_key('q')
    }
    if ( arrows_value === -100 ) {
      down_key('z')
    } else {
      up_key('z')
    }
    if ( arrows_value == 14 ) {
      down_key('s')
    } else {
      up_key('s')
    }

    players[0].acceleration = {
      x: players[0].gamepad.axes[0],
      y: -players[0].gamepad.axes[1],
    }

  }
  setTimeout(gamepad_events, 0)
}


draw()
update_grid()
compute()
// gamepad_events()


console.log("Player #0: press any button")
