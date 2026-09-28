import {run} from './run.js'
import {setup} from './setup.js'
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
  run(await setup({
    canvas,
    background_resolution,
    dispatch_count: [4, 4, 4],
  }))
}


main()
