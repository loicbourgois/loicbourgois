import {
  c0
} from "./c0.js"
import {
  wave_1,
} from "./wavetables.js"


let started = false
let audioCtx
let config = {}
let default_config_str = JSON.stringify(c0)


const show_config = () => {
  document.getElementById("right").innerHTML = ""
  for (const k in config) {
    if (Object.hasOwnProperty.call(config, k)) {
      const v = config[k];
      let fields = ""
      switch (v.kind) {
        case 'stereo':
          fields += `<span>
            <label id="${k}_pan">p:</label>
            <input id="${k}_pan_input" value="${v.pan}"></input>
          </span>`
          break
        case 'gain':
          fields += `<span>
            <label id="${k}_gain">g:</label>
            <input id="${k}_gain_input" value="${v.gain}"></input>
          </span>`
          break;
        case 'osc':
          fields += `<span>
            <label id="${k}_frequency">f:</label>
            <input id="${k}_frequency_input" value="${v.frequency}"></input>
          </span>`
          fields += `<span>
            <label id="${k}_detune">d:</label>
            <input id="${k}_detune_input" value="${v.detune}"></input>
          </span>`
          break
        case 'lowpass':
          fields += `<span>
            <label id="${k}_frequency">f:</label>
            <input id="${k}_frequency_input" value="${v.frequency}"></input>
          </span>`
          fields += `<span>
            <label id="${k}_peak">p:</label>
            <input id="${k}_peak_input" value="${v.peak}"></input>
          </span>`
          break
        case 'frequency_graph':
          fields += `<canvas id="${k}_canvas" class="frequency_graph_canvas"></canvas>`
          break
        case 'osc_graph':
          fields += `<canvas id="${k}_canvas" class="osc_graph_canvas"></canvas>`
          break
        case 'custom_osc':
          break
        default:
          throw `Missing case in show_config: ${v.kind}`
      }
      document.getElementById("right").innerHTML += `
        <div style="right:${v.right*8}rem; top:${v.top*5}rem;" class="block">
          <label id="${k}" class="title">${k}</label>
          ${fields}
        </div>
      `
    }
  }
  for (const k in config) {
    if (Object.hasOwnProperty.call(config, k)) {
      const v = config[k];
      const ka = json_id_to_html_id(k)
      const a = get_elem_center(ka)
      if (!v.destinations) {
        continue
      }
      for (const k2 of v.destinations) {
        if (k2 == 'AUDIO_CONTEXT') {
          continue
        }
        let kb = json_id_to_html_id(k2)
        const b = get_elem_center(kb)
        document.getElementById("right").innerHTML += `
          <svg>
            <line x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y} stroke="#ff08" stroke-width="2"/>
          </svg>
        `
      }
    }
  }
}


const json_id_to_html_id = (x) => {
  if (Array.isArray(x)) {
    return `${x[0]}_${x[1]}`
  }
  let splitted = x.split(".")
  if (splitted.length == 2) {
    splitted = translate_splitted(splitted)
    return `${splitted[0]}_${splitted[1]}`
  }
  return `${x}`
}


const translate_splitted = (splitted) => {
  switch (splitted[1]) {
    case "f":
      splitted[1] = "frequency"
      break
    case "frequency":
      splitted[1] = "frequency"
      break
    case "d":
      splitted[1] = "detune"
      break
    case "g":
      splitted[1] = "gain"
      break
    default:
      throw `not handled: ${splitted[1]}`
  }
  return splitted
}


const add_events = () => {
  for (const k in config) {
    if (Object.hasOwnProperty.call(config, k)) {
      const v = config[k];
      switch (v.kind) {
        case 'stereo':
          document.getElementById(`${k}_pan_input`).addEventListener("change", (v) => {
            config[k].pan = parseFloat(v.target.value)
            restart_2()
          })
          break;
        case 'gain':
          document.getElementById(`${k}_gain_input`).addEventListener("change", (v) => {
            config[k].gain = parseFloat(v.target.value)
            restart_2()
          })
          break
        case 'osc':
          document.getElementById(`${k}_frequency_input`).addEventListener("change", (v) => {
            config[k].frequency = parseFloat(v.target.value)
            restart_2()
          })
          document.getElementById(`${k}_detune_input`).addEventListener("change", (v) => {
            config[k].detune = parseFloat(v.target.value)
            restart_2()
          })
          break
        case 'lowpass':
          document.getElementById(`${k}_frequency_input`).addEventListener("change", (v) => {
            config[k].frequency = parseFloat(v.target.value)
            restart_2()
          })
          document.getElementById(`${k}_peak_input`).addEventListener("change", (v) => {
            config[k].peak = parseFloat(v.target.value)
            restart_2()
          })
          break
        case 'frequency_graph':
          break
        case 'osc_graph':
          break
        case 'custom_osc':
          break
        default:
          throw `Missing case in add_events: ${v.kind}`
      }
    }
  }
}


