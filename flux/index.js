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
import {skip_color} from "./skip_color.js"
import {organize} from "./organize.js"


const score = {}
const flow_rate = []


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
    } else {
      const kind = "void"
      set_block(world, gridX, gridY, { k: Kind[kind] });
      console.log(`set_block(${gridX}, ${gridY}, ${kind})`);
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
  t04(world)
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
