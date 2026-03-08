let auto_step = true
// auto_step = false
const steps_to_run = 12


import { resize_square } from "./canvas.js"
import {
  setup_webgpu,
  render,
} from "./webgpu.js"
import { imgs } from "./block.js"


// We won't go under 64/256 for rgb values
// 64 is ok
const limit = 64;


const Kind = Object.freeze({
  void: 0,
  pixel: 1,
  down: 2,
  right: 3,
  left: 4,
  up: 5,
  split_left_right: 6,
  split_up_down: 7,
  mix_to_left: 8,
});


const Direction = Object.freeze({
  right: "right",
  down: "down",
  left: "left",
  up: "up",
});


const organize = (transforms, iter=0) => {
  // console.log(structuredClone(transforms))
  if (iter > 10) {
    throw "too many iter"
  }
  for (const transform of transforms) {
    if (transform.deletes) {
      for (const delete_ of transform.deletes) {
        for (let index = 0; index < transforms.length; index++) {
          const transform_2 = transforms[index];
          if ( 
            transform_2.inputs 
            && transform_2.inputs.length==1 
            && transform_2.inputs[0].i == delete_.i 
          ) {
            transforms[index] = {
              inputs:[],
              outputs:[],
            }
          }
        }
      }
    }
  }
  // console.log(structuredClone(transforms))
  const blocks_next = {}
  const conflicts = new Set()
  for (const transform of transforms) {
    for (const output of transform.outputs) {
      const bn = blocks_next[output.i]
      if ( bn === undefined ) {
        blocks_next[output.i] = structuredClone(output.b)
      } else {
        conflicts.add(output.i)
      }
    }
  }
  if (conflicts.size != 0) {
    for (const conflict of conflicts) {
      for (const transform of transforms) {
        if (transform.outputs.some( o => o.i == conflict )) {
          transform.outputs = structuredClone(transform.inputs)
          transform.deletes = []
        }
      }
    }
    return organize(transforms, iter+1)
  } else {
    return blocks_next
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


const continue_from_to = (i, b, inew) => {
  return {
      inputs: [{
        i:i,
        b:structuredClone(b),
      }],
      outputs:[{
        i:inew,
        b:structuredClone(b)
      }]
    }
}


const go_from_to = (i, b, inew, direction) => {
  const bo = structuredClone(b)
  bo.direction = direction
  return {
    inputs: [
      {
        i:i,
        b:structuredClone(b),
      }
    ],
    outputs:[
      {
        i:inew,
        b:bo,
      }
    ],
  }
}


const step = (world) => {
  // console.log("######### Step")
  const transforms = []
  for (let y = 0; y < world.unit_count; y++) {
    for (let x = 0; x < world.unit_count; x++) {
      // Setups is
      const i = x + y * world.unit_count
      const id = down(i, world.unit_count)
      const il = left(i, world.unit_count)
      const ir = right(i, world.unit_count)
      const iu = up(i, world.unit_count)
      // Setup blocks
      const b = world.blocks[i]
      const br = world.blocks[ir]
      const bd = world.blocks[id]
      const bl = world.blocks[il]
      const bu = world.blocks[iu]
      //
      // Create transforms
      //
      if (b.k == Kind.pixel) {
        //
        // Go to
        //
        if (
          br.k == Kind.down && b.direction == Direction.right  
          || bl.k == Kind.down && b.direction == Direction.left  
        ) {
          transforms.push(go_from_to(i,b,id, Direction.down))
        } else if (
          bd.k == Kind.left || bu.k == Kind.left
        ) {
          transforms.push(go_from_to(i,b,il, Direction.left))
        } else if (
          bl.k == Kind.up && b.direction == Direction.left
          || br.k == Kind.up && b.direction == Direction.right  
        ) {
          transforms.push(go_from_to(i,b,iu, Direction.up))
        } else if (bu.k == Kind.right || bd.k == Kind.right) {
          transforms.push(go_from_to(i,b,ir, Direction.right))
        } 
        // 
        // Split
        //
        else if (
          bd.k == Kind.split_left_right
        ) {
          transforms.push({
            inputs: [
              {
                i:i,
                b:structuredClone(b),
              }
            ],
            outputs:[
              {
                i: il,
                b: {
                  k: Kind.pixel,
                  r: b.r / 2,
                  g: b.g / 2,
                  b: b.b / 2,
                  direction: Direction.left,
                }
              }, {
                i: ir,
                b: {
                  k: Kind.pixel,
                  r: b.r / 2,
                  g: b.g / 2,
                  b: b.b / 2,
                  direction: Direction.right,
                }
              }
            ],
          })
        } else if (
          (
            br.k == Kind.split_up_down
            || bl.k == Kind.split_up_down
          ) && (b.r > limit || !b.r) && (b.g > limit || !b.g) && (b.b > limit || !b.b)
        ) {
          transforms.push({
            inputs: [
              {
                i:i,
                b:structuredClone(b),
              }
            ],
            outputs:[
              {
                i: iu,
                b: {
                  k: Kind.pixel,
                  r: b.r / 2,
                  g: b.g / 2,
                  b: b.b / 2,
                  direction: Direction.up,
                }
              }, {
                i: id,
                b: {
                  k: Kind.pixel,
                  r: b.r / 2,
                  g: b.g / 2,
                  b: b.b / 2,
                  direction: Direction.down,
                }
              }
            ],
          })
        }  
        // 
        // Continue movement (or static)
        // 
        else if (b.direction == Direction.right) {
          transforms.push(continue_from_to(i, b, ir))
        } else if (
          b.direction == Direction.down
          && bd.Kind != Kind.mix_to_left
        ) {
          transforms.push(continue_from_to(i, b, id))
        } else if (b.direction == Direction.left) {
          transforms.push(continue_from_to(i, b, il))
        } else if (
          b.direction == Direction.up
          && bu.Kind != Kind.mix_to_left
        ) {
          transforms.push(continue_from_to(i, b, iu))
        } else {
          transforms.push(continue_from_to(i, b, i))
        }
      // 
      // Mixers
      // 
      } else if (
        b.k == Kind.mix_to_left
        && bu.k == Kind.pixel 
        && bd.k == Kind.pixel
      ) {
        transforms.push({
          inputs: [
            {
              i:i,
              b:structuredClone(b),
            }, {
              i:iu,
              b:structuredClone(bu),
            }, {
              i:id,
              b:structuredClone(bd),
            }
          ],
          outputs:[
            {
              i:i,
              b:structuredClone(b),
            }, {
              i: il,
              b: {
                k: Kind.pixel,
                r: bu.r + bd.r,
                g: bu.g + bd.g,
                b: bu.b + bd.b,
                direction: Direction.left,
              }
            }
          ],
          deletes: [
            {
              i:iu,
            },
            {
              i:id,
            },
          ]
        })
      } 
      //
      // Default
      //
      else if (b.k != Kind.void) {
        transforms.push({
          inputs: [
            {
              i:i,
              b:structuredClone(b),
            }
          ],
          outputs:[
            {
              i:i,
              b:structuredClone(b),
            }
          ]
        })
      } else if (b.k == Kind.void) {
        // pass
      } else {
        throw "error"
      }
    }
  }
  // 
  const blocks_next = organize(transforms)
  //
  for (let y = 0; y < world.unit_count; y++) {
    for (let x = 0; x < world.unit_count; x++) {
      const i = x + y * world.unit_count
      if (blocks_next[i]) {
        world.blocks[i] = structuredClone(blocks_next[i])
      } else {
        world.blocks[i] = {
          k: Kind.void,
        }
      }
    }
  }
  world.tick += 1
  setTimeout( () => {
    if (auto_step) {
      step(world)
    }
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
  /////////////////////////////////////////////
  world.blocks[0] = {
    k: Kind.pixel,
    direction: Direction.right,
    r: 256,
    g: 0,
    b: 0,
  }
  world.blocks[1] = {
    k: Kind.pixel,
    direction: Direction.right,
    r: 256,
    g: 256,
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
    k: Kind.up,
  })
  set_block(world, 15, 15, {
    k: Kind.pixel,
    r: 256,
    g: 256,
    b: 0,
  })
  set_block(world, 9, 3, {
    k: Kind.split_left_right,
  })
  set_block(world, 11, 2, {
    k: Kind.split_up_down,
  })
  ////////////////
  set_block(world, 16, 16, {
    k: Kind.mix_to_left,
  })
  set_block(world, 16, 19, {
    k: Kind.pixel,
    r: 256,
    g: 256,
    b: 0,
    direction: Direction.up,
  })
  set_block(world, 16, 13, {
    k: Kind.pixel,
    r: 0,
    g: 0,
    b: 128+64,
    direction: Direction.down,
  })
  //
  if (auto_step) {
    step(world)
  } else {
    for (let index = 0; index < steps_to_run; index++) {
      step(world)
    }
  }
  render(wgpu, world)
}


main()
