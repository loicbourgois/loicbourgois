const util = {}
util.draw_rect = (conf, canvas, context, x1, y1, x2, y2, color) => {
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
util.draw_rect_line = (conf, canvas, context, x1, y1, x2, y2, color) => {
  const a = conf.line_width/2;
  if (x1 > x2) {
    const x_tmp = x1
    x1 = x2
    x2 = x_tmp
  }
  util.draw_rect(conf, canvas, context, x1-a, y1-a, x2+a, y2+a, color)
}
util.draw_small_rect_line = (conf, canvas, context, x1, y1, x2, y2, color) => {
  const a = conf.small_line_width/2;
  if (x1 > x2) {
    const x_tmp = x1
    x1 = x2
    x2 = x_tmp
  }
  util.draw_rect(conf, canvas, context, x1-a, y1-a, x2+a, y2+a, color)
}
util.draw_platforms = (conf, canvas, context) => {
  conf.trajectories.forEach((trajectory, i) => {
    x1 = eval(`t=${trajectory.start};` + trajectory.formulas.x)
    y1 = eval(`t=${trajectory.start};` + trajectory.formulas.y)
    x2 = eval(`t=${trajectory.stop};` + trajectory.formulas.x)
    y2 = eval(`t=${trajectory.stop};` + trajectory.formulas.y)
    switch (trajectory.type) {
      case 'linear':
        util.draw_rect_line(conf, canvas, context, x1, y1 - conf.player.height/2, x2, y2 - conf.player.height/2, conf.colors.platform)
        break
    }
  })
}
util.draw_background = (conf, canvas, context) => {
  context.fillStyle = conf.colors.background;
  context.fillRect(0, 0, canvas.width, canvas.height);
}
util.draw_player = (conf, canvas, context, state) => {
  const x1 = state.player.x - conf.player.width/2
  const y1 = state.player.y - conf.player.height/2
  const x2 = state.player.x + conf.player.width/2
  const y2 = state.player.y + conf.player.height/2
  util.draw_rect(conf, canvas, context, x1, y1, x2, y2, conf.colors.player)
  state.player.sides.forEach((side, i) => {
    util.draw_small_rect_line(conf, canvas, context,
      side.x1, side.y1, side.x2, side.y2,
      conf.colors.player_side)
  })
}
util.draw_square = (conf, canvas, context, x, y, color) => {
  const x1 = x - conf.player.width/2
  const y1 = y - conf.player.height/2
  const x2 = x + conf.player.width/2
  const y2 = y + conf.player.height/2
  util.draw_rect(conf, canvas, context, x1, y1, x2, y2, color)
}
util.draw_walls = (conf, canvas, context) => {
  let event_1 = null
  let event_2 = null
  conf.events.forEach((item, i) => {
    if (event_1) {
      event_2 = item
      if (event_1.name == 'jump' && event_2.name == 'jump') {
        const infos = util.get_infos_at_time(conf, event_2.time)
        const x1 = infos.x - infos.direction.x * conf.player.width / 2
        const x2 = x1
        const y1 = infos.y - conf.wall.height / 2
        const y2 = infos.y + conf.wall.height / 2
        util.draw_rect_line(conf, canvas, context, x1, y1, x2, y2, conf.colors.wall)
      }
    }
    event_1 = item
  });
}
util.draw_surfaces = (conf, canvas, context) => {
  conf.surfaces.forEach((surface, i) => {
    util.draw_small_rect_line(conf, canvas, context,
      surface.x1, surface.y1, surface.x2, surface.y2,
      conf.colors.surface)
  })
}
util.get_infos_at_time = (conf, t) => {
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
