import {Field} from './field.js'
import {create_shader_module} from './create_shader_module.js'


const DIAMETER = 0.1;
const dispatchCount = [2, 4, 8];
const workgroupSize = [4, 4, 4];
const particles_count = 64*16*4
const side_size = Math.sqrt(particles_count)

const particle_fields = 8
const metadata_buffer_gpu_size = 18 * 4;
const metrics_size = 100


const starts = []
const durations = []
const gpu_durations = []
let gpu_timing_pending = false


console.log(`particles_count: ${particles_count}`)
console.log(`side_size: ${side_size}`)


const setup_compute = async ({
    field_particle,
    metadata_buffer_gpu,
    device,
    field_gravity,
}) => {
    // Particles
    const module = await create_shader_module({
        device: device,
        source: './physic.wgsl',
        imports: [
            './shared.wgsl',
        ],
        formatting: {
            '__DIAMETER__': DIAMETER,
            '__PARTICLE_COUNT__': field_particle.cells_count,
            '__WORKGROUP_SIZE__': field_particle.workgroup_size,
            '__THREADS_PER_WORK_GROUP__': field_particle.numThreadsPerWorkgroup,
        }
    })
    const pipeline = device.createComputePipeline({
        label: 'pipeline_particle',
        layout: 'auto',
        compute: {
            module,
            entryPoint: 'main',
        },
    });
    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: field_particle.buffer_gpu_in }},
            { binding: 1, resource: { buffer: field_particle.buffer_gpu_out }},
            { binding: 2, resource: { buffer: metadata_buffer_gpu }},
            { binding: 3, resource: { buffer: field_gravity.buffer_gpu_out }},
        ],
    });
    // Gravity
    const gravity_module = await create_shader_module({
        device: device,
        source: './physic_gravity.wgsl',
        imports: [
            './shared.wgsl',
        ],
        formatting: {
            '__WORKGROUP_SIZE__': field_gravity.workgroup_size,
            '__THREADS_PER_WORK_GROUP__': field_gravity.numThreadsPerWorkgroup,
        }
    })
    const gravity_pipeline = device.createComputePipeline({
        label: 'gravity_pipeline',
        layout: 'auto',
        compute: {
            module: gravity_module,
            entryPoint: 'main',
        },
    });
    const gravity_bind_group = device.createBindGroup({
        layout: gravity_pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: field_gravity.buffer_gpu_in }},
            { binding: 1, resource: { buffer: field_gravity.buffer_gpu_out }},
            { binding: 2, resource: { buffer: metadata_buffer_gpu }},
        ],
    });
    // 
    const r = {
        device: device,
        pipeline: pipeline,
        bindGroup: bindGroup,
        dispatchCount: dispatchCount,
        field_particle: field_particle,
        gravity: {
            module: gravity_module,
            pipeline: gravity_pipeline,
            bind_group: gravity_bind_group,
            dispatch_count: field_gravity.dispatch_count,
            field: field_gravity,
        },
    }
    // await compute(r)
    return r
}


const compute_particles = async (x) => {
    const encoder = x.device.createCommandEncoder({ label: 'compute builtin encoder' });
    const pass = encoder.beginComputePass({ label: 'compute builtin pass' });
    pass.setPipeline(x.pipeline);
    pass.setBindGroup(0, x.bindGroup);
    pass.dispatchWorkgroups(...x.dispatchCount);
    pass.end();
    encoder.copyBufferToBuffer(
        x.field_particle.buffer_gpu_out, 0,
        x.field_particle.buffer_gpu_in, 0,
        x.field_particle.buffer_js.byteLength,
    );
    const commandBuffer = encoder.finish();
    x.device.queue.submit([commandBuffer]);
}


