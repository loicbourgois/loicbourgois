const PARTICLE_COUNT = __particles_count__;
const REGION_COUNT = __REGION_COUNT__;

struct RegionRange {
  start: atomic<u32>,
  end: atomic<u32>,
};

struct Item {
    value: u32,
    index: u32,
};


@group(0) @binding(0)
var<storage, read_write> items : array<Item>;
@group(0) @binding(1)
var<uniform> params : vec2u;
@group(0) @binding(2)
var<storage, read> regions : array<u32>;
@group(0) @binding(3)
var<storage, read_write> region_ranges : array<RegionRange>;


@compute @workgroup_size(__BITONIC_WORKGROUP_SIZE__)
fn initialise(@builtin(global_invocation_id) global_id : vec3u) {
    let i = global_id.x;
    if (i >= PARTICLE_COUNT) {
        return;
    }

    items[i] = Item(regions[i], i);
}

@compute @workgroup_size(__BITONIC_WORKGROUP_SIZE__)
fn sort(@builtin(global_invocation_id) global_id : vec3u) {
    let i = global_id.x;
    if (i >= PARTICLE_COUNT) {
        return;
    }

    let j = params.x;
    let k = params.y;
    let ixj = i ^ j;

    if (ixj > i && ixj < PARTICLE_COUNT) {
        let ascending = (i & k) == 0u;
        let a = items[i];
        let b = items[ixj];

        let a_before_b = a.value < b.value || (a.value == b.value && a.index <= b.index);
        let should_swap = (ascending && !a_before_b) || (!ascending && a_before_b);

        if (should_swap) {
            items[i] = b;
            items[ixj] = a;
        }
    }
}


@compute @workgroup_size(__BITONIC_WORKGROUP_SIZE__)
fn build_region_ranges(@builtin(global_invocation_id) global_id : vec3u) {
    let i = global_id.x;

    if (i < REGION_COUNT) {
        atomicStore(&region_ranges[i].start, PARTICLE_COUNT);
        atomicStore(&region_ranges[i].end, 0u);
    }

    if (i < PARTICLE_COUNT) {
        let region_id = items[i].value;

        if (region_id < REGION_COUNT) {
            atomicMin(&region_ranges[region_id].start, i);
            atomicMax(&region_ranges[region_id].end, i + 1u);
        }
    }
}