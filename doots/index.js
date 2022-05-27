const DIAMETER = 0.05
const SPEED = 0.001
const DOOT_COUNT = 5
const FACTORY_COUNT = 5
const GOT_RATIO = 0.2
let HISTORY = 0
const DECREASE = 0.9998
const MAX_SPEED = 1
const SHOW_LINES = true
const LOOP_COMPUTE = true
const SPEEDS_HISTORY = 30
const DEBUG_GRID = false
const REFRESH_GRAPH_PERIOD = 60*2
const ZOOM = 2
const DRAW_FOLLOW = false


import {
  rotate,
  beetween,
  rand_int,
  distance,
  collision_response,
} from './math.js'
import {
  add_doot,
  add_doot_2,
} from './doots.js'
import {
  uuid,
} from './utils.js'


const data = {
  acceleration: 0.00004,
  acceleration_min: 0.00001,
  acceleration_max: 0.0001,
  mouse_x: 0.0,
  mouse_y: 0.0,
  max_hapinness: 0.0,
  happinnesses: [],
  happinnesses_2: [],
  tick: 0,
  doots: {},
  factories: {},
  fids_by_kind: {},
  resources: {},
  free_resources: {},
  free_spaces: {},
  diameter: DIAMETER,
  free_targets: {},
  grid: [],
  grid_size: 10,
  definitions: {
    gold: {
      color: "#ee0",
      items: {},
      got: 0,
      factory: {
        label: 'Volcano',
        color: "#fa0",
        period: 200,
        precursors: ['ore'],
      }
    },
    paper: {
      color: "#ddd",
      ids: {},
      got: 0,
      factory: {
        label: 'Paper mill',
        color: "#888",
        period: 300,
        precursors: ['plant'],
      }
    },
    ore: {
      color: "#880",
      ids: {},
      got: 0,
      factory: {
        label: 'Deposit',
        color: "#440",
        period: 200,
        precursors: [],
      }
    },
    plant: {
      color: "#0c0",
      ids: {},
      got: 0,
      factory: {
        label: 'Forest',
        color: "#080",
        period: 300,
        precursors: [],
      }
    },
  }
}
const kinds = Object.keys(data.definitions)
for (var kind of kinds) {
  data.fids_by_kind[kind] = {}
  data.free_resources[kind] = {}
}
data.kinds = kinds


const info = (m) => {
  console.log(m)
  try {
    m = JSON.stringify(m)
  } catch (e) {}
  document.getElementById('logs').textContent += m + "\n"
}


const go = () => {
  const size = Math.min(document.documentElement.clientHeight, document.documentElement.clientWidth)
  const size_2 = Math.max(document.documentElement.clientHeight, document.documentElement.clientWidth)
  if (document.documentElement.clientHeight > document.documentElement.clientWidth) {
    document.body.style.flexDirection = 'column'
  } else {
    document.body.style.flexDirection = 'row'
  }
  let tool_options = ''
  for (var kv of Object.entries({
    tool_none: '-',
    add_tree_factory: 'Add forest',
    add_ore_factory: 'Add ore deposit',
    add_paper_factory: 'Add paper mill',
    add_gold_factory: 'Add volcano',
    tool_delete: 'Delete',
  }) ) {
    tool_options += `<option value="${kv[0]}" >${kv[1]}</option>`
  }
  document.body.innerHTML = `
    <canvas id="canvas" width="${size*ZOOM}px" height="${size*ZOOM}px"></canvas>
    <canvas id="dissalow_canvas" width="${size}px" height="${size}px"></canvas>

    <canvas id="trace_canvas" width="${size}px" height="${size}px"></canvas>

    <div id="panel_2">
      <label>acceleration: <span id="acceleration_value"></span></label> <input type="range" min="0" max="100" value="${((data.acceleration-data.acceleration_min) / ( data.acceleration_max - data.acceleration_min))*100}" class="slider" id="acceleration">
      <p>x: <span id="mouse_x"></span></p>
      <p>y: <span id="mouse_y"></span></p>
      <textarea id="logs"></textarea>
    </div>
    <div id="panel">
      <p id="happiness_2">Happiness: </p>
      <canvas id="graph" height="${size*0.2}px" width="${(size_2-size)}px"></canvas>
      <div id="tool_selection">
        <span>Tool</span>
        <select name="tool_select" id="tool_select">
          ${tool_options}
        </select>
      </div>
      <span>Rules</span>
      <div id="rules">
      </div>
      <button onclick="add_rule()">Add rule</button>
    </div>
  `
  init()
  compute()
  render(
    document.getElementById('canvas').getContext("2d"),
    document.getElementById('dissalow_canvas').getContext("2d"),
    document.getElementById('trace_canvas').getContext("2d"),
  )
}