const compute_gravity = async (x) => {
    const encoder = x.device.createCommandEncoder({ label: 'compute builtin encoder' });
    const pass = encoder.beginComputePass({ label: 'compute builtin pass' });
    pass.setPipeline(x.gravity.pipeline);
    pass.setBindGroup(0, x.gravity.bind_group);
    pass.dispatchWorkgroups(...x.gravity.dispatch_count);
    pass.end();
    encoder.copyBufferToBuffer(
        x.gravity.field.buffer_gpu_out, 0,
        x.gravity.field.buffer_gpu_in, 0,
        x.gravity.field.buffer_js.byteLength,
    );
    const commandBuffer = encoder.finish();
    x.device.queue.submit([commandBuffer]);
}


const setup_particles = (bounds) => {
    let ps = []
    let max_x = -Infinity
    let max_y = -Infinity
    let min_x = Infinity
    let min_y = Infinity
    for (let xi = 0; xi < side_size; xi++) {
        for (let yi = 0; yi < side_size; yi++) {
            const x = ((xi+0.5)/(side_size)-0.5) * bounds.w_max * 2
            const y = ((yi+0.5)/(side_size)-0.5) * 7 - 1.5
            max_x = Math.max(max_x, x)
            max_y = Math.max(max_y, y)
            min_x = Math.min(min_x, x)
            min_y = Math.min(min_y, y)
            ps.push({
                xi: xi,
                yi: yi,
                x: x,
                y: y,
            })
        }
    }
    console.log(`particles bounds: ${JSON.stringify({
        min_x:min_x,
        max_x:max_x,
        min_y:min_y,
        max_y:max_y,
    }, null, 2)}`)
    return ps
}


