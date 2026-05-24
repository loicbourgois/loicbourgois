import {Field} from './field.js'
import {create_shader_module} from './create_shader_module.js'
import {
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
} from './shared.js'


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
        ],
    });
    const sort_bind_group = device.createBindGroup({
        layout: sort_pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: sort_items_buffer_gpu }},
            { binding: 1, resource: { buffer: sort_params_buffer_gpu }},
        ],
    });
    const region_ranges_bind_group = device.createBindGroup({
        layout: region_ranges_pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: sort_items_buffer_gpu }},
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
            '__REGION_SIDE__': REGION_SIDE,
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


const setup_particles = (bounds, particles_count) => {
    let ps = []
    let max_x = -Infinity
    let max_y = -Infinity
    let min_x = Infinity
    let min_y = Infinity
    for (let xi = 0; xi < side_size; xi++) {
        for (let yi = 0; yi < side_size; yi++) {
            const x = Math.random() * bounds.w_max * 2 - bounds.w_max
            const y = (Math.random() * bounds.h_max *0.5 - bounds.h_max) 
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


const setup = async ({
    canvas,
    alignement,
    background_resolution,
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
        resolution: background_resolution,
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
    const particles = setup_particles(bounds, particles_count)
    for (let index = 0; index < particles_count; index++) {
        particles_array.push(particles[index].xi)
        particles_array.push(particles[index].yi)
        particles_array.push(index)
        particles_array.push(0.0)
        particles_array.push(particles[index].x)
        particles_array.push(particles[index].y)
        particles_array.push((Math.random()-0.5)*0.000)
        particles_array.push((Math.random()-0.5)*0.000)
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
    const buffer_particle_region_js = new Uint32Array(particles_count);
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
    const disk_generated_code = await (await fetch(`./disk_generated.wgsl`, {cache: "no-store"})).text()
    const module = await create_shader_module({
        device,
        source: './display.wgsl',
        imports: ['./shared.wgsl'],
        formatting: {
            '// DISK_GENERATED //': disk_generated_code,
            '__DIAMETER__': DIAMETER,
            '__PARTICLE_COUNT__': particles_count,
        },
    });
    const module_draw_01 = await create_shader_module({
        device,
        source: './display_01.wgsl',
        imports: ['./shared.wgsl'],
        formatting: {
            '// DISK_GENERATED //': disk_generated_code,
            '__DIAMETER__': DIAMETER,
            '__PARTICLE_COUNT__': particles_count,
        },
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
    let bindGroup2 = device.createBindGroup({
        layout: pipeline_2.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: metadata_buffer_gpu }},
            { binding: 1, resource: { buffer: field_particle.buffer_gpu_in }},
            { binding: 2, resource: { buffer: field_gravity.buffer_gpu_in }},
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
        gravity_resolution: background_resolution,
        draw_01: {
            render_pass_descriptor: draw_01_renderPassDescriptor,
            pipeline: draw_01_pipeline,
            bind_group: draw_01_bind_group,
        },
        bounds:bounds,
    }
}


export {
    setup,
}