const init = () => {
  const canvas = document.getElementById('canvas')
  const dissalow = document.getElementById('dissalow_canvas')
  const dissalow_context = dissalow.getContext('2d')
  canvas.addEventListener('mousemove', (evt) => {
    const rect = canvas.getBoundingClientRect();
    data.mouse_x = (evt.clientX - rect.left) / rect.width
    data.mouse_y = 1.0 - (evt.clientY - rect.top) / rect.height
  }, false);
  canvas.addEventListener('click', (evt) => {
    const rect = canvas.getBoundingClientRect();
    data.mouse_x = (evt.x - rect.left) / rect.width
    data.mouse_y = 1.0 - (evt.y - rect.top) / rect.height
    dissalow_context.clearRect(0,0,dissalow_context.canvas.width, dissalow_context.canvas.height)
    Object.entries(data.factories).forEach((item, i) => {
      const factory = item[1]
      fill_circle(
        dissalow_context, factory.x, factory.y,
        factory.d*4.0,
        "#f004"
      )
    })
    const p = dissalow_context.getImageData((evt.x - rect.left), (evt.y - rect.top), 1, 1).data;
    const tool = document.getElementById('tool_select')?.value;
    if (tool == 'tool_none' || tool == undefined) {

    } else if (tool == 'tool_delete') {
      Object.entries(data.factories).forEach((item, i) => {
        const factory = item[1]
        if ( distance_from_to(factory, {x:data.mouse_x, y:data.mouse_y}) < factory.d*0.5 ) {
          for (let kind of kinds) {
            Object.entries(factory.resources[kind]).forEach((item, i) => {
              delete_resource(item[0])
            })
          }
          delete data.factories[item[0]]
        }
      })
    } else if (p[0] == 0 && tool == 'add_tree_factory' ) {
      add_factory_at('plant', data.mouse_x, data.mouse_y)
    } else if (p[0] == 0 && tool == 'add_ore_factory' ) {
      add_factory_at('ore', data.mouse_x, data.mouse_y)
    } else if (p[0] == 0 && tool == 'add_gold_factory' ) {
      add_factory_at('gold', data.mouse_x, data.mouse_y)
    } else if (p[0] == 0 && tool == 'add_paper_factory' ) {
      add_factory_at('paper', data.mouse_x, data.mouse_y)
    } else {
        info("Need empty space")
    }
  }, false);
  for (var i = 0; i < DOOT_COUNT; i++) {
    add_doot(data)
  }
  for (var kind of kinds) {
    data.free_spaces[kind] = new Map()
  }
  for (var i = 0; i < FACTORY_COUNT; i++) {
    for (var kind of kinds) {
      add_factory(kind)
    }
  }
  data.grid = new Array(data.grid_size * data.grid_size)
  for (var i = 0; i < data.grid.length; i++) {
    data.grid[i] = {
      'doots': new Map(),
      'factories': new Map(),
      'resources': new Map(),
    };
  }
  update_rules_ui()
}


const add_factory_at = (kind, x, y) => {
  const id = uuid()
  const resources = {}
  for (var kind_ of kinds) {
    resources[kind_] = {}
  }
  data.factories[id] = {
    kind: kind,
    x: x,
    y: y,
    tick: 0,
    d: data.diameter*1.25,
    free_spaces: {
      0:true,
      1:true,
      2:true,
      3:true,
      4:true,
      5:true,
    },
    used_spaces: {},
    resources: resources
  }
  for (var i = 0; i < 6; i++) {
    data.free_spaces[kind].set(`${id}|${i}`, `${id}|${i}`)
  }
  data.fids_by_kind[kind][id] = data.factories[id]
}


const add_factory = (kind) => {
  const x = Math.random()*0.8+0.1;
  const y = Math.random()*0.8+0.1;
  let ok = true
  Object.entries(data.factories).forEach((item, i) => {
    const factory = item[1]
    if ( distance_from_to(factory, {x:x,y:y}) < DIAMETER  * 3 ) {
      ok = false
    }
  })
  if (!ok) {
    add_factory(kind)
    return
  }
  add_factory_at(kind, x, y)
}


const delete_resource = (resource_id) => {
  const resource = data.resources[resource_id]
  const factory = data.factories[resource.factory_id]
  if (factory) {
    const free_space_id = `${resource.factory_id}|${resource.space_id}`
    data.free_spaces[ factory.kind ].set(free_space_id, free_space_id)
    data.factories[resource.factory_id].free_spaces[resource.space_id] = true
    delete data.factories[resource.factory_id].used_spaces[resource.space_id]
    delete data.factories[resource.factory_id].resources[resource.kind][resource_id]
  }
  delete data.resources[resource_id]
  delete data.free_resources[resource.kind][resource_id]
}


const factory_space_xy = (factory_id, space_id) => {
  const f = data.factories[factory_id]
  if (f) {
    return rotate(
      [f.x+data.diameter,f.y],
      [f.x,f.y],
      space_id/6,
    )
  }
}


