import {
    side_size,
    particles_count,
    sort_item_size,
} from './shared.js'


let step_counter = 0;
const starts = []
const durations = []
const gpu_durations = []
const metrics_size = 100


const bitonic_sort = ({
    device,
    bitonic_sort,
}) => {
    {
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginComputePass({ label: 'bitonic sort initialise pass' });
        pass.setPipeline(bitonic_sort.initialise_pipeline);
        pass.setBindGroup(0, bitonic_sort.initialise_bind_group);
        pass.dispatchWorkgroups(bitonic_sort.workgroups);
        pass.end();
        device.queue.submit([encoder.finish()]);
    }
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
    // {
    //     const encoder = device.createCommandEncoder();
    //     encoder.copyBufferToBuffer(
    //         bitonic_sort.sort_items_buffer_gpu,
    //         0,
    //         bitonic_sort.sort_items_buffer_gpu_read,
    //         0,
    //         particles_count * sort_item_size,
    //     );
    //     device.queue.submit([encoder.finish()]);
    // }
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


const compute_particles = (
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
    x.device.queue.submit([encoder.finish()]);
}


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
    // pass.draw(16*3 * (x.particles_count));
    pass.draw(48, x.particles_count);
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
    const start = performance.now()
    track_gpu_completion(x.device, start)
    // Grid cells are big enough that we don't need to update the grid before
    // each compute.
    // It's fine to do 1 grid update, N compute
    const compute_count = 30
    // const sortEveryNSteps = 1; // correctness
    // const sortEveryNSteps = compute_count; // fastest approximation
    const sortEveryNSteps = compute_count;
    for (let index = 0; index < compute_count; index++) {
        step_counter += 1;
        if (index % sortEveryNSteps === 0) {
            bitonic_sort({
                device: x.device,
                bitonic_sort: x.compute_args.bitonic_sort,
            });
        }
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
    document.querySelector('#ups_value').textContent = (fps*compute_count).toFixed(1);
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
        requestAnimationFrame(()=>{
            run(x)
        })
        })
    })


    // Debug
    // try {
    //     await x.compute_args.bitonic_sort.sort_items_buffer_gpu_read.mapAsync(GPUMapMode.READ);
    //     const mapped = x.compute_args.bitonic_sort.sort_items_buffer_gpu_read.getMappedRange();
    //     const values = new Uint32Array(mapped);
    //     const results = [];
    //     for (let index = 0; index < particles_count; index++) {
    //         results.push({
    //             key: values[index * 2],
    //             particle_index: values[index * 2 + 1],
    //         });
    //     }
    //     // console.log('bitonic sort results:', JSON.stringify(results));
    //     x.compute_args.bitonic_sort.sort_items_buffer_gpu_read.unmap();
    // } catch (error) {
    //     // 
    // }
    // if (gpu_durations.length == 99) {
    //     console.log(gpu_durations)
    // }
}


export {
    run,
}
