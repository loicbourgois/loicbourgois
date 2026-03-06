import {
    getColors
} from "./color.js"


const setup_webgpu = async (
    canvas,
    unit_count,
    imgs,
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
    const source_code = await (await fetch(`./code.wgsl`, {cache: "no-store"})).text()
    const module = device.createShaderModule({
        label: 'shaders',
        code: source_code,
    });
    const pipeline = device.createRenderPipeline({
        label: 'triangle with uniforms',
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
    const pipeline_2 = device.createRenderPipeline({
        label: 'triangle with uniforms',
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
    const uniformBufferSize = 8 * 4;
    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const uniformValues = new Float32Array(uniformBufferSize / 4);
    //
    const buffer_data_js = new Int32Array(unit_count*unit_count);
    for (let y = 0; y < unit_count; y++) {
        for (let x = 0; x < unit_count; x++) {
            const k = (x + y * unit_count) * 4;
            const r = k+1;
            const g = k+2;
            const b = k+3;
            buffer_data_js[k] = 0;
            buffer_data_js[r] = 0;
            buffer_data_js[g] = 0;
            buffer_data_js[b] = 0;
        }
    }
    const buffer_data_gpu = device.createBuffer({
        size: unit_count*unit_count*4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    //
    const buffer_imgs_js = new Int32Array(imgs.length * 8 * 8);
    let img_i = 0
    for (const img of imgs) {
        for (const e of img) {
            buffer_imgs_js[img_i] = e
            img_i += 1
        }
    }
    console.log(buffer_imgs_js)
    const buffer_imgs_gpu = device.createBuffer({
        size: imgs.length * 8 * 8 * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    //
    let bindGroup
    bindGroup = device.createBindGroup({
        label: 'triangle bind group',
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: uniformBuffer }},
            { binding: 3, resource: { buffer: buffer_data_gpu }},
            { binding: 1, resource: { buffer: buffer_imgs_gpu }},
        ],
    });
    let bindGroup_2;
    bindGroup_2 = device.createBindGroup({
        label: 'triangle bind group',
        layout: pipeline_2.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: uniformBuffer }},
        ],
    });
    const renderPassDescriptor = {
        label: 'our basic canvas renderPass',
        colorAttachments: [
            {
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: 'clear',
                storeOp: 'store',
            },
        ],
    };
    return {
        uniformValues: uniformValues,
        device: device,
        uniformBuffer:uniformBuffer,
        canvas: canvas,
        renderPassDescriptor: renderPassDescriptor,
        context: context,
        pipeline: pipeline,
        pipeline_2: pipeline_2,
        bindGroup: bindGroup,
        bindGroup_2: bindGroup_2,
        buffer_data_js: buffer_data_js,
        buffer_data_gpu: buffer_data_gpu,
        buffer_imgs_js: buffer_imgs_js,
        buffer_imgs_gpu: buffer_imgs_gpu,
        last_update: performance.now(),
        speed: 1.0,
        unit_count:unit_count,
    }
}


function render(x, world) {
    const update_period = 30000/x.speed
    const noise_ratio =  ( performance.now() - x.last_update ) / update_period 
    x.uniformValues.set([
        x.canvas.width, 
        x.canvas.height, 
        performance.now(), 
        Math.random(),
        noise_ratio,
        x.speed,
        x.unit_count,
    ]);
    for (let y = 0; y < x.unit_count; y++) {
        for (let x_ = 0; x_ < x.unit_count; x_++) {
            const i = x_ + y * x.unit_count
            const k = i * 4;
            const r = k+1;
            const g = k+2;
            const b = k+3;
            x.buffer_data_js[k] = world.blocks[i].k;
            x.buffer_data_js[r] = world.blocks[i].r;
            x.buffer_data_js[g] = world.blocks[i].g;
            x.buffer_data_js[b] = world.blocks[i].b;
        }
    }
    //
    x.device.queue.writeBuffer(x.uniformBuffer, 0, x.uniformValues);
    x.device.queue.writeBuffer(x.buffer_data_gpu, 0, x.buffer_data_js);
    x.device.queue.writeBuffer(x.buffer_imgs_gpu, 0, x.buffer_imgs_js);
    x.renderPassDescriptor.colorAttachments[0].view = x.context.getCurrentTexture().createView();
    const encoder = x.device.createCommandEncoder();
    const pass = encoder.beginRenderPass(x.renderPassDescriptor);
    pass.setPipeline(x.pipeline);
    pass.setBindGroup(0, x.bindGroup);
    pass.draw(6);
    pass.end();
    const commandBuffer = encoder.finish();
    const encoder_2 = x.device.createCommandEncoder();
    const pass_2 = encoder_2.beginRenderPass(x.renderPassDescriptor);
    pass_2.setPipeline(x.pipeline_2);
    pass_2.setBindGroup(0, x.bindGroup_2);
    pass_2.draw(6);
    pass_2.end();
    const commandBuffer_2 = encoder_2.finish();
    x.device.queue.submit([commandBuffer_2, commandBuffer, ]);
    requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
            render(x, world)
        })
    })
}


const new_geometry = (storage_buffer_a_data) => {
    for (let index = 0; index < storage_buffer_a_data.length; index++) {
        storage_buffer_a_data[index] = Math.random()
    }
}


const new_colors = (colors_buffer_data, layers) => {
    const colors = getColors(layers+1, 2);
    for (let index = 0; index < colors_buffer_data.length; index++) {
        colors_buffer_data[index] = colors[parseInt(index/4)+1][index%4]
    }
}


export {
    setup_webgpu,
    render,
}
