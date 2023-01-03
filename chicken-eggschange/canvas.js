import {
  distance_sqrd,
} from "./math.js"


const context_coordinates = (context, p) => {
  return {
    x: min_dim(context) * p.x,
    y: context.canvas.height -  min_dim(context) * p.y,
  }
}


const min_dim = (context) => {
  return Math.min(context.canvas.width, context.canvas.height)
}


const draw_pixel = (x, y, c) => {
  let roundedX = Math.round(x*dim);
  let roundedY = Math.round(y*dim);
  let index = 4 * (canvas.width * roundedY + roundedX);
  image_data[index + 0] = c[0];
  image_data[index + 1] = c[1];
  image_data[index + 2] = c[2];
  image_data[index + 3] = c[3];
}


const fill_text = (context, p, text, size=14, color="#fff") => {
  text = ""+`${text}`
  const cc = context_coordinates(context, p)
  context.font = `${size}px monospace`;
  context.fillStyle = color
  context.fillText(
    text,
    cc.x - size*text.length*0.3,
    cc.y + size * 0.33  );
}


const fill_circle = ({context, p, diameter, color}) => {
  const cc = context_coordinates(context, p)
  const radius = diameter * min_dim(context) * 0.5;
  const r = context.canvas.width / context.canvas.height
  // console.log(r)
  let x = cc.x
  let y = cc.y 
  if (r > 1) {
    x = cc.x+(context.canvas.width-context.canvas.height)*0.5
  } else {
    y = cc.y+(context.canvas.width-context.canvas.height)*0.5
  }
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
}


const stroke_circle = (context, p, diameter, color, lineWidth) => {
  const cc = context_coordinates(context, p)
  const radius = diameter * min_dim(context) * 0.5;
  context.beginPath();
  context.arc(cc.x, cc.y, radius, 0, 2 * Math.PI, false);
  context.strokeStyle = color;
  context.lineWidth = lineWidth?lineWidth:2;
  context.stroke();
}


const stroke_circle_2 = (context, p, diameter, color, lineWidth) => {
  for (var xy of [[0,0],[1,0],[0,1],[0,-1],[-1,0]]) {
    const pp = {
      x: p.x + xy[0],
      y: p.y + xy[1],
    }
    stroke_circle(context, pp, diameter, color, lineWidth)
  }
}


const fill_circle_2 = (context, p, diameter, color) => {
  // if ( distance_sqrd(p, {x:0.5,y:0.5}) < 0.45 * 0.45 ) {
  //   fill_circle(context, p, diameter, color)
  // } else {
    for (var xy of [[0,0],[1,0],[0,1],[0,-1],[-1,0]]) {
      const pp = {
        x: p.x + xy[0],
        y: p.y + xy[1],
      }
      fill_circle(context, pp, diameter, color)
    }
  // }
}


const clear = (context) => {
  context.clearRect(0,0,context.canvas.width, context.canvas.height)
}


const resize = (canvas, zoom=1.0) => {
  canvas.width = window.innerWidth * zoom
  canvas.height = window.innerHeight * zoom
}


const line = (context, p1, p2, color, line_width) => {
  const cc1 = context_coordinates(context, p1)
  const cc2 = context_coordinates(context, p2)
  context.beginPath();
  context.moveTo(cc1.x, cc1.y);
  context.lineTo(cc2.x, cc2.y);
  context.strokeStyle = color;
  context.lineWidth = line_width?line_width:2;
  context.stroke();
}


const resize_square = (canvas, zoom=1) => {
  const dim = Math.min(window.innerWidth, window.innerHeight)
  canvas.width = dim*zoom
  canvas.height = dim*zoom
}


const to_rgb = (str_) => {
  str_ = str_.replace("#", "")
  if(str_.length == 3){
    const aRgbHex = str_.match(/.{1}/g);
    return [
        parseInt(aRgbHex[0], 16)*16,
        parseInt(aRgbHex[1], 16)*16,
        parseInt(aRgbHex[2], 16)*16,
        255,
    ];
  }
  if(str_.length == 6){
    const aRgbHex = str_.match(/.{1,2}/g);
    return [
        parseInt(aRgbHex[0], 16)*16,
        parseInt(aRgbHex[1], 16)*16,
        parseInt(aRgbHex[2], 16)*16,
        255,
    ];
  }
  return [
      120,
      120,
      120,
      255,
  ];
}


export {
  clear,
  fill_circle,
  fill_circle_2,
  fill_text,
  stroke_circle,
  stroke_circle_2,
  resize,
  resize_square,
  line,
  to_rgb,
}