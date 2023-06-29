struct Particle {
  p: vec2f,
  v: vec2f,
};

fn dot_(a: vec2f, b: vec2f) -> f32 {
    return a.x * b.x + a.y * b.y;
}

fn norm_sqrd(v: vec2f) -> f32 {
  return v.x * v.x + v.y * v.y;
}

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

const PARTICLE_COUNT = __PARTICLE_COUNT__;
const DIAMETER = __DIAMETER__;
@group(0) @binding(0) var<storage, read_write> pi: array<Particle>; // particles_in
@group(0) @binding(1) var<storage, read_write> po: array<Particle>; // particles_out
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
  let ordp = 0.6; // overlap response delta (position) ratio
  let crdv = 0.37; // collision response delta (velocity)
  let border_rebound = 0.95;
  // let gravity = vec2f(0.0, -0.0000001);
  // let gravity = vec2f(0.0, 0.0);
  let diameter_sqrd = DIAMETER * DIAMETER;
  var dv = vec2f(0.0, 0.0);
  var dp = vec2f(0.0, 0.0);
  var odp = vec2f(0.0, 0.0);
  for (var i2: u32 = 0; i2 < PARTICLE_COUNT; i2++) {
    if i2 == i {
      continue;
    }
    let d_sqrd = distance_sqrd(pi[i].p, pi[i2].p);

    if d_sqrd <= 0.000001 {
      continue;
    }

    let grav = (pi[i2].p - pi[i].p)*0.0000000001;
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
  // let dbxl = pi[i].p.x - DIAMETER*0.5;
  // let dbyl = pi[i].p.y - DIAMETER*0.5;
  // let dbyh = (1.0 - DIAMETER*0.5) - pi[i].p.y ;
  // let dbxh = (1.0 - DIAMETER*0.5) - pi[i].p.x ;
  // if dbxl < 0.0 {
  //   odp.x -= dbxl * ordp;
  // }
  // if dbyl < 0.0 {
  //   // odp.y -= (dbyl + gravity.y)*1.0;
  //   odp.y -= (dbyl)*1.0;
  // }
  // if dbxh < 0.0 {
  //   odp.x += dbxh * ordp;
  // }
  // if dbyh < 0.0 {
  //   odp.y += dbyh * ordp;
  // }

  let gravity = (pi[i].p - vec2f(0.5, 0.5)) * -0.000000015;

  // dv += gravity;
  po[i].v = pi[i].v + dv + odp;
  // if dbyl < 0.0 && po[i].v.y < 0.0 {
  //   po[i].v.y = - po[i].v.y * border_rebound;
  // }
  // if dbxl < 0.0 && po[i].v.x < 0.0 {
  //   po[i].v.x = - po[i].v.x * border_rebound;
  // }
  // if dbxh < 0.0 && po[i].v.x > 0.0 {
  //   po[i].v.x = - po[i].v.x * border_rebound;
  // }
  // if dbyh < 0.0 && po[i].v.y > 0.0 {
  //   po[i].v.y = - po[i].v.y * border_rebound;
  // }
  po[i].p = pi[i].p + po[i].v ;
}