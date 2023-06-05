let ok = false
try {
  AudioWorkletProcessor
  ok = true
} catch (error) {}


if (ok) {
  class Processor extends AudioWorkletProcessor {
    line = [1.0, 0.0, 0.5, 0.0]
    bpm = 120
    beats = 2
    constructor() {
      super();
      this.port.onmessage = (event) => {
          console.log(JSON.stringify(event.data))
        switch (event.data.key) {
          case "line":
              this.line = event.data.value.replaceAll(" ", "").split("").map(x => {
                return {
                  'x': 1.0,
                  '-': 0.0,
                }[x]
              })
              break;
          case "beats":
            this.beats = event.data.value
            break
          case "bpm":
            this.bpm = event.data.value
            break;
          default:
              break;
        }
      };
    }
    process(inputs, outputs, parameters) {
      const output = outputs[0];
      const out_channel = output[0];
      for (let i = 0; i < out_channel.length; i++) {
          const t = currentTime + i / sampleRate;
          const aa = this.line.length / this.beats
          const v = (t/60*this.bpm*aa) % 1
          const iu = parseInt((t/60*this.bpm*aa) % this.line.length)
          const u = this.line[iu]
          out_channel[i] = (1-v) * u
      }
      return true;
    }
  }
  registerProcessor('dcbl_beat_line', Processor);
}


const dcbl_beat_line = {
  show_config: (v) => {
    return `<p>${v.line}</p>`
  },
  setup: (v, audio_context) => {
    console.log("ee")
      v.node = new AudioWorkletNode(audio_context, 'dcbl_beat_line')
      v.node.port.postMessage({
        "key": "line",
        "value": v.line,
      });
      v.node.port.postMessage({
        "key": "bpm",
        "value": v.bpm,
      });
      v.node.port.postMessage({
        "key": "beats",
        "value": v.beats,
      });
  },
}


export {
  dcbl_beat_line,
}
