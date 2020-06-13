const DISCRETE = 'discrete'
const CONTINUOUS = 'continuous'

let dna = {
  head_diameter: 0.5,
  eye_to_head_ratio: 0.5,
  eyes_spacing: 0.75,
  pupil_to_eye_ratio: 0.5,
  tentacles_count: 0.5,
  tentacles_length_ratio: 0.2,
  red: 0.95,
  green: 0.75,
  blue: 0.09,
  alpha: 0.75,
  mouth_to_head_ratio: 0.5
}

const dna_rules = {
  head_diameter: {
    label: 'Head diameter',
    min: 200,
    max: 500,
  },
  eye_to_head_ratio: {
    label: 'Eyes diameter ratio',
    min: 0.1,
    max: 0.8,
  },
  eyes_spacing: {
    label: 'Eyes spacing',
    min: 0,
    max: 0.9,
  },
  pupil_to_eye_ratio: {
    label: 'Eyes spacing',
    min: 0.1,
    max: 0.9,
  },
  tentacles_count: {
    label: 'Tentacles count',
    min: 0,
    max: 10,
  },
  tentacles_length_ratio: {
    label: 'Tentacles length ratio',
    min: 1,
    max: 4,
  },
  red: {
    label: 'Red',
    min: 0,
    max: 255,
  },
  green: {
    label: 'Green',
    min: 0,
    max: 255,
  },
  blue: {
    label: 'Blue',
    min: 0,
    max: 255,
  },
  alpha: {
    label: 'Alpha',
    min: 0,
    max: 255,
  },
  mouth_to_head_ratio: {
    label: 'Mouth size',
    min: 0,
    max: 0.45,
  },
}


const nucleobases_per_line = Math.round(Math.sqrt(dna.length));
const dna_div = document.getElementById('dna');

const nucleobase_controllers = {}

let mousedown_x = 0;
let mousedown_y = 0;
let mousedown_controller = null;
const update_nucleobase_value_ratio = 0.005;

const set_nucleobase = (nucleobase, value) => {
  dna[nucleobase] = Math.max(0.0, Math.min(1.0, value))
}

for (const nucleobase in dna) {
  nucleobase_controllers[nucleobase] = document.createElement('div');

  const nucleobase_controller = nucleobase_controllers[nucleobase];
  nucleobase_controller.classList.add('nucleobase_controller');
  nucleobase_controller.nucleobase = nucleobase;

  nucleobase_controller.start_update = (pageX, pageY) => {
    nucleobase_controller.start_pageX = pageX
    nucleobase_controller.start_pageY = pageY
    nucleobase_controller.start_update_value = dna[nucleobase]
  }
  nucleobase_controller.update = (pageY) => {
    dy = nucleobase_controller.start_pageY - pageY;
    nucleobase_controller.set(nucleobase_controller.start_update_value + dy * update_nucleobase_value_ratio)
  }
  nucleobase_controller.set = (value) => {
    set_nucleobase(nucleobase, value)
    nucleobase_controller.value_div.update()
  }
  nucleobase_controller.get = () => {
    return dna[nucleobase]
  }

  nucleobase_controller.addEventListener('mousedown', e => {
    nucleobase_controller.start_update(e.pageX, e.pageY)
    mousedown_x = e.pageX;
    mousedown_y = e.pageY;
    mousedown_controller = nucleobase_controller;
  });

  dna_div.appendChild(nucleobase_controller);

  nucleobase_controller.value_div = document.createElement('div');
  const nucleobase_value_div = nucleobase_controller.value_div;
  nucleobase_value_div.classList.add('nucleobase_value_div');
  nucleobase_value_div.setAttribute('nucleobase', nucleobase);
  nucleobase_controller.appendChild(nucleobase_value_div);

  nucleobase_controller.value_div.update = () => {
    nucleobase_controller.value_div.style.width = nucleobase_controller.offsetWidth * dna[nucleobase_controller.nucleobase] + 'px';
    nucleobase_controller.value_div.style.height = nucleobase_controller.offsetHeight * dna[nucleobase_controller.nucleobase] + 'px';
  }

  nucleobase_controller.value_div.update()
}


