struct VSOutput {
  @builtin(position) position: vec4f,
};


struct Metadata {
  canvas: vec2f,
  // performance.now()
  time: f32,
  r: f32,
  noise_ratio: f32,
  speed: f32,
  unit_count_f: f32,
  tick: f32,
};


struct MasksMeta {
  count: u32,
  dims: array<u32>,
};


struct DataPoint {
  kind: i32,
  r: i32,
  g: i32,
  b: i32,
  direction: i32,
};


fn rand(v: vec2f) -> f32 {
  return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
}


const unit_size: i32 = 9;


@group(0) @binding(0) var<uniform> m: Metadata;
@group(0) @binding(1) var<storage, read> imgs: array<f32>;
@group(0) @binding(3) var<storage, read> data: array<DataPoint>;


@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VSOutput {
  var vsOut: VSOutput;
  var pos = array<vec2f, 6>(
    vec2f( -1.,  -1.),
    vec2f(-1., 1.),
    vec2f( 1., -1.),
    vec2f( 1.,  1.),
    vec2f(-1., 1.),
    vec2f( 1., -1.),
  );
  vsOut.position = vec4f(pos[vertexIndex], 0.0, 1.0);
  return vsOut;
}


@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  let zoom_pixels = f32(4);
  var unit_count = i32(m.unit_count_f);
  var x = i32(vsOut.position.x / m.canvas.x * m.unit_count_f);
  var y = i32(vsOut.position.y / m.canvas.y * m.unit_count_f);
  var i = x + y * unit_count;
  var k = data[i].kind;
  var dir = data[i].direction;
  var r = 0.0;
  var g = 0.0;
  var b = 0.0;
  var img_x = i32(vsOut.position.x/zoom_pixels) % unit_size;
  var img_y = i32(vsOut.position.y/zoom_pixels) % unit_size;
  var img_i = i32(img_x + img_y * unit_size);
  var tick = i32(m.tick);


  var img_i2 = 0;
  // UP
  if dir == 0 {
    var img_x_ = (i32(vsOut.position.x / zoom_pixels)) % unit_size;
    var img_y_ = (i32(vsOut.position.y / zoom_pixels) + tick) % unit_size;
    img_i2 = i32(img_x_ + img_y_ * unit_size);
  }
  // DOWN
  if dir == 1 {
    // img_i2 = (img_i - unit_size*tick) % (unit_size*unit_size) + unit_size*unit_size;
    var img_x_ = (i32(vsOut.position.x / zoom_pixels)) % unit_size;
    var img_y_ = (i32(vsOut.position.y / zoom_pixels) - (tick % unit_size) + unit_size) % unit_size;
    img_i2 = i32(img_x_ + img_y_ * unit_size );
  }
  // LEFT
  if dir == 2 {
    var img_x_ = (i32(vsOut.position.x / zoom_pixels) + tick) % unit_size;
    var img_y_ = (i32(vsOut.position.y / zoom_pixels)) % unit_size;
    img_i2 = i32(img_x_ + img_y_ * unit_size);
  }
  // RIGHT
  if dir == 3 {
    var img_x_ = (i32(vsOut.position.x / zoom_pixels) - (tick % unit_size) + unit_size) % unit_size;
    var img_y_ = (i32(vsOut.position.y / zoom_pixels)) % unit_size;
    img_i2 = i32(img_x_ + img_y_ * unit_size );
  }


  // Draw image
  var r1 = rand(vec2f( vsOut.position.y + m.time * 0.000001, vsOut.position.x)) * 0.5 + 0.5;
  if k == 0 {
    // void
  }
  else if k == 1 {
    // Pixel flowing
    var v = imgs[1*unit_size*unit_size + img_i] * imgs[(14+dir) * unit_size*unit_size + img_i2 ];
    r = f32(data[i].r) * v / 255.0 * r1;
    g = f32(data[i].g) * v / 255.0 * r1;
    b = f32(data[i].b) * v / 255.0 * r1;
  }
  else if k == 12 {
    // Pixel source
    var v = imgs[11*unit_size*unit_size + img_i];
    r = f32(data[i].r) * v / 255.0* r1*1.15;
    g = f32(data[i].g) * v / 255.0* r1*1.15;
    b = f32(data[i].b) * v / 255.0* r1*1.15;
  }
  else if k > 1 {
    // Other
    var v = imgs[k*unit_size*unit_size + img_i];
    r = f32(v);
    g = f32(v) ;
    b = f32(v) ;
  } 
  else {
    // error
    r = 1.0;
    g = 0.0;
    b = 1.0;
  }
  return vec4f(r, g, b, 1.0);
}


@fragment fn fs2(vsOut: VSOutput) -> @location(0) vec4f {
  var x = u32(vsOut.position.x);
  var y = u32(vsOut.position.y);
  var DIM = u32(m.canvas.x);
  var pid = i32((x + y * DIM)*u32(3));
  return vec4f(0.0, 0.0, 0.0, 1.0);
}
