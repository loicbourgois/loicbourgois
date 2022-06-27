import {
  fill_circle,
  fill_text,
  stroke_circle,
} from './canvas.js'
import {
  rotate,
  translate,
  rand_int,
  distance_squared,
  EPSILON,
} from './maths.js'


const g = {
  interval_controls_ms: 10,
  interval_tick_ms: 10,
  render: {
    last_time: null
  },
  log_render_duration: false,
  sliders_count: 10,
  step: 0,
  parts: [],
  diameter: 0.01,
  parts_count: 100,
  bottom: -0.0,
  start_bottom: -0.0,
  leaves: 0.2,
}


const range = (start, end) => {
  return Array.from({ length: end - start }, (_, i) => start + i);
}


const resize_canvas = (canvas, multiplier=1) => {
  canvas.width = window.innerWidth * multiplier
  canvas.height = window.innerHeight * multiplier
}


const init = () => {
  const sliders_str = range(0, g.sliders_count)
    .map(x => `<input type="range" min="0" max="1000" value="${1000-x/(g.sliders_count-1)*1000}" class="slider" id="slider_${x}">` )
    .join("")
  document.querySelector("body").innerHTML = `
    <canvas id='canvas'></canvas>
    <div id="sliders">
      ${sliders_str}
    </div>
  `
  resize_canvas(document.querySelector("#canvas"))
}


const empty = (parts, p) => {
  for (let part of parts) {
    if ( distance_squared (part.p, p) < g.diameter*g.diameter - EPSILON ) {
      return false
    }
  }
  return true
}


const neighbours = (parts, part) => {
  let ns = []
  for (let part_2 of parts) {
    const dd = distance_squared (part_2.p, part.p)
    if (part_2.idx != part.idx && dd < g.diameter * g.diameter + EPSILON ) {
      ns.push(part_2.idx)
    }
  }
  return ns
}


const new_p = () => {
  const p = g.parts[rand_int(0, g.parts.length)].p
  let np = translate(p, {x:0, y:g.diameter})
  np = rotate(np, p, (rand_int(0,2)-1)/6+1/12)
  if ( !empty(g.parts, np) ) {
    return new_p()
  }
  for (let n_id of neighbours(g.parts, {p:np}) ) {
    if ( neighbours(g.parts, g.parts[n_id]).length >= 3 ) {
      return new_p()
    }
  }
  return np
}


const tick = () => {
  g.step += 1
  let p = {
    x: -0,
    y: g.start_bottom,
  }
  range(0, g.parts_count).map(i=>{
    let leaves
    if (p.y > 0.1 + g.leaves * Math.random()) {
      leaves = (Math.random()*10 + 5)*g.diameter
    }
    g.parts.push({
      p: {
        x: p.x,
        y: p.y,
      },
      idx: i,
      leaves: leaves,
    })
    p = new_p()
  })
}


const render = (context) => {
  for (let part of g.parts) {
    fill_circle(context, part.p, g.diameter*2.2, "#4f3b27aa")
    stroke_circle(context, part.p, g.diameter*2.2, "#4f3b27", 2)
  }
  for (let part of g.parts) {
    if (part.leaves) {
      stroke_circle(context, part.p, part.leaves, "#0c01", 3)
      fill_circle(context, part.p, part.leaves, "#0c0d")
    }
  }
  // window.requestAnimationFrame(()=>{
  //   render(context)
  // })
}


init()
tick()
render(document.querySelector("#canvas").getContext('2d'))