const add_resource_to_factory = (factory_id, kind, space_id) => {
  const k = factory_id
  const u = uuid()
  space_id = space_id ? space_id : Object.keys(data.factories[k].free_spaces)[0]
  data.factories[k].resources[kind][u] = u
  delete data.factories[k].free_spaces[space_id]
  data.factories[k].used_spaces[space_id] = true
  const xy = factory_space_xy(k, space_id)
  data.resources[u] = {
    x: xy[0],
    y: xy[1],
    d: data.diameter*0.5,
    kind: kind,
    store: 1.0,
    factory_id: k,
    space_id: space_id,
  }
  data.free_resources[kind][u] = true
  data.free_spaces[ data.factories[k].kind ].delete(`${k}|${space_id}`)
}


const update_grid = () => {
  for (var i = 0; i < data.grid_size * data.grid_size; i++) {
    data.grid[i].doots.clear()
    data.grid[i].factories.clear()
    data.grid[i].resources.clear()
  }
  Object.entries(data.doots).forEach((item, i) => {
    const doot_id = item[0]
    const doot = item[1]
    const grid_x = beetween(0, data.grid_size-1, Math.floor(doot.x * data.grid_size) )
    const grid_y =  beetween(0, data.grid_size-1, Math.floor(doot.y * data.grid_size) )
    const grid_id_ = grid_id(grid_x, grid_y, data.grid_size)
    data.grid[grid_id_].doots.set(doot_id, doot_id)
  })
  Object.entries(data.resources).forEach( (kv, i) => {
    const id = kv[0]
    const item = kv[1]
    const grid_x = beetween(0, data.grid_size-1, Math.floor(item.x * data.grid_size) )
    const grid_y =  beetween(0, data.grid_size-1, Math.floor(item.y * data.grid_size) )
    const grid_id_ = grid_id(grid_x, grid_y, data.grid_size)
    data.grid[grid_id_].resources.set(id, id)
  })
}


const grid_id = (x, y, size) => {
  return beetween(0, data.grid_size*data.grid_size-1, Math.floor(x + y * size))
}


