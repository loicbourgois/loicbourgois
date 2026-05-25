struct Particle {
  x: f32,
  y: f32,
  i: f32,
  e: f32,
  p: vec2f,
  v: vec2f,
  region_id: i32,
  _padding: f32,
};


struct Field {
  resolution: f32,
  cell_size: f32,
  _padding: vec2f,
};


struct Bounds {
  min_x:f32,
  max_x:f32,
  min_y:f32,
  max_y:f32,
};


struct Pump {
  flow_rate: f32,
  _padding: f32,
  _padding_2: f32,
  _padding_3: f32,
}


struct Metadata {
  field_gravity: Field,
  bounds: Bounds,
  pump: Pump,
  canvas: vec2f,
  time: f32,
  r: f32,
  noise_ratio: f32,
  speed: f32,
  side_size: f32,
  r1: f32,
  r2: f32,
  r3: f32,
};


struct CellGravity {
  i: f32,
  x: f32,
  y: f32,
  e: f32,
};


struct SortItem {
  value: u32,
  index: u32,
};


struct RegionRange {
  start: atomic<u32>,
  end: atomic<u32>,
};


fn dot_(a: vec2f, b: vec2f) -> f32 {
    return a.x * b.x + a.y * b.y;
}


fn norm_sqrd(v: vec2f) -> f32 {
  return v.x * v.x + v.y * v.y;
}


fn distance_sqrd(a: vec2f, b: vec2f) -> f32 {
    let dp = b - a;
    return dp.x * dp.x + dp.y * dp.y;
}


fn rand(v: vec2f) -> f32 {
  return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
}

const diameter_ratio: f32 = 1.5;
