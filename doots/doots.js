import {
  uuid,
} from './utils.js'


const add_doot = (data) => {
  const x = Math.random() * 0.8 + 0.1
  const y = Math.random() * 0.8 + 0.1
  add_doot_2(data, x, y, 0.0, 0.0)
}


const add_doot_2 = (data, x, y, dx, dy) => {
  const need = {}
  const got = {}
  const got_history = {}
  for (let kind of data.kinds) {
    need[kind] = 0.5
    got[kind] = 0.1
    got_history[kind] = [0.1]
  }
  data.doots[uuid()] = {
    x: x,
    y: y,
    ox: x-dx,
    oy: y-dy,
    position: [x,y],
    speed: [0,0],
    diameter: data.diameter,
    need: need,
    got: got,
    got_history: got_history,
    speeds: [],
  }
}


export {
  add_doot,
  add_doot_2,
}
