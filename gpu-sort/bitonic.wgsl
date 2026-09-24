struct Item {
    value: f32,
    index: u32,
};


struct Data {
    items: array<Item>,
};


@group(0) @binding(0) var<storage, read_write> data : Data;
@group(0) @binding(1) var<uniform> params : vec2u;


@compute @workgroup_size(256)
fn main(
    @builtin(global_invocation_id) global_id: vec3u
) {
    let i = global_id.x;
    let j = params.x;
    let k = params.y;
    let ixj = i ^ j;
    if (ixj > i) {
        let ascending = (i & k) == 0u;
        let a = data.items[i];
        let b = data.items[ixj];
        let swap = (ascending && a.value > b.value) || (!ascending && a.value < b.value);
        if (swap) {
            data.items[i] = b;
            data.items[ixj] = a;
        }
    }
}