let start_time = null
let stop_time = null
let do_loop = false
let conf = level_1;
const events = {
  start: () => {
    do_loop = true
    loop()
    conf.events = []
    start_time = Date.now()
  },
  stop: () => {
    do_loop = false
    stop_time = Date.now()
  },
  jump: () => {
  },
  ground: () => {
  },
  fall: () => {
  }
}
const controls = {
  s: {
    type: 'toggle',
    events: [
      'start',
      'stop'
    ]
  },
  spacebar: {
    type: 'toggle',
    events: [
      'jump',
      'ground'
    ]
  },
  /*f: {
    key: 'f',
    type: 'toggle',
    events: [
      'fall',
    ]
  }*/
}
const canvas = document.getElementById('canvas')
canvas.width = window.innerHeight
canvas.height = window.innerHeight
const context = canvas.getContext('2d')
const draw_rect = (x1, y1, x2, y2, color) => {
  x1 += conf.translate.x
  x2 += conf.translate.x
  y1 += conf.translate.y
  y2 += conf.translate.y
  context.fillStyle = color;
  const x = x1 / conf.world.width * canvas.width;
  const w = (x2 - x1) / conf.world.width * canvas.width
  const h = (y2 - y1) / conf.world.height * canvas.height
  const y = canvas.width - y1 / conf.world.height * canvas.width - h;
  context.fillRect(x, y, w, h);
}
const draw_rect_line = (x1, y1, x2, y2, color) => {
  const a = conf.line_width/2;
  if (x1 > x2) {
    const x_tmp = x1
    x1 = x2
    x2 = x_tmp
  }
  draw_rect(x1-a, y1-a, x2+a, y2+a, color)
}
const draw_point = (x, y, color) => {
  util.draw_small_rect_line(conf, canvas, context, x, y, x, y, color)
}
const draw_background = () => {
  context.fillStyle = conf.colors.background;
  context.fillRect(0, 0, canvas.width, canvas.height);
}
const draw_borders = () => {
  //draw_rect(0, 0, conf.world.border_size, conf.world.height, conf.colors.border)
  //draw_rect(0, 0, conf.world.width, conf.world.border_size, conf.colors.border)
  //draw_rect(conf.world.width-conf.world.border_size, 0, conf.world.width, conf.world.height, conf.colors.border)
  //draw_rect(0, conf.world.height-conf.world.border_size, conf.world.width, conf.world.height, conf.colors.border)
}
const draw_platforms = () => {
  conf.trajectories.forEach((item, i) => {
    const trajectory = item
    x1 = eval(`t=${trajectory.start};` + trajectory.formulas.x)
    y1 = eval(`t=${trajectory.start};` + trajectory.formulas.y)
    x2 = eval(`t=${trajectory.stop};` + trajectory.formulas.x)
    y2 = eval(`t=${trajectory.stop};` + trajectory.formulas.y)
    switch (trajectory.type) {
      case 'linear':
        draw_rect_line(x1, y1 - conf.player.height/2, x2, y2 - conf.player.height/2, conf.colors.platform)
        break
    }
  })
}
const get_infos_at_time = (t) => {
  let infos = null
  conf.trajectories.forEach((trajectory, i) => {
    if (trajectory.start <= t && trajectory.stop >= t) {
      infos = {
        x: eval(`t=${t};` + trajectory.formulas.x),
        y: eval(`t=${t};` + trajectory.formulas.y),
        direction: trajectory.direction
      }
    }
  })
  return infos
}
const draw_walls = () => {
  let event_1 = null
  let event_2 = null
  conf.events.forEach((item, i) => {
    if (event_1) {
      event_2 = item
      if (event_1.name == 'jump' && event_2.name == 'jump') {
        const infos = get_infos_at_time(event_2.time)
        const x1 = infos.x - infos.direction.x * conf.player.width / 2
        const x2 = x1
        const y1 = infos.y - conf.wall.height / 2
        const y2 = infos.y + conf.wall.height / 2
        draw_rect_line(x1, y1, x2, y2, conf.colors.wall)
      }
    }
    event_1 = item
  });
}
const draw_trajectories = () => {
  conf.trajectories.forEach((item, i) => {
    const trajectory = item
    const time_step = Math.max(0.0001, (trajectory.stop - trajectory.start) / conf.point_per_trajectory)
    for (let t = trajectory.start ; t <= trajectory.stop ; t += time_step) {
      x = eval(`t=${t};` + trajectory.formulas.x)
      y = eval(`t=${t};` + trajectory.formulas.y)
      draw_point(x, y, conf.colors.trajectory)
    }
  });
}
const draw_from_conf = () => {
  draw_background()
  draw_borders()
  draw_trajectories()
  //draw_platforms()
  //draw_walls()
  util.draw_surfaces(conf, canvas, context)
}
const write_conf_to_editor = () => {
  document.getElementById('editor-textarea').value = JSON.stringify(conf, null, 2)
}
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
const add_world_size_to_conf = () => {
  let x_min = 0;
  let y_min = 0;
  let x_max = 0;
  let y_max = 0;
  conf.trajectories.forEach((trajectory, i) => {
    if (trajectory.formulas) {
      const time_step = Math.max(0.001, (trajectory.stop - trajectory.start)/conf.point_per_trajectory)
      for (let t = trajectory.start ; t <= trajectory.stop ; t += time_step ) {
        x = eval(`t=${t};` + trajectory.formulas.x)
        y = eval(`t=${t};` + trajectory.formulas.y)
        if (x > x_max) {
          x_max = x
        }
        if (x < x_min) {
          x_min = x
        }
        if (y > y_max) {
          y_max = y
        }
        if (y < y_min) {
          y_min = y
        }
      }
    }
  });
  const delta_x = x_max - x_min
  const delta_y = y_max - y_min
  const delta_max = Math.max(delta_x, delta_y)
  const events_duration = conf.events[conf.events.length - 1].time
  conf.world.width = delta_max + conf.world.border_size * 2
  conf.world.height = conf.world.width
  conf.translate = {
    x: - x_min + conf.world.border_size,
    y: - y_min + conf.world.border_size
  }
  conf.mins = {
    x: x_min - conf.world.border_size,
    y: y_min - conf.world.border_size
  }
}
const get_trajectory = (event_1, event_2, previous_trajectory, direction) => {
  const trajectory = {}
  let x_start = 0
  let y_start = 0
  if (previous_trajectory) {
    x_start = eval(`t=${previous_trajectory.stop};` + previous_trajectory.formulas.x)
    y_start = eval(`t=${previous_trajectory.stop};` + previous_trajectory.formulas.y)
  }
  trajectory.start = event_1.time
  trajectory.stop = event_2.time
  const delta_time = event_2.time - event_1.time
  switch (event_1.name) {
    case "start":
    case "ground":
      trajectory.formulas = {
        x: `${x_start} + (t-${trajectory.start}) * ${conf.speed.value} * ${direction.x}`,
        y: `${y_start}`,
      }
      trajectory.type = 'linear'
      break
    case 'jump':
      trajectory.type = 'jump'
      if (previous_trajectory && (previous_trajectory.type == 'jump' || previous_trajectory.type == 'wall-jump') ) {
        direction.x = direction.x * -1.0
        trajectory.type = 'wall-jump'
      }
      trajectory.formulas = {
        x: `${x_start} + (t-${trajectory.start}) * ${conf.speed.value} * ${direction.x}`,
        y: `t_ = (t-${trajectory.start}); ${y_start} +  t_ * t_ * ${conf.world.gravity} + t_ * ${conf.player.jump_impulse} `,
      }
      trajectory.direction = {}
      trajectory.direction.x = direction.x
      break
  }
  return trajectory
}
const add_trajectories_to_conf = () => {
  conf.trajectories = []
  let event_1 = null
  let event_2 = null
  let direction = {
    x: conf.starting_direction.x,
  }
  conf.events.forEach((item, i) => {
    if (event_1) {
      event_2 = item
      const previous_trajectory = conf.trajectories[i-2]
      const trajectory = get_trajectory(event_1, event_2, previous_trajectory, direction)
      if (trajectory.type) {
        conf.trajectories.push(trajectory)
      }
    }
    event_1 = item
  });
  const last_event_index = conf.events.length - 1
  const last_event = conf.events[last_event_index]
  if (last_event.name != "stop") {
    const previous_trajectory = conf.trajectories[last_event_index-1]
    const event_1 = last_event
    const event_2 = {
      name: 'now',
      time: (Date.now() - start_time) / 1000.0,
      delta: (Date.now() - start_time) / 1000.0 - last_event.time
    }
    const trajectory = get_trajectory(event_1, event_2, previous_trajectory, direction)
    if (trajectory.type) {
      conf.trajectories.push(trajectory)
    }
  }
}
const add_surfaces_to_conf = () => {
  conf.surfaces = []
  conf.trajectories.forEach((trajectory, i) => {
    if (trajectory.type == 'linear' ) {
      conf.surfaces.push({
        x1: eval(`t=${trajectory.start};` + trajectory.formulas.x),
        y1: eval(`t=${trajectory.start};` + trajectory.formulas.y) - conf.player.height/2,
        x2: eval(`t=${trajectory.stop};` + trajectory.formulas.x),
        y2: eval(`t=${trajectory.stop};` + trajectory.formulas.y) - conf.player.height/2
      })
    }
    if (trajectory.type == 'wall-jump' ) {
      const x = eval(`t=${trajectory.start};` + trajectory.formulas.x) - conf.player.width/2 * trajectory.direction.x
      const y = eval(`t=${trajectory.start};` + trajectory.formulas.y)
      conf.surfaces.push({
        x1: x,
        y1: y - conf.player.height,
        x2: x,
        y2: y + conf.player.height
      })
    }
  })
}
const update_events = () => {
  let event_1 = null
  let event_2 = null
  conf.events.forEach((item, i) => {
    if (event_1) {
      event_2 = item
      event_2.time = event_1.time + event_2.delta
    }
    event_1 = item
  });
}
const step = () => {
  resize_controls_canvas()
  update_events()
  add_trajectories_to_conf()
  add_world_size_to_conf()
  add_surfaces_to_conf()
  write_conf_to_editor()
  draw_from_conf()
}
const render = () => {
  conf = JSON.parse(document.getElementById('editor-textarea').value)
  game.stop()
  step()
}
window.addEventListener('resize', e => {
  resize_controls_canvas()
});
document.getElementById('button-render').addEventListener('click', e => {
  render()
});
document.getElementById('editor-textarea').addEventListener('change', e => {
  render()
});
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
      events[event_name]()
      const previous_event = conf.events[conf.events.length - 1]
      const previous_event_time = previous_event ? previous_event.time : 0
      conf.events.push({
        name: event_name,
        time: (Date.now() - start_time) / 1000.0,
        delta: (Date.now() - start_time) / 1000.0 - previous_event_time
      })
      step()
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
}
const loop = () => {
  step()
  if (do_loop) {
    window.requestAnimationFrame(loop);
  }
}
step()
const load_and_play_game = (level) => {
  if (level == 'level-1') {
    conf = level_1
  }
  if (level == 'level-2') {
    conf = level_2
  }
  if (level == 'level-3') {
    conf = level_3
  }
  if (level == 'level-4') {
    conf = level_4
  }
  step()
  game.stop()
  game = new_game(conf, canvas_id)
  game.play()
}
document.getElementById('game-button-play').addEventListener('click', load_and_play_game)
document.getElementById('game-button-level-1').addEventListener('click', () => {load_and_play_game('level-1')})
document.getElementById('game-button-level-2').addEventListener('click', () => {load_and_play_game('level-2')})
document.getElementById('game-button-level-3').addEventListener('click', () => {load_and_play_game('level-3')})
document.getElementById('game-button-level-4').addEventListener('click', () => {load_and_play_game('level-4')})
const canvas_id = 'canvas'
let game = new_game(conf, canvas_id)
game.play()
