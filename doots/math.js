const rotate = (p1, p2, angle) => {
    // Rotates p1 around p2
    // with angle in range [0.0;1.0].
    let dx = p1[0] - p2[0];
    let dy = p1[1] - p2[1];
    const angle_rad = angle * Math.PI * 2.0
    let cos_ = Math.cos(angle_rad);
    let sin_ = Math.sin(angle_rad);
    return [
      p2[0] + dx * cos_ - dy * sin_,
      p2[1] + dy * cos_ + dx * sin_,
    ]
}


const beetween = (min, max, value)  => {
  return Math.min( Math.max( value, min ), max)
}


const delta = (from, to) => {
  return {
    x: to.x - from.x,
    y: to.y - from.y,
  }
}


const distance = (from, to) => {
  const v = delta(from, to)
  return Math.sqrt(v.x*v.x + v.y*v.y)
}


const rand_int = (min, max) => {
  return Math.floor((Math.random() * (max+1-min) )+min)
}


const dot = (a,b) => {
    return a.x * b.x + a.y * b.y;
}

const collision_response = (_) => {
  const v1 = {
    x: _.p1.x - _.p1.ox,
    y: _.p1.y - _.p1.oy,
  }
  const v2 = {
    x: _.p2.x - _.p2.ox,
    y: _.p2.y - _.p2.oy,
  }
  const delta_velocity = {
    x: v2.x - v1.x,
    y: v2.y - v1.y,
  }
  const delta_position = {
    x: _.p1.x - _.p2.x,
    y: _.p1.y - _.p2.y
  }



  const mass_factor = 2.0 * _.p2.mass / (_.p1.mass + _.p2.mass);
  const dot_vp = dot(delta_velocity, delta_position);
  let distance_ = distance({x:0,y:0}, delta_position);
  let distance_squared = distance_ * distance_;

  //console.log(delta_velocity,delta_position, dot_vp)

  return {
    x: delta_position.x * mass_factor * dot_vp / distance_squared,
    y: delta_position.y * mass_factor * dot_vp / distance_squared,
  }

  //

  //return acceleration
}


export {
  rotate,
  beetween,
  rand_int,
  distance,
  collision_response,
}
