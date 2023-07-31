struct Particle {
  p: vec2f,
  v: vec2f,
};
struct Metadata2f {
  cell_count: f32,
};
struct Metadata2u {
  cell_count: u32,
};

fn dot_(a: vec2f, b: vec2f) -> f32 {
    return a.x * b.x + a.y * b.y;
}

fn norm_sqrd(v: vec2f) -> f32 {
  return v.x * v.x + v.y * v.y;
}

const DIAMETER = __DIAMETER__;

fn collision_response(p1: Particle, p2: Particle) -> vec2f {
  let dv = p2.v - p1.v; // delta velocity
  let dp = p2.p - p1.p; // delta position
  // let mf = 2.0 * p2.m / (p2.m + p1.m); // mass factor
  let mf = 1.0; // mass factor
  let dot_vp = dot_(dv, dp);
  let n_sqrd = norm_sqrd(dp);
  let factor = mf * dot_vp / n_sqrd;
  return dp * factor;
}

fn distance_sqrd(a: vec2f, b: vec2f) -> f32 {
    let dp = b - a;
    return dp.x * dp.x + dp.y * dp.y;
}

struct Metadata {
  canvas: vec2f,
  time: f32,
  r: f32,
  noise_ratio: f32,
  speed: f32,
  crdv: f32,
  crdp: f32,
  ordv: f32,
  ordp: f32,
  border_dv: f32,
  border_dp: f32,
  gravity: f32,
};

const PARTICLE_COUNT = __PARTICLE_COUNT__;
@group(0) @binding(0) var<storage, read> pi: array<Particle>; // particles_in
@group(0) @binding(1) var<storage, read_write> po: array<Particle>; // particles_out
@group(0) @binding(2) var<uniform> m: Metadata;
// @group(0) @binding(3) var<storage, read> gridi: array<i32>;
@group(0) @binding(4) var<storage, read_write> grid: array<i32>;
@group(0) @binding(5) var<uniform> m2u: Metadata2f;
@group(0) @binding(6) var<uniform> m2f: Metadata2f;


@compute @workgroup_size(WORKGROUP_SIZE) fn compute_grid(
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
    @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
    @builtin(local_invocation_index) local_invocation_index: u32,
    @builtin(num_workgroups) num_workgroups: vec3<u32>
) {
  let workgroup_index =  
      workgroup_id.x
      + workgroup_id.y * num_workgroups.x
      + workgroup_id.z * num_workgroups.x * num_workgroups.y;
  let i =
    workgroup_index * NUM_ThreadsPerWorkgroup
    + local_invocation_index;
  let grid_id = i32(pi[i].p.x * m2f.cell_count) + i32(pi[i].p.y * m2f.cell_count) * i32(m2f.cell_count);
  grid[grid_id] = i32(i);
}


fn rand(v: vec2f) -> f32 {
  return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
}


