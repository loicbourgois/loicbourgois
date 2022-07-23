const audio_context = new (window.AudioContext || window.webkitAudioContext)();

const gain_1 = audio_context.createGain();
const osc_1 = audio_context.createOscillator();
osc_1.type = 'sin';
osc_1.start();
osc_1.connect(gain_1);
gain_1.connect(audio_context.destination);


const osc_2 = audio_context.createOscillator();
const gain_2 = audio_context.createGain();
osc_2.type = 'sin';
osc_2.start();
osc_2.connect(gain_2)
gain_2.connect(osc_1.detune)


const osc_3 = audio_context.createOscillator();
const gain_3 = audio_context.createGain();
osc_3.type = 'sin';
osc_3.start();
osc_3.connect(gain_3)
gain_3.connect(osc_2.detune)


const osc_4 = audio_context.createOscillator();
const gain_4 = audio_context.createGain();
osc_4.type = 'sin';
osc_4.start();
osc_4.connect(gain_4)
gain_4.connect(osc_3.detune)


const osc_5 = audio_context.createOscillator();
const gain_5 = audio_context.createGain();
osc_5.type = 'sin';
osc_5.start();
osc_5.connect(gain_5)
gain_5.connect(osc_4.detune)



const osc_6 = audio_context.createOscillator();
const gain_6 = audio_context.createGain();
osc_6.type = 'sin';
osc_6.start();
osc_6.connect(gain_6)
gain_6.connect(gain_3.gain)


const osc_7 = audio_context.createOscillator();
const gain_7 = audio_context.createGain();
osc_7.type = 'sin';
osc_7.start();
osc_7.connect(gain_7)
gain_7.connect(gain_6.gain)


const sliders_update = {
  'slider_0': (v) => {
    gain_1.gain.setValueAtTime(v, audio_context.currentTime)
  },
  'slider_1': (v) => {
    osc_1.frequency.setValueAtTime(55*v, audio_context.currentTime);
  },
  'slider_2': (v) => {
    osc_2.frequency.setValueAtTime(100.0*v, audio_context.currentTime);
  },
  'slider_3': (v) => {
    gain_2.gain.setValueAtTime(v*10000, audio_context.currentTime)
  },
  'slider_4': (v) => {
    osc_3.frequency.setValueAtTime(100.0*v, audio_context.currentTime);
  },
  'slider_5': (v) => {
    gain_3.gain.setValueAtTime(v*10000, audio_context.currentTime)
  },

  'slider_6': (v) => {
    osc_4.frequency.setValueAtTime(10.0*v, audio_context.currentTime);
  },
  'slider_7': (v) => {
    gain_4.gain.setValueAtTime(v*10000, audio_context.currentTime)
  },

  'slider_8': (v) => {
    osc_5.frequency.setValueAtTime(100.0*v, audio_context.currentTime);
  },
  'slider_9': (v) => {
    gain_5.gain.setValueAtTime(v*10000, audio_context.currentTime)
  },

  'slider_10': (v) => {
    osc_6.frequency.setValueAtTime(10.0*v, audio_context.currentTime);
  },
  'slider_11': (v) => {
    gain_6.gain.setValueAtTime(v*10000, audio_context.currentTime)
  },
  'slider_12': (v) => {
    osc_7.frequency.setValueAtTime(1.0*v, audio_context.currentTime);
  },
  'slider_13': (v) => {
    gain_7.gain.setValueAtTime(v*10000, audio_context.currentTime)
  },
}


const sliders = document.getElementById("sliders")
sliders.innerHTML = "";
const count = 20;
for (var i = 0; i < count; i++) {
  const id = `slider_${i}`;
  const value = localStorage.getItem(id) ? localStorage.getItem(id) : 100;
  sliders.innerHTML += `<input type="range" min="0" max="10000" value="${value}" class="slider" id="${id}">`;
}
for (var i = 0; i < count; i++) {
  const id = `slider_${i}`
  const slider = document.getElementById(id)
  slider.addEventListener('input', (e) => {
    if (sliders_update[e.target.id]) {
      const min = parseInt(e.target.min)
      const max = parseInt(e.target.max)
      const v = (e.target.valueAsNumber - min) /  (max-min)
      sliders_update[e.target.id](v)
    }
    localStorage.setItem(e.target.id, e.target.valueAsNumber)
  });
  let event = new Event("input", {
    bubbles: true
  });
  slider.dispatchEvent(event);
}


const event = new Event("input", {
  bubbles: true
});
const event_input = new Event("input", {
  bubbles: true
});


const setup_slider = (slider_id, f_update) => {
  const slider = document.getElementById(slider_id)
  slider.addEventListener('input', (e) => {
    const min = parseInt(e.target.min)
    const max = parseInt(e.target.max)
    const v = (e.target.valueAsNumber - min) /  (max-min)
    f_update(v)
    localStorage.setItem(e.target.id, e.target.valueAsNumber)
  });
  slider.dispatchEvent(event_input);
}


const oscs_master_div = document.getElementById("oscs_master")
oscs_master_div.innerHTML = "";
const oscs_master = {
  gain: audio_context.createGain(),
}
for (let id of ["oscs_master.gain", "oscs_master.frequency"]) {
  const value = localStorage.getItem(id) ? localStorage.getItem(id) : 100;
  oscs_master_div.innerHTML += `<input type="range" min="0" max="10000" value="${value}" class="slider" id="${id}">`
}






