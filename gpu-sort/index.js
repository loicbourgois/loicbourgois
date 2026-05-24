import { create_shader_module } from "./create_shader_module.js";


const itemSize = 8; // f32 value + u32 original index


const bitonic_sort = async ({
  device, 
  bufferSize,
  dataBuffer,
  bindGroup,
  length,
  paramBuffer,
  pipeline,
  workgroups,
  readBuffer,
}) => {
  const start = performance.now();
  for (let k = 2; k <= length; k <<= 1) {
    for (let j = k >> 1; j > 0; j >>= 1) {
      device.queue.writeBuffer(paramBuffer, 0, new Uint32Array([j, k]));
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginComputePass();
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.dispatchWorkgroups(workgroups);
      pass.end();
      device.queue.submit([encoder.finish()]);
    }
  }
  console.log(`d1: ${performance.now() - start}`);
  const copyEncoder = device.createCommandEncoder();
  copyEncoder.copyBufferToBuffer(dataBuffer, 0, readBuffer, 0, bufferSize);
  device.queue.submit([copyEncoder.finish()]);
  console.log(`d2: ${performance.now() - start}`);
  await readBuffer.mapAsync(GPUMapMode.READ);
  const mappedResult = readBuffer.getMappedRange();
  const resultValuesAndPadding = new Float32Array(mappedResult);
  const resultIndexesAndPadding = new Uint32Array(mappedResult);
  const values = new Float32Array(length);
  const indexes = new Uint32Array(length);
  for (let i = 0; i < length; i += 1) {
    values[i] = resultValuesAndPadding[i * 2];
    indexes[i] = resultIndexesAndPadding[i * 2 + 1];
  }
  readBuffer.unmap();
  console.log(`d3: ${performance.now() - start}`);
  return { values, indexes };
}


const init_device = async () => {
  if (!navigator.gpu) throw new Error("WebGPU not supported.");
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("No suitable GPU adapter found.");
  return await adapter.requestDevice();
}



const js_to_gpu = (data, initialValues, initialIndexes) => {
  for (let i = 0; i < data.length; i += 1) {
    initialValues[i * 2] = data[i];
    initialIndexes[i * 2 + 1] = i;
  }
}


const main = async () => {
  const device = await init_device();
  let data = [];
  for (let i = 0; i < 16*256*16*16; i += 1) {
    data.push(Math.random());
  }
  if (( data.length & ( data.length - 1)) !== 0)
    throw new Error("Array length must be a power of 2.");
  const bufferSize = data.length * itemSize;
  const initialData = new ArrayBuffer(bufferSize);
  const initialValues = new Float32Array(initialData);
  const initialIndexes = new Uint32Array(initialData);
  
  js_to_gpu(data, initialValues, initialIndexes)

  const dataBuffer = device.createBuffer({
    size: bufferSize,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });
  new Uint8Array(dataBuffer.getMappedRange()).set(new Uint8Array(initialData));
  dataBuffer.unmap();


  const paramBuffer = device.createBuffer({
    size: 8, // vec2u
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });


  const shaderModule = await create_shader_module({
    device: device,
    source: "./bitonic.wgsl",
    imports: [],
    formatting: {},
  });

  const pipeline = device.createComputePipeline({
    layout: "auto",
    compute: { module: shaderModule, entryPoint: "main" },
  });
  const workgroups = Math.ceil(data.length / 256);
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: dataBuffer } },
      { binding: 1, resource: { buffer: paramBuffer } },
    ],
  });
  const readBuffer = device.createBuffer({
    size: bufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });


  console.log("input", data);
  const { values: sorted, indexes: sortedIndexes } = await bitonic_sort({
    device,
    bufferSize,
    dataBuffer,
    bindGroup,
    length: data.length,
    paramBuffer,
    pipeline,
    workgroups,
    readBuffer,
  });
  console.log(`sorted`, sorted);


  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random();
  }
  console.log("input", data);
  js_to_gpu(data, initialValues, initialIndexes)
  device.queue.writeBuffer(dataBuffer, 0, initialData);
  const { values: sorted_2, indexes: sortedIndexes_2 } = await bitonic_sort({
    device,
    bufferSize,
    dataBuffer,
    bindGroup,
    length: data.length,
    paramBuffer,
    pipeline,
    workgroups,
    readBuffer,
  });
  console.log("sorted", sorted_2);
};


main();
