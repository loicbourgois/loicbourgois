import {Field} from './field.js'
import {create_shader_module} from './create_shader_module.js'


const DIAMETER = 0.07;

// const workgroupSize = [4, 4, 1];
// const dispatchCount = [1, 1, 1];
// const particles_count = 16

// const workgroupSize = [4, 4, 4];
// const dispatchCount = [1, 1, 1];
// const particles_count = 64

// const workgroupSize = [4, 2, 2];
// const dispatchCount = [4, 4, 4];
// const particles_count = 1024


const workgroupSize = [4, 8, 4];
const dispatchCount = [4, 4, 4];
const particles_count = 4096*2


const side_size = Math.sqrt(particles_count)

const particle_fields = 10
const metadata_buffer_gpu_size = 18 * 4;
const metrics_size = 100
const sort_metadata_buffer_gpu_size = 4 * 4;


const starts = []
const durations = []
const gpu_durations = []
let gpu_timing_pending = false


console.log(`particles_count: ${particles_count}`)
console.log(`side_size: ${side_size}`)

const BITONIC_WORKGROUP_SIZE = 256;
const sort_item_size = 8;

const REGION_SIDE = 64;
const REGION_COUNT = REGION_SIDE * REGION_SIDE;
const region_range_size = 8;


const setup_bitonic_sort = async ({
    device,
    buffer_particle_region_gpu,
}) => {
    if ((particles_count & (particles_count - 1)) !== 0) {
        throw new Error('Bitonic sort requires particles_count to be a power of 2.');
    }

    const region_ranges_buffer_gpu = device.createBuffer({
        size: REGION_COUNT * region_range_size,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });

    const sort_items_buffer_gpu = device.createBuffer({
        size: particles_count * sort_item_size,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    const sort_items_buffer_gpu_read = device.createBuffer({
        size: particles_count * sort_item_size,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const sort_params_buffer_gpu = device.createBuffer({
        size: sort_metadata_buffer_gpu_size,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const module = await create_shader_module({
        device: device,
        source: './bitonic.wgsl',
        imports: [],
        formatting: {
            '__BITONIC_WORKGROUP_SIZE__': BITONIC_WORKGROUP_SIZE,
            '__particles_count__': particles_count,
            '__REGION_COUNT__': REGION_COUNT,
        }
    })
    const initialise_pipeline = device.createComputePipeline({
        label: 'pipeline_bitonic_sort_initialise',
        layout: 'auto',
        compute: {
            module,
            entryPoint: 'initialise',
        },
    });
    const sort_pipeline = device.createComputePipeline({
        label: 'pipeline_bitonic_sort',
        layout: 'auto',
        compute: {
            module,
            entryPoint: 'sort',
        },
    });
    const region_ranges_pipeline = device.createComputePipeline({
        label: 'pipeline_bitonic_region_ranges',
        layout: 'auto',
        compute: {
            module,
            entryPoint: 'build_region_ranges',
        },
    });
    const initialise_bind_group = device.createBindGroup({
    layout: initialise_pipeline.getBindGroupLayout(0),
    entries: [
        { binding: 0, resource: { buffer: sort_items_buffer_gpu }},
        { binding: 2, resource: { buffer: buffer_particle_region_gpu }},
        // { binding: 3, resource: { buffer: region_ranges_buffer_gpu }},
    ],
});

const sort_bind_group = device.createBindGroup({
    layout: sort_pipeline.getBindGroupLayout(0),
    entries: [
        { binding: 0, resource: { buffer: sort_items_buffer_gpu }},
        { binding: 1, resource: { buffer: sort_params_buffer_gpu }},
        // { binding: 3, resource: { buffer: region_ranges_buffer_gpu }},
    ],
});

const region_ranges_bind_group = device.createBindGroup({
    layout: region_ranges_pipeline.getBindGroupLayout(0),
    entries: [
        { binding: 0, resource: { buffer: sort_items_buffer_gpu }},
        // { binding: 2, resource: { buffer: buffer_particle_region_gpu }},
        { binding: 3, resource: { buffer: region_ranges_buffer_gpu }},
    ],
});
    return {
        initialise_pipeline,
    sort_pipeline,
    region_ranges_pipeline,

    initialise_bind_group,
    sort_bind_group,
    region_ranges_bind_group,

    sort_params_buffer_gpu,
    sort_items_buffer_gpu,
    sort_items_buffer_gpu_read,
    region_ranges_buffer_gpu,

    workgroups: Math.ceil(particles_count / BITONIC_WORKGROUP_SIZE),
    region_ranges_workgroups: Math.ceil(Math.max(particles_count, REGION_COUNT) / BITONIC_WORKGROUP_SIZE),
    };
};


const bitonic_sort = ({
    device,
    bitonic_sort,
}) => {
    {
        const encoder = device.createCommandEncoder({ label: 'encode_bitonic_sort' });
        const pass = encoder.beginComputePass({ label: 'bitonic sort initialise pass' });
        pass.setPipeline(bitonic_sort.initialise_pipeline);
        pass.setBindGroup(0, bitonic_sort.initialise_bind_group);
        pass.dispatchWorkgroups(bitonic_sort.workgroups);
        pass.end();
        device.queue.submit([encoder.finish()]);
    }
    let ii = 0
    for (let k = 2; k <= particles_count; k <<= 1) {
        for (let j = k >> 1; j > 0; j >>= 1) {
            device.queue.writeBuffer(bitonic_sort.sort_params_buffer_gpu, 0, new Uint32Array([j, k]));
            const encoder = device.createCommandEncoder();
            const pass = encoder.beginComputePass();
            pass.setPipeline(bitonic_sort.sort_pipeline);
            pass.setBindGroup(0, bitonic_sort.sort_bind_group);
            pass.dispatchWorkgroups(bitonic_sort.workgroups);
            pass.end();
            device.queue.submit([encoder.finish()]);
        }
    }
    {
        const encoder = device.createCommandEncoder();
        encoder.copyBufferToBuffer(
            bitonic_sort.sort_items_buffer_gpu,
            0,
            bitonic_sort.sort_items_buffer_gpu_read,
            0,
            particles_count * sort_item_size,
        );
        device.queue.submit([encoder.finish()]);
    }
    {
        const encoder = device.createCommandEncoder({ label: 'encode_bitonic_region_ranges' });
        const pass = encoder.beginComputePass({ label: 'bitonic region ranges pass' });

        pass.setPipeline(bitonic_sort.region_ranges_pipeline);
        pass.setBindGroup(0, bitonic_sort.region_ranges_bind_group);
        pass.dispatchWorkgroups(bitonic_sort.region_ranges_workgroups);

        pass.end();
        device.queue.submit([encoder.finish()]);
    }
};


const setup_compute = async ({
    field_particle,
    metadata_buffer_gpu,
    device,
    field_gravity,
    buffer_particle_region_gpu,
    buffer_particle_region_gpu_read,
    buffer_particle_region_js,
    bitonic_sort,
}) => {
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
        { binding: 3, resource: { buffer: buffer_particle_region_gpu }},
        { binding: 4, resource: { buffer: bitonic_sort.sort_items_buffer_gpu }},
        { binding: 5, resource: { buffer: bitonic_sort.region_ranges_buffer_gpu }},
    ],
});
    const r = {
        device: device,
        pipeline: pipeline,
        bindGroup: bindGroup,
        dispatchCount: dispatchCount,
        field_particle: field_particle,
        buffer_particle_region_gpu: buffer_particle_region_gpu,
        buffer_particle_region_gpu_read: buffer_particle_region_gpu_read,
        buffer_particle_region_js: buffer_particle_region_js,
        bitonic_sort: bitonic_sort,
    }
    return r
}


const compute_particles = async (
    x,
) => {
    const start = performance.now()
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
    await x.device.queue.submit([encoder.finish()]);
    
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
    console.log(`particles bounds start: ${JSON.stringify({
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
        ratio_h = canvas.height / canvas.width
        ratio_w = 1
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
        particles_array.push(0.0)
        particles_array.push(0.0)
    }
    const field_particle = new Field({
        device: device, 
        resolution: side_size, 
        attributs_count: particle_fields,
        dispatch_count: dispatchCount,
        workgroup_size: workgroupSize,
        data: particles_array,
    })

    const buffer_particle_region_js = new Int32Array(particles_count);
    const buffer_particle_region_gpu = device.createBuffer({
        size: buffer_particle_region_js.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    const buffer_particle_region_gpu_read = device.createBuffer({
        size: buffer_particle_region_js.byteLength,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

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
    const bitonic_sort = await setup_bitonic_sort({
        device: device,
        buffer_particle_region_gpu: buffer_particle_region_gpu,
    });
    const compute_args = await setup_compute({
        device: device,
        metadata_buffer_gpu: metadata_buffer_gpu,
        field_particle: field_particle,
        field_gravity:field_gravity,
        buffer_particle_region_gpu: buffer_particle_region_gpu,
        buffer_particle_region_gpu_read: buffer_particle_region_gpu_read,
        buffer_particle_region_js: buffer_particle_region_js,
        bitonic_sort: bitonic_sort,
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
    device.queue.onSubmittedWorkDone().then(() => {
        gpu_durations.push(performance.now() - frame_start)
        while (gpu_durations.length > metrics_size) {
            gpu_durations.shift()
        }
    }).catch((error) => {
        console.error('Failed while waiting for submitted GPU work:', error)
    })
}


const run = async (
    x,
) => {
    // console.log("--------")
    
    
    const start = performance.now()
    track_gpu_completion(x.device, start)
    

    // console.log("d1", performance.now() -start)


    bitonic_sort({
        device: x.device,
        bitonic_sort: x.compute_args.bitonic_sort,
    });
    for (let index = 0; index < 16; index++) {
        step_counter += 1;
        x.uniformValues.set([
            x.gravity_resolution,
            64,
            0.0,
            0.0,
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
    }



    // await x.compute_args.bitonic_sort.sort_items_buffer_gpu_read.mapAsync(GPUMapMode.READ);
    // const mapped = x.compute_args.bitonic_sort.sort_items_buffer_gpu_read.getMappedRange();
    // const values = new Uint32Array(mapped);
    // const results = [];
    // for (let index = 0; index < particles_count; index++) {
    //     results.push({
    //         key: values[index * 2],
    //         particle_index: values[index * 2 + 1],
    //     });
    // }
    // console.log('bitonic sort results:', JSON.stringify(results));
    // x.compute_args.bitonic_sort.sort_items_buffer_gpu_read.unmap();



    draw_01({
        device: x.device,
        context: x.context,
        render_pass_descriptor: x.draw_01.render_pass_descriptor,
        pipeline: x.draw_01.pipeline,
        bind_group: x.draw_01.bind_group,
    })
    draw_02(x)


    // Perf
    starts.push(start)
    while (starts.length > metrics_size) {
        starts.shift()
    }
    const elapsed_ms = starts.length > 1 ? start - starts[0] : 0;
    const fps = elapsed_ms > 0 ? ((starts.length - 1) * 1000) / elapsed_ms : 0;
    document.querySelector('#fps_value').textContent = fps.toFixed(1);
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
    
    
    // Loop
    requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
        // requestAnimationFrame(()=>{
            run(x)
        // })
        })
    })


    // Debug
    if (gpu_durations.length == 99) {
        console.log(gpu_durations)
    }
}


export {
    setup_webgpu,
    run,
}
