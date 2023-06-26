struct VSOutput {
  @builtin(position) position: vec4f,
};
struct Metadata {
  canvas: vec2f,
  time: f32,
  r: f32,
  noise_ratio: f32,
  speed: f32,
};
@group(0) @binding(0) var<uniform> m: Metadata;
@group(0) @binding(1) var<storage, read> mask: array<f32>;
@group(0) @binding(2) var<storage, read_write> img: array<f32>;
@group(0) @binding(3) var<storage, read_write> img2: array<f32>;
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
  var x = u32(vsOut.position.x);
  var y = u32(vsOut.position.y);
  var mid = x + y * u32(m.canvas.x);
  var pid = mid*u32(3);
  var pid2 = mid*u32(3);
  var rnd = rand( vec2f(m.r, vsOut.position.x) ) * rand( vec2f(m.time%10.0, vsOut.position.y) );
  if rnd < 0.09 {
    pid2 = (x + (y-u32(1)) * u32(m.canvas.x))*u32(3);
  }
  var v = mask[mid]*mask[mid]*10.0;
  var r_a = 0.001;
  var r_b = 0.125;
  var r = (v*r_a + img[ pid2 ]*r_b ) / (r_a+r_b);
  var g = (v*r_a + img[ pid2 ]*r_b ) / (r_a+r_b);
  var b = 0.0;
  img[ pid ] = r;
  img[ pid + u32(1)] = g;
  img[ pid + u32(2)] = b;
  return vec4f(0.0, 0.0, 0.0, 1.0);
}
@fragment fn fs2(vsOut: VSOutput) -> @location(0) vec4f {
  var x = u32(vsOut.position.x);
  var y = u32(vsOut.position.y);
  var DIM = u32(m.canvas.x);
  var pid = i32((x + y * DIM)*u32(3));
  var r = img[ pid + 0 ];
  var g = img[ pid + 1 ];
  var b = img[ pid + 2 ];
  img2[ pid + 0 ] = r;
  img2[ pid + 1 ] = g;
  img2[ pid + 2 ] = b;
  return vec4f(r, g, b, 1.0);
}
fn rand(v: vec2f) -> f32 {
  return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
}
