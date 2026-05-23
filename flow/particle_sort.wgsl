// Particle sorting by region_id using one bitonic compare/swap stage per dispatch.

// import file://./shared.wgsl

@group(0) @binding(0) var<storage, read> particles_in: array<Particle>;
@group(0) @binding(1) var<storage, read_write> particles_out: array<Particle>;
@group(0) @binding(2) var<uniform> sort_metadata: SortMetadata;

struct SortMetadata {
  particle_count: u32,
  k: u32,
  j: u32,
  _padding: u32,
};

const THREADS_PER_WORK_GROUP = __THREADS_PER_WORK_GROUP__;

fn should_swap(a: Particle, b: Particle, ascending: bool) -> bool {
  if ascending {
    if a.region_id > b.region_id {
      return true;
    }
    if a.region_id == b.region_id && a.i > b.i {
      return true;
    }
    return false;
  }

  if a.region_id < b.region_id {
    return true;
  }
  if a.region_id == b.region_id && a.i < b.i {
    return true;
  }
  return false;
}

@compute @workgroup_size(__WORKGROUP_SIZE__) fn main(
  @builtin(workgroup_id) workgroup_id: vec3<u32>,
  @builtin(local_invocation_index) local_invocation_index: u32,
  @builtin(num_workgroups) num_workgroups: vec3<u32>
) {
  let workgroup_index =
    workgroup_id.x
    + workgroup_id.y * num_workgroups.x
    + workgroup_id.z * num_workgroups.x * num_workgroups.y;

  let index = workgroup_index * THREADS_PER_WORK_GROUP + local_invocation_index;

  if index >= sort_metadata.particle_count {
    return;
  }

  let partner_index = index ^ sort_metadata.j;

  if partner_index >= sort_metadata.particle_count {
    particles_out[index] = particles_in[index];
    return;
  }

  let particle = particles_in[index];
  let partner = particles_in[partner_index];
  let ascending = (index & sort_metadata.k) == 0u;

  if partner_index > index {
    if should_swap(particle, partner, ascending) {
      particles_out[index] = partner;
    } else {
      particles_out[index] = particle;
    }
  } else {
    if should_swap(partner, particle, ascending) {
      particles_out[index] = partner;
    } else {
      particles_out[index] = particle;
    }
  }
  
}