const compute = () => {
  update_grid()
  data.acceleration = document.getElementById("acceleration").value * (data.acceleration_max - data.acceleration_min) / 100 + data.acceleration_min
  Object.entries(data.factories).forEach((item, i) => {
    const k = item[0]
    const kind = data.factories[k].kind
    let precursors_ok = true
    for (var precursor of data.definitions[kind].factory.precursors) {
      if (Object.entries(data.factories[k].resources[precursor]).length <= 0) {
        precursors_ok = false
      }
    }
    if ( Object.keys(data.factories[k].free_spaces ).length && precursors_ok) {
      data.factories[k].tick += 1
    }
    if (data.factories[k].tick == data.definitions[kind].factory.period) {
      data.factories[k].tick = 0
      for (var precursor of data.definitions[kind].factory.precursors) {
        const rid = Object.keys(data.factories[k].resources[precursor])[0]
        delete_resource(rid)
      }
      add_resource_to_factory(k, kind)
    }
  })
  Object.entries(data.doots).forEach((item, i) => {
    const k = item[0]
    const doot = item[1]
    const from = [ data.doots[k].x, data.doots[k].y ]
    let r
    let to = [ Math.random(), Math.random() ]
    if (doot.action && doot.action.kind == 'take' && data.resources[doot.action.resource_id]) {
      r = data.resources[doot.action.resource_id]
      to = [ r.x, r.y ]
    } else if (doot.action && doot.action.kind == 'give') {
      to = factory_space_xy(doot.action.factory_id, doot.action.space_id)
    } else {
      new_action(k)
    }
    if (to?.length != 2) {
      new_action(k)
      return
    }
    const v = [to[0] - from[0], to[1] - from[1]]
    const d = Math.sqrt(v[0]*v[0] + v[1]*v[1])
    data.doots[k].direction = [ v[0]/d, v[1]/d ]
    data.doots[k].speed[0] = data.doots[k].x - data.doots[k].ox
    data.doots[k].speed[1] = data.doots[k].y - data.doots[k].oy
    data.doots[k].ox = data.doots[k].x
    data.doots[k].oy = data.doots[k].y
    data.doots[k].speed[0] *= 0.99;
    data.doots[k].speed[1] *= 0.99;
    data.doots[k].speed[0] += data.doots[k].direction[0] * data.acceleration;
    data.doots[k].speed[1] += data.doots[k].direction[1] * data.acceleration;
    data.doots[k].speed[0] = beetween(-MAX_SPEED, MAX_SPEED, data.doots[k].speed[0])
    data.doots[k].speed[1] = beetween(-MAX_SPEED, MAX_SPEED, data.doots[k].speed[1])
    data.doots[k].speeds.push([ data.doots[k].direction[0], data.doots[k].direction[1] ])
    if (data.doots[k].speeds.length > SPEEDS_HISTORY) {
      data.doots[k].speeds.shift()
    }
    data.doots[k].x += data.doots[k].speed[0]
    data.doots[k].y += data.doots[k].speed[1]
    if (d <= DIAMETER*0.5 ) {
      if (data.doots[k].action && data.doots[k].action.kind == 'take') {
          const resource_kind = data.resources[data.doots[k].action.resource_id]?.kind
          if (resource_kind) {
            data.doots[k].got[resource_kind] += GOT_RATIO
            data.definitions[resource_kind].got += GOT_RATIO;
            delete_resource(doot.action.resource_id)
            delete data.doots[k].action
          }
      } else if (data.doots[k].action && data.doots[k].action.kind == 'give') {
          data.doots[k].got[doot.action.resource_kind] -= GOT_RATIO
          add_resource_to_factory(doot.action.factory_id, doot.action.resource_kind, doot.action.space_id )
          delete data.doots[k].action
      }
    }
    for (var kind of kinds) {
      data.doots[k].got[kind] = Math.min( data.doots[k].got[kind] * DECREASE, 1.0)
    }
  })
  Object.entries(data.doots).forEach((item, i) => {
    const k = item[0]
    data.doots[k].collisions = 0
    const x_grid = beetween(0, data.grid_size-1, Math.floor(data.doots[k].x * data.grid_size) )
    const y_grid = beetween(0, data.grid_size-1, Math.floor(data.doots[k].y * data.grid_size) )
    const x_min = beetween(0, x_grid, x_grid-1)
    const y_min = beetween(0, y_grid, y_grid-1)
    const x_max = beetween(x_grid, data.grid_size-1, x_grid+1)
    const y_max = beetween(y_grid, data.grid_size-1, y_grid+1)
    data.doots[k].xnew = data.doots[k].x
    data.doots[k].ynew = data.doots[k].y
    data.doots[k].delta_collision_x = 0.0
    data.doots[k].delta_collision_y = 0.0
    for (var x = x_min; x <= x_max; x++) {
      for (var y = y_min; y <= y_max; y++) {
        const grid_id_ = grid_id(x, y, data.grid_size)
        for (const doot_id_2 of data.grid[grid_id_].doots.keys() ) {
          if (doot_id_2 != k) {
            const doot_2 = data.doots[doot_id_2]
            if ( distance(data.doots[k], doot_2) < DIAMETER ) {
              data.doots[k].collisions += 1
              const cr = collision_response({
                p1: {
                  x:    data.doots[k].x,
                  y:    data.doots[k].y,
                  ox:   data.doots[k].ox,
                  oy:   data.doots[k].oy,
                  mass: 1.0,
                },
                p2: {
                  x:    doot_2.x,
                  y:    doot_2.y,
                  ox:   doot_2.ox,
                  oy:   doot_2.oy,
                  mass: 1.0,
                }
              })
              data.doots[k].xnew += cr.x * 0.5
              data.doots[k].ynew += cr.y * 0.5
              data.doots[k].delta_collision_x += ( data.doots[k].x-doot_2.x  ) * 0.01
              data.doots[k].delta_collision_y += ( data.doots[k].y-doot_2.y  ) * 0.01
            }
          }
        }
      }
    }
  })
  Object.entries(data.doots).forEach((item, i) => {
    const k = item[0]
    data.doots[k].x = data.doots[k].xnew + data.doots[k].delta_collision_x
    data.doots[k].y = data.doots[k].ynew + data.doots[k].delta_collision_y

    data.doots[k].ox += data.doots[k].delta_collision_x
    data.doots[k].oy += data.doots[k].delta_collision_y
  })
  let happiness = 0.0
  Object.entries(data.doots).forEach((item, i) => {
    const k = item[0]
    const doot = item[1]
    let h = 1.0
    for (var kind of kinds) {
      h *= doot.got[kind]
      data.doots[k].got_history[kind].push(data.doots[k].got[kind])
      if (data.doots[k].got_history[kind].length > HISTORY) {
        data.doots[k].got_history[kind].shift()
      }
    }
    happiness += h;
  });
  data.happiness = happiness / DOOT_COUNT * 100
  if (data.happiness > data.max_hapinness) {
    data.max_hapinness = data.happiness
  }
  data.happinnesses.push(data.happiness)
  if (data.happinnesses.length > HISTORY) {
    data.happinnesses.shift()
  }
  let happiness_2 = 0.0
  for (var i = 0; i < data.happinnesses.length; i++) {
    happiness_2 += data.happinnesses[i]
  }
  data.happinnesses_2.push(happiness_2 / data.happinnesses.length)
  if (data.happinnesses_2.length > HISTORY) {
    data.happinnesses_2.shift()
  }
  data.tick += 1;
  if (LOOP_COMPUTE) {
    setTimeout(compute, 0);
  }
}


const distance_to_target = (doot_id, resource_id) => {
  const doot = data.doots[doot_id]
  const resource = data.resources[resource_id]
  const from = [ doot.x, doot.y ]
  const to = [ resource.x, resource.y ]
  const v = [to[0] - from[0], to[1] - from[1]]
  const d = Math.sqrt(v[0]*v[0] + v[1]*v[1])
  return d
}


const distance_to_factory = (doot_id, factory_id) => {
  return distance_from_to(data.doots[doot_id], data.factories[factory_id])
}


const distance_from_to = (from, to) => {
  if (from == undefined || to == undefined) {
    return
  }
  const v = [to.x - from.x, to.y - from.y]
  const d = Math.sqrt(v[0]*v[0] + v[1]*v[1])
  return d
}


