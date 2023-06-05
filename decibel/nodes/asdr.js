let ok = false
try {
  AudioWorkletProcessor
  ok = true
} catch (error) {}


if (ok) {
  class AddProcessor extends AudioWorkletProcessor {
    last_v = 0
    start_time = 0
    go = 0.0
    process(inputs, outputs, parameters) {
      const output = outputs[0];
      const out_channel = output[0];
      for (let i = 0; i < out_channel.length; i++) {
        let v = 0
        for (let j = 0; j < inputs.length; j++) {
          const input = inputs[j];
          if (input.length) {
            const in_channel = input[0];
            v += in_channel[i]
          }
        }
        v = Math.max(-1, Math.min(1, v))
        if (v > this.last_v) {
          this.start_time = currentTime + i / sampleRate
          this.go = 1.0
        }
        this.last_v = v
        const t = currentTime + i / sampleRate - this.start_time
        out_channel[i] = Math.max(1 - t*10, 0) * this.go
        // out_channel[i] = v
      }
      return true;
    }
  }
  registerProcessor('dcbl_asdr', AddProcessor);
}


const dcbl_asdr = {
  show_config: () => {
    return ''
  },
  setup: (v, audio_context) => {
      v.node = new AudioWorkletNode(audio_context, 'dcbl_asdr')
  },
}


export {
  dcbl_asdr,
}
