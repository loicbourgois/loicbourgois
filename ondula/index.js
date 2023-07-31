import {setup_webgpu, render} from './webgpu.js'
const canvas = document.getElementById("canvas")
const zoom = 2
const resize_square = (canvas, zoom, aligner, z2) => {
  let dim = Math.min(window.innerWidth, window.innerHeight)
  dim = parseInt(dim*zoom/aligner)*aligner
  canvas.width = dim*z2
  canvas.height = dim*z2
  canvas.style.width = `${parseInt(dim)}px`
  canvas.style.height = `${parseInt(dim)}px`
}
resize_square(canvas, 0.8, 1, zoom)
let wgpu
const main = async () => {
  wgpu = await setup_webgpu(canvas)
  render(wgpu)
}
main()