const new_action = (doot_id) => {
  const action = new_action_1(doot_id)
  if (action && action.kind == 'take' && action.resource_id) {
    data.doots[doot_id].action = action
    delete data.free_resources[data.resources[action.resource_id].kind][action.resource_id]
  }
  if (action && action.kind == 'give' && action.factory_id) {
    data.doots[doot_id].action = action
  }
}


const new_target_id_0 = (doot_id) => {
  const keys = Object.keys(data.resources)
  if (keys.length <= 0) {
    return
  }
  return keys[rand_int(0, keys.length-1)]
}


const give_action = (kind_give, kind_factory, doot_id) => {
  let score = 0
  let space_id
  let fid
  for (var free_space_id of data.free_spaces[kind_factory].keys() ) {
    const new_fid = free_space_id.split('|')[0]
    const new_space_id = free_space_id.split('|')[1]
    const is_free = data.factories[new_fid]?.free_spaces[new_space_id]
    const new_score = 1.0 / distance_to_factory(doot_id, new_fid) + new_space_id
    if (is_free && new_score > score &&  Object.keys(data.factories[new_fid].free_spaces).length >= 2  ) {
      score = new_score
      fid = new_fid
      space_id = new_space_id
    }
  }
  if (fid) {
    data.free_spaces[kind_factory].delete(`${fid}|${space_id}`)
    return {
      kind: 'give',
      resource_kind: kind_give,
      factory_id: fid,
      space_id: space_id,
    }
  }
}


const take_action = (doot_id, kind) => {
  if (kind && data.free_resources[kind]) {
    const keys = Object.keys(data.free_resources[kind])
    let resource_id
    let score = 0
    for (var i = 0; i < keys.length; i++) {
      const new_resource_id = keys[i]
      let distance = distance_to_target(doot_id, new_resource_id)
      const resource = data.resources[new_resource_id]
      const new_score = data.doots[doot_id].got[resource.kind] / distance
      if (resource.kind == kind
        && new_score >= score
        && data.factories[resource.factory_id]
        && resource.kind == data.factories[resource.factory_id]?.kind
      ) {
        score = new_score
        resource_id = new_resource_id
      }
    }
    if (resource_id) {
      return {
        resource_id: resource_id,
        kind: 'take',
        resource_kind: kind,
      }
    }
  }
}


const conditions = {
  '-': {
    label: '-',
    f: (doot_id) => {
      return false
    }
  },
  'low_resource': {
    label: 'self resource < 20%',
    f: (doot_id) => {
      for (let kind of kinds) {
        if ( data.doots[doot_id].got[kind] < 0.2 && Object.keys(data.free_resources[kind]).length ) {
          return kind
        }
      }
    }
  },
  'resource_not_full': {
    label: 'self resource < 90%',
    f: (doot_id) => {
      for (let kind of kinds) {
        if ( data.doots[doot_id].got[kind] < 0.9 && Object.keys(data.free_resources[kind]).length ) {
          return kind
        }
      }
    }
  },
  'resource_not_half': {
    label: 'self resource < 50%',
    f: (doot_id) => {
      for (let kind of kinds) {
        if ( data.doots[doot_id].got[kind] < 0.5 && Object.keys(data.free_resources[kind]).length ) {
          return kind
        }
      }
    }
  }
}
const actions = {
  'take_resource': {
    label: 'take resource',
    f: (doot_id, kind) => {
      if (kind) {
        return take_action(doot_id, kind)
      }
    }
  },
  '-': {
    label: '-',
    f: (doot_id, kind) => {}
  }
}
for (let kind of kinds) {
  conditions[`low_${kind}`] = {
    label: `self ${kind} < 20%`,
    f: (doot_id) => {
      return data.doots[doot_id].got[kind] < 0.2
    }
  }
  conditions[`last_action_take_${kind}`] = {
    label: `last action == take ${kind}`,
    f: (doot_id) => {
      return data.doots[doot_id].last_action_id == `take_${kind}`
    }
  }
  conditions[`${kind}_not_full`]= {
    label: `self ${kind} < 90%`,
    f: (doot_id) => {
      return data.doots[doot_id].got[kind] < 0.9
    }
  }
  conditions[`${kind}_half_full`]= {
    label: `self ${kind} > 50%`,
    f: (doot_id) => {
      return data.doots[doot_id].got[kind] > 0.5
    }
  }
  actions[`take_${kind}`] = {
    label: `take ${kind}`,
    f: (doot_id) => {
      return take_action(doot_id, kind)
    }
  }
  const factory_definition = data.definitions[kind].factory
  for (let precursor of factory_definition.precursors) {
    const action_id = `give_${precursor}_to_${factory_definition.label}`
    const action_label = `give ${precursor} to ${factory_definition.label}`
    actions[action_id] = {
      label: action_label,
      f: (doot_id) => {
        const r = give_action(precursor, kind, doot_id)
        return r
      }
    }
    conditions[`last_action_${action_id}`] = {
      label: `last action == ${action_label}`,
      f: (doot_id) => {
        return data.doots[doot_id].last_action_id == action_id
      }
    }
  }
}
const operands = {
  '-': {
    label: '-',
    f: (condition_1, condition_2) => {
      return condition_1
    }
  },
  and: {
    label: 'and',
    f: (condition_1, condition_2) => {
      return condition_1 && condition_2
    }
  },
  or: {
    label: 'or',
    f: (condition_1, condition_2) => {
      return condition_1 || condition_2
    }
  }
}


