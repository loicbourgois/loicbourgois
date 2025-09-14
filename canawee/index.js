let canvas
let context
let sprites
let step = 0
let x = 0
let y = 20
let direction
const zoom = 8
let down_keys = {}

let c = {
  watering: false,
  watering_frame: 0,
}

const map = {
  width: 8*8,
  height: 8*8,
}


const render = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < map.width/8; i++) {
    const y_ = y-1
    const x_ = i * 8
    context.drawImage(sprites.ground, x_*zoom, y_*zoom, 8*zoom, 8*zoom);
  }
  for (var i = 0; i < map.width/8; i++) {
    const y_ = y-8-1
    const x_ = i * 8
    context.drawImage(sprites.wall, x_*zoom, y_*zoom, 8*zoom, 8*zoom);
  }
  let cana_sprite;
  if (direction === "left") {
    cana_sprite = sprites.canawee.left[step]
    context.drawImage(
      cana_sprite,
      (x-4) * zoom,
      (y-6) * zoom,
      8*zoom,
      8*zoom);
  } else {
    cana_sprite = sprites.canawee.right[step]
    context.drawImage(
      cana_sprite,
      (x-3) * zoom,
      (y-6) * zoom,
      8*zoom,
      8*zoom);
  }
  context.drawImage(
    sprites.position,
    x*zoom,
    y*zoom,
    1*zoom,
    1*zoom);
  if (down_keys["d"]) {
    direction = "right"
    step = (step+1) % 6
    x += 1
  } else if (down_keys["q"]) {
    direction = "left"
    step = (step+1) % 6
    x -= 1
  } else if (step != 5 && step != 2) {
    step = (step+1) % 6
  }

  if (down_keys[" "]) {
    c.watering = true
  } else {
    c.watering = false
  }

  x = (x + map.width) % map.width
  setTimeout(render, 100)
}


const flip_x = async (image) => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, image.width, image.height);
  const dt = ctx.getImageData(0,0,image.width, image.height);
  let ar_source = new Uint8ClampedArray(dt.data);
  let ar_target = new Uint8ClampedArray(image.width*image.height*4);
  for (var x = 0; x < image.width; x++) {
    for (var y = 0; y < image.height; y++) {
      const pix_id_src = (y*image.width+x)*4
      const y_ = y
      const x_ = image.width-1-x
      const pix_id_dst = (y_*image.width+x_)*4
      for (var i = 0; i < 4; i++) {
        ar_target[pix_id_dst+i] = ar_source[pix_id_src+i]
      }
    }
  }
  return await createImageBitmap(new ImageData(ar_target, image.width));
}


window.onload = () => {
  console.log('canawee started')
  document.body.innerHTML = `
    <canvas id="canvas"></canvas>
  `
  canvas = document.getElementById("canvas")
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  context = canvas.getContext('2d'),
  context.imageSmoothingEnabled = false;
  image = new Image();
  image.onload = async () => {
    sprites = {
      canawee: {
        right: [
          await createImageBitmap(image, 8*0, 0, 8, 8),
          await createImageBitmap(image, 8*1, 0, 8, 8),
          await createImageBitmap(image, 8*2, 0, 8, 8),
          await createImageBitmap(image, 8*3, 0, 8, 8),
          await createImageBitmap(image, 8*4, 0, 8, 8),
          await createImageBitmap(image, 8*5, 0, 8, 8),
        ],
        left: [
          await flip_x(await createImageBitmap(image, 8*0, 0, 8, 8)),
          await flip_x(await createImageBitmap(image, 8*1, 0, 8, 8)),
          await flip_x(await createImageBitmap(image, 8*2, 0, 8, 8)),
          await flip_x(await createImageBitmap(image, 8*3, 0, 8, 8)),
          await flip_x(await createImageBitmap(image, 8*4, 0, 8, 8)),
          await flip_x(await createImageBitmap(image, 8*5, 0, 8, 8)),
        ]
      },
      ground: await createImageBitmap(image, 8*0, 8*1, 8, 8),
      wall: await createImageBitmap(image, 8*1, 8*1, 8, 8),
      sky: await createImageBitmap(image, 8*2, 8*1, 8, 8),
      position: await createImageBitmap(image, 8*6, 0, 1, 1),
      watering: {
        start: [
          await createImageBitmap(image, 8*3, 8*2, 1, 1),
          await createImageBitmap(image, 8*3, 8*2, 2, 2),
          await createImageBitmap(image, 8*3, 8*2, 3, 3),
          await createImageBitmap(image, 8*3, 8*2, 4, 4),
        ],
        loop: [
          await createImageBitmap(image, 8*3, 8*2, 4, 4),
        ],
        end: [
          await createImageBitmap(image, 8*3, 8*2, 4, 4),
          await createImageBitmap(image, 8*3, 8*2, 3, 3),
          await createImageBitmap(image, 8*3, 8*2, 2, 2),
          await createImageBitmap(image, 8*3, 8*2, 1, 1),
        ],
      }
    }
    render()
  }
  image.src = './canawee.png';
  window.addEventListener("keydown", (e) => {
    // console.log(e.key)
    down_keys[e.key] = true
  });
  window.addEventListener("keyup", (e) => {
    // console.log(e.key)
    down_keys[e.key] = false
  });
}
