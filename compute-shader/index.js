const points = {
  data: [
    [0.0, 0.0, 0.8],
    [0.0, 0.5],
    [0.0, 0.9],
    [0.9, 0.9],
  ]
}
const points_2 = {
  data: [
    [0.9, 0.0, 0.8],
    [0.9, 0.5, 0.9],
    [0.9, 0.8, 0.9],
    [0.9, 0.1, 0.9],
  ]
}
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
const get_data_as_rgba_texture = (data) => {
  const texture_data = []
  data.forEach((datapoint, i) => {
    for (let i = 0 ; i < datapoint.length ; i++) {
      texture_data.push(datapoint[i])
    }
    for (let i = datapoint.length ; i < 4 ; i++) {
      texture_data.push(0.0)
    }
  })
  console.log(texture_data)
  return texture_data
}






const canvas_input = document.querySelector('#canvas_input')
const gl_input = canvas_input.getContext('webgl2')
const program_input = create_program_from_html(gl_input, {
  vertex: '#vertex_shader',
  fragment: '#fragment_shader'})
const position_location = gl_input.getAttribLocation(program_input, 'position')
const texture_coords_location = gl_input.getAttribLocation(program_input, 'texture_coords')
const texture_location = gl_input.getUniformLocation(program_input, 'texture_uniform')
const position_buffer = gl_input.createBuffer()
gl_input.bindBuffer(gl_input.ARRAY_BUFFER, position_buffer)
gl_input.bufferData(gl_input.ARRAY_BUFFER, new Float32Array(triangles_positions), gl_input.STATIC_DRAW)
const vao = gl_input.createVertexArray();
gl_input.bindVertexArray(vao);
gl_input.enableVertexAttribArray(position_location);
const size = 2;          // 2 components per iteration
const type = gl_input.FLOAT;   // the data is 32bit floats
const normalize = false; // don't normalize the data
const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
const offset = 0;        // start at the beginning of the buffer
gl_input.vertexAttribPointer(position_location, size, type, normalize, stride, offset)
var texcoordBuffer = gl_input.createBuffer();
gl_input.bindBuffer(gl_input.ARRAY_BUFFER, texcoordBuffer);
function setTexcoords(gl_input) {
  gl_input.bufferData(
    gl_input.ARRAY_BUFFER,
    new Float32Array(texture_positions),
    gl_input.STATIC_DRAW);
}
setTexcoords(gl_input);
gl_input.enableVertexAttribArray(texture_coords_location);
gl_input.vertexAttribPointer(texture_coords_location, size, type, normalize, stride, offset);
const alignment = 1;
gl_input.pixelStorei(gl_input.UNPACK_ALIGNMENT, alignment);

var texture = gl_input.createTexture();
gl_input.bindTexture(gl_input.TEXTURE_2D, texture);
const level_2 = 0;
const internalFormat = gl_input.RGBA32F;
const width = points.data.length;
const height = 1;
const border = 0;
const format = gl_input.RGBA;
const type_3 = gl_input.FLOAT;



const data = new Float32Array(get_data_as_rgba_texture(points.data));
gl_input.bindTexture(gl_input.TEXTURE_2D, texture);
gl_input.texImage2D(gl_input.TEXTURE_2D, level_2, internalFormat, width, height, border, format, type_3, data);
gl_input.texParameteri(gl_input.TEXTURE_2D, gl_input.TEXTURE_MIN_FILTER, gl_input.NEAREST);
gl_input.texParameteri(gl_input.TEXTURE_2D, gl_input.TEXTURE_MAG_FILTER, gl_input.NEAREST);
//gl_input.texParameteri(gl_input.TEXTURE_2D, gl_input.TEXTURE_WRAP_S, gl_input.CLAMP_TO_EDGE);
//gl_input.texParameteri(gl_input.TEXTURE_2D, gl_input.TEXTURE_WRAP_T, gl_input.CLAMP_TO_EDGE);

