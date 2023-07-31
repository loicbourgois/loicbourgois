struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) v: f32,
  @location(1) gid: f32,
  @location(2) pid: f32,
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
@group(0) @binding(2) var<uniform> m2u: Metadata2u;
@group(0) @binding(3) var<uniform> m2f: Metadata2f;
@group(0) @binding(4) var<storage, read> grid: array<i32>;

fn rand(v: vec2f) -> f32 {
  return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
}

@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VSOutput {
  // DISK_GENERATED //
  var vsOut: VSOutput;
  var aa = vertexIndex % 48;
  var particle_position = particles[vertexIndex/48].p*2.0 - vec2f(1.0, 1.0);
  vsOut.position = vec4f(positions[aa]*__DIAMETER__*1.0 + particle_position, 0.0, 1.0);
  vsOut.v = norm_sqrd(particles[vertexIndex/48].v)/1.0;
  let i = vertexIndex/48;
  let gid = i32(particles[i].p.x * m2f.cell_count) + i32(particles[i].p.y * m2f.cell_count) * i32(m2f.cell_count);
  vsOut.gid = f32(gid);
  vsOut.pid = f32(i);
  return vsOut;
}
@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  if grid[u32(vsOut.gid)] != i32(vsOut.pid) {
    return vec4f(0.0, 1.0, .0, 1.0);
  }
  if vsOut.v*10000000.0 < 1.0 {
    var r = 0.5 + min(vsOut.v*10000000.0, 0.5);
    var g = vsOut.v*10000000.0;
    var b = 0.5;
    return vec4f(r, g, b, 1.0);
  }
  var r = 0.5 + min(1.0, 0.5);
  var g = 1.0;
  var b = 0.5 + min(vsOut.v*10000000.0 - 1.0, 0.5);
  return vec4f(r, g, b, 1.0);
}


struct Metadata2u {
  cell_count: u32,
};
struct Metadata2f {
  cell_count: f32,
};

struct VSOut_2 {
  @builtin(position) position: vec4f,
  @location(0) v: f32,
};
@vertex fn vs_2(
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VSOut_2 {
  let positions = array<vec2f, 6>(
    vec2f( 0.0,  0.0),
    vec2f( 1.0,  0.0),
    vec2f( 1.0,  1.0),
    vec2f( 0.0,  0.0),
    vec2f( 0.0,  1.0),
    vec2f( 1.0,  1.0),
  );
  var vsOut: VSOut_2;
  let id = vertexIndex / 6;
  let im = vertexIndex % 6;
  let x = f32(id % m2u.cell_count);
  let y = f32(id / m2u.cell_count);
  let aa = m2f.cell_count;
  let bb = m2u.cell_count;
  let uu = 0.8;
  let p = positions[im] / (m2f.cell_count*uu) 
    + vec2f(x, y)/(m2f.cell_count*0.5) 
    - vec2f(1.0, 1.0) 
    + vec2f(uu*0.5/m2f.cell_count, uu*0.5/m2f.cell_count);
  vsOut.position = vec4f(p, 0.0, 1.0);
  vsOut.v = 0.0;
  if grid[id] != -1 {
    vsOut.v = 1.0;
  }
  return vsOut;
}
@fragment fn fs_2(vsOut: VSOut_2) -> @location(0) vec4f {
  var x = u32(vsOut.position.x);
  var y = u32(vsOut.position.y);
  // var DIM = u32(m.canvas.x);
  // var pid = i32((x + y * DIM)*u32(3));
  // var r = 0.5 + min(vsOut.v*10000000.0, 0.5);
  // var g = vsOut.v*10000000.0;
  return vec4f(vsOut.v, 0.2, 0.0, 1.0);
}
