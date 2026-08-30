@group(0) @binding(0) var<storage, read_write> outSamples: array<vec2<f32>>;

@group(0) @binding(1) var<uniform> params: vec2<f32>; // timeOffset, sampleRate

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    let timeOffset = params.x;
    let sampleRate = params.y;

    let freq = 220.0;
    let t = timeOffset + f32(i) / sampleRate;
    let s = sin(2.0 * 3.14159265 * freq * t) * 0.2;

    outSamples[i] = vec2<f32>(s, s);
}