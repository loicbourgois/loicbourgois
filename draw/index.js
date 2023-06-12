import { resize_square } from "./canvas.js"

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  let r = Math.floor(Math.random() * (max - min + 1)) + min;
  return r;
}


const get_base_colors = (count) => {
  let baseColors = [];
  baseColors.push(
    [
      getRandomInt(64, 255),
      getRandomInt(64, 255),
      getRandomInt(64, 255)
    ]
  );
  for (let i = 0 ; i < count ; i++) {
    if (i>0) {
      baseColors.push(
        [
          baseColors[i-1][0] + getRandomInt(0, 64),
          baseColors[i-1][1] + getRandomInt(0, 64),
          baseColors[i-1][2] + getRandomInt(0, 64)
        ]
      );
    }
    let max = Math.max(Math.max(baseColors[i][0], baseColors[i][1]), baseColors[i][2]);
    baseColors[i][0] = baseColors[i][0] / max * 255;
    baseColors[i][1] = baseColors[i][1] / max * 255;
    baseColors[i][2] = baseColors[i][2] / max * 255;
  }
  return baseColors
}


function getColors (count, base_count) {
  let colors = [];
  const baseColors = get_base_colors(base_count)
  for (let i = 0 ; i < count+2 ; i ++) {
    let ii = Math.max(0, Math.floor((i-1)/base_count));
    ii = i % base_count;
    colors.push([
      Math.floor(i * baseColors[ii][0] / count), 
      Math.floor(i * baseColors[ii][1] / count), 
      Math.floor(i * baseColors[ii][2] / count), 
      255
    ]);
  }
  return colors;
}


const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")
context.imageSmoothingEnabled= false
context.mozImageSmoothingEnabled = false;
// const dividers = [64, 64, 64]
const noise_ratio = 2;
const speed_ratio = 0.0125;
// const dividers = [100, 50, 50, 50]
// const dividers = [128, 32, 32, 32, 32]
// const dividers = [64, 8, 1]
// const dividers = [64, 64, 64, 1, 1, 1]
// const dividers = [64, 1, 64, 64, 64]
// const dividers = [64, 8, 64, 2, 64, 1]
// const dividers = [64, 64, 64, 8, 2, 1]
// const dividers = [100, 100, 100, 20, 4, 1]
const dividers = [90, 90, 90, 90/5, 5, 1]

// const dividers = [
//   64,
//   2
// ]
// for (let index = 0; index < getRandomInt(6, 6); index++) {
//   dividers.push(Math.pow(2, getRandomInt(1, 6)))
//   dividers.push(64)
//   // dividers.push(1)

// }

document.body.style.background = '#111'
resize_square(canvas, 0.9, dividers[0], 1)
const image_data = context.getImageData(0, 0, canvas.width, canvas.height)
const data = image_data.data
const fill_data = () => {
  const colors = getColors(dividers.length-1, 2)
  const data_ = new Uint8ClampedArray(data.length)
  const levels = []
  for (let i = 0; i < dividers.length; i++) { 
    levels.push(new Float32Array(canvas.width/dividers[i]*canvas.width/dividers[i]))
    for (let j = 0; j < levels[i].length; j++) {
      levels[i][j] = Math.random()
    }
  }
  for (let i = 0; i < data_.length; i += 4) {
    const x = (i/4) % canvas.width
    const y = (i/4) / canvas.width
    let cid = 1
    for (let j = 0; j < levels.length; j++) { 
      const dim = canvas.width  / dividers[j]
      let kx = parseInt(x/dividers[j]) % (dim/1)
      if (kx >= dim/2 ) {
        kx = dim - kx - 1
      }
      const ky = parseInt(y/dividers[j]) % (dim/1)
      const k = parseInt(kx * dim) + ky
      cid += levels[j][k]
    }
    if (
      x < dividers[0] 
      || x > canvas.width - dividers[0] - 1
      || y < dividers[0] 
      ||  y > canvas.width - dividers[0] - 1
    ) {
      cid = 200
    } 
    // cid = parseInt(cid)
    cid *= 1.0
    cid = parseInt(Math.min(cid, colors.length-1))
    const c = colors[cid]
    data_[i] = c[0]
    data_[i + 1] = c[1]
    data_[i + 2] = c[2]
    data_[i + 3] = c[3]
  }
  return data_
}

let data_0 =  fill_data()
let data_1 =  fill_data()
let data_2 =  fill_data()
for (let i = 0; i < image_data.data.length; i+=4) {
  // data[i + 0] = 16
  // data[i + 1] = 16
  // data[i + 2] = 16
  // data[i + 3] = 255
  data[i + 0] = data_0[i + 0]
  data[i + 1] = data_0[i + 1]
  data[i + 2] = data_0[i + 2]
  data[i + 3] = data_0[i + 3]
}
context.putImageData(image_data, 0, 0);


const draw = () => {
  const speed = image_data.data.length*speed_ratio
  const noise = noise_ratio*speed
  for (let index = 0; index < noise; index++) {
    const x = parseInt(Math.random() * canvas.width)
    let y = parseInt(Math.random() * canvas.height)
    // if (y < dividers[0] +1) {
    //   y = y + canvas.width - 2*dividers[0]
    // }
    if (
      x < dividers[0] 
      || x > canvas.width - dividers[0] - 1
      || y < dividers[0] +1
      ||  y > canvas.width - dividers[0] -3 
    ) {
      continue
    } 
    let x2 = x
    let y2 = y
    // if (y2 == dividers[0]) {
    //   y2 += canvas.width - dividers[0]*2-2
    // }
    
    const uu = getRandomInt(0, 3)
    if (uu == 0 && x > canvas.width * 0.5) {
      x2 = (x2 - 1 + canvas.width) % canvas.width
    }
    if (uu == 1 && x < canvas.width * 0.5 ) {
      x2 = (x2 + 1 + canvas.width) % canvas.width
    }
    if (uu == 2) {
      y2 = (y2 - 1 + canvas.height) % canvas.height
    }
    if (uu == 3) {
      y2 = (y2 + 1 + canvas.height) % canvas.height
    }
    const i1 = (y * canvas.width + x)*4
    const i2 = (y2 * canvas.width + x2)*4
    data[i1] = data[i2]
    data[i1+1] = data[i2+1]
    data[i1+2] = data[i2+2]
  }
  for (let index = 0; index < speed; index++) {
    // const xr = 0.5 + Math.random() * ( ( performance.now() - last_update ) / update_period * 4 )  * {
    //     0: 0.5,
    //     1: -0.5
    //   }[getRandomInt(0,1)]
    const xr = Math.random()
    const yr = Math.random()
    // const yr =  1.0-Math.pow(Math.random(),4)   
    // const xr = 0.5 + Math.pow(Math.random(), 1.125) * {
    //   0: 0.5,
    //   1: -0.5
    // }[getRandomInt(0,1)]
    const x = parseInt( xr * canvas.width  )
    const y = parseInt( yr * canvas.height)
    const i1 = (y * canvas.width + x)*4
    const oug = update_period/1000
    for (let ai = 0; ai < 3; ai++) {

      data[i1+ai] = (data_1[i1+ai] + data[i1+ai]*oug) / (oug+1)
    }
    
  }
  context.putImageData(image_data, 0, 0);
  window.requestAnimationFrame(draw)
}

let last_update = performance.now()
let update_period = 10000
const update = () => {
  last_update = performance.now()
  data_1 = new Uint8ClampedArray(data_2)
  data_2 = fill_data()
  setTimeout(update, update_period)
}


update()
draw()