const draw_input = () => {
  gl_input.bindTexture(gl_input.TEXTURE_2D, texture);
  resize_canvas(gl_input.canvas);
  gl_input.bindVertexArray(vao);
  gl_input.bindFramebuffer(gl_input.FRAMEBUFFER, null);
  gl_input.viewport(0, 0, gl_input.canvas.width, gl_input.canvas.height);
  clear_buffer(gl_input)
  gl_input.useProgram(program_input);
  gl_input.bindVertexArray(vao);
  gl_input.uniform1i(texture_location, 0);
  var primitiveType = gl_input.TRIANGLES;
  var offset = 0;
  var count = triangles_positions.length / size;
  gl_input.drawArrays(primitiveType, offset, count);
}


const canvas_output = document.querySelector('#canvas_output')
const gl_output = canvas_output.getContext('webgl2')
const program_output = create_program_from_html(gl_output, {
  vertex: '#vertex_shader',
  fragment: '#fragment_shader'})
const output = {}
output.position_location = gl_output.getAttribLocation(program_output, 'position')
output.texture_coords_location = gl_output.getAttribLocation(program_output, 'texture_coords')
output.texture_location = gl_output.getUniformLocation(program_output, 'texture_uniform')
output.position_buffer = gl_output.createBuffer()
gl_output.bindBuffer(gl_output.ARRAY_BUFFER, output.position_buffer)
gl_output.bufferData(gl_output.ARRAY_BUFFER, new Float32Array(triangles_positions), gl_output.STATIC_DRAW)
output.vao = gl_output.createVertexArray();
gl_output.bindVertexArray(output.vao);
gl_output.enableVertexAttribArray(position_location);
output.size = 2;          // 2 components per iteration
output.type = gl_output.FLOAT;   // the data is 32bit floats
output.normalize = false; // don't normalize the data
output.stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
output.offset = 0;        // start at the beginning of the buffer
gl_output.vertexAttribPointer(position_location, size, type, normalize, stride, offset)
var texcoordBuffer = gl_output.createBuffer();
gl_output.bindBuffer(gl_output.ARRAY_BUFFER, texcoordBuffer);
function setTexcoords(gl_output) {
  gl_output.bufferData(
    gl_output.ARRAY_BUFFER,
    new Float32Array(texture_positions),
    gl_output.STATIC_DRAW);
}
setTexcoords(gl_output);
gl_output.enableVertexAttribArray(texture_coords_location);
gl_output.vertexAttribPointer(texture_coords_location, size, type, normalize, stride, offset);
gl_output.pixelStorei(gl_output.UNPACK_ALIGNMENT, alignment);

output.texture = gl_output.createTexture();
output.level_2 = 0;
output.internalFormat = gl_output.RGBA32F;
output.width = points_2.data.length;
output.height = 1;
output.border = 0;
output.format = gl_output.RGBA;
output.type_3 = gl_output.FLOAT;

output.data = new Float32Array(get_data_as_rgba_texture(points_2.data));
gl_output.bindTexture(gl_output.TEXTURE_2D, output.texture);
gl_output.texImage2D(gl_output.TEXTURE_2D, output.level_2, output.internalFormat,
  output.width, output.height, output.border, output.format, output.type_3, output.data);
gl_output.texParameteri(gl_output.TEXTURE_2D, gl_output.TEXTURE_MIN_FILTER, gl_output.NEAREST);
gl_output.texParameteri(gl_output.TEXTURE_2D, gl_output.TEXTURE_MAG_FILTER, gl_output.NEAREST);

const draw_output = () => {
  resize_canvas(gl_output.canvas);
  gl_output.bindVertexArray(output.vao);
  gl_output.bindFramebuffer(gl_output.FRAMEBUFFER, null);
  gl_output.viewport(0, 0, gl_output.canvas.width, gl_output.canvas.height);
  clear_buffer(gl_output)
  gl_output.useProgram(program_output);
  gl_output.bindVertexArray(output.vao);
  gl_output.uniform1i(output.texture_location, 0);
  var primitiveType = gl_output.TRIANGLES;
  var offset = 0;
  var count = triangles_positions.length / size;
  gl_output.drawArrays(primitiveType, offset, count);
}



draw_input()
draw_output()
