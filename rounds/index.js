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
    const ouia = 128
    if (i>0) {
      baseColors.push(
        [
          baseColors[i-1][0] + getRandomInt(0, ouia),
          baseColors[i-1][1] + getRandomInt(0, ouia),
          baseColors[i-1][2] + getRandomInt(0, ouia)
        ]
      );
    }
    let max = Math.max(Math.max(baseColors[i][0], baseColors[i][1]), baseColors[i][2]);
    baseColors[i][0] = baseColors[i][0] / max * 200;
    baseColors[i][1] = baseColors[i][1] / max * 200;
    baseColors[i][2] = baseColors[i][2] / max * 200;
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
const dim = Math.min(window.innerWidth, window.innerHeight)
const div = parseInt(dim*0.85/13)
const dividers = [div, div, div]

document.body.style.background = '#111'
resize_square(canvas, 0.85, dividers[0], 1)
const image_data = context.getImageData(0, 0, canvas.width, canvas.height)
const data = image_data.data


const shuffle = (array) => {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

var arr = [2, 11, 37, 42];
shuffle(arr);

const rs = 0.003;
const pxs = 700
const circles_c_max = 4000
const multi = 7.5
const rounds = 20
const recursion_limit = 2000

const add_circle = (cx,cy,recursion) => {
  if (
    circles.length > circles_c_max
    || Math.abs(cx) > 0.95
    || Math.abs(cy) > 0.95
    || recursion > recursion_limit
  ) {
    return
  }

  let neighbours = 0
  for (let i = 0; i < circles.length; i++) {
    const circle = circles[i];
    const dx = circle[0] - cx
    const dy = circle[1] - cy
    if ( Math.abs( (dx*dx + dy*dy) - (rs*rs*4) ) < rs*rs*multi ) {
      neighbours += 1
    }
  }
  if (neighbours > 1) {
    return
  }
  // console.log(neighbours)

  circles.push([cx,cy])
  const r = rs*canvas.height
  const c = [
    255,
    255,
    255,
    255,
  ]
  const center = {
    x: canvas.height/2 * (1.0 + cx),
    y: canvas.width/2 * (1.0 + cy),
  }
  for (let _ = 0; _ < pxs; _+=1) {
    const x = parseInt (center.x + ( (Math.random() - 0.5) * r ) )
    const y = parseInt (center.y + ( (Math.random() - 0.5) * r ) )
    const dx = x-center.x
    const dy = y-center.y
    if ( dx*dx + dy*dy > (r/2)*(r/2) ) {
      continue
    }
    if (x > 0 && x < canvas.width && y > 0 && y < canvas.height) {
      const i = ( x + y * canvas.width ) * 4
      data[i] = c[0]
      data[i + 1] = c[1]
      data[i + 2] = c[2]
      data[i + 3] = c[3]
    }
  }
  let ctop = [cx,cy+rs*2.0]
  let ll = shuffle([0,1,2,3,4,5])
  for (let a = 0; a < rounds; a++) {
    let p = rotate( ctop, [cx,cy], Math.random() )
    add_circle(p[0], p[1], recursion+1)
  }
}


const rotate = (p1, p2, angle) => {
  // Rotates p1 around p2
  // with angle in range [0.0;1.0].
  let dx = p1[0] - p2[0];
  let dy = p1[1] - p2[1];
  const angle_rad = angle * Math.PI * 2.0
  let cos_ = Math.cos(angle_rad);
  let sin_ = Math.sin(angle_rad);
  return [
    p2[0] + dx * cos_ - dy * sin_,
    p2[1] + dy * cos_ + dx * sin_,
  ]
}


const draw = () => {
  context.putImageData(image_data, 0, 0);
  window.requestAnimationFrame(draw)
}
draw()


const circles = []
// add_circle(Math.random()-0.5, Math.random()-0.5)

for (let index = 0; index < 30; index++) {
  // const element = array[index];
  // add_circle(0.0,0.0,0)
  add_circle(Math.random()-0.5,Math.random()-0.5,0)
  
}

// add_circle(0.0, 0.2)