const get_elem_center = (id) => {
  try {
    var element = document.getElementById(id);
    var elementRect = element.getBoundingClientRect();
    var centerX = elementRect.left + elementRect.width / 2;
    var centerY = elementRect.top + elementRect.height / 2;
    return {x:centerX,y:centerY}
  } catch (error) {
    console.log(id)
    throw error
  }
}


const start = () => {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  for (const k in config) {
    if (Object.hasOwnProperty.call(config, k)) {
      const v = config[k];
      switch (v.kind) {
        case 'stereo':
          v.node = audioCtx.createStereoPanner()
          v.node.pan.setValueAtTime(0, audioCtx.currentTime);
          v.node.pan.linearRampToValueAtTime(v.pan, audioCtx.currentTime + 0.5);
          break;
        case 'gain':
          v.node = audioCtx.createGain()
          v.node.gain.setValueAtTime(0, audioCtx.currentTime);
          v.node.gain.linearRampToValueAtTime(v.gain, audioCtx.currentTime + 0.5);
          break;
        case 'osc':
          v.node = audioCtx.createOscillator()
          v.node.frequency.setValueAtTime(v.frequency, audioCtx.currentTime);
          v.node.detune.setValueAtTime(v.detune, audioCtx.currentTime);
          v.node.start()
          break;
        case 'lowpass':
          v.node = audioCtx.createBiquadFilter()
          v.node.frequency.setValueAtTime(v.frequency, audioCtx.currentTime)
          v.node.Q.setValueAtTime(v.peak, audioCtx.currentTime)
          v.node.type = 'lowpass'
          break
        case 'frequency_graph':
          v.node = audioCtx.createAnalyser()
          v.node.fftSize = parseInt(v.bars)
          v.bufferLength = v.node.frequencyBinCount
          v.dataArray = new Uint8Array(v.bufferLength)
          v.canvas = document.getElementById(`${k}_canvas`)
          v.canvas.height = 100
          v.context = v.canvas.getContext('2d')
          break
        case 'osc_graph':
          v.node = audioCtx.createAnalyser()
          v.node.fftSize = 256//parseInt(v.bars)
          v.bufferLength = v.node.frequencyBinCount
          v.dataArray = new Uint8Array(v.bufferLength)
          v.datapoints = []
          v.canvas = document.getElementById(`${k}_canvas`)
          v.context = v.canvas.getContext('2d')
          break
        case 'custom_osc':
          const real = new Float32Array(wave_1.real)
          const imag = new Float32Array(wave_1.imag)
          v.node = audioCtx.createOscillator()
          const wave = audioCtx.createPeriodicWave(
            real, imag, 
            //{ disableNormalization: true }
          )
          v.node.setPeriodicWave(wave)
          v.node.frequency.setValueAtTime(v.frequency, audioCtx.currentTime);
          v.node.start()
          break
        default:
          throw `Missing case in build audio network: ${v.kind}`
      }
    }
  }
  for (const k in config) {
    if (Object.hasOwnProperty.call(config, k)) {
      const v = config[k]
      if (!v.destinations) {
        continue
      }
      for (const dest of v.destinations) {
        if (typeof dest === 'string' || dest instanceof String) {
          if (dest == 'AUDIO_CONTEXT') {
            v.node.connect(audioCtx.destination)
          } else {
            let splitted = dest.split(".")
            if (splitted.length == 2) {
              splitted = translate_splitted(splitted)
              v.node.connect(config[splitted[0]].node[splitted[1]])
            } else {
                v.node.connect(config[dest].node)
            }
          }
        } else {
          v.node.connect(config[dest[0]].node[dest[1]])
        }
      }
    }
  }
}


