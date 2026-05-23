// Physics engine


// import file://./shared.wgsl


@group(0) @binding(0) var<storage, read_write> pi: array<Particle>; // particles_in
@group(0) @binding(1) var<storage, read_write> po: array<Particle>; // particles_out
@group(0) @binding(2) var<uniform> m: Metadata;
@group(0) @binding(3) var<storage, read> cells_gravity: array<CellGravity>;


const PARTICLE_COUNT = __PARTICLE_COUNT__;
const DIAMETER = __DIAMETER__;
const THREADS_PER_WORK_GROUP = __THREADS_PER_WORK_GROUP__;


fn collision_response(p1: Particle, p2: Particle) -> vec2f {
  let dv = p2.v - p1.v; // delta velocity
  let dp = p2.p - p1.p; // delta position
  let mf = 0.1; // mass factor
  let dot_vp = dot_(dv, dp);
  let n_sqrd = norm_sqrd(dp);
  let factor = mf * dot_vp / n_sqrd;
  return dp * factor;
}


@compute @workgroup_size(__WORKGROUP_SIZE__) fn main(
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
    workgroup_index * THREADS_PER_WORK_GROUP
    + local_invocation_index;
  let ordp = 0.06; // overlap response delta (position) ratio
  let crdv = 0.32; // collision response delta (velocity)
  let border_rebound = 0.95;
  let diameter_sqrd = DIAMETER * DIAMETER;
  var dv = vec2f(0.0, 0.0);
  var odp = vec2f(0.0, 0.0);
  for (var i2: u32 = 0; i2 < PARTICLE_COUNT; i2++) {
    if i2 == i {
      continue;
    }
    let d_sqrd = distance_sqrd(pi[i].p, pi[i2].p);
    if d_sqrd <= 0.000001 {
      continue;
    }
    // gravity between 2 particles
    let grav = (pi[i2].p - pi[i].p)*0.0;
    dv += grav;
    if d_sqrd >= diameter_sqrd {
      continue;
    }
    let cr = collision_response(pi[i], pi[i2]);
    dv += cr * crdv;
    var or = pi[i2].p - pi[i].p;
    or = normalize(or) * (DIAMETER - sqrt(norm_sqrd(or)));
    odp -= or * ordp;
  }
  var gravity = vec2f(0.0, 0.0);
  let g_res_u = u32(m.field_gravity.resolution);
  let g_res_f = f32(m.field_gravity.resolution);
  for (var x_gravity: u32 = 0; x_gravity < g_res_u; x_gravity++) {
      for (var y_gravity: u32 = 0; y_gravity < g_res_u; y_gravity++) {
        var i_gravity = x_gravity + y_gravity * u32(m.field_gravity.resolution);
        let g = - cells_gravity[i_gravity].e * 0.000001;
        let pg = vec2f(
          f32(x_gravity) / g_res_f - 0.5 + 0.5/g_res_f, 
          0.5 - f32(y_gravity) / g_res_f - 0.5/g_res_f
        );
        let d_vec = pi[i].p - pg;
        let d = length(d_vec);
        let n = normalize(d_vec);
        let f = g / max(d * d, 0.001) ;
        // gravity += n * f;
      }
  }
  let g = -0.000005;
  gravity = vec2f(0.0, g);
  let side_size = u32(m.side_size);
  let limit = 1000000.0;
  po[i].v = pi[i].v + gravity + dv + odp;
  po[i].p = pi[i].p + po[i].v + gravity;
  if po[i].p.x < m.bounds.min_x * 0.8 && po[i].p.y < m.bounds.max_y * 0.75 {
    po[i].v.y -= g*1.05;
  }
  if po[i].p.x > m.bounds.min_x * 0.2 
    && po[i].p.x < m.bounds.max_x * 0.2 
    && po[i].p.y < m.bounds.max_y * 0.75 {
    // po[i].v.y -= g*1.05;
    // po[i].v.x *= .999;
  }
  if po[i].p.x < m.bounds.min_x + 0.1*0.5*diameter_ratio {
    po[i].v.x += 0.0001;
  }
  if po[i].p.x > m.bounds.max_x - 0.1*0.5*diameter_ratio {
    po[i].v.x -= 0.0001;
  }
  if po[i].p.y < m.bounds.min_y + 0.1*0.5*diameter_ratio {
    po[i].v.y += 0.0001;
  }
}
