const fill = (context, color) => {
  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height);
  context.fillStyle = color;
  context.fill();
}
