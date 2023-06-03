import {
  c0
} from "./c0.js"


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
  const splitted = x.split(".")
  if (splitted.length == 2) {
    switch (splitted[1]) {
      case "f":
        splitted[1] = "frequency"
        break
      case "d":
        splitted[1] = "detune"
        break
      default:
        break
    }
    return `${splitted[0]}_${splitted[1]}`
  }
  return `${x}`
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
        default:
          throw `Missing case in add_events: ${v.kind}`
      }
    }
  }
}


const get_elem_center = (id) => {
  var element = document.getElementById(id);
  var elementRect = element.getBoundingClientRect();
  var centerX = elementRect.left + elementRect.width / 2;
  var centerY = elementRect.top + elementRect.height / 2;
  return {x:centerX,y:centerY}
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
          v.node.fftSize = 256
          v.bufferLength = v.node.frequencyBinCount
          v.dataArray = new Uint8Array(v.bufferLength)
          v.canvas = document.getElementById(`${k}_canvas`)
          v.canvas.height = 100
          v.context = v.canvas.getContext('2d')
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
            const splitted = dest.split(".")
            if (splitted.length == 2) {
              switch (splitted[1]) {
                case "f":
                  splitted[1] = "frequency"
                  break
                case "d":
                  splitted[1] = "detune"
                  break
                default:
                  break
              }
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
        case 'frequency_graph':
          if (!v.context) {
            continue
          }
          v.node.getByteFrequencyData(v.dataArray);
          v.context.fillStyle = "#220"
          const W = v.canvas.width
          const H = v.canvas.height
          v.context.fillRect(0, 0, W, H)
          const barWidth = (W / v.bufferLength) * 3.0;
          let barHeight;
          let x = 0;
          for (let i = 0; i < v.bufferLength; i++) {
            barHeight = v.dataArray[i] / 2;
            v.context.fillStyle = `rgb(100, 50, 50)`;
            v.context.fillRect(x, H - barHeight * 0.8, barWidth, barHeight);
            x += barWidth-1;
          }
          break
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
      config.g1.node.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
      config.g1.node.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.2);
      config.g1.node.gain.linearRampToValueAtTime(0.00001, audioCtx.currentTime + 0.45);
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