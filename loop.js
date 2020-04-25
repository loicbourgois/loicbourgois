
const loop = () => {
  let t0 = performance.now()
  if (CONF.LOOP_WITH_MASK) {
    addMask();
  }
  run();
  runwebgl(canvas);
  painItTransparent(context);
  canvasglToCanvas();
  let t1 = performance.now()
  if (CONF.LOG_FPS) {
    console.log(`${t1 - t0}ms ~ ${Math.floor(1000 / (t1 - t0))}FPS`)
  }
  requestAnimationFrame(loop);
}

const canvasglToCanvas = () => {
  context.drawImage(canvasgl, 0, 0, canvas.width, canvas.height);
}

const run = () => {
  imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  for (var GENERATION_PER_CYCLE_c = 0; GENERATION_PER_CYCLE_c < CONF.GENERATION_PER_CYCLE ; GENERATION_PER_CYCLE_c += 1) {
    let x = Math.round(Math.random() * imageData.width);
    let y = Math.round(Math.random() * imageData.height);
    let radius = Math.round(Math.random() * rMax);
    let r2 = radius + CONF.MARGIN;

    let cs = new Map();
    let skip = false;
    if (CONF.DO_CHECK) {
      for (let i = x-r2 ; i < x+r2+1 ; i += 1) {
        for (let j = y-r2 ; j < y+r2+1 ; j += 1) {
          let c = getColor(imageData, i, j);
          if (c[0] > 1 && CONF.NO_REDO) {
            skip = true;
            break;
          }
          cID = `${c[0]}-${c[1]}-${c[2]}-${c[3]}`;
          if ( isNaN(cs.get(cID)) ) {
            cs.set(cID, 0)
          }
          cs.set(cID, cs.get(cID) + 1)
        };
      };
    }

    if (cs.size <= CONF.MAX_COLOR_UNDER && !skip) {
      let rgb = 255;
      let r = rgb;
      let g = rgb;
      let b = rgb;
      switch (CONF.COLOR_MODE) {
        case 'WHITE':
          break;
        case 'BLACK_OR_WHITE':
          rgb = Math.round(Math.random()) * 255;
          r = rgb;
          g = rgb;
          b = rgb;
          break;
        case 'SHADES_OF_GREY':
          rgb = Math.round(Math.random() * 255 );
          r = rgb;
          g = rgb;
          b = rgb;
          break;
        case 'RAINBOW':
          r = Math.random();
          g = Math.random();
          b = Math.random();
          const max =  Math.max(Math.max(r, g), b);
          saturation = Math.random() * (1 - CONF.MIN_SATURATION) + CONF.MIN_SATURATION;
          r = Math.round(r / max * saturation * 255);
          g = Math.round(g / max * saturation * 255);
          b = Math.round(b / max * saturation * 255);
          break;
        case 'RANDOM':
          r = Math.round(Math.random() * 255);
          g = Math.round(Math.random() * 255);
          b = Math.round(Math.random() * 255);
          break;
        default:
          rgb = colors[Math.floor(Math.random() * colors.length)];
          saturation = Math.random() * (1 - CONF.MIN_SATURATION) + CONF.MIN_SATURATION;
          r = Math.round(rgb[0] * saturation * 255);
          g = Math.round(rgb[1] * saturation * 255);
          b = Math.round(rgb[2] * saturation * 255);
          break;
      }
      for (let i = x-radius ; i < x+radius+1 ; i += 1) {
        for (let j = y-radius ; j < y+radius+1 ; j += 1) {
          setColorShort(imageData, i, j, [r, g, b, 255]);
        };
      };
      rMax *= CONF.UP_RATE;
    } else {
      rMax *= CONF.DOWN_RATE;
    }
  }

  blit(context, imageData);

  if (CONF.ZOOM) {
    context.imageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;

    contextTmp.drawImage(canvas, 0, 0, canvas.width, canvas.height);

    if (CONF.PAINT_TRANSPARENT) {
      painItTransparent(context)
    }

    context.drawImage(canvasTmp,
        CONF.ZOOM_RATE, CONF.ZOOM_RATE, canvas.width - CONF.ZOOM_RATE*2, canvas.height - CONF.ZOOM_RATE*2,
                  0, 0, canvas.width, canvas.height);
  }
}