const rules = [
  {
    condition_1: 'resource_not_half',
    operand: '-',
    condition_2: '-',
    action: 'take_resource',
  },
  {
    condition_1: 'plant_half_full',
    operand: '-',
    condition_2: '-',
    action: 'give_plant_to_Paper mill',
  },
  {
    condition_1: 'ore_half_full',
    operand: '-',
    condition_2: '-',
    action: 'give_ore_to_Volcano',
  },
  {
    condition_1: 'resource_not_full',
    operand: '-',
    condition_2: '-',
    action: 'take_resource',
  },
]


const encode_html = (htmlstring) => {
	let textarea = document.createElement('textarea');
	let text = document.createTextNode(htmlstring);
	textarea.appendChild(text);
	return textarea.innerHTML;
}


const update_rules_count = () => {
  const counts = new Array(rules.length)
  for (var i = 0; i < rules.length; i++) {
    counts[i] = 0
  }
  Object.entries(data.doots).forEach((kv, i) => {
    const doot = kv[1]
    if (doot.rule_id != undefined) {
      counts[doot.rule_id] += 1
    }
  })
  for (var i = 0; i < rules.length; i++) {
    document.getElementById(`rule-${i}-count`).innerHTML = counts[i] ? counts[i] : "-";
  }
}


const add_rule = () => {
  rules.push({
      condition_1: '-',
      operand: '-',
      condition_2: '-',
      action: '-',
  })
  update_rules_ui()
}


const delete_rule = (i) => {
  rules.splice(i, 1)
  update_rules_ui()
}


const move_rule_down = (i) => {
  const rule_1 = JSON.stringify(rules[i+1])
  const rule_2 = JSON.stringify(rules[i])
  rules[i] = JSON.parse(rule_1)
  rules[i+1] = JSON.parse(rule_2)
  update_rules_ui()
}

const move_rule_up = (i) => {
  const rule_1 = JSON.stringify(rules[i-1])
  const rule_2 = JSON.stringify(rules[i])
  rules[i] = JSON.parse(rule_1)
  rules[i-1] = JSON.parse(rule_2)
  update_rules_ui()
}


const update_c1 = (i) => {
  console.log('aa')
  console.log(document.getElementById(`rule-${i}-c1`).value)
  rules[i].condition_1 = document.getElementById(`rule-${i}-c1`).value
}


const update_c2 = (i) => {
  rules[i].condition_2 = document.getElementById(`rule-${i}-c2`).value
}


const update_operand = (i) => {
  rules[i].operand = document.getElementById(`rule-${i}-operand`).value
}


const update_action = (i) => {
  rules[i].action = document.getElementById(`rule-${i}-action`).value
}


const update_rules_ui = () => {
  let html = ''
  for (var i = 0; i < rules.length; i++) {
    const rule = rules[i]
    const up_disabled = i == 0 ? "disabled" : "";
    const down_disabled = i == rules.length-1 ? "disabled" : "";
    let c1_options = ''
    let c2_options = ''
    for (var k of Object.keys(conditions) ) {
      const condition = conditions[k]
      const selected = rule.condition_1 == k ? 'selected' : '';
      c1_options += `<option value="${k}" ${selected}>${encode_html(conditions[k].label)}</option>`
      const selected_2 = rule.condition_2 == k ? 'selected' : '';
      c2_options += `<option value="${k}" ${selected_2}>${encode_html(conditions[k].label)}</option>`
    }
    let operand_options = ''
    for (var k of Object.keys(operands) ) {
      const operand = operands[k]
      const selected = rule.operand == k ? 'selected' : '';
      operand_options += `<option value="${k}" ${selected}>${encode_html(operands[k].label)}</option>`
    }
    let action_options = ''
    for (var k of Object.keys(actions) ) {
      const action = actions[k]
      const selected = rule.action == k ? 'selected' : '';
      action_options += `<option value="${k}" ${selected}>${encode_html(actions[k].label)}</option>`
    }
    html += `
      <div class="rule">
        <span class="rule-count" id="rule-${i}-count" >-</span>
        <button ${up_disabled}    onclick="move_rule_up(${i})">↑</button>
        <button ${down_disabled}  onclick="move_rule_down(${i})">↓</button>
        <div class="expand conditions">
          <select onchange="update_c1(${i})"  name="rule-${i}-c1" id="rule-${i}-c1">
            ${c1_options}
          </select>
          <div class="flex">
            <select onchange="update_operand(${i})" name="rule-${i}-operand" id="rule-${i}-operand">
              ${operand_options}
            </select>
            <select onchange="update_c2(${i})" class="expand"  name="rule-${i}-c2" id="rule-${i}-c2">
              ${c2_options}
            </select>
          </div>
        </div>
        <select onchange="update_action(${i})" name="rule-${i}-action" id="rule-${i}-action" class="expand">
          ${action_options}
        </select>
        <button onclick="delete_rule(${i})">❌</button>
      </div>
    `
  }
  document.getElementById('rules').innerHTML = html
}

