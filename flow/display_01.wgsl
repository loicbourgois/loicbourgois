// import file://./shared.wgsl


@group(0) @binding(0) var<uniform> m: Metadata;
@group(0) @binding(2) var<storage, read> cells_gravity: array<CellGravity>;


struct VSOutput {
  @builtin(position) position: vec4f,
};


@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VSOutput {
  var positions = array<vec2f, 4>(
    vec2f( -1.0,  -1.0),
    vec2f( 1.0,  -1.0),
    vec2f( -1.0,  1.0),
    vec2f( 1.0,  1.0),
  );
  var vsOut: VSOutput;
  vsOut.position = vec4f(
    positions[vertexIndex], 
    0.0, 1.0
  );
  return vsOut;
}


@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
    var x = u32(vsOut.position.x);
    var y = u32(vsOut.position.y);
    var x_gravity = x / u32(m.field_gravity.cell_size);
    var y_gravity = y / u32(m.field_gravity.cell_size);
    var i_gravity = x_gravity + y_gravity * u32(m.field_gravity.resolution);
    var gravity = cells_gravity[i_gravity].e;
    var r = (1.0-gravity) * 0.0;
    var b = (1.0-gravity) ;
    var g = gravity * 0.5;
    return vec4f(r, g, b, 1.0);
}
