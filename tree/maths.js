import {
  assert_eq
} from "./utils.js"


const EPSILON = 0.00001


const rand_int = (min, max) => {
  return Math.floor(Math.random() * (max-min) + min)
}


const direction = (a, b) => {
  return normalize({
    x: b.x - a.x,
    y: b.y - a.y,
  })
}


const translate = (a, b) => {
  return {
    x: b.x + a.x,
    y: b.y + a.y,
  }
}


const delta = (a, b) => {
  return {
    x: b.x - a.x,
    y: b.y - a.y,
  }
}



const mul = (a, x) => {
  return {
    x: a.x * x,
    y: a.y * x,
  }
}


const normalize = (p) => {
    let d = Math.sqrt(p.x * p.x + p.y * p.y);
    return {
        x: p.x / d,
        y: p.y / d,
    };
}


const distance_squared = (a,b) => {
  const delta_ = delta(a,b)
  return delta_.x * delta_.x + delta_.y * delta_.y
}


const distance = (a,b) => {
  return Math.sqrt(distance_squared(a,b))
}


const rotate = (p, c, a) => {
    // rotate p around c, by a
    return rotate_(c.x, c.y, p.x, p.y, a*360)
}
function rotate_(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return {
      x: nx,
      y: ny,
    };
}


const test = () => {
  const a = {
    x: 0,
    y: 0,
  }
  const b = {
    x: 0,
    y: 1,
  }
  const d = direction(a,b)
  assert_eq( d.x, 0 )
  assert_eq( d.y, 1 )
  const r = rotate(b, a, 0.25)
  assert_eq( r.x, 1 )
  assert_eq( r.y, 0 )
  const r2 = rotate(b, a, 0.0)
  assert_eq( r2.x, 0 )
  assert_eq( r2.y, 1 )
}


test()


export {
  direction,
  translate,
  mul,
  rotate,
  distance_squared,
  distance,
  rand_int,
  EPSILON,
}
