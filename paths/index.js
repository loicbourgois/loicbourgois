
const loop = () => {
  const t0 = performance.now();
  runwebgl(canvas);
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvasgl_to_canvas();
  let t1 = performance.now()
  if (conf.log_fps) {
    console.log(`${t1 - t0}ms ~ ${Math.floor(1000 / (t1 - t0))}FPS`)
  }
  requestAnimationFrame(loop);
}

const canvasgl_to_canvas = () => {
  context.drawImage(canvasgl, 0, 0, canvas.width, canvas.height);
}

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');

fill(context, 'rgba(0, 0, 0, 1)');
initWebgl(canvas);

loop();
