import {
  resize,
} from './canvas.js'

const age_first_egg = 0.5;
const age_production_decrease = 1.5;
const production_decrease_rate = 0.2; // 20 %
const age_death = 12.0;
const space_per_chicken_out = 4; // minimum 4 m2 during at least 1/3 of their life outside
const space_per_chicken_in = 1/6; // maximum 6 chicken / m2 inside
const max_chicken_count_per_building = 3000;


let context
let sprites
let step = 0

let x = 120


const render = () => {
  step += 1
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      context.drawImage(
        sprites.dirt_grass_cube, 
        64+18*i - j * 18, 
        16+9*i + j * 9
      );
    }
  }

  // context.drawImage(sprites.dirt_grass_cube, 32, 32);
  // context.drawImage(sprites.dirt_grass_cube, 32+18, 32+9);
  // context.drawImage(sprites.dirt_grass_cube, 32+18*2, 32+9*2);
  // context.drawImage(sprites.dirt_grass_cube, 32-18, 32+9);
  // context.drawImage(sprites.dirt_grass_cube, 32, 32+9*2);

  context.drawImage(sprites.chicken, 50, 50);
  context.drawImage(sprites.chicken_2, 80, 60);
  context.drawImage(sprites.chicken_3, 40, 30);

  if (step%200 < 15) {
    context.drawImage(sprites.chicken_3, 60, 30)
  } else if (step%200 < 20) {
    context.drawImage(sprites.chicken_4, 60, 30)
  } else if (step%200 < 40) {
    context.drawImage(sprites.chicken_3, 60, 30)
  } else {
    context.drawImage(sprites.chicken_2, 60, 30)
  }
  


  const interval = 6
  const steps = 12/2
  const d = steps * interval

  if ( (step/2 % interval) == 0 ) {
    x -= 1
  } 

  if (step%d < interval) {
    context.drawImage(sprites.chicken_run_1, x, 30)
  } else if (step%d < interval * 2) {
    context.drawImage(sprites.chicken_run_2, x, 30)
  } else if (step%d < interval * 3) {
    context.drawImage(sprites.chicken_run_3, x, 30)
  } 
  else if (step%d < interval * 4) {
    context.drawImage(sprites.chicken_run_4, x, 30)
  } 
  else if (step%d < interval * 5) {
    context.drawImage(sprites.chicken_run_5, x, 30)
  }
  else if (step%d < interval * 6) {
    context.drawImage(sprites.chicken_run_6, x, 30)
  } 
  else if (step%d < interval * 7) {
    context.drawImage(sprites.chicken_run_7, x, 30)
  } 
  else if (step%d < interval * 8) {
    context.drawImage(sprites.chicken_run_8, x, 30)
  } 
  else if (step%d < interval * 9) {
    context.drawImage(sprites.chicken_run_9, x, 30)
  } 
  else if (step%d < interval * 10) {
    context.drawImage(sprites.chicken_run_10, x, 30)
  } 
  else if (step%d < interval * 11) {
    context.drawImage(sprites.chicken_run_11, x, 30)
  } 
  else if (step%d < interval * 12) {
    context.drawImage(sprites.chicken_run_12, x, 30)
  } 


  
  window.requestAnimationFrame(render)
}

window.onload = () => {
  document.querySelector("body").innerHTML = `
    <canvas id="canvas"></canvas>
  `
  const canvas = document.querySelector('#canvas')
  resize(canvas, 0.125)
  context = canvas.getContext("2d")
  context.imageSmoothingEnabled = false
  const sprites_image = new Image();
  sprites_image.onload = async () => {
    sprites = {
      dirt_grass_cube: await createImageBitmap(sprites_image, 10, 6, 36, 36),
      chicken: await createImageBitmap(sprites_image, 47, 1, 11, 11),
      chicken_2: await createImageBitmap(sprites_image, 47, 14, 11, 11),
      chicken_3: await createImageBitmap(sprites_image, 61, 1, 11, 11),
      chicken_4: await createImageBitmap(sprites_image, 61, 14, 11, 11),

      chicken_run_1: await createImageBitmap(sprites_image, 47, 14, 11, 11),
      chicken_run_2: await createImageBitmap(sprites_image, 47, 26, 11, 11),
      chicken_run_3: await createImageBitmap(sprites_image, 47, 38, 11, 11),
      chicken_run_4: await createImageBitmap(sprites_image, 47, 50, 11, 11),
      chicken_run_5: await createImageBitmap(sprites_image, 47, 62, 11, 11),
      chicken_run_6: await createImageBitmap(sprites_image, 47, 74, 11, 11),

      chicken_run_7: await createImageBitmap(sprites_image, 47, 86, 11, 11),
      chicken_run_8: await createImageBitmap(sprites_image, 47, 98, 11, 11),
      chicken_run_9: await createImageBitmap(sprites_image, 47, 110, 11, 11),
      chicken_run_10: await createImageBitmap(sprites_image, 47, 122, 11, 11),
      chicken_run_11: await createImageBitmap(sprites_image, 47, 134, 11, 11),
      chicken_run_12: await createImageBitmap(sprites_image, 47, 146, 11, 11),
    }
    render()
  }
  sprites_image.src = './sprites.png';
  // window.addEventListener("keydown", (e) => {
  //   // console.log(e.key)
  //   down_keys[e.key] = true
  // });
  // window.addEventListener("keyup", (e) => {
  //   // console.log(e.key)
  //   down_keys[e.key] = false
  // });
}
