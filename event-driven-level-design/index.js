const canvas = document.getElementById('canvas')
canvas.width = window.innerHeight
canvas.height = window.innerHeight
const context = canvas.getContext('2d')
let start_time = null
let stop_time = null
let conf = {}
const events = {
  start: () => {
    console.log("start")
    conf.events = []
    start_time = Date.now()
  },
  stop: () => {
    console.log("stop")
    stop_time = Date.now()
  },
  jump: () => {
    console.log("jump")
  },
  ground: () => {
    console.log("ground")
  },
  fall: () => {
    console.log("fall")
  }
}
const controls = {
  s: {
    key: 's',
    type: 'toggle',
    events: [
      'start',
      'stop'
    ]
  },
  spacebar: {
    key: 'spacebar',
    type: 'toggle',
    events: [
      'jump',
      'ground'
    ]
  },
  f: {
    key: 'f',
    type: 'toggle',
    events: [
      'fall',
    ]
  }
}
const draw_positions_from_conf = () => {
  console.log("todo: draw_positions_from_conf")
}
for (let control_id in controls) {
  const controls_keys = document.getElementById('controls-keys')
  const controls_states = document.getElementById('controls-states')
  control = controls[control_id]
  control.html = {}
  control.html.key = document.createElement('label')
  control.html.key.textContent = control.key
  controls_keys.appendChild(control.html.key)
  control.html.states_div = document.createElement('div')
  controls_states.appendChild(control.html.states_div)
  control.html.states = {}
  control.events.forEach((item, i) => {
    let event_name = item
    control.html.states[event_name] = document.createElement('button')
    control.html.states[event_name].textContent = event_name
    control.html.states[event_name].addEventListener('click', e => {
      console.log("control_id", control_id, "event_name", event_name)
      events[event_name]()
      conf.events.push({
        name: event_name,
        time: (Date.now() - start_time) / 1000.0
      })
      document.getElementById('editor-textarea').value = JSON.stringify(conf, null, 2)
      draw_positions_from_conf()
    });
    control.html.states_div.appendChild(control.html.states[event_name])
  });
  switch (control.type) {
    case 'toggle':
      break
    case 'trigger':
      break
    default:
      console.error(`no type '${type}'`);
  }
};
const controls_canvas_outer = document.getElementById('controls-canvas-outer')
const controls_canvas = document.getElementById('controls-canvas')
const resize_controls_canvas = () => {
  controls_canvas.width = 0
  controls_canvas.height = 0
  controls_canvas.style.height = 0 + 'px'
  controls_canvas.style.width = 0 + 'px'
  controls_canvas.width = controls_canvas_outer.getBoundingClientRect().width
  controls_canvas.height = controls_canvas_outer.getBoundingClientRect().height
  controls_canvas.style.height = controls_canvas_outer.getBoundingClientRect().height + 'px'
  controls_canvas.style.width = controls_canvas_outer.getBoundingClientRect().width + 'px'
}
resize_controls_canvas()
window.addEventListener('resize', e => {
  resize_controls_canvas()
});
