class GPUAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.bufferPos = 0;
    this.port.onmessage = (e) => {
      if (e.data.type === "block") {
        this.buffer.push(e.data.samples);
      }
    };
  }

  process(inputs, outputs) {
    const outputL = outputs[0][0];
    const outputR = outputs[0][1];
    for (let i=0; i<outputL.length; ++i) {
      if (this.buffer.length === 0) {
        // silence if no data
        outputL[i] = 0; 
        outputR[i] = 0;
      } else {
        const blk = this.buffer[0];
        outputL[i] = blk[this.bufferPos];
        outputR[i] = blk[this.bufferPos+1];
        this.bufferPos += 2;
        if (this.bufferPos >= blk.length) {
          this.buffer.shift();
          this.bufferPos = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor('gpu-audio-processor', GPUAudioProcessor);