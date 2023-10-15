import { resize_square } from "./canvas.js"
import {setup_webgpu,render} from './webgpu.js'
const canvas = document.getElementById("canvas")
const zoom = 2
resize_square(canvas, 0.8, 1, zoom)
function getMousePos(e) {
  return {x:e.clientX,y:e.clientY};
}
let lastx = null
let lasty = null
let wgpu
const intensiy_max = 0.3
document.onmousemove=function(e) {
  var mousecoords = getMousePos(e);
  document.getElementById("cursor").style.top = `${parseInt(mousecoords.y)}px`
  document.getElementById("cursor").style.left = `${parseInt(mousecoords.x)}px`
  const rect = canvas.getBoundingClientRect()
  const x = parseInt(mousecoords.x - rect.left) * zoom
  const y = parseInt(mousecoords.y - rect.top) * zoom
  // if (x!=lastx || y !=lasty) {
  //   // intensiy = intensiy*intensiy_ratio
  // } else {
  //   intensiy = intensiy_max
  // }
  // intensiy = Math.min(Math.max(intensiy, 0.1), intensiy_max)
  if (
    x >= canvas.width
    || x < 0
    || y >= canvas.height
    || y < 0
    || ( x == lastx && y == lasty )
  ) {
    return
  }
  const mid = (x + y * canvas.width)
  const new_intensity = Math.min(Math.max(wgpu.mask_data[mid] + intensiy_max, 0.0), 1.0)
  wgpu.mask_data.set([new_intensity], mid)
  lastx = x
  lasty = y
};
const save = () => {
  const canvas = document.getElementById("canvas-2")
  const dim = Math.sqrt(wgpu.mask_data.length)
  canvas.width = dim
  canvas.height = dim
  const context = canvas.getContext("2d");
  const myImageData = context.createImageData(dim, dim);
  const data = myImageData.data;
  for (let i = 0; i < data.length; i+=1) {
    data[i*4] = parseInt(255.0 * wgpu.mask_data[i])
    data[i*4 + 1] = parseInt(255.0 * wgpu.mask_data[i])
    data[i*4 + 2] = parseInt(255.0 * wgpu.mask_data[i])
    data[i*4 + 3] = 255;
  }
  context.putImageData(myImageData, 0, 0);
  var link = document.getElementById('link');
  link.setAttribute('download', 'draw-save.png');
  link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  link.click();
}
const main = async () => {
  window.save = save
  window.choose_pic = choose_pic
  window.load_file = load_file
  wgpu = await setup_webgpu(canvas)
  for (let index = 0; index < 1000; index++) {
    wgpu.mask_data[parseInt(Math.random()*canvas.width*canvas.height)] = Math.random()
  }
  render(wgpu)
  // load_file_2("http://0.0.0.0/draw-2/draw-save.png")
  // load_file_2("http://localhost/draw-2/corgi_high.jpg")
}


const load_file = () => {
  load_file_2(URL.createObjectURL(document.getElementById('demo').files[0]))
}
const choose_pic = () => {
  document.querySelector("#demo").click()
}
const load_file_2 = (src) => {
  var image = new Image();
  image.src = src;
  image.onload = function() {
    const source_image = image
    source_image.crossOrigin = "anonymous";
    const canvas = document.getElementById("canvas-2")
    const dim = Math.sqrt(wgpu.mask_data.length)
    canvas.width = dim
    canvas.height = dim
    const context = canvas.getContext("2d");
    context.drawImage(source_image, 0, 0);
    const img_data =  context.getImageData(0, 0, dim, dim);
    console.log(img_data.data);
    for (let i = 0; i < dim*dim; i += 1) {
      const r = img_data.data[i*4]
      const g = img_data.data[i*4+1]
      const b = img_data.data[i*4+2]
      wgpu.mask_data[i] =  (Math.max(Math.max(r, g),b)) / (255.0);
    }
  }
}
main()
