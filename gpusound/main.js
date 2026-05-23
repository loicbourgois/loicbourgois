async function start() {
  // ---- WebAudio setup ----
  const audioCtx = new AudioContext({ sampleRate: 44100 });
  await audioCtx.audioWorklet.addModule('gpuWorkletProcessor.js');
  const gpuNode = new AudioWorkletNode(audioCtx, 'gpu-audio-processor');
  gpuNode.connect(audioCtx.destination);

  // ---- WebGPU setup ----
  if (!navigator.gpu) throw new Error("WebGPU not supported");
  const adapter = await navigator.gpu.requestAdapter();
  const device  = await adapter.requestDevice();

  const sampleRate = audioCtx.sampleRate;
  const blockSize = 2048; // samples per channel per block
  const bufferSize = blockSize * 2 * 4; // stereo float32

  const sampleBuffer = device.createBuffer({
    size: bufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_READ
  });

  const paramBuffer = device.createBuffer({
    size: 8,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const shaderModule = device.createShaderModule({ code: await (await fetch('shader.wgsl')).text() });
  const pipeline = device.createComputePipeline({
    layout: "auto",
    compute: { module: shaderModule, entryPoint: "main" }
  });

  const bindGroup = (timeOffset) => device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: sampleBuffer } },
      { binding: 1, resource: { buffer: paramBuffer } }
    ]
  });

  // playback loop: render → map → send to audio thread
  let timeOffset = 0;
  const renderBlock = async () => {
    // Update uniforms (time offset, sample rate)
    const paramData = new Float32Array([timeOffset, sampleRate]);
    device.queue.writeBuffer(paramBuffer, 0, paramData.buffer, 0, 8);

    const enc = device.createCommandEncoder();
    const pass = enc.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup(timeOffset));
    pass.dispatchWorkgroups(Math.ceil(blockSize / 64));
    pass.end();
    device.queue.submit([enc.finish()]);

    await sampleBuffer.mapAsync(GPUMapMode.READ);
    const copy = sampleBuffer.getMappedRange();
    const samples = new Float32Array(copy.slice(0));
    sampleBuffer.unmap();

    // Post to AudioWorklet
    gpuNode.port.postMessage({ type: "block", samples });

    // Advance time offset for next block
    timeOffset += blockSize / sampleRate;

    // Schedule next render right away (non‑blocking)
    renderBlock();
  };

  // Kick off the loop
  renderBlock();
}

document.getElementById("start").onclick = async () => {
  await start();
};