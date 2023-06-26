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
document.onmousemove=function(e) {
  var mousecoords = getMousePos(e);
  document.getElementById("cursor").style.top = `${parseInt(mousecoords.y)}px`
  document.getElementById("cursor").style.left = `${parseInt(mousecoords.x)}px`
  const rect = canvas.getBoundingClientRect()
  const x = parseInt(mousecoords.x - rect.left) * zoom
  const y = parseInt(mousecoords.y - rect.top) * zoom
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
  wgpu.mask_data.set([1.0], mid)
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