@compute @workgroup_size(WORKGROUP_SIZE) fn computeSomething(
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
    @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
    @builtin(local_invocation_index) local_invocation_index: u32,
    @builtin(num_workgroups) num_workgroups: vec3<u32>
) {
  let workgroup_index =  
      workgroup_id.x
      + workgroup_id.y * num_workgroups.x
      + workgroup_id.z * num_workgroups.x * num_workgroups.y;
  let i =
    workgroup_index * NUM_ThreadsPerWorkgroup
    + local_invocation_index;
  let crdv = m.crdv; // collision response delta (velocity)
  let crdp = m.crdp; // collision response delta (position)
  let ordv = m.ordv; // overlap response delta (velocity)
  let ordp = m.ordp; // overlap response delta (position)
  let border_dv = m.ordv;
  let border_dp = m.ordp;
  
  let gravity = vec2f(0.0, m.gravity);
  let diameter_sqrd = DIAMETER * DIAMETER;
  var dv = vec2f(0.0, 0.0);
  var dp = vec2f(0.0, 0.0);
  var odp = vec2f(0.0, 0.0);


  let grid_x = i32(pi[i].p.x * m2f.cell_count) ;
  let grid_y = i32(pi[i].p.y * m2f.cell_count) ;
  let gid = grid_x + grid_y * i32(m2f.cell_count);
  // let i2 = grid[gid];
  // if u32(i2) != i {
  //   // po[i].p.x = rand(vec2f(f32(workgroup_id.x), f32(workgroup_id.z)))*0.5+0.25;
  //   // po[i].p.y = rand(vec2f(f32(workgroup_id.z), f32(workgroup_id.y)))*0.5+0.25;
  //   // po[i].v.x = 0.0;
  //   // po[i].v.y = 0.0;
  //   po[i].v.x = min(max(pi[i].v.x, -0.01), 0.01);
  //   po[i].v.y = min(max(pi[i].v.y, -0.01), 0.01);
  //   po[i].p.x = min(max(pi[i].p.x, 0.0), 1.0);
  //   po[i].p.y = min(max(pi[i].p.y, 0.0), 1.0);
  //   return;
  // }

  let gopo = 5;
  let grid_x_min = u32(max(0, grid_x-gopo));
  let grid_y_min = u32(max(0, grid_y-gopo));
  let grid_x_max = u32(min(i32(m2f.cell_count), grid_x+gopo));
  let grid_y_max = u32(min(i32(m2f.cell_count), grid_y+gopo));

  for (var x: u32 = grid_x_min; x < grid_x_max ; x++) {
    for (var y: u32 = grid_y_min; y < grid_y_max ; y++) {
      let gid2 = x + y * u32(m2f.cell_count);
      let i2 = grid[gid2];
      if i2 == -1 {
        continue;
      }
      if u32(i2) == i {
        continue;
      }
      let d_sqrd = distance_sqrd(pi[i].p, pi[i2].p);

      if d_sqrd <= 0.000001 {
        continue;
      }
      if d_sqrd >= diameter_sqrd {
        continue;
      }
      let cr = collision_response(pi[i], pi[i2]);
      dv += cr * crdv;
      dp += cr * crdp;
      var or = pi[i2].p - pi[i].p;
      or = normalize(or) * (DIAMETER - sqrt(norm_sqrd(or)));
      dp -= or * ordp;
      dv -= or * ordv;
    }
  }

  // let grid_y = ;


  // for (var i2: u32 = 0; i2 < PARTICLE_COUNT; i2++) {
  //   if i2 == i {
  //     continue;
  //   }
  //   let d_sqrd = distance_sqrd(pi[i].p, pi[i2].p);

  //   if d_sqrd <= 0.000001 {
  //     continue;
  //   }
  //   if d_sqrd >= diameter_sqrd {
  //     continue;
  //   }
  //   let cr = collision_response(pi[i], pi[i2]);
  //   dv += cr * crdv;
  //   dp += cr * crdp;
  //   var or = pi[i2].p - pi[i].p;
  //   or = normalize(or) * (DIAMETER - sqrt(norm_sqrd(or)));
  //   dp -= or * ordp;
  //   dv -= or * ordv;
  // }

  let dbxl = pi[i].p.x - DIAMETER*0.5;
  let dbyl = pi[i].p.y - DIAMETER*0.5;
  let dbyh = (1.0 - DIAMETER*0.5) - pi[i].p.y ;
  let dbxh = (1.0 - DIAMETER*0.5) - pi[i].p.x ;
  if dbxl < 0.0 {
    dv.x -= dbxl * border_dv;
    dp.x -= dbxl * border_dp;
  }
  if dbyl < 0.0 {
    dv.y -= dbyl * border_dv;
    dp.y -= dbyl * border_dp;
  }
  if dbxh < 0.0 {
    dv.x += dbxh * border_dv;
    dp.x += dbxh * border_dp;
  }
  if dbyh < 0.0 {
    dv.y += dbyh * border_dv;
    dp.y += dbyh * border_dp;
  }

  po[i].v = pi[i].v + dv + gravity;

  po[i].v.x = min(max(po[i].v.x, -1.0), 1.0);
  po[i].v.y = min(max(po[i].v.y, -1.0), 1.0);
  
  po[i].p = pi[i].p + po[i].v + dp;

  po[i].p.x = min(max(po[i].p.x, 0.0), 1.0);
  po[i].p.y = min(max(po[i].p.y, 0.0), 1.0);

  let i2 = grid[gid];
  if u32(i2) != i {
    po[i].v.x *= 0.99;
    po[i].v.y *= 0.99;
  }
}