console.log(actions)

const new_action_1 = (doot_id) => {
  data.doots[doot_id].rule_id = undefined
  for (var i = 0; i < rules.length; i++) {
    const rule = rules[i]
    const operand = operands[rule.operand].f
    const c1 = conditions[rule.condition_1].f(doot_id)
    const c2 = conditions[rule.condition_2].f(doot_id)
    if ( operand(c1, c2)) {
      const action = actions[rule.action].f(doot_id, c1)
      if (action) {
        data.doots[doot_id].last_action_id = rule.action.replaceAll('resource', action.resource_kind)
        data.doots[doot_id].rule_id = i
        return action
      }
    }
  }
}


const render = (
  context,
  dissalow_context,
  trace_context,
  frame_id
) => {
  if (!frame_id) {
    trace_context.fillStyle = "#161626ff"
    trace_context.fillRect(0, 0, trace_context.canvas.width, trace_context.canvas.height)
  }
  frame_id = frame_id ? frame_id+1 : 1;
  trace_context.fillStyle = "#16162610"
  trace_context.fillRect(0, 0, trace_context.canvas.width, trace_context.canvas.height)
  context.clearRect(0,0,context.canvas.width, context.canvas.height)
  const tool = document.getElementById('tool_select')?.value;
  update_rules_count()
  if (
    tool == 'add_tree_factory'
    || tool == 'add_ore_factory'
    || tool == 'add_gold_factory'
    || tool == 'add_paper_factory'
  ) {
    Object.entries(data.factories).forEach((item, i) => {
      const factory = item[1];
      fill_circle(
        context, factory.x, factory.y,
        factory.d*4.0,
        "#600"
      )
    })
  }
  Object.entries(data.factories).forEach((item, i) => {
    const factory = item[1]
    fill_circle(
      context, factory.x, factory.y,
      factory.d,
      data.definitions[factory.kind].factory.color
    )
    fill_circle(
      context, factory.x, factory.y,
      factory.d*factory.tick/data.definitions[factory.kind].factory.period,
      data.definitions[factory.kind].color
    )
    fill_text(context, data.definitions[factory.kind].factory.label, factory.x, factory.y,)
  })
  Object.entries(data.resources).forEach((item, i) => {
    const r = item[1]
    fill_circle(
      context, r.x, r.y,
      r.d,
      data.definitions[r.kind].color
    )
  })
  Object.entries(data.doots).forEach((item, i) => {
    const k = item[0]
    const doot = item[1]
    const d = doot.diameter


    let target
    if (SHOW_LINES) {
      if (doot.action && doot.action.kind == 'take') {
        const r = data.resources[doot.action.resource_id]
        if (r) {
          line(context, doot.x,doot.y, r.x,r.y)
        }
      }
      if (doot.action && doot.action.kind == 'give') {
        const to = factory_space_xy(doot.action.factory_id, doot.action.space_id)
        if (to) {
          line(context, doot.x,doot.y, to[0],to[1])
        }
      }
    }
    const x = doot.x
    const y = doot.y
    fill_circle(context, x, y, d, '#00aaaa')

    if (DRAW_FOLLOW) {
      fill_circle(trace_context, x, y, d*.5, '#00aaaa')
    }

    //

    for (let i = 0; i < kinds.length; i++) {
      const kind = kinds[i]
      // const y_ = y+0.15*d*i - 0.15*0.5*d*(kinds.length-1)
      // fill_rect(context, x, y_, d*0.75, d*0.125, '#fa0')
      // fill_rect(context, x, y_, d*0.75*doot.got[kind], d*0.125, '#0f0')
      fill_circle(context, x, y, d*0.8-d*( (i+0)*0.2 - 0.2  )     , '#00aaaa')
      fill_circle(context, x, y, d*0.8-d*( (i+0)*0.2 - 0.2*doot.got[kind]  )     , data.definitions[kind].color)
    }
    const average_speed = [0.0, 0.0]
    for (var i = 0; i < doot.speeds.length; i++) {
      average_speed[0] += doot.speeds[i][0]
      average_speed[1] += doot.speeds[i][1]
    }
    average_speed[0] /= doot.speeds.length
    average_speed[1] /= doot.speeds.length
    // const v = [doot.speeds[i][0], doot.speeds[i][1]]
    // const distance = Math.sqrt(v[0]*v[0] + v[1]*v[1])
    const v = [average_speed[0], average_speed[1]]
    const distance = Math.sqrt(v[0]*v[0] + v[1]*v[1])
    const nv = [v[0]/distance, v[1]/distance]
    data.doots[k].eyes = {
      left:rotate([
        x+nv[0]*d*0.45,
        y+nv[1]*d*0.45,
      ], [x,y], 0.07),
      right:rotate([
        x+nv[0]*d*0.45,
        y+nv[1]*d*0.45,
      ], [x,y], -0.07)
    }
      const eye_color = data.doots[k].collisions ? '#fff' : '#fff'
      fill_circle(context, data.doots[k].eyes.left[0], data.doots[k].eyes.left[1], d*0.35, eye_color)
      fill_circle(context, data.doots[k].eyes.left[0], data.doots[k].eyes.left[1], d*0.15, '#111')
      fill_circle(context, data.doots[k].eyes.right[0], data.doots[k].eyes.right[1], d*0.35, eye_color)
      fill_circle(context, data.doots[k].eyes.right[0], data.doots[k].eyes.right[1], d*0.15, '#111')
  });


  if (DEBUG_GRID) {
    for (var i = 0; i < data.grid.length; i++) {
      const y = Math.floor( i / data.grid_size) / data.grid_size +0.5/data.grid_size
      const x = (i % data.grid_size) / data.grid_size +0.5/data.grid_size
      fill_rect(context, x, y, 0.98/data.grid_size,0.98/data.grid_size, '#fff4')
      const text = `${data.grid[i].doots.size}`
      fill_text(context, text, x, y,)
    }
  }


  const graph_context = document.getElementById("graph").getContext("2d")
  HISTORY = graph_context.canvas.width
  if (frame_id % REFRESH_GRAPH_PERIOD == 0) {
    graph_context.clearRect(0,0,
      graph_context.canvas.width, graph_context.canvas.height)
    for (let i = 0; i < data.happinnesses.length; i++) {
      let v_min = 0.0
      for (var kind of kinds) {
        let value = 0.0
        Object.keys(data.doots).forEach((k, _) => {
          value += data.doots[k].got_history[kind][i]
        })
        value /= (Object.keys(data.doots).length * kinds.length)
        line(graph_context, i/HISTORY, v_min, i/HISTORY, v_min+value, 1, data.definitions[kind].color);
        v_min += value
      }
    }
    for (let i = 0; i < data.happinnesses_2.length; i++) {
      const value = data.happinnesses_2[i]/100
      line(graph_context, i/HISTORY, value-0.01, i/HISTORY, value+0.01, 1, "#f0f");
    }
  }
  if (data.happinnesses_2.length) {
    const last_happinnesses_2 = data.happinnesses_2[data.happinnesses_2.length-1]
    document.getElementById("happiness_2").innerHTML = `Happiness: ${last_happinnesses_2.toFixed(1)}`
  }
  document.getElementById("acceleration_value").innerHTML = data.acceleration.toFixed(6)
  document.getElementById("mouse_x").innerHTML = data.mouse_x.toFixed(2)
  document.getElementById("mouse_y").innerHTML = data.mouse_y.toFixed(2)
  requestAnimationFrame(() => {
    render(context, dissalow_context, trace_context, frame_id)
  })
}


