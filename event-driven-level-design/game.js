const new_game = (conf, canvas_id) => {
  const game = {}
  game.conf = conf
  game.canvas = document.getElementById(canvas_id)
  game.context = canvas.getContext('2d')
  game.state = {
    player: {
      x: 0,
      y: 0,
      speed: {
        x: game.conf.speed.value * game.conf.starting_direction.x,
        y: 0
      }
    },
    states: {
      jumping: false,
    },
    events: {
      jump: {
        counter: 0
      },
    }
  }
  game.keydown = (event) => {
    switch (event.code) {
      case 'Space':
        game.state.events.jump.counter = conf.event_count_down_ms
        break
      default:
        console.log(`game.keydown: ${event.code}`)
        break
    }
  }
  game.start = () => {
    document.addEventListener('keydown', game.keydown)
    game.start_time_ms = Date.now()
    game.last_time_ms = game.start_time_ms
    game.do_loop = true
    game.loop_engine()
    game.loop_render()
  }
  game.stop = () => {
    console.log('stop')
    window.clearInterval(game.loop_engine_interval_id)
    window.clearInterval(game.loop_render_interval_id)
  }
  game.handle_events = (delta_time_ms) => {
    for (let event_id in game.state.events) {
      const a = game.state.events[event_id]
      a.counter = a.counter - delta_time_ms
    }
    if (game.state.states.jumping == false && game.state.events.jump.counter > 0) {
      console.log('jump')
      game.state.states.jumping = true
      game.state.events.jump.counter = 0
      game.state.player.speed.y = game.conf.player.jump_impulse
    }
  }
  game.step = () => {
    const time_ms = Date.now()
    const delta_time_ms = time_ms - game.last_time_ms
    game.handle_events(delta_time_ms)
    game.state.player.speed.y = game.state.player.speed.y + delta_time_ms * game.conf.world.gravity * 0.001
    game.state.player.x = game.state.player.x + delta_time_ms * game.state.player.speed.x * 0.001
    game.state.player.y = game.state.player.y + delta_time_ms * game.state.player.speed.y * 0.001
    game.update_player_sides()
    game.player_and_surfaces()
    game.last_time_ms = time_ms
    if(time_ms - game.start_time_ms > game.conf.max_time_ms) {
      game.stop()
    }
  }
  game.update_player_sides = () => {
    game.state.player.sides = [
      {
        x1: game.state.player.x - game.conf.player.width / 2,
        x2: game.state.player.x + game.conf.player.width / 2,
        y1: game.state.player.y - game.conf.player.height / 2,
        y2: game.state.player.y - game.conf.player.height / 2
      }, {
        x1: game.state.player.x - game.conf.player.width / 2,
        x2: game.state.player.x + game.conf.player.width / 2,
        y1: game.state.player.y + game.conf.player.height / 2,
        y2: game.state.player.y + game.conf.player.height / 2
      }, {
        x1: game.state.player.x - game.conf.player.width / 2,
        x2: game.state.player.x - game.conf.player.width / 2,
        y1: game.state.player.y - game.conf.player.height / 2,
        y2: game.state.player.y + game.conf.player.height / 2
      }, {
        x1: game.state.player.x + game.conf.player.width / 2,
        x2: game.state.player.x + game.conf.player.width / 2,
        y1: game.state.player.y - game.conf.player.height / 2,
        y2: game.state.player.y + game.conf.player.height / 2
      }
    ]
  }
  game.player_and_surfaces = () => {
    game.conf.surfaces.forEach((surface, i) => {
      let intersects = [];
      game.state.player.sides.forEach((side, i) => {
        const intersect = geometry.intersect (
          surface.x1, surface.y1, surface.x2, surface.y2,
          side.x1, side.y1, side.x2, side.y2)
        if (intersect) {
          intersects.push(intersect)
        }
      });
      let collision_point = null
      if (intersects.length == 1) {
        collision_point = intersects[0]
      }
      if (intersects.length == 2) {
        collision_point = {
          x: (intersects[0].x + intersects[1].x) / 2,
          y: (intersects[0].y + intersects[1].y) / 2
        }
      }
      if (collision_point) {
        const delta_y = game.state.player.y - surface.y1
        let new_y = null
        if (game.state.player.speed.y < 0) {
          new_y = surface.y1 + game.conf.player.height / 2
          game.state.states.jumping = false
        }
        if (game.state.player.speed.y > 0) {
          new_y = surface.y1 - game.conf.player.height / 2
        }
        game.state.player.x = game.state.player.x
        game.state.player.y = new_y
        game.state.player.speed.y = 0
      }
    });
  }
  game.loop_engine = () => {
    game.loop_engine_interval_id = window.setInterval(game.step, game.conf.step_interval_ms)
  }
  game.loop_render = () => {
    game.loop_render_interval_id = window.setInterval(game.render, game.conf.render_interval_ms)
  }
  game.render = () => {
    util.draw_background(game.conf, game.canvas, game.context)
    util.draw_player(game.conf, game.canvas, game.context, game.state)
    util.draw_walls(game.conf, game.canvas, game.context)
    util.draw_surfaces(game.conf, game.canvas, game.context)
  }
  return game
}
