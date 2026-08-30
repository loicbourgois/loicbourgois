// const DIAMETER = 0.1;
// const workgroupSize = [4, 4, 4];
// const dispatchCount = [4, 4, 4];
// const particles_count = 4096
const DIAMETER = 0.07;
const workgroupSize = [4, 8, 8];
const dispatchCount = [4, 4, 4];
const particles_count = 4096*4
const side_size = Math.sqrt(particles_count)
const particle_fields = 10
const metadata_buffer_gpu_size = 22 * 4;
const sort_metadata_buffer_gpu_size = 4 * 4;
let gpu_timing_pending = false
const BITONIC_WORKGROUP_SIZE = 256;
const sort_item_size = 8;
const REGION_SIDE = 64;
const REGION_COUNT = REGION_SIDE * REGION_SIDE;
const region_range_size = 8;


console.log(`particles_count: ${particles_count}`)
console.log(`side_size: ${side_size}`)


// multiply all elements of an array
const array_product = arr => arr.reduce((a, b) => a * b);


export {
    array_product,
    side_size,
    particles_count,
    particle_fields,
    dispatchCount,
    workgroupSize,
    metadata_buffer_gpu_size,
    DIAMETER,
    REGION_COUNT,
    region_range_size,
    sort_item_size,
    sort_metadata_buffer_gpu_size,
    BITONIC_WORKGROUP_SIZE,
    REGION_SIDE,
}
