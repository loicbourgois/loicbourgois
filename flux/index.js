import { resize_square } from "./canvas.js"
import {
  setup_webgpu,
  render,
} from "./webgpu.js"
import { imgs } from "./block.js"

const Kind = Object.freeze({
  void: 0,
  pixel: 1,
  down: 2,
  right: 3,
  left: 4,
  up: 5,
});
const Direction = Object.freeze({
  right: "right",
  down: "down",
  left: "left",
  up: "up",
});
const Direction2 = Object.freeze({
  right: [1,0],
});


const organize = (world) => {
  let reorganize = false
  for (let y = 0; y < world.unit_count; y++) {
    for (let x = 0; x < world.unit_count; x++) {
      const i = x + y * world.unit_count
      if (world.blocks_next[i].length > 1) {
        const tmp = structuredClone(world.blocks_next[i])
        world.blocks_next[i] = []
        reorganize = true
        for (const data of tmp) {
          world.blocks_next[data.i].push(data);
        }
        
      }
    }
  }
  if (reorganize) {
    organize(world)
  }
}


const down = (i, uc) => {
  const x = i % uc
  const y = parseInt(i / uc)
  const x_new = x;
  const y_new = (y+1) % uc;
  return x_new + y_new * uc
}


const left = (i, uc) => {
  const x = i % uc
  const y = parseInt(i / uc)
  const x_new = (x-1 + uc) % uc;
  const y_new = y;
  return x_new + y_new * uc
}

const up = (i, uc) => {
  const x = i % uc
  const y = parseInt(i / uc)
  const x_new = x;
  const y_new = (y-1+uc)%uc;
  return x_new + y_new * uc
}


const right = (i, uc) => {
  const x = i % uc
  const y = parseInt(i / uc)
  const x_new = (x+1 + uc) % uc;
  const y_new = y;
  return x_new + y_new * uc
}


const step = (world) => {
  for (let y = 0; y < world.unit_count; y++) {
      for (let x = 0; x < world.unit_count; x++) {
        const i = x + y * world.unit_count
        world.blocks_next[i] = []
      }
  }
  for (let y = 0; y < world.unit_count; y++) {
    for (let x = 0; x < world.unit_count; x++) {
      //
      const i = x + y * world.unit_count
      const id = down(i, world.unit_count)
      const il = left(i, world.unit_count)
      const ir = right(i, world.unit_count)
      const iu = up(i, world.unit_count)
      //
      const b = world.blocks[i]
      const br = world.blocks[ir]
      const bd = world.blocks[id]
      const bl = world.blocks[il]
      const bu = world.blocks[iu]
      //
      if (b.k == Kind.pixel) {
        if (
          br.k == Kind.down && b.direction == Direction.right  
          || bl.k == Kind.down && b.direction == Direction.left  
        ) {
          world.blocks_next[id].push({
            i:i, 
            direction:Direction.down,
          })
        } else if (bd.k == Kind.left || bu.k == Kind.left) {
          world.blocks_next[il].push({
            i:i, 
            direction:Direction.left,
          })
        } else if (
          bl.k == Kind.up && b.direction == Direction.left
          || br.k == Kind.up && b.direction == Direction.right  
        ) {
          world.blocks_next[iu].push({
            i:i, 
            direction:Direction.up,
          })
        } else if (bu.k == Kind.right || bd.k == Kind.right) {
          world.blocks_next[ir].push({
            i:i, 
            direction:Direction.right,
          })
        } else if (b.direction == Direction.right) {
          world.blocks_next[i + 1].push({
            i:i,
          })
        } else if (b.direction == Direction.down) {
          world.blocks_next[id].push({
            i:i,
          })
        } else if (b.direction == Direction.left) {
          world.blocks_next[il].push({
            i:i,
          })
        } else if (b.direction == Direction.up) {
          world.blocks_next[iu].push({
            i:i,
          })
        } else {
          world.blocks_next[i].push({
            i:i,
          })
        }
      }
      if (b.k == Kind.down) {
        world.blocks_next[i].push({i:i})
      }
      if (b.k == Kind.up) {
        world.blocks_next[i].push({i:i})
      }
      if (b.k == Kind.left) {
        world.blocks_next[i].push({i:i})
      }
      if (b.k == Kind.right) {
        world.blocks_next[i].push({i:i})
      }
    }
  }
  organize(world)
  for (let y = 0; y < world.unit_count; y++) {
    for (let x = 0; x < world.unit_count; x++) {
      const i = x + y * world.unit_count
      if (world.blocks_next[i].length == 1) {
        const bi = world.blocks_next[i][0].i
        const d = world.blocks_next[i][0].direction
        world.blocks_next[i] = structuredClone(world.blocks[bi])
        if (d) {
          world.blocks_next[i].direction = d
        }
      } else if (world.blocks_next[i].length == 0) {
        world.blocks_next[i] = {
          k: Kind.void
        }
      } else {
        throw "error 2"
      }
    }
  }
  for (let y = 0; y < world.unit_count; y++) {
    for (let x = 0; x < world.unit_count; x++) {
      const i = x + y * world.unit_count
      world.blocks[i] = structuredClone(world.blocks_next[i])
    }
  }
  world.tick += 1
  setTimeout(()=>{
    step(world)
  }, 1000 * 60 / 174 / 8);
}


const i = (world, x, y) => {
  return x + y * world.unit_count
}


const set_block = (world, x, y, data) => {
  world.blocks[i(world, x, y)] = data
}


const main = async () => {
  document.body.style.background = '#111'
  const canvas = document.getElementById("canvas")
  const dimension_min_window = Math.min(window.innerWidth, window.innerHeight)
  const scale = 0.95;
  const dimension_scaled = dimension_min_window * scale;
  const unit_size = 8;
  const unit_count = parseInt(dimension_min_window * scale / unit_size);
  const dimension = unit_size*unit_count;
  console.log(`unit_size:            ${unit_size}`)
  console.log(`unit_count:           ${unit_count}`)
  console.log(`dimension_min_window: ${dimension_min_window}`)
  console.log(`dimension_scaled:     ${dimension_scaled}`)
  console.log(`dimension:            ${dimension}`)
  resize_square(canvas, dimension, 1)
  const wgpu = await setup_webgpu(canvas, unit_count, imgs)
  const world = {
    blocks: [],
    unit_count: unit_count,
    blocks_next: [],
    tick: 0,
  }
  for (let y = 0; y < unit_count; y++) {
      for (let x = 0; x < unit_count; x++) {
        world.blocks.push({
          k: Kind.void,
        })
        world.blocks_next.push([])
      }
  } 
  console.log("world.blocks_next.length", world.blocks_next.length)
  world.blocks[0] = {
    k: Kind.pixel,
    direction: Direction.right,
    r: 255,
    g: 0,
    b: 0,
  }
  world.blocks[1] = {
    k: Kind.pixel,
    direction: Direction.right,
    r: 255,
    g: 255,
    b: 0,
  }
  set_block(world, 10, 0, {
    k: Kind.down,
  })
  set_block(world, 9, 11, {
    k: Kind.left,
  })
  set_block(world, 10, 12, {
    k: Kind.up,
  })
  set_block(world, 10, 13, {
    k: Kind.up,
  })

  set_block(world, 5, 10, {
    k: Kind.up,
  })

  set_block(world, 6, 5, {
    k: Kind.right,
  })

  set_block(world, 10, 6, {
    // k: Kind.down,
    k: Kind.up,
  })

  set_block(world, 15, 15, {
    k: Kind.pixel,
    r: 255,
    g: 255,
    b: 0,
  })

  step(world)
  render(wgpu, world)
}


main()
