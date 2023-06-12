import {
    getColors
  } from "./color.js"

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
    const uniformBufferSize = 6 * 4;
    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const dim = 13
    const layers = 3
    const uniformValues = new Float32Array(uniformBufferSize / 4);
    const storage_buffer_a_size = dim * dim * 4 * 3;
    const storage_buffer_a = device.createBuffer({
        size: storage_buffer_a_size,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    const storage_buffer_a_data = new Float32Array(storage_buffer_a_size / 4);
    new_geometry(storage_buffer_a_data)
    const storage_buffer_a2_size = 4 * 4;
    const storage_buffer_a2 = device.createBuffer({
        size: storage_buffer_a2_size,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    const storage_buffer_a2_data = new Uint32Array(storage_buffer_a2_size / 4);
    storage_buffer_a2_data[0] = layers
    storage_buffer_a2_data[1] = dim
    storage_buffer_a2_data[2] = dim
    storage_buffer_a2_data[3] = dim
    const img_buffer_size = canvas.width * canvas.height * 3 * 4;
    const img_buffer = device.createBuffer({
        size: img_buffer_size,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    const img_buffer_data = new Float32Array(img_buffer_size / 4);
    for (let index = 0; index < img_buffer_data.length; index++) {
        img_buffer_data[index] = -2.0
    }
    const img2_buffer_size = canvas.width * canvas.height * 3 * 4;
    const img2_buffer = device.createBuffer({
        size: img2_buffer_size,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    const img2_buffer_data = new Float32Array(img2_buffer_size / 4);
    for (let index = 0; index < img2_buffer_data.length; index++) {
        img2_buffer_data[index] = -2.0
    }
    const colors_buffer_size = (layers+1)*4*4;
    const colors_buffer = device.createBuffer({
        size: colors_buffer_size,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    const colors_buffer_data = new Float32Array(colors_buffer_size / 4);
    new_colors(colors_buffer_data, layers)
    console.log(colors_buffer_data)
    // console.log(GPUBufferUsage)
    let bindGroup
    bindGroup = device.createBindGroup({
        label: 'triangle bind group',
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: uniformBuffer }},
            { binding: 1, resource: { buffer: storage_buffer_a }},
            { binding: 2, resource: { buffer: storage_buffer_a2 }},
            { binding: 3, resource: { buffer: img_buffer }},
            { binding: 4, resource: { buffer: img2_buffer }},
            { binding: 5, resource: { buffer: colors_buffer }},
        ],
    });
    let bindGroup_2;
    bindGroup_2 = device.createBindGroup({
        label: 'triangle bind group',
        layout: pipeline_2.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: uniformBuffer }},
            // { binding: 1, resource: { buffer: storage_buffer_a }},
            // { binding: 2, resource: { buffer: storage_buffer_a2 }},
            { binding: 3, resource: { buffer: img_buffer }},
            { binding: 4, resource: { buffer: img2_buffer }},
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
    device.queue.writeBuffer(img_buffer, 0, img_buffer_data);
    device.queue.writeBuffer(img2_buffer, 0, img2_buffer_data);
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
        storage_buffer_a_data: storage_buffer_a_data,
        storage_buffer_a: storage_buffer_a,
        storage_buffer_a2_data: storage_buffer_a2_data,
        storage_buffer_a2: storage_buffer_a2,
        colors_buffer: colors_buffer,
        colors_buffer_data: colors_buffer_data,
        layers: layers,
        last_update: performance.now(),
        speed: 1.0,
    }
}
function render(x) {
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
    x.device.queue.writeBuffer(x.storage_buffer_a, 0, x.storage_buffer_a_data);
    x.device.queue.writeBuffer(x.storage_buffer_a2, 0, x.storage_buffer_a2_data);
    x.device.queue.writeBuffer(x.colors_buffer, 0, x.colors_buffer_data);
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
            render(x)
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
    new_colors,
    new_geometry,
}
