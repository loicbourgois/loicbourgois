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
struct MasksMeta {
  count: u32,
  dims: array<u32>,
};
@group(0) @binding(0) var<uniform> m: Metadata;
@group(0) @binding(1) var<storage, read> masks_1: array<f32>;
@group(0) @binding(2) var<storage, read> masks_1_meta: MasksMeta;
@group(0) @binding(3) var<storage, read_write> img: array<f32>;
@group(0) @binding(4) var<storage, read_write> img2: array<f32>;
@group(0) @binding(5) var<storage, read> colors: array<vec4f>;
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
  var cid: i32 = 0;
  for(var i: i32 = 0; i < i32(masks_1_meta.count); i++) {
    var dim = masks_1_meta.dims[i];
    var x = u32(vsOut.position.x / m.canvas.x * f32(dim)) ;
    var y = u32(vsOut.position.y / m.canvas.y * f32(dim)) ;
    if i32(x) > i32(dim)/2 {
      x = u32(i32(dim)-i32(x)-i32(1));
    }
    cid += i32(floor( masks_1[x + y * dim + u32(i)*dim*dim] + 0.5));
  }
  var x = u32(vsOut.position.x);
  var y = u32(vsOut.position.y);
  var border = f32(x) < f32(m.canvas.x) / f32(masks_1_meta.dims[0])
    || f32(x) > f32(m.canvas.x) - f32(m.canvas.x) / f32(masks_1_meta.dims[0]) - 1.0 
    || f32(y) < f32(m.canvas.y) / f32(masks_1_meta.dims[0])
    || f32(y) > f32(m.canvas.y) - f32(m.canvas.y) / f32(masks_1_meta.dims[0]) - 1.0 
  ;
  if border {
    cid = 3;
  }
  var color = colors[cid];
  var DIM = u32(m.canvas.x);
  var pp = vec2u(
    x,
    y,
  );
  // if sin(m.time*0.01) < 0.0 {
  //   pp.x = u32(i32(x) - 1 + i32(DIM))%DIM;
  // } else {
    pp.y = u32(i32(y) - 1 + i32(DIM))%DIM;
  // }
  if f32(pp.y) < f32(m.canvas.x) / f32(masks_1_meta.dims[0]) && !border {
    pp.y = DIM - u32(f32(m.canvas.x) / f32(masks_1_meta.dims[0])) - u32(1);  
  }
  if f32(pp.x) < f32(m.canvas.x) / f32(masks_1_meta.dims[0]) && !border {
    pp.x = DIM - u32(f32(m.canvas.x) / f32(masks_1_meta.dims[0])) - u32(1);  
  }
  var pid = i32((x + y * DIM)*u32(3));
  var pid2 = i32((pp.x + pp.y * DIM)*u32(3));
  var aaa = 20.0;
  var r = img[ pid + 0 ];
  var g = img[ pid + 1 ];
  var b =  img[ pid + 2 ];
  var fall = m.speed * 0.0125 ;
  var change = m.speed * 0.005 * (0.25+m.noise_ratio) ;
  var r_ = rand( vec2f(m.r, vsOut.position.x) ) * rand( vec2f(m.time, vsOut.position.y) );
  if r_ < fall {
    if !border {
      r = img[ pid2 + 0 ];
      g = img[ pid2 + 1 ];
      b = img[ pid2 + 2 ];
    }
  } else if r_ < fall + change {
    r = (color.r + img[ pid + 0 ]*aaa ) / (aaa+1.0);
    g = (color.g + img[ pid + 1 ]*aaa ) / (aaa+1.0);
    b = (color.b + img[ pid + 2 ]*aaa ) / (aaa+1.0);
  }
  r = max(0.0, min(1.0, r));
  g = max(0.0, min(1.0, g));
  b = max(0.0, min(1.0, b));
  if img[ pid + 0 ] < -1.0 {
    r = color.r;
    g = color.g;
    b = color.b;
  }
  img2[ pid ] = r;
  img2[ pid + 1] = g;
  img2[ pid + 2] = b;
  return vec4f(r, g, b, 1.0);
}
@fragment fn fs2(vsOut: VSOutput) -> @location(0) vec4f {
  var x = u32(vsOut.position.x);
  var y = u32(vsOut.position.y);
  var DIM = u32(m.canvas.x);
  var pid = i32((x + y * DIM)*u32(3));
  img[ pid + 0 ] = img2[ pid + 0 ];
  img[ pid + 1 ] = img2[ pid + 1 ];
  img[ pid + 2 ] = img2[ pid + 2 ];
  return vec4f(0.0, 0.0, 0.0, 1.0);
}
fn rand(v: vec2f) -> f32 {
  return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
}
