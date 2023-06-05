import {
    translate_splitted,
} from "./utils.js"
import { nodes } from "./nodes/_main.js"


const show_config = (config) => {
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
        case 'custom_osc_2':
          break
        case 'const':
            break
        default:
            try {
                fields += nodes[v.kind].show_config(v)
                break
            } catch (error) {
                
            }
            throw `Missing case in show_config: ${v.kind}`
      }
      let class_ = "block"
      if (v.kind == "beat_line") {
        class_ = "line"
      }
      document.getElementById("right").innerHTML += `
        <div style="right:${v.right*8}rem; top:${v.top*5}rem;" class="${class_}">
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


export {
    show_config,
}