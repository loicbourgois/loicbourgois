import {setup_webgpu, run} from './webgpu.js'
import {resize_fullpage} from './canvas.js'


const main = async () => {
  const canvas = document.getElementById("canvas")
  const background_resolution = 64
  resize_fullpage({
    canvas: canvas,
    canvas_scaling: 0.9, 
    resolution_scaling: 2, 
    alignement: background_resolution,
  })
  run(await setup_webgpu({
    canvas: canvas,
    gravity_resolution: background_resolution,
    dispatch_count: [4, 4, 4],
  }))
}


main()
