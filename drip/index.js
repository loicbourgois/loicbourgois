import { resize_square } from "./canvas.js"
import {
  setup_webgpu,
  render,
  new_colors,
  new_geometry,
} from "./webgpu.js"

const new_colors_wrapper = (x) => {
  x.last_update = performance.now();
  new_colors(x.colors_buffer_data, x.layers)
  setTimeout(()=>{
    new_colors_wrapper(x)
  }, 30000/x.speed);
}
const new_geometry_wrapper = (x) => {
  x.last_update = performance.now();
  new_geometry(x.storage_buffer_a_data)
  setTimeout(()=>{
    new_geometry_wrapper(x)
  }, 30000/x.speed);
}
const main = async () => {
  document.body.style.background = '#111'
  const canvas = document.getElementById("canvas")
  const dim = Math.min(window.innerWidth, window.innerHeight)
  const div = parseInt(dim*0.85/13)
  resize_square(canvas, 0.85, div, 1)
  const wgpu = await setup_webgpu(canvas)
  render(wgpu)
  new_colors_wrapper(wgpu)
  new_geometry_wrapper(wgpu)
}
main()