const setup_webgpu = async ({
    canvas,
    alignement,
    gravity_resolution,
    dispatch_count,
}) => {
    console.log("requesting adapter")
    let ratio_w
    let ratio_h
    if (canvas.width > canvas.height) {
        ratio_h = 1
        ratio_w = canvas.width / canvas.height
    } else {
        throw("wip")
    }
    const base_size = 5
    const bounds = {
        w_min: -base_size*ratio_w,
        w_max: base_size*ratio_w,
        h_min: -base_size*ratio_h,
        h_max: base_size*ratio_h,
    }
    console.log(JSON.stringify(bounds, null, 2))
    console.log(`width: ${ratio_w.toFixed(2)}, height: ${ratio_h.toFixed(2)}`)
    const adapter = await Promise.race([
        navigator.gpu?.requestAdapter(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("WebGPU adapter request timed out")), 500))
    ]);
    if (!adapter) {
        const m = 'Failed to acquire GPU adapter (timed out or unavailable).';
        console.error(m);
        alert(m);
        throw m;
    }
    console.log("requesting device")
    const device = await adapter?.requestDevice();
    if (!device) {
        const m = 'need a browser that supports WebGPU'
        console.error(m)
        alert(m)
        throw m
    }
    const field_gravity = new Field({
        device: device, 
        resolution: gravity_resolution,
        attributs_count: 4,
        dispatch_count: dispatch_count,
        workgroup_size: [4, 4, 4],
        data: null,
    });
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    const context = canvas.getContext('webgpu');
    context.configure({
        device,
        format: presentationFormat,
        alphaMode: "premultiplied",
    });
    const particles_array = []
    const particles = setup_particles(bounds)
    for (let index = 0; index < particles_count; index++) {
        particles_array.push(particles[index].xi)
        particles_array.push(particles[index].yi)
        particles_array.push(index)
        particles_array.push(0.0)
        particles_array.push(particles[index].x)
        particles_array.push(particles[index].y)
        particles_array.push((Math.random()-0.5)*0.0001)
        particles_array.push((Math.random()-0.5)*0.0001)
    }
    const field_particle = new Field({
        device: device, 
        resolution: side_size, 
        attributs_count: particle_fields,
        dispatch_count: dispatchCount,
        workgroup_size: workgroupSize,
        data: particles_array,
    })
    const metadata_buffer_gpu = device.createBuffer({
        size: metadata_buffer_gpu_size,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const uniformValues = new Float32Array(metadata_buffer_gpu_size / 4);
    const source_code = await (await fetch(`./display.wgsl`, {cache: "no-store"})).text()
    const source_code_line = await (await fetch(`./display_line.wgsl`, {cache: "no-store"})).text()
    const source_code_draw_01 = await (await fetch(`./display_01.wgsl`, {cache: "no-store"})).text()
    const disk_generated_code = await (await fetch(`./disk_generated.wgsl`, {cache: "no-store"})).text()
    const shared_code = await (await fetch(`./shared.wgsl`, {cache: "no-store"})).text()
    const module = device.createShaderModule({
        label: 'shaders',
        code: source_code.replace(
            "// DISK_GENERATED //", disk_generated_code
        ).replace(
            "__DIAMETER__", DIAMETER,
        ).replace(
            "__PARTICLE_COUNT__", particles_count,
        ).replace(
            "// import file://./shared.wgsl", shared_code,
        ),
    });
    const module_line = device.createShaderModule({
        label: 'shaders',
        code: source_code_line.replace(
            "// DISK_GENERATED //", disk_generated_code
        ).replace(
            "__DIAMETER__", DIAMETER,
        ).replace(
            "__PARTICLE_COUNT__", particles_count,
        ).replace(
            "// import file://./shared.wgsl", shared_code,
        ),
    });
    const module_draw_01 = device.createShaderModule({
        label: 'shaders',
        code: source_code_draw_01.replace(
            "// DISK_GENERATED //", disk_generated_code
        ).replace(
            "__DIAMETER__", DIAMETER,
        ).replace(
            "__PARTICLE_COUNT__", particles_count,
        ).replace(
            "// import file://./shared.wgsl", shared_code,
        ),
    });
    const draw_01_pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: module_draw_01,
            entryPoint: 'vs',
        },
        fragment: {
            module: module_draw_01,
            entryPoint: 'fs',
            targets: [{ format: presentationFormat }],
        },
        primitive: {
            topology: 'triangle-strip',
        },
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
    const pipeline_line = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: module_line,
            entryPoint: 'vs_line',
        },
        fragment: {
            module: module_line,
            entryPoint: 'fs_line',
            targets: [{ format: presentationFormat }],
        },
        primitive: {
            topology: 'line-strip',
        },
    });
    let bindGroup2 = device.createBindGroup({
        layout: pipeline_2.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: metadata_buffer_gpu }},
            { binding: 1, resource: { buffer: field_particle.buffer_gpu_in }},
            { binding: 2, resource: { buffer: field_gravity.buffer_gpu_in }},
        ],
    });
    let bindGroup_line = device.createBindGroup({
        layout: pipeline_line.getBindGroupLayout(0),
        entries: [
            { binding: 1, resource: { buffer: field_particle.buffer_gpu_in }},
        ],
    });
    const renderPassDescriptor = {
        colorAttachments: [
            {
                clearValue: [0.01, 0.01, 0.01, 1],
                loadOp: 'load',
                storeOp: 'store',
            },
        ],
    };
    const compute_args = await setup_compute({
        device: device,
        metadata_buffer_gpu: metadata_buffer_gpu,
        field_particle: field_particle,
        field_gravity:field_gravity,
    })
    const draw_01_renderPassDescriptor = {
        colorAttachments: [
            {
                clearValue: [0.01, 0.01, 0.01, 1],
                loadOp: 'clear',
                storeOp: 'store',
            },
        ],
    };
    const draw_01_bind_group = device.createBindGroup({
        layout: draw_01_pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: metadata_buffer_gpu }},
            { binding: 2, resource: { buffer: field_gravity.buffer_gpu_in }},
        ],
    });
    return {
        uniformValues: uniformValues,
        device: device,
        metadata_buffer_gpu: metadata_buffer_gpu,
        canvas: canvas,
        renderPassDescriptor: renderPassDescriptor,
        context: context,
        pipeline_2: pipeline_2,
        bindGroup2: bindGroup2,
        last_update: performance.now(),
        speed: 1.0,
        particles_count: particles_count,
        compute_args: compute_args,
        pipeline_line: pipeline_line,
        bindGroup_line: bindGroup_line,
        gravity_resolution: gravity_resolution,
        draw_01: {
            render_pass_descriptor: draw_01_renderPassDescriptor,
            pipeline: draw_01_pipeline,
            bind_group: draw_01_bind_group,
        },
        bounds:bounds,
    }
}


