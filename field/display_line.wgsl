// import file://./shared.wgsl


@group(0) @binding(0) var<uniform> m: Metadata;
@group(0) @binding(1) var<storage, read> particles: array<Particle>;
@group(0) @binding(2) var<storage, read> cells_gravity: array<CellGravity>;


const PARTICLE_COUNT = __PARTICLE_COUNT__;
const DIAMETER = __DIAMETER__;
const LINE_SEGMENTS = 32u;
const LINE_VERTICES = LINE_SEGMENTS + 1u;
const LINE_AMPLITUDE = 0.04;
const LINE_COS_PERIODS = 2.0;


struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) e: f32,
};


struct VSOutputLine {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
};


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
