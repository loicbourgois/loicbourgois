let ok = false
try {
  AudioWorkletProcessor
  ok = true
} catch (error) {}


if (ok) {
  class ConstProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const output = outputs[0];
      const out_channel = output[0];
      let v = 0.25
      for (let i = 0; i < out_channel.length; i++) {
        out_channel[i] = Math.max(-1, Math.min(1, v))
      }
      return true;
    }
  }
  registerProcessor('dcbl_const', ConstProcessor);
}


const dcbl_const = {
  show_config: () => {
    return ''
  }
}


export {
  dcbl_const,
}
