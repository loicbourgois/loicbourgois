import { resize_square } from "./canvas.js"
import {
  setup_webgpu,
  render,
} from "./webgpu.js"
import { imgs } from "./block.js"


const step = (world) => {
  for (let y = 0; y < world.unit_count; y++) {
      for (let x = 0; x < world.unit_count; x++) {
        const i = x + y * world.unit_count
        world.blocks_next[i].k = []
      }
  } 
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
  }
  const Kind = Object.freeze({
    void: 0,
    pixel: 1,
    down: 2
  });
  const Direction = Object.freeze({
    right: [1,0],
  });
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
  render(wgpu, world)
}


main()
