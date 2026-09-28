@group(0) @binding(0) var<uniform> m: Metadata;
@group(0) @binding(1) var<storage, read> particles: array<Particle>;


const PARTICLE_COUNT = __PARTICLE_COUNT__;
const DIAMETER = __DIAMETER__;
const LINE_SEGMENTS = 32u;
const LINE_VERTICES = LINE_SEGMENTS + 1u;
const LINE_AMPLITUDE = 0.04;
const LINE_COS_PERIODS = 2.0;


struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) v: f32,
};


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


fn norm_sqrd(v: vec2f) -> f32 {
  return v.x * v.x + v.y * v.y;
}


fn rand(v: vec2f) -> f32 {
  return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
}


@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VSOutput {
  // DISK_GENERATED //
  let position_index = vertexIndex % 48;
  let particle_position = particles[vertexIndex/48].p*2.0 ;
  // Bigger than 1.0 will hide holes
  let diameter_ratio = 1.2;
  var vsOut: VSOutput;
  vsOut.position = vec4f(
    positions[position_index]*DIAMETER*diameter_ratio + particle_position, 
    0.0, 1.0
  );
  vsOut.v = norm_sqrd(particles[vertexIndex/48].v);
  return vsOut;
}


@fragment fn fs2(vsOut: VSOutput) -> @location(0) vec4f {
  var x = u32(vsOut.position.x);
  var y = u32(vsOut.position.y);
  var DIM = u32(m.canvas.x);
  var pid = i32((x + y * DIM)*u32(3));
  var r = 0.5 + min(vsOut.v * 10000000.0, 0.5);
  var g = vsOut.v * 10000000.0;
  return vec4f(r, g, 0.75, 1.0);
}


struct VSOutputLine {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
};


// TODO: make it so that we can apply any math function to the line 
// for example, we can shape it so that it looks like a cos() func, from point A to B
// @vertex fn vs_line(
//   @builtin(vertex_index) vertexIndex : u32,
//   @builtin(instance_index) instanceIndex: u32,
// ) -> VSOutputLine {
//   var vsOut: VSOutputLine;
//   let p1_pos = particles[instanceIndex].p * 2.0;
//   let p2_pos = particles[(instanceIndex+1)%PARTICLE_COUNT].p * 2.0;
//   if (vertexIndex == 0) {
//     vsOut.position = vec4f(p1_pos, 0.0, 1.0);
//   } else {
//     vsOut.position = vec4f(p2_pos, 0.0, 1.0);
//   }
//   vsOut.color = vec4f(0.2, 0.8, 0.8, 1.0);
//   return vsOut;
// }


fn line_shape_cos(t: f32) -> f32 {
  return cos(t * LINE_COS_PERIODS * 6.28318530718);
}


fn shaped_line_position(a: vec2f, b: vec2f, vertexIndex: u32) -> vec2f {
  let t = f32(vertexIndex) / f32(LINE_SEGMENTS);
  let base = mix(a, b, t);
  let direction = b - a;
  let length_sqrd = max(norm_sqrd(direction), 0.000001);
  let normal = vec2f(-direction.y, direction.x) / sqrt(length_sqrd);

  // Fade the displacement at both ends so the shaped line still starts
  // exactly at point A and ends exactly at point B.
  let endpoint_fade = sin(t * 3.14159265359);

  return base + normal * line_shape_cos(t) * LINE_AMPLITUDE * endpoint_fade;
}


@vertex fn vs_line(
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VSOutputLine {
  var vsOut: VSOutputLine;

  let p1_pos = particles[instanceIndex].p * 2.0;
  let p2_pos = particles[(instanceIndex + 1u) % PARTICLE_COUNT].p * 2.0;

  vsOut.position = vec4f(
    shaped_line_position(p1_pos, p2_pos, vertexIndex),
    0.0,
    1.0
  );
  vsOut.color = vec4f(0.2, 0.8, 0.8, 1.0);

  return vsOut;
}


@fragment fn fs_line(vsOut: VSOutputLine) -> @location(0) vec4f {
  return vsOut.color;
}
