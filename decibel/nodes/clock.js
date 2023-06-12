let ok = false
try {
  AudioWorkletProcessor
  ok = true
} catch (error) {}


if (ok) {
    class ClockProcessor extends AudioWorkletProcessor {
        constructor() {
            super();
            this.port.onmessage = (event) => {
                console.log(JSON.stringify(event.data))
              switch (event.data.key) {
                case "bpm":
                    this.bpm = event.data.value
                    break;
                default:
                    break;
              }
            };
          }
          bpm = 120
        process(inputs, outputs, parameters) {
            const output = outputs[0];
            const out_channel = output[0];
            for (let i = 0; i < out_channel.length; i++) {
                const t = currentTime + i / sampleRate;
                const v = (t/60*this.bpm) % 1
                out_channel[i] = 1-v
            }
            return true;
        }
    }
    registerProcessor('dcbl_clock', ClockProcessor);
}


const dcbl_clock = {
    show_config: () => {
        return ''
    },
    setup: (v, audio_context) => {
        v.node = new AudioWorkletNode(audio_context, 'dcbl_clock')
        v.node.port.postMessage({
          "key": "bpm",
          "value": v.bpm,
        });
    }
}


export {
    dcbl_clock,
}
