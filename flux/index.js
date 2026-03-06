import { resize_square } from "./canvas.js"
import {
  setup_webgpu,
  render,
} from "./webgpu.js"
import { imgs } from "./block.js"

const Kind = Object.freeze({
  void: 0,
  pixel: 1,
  down: 2
});
const Direction = Object.freeze({
  right: "right",
  down: "down",
});
const Direction2 = Object.freeze({
  right: [1,0],
});


const step = (world) => {
  for (let y = 0; y < world.unit_count; y++) {
      for (let x = 0; x < world.unit_count; x++) {
        const i = x + y * world.unit_count
        world.blocks_next[i] = []
      }
  }
  for (let y = 0; y < world.unit_count; y++) {
    for (let x = 0; x < world.unit_count; x++) {
      const i = x + y * world.unit_count
      const b = world.blocks[i]
      const br = world.blocks[i+1]
      if (b.k == Kind.pixel) {
        if (br.k == Kind.down) {
          world.blocks_next[i + world.unit_count].push(
            {i:i, 
            direction:Direction.down,}
          )
        }
        else if (b.direction == Direction.right) {
          world.blocks_next[i + 1].push({
            i:i,
          })
        }
        else if (b.direction == Direction.down) {
          world.blocks_next[i + world.unit_count].push({
            i:i,
          })
        }
      }
      if (b.k == Kind.down) {
        world.blocks_next[i].push({i:i})
      }
    }
  }
  for (let y = 0; y < world.unit_count; y++) {
    for (let x = 0; x < world.unit_count; x++) {
      const i = x + y * world.unit_count
      if (world.blocks_next[i].length > 1) {
        throw "woop"
      }
    }
  }
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
        throw "error"
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
  }, 1000*0.1);
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
  world.blocks[10] = {
    k: Kind.down,
  }
  step(world)
  // step(world)
  render(wgpu, world)
}


main()
