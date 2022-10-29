console.log("plouf")


const age_first_egg = 0.5;
const age_production_decrease = 1.5;
const production_decrease_rate = 0.2; // 20 %
const age_death = 12.0;
const space_per_chicken_out = 4; // minimum 4 m2 during at least 1/3 of their life outside
const space_per_chicken_in = 1/6; // maximum 6 chicken / m2 inside
const max_chicken_count_per_building = 3000;

document.querySelector("body").innerHTML = `
  <canvas id="canvas"></canvas>
`
