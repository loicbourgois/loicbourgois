let ok = false
try {
  AudioWorkletProcessor
  ok = true
} catch (error) {}


if (ok) {
  class AddProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const output = outputs[0];
      const out_channel = output[0];
      let v = 0
      for (let i = 0; i < out_channel.length; i++) {
        v = 0
        for (let j = 0; j < inputs.length; j++) {
          const input = inputs[j];
          const in_channel = input[0];
          v += in_channel[i]
        }
        out_channel[i] = Math.max(-1, Math.min(1, v))
      }
      return true;
    }
  }
  registerProcessor('dcbl_add', AddProcessor);
}


const dcbl_add = {
  show_config: () => {
    return ''
  }
}


export {
  dcbl_add,
}
