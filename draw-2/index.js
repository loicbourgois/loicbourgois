import { resize_square } from "./canvas.js"
import {setup_webgpu,render} from './webgpu.js'
const canvas = document.getElementById("canvas")
const zoom = 2
resize_square(canvas, 0.8, 1, zoom)
function getMousePos(e) {
  return {x:e.clientX,y:e.clientY};
}
let lastx = null
let lasty = null
let wgpu
let intensiy = 1.0
const intensiy_ratio = 0.98
const intensiy_max = 0.4
document.onmousemove=function(e) {
  var mousecoords = getMousePos(e);
  document.getElementById("cursor").style.top = `${parseInt(mousecoords.y)}px`
  document.getElementById("cursor").style.left = `${parseInt(mousecoords.x)}px`
  const rect = canvas.getBoundingClientRect()
  const x = parseInt(mousecoords.x - rect.left) * zoom
  const y = parseInt(mousecoords.y - rect.top) * zoom
  if (x!=lastx || y !=lasty) {
    // intensiy = intensiy*intensiy_ratio
  } else {
    intensiy = intensiy_max
  }
  intensiy = Math.min(Math.max(intensiy, 0.1), intensiy_max)
  if (
    x >= canvas.width
    || x < 0
    || y >= canvas.height
    || y < 0
    || ( x == lastx && y == lasty )
  ) {
    return
  }
  const mid = (x + y * canvas.width)
  const new_intensity = Math.min(Math.max(wgpu.mask_data[mid] + intensiy, 0.0), 1.0)
  wgpu.mask_data.set([new_intensity], mid)
  lastx = x
  lasty = y
};
const main = async () => {
  wgpu = await setup_webgpu(canvas)
  for (let index = 0; index < 10000; index++) {
    wgpu.mask_data[parseInt(Math.random()*canvas.width*canvas.height)] = Math.random()
  }
  render(wgpu)
  // draw()
}
main()
