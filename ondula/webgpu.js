// multiply all elements of an array
const arrayProduct = arr => arr.reduce((a, b) => a * b);

const __DIAMETER__ = 0.0025;
const dispatchCount = [8, 4, 4];
const workgroupSize = [4, 4, 4]; // do not change, 64 is best
const particles_count = 64 * 64 * 2

// const __DIAMETER__ = 0.05;
// const dispatchCount = [1, 1, 1];
// const workgroupSize = [4, 4, 1];
// const particles_count = 16

console.log(particles_count)

const setup_compute = async (x) => {
    const numThreadsPerWorkgroup = arrayProduct(workgroupSize);
    const numWorkgroups = arrayProduct(dispatchCount);
    const numResults = numWorkgroups * numThreadsPerWorkgroup;
    const particles_count = x.particles_in_buffer_js.length/4;
    if (particles_count != numResults) {
        throw `Invalid particle count: ${particles_count} != ${numResults}`
    }
    const source_code = await (await fetch(`./code_2.wgsl`, {cache: "no-store"})).text()
    const disk_generated_code = await (await fetch(`./disk_generated.wgsl`, {cache: "no-store"})).text()
    const module = x.device.createShaderModule({
        code: source_code.replace(
            "// DISK_GENERATED //", disk_generated_code
        ).replace(
            "WORKGROUP_SIZE", workgroupSize,
        ).replace(
            "NUM_ThreadsPerWorkgroup", numThreadsPerWorkgroup,
        ).replace(
            "__DIAMETER__", __DIAMETER__,
        ).replace(
            "__PARTICLE_COUNT__", particles_count,
        )
    });
    const pipeline = x.device.createComputePipeline({
        label: 'compute pipeline',
        layout: 'auto',
        compute: {
            module,
            entryPoint: 'computeSomething',
        },
    });
    const bindGroup = x.device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: x.particles_in_buffer_gpu }},
            { binding: 1, resource: { buffer: x.particles_out_buffer_gpu }},
        ],
    });
    const r = {
        device: x.device,
        pipeline: pipeline,
        bindGroup: bindGroup,
        dispatchCount: dispatchCount,
        particles_in_buffer_js: x.particles_in_buffer_js,
        particles_in_buffer_gpu: x.particles_in_buffer_gpu,
        particles_out_buffer_gpu: x.particles_out_buffer_gpu,
    }
    await compute(r)
    return r
}


const compute = async (x) => {
    const encoder = x.device.createCommandEncoder({ label: 'compute builtin encoder' });
    const pass = encoder.beginComputePass({ label: 'compute builtin pass' });
    pass.setPipeline(x.pipeline);
    pass.setBindGroup(0, x.bindGroup);
    pass.dispatchWorkgroups(...x.dispatchCount);
    pass.end();
    encoder.copyBufferToBuffer(x.particles_out_buffer_gpu, 0, x.particles_in_buffer_gpu, 0, x.particles_in_buffer_js.byteLength);
    const commandBuffer = encoder.finish();
    x.device.queue.submit([commandBuffer]);
}


const setup_webgpu = async (
    canvas,
) => {
    console.log("requesting adapter")
    const adapter = await navigator.gpu?.requestAdapter();
    console.log("requesting device")
    const device = await adapter?.requestDevice();
    if (!device) {
        const m = 'need a browser that supports WebGPU'
        console.error(m)
        alert(m)
        throw m
    }
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    const context = canvas.getContext('webgpu');
    context.configure({
        device,
        format: presentationFormat,
        alphaMode: "premultiplied",
    });
    const particles_array = []
    for (let index = 0; index < particles_count; index++) {
        particles_array.push(Math.random())
        particles_array.push(Math.random())
        particles_array.push((Math.random()-0.5)*0.0001)
        particles_array.push((Math.random()-0.5)*0.0001)
    }
    const particles_in_buffer_js = new Float32Array(particles_array);
    const particles_in_buffer_gpu = device.createBuffer({
        size: particles_in_buffer_js.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(particles_in_buffer_gpu, 0, particles_in_buffer_js);
    const particles_out_buffer_js = new Float32Array(particles_array);
    const particles_out_buffer_gpu = device.createBuffer({
        size: particles_out_buffer_js.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(particles_out_buffer_gpu, 0, particles_out_buffer_js);
    const uniformBufferSize = 6 * 4;
    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const uniformValues = new Float32Array(uniformBufferSize / 4);
    const source_code = await (await fetch(`./code.wgsl`, {cache: "no-store"})).text()
    const disk_generated_code = await (await fetch(`./disk_generated.wgsl`, {cache: "no-store"})).text()
    const module = device.createShaderModule({
        label: 'shaders',
        code: source_code.replace(
            "// DISK_GENERATED //", disk_generated_code
        ).replace(
            "__DIAMETER__", __DIAMETER__,
        ),
    });
    const pipeline_2 = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module,
            entryPoint: 'vs',
        },
        fragment: {
            module,
            entryPoint: 'fs2',
            targets: [{ format: presentationFormat }],
        },
    });
    let bindGroup2 = device.createBindGroup({
        layout: pipeline_2.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: uniformBuffer }},
            { binding: 1, resource: { buffer: particles_in_buffer_gpu }},
        ],
    });
    const renderPassDescriptor = {
        colorAttachments: [
            {
                clearValue: [0.01, 0.01, 0.01, 1],
                loadOp: 'clear',
                storeOp: 'store',
            },
        ],
    };
    const compute_args = await setup_compute({
        device: device,
        particles_in_buffer_gpu: particles_in_buffer_gpu,
        particles_out_buffer_gpu: particles_out_buffer_gpu,
        particles_in_buffer_js: particles_in_buffer_js,
    })
    return {
        uniformValues: uniformValues,
        device: device,
        uniformBuffer:uniformBuffer,
        canvas: canvas,
        renderPassDescriptor: renderPassDescriptor,
        context: context,
        pipeline_2: pipeline_2,
        bindGroup2: bindGroup2,
        last_update: performance.now(),
        speed: 1.0,
        particles_count: particles_count,
        compute_args:compute_args,
    }
}
const render = async (x) => {
    const start = performance.now()
    for (let index = 0; index < 5; index++) {
        await compute(x.compute_args)
    }
    const update_period = 30000/x.speed
    const noise_ratio =  ( performance.now() - x.last_update ) / update_period 
    x.uniformValues.set([
        x.canvas.width, 
        x.canvas.height, 
        performance.now(), 
        Math.random(),
        noise_ratio,
        x.speed,
    ]);
    x.device.queue.writeBuffer(x.uniformBuffer, 0, x.uniformValues);
    x.renderPassDescriptor.colorAttachments[0].view = x.context.getCurrentTexture().createView();
    const encoder2 = x.device.createCommandEncoder();
    const pass2 = encoder2.beginRenderPass(x.renderPassDescriptor);
    pass2.setPipeline(x.pipeline_2);
    pass2.setBindGroup(0, x.bindGroup2);
    pass2.draw(16*3 * x.particles_count);
    pass2.end();
    const commandBuffer2 = encoder2.finish();
    x.device.queue.submit([commandBuffer2]);
    requestAnimationFrame(()=>{
        render(x)
    })
}
export {
    setup_webgpu,
    render,
}
