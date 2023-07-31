// multiply all elements of an array
const arrayProduct = arr => arr.reduce((a, b) => a * b);

// const __DIAMETER__ = 0.0025;
// const dispatchCount = [8, 4, 4];
// const workgroupSize = [4, 4, 4]; // do not change, 64 is best
// const particles_count = 64 * 64 * 2

const __DIAMETER__ = 0.003;
const dispatchCount = [32, 32, 1];
const workgroupSize = [4,4,4];
const particles_count = arrayProduct(workgroupSize)*arrayProduct(dispatchCount);
const cell_count = parseInt( (1.0 / __DIAMETER__) * 4.0 )
console.log(cell_count)
console.log(cell_count*cell_count)
console.log(particles_count)


const setup_compute_grid = async (x) => {
    const source_code_final = await get_compute_source_code()
    const module = x.device.createShaderModule({
        code: source_code_final
    });
    const pipeline = x.device.createComputePipeline({
        label: 'compute pipeline',
        layout: 'auto',
        compute: {
            module: module,
            entryPoint: 'compute_grid',
        },
    });
    const bindGroup = x.device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: x.particles_in_buffer_gpu }},
            { binding: 4, resource: { buffer: x.grid_buffer_gpu }},
            { binding: 6, resource: { buffer: x.uniform_f_buffer }},
        ],
    });
    const r = {
        device: x.device,
        grid_buffer_gpu: x.grid_buffer_gpu,
        grid_buffer_js: x.grid_buffer_js,
        pipeline: pipeline,
        bindGroup: bindGroup,
        dispatchCount: x.dispatchCount,
    }
    run_compute_grid(r)
    return r
}


const run_compute_grid = async (x) => {
    x.device.queue.writeBuffer(x.grid_buffer_gpu, 0, x.grid_buffer_js);
    const encoder = x.device.createCommandEncoder({ label: 'compute builtin encoder' });
    const pass = encoder.beginComputePass({ label: 'compute builtin pass' });
    pass.setPipeline(x.pipeline);
    pass.setBindGroup(0, x.bindGroup);
    pass.dispatchWorkgroups(...x.dispatchCount);
    pass.end();
    const commandBuffer = encoder.finish();
    x.device.queue.submit([commandBuffer]);
}


const get_compute_source_code = async (x) => {
    const numThreadsPerWorkgroup = arrayProduct(workgroupSize);
    const numWorkgroups = arrayProduct(dispatchCount);
    const numResults = numWorkgroups * numThreadsPerWorkgroup;
    if (particles_count != numResults) {
        throw `Invalid particle count: ${particles_count} != ${numResults}`
    }
    const source_code = await (await fetch(`./code_2.wgsl`, {cache: "no-store"})).text()
    const disk_generated_code = await (await fetch(`./disk_generated.wgsl`, {cache: "no-store"})).text()
    const source_code_final = source_code.replaceAll(
        "// DISK_GENERATED //", disk_generated_code
    ).replaceAll(
        "WORKGROUP_SIZE", workgroupSize,
    ).replaceAll(
        "NUM_ThreadsPerWorkgroup", numThreadsPerWorkgroup,
    ).replaceAll(
        "__DIAMETER__", __DIAMETER__,
    ).replaceAll(
        "__PARTICLE_COUNT__", particles_count,
    )
    return source_code_final
}


const setup_compute = async (x) => {
    const source_code_final = await get_compute_source_code()

    const module = x.device.createShaderModule({
        code: source_code_final
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
            { binding: 2, resource: { buffer: x.uniformBuffer }},
            { binding: 4, resource: { buffer: x.grid_buffer_gpu }},
            { binding: 6, resource: { buffer: x.uniform_f_buffer }},
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
        grid_buffer_gpu: x.grid_buffer_gpu,
        grid_buffer_js: x.grid_buffer_js,
        module: module,
        source_code_final: source_code_final,
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


const setup_draw_2 = async (x) => {
    const uniform_u_values = new Uint32Array([cell_count]);
    const uniform_u_buffer = x.device.createBuffer({
        label: 'uniform_u_buffer',
        size: uniform_u_values.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    x.device.queue.writeBuffer(x.uniform_f_buffer, 0, x.uniform_f_values);
    x.device.queue.writeBuffer(uniform_u_buffer, 0, uniform_u_values);
    const pipeline = x.device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: x.module,
            entryPoint: 'vs_2',
        },
        fragment: {
            module: x.module,
            entryPoint: 'fs_2',
            targets: [{ format: x.presentation_format }],
        },
    });
    let bindGroup = x.device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 2, resource: { buffer: uniform_u_buffer }},
            { binding: 3, resource: { buffer: x.uniform_f_buffer }},
            { binding: 4, resource: { buffer: x.grid_buffer_gpu }},
        ],
    });
    const renderPassDescriptor = {
        colorAttachments: [
            {
                clearValue: [0.01, 0.01, 0.01, 0.0],
                loadOp: 'load',
                storeOp: 'store',
            },
        ],
    };
    const r = {
        pipeline: pipeline,
        device: x.device,
        renderPassDescriptor: renderPassDescriptor,
        bindGroup: bindGroup,
        context: x.context,
        uniform_f_buffer: x.uniform_f_buffer,
        uniform_u_buffer: uniform_u_buffer,
    }
    run_draw_2(r)
    return r
}


