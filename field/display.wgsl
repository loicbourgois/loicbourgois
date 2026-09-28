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


@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VSOutput {
  // DISK_GENERATED //
  let position_index = vertexIndex % 48;
  let particle_position = particles[vertexIndex/48].p*2.0 ;
  let diameter_ratio = 1.0;
  var vsOut: VSOutput;
  vsOut.position = vec4f(
    positions[position_index] * DIAMETER * diameter_ratio + particle_position, 
    0.0, 1.0
  );
  vsOut.e = particles[vertexIndex/48].e;
  return vsOut;
}


@fragment fn fs2(vsOut: VSOutput) -> @location(0) vec4f {
    var x = u32(vsOut.position.x);
    var y = u32(vsOut.position.y);
    var DIM = u32(m.canvas.x);
    var pid = i32((x + y * DIM));
    var x_gravity = x / u32(m.field_gravity.cell_size);
    var y_gravity = y / u32(m.field_gravity.cell_size);
    var i_gravity = x_gravity + y_gravity * u32(m.field_gravity.resolution);
    var gravity = cells_gravity[i_gravity].e;
    var energy = vsOut.e;
    var r = 0.75;
    var g = .25;
    var b = 0.2;
  // if ((x+y*9) % 10 <= 3) {
  //   return vec4f(0.0, 1.0, 1.0, 1.0);
  // }
    return vec4f(r, g, b, 1.0);
}
