struct VSOutput {
  @builtin(position) position: vec4f,
};


struct Metadata {
  canvas: vec2f,
  time: f32,
  r: f32,
  noise_ratio: f32,
  speed: f32,
  unit_count_f: f32,
  padding: f32,
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
};


@group(0) @binding(0) var<uniform> m: Metadata;
@group(0) @binding(1) var<storage, read> imgs: array<i32>;
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
  var unit_count = i32(m.unit_count_f);
  var x = i32(vsOut.position.x / m.canvas.x * m.unit_count_f);
  var y = i32(vsOut.position.y / m.canvas.y * m.unit_count_f);
  var i = x + y * unit_count;
  var k = data[i].kind;
  var r = 0.0;
  var g = 0.0;
  var b = 0.0;
  var img_x = i32(vsOut.position.x) % 8;
  var img_y = i32(vsOut.position.y) % 8;
  var img_i = i32(img_x + img_y * 8);
  if k == 1 {
    var v = imgs[0 + img_i];
    r = f32(data[i].r) / 255.0 * f32(v);
    g = f32(data[i].g) / 255.0 * f32(v);
    b = f32(data[i].b) / 255.0 * f32(v);
  }
  if k == 2 {
    var v = imgs[(k-1)*8*8 + img_i];
    r = f32(v) / 255.0;
    g = f32(v) / 255.0;
    b = f32(v) / 255.0;
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