const fill_text = (context, text, x, y) => {
  const size = 18
  const xx = context.canvas.width * x - text.length*16/3  ;
  const yy = context.canvas.height - context.canvas.height * y + size*0.45;
  context.font = `${size}px monospace`;
  context.fillStyle = "#fff"
  context.fillText(text, xx, yy);
}


const line = (context, x1,y1,x2,y2,lineWidth, color) => {
  const xx1 = context.canvas.width * x1;
  const yy1 = context.canvas.height - context.canvas.height * y1;
  const xx2 = context.canvas.width * x2;
  const yy2 = context.canvas.height - context.canvas.height * y2;
  context.lineWidth = lineWidth?lineWidth:5;
  context.strokeStyle = color ? color : "#fff4";
  context.beginPath()
  context.moveTo(xx1, yy1)
  context.lineTo(xx2, yy2)
  context.stroke()
}


const fill_rect = (context, x, y, width, height, color) => {
  const ww = width * context.canvas.width;
  const hh = height * context.canvas.height;
  const xx = context.canvas.width * x - ww * 0.5;
  const yy = context.canvas.height - context.canvas.height * y - hh * 0.5;
  context.fillStyle = color;
  context.fillRect(xx, yy, ww, hh);
  context.lineWidth = 0;
}


const fill_circle = (context, x, y, diameter, color) => {
  const xx = context.canvas.width * x;
  const yy = context.canvas.height - context.canvas.height * y;
  const radius = diameter * context.canvas.width * 0.5;
  context.beginPath();
  context.arc(xx, yy, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
}


window.onload = async () => {
  window.move_rule_down = move_rule_down
  window.move_rule_up = move_rule_up
  window.update_c1 = update_c1
  window.update_c2 = update_c2
  window.update_operand = update_operand
  window.update_action = update_action
  window.add_rule = add_rule
  window.delete_rule = delete_rule
  go()
}
