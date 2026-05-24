// Physics engine


// import file://./shared.wgsl


@group(0) @binding(0) var<storage, read_write> pi: array<Particle>; // particles_in
@group(0) @binding(1) var<storage, read_write> po: array<Particle>; // particles_out
@group(0) @binding(2) var<uniform> m: Metadata;
@group(0) @binding(3) var<storage, read_write> regions: array<i32>;
@group(0) @binding(4) var<storage, read> sorted_items: array<SortItem>;
@group(0) @binding(5) var<storage, read_write> region_ranges: array<RegionRange>;


const PARTICLE_COUNT = __PARTICLE_COUNT__;
const DIAMETER = __DIAMETER__;
const THREADS_PER_WORK_GROUP = __THREADS_PER_WORK_GROUP__;
const REGION_SIDE: i32 = 64;


fn collision_response(p1: Particle, p2: Particle) -> vec2f {
  let dv = p2.v - p1.v; // delta velocity
  let dp = p2.p - p1.p; // delta position
  let mf = .1; // mass factor
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

  // TODO: create a struct to map region_id -> first_particle
  // the goal is to not loop through all particles anymore
  // only loop through the particles in the 3x3 regions 
  // let current_region = pi[i].region_id;
  // let current_region_x = current_region % REGION_SIDE;
  // let current_region_y = current_region / REGION_SIDE;
  // for (var sorted_i: u32 = 0; sorted_i < PARTICLE_COUNT; sorted_i++) {
  //   let candidate_region = i32(sorted_items[sorted_i].value);
  //   if candidate_region < 0 {
  //     continue;
  //   }
  //   let candidate_region_x = candidate_region % REGION_SIDE;
  //   let candidate_region_y = candidate_region / REGION_SIDE;
  //   if abs(candidate_region_x - current_region_x) > 1 {
  //     continue;
  //   }
  //   if abs(candidate_region_y - current_region_y) > 1 {
  //     continue;
  //   }
  //   let i2 = sorted_items[sorted_i].index;
  //   if i2 == i {
  //     continue;
  //   }
  //   let d_sqrd = distance_sqrd(pi[i].p, pi[i2].p);
  //   if d_sqrd <= 0.00000001 {
  //     continue;
  //   }
  //   if d_sqrd >= diameter_sqrd {
  //     continue;
  //   }
  //   let cr = collision_response(pi[i], pi[i2]);
  //   dv += cr * crdv;
  //   var or = pi[i2].p - pi[i].p;
  //   or = normalize(or) * (DIAMETER - sqrt(norm_sqrd(or)));
  //   odp -= or * ordp;
  // }


  let current_region = pi[i].region_id;
let current_region_x = current_region % REGION_SIDE;
let current_region_y = current_region / REGION_SIDE;

for (var region_dy: i32 = -1; region_dy <= 1; region_dy++) {
  let candidate_region_y = current_region_y + region_dy;

  if (candidate_region_y < 0 || candidate_region_y >= REGION_SIDE) {
    continue;
  }

  for (var region_dx: i32 = -1; region_dx <= 1; region_dx++) {
    let candidate_region_x = current_region_x + region_dx;

    if (candidate_region_x < 0 || candidate_region_x >= REGION_SIDE) {
      continue;
    }

    let candidate_region = candidate_region_y * REGION_SIDE + candidate_region_x;
    let range_start = atomicLoad(&region_ranges[u32(candidate_region)].start);
    let range_end = atomicLoad(&region_ranges[u32(candidate_region)].end);

    if (range_start >= range_end) {
      continue;
    }

    for (var sorted_i: u32 = range_start; sorted_i < range_end; sorted_i++) {
      let i2 = sorted_items[sorted_i].index;

      if (i2 == i) {
        continue;
      }

      let d_sqrd = distance_sqrd(pi[i].p, pi[i2].p);

      if (d_sqrd <= 0.00000001) {
        continue;
      }

      if (d_sqrd >= diameter_sqrd) {
        continue;
      }

      let cr = collision_response(pi[i], pi[i2]);
      dv += cr * crdv;

      var or = pi[i2].p - pi[i].p;
      or = normalize(or) * (DIAMETER - sqrt(norm_sqrd(or)));
      odp -= or * ordp;
    }
  }
}



  let g = -0.000005;
  let gravity = vec2f(0.0, g);
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
  if po[i].p.x < m.bounds.min_x + DIAMETER*0.5*diameter_ratio {
    po[i].v.x += 0.0001;
  }
  if po[i].p.x > m.bounds.max_x - DIAMETER*0.5*diameter_ratio {
    po[i].v.x -= 0.0001;
  }
  if po[i].p.y < m.bounds.min_y + DIAMETER*0.5*diameter_ratio {
    po[i].v.y += 0.0001;
  }


  var region_x: i32 = 0;
  var region_y: i32 = 0;
  if po[i].p.x < m.bounds.min_x {
    region_x = 0;
  } else if po[i].p.x > m.bounds.max_x {
    region_x = REGION_SIDE-1;
  } else {
    region_x = i32(floor( (po[i].p.x - m.bounds.min_x) / (m.bounds.max_x - m.bounds.min_x) * f32(REGION_SIDE) ));
  }
  if po[i].p.y < m.bounds.min_y {
    region_y = 0;
  } else if po[i].p.y > m.bounds.max_y {
    region_y = REGION_SIDE - 1;
  } else {
    region_y = i32(floor( (po[i].p.y - m.bounds.min_y) / (m.bounds.max_y - m.bounds.min_y) * f32(REGION_SIDE) ));
  }
  regions[i] = region_y * REGION_SIDE + region_x;
  po[i].region_id = regions[i];
}
