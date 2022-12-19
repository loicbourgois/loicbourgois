import { 
  new_world,
  draw_world,
  tick,
  I_X,
  I_Y,
  I_PX,
  I_PY,
} from "./world.js"
import { 
  resize,
} from "./canvas.js"
const world = new_world([{
  width: 128,
  height: 128,
  cr_ratio: 0.34213215,
  interd_ratio: 0.05,
  gravity: 0.0002,
  acceleration: {
    y: 0.002,
    x: 0.00125,
  },
  drag: .97,
  ticks: 1,
  players: 0,
  max_particles: 1024,
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
  max_particles: 1024,
}][0])
const canvas = document.querySelector("#canvas")
const context = canvas.getContext('2d')
resize(canvas)


const audio_nodes = []
const audio_context = new (window.AudioContext || window.webkitAudioContext)();  
const init = () => {
  for (let i = 0; i < world.particle.count ; i++) {
    audio_nodes.push({
      oscillator: audio_context.createOscillator(),
      gain: audio_context.createGain(),
    })
    audio_nodes[i].oscillator.type = ['square', 'sine'][0];
    audio_nodes[i].oscillator.frequency.setValueAtTime(110*0.125+i*0.0+Math.random()*10, audio_context.currentTime)
    audio_nodes[i].gain.gain.value = 0.0
    audio_nodes[i].gain.gain.linearRampToValueAtTime(0.01, audio_context.currentTime+Math.random()*1)
    audio_nodes[i].gain.connect(audio_context.destination)
    audio_nodes[i].oscillator.connect(audio_nodes[i].gain)
    audio_nodes[i].oscillator.start();
    console.log(i)
  }  
}
init()


const run = () => {
  tick({
    world: world,
  })

  for (let pid = 0; pid < world.particle.count; pid++) {
    const bid = pid * world.particle.size
    const x = world.view.getFloat32( bid + I_X )
    const y = world.view.getFloat32( bid + I_Y )

    const px = world.view.getFloat32( bid + I_PX )
    const py = world.view.getFloat32( bid + I_PY )

    const dx2 = 0.5 - x
    const dy2 = 0.5 - y

    const dx = x - px
    const dy = y - py

    const v2 = Math.sqrt(dx2*dx2+dy2*dy2)  + 0.00001

    const v = Math.sqrt(dx*dx+dy*dy) * 2 
    const gain = Math.min(0.125*0.25, v  )
    // audio_nodes[pid].gain.gain.value = 

    audio_nodes[pid].gain.gain.linearRampToValueAtTime(gain, audio_context.currentTime+0.001)

    // audio_nodes[pid].oscillator.frequency.setValueAtTime(64*0.25+v*512, audio_context.currentTime+0.001)
    audio_nodes[pid].oscillator.detune.setValueAtTime(50000*gain, audio_context.currentTime+0.001)

  }
  // throw "z"

  draw_world({
    world: world, 
    context: context,
  })
  window.requestAnimationFrame(run)
}
run()

