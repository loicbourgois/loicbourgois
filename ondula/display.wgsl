struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) v: f32,
};
fn norm_sqrd(v: vec2f) -> f32 {
  return v.x * v.x + v.y * v.y;
}
struct Particle {
  p: vec2f,
  v: vec2f,
};
struct Metadata {
  canvas: vec2f,
  time: f32,
  r: f32,
  noise_ratio: f32,
  speed: f32,
};
@group(0) @binding(0) var<uniform> m: Metadata;
@group(0) @binding(1) var<storage, read> particles: array<Particle>;
@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VSOutput {
  // DISK_GENERATED //
  var vsOut: VSOutput;
  var aa = vertexIndex % 48;
  var particle_position = particles[vertexIndex/48].p*2.0 - vec2f(1.0, 1.0);
  vsOut.position = vec4f(positions[aa]*__DIAMETER__*1.3 + particle_position, 0.0, 1.0);
  vsOut.v = norm_sqrd(particles[vertexIndex/48].v);
  return vsOut;
}
@fragment fn fs2(vsOut: VSOutput) -> @location(0) vec4f {
  var x = u32(vsOut.position.x);
  var y = u32(vsOut.position.y);
  var DIM = u32(m.canvas.x);
  var pid = i32((x + y * DIM)*u32(3));
  var r = 0.5 + min(vsOut.v*10000000.0, 0.5);
  var g = vsOut.v*10000000.0;
  return vec4f(r, g, 0.75, 1.0);
}
fn rand(v: vec2f) -> f32 {
  return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
}