const draw = () => {
  for (const k in config) {
    if (Object.hasOwnProperty.call(config, k)) {
      const v = config[k];
      switch (v.kind) {
        case 'frequency_graph': {
          if (!v.context) {
            continue
          }
          v.node.getByteFrequencyData(v.dataArray);
          v.context.fillStyle = "#220"
          const W = v.canvas.width
          const H = v.canvas.height
          v.context.fillRect(0, 0, W, H)
          const barWidth = (W / v.bufferLength) * v.zoom;
          let barHeight;
          let x = 0;
          for (let i = 0; i < v.bufferLength; i++) {
            barHeight = v.dataArray[i] / 2;
            v.context.fillStyle = `rgb(100, 50, 50)`;
            v.context.fillRect(x, H - barHeight * 0.8, barWidth, barHeight);
            if (x > W) {
              break
            }
            x += barWidth-1;
          }
          break
        }
        case 'osc_graph': {
          if (!v.context) {
            continue
          }
          const WIDTH = v.canvas.width
          const HEIGHT = v.canvas.height
          v.node.getByteTimeDomainData(v.dataArray);
          v.context.fillStyle = "#220";
          v.context.fillRect(0, 0, WIDTH, HEIGHT);
          v.context.lineWidth = 2;
          v.context.strokeStyle = `rgb(100, 50, 50)`;
          let x = 0;
          v.context.beginPath();
          // const aa = v.dataArray[0] / 128.0
          // const y = (aa * HEIGHT) / 2;
          v.datapoints.push(v.dataArray[0])
          while (v.datapoints.length > 256) {
            v.datapoints.shift()
          }
          const sliceWidth = (WIDTH * 1.0) / v.datapoints.length
          // console.log( aa )
          let y 
          for (let i = 0; i < v.datapoints.length; i++) {
            y = (v.datapoints[i] / 128.0 * HEIGHT) / 2
            if (i === 0) {
              v.context.moveTo(x, y);
            } else {
              v.context.lineTo(x, y);
            }
            x += sliceWidth;
          }
          v.context.lineTo(WIDTH, y);
          v.context.stroke();
        }
        default:
          continue
      }
    }
  }
  requestAnimationFrame(draw)
}


const restart_2 = () => {
  const config_ = JSON.parse(JSON.stringify(config))
  for (const k in config_) {
    if (Object.hasOwnProperty.call(config_, k)) {
      const v = config_[k];
      if (v.dataArray) {
        delete v.dataArray
      }
      if (v.datapoints) {
        delete v.datapoints
      }
      if (v.node) {
        delete v.node
      }
      if (v.bufferLength) {
        delete v.bufferLength
      }
      if (v.canvas) {
        delete v.canvas
      }
      if (v.context) {
        delete v.context
      }
    }
  }
  document.getElementById("textarea").value = JSON.stringify(config_, null, 4)
  restart()
}


const restart = () => {
  localStorage.setItem("config_str", document.getElementById("textarea").value)
  let config_tmp
  try {
    config_tmp = JSON.parse(document.getElementById("textarea").value)
  } catch (error) {
    // console.warn(error)
    return
  }
  try {
    if (audioCtx) {
      const old_audio_context = audioCtx
      setTimeout(() => {
        old_audio_context.close()
      }, 500)
      // config.g1.node.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
      // config.g1.node.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.2);
      // config.g1.node.gain.linearRampToValueAtTime(0.00001, audioCtx.currentTime + 0.45);
    }
  } catch (error) {
    console.error(error)
  }
  config = config_tmp
  show_config()
  add_events()
  if (started){
    start()
  }
}


const aa = localStorage.getItem("config_str")
if (aa) {
  config = JSON.parse(aa)
} else {
  config = JSON.parse(default_config_str)
}
config = JSON.parse(default_config_str)
document.getElementById("textarea").addEventListener("keyup", ()=> {
  restart()
})
document.addEventListener("click", (v) => {
  if (!started){
    started = true
    start()
  }
})
restart_2()
draw()