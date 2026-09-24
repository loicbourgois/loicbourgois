import {setup_webgpu, render} from './webgpu.js'
import {resize_square} from './canvas.js'


const main = async () => {
  const canvas = document.getElementById("canvas")
  resize_square({
    canvas:canvas, 
    canvas_scaling: 0.8, 
    resolution_scaling: 2, 
    alignement: 1,
  })
  render(await setup_webgpu(canvas))
}


main()
