import { resize_square } from "./canvas.js"

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  let r = Math.floor(Math.random() * (max - min + 1)) + min;
  return r;
}


const get_base_colors = (count) => {
  let baseColors = [];
  for (let i = 0 ; i < count ; i++) {
    baseColors.push(
      [
        getRandomInt(0, 255),
        getRandomInt(0, 255),
        getRandomInt(0, 255)
      ]
    );
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
  for (let i = 0 ; i < count+1 ; i ++) {
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


function getColors2 (count) {
  let colors = [];
  for (let i = 0 ; i < count+1 ; i ++) {
    colors.push(getColors(count)[i])
  }
  return colors;
}


const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")
context.imageSmoothingEnabled= false
context.mozImageSmoothingEnabled = false;



const dividers = [80,  10, 1]


// const dividers = [64]

const oi = 1
const colors = getColors(dividers.length*(oi), 2)
const bobu = 1
document.body.style.background = `rgb(${colors[bobu][0]/3}, ${colors[bobu][1]/3}, ${colors[bobu][2]/3})`

resize_square(canvas, 0.9, dividers[0], 2)

const image_data = context.getImageData(0, 0, canvas.width, canvas.height)
const data = image_data.data
const data_2 = new Uint8ClampedArray(data.length)


const levels = []
for (let i = 0; i < dividers.length; i++) { 
  levels.push(new Uint8ClampedArray(canvas.width/dividers[i]*canvas.width/dividers[i]))
  for (let j = 0; j < levels[i].length; j++) {
    levels[i][j] = Math.random() * oi
  }
}


for (let i = 0; i < image_data.data.length; i += 4) {
  const x = (i/4) % canvas.width
  const y = (i/4) / canvas.width
  let cid = 0
  for (let j = 0; j < levels.length; j++) { 
    const dim = canvas.width  / dividers[j]
    let kx = parseInt(x/dividers[j]) % (dim/1)
    if (kx >= dim/2 
      // && j == 0
    ) {
      kx = dim - kx - 1
    }
    const ky = parseInt(y/dividers[j]) % (dim/1)
    const k = parseInt(kx * dim) + ky
    if (levels[j][k] ) {
      cid += levels[j][k] 
    } else {
      // break
    }
  }
  const xf = x / canvas.width
  // const y = (i/4) / canvas.width
  const yf = y / canvas.width
  const border = 0.4;
  if (
    Math.abs(1.0 - xf*2) < border && Math.abs(1.0 - yf*2) < border
  ) {
    cid = cid / 2
  }
  cid = parseInt(cid)
  const c = colors[cid]
  if (!c) {
    console.log(cid)
  }
  data[i] = c[0]
  data[i + 1] = c[1]
  data[i + 2] = c[2]
  data[i + 3] = c[3]
  data_2[i] = c[0]
  data_2[i + 1] = c[1]
  data_2[i + 2] = c[2]
  data_2[i + 3] = c[3]
}
context.putImageData(image_data, 0, 0);


const draw = () => {
  const aaa = 100000*0
  for (let index = 0; index < aaa; index++) {
    const x = parseInt(Math.random() * canvas.width)
    const y = parseInt(Math.random() * canvas.height)
    let x2 = x;
    let y2 = y;
    const uu = getRandomInt(0, 3)
    if (uu == 0) {
      x2 = (x2 - 1 + canvas.width) % canvas.width
    }
    if (uu == 1) {
      x2 = (x2 + 1 + canvas.width) % canvas.width
    }
    // if (uu == 2) {
    //   y2 = (y2 - 1 + canvas.height) % canvas.height
    // }
    if (uu == 3) {
      y2 = (y2 + 1 + canvas.height) % canvas.height
    }
    const i1 = (y * canvas.width + x)*4
    const i2 = (y2 * canvas.width + x2)*4
    // const rgb = [
    //   data[i1],
    //   data[i1 + 1],
    //   data[i1 + 2],
    // ]
    data[i1] = data[i2]
    data[i1+1] = data[i2+1]
    data[i1+2] = data[i2+2]

    // data[i1] = Math.max(data[i1], data[i2])
    // data[i1+1] =Math.max(data[i1+1], data[i2+1])
    // data[i1+2] = Math.max(data[i1+2], data[i2+2])
  }
  for (let index = 0; index < aaa*0.25; index++) {
    const x = parseInt(Math.random() * canvas.width)
    const y = parseInt(Math.random() * canvas.height)
    const i1 = (y * canvas.width + x)*4
    data[i1] = data_2[i1]
    data[i1+1] = data_2[i1+1]
    data[i1+2] = data_2[i1+2]
  }
  context.putImageData(image_data, 0, 0);
  window.requestAnimationFrame(draw)
}
draw()