const osc_master_frequency_slider = document.getElementById("oscs_master.frequency")
const osc_master_frequency = () => {
  const target = osc_master_frequency_slider;
  const min = parseInt(target.min)
  const max = parseInt(target.max)
  const v = (target.valueAsNumber - min) /  (max-min)
  return 1+v
}

const new_slider = (id, class_) => {
  const value = localStorage.getItem(id) ? localStorage.getItem(id) : 100;
  return `<input title="${id}" class="slider ${class_?class_:''}" type="range" min="0" max="10000" value="${value}" id="${id}">`
}


const blocks = {}
const oscs_div = document.getElementById("oscs")
oscs_div.innerHTML = "";
const alphabet = ['a','z','e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
for (let l of alphabet) {
  const id_osc = `${l}.osc`;
  const id_gain = `${l}.out`;
  const id_level = `${l}.level`;
  const value_osc = localStorage.getItem(id_osc) ? localStorage.getItem(id_osc) : 100;
  const value_gain = localStorage.getItem(id_gain) ? localStorage.getItem(id_gain) : 100;
  const value_level = localStorage.getItem(id_level) ? localStorage.getItem(id_level) : 100;
  let aaa =  `<div class="osc">

  `
  for (let ll of alphabet) {
    const id = `${ll}.gain.${l}`;
    let disabled = l <= ll ? 'disabled' : '';
    const v = localStorage.getItem(id) ? localStorage.getItem(id) : 100;
    aaa += `<div class="slider_wrapper ${disabled}"><input ${disabled} type="range" min="0" max="10000" value="${v}" class="slider" id="${id}"></div>`
  }
  aaa += `
    ${new_slider(l+".attack")}
    ${new_slider(l+".release")}
    <div class="slider_wrapper "><input type="range" min="0" max="10000" value="${value_osc}" class="slider" id="${id_osc}"></div>
    ${new_slider(l+".level", "level")}
    <label id="label_${l}">${l}</label>
  </div>`;
  oscs_div.innerHTML += aaa
  blocks[l] = {
    osc: audio_context.createOscillator(),
    gain: {},
    out: audio_context.createGain(),
    level: audio_context.createGain(),
  }
  for (let ll of alphabet) {
    blocks[l].gain[ll] = audio_context.createGain()
    blocks[l].osc.connect(blocks[l].gain[ll])
  }
  blocks[l].osc.type = 'sin';
  blocks[l].osc.connect(blocks[l].out)
}


setup_slider("oscs_master.frequency", (v) => {
  for (let l of alphabet) {
    blocks[l].osc.detune.setValueAtTime(2400.0 * v-1200, audio_context.currentTime);
  }
})



for (let l of alphabet) {
  setup_slider(`${l}.osc`, (v)=>{
    const vv = (Math.exp(v)-1)/(Math.exp(1)-1) * 1000.0
    blocks[l].osc.frequency.setValueAtTime(vv, audio_context.currentTime);
  })
  blocks[l].out.gain.setValueAtTime(0, audio_context.currentTime)

  setup_slider(`${l}.attack`, (v)=>{
    blocks[l].attack =  (Math.exp(v)-1)/(Math.exp(1)-1) *0.1 ;
  })
  setup_slider(`${l}.release`, (v)=>{
    blocks[l].release = (Math.exp(v)-1)/(Math.exp(1)-1) *0.1;
  })

  blocks[l].level.gain.setValueAtTime(0, audio_context.currentTime)
  setup_slider(`${l}.level`, (v)=>{
    let vv = (Math.exp(v)-1)/(Math.exp(1)-1)
    blocks[l].level.gain.setTargetAtTime(vv, audio_context.currentTime, 0.1)
    //console.log(v)
  })

  for (let ll of alphabet) {
    blocks[l].gain[ll].gain.setValueAtTime(0, audio_context.currentTime)
    setup_slider(`${l}.gain.${ll}`, (v)=>{
      blocks[l].gain[ll].gain.setValueAtTime(v*1000, audio_context.currentTime)
    })
  }

  blocks[l].level.connect(oscs_master.gain);
  blocks[l].out.connect(blocks[l].level);
}


for (let l of alphabet) {
  for (let ll of alphabet) {
    if (l < ll) {
      blocks[l].gain[ll].connect(blocks[ll].osc.detune)
    }
  }
  blocks[l].osc.start()
}

oscs_master.gain.gain.setValueAtTime(0.0, audio_context.currentTime)
oscs_master.gain.connect(audio_context.destination);
setup_slider("oscs_master.gain", (v) => {
  oscs_master.gain.gain.setTargetAtTime(v*1.0, audio_context.currentTime, 0.1)
})


const key_pressed = {}
window.addEventListener("keydown", (e) => {
  key_pressed[e.key] = true
  if (blocks[e.key]) {
    blocks[e.key].out.gain.setTargetAtTime(1.0, audio_context.currentTime, blocks[e.key].attack)
  } else if (blocks[e.key.toLowerCase()]) {
    blocks[e.key.toLowerCase()].out.gain.setTargetAtTime(1.0, audio_context.currentTime, 0.1)
  }
});
window.addEventListener("keyup", (e) => {
  key_pressed[e.key] = false
  if (blocks[e.key]) {
    blocks[e.key].out.gain.setTargetAtTime(0.0, audio_context.currentTime, blocks[e.key].release)
  }
});
