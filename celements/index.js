import { 
  new_world,
  draw_world,
  tick,
} from "./world.js"
import { 
  resize,
} from "./canvas.js"
const world = new_world([{
  width: 128,
  height: 128,
  cr_ratio: 0.13215,
  interd_ratio: 0.04,
  gravity: 0.0002,
  acceleration: {
    y: 0.002,
    x: 0.00125,
  },
  drag: 0.99,
  ticks: 1,
  players: 0,
},{
  width: 128,
  height: 128,
  cr_ratio: 0.15,
  interd_ratio: 0.5,
  gravity: 0.00003,
  acceleration: {
    y: 0.002,
    x: 0.00125,
  },
  drag: 0.99,
  ticks: 2,
  players: 1,
}][0])
const canvas = document.querySelector("#canvas")
const context = canvas.getContext('2d')
resize(canvas)
const run = () => {
  tick({
    world: world,
  })
  draw_world({
    world: world, 
    context: context,
  })
  window.requestAnimationFrame(run)
}
run()