let step_counter = 0;


const draw_01 = ({
    device,
    render_pass_descriptor,
    context,
    pipeline,
    bind_group,
}) => {
    render_pass_descriptor.colorAttachments[0].view = context.getCurrentTexture().createView();
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass(render_pass_descriptor);
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bind_group);
    pass.draw(4);
    pass.end();
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
}


const draw_02 = (x) => {
    x.renderPassDescriptor.colorAttachments[0].view = x.context.getCurrentTexture().createView();
    const encoder = x.device.createCommandEncoder();
    const pass = encoder.beginRenderPass(x.renderPassDescriptor);
    pass.setPipeline(x.pipeline_2);
    pass.setBindGroup(0, x.bindGroup2);
    pass.draw(16*3 * (x.particles_count));
    pass.end();
    const commandBuffer = encoder.finish();
    x.device.queue.submit([commandBuffer]);
}


const track_gpu_completion = (device, frame_start) => {
    if (gpu_timing_pending) {
        return
    }
    gpu_timing_pending = true
    device.queue.onSubmittedWorkDone().then(() => {
        gpu_durations.push(performance.now() - frame_start)
        while (gpu_durations.length > metrics_size) {
            gpu_durations.shift()
        }
    }).catch((error) => {
        console.error('Failed while waiting for submitted GPU work:', error)
    }).finally(() => {
        gpu_timing_pending = false
    })
}


const run = async (
    x,
) => {
    const start = performance.now()
    track_gpu_completion(x.device, start)
    starts.push(start)
    while (starts.length > metrics_size) {
        starts.shift()
    }
    const elapsed_ms = starts.length > 1 ? start - starts[0] : 0;
    const fps = elapsed_ms > 0 ? ((starts.length - 1) * 1000) / elapsed_ms : 0;
    document.querySelector('#fps_value').textContent = fps.toFixed(1);
    for (let index = 0; index < 7; index++) {
        step_counter += 1;
        x.uniformValues.set([
            x.gravity_resolution,
            64,
            0.0,
            0.0,
        //     w_min: -base_size*ratio_w,
        // w_max: base_size*ratio_w,
        // h_min: -base_size*ratio_h,
        // h_max: base_size*ratio_h,
            x.bounds.w_min,
            x.bounds.w_max,
            x.bounds.h_min,
            x.bounds.h_max,
            x.canvas.width, 
            x.canvas.height, 
            performance.now(),
            Math.random(),
            0,
            x.speed,
            parseFloat(side_size),
            Math.random(),
            Math.random(),
            Math.random(),
        ]);
        x.device.queue.writeBuffer(x.metadata_buffer_gpu, 0, x.uniformValues);
        compute_particles(x.compute_args)
        if (step_counter % 300 == 0) {
            // await compute_gravity(x.compute_args)
        }
    }
    draw_01({
        device: x.device,
        context: x.context,
        render_pass_descriptor: x.draw_01.render_pass_descriptor,
        pipeline: x.draw_01.pipeline,
        bind_group: x.draw_01.bind_group,
    })
    draw_02(x)
    const duration = performance.now() - start
    durations.push(duration)
    while (durations.length > metrics_size) {
        durations.shift()
    }
    const target_ms = 1000 / 120;
    if (durations.length > 0) {
        const avg_duration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const usage_pct = avg_duration / target_ms * 100;
        document.querySelector('#cpu_usage_value').textContent = `${usage_pct.toFixed(1)}%`;
    }
    if (gpu_durations.length > 0) {
        const avg_duration = gpu_durations.reduce((a, b) => a + b, 0) / gpu_durations.length;
        const usage_pct = avg_duration / target_ms * 100;
        document.querySelector('#gpu_usage_value').textContent = `${usage_pct.toFixed(1)}%`;
    }
    if (gpu_durations.length == 99) {
        console.log(gpu_durations)
    }
    requestAnimationFrame(()=>{
        run(x)
    })
}


export {
    setup_webgpu,
    run,
}
