const getColorIndicesForCoord = (x, y, width, height) => {
  x = (x + width) % width;
  y = (y + height) % height;
  const red = y * (width * 4) + x * 4;
  return [red, red + 1, red + 2, red + 3];
};

const setColor = (imageData, x, y, r, g, b, a) => {
  const [redIndex, greenIndex, blueIndex, alphaIndex] = getColorIndicesForCoord(x, y, imageData.width, imageData.height);
  imageData.data[redIndex] = r;
  imageData.data[greenIndex] = g;
  imageData.data[blueIndex] = b;
  imageData.data[alphaIndex] = a;
};

const setColorShort = (imageData, x, y, c) => {
  setColor(imageData, x, y, c[0], c[1], c[2], c[3]);
};

const getColor = (imageData, x, y) => {
  const [redIndex, greenIndex, blueIndex, alphaIndex] = getColorIndicesForCoord(x, y, imageData.width, imageData.height);
  return [
    imageData.data[redIndex],
    imageData.data[greenIndex],
    imageData.data[blueIndex],
    imageData.data[alphaIndex]
  ];
};

const blit = (context, imageData) => {
  context.putImageData(imageData, 0, 0);
};

const painItTransparent = (context) => {
  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height);
  context.fillStyle = `rgba(0, 0, 0, 0)`;
  context.fill();
}

const addMask = () => {
  context.fillStyle = `rgba(0, 0, 0, 0.01)`;
  context.font = "bold 200px monospace";
  context.textAlign = "center";
  context.fillText("Greetings!", (canvas.width / 2), (canvas.height / 2) + 50);
}

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');

const canvas2 = document.getElementById('canvas2');
canvas2.width = canvas.width;
canvas2.height = canvas.height;
const context2 = canvas2.getContext('2d');

const canvasTmp = document.createElement('canvas');
canvasTmp.width = canvas.width;
canvasTmp.height = canvas.height;
const contextTmp = canvasTmp.getContext('2d');

let colors = [];

switch (CONF.COLOR_MODE) {
    case 'COLORFULL':
      for (let i = 0; i < CONF.COLOR_COUNT; i++) {
        let r = Math.random();
        let g = Math.random();
        let b = Math.random();
        const max =  Math.max(Math.max(r, g), b);
        r = r / max;
        g = g / max;
        b = b / max;
        colors[i] = [r, g, b];
      }
      break;
    case 'SILVER_N_GOLD':
      colors[0] = [1, 1, 0.5];
      colors[1] = [1, 1 , 1];
      break;
    case 'LIST':
      colors = CONF.COLORS;
}

painItTransparent(context);
if (CONF.INIT_WITH_MASK) {
  addMask();
}


let imageData = context.getImageData(0, 0, canvas.width, canvas.height);

let rMax = Math.min(imageData.width, imageData.height) * CONF.R_MAX_START_RATIO;

//run();
setupwebgl(canvas);
loop();
