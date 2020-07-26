const triangles_positions = [
  -1, 1,
  -1, -1,
  1, 1,
  -1, -1,
  1, -1,
  1, 1,
]
const texture_positions = [
  0, 0,
  0, 1,
  1, 0,
  0, 1,
  1, 1,
  1, 0
]
const create_program = (gl, shaders) => {
  const program = gl.createProgram()
  shaders.forEach((shader, i) => {
    gl.attachShader(program, shader);
  });
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
const create_shader = (gl, type, source) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }
  console.log(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}
const resize_canvas = (canvas) => {
  canvas.width = window.innerHeight
  canvas.height = window.innerHeight
  // resizeCanvasToDisplaySize(canvas)
}
const clear_buffer = (gl) => {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
function resizeCanvasToDisplaySize(canvas, multiplier) {
  multiplier = multiplier || 1;
  const width  = canvas.clientWidth  * multiplier | 0;
  const height = canvas.clientHeight * multiplier | 0;
  if (canvas.width !== width ||  canvas.height !== height) {
    canvas.width  = width;
    canvas.height = height;
    return true;
  }
  return false;
}
const create_program_from_html = (gl, shader_query_selectors, values) => {
  let vertex_shader_source = document.querySelector(shader_query_selectors.vertex).text
  let fragment_shader_source = document.querySelector(shader_query_selectors.fragment).text
  values.forEach((item, i) => {
    vertex_shader_source = vertex_shader_source.split(item.placeholder).join(item.value)
    fragment_shader_source = fragment_shader_source.split(item.placeholder).join(item.value)
  });
  const vertex_shader = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_source)
  const fragment_shader = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_source)
  return create_program(gl, [
    vertex_shader,
    fragment_shader
  ])
}