const run_draw_2 = async (x) => {
    x.renderPassDescriptor.colorAttachments[0].view = x.context.getCurrentTexture().createView();
    const encoder = x.device.createCommandEncoder();
    const pass = encoder.beginRenderPass(x.renderPassDescriptor);
    pass.setPipeline(x.pipeline);
    pass.setBindGroup(0, x.bindGroup);
    pass.draw(2*3 * cell_count*cell_count);
    pass.end();
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
        particles_array.push((Math.random()-0.5)*0.0002)
        particles_array.push((Math.random()-0.5)*0.0002)
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
    const uniformBufferSize = 14 * 4;
    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const uniform_f_values = new Float32Array([cell_count]);
    const uniform_f_buffer = device.createBuffer({
        label: 'uniform_f_buffer',
        size: uniform_f_values.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const grid_buffer_js = new Uint32Array(cell_count*cell_count);
    for (let index = 0; index < grid_buffer_js.length; index++) {
        grid_buffer_js[index] = -1;
    }
    const grid_buffer_gpu = device.createBuffer({
        size: grid_buffer_js.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    const uniformValues = new Float32Array(uniformBufferSize / 4);
    const source_code = await (await fetch(`./code.wgsl`, {cache: "no-store"})).text()
    const disk_generated_code = await (await fetch(`./disk_generated.wgsl`, {cache: "no-store"})).text()
    const module = device.createShaderModule({
        label: 'shaders',
        code: source_code.replaceAll(
            "// DISK_GENERATED //", disk_generated_code
        ).replaceAll(
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
            entryPoint: 'fs',
            targets: [{ format: presentationFormat }],
        },
    });
    let bindGroup2 = device.createBindGroup({
        layout: pipeline_2.getBindGroupLayout(0),
        entries: [
            { binding: 1, resource: { buffer: particles_in_buffer_gpu }},
            { binding: 4, resource: { buffer: grid_buffer_gpu }},
            { binding: 3, resource: { buffer: uniform_f_buffer }},
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
    const draw_2 = await setup_draw_2({
        module: module,
        presentation_format: presentationFormat,
        device: device,
        context: context,
        grid_buffer_gpu: grid_buffer_gpu,
        uniform_f_buffer: uniform_f_buffer,
        uniform_f_values: uniform_f_values,
    })

    const compute_grid = await setup_compute_grid({
        uniformBuffer: uniformBuffer,
        device: device,
        grid_buffer_js: grid_buffer_js,
        grid_buffer_gpu: grid_buffer_gpu,
        particles_in_buffer_gpu: particles_in_buffer_gpu,
        uniform_u_buffer: draw_2.uniform_u_buffer,
        uniform_f_buffer: draw_2.uniform_f_buffer,
        dispatchCount: dispatchCount,
    })
    const compute_args = await setup_compute({
        device: device,
        particles_in_buffer_gpu: particles_in_buffer_gpu,
        particles_out_buffer_gpu: particles_out_buffer_gpu,
        particles_in_buffer_js: particles_in_buffer_js,
        uniformBuffer: uniformBuffer,
        grid_buffer_js: grid_buffer_js,
        grid_buffer_gpu: grid_buffer_gpu,
        uniform_f_buffer: uniform_f_buffer,
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
        draw_2:draw_2,
        compute_grid: compute_grid,
    }
}
const render = async (x) => {
    const start = performance.now()
    for (let index = 0; index < 1; index++) {
        await run_compute_grid(x.compute_grid)
        await compute(x.compute_args)
    }
    x.uniformValues.set([
        x.canvas.width, 
        x.canvas.height, 
        performance.now(),
        Math.random(),
        0.0,
        x.speed,
        document.getElementById("panel_0").value,
        document.getElementById("panel_1").value,
        document.getElementById("panel_2").value,
        document.getElementById("panel_3").value,
        document.getElementById("panel_4").value,
        document.getElementById("panel_5").value,
        document.getElementById("panel_6").value,
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
