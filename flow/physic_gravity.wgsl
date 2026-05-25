// import file://./shared.wgsl


@group(0) @binding(0) var<storage, read_write> fi: array<CellGravity>; // field_in
@group(0) @binding(1) var<storage, read_write> fo: array<CellGravity>; // field_out
@group(0) @binding(2) var<uniform> m: Metadata;


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
    workgroup_index * __THREADS_PER_WORK_GROUP__
    + local_invocation_index;
  let aa = u32(m.field_gravity.resolution);
  let c = fi[i];
  let i2 = (u32(c.x) + 1) % aa + u32(c.y) * aa;
  fo[i].e = fi[i2].e;
  fo[i].e = min(fo[i].e, 1.0);
}
