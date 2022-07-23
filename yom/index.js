const loop = () => {
  const t0 = performance.now();
  zoom();
  runwebgl(canvas);
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvasgl_to_canvas();
  let t1 = performance.now()
  if (conf.log_fps) {
    console.log(`${t1 - t0}ms ~ ${Math.floor(1000 / (t1 - t0))}FPS`)
  }
  requestAnimationFrame(loop);
}

const zoom = () => {
  if (true) {
    context.imageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;

    context2.drawImage(canvas, 0, 0, canvas.width, canvas.height);

    // if (conf.clear_on_zoom) {
    //   context.clearRect(0, 0, canvas.width, canvas.height);
    // }

    context.drawImage(
      canvas2,
      conf.zoom_rate,
      conf.zoom_rate,
      canvas.width - conf.zoom_rate * 2,
      canvas.height - conf.zoom_rate * 2,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }
}

const canvasgl_to_canvas = () => {
  context.drawImage(canvasgl, 0, 0, canvas.width, canvas.height);
}

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');

const canvas2 = document.createElement('canvas');
canvas2.width = canvas.width;
canvas2.height = canvas.height;
const context2 = canvas2.getContext('2d');

fill(context, 'rgba(0, 0, 0, 1)');
initWebgl(canvas);

loop();
