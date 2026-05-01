let auto_step = true
// auto_step = false
const steps_to_run = 1
const speed = 2


import { resize_square } from "./canvas.js"
import { Kind } from "./kind.js"
import { add_transforms } from "./add_transforms.js"
import {
  setup_webgpu,
  render,
} from "./webgpu.js"
import { 
  imgs,
} from "./block_9.js"
import { t01 } from "./configs/t01.js"
import { t03 } from "./configs/t03.js"
import { t04 } from "./configs/t04.js"
import { t05 } from "./configs/t05.js"
import { set_block } from "./shared.js"


const organize = (transforms, iter=0) => {
  // if (iter > 100) {
  //   throw "too many iter"
  // }
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
          for (const input of transform.inputs) {
            if (input.scoring) {
              score[input.scoring] -= 1;
            }
          }
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


const score = {}
const flow_rate = []


const skip_color = (r, g, b) => {
  let c128 = 0;
  let c256 = 0;
  if (r == 128) c128 += 1 
  if (g == 128) c128 += 1 
  if (b == 128) c128 += 1 
  if (r == 256) c256 += 1 
  if (g == 256) c256 += 1 
  if (b == 256) c256 += 1 
  // if (r+g+b < 128) {
  //   return true
  // }
  if (c256 == 3) {
    return false
  }
  if (c256 == 2 && c128 == 1) {
    return false
  }
  if (c256 == 1 && c128 == 2) {
    return false
  }
  if (c256 == 1 && c128 == 1) {
    return false
  }
  // if (c128 < 1) {
  //   return true
  // }
  // if (c256 < 1) {
  //   return true
  // }
  // return false
  return true
}


const step = (world) => {
  // console.log(world.tick)
  
  if (world.tick%9 == 0) {
    const transforms = []

    flow_rate.push({})
    for (let r = 0; r <= 256; r+=128) {
      for (let g = 0; g <= 256; g+=128) {
        for (let b = 0; b <= 256; b+=128) {
          if (skip_color(r,g,b)) {
            continue
          }
          flow_rate[world.tick/9][`${r},${g},${b}`] = 0
        }
      }
    }


    for (let y = 0; y < world.unit_count; y++) {
      for (let x = 0; x < world.unit_count; x++) {
        add_transforms(x, y, world, transforms, score, flow_rate)
      }
    }
    const blocks_next = organize(transforms)
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
  }
  const flow_rate_now = flow_rate.at(-1)
  let txt = ""
  for (let r = 0; r <= 256; r+=128) {
    for (let g = 0; g <= 256; g+=128) {
      for (let b = 0; b <= 256; b+=128) {
        if (skip_color(r,g,b)) {
          continue
        }
        const s = flow_rate_now[`${r},${g},${b}`]
        if (s > 0) {
          txt += `<p style="background:rgb(${r},${g},${b})">${s}</p>`
        } else {
          txt += `<p style="background:rgb(${r},${g},${b})">-</p>`
        }
      }
    }
  }
  document.getElementById("score").innerHTML = txt
  world.tick += 1
  setTimeout( () => {
    if (auto_step) {
      step(world)
    }
  }, 1000 * 60 / 174 / 9 / speed );
}


const main = async () => {
  document.body.style.background = '#111'
  const newBlockContainer = document.getElementById("new_block");
  const radioContainer = document.createElement("div");
  radioContainer.id = "new_block_select";
  for (const kindName of Object.keys(Kind)) {
    if (["void", "create", "consume", "pixel"].includes(kindName)) {
      continue;
    }
    const label = document.createElement("label");
    label.style.display = "block";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "new_block_select";
    radio.value = kindName;
    if (!radioContainer.querySelector("input")) {
      radio.checked = true;
    }
    label.appendChild(radio);
    label.append(` ${kindName}`);
    radioContainer.appendChild(label);
  }
  newBlockContainer.appendChild(radioContainer);
  let score_counts = 0
  for (let r = 0; r <= 256; r+=128) {
    for (let g = 0; g <= 256; g+=128) {
      for (let b = 0; b <= 256; b+=128) {
        if (skip_color(r,g,b)) {
          continue
        }
        const color_id = `${r},${g},${b}`
        console.log(color_id)
        score[color_id] = 0
        flow_rate[color_id] = []
        score_counts += 1
      }
    }
  }
  console.log(`score_counts: ${score_counts}`)
  const canvas = document.getElementById("canvas")
  const dimension_min_window = Math.min(window.innerWidth, window.innerHeight)
  const scale = 0.95;
  const dimension_scaled = dimension_min_window * scale;
  const zoom_pixels = 4;
  const unit_size = 9*zoom_pixels;
  const unit_count = parseInt(dimension_min_window * scale / unit_size);
  const dimension = unit_size*unit_count;
  console.log(`unit_size:            ${unit_size}`)
  console.log(`unit_count:           ${unit_count}`)
  console.log(`dimension_min_window: ${dimension_min_window}`)
  console.log(`dimension_scaled:     ${dimension_scaled}`)
  console.log(`dimension:            ${dimension}`)
  resize_square(canvas, dimension, 1)
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const gridX = Math.floor(x / unit_size);
    const gridY = Math.floor(y / unit_size);
    const i = gridX + gridY * unit_count;
    const currentBlock = world.blocks[i];
    console.log(currentBlock)
    if (!currentBlock || currentBlock.k === Kind.void || currentBlock.k === Kind.pixel) {
      const kindElement = document.querySelector("input[name='new_block_select']:checked");
      const kind = kindElement ? kindElement.value : "void";
      set_block(world, gridX, gridY, { k: Kind[kind] });
      console.log(`set_block(${gridX}, ${gridY}, ${kind})`);
      // const kind = document.getElementById("new_block_select").value
      // set_block(world, gridX, gridY, { k: Kind[kind] });
      // console.log(`set_block(${gridX}, ${gridY}, ${kind})`);
    } else {
      const kind = "void"
      set_block(world, gridX, gridY, { k: Kind[kind] });
      console.log(`set_block(${gridX}, ${gridY}, ${kind})`);
      // console.log(`Clicked on existing block of kind ${currentBlock.k} at (${gridX}, ${gridY})`);
    }
  });

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const gridX = Math.floor(x / unit_size);
    const gridY = Math.floor(y / unit_size);
    const i = gridX + gridY * unit_count;
    const currentBlock = world.blocks[i];
    document.getElementById("debug").value = JSON.stringify({
      x: gridX,
      y: gridY,
      "block": currentBlock,
    }, null, 2)
  });

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
  t05(world)
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

