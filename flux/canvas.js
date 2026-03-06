const resize_square = (canvas, dimension, zoom) => {
  canvas.width = dimension*zoom
  canvas.height = dimension*zoom
  canvas.style.width = `${parseInt(dimension)}px`
  canvas.style.height = `${parseInt(dimension)}px`
}


export {
  resize_square,
}