window.addEventListener('mousemove', e => {
  if (mousedown_controller != null) {
    mousedown_controller.update(e.pageY)
  }
});

window.addEventListener('mouseup', e => {
  mousedown_controller = null;
  console.log(dna)
});



const canvas = document.getElementById('canvas');
canvas.width = window.innerHeight;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');

const get_phenotype = (nucleobase) => {
  return dna[nucleobase] * (dna_rules[nucleobase].max - dna_rules[nucleobase].min) + dna_rules[nucleobase].min
}

const draw_round = (center_x, center_y, radius, fill_color) => {
  context.beginPath();
  context.arc(center_x, center_y, radius, 0, 2 * Math.PI);
  context.fillStyle = fill_color;
  context.fill();
  // context.strokeStyle = 'rgba(0, 0, 0, 1.0)';
  // context.stroke();
}

let speed = 0.01
new_controller(
  'controllers',
  () => {
    return speed * 5.0
  },
  (value) => {
    speed = Math.max(0, Math.min(1, value)) * 0.2
  }
);

const step = (timestamp) => {
  for (const nucleobase in nucleobase_controllers) {
    nucleobase_controller = nucleobase_controllers[nucleobase]
    nucleobase_controller.set(dna[nucleobase] + Math.random() * speed - speed * 0.5)
  }

  context.fillStyle = 'rgba(0, 0, 0, 0.1)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const r = get_phenotype('red')
  const g = get_phenotype('green')
  const b = get_phenotype('blue')
  const a = get_phenotype('alpha') / 255.0
  const fill_color = `rgba(${r}, ${g}, ${b}, ${a})`
  const white = `rgba(255, 255, 255, 1)`
  const black = `rgba(0, 0, 0, 1)`
  const grey = `rgba(32, 32, 32, 1)`

  const head_center_x = canvas.width * 0.5
  const head_center_y = canvas.height * 0.5
  const head_radius = get_phenotype('head_diameter') * 0.5
  draw_round(head_center_x, head_center_y, head_radius, fill_color)

  const mouth_y = head_center_y + head_radius * 0.5
  const mouth_spacing = head_radius * 0.1
  const mouth_count = 1
  const mouth_radius = head_radius * get_phenotype('mouth_to_head_ratio')
  const mouth_radius_inner = mouth_radius * 0.8
  for (let i = 0 ; i < mouth_count ; i+=1) {
    mouth_x_delta = mouth_spacing * i;
    draw_round(head_center_x + mouth_x_delta, mouth_y, mouth_radius, black)
    draw_round(head_center_x - mouth_x_delta, mouth_y, mouth_radius, black)
  }
  for (let i = 0 ; i < mouth_count ; i+=1) {
    mouth_x_delta = mouth_spacing * i;
    draw_round(head_center_x + mouth_x_delta, mouth_y, mouth_radius_inner, black)
    draw_round(head_center_x - mouth_x_delta, mouth_y, mouth_radius_inner, black)
  }

  const eye_y = head_center_y - head_radius * 0.5
  const eye_radius = head_radius * get_phenotype('eye_to_head_ratio')
  const eye_x_delta = head_radius * get_phenotype('eyes_spacing')
  const pupil_radius = eye_radius * get_phenotype('pupil_to_eye_ratio')
  draw_round(head_center_x + eye_x_delta, eye_y, eye_radius, white)
  draw_round(head_center_x - eye_x_delta, eye_y, eye_radius, white)
  draw_round(head_center_x + eye_x_delta, eye_y, pupil_radius, black)
  draw_round(head_center_x - eye_x_delta, eye_y, pupil_radius, black)





  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
