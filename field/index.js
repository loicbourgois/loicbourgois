import {setup_webgpu, run} from './webgpu.js'
import {resize_square} from './canvas.js'


const main = async () => {
  const canvas = document.getElementById("canvas")
  const alignement = 32
  resize_square({
    canvas: canvas,
    canvas_scaling: 0.9, 
    resolution_scaling: 2, 
    alignement: alignement,
  })
  run(await setup_webgpu({
    canvas: canvas,
    gravity_resolution: 32,
  }))
}


main()
