const config = {
  interval_physic_ms: 10,
  interval_render_ms: 30,
  sphere_count: 100,
  sphere_count_render: 14, // fixme : slow if 15 
  sphere_count_render_2: 14,
}
console.log(config.sphere_count_render * config.sphere_count_render_2)
const points = {
  format: [
    'x', 'y', 'z', 'radius', 'r', 'g', 'b', 'a',
  ],
  data: [
    [0.0, 0.0, 0.0, 0.5, 0.8, 0.1, 0.0, 1.0],
    [0.0, 1.0, 0.0, 0.5, 0.8, 0.5, 0.8, 1.0],
    [1.0, 0.0, 0.0, 0.5, 0.8, 0.9, 0.8, 1.0],
    [1.0, 1.0, 1.0, 0.5, 0.8, 0.9, 0.8, 1.0],
    //[-0.5, -0.0, 0.0, 0.2, 0.8, 0.9, 0.8, 1.0],
  ]
}

const random_float = (min, max) => {
  return Math.random() * (max - min) + min
}
const scatter = 5
for (var i = points.data.length; i < config.sphere_count; i++) {
  points.data.push([
    random_float(-scatter, scatter),
    random_float(-scatter, scatter),
    random_float(-scatter, scatter),
    random_float(0.1, 1.0),
    random_float(0.1, 1.0),
    random_float(0.1, 1.0),
    random_float(0.1, 1.0),
    1.0,
  ])
}
console.log(`points.data.length: ${points.data.length}`)

const get_geometry_data_as_rgba_texture = (data) => {
  return get_data_as_rgba_texture(data, 0)
}
const get_color_data_as_rgba_texture = (data) => {
  return get_data_as_rgba_texture(data, 4)
}
const get_data_as_rgba_texture = (data, start_index) => {
  const texture_data = []
  data.forEach((datapoint, i) => {
    for (let i = start_index ; i < datapoint.length && i < start_index + 4; i++) {
      texture_data.push(datapoint[i])
    }
    for (let i = datapoint.length ; i < start_index + 4 ; i++) {
      texture_data.push(0.0)
    }
  })
  return texture_data
}
const canvas_input = document.querySelector('#canvas')
const gl_input = canvas_input.getContext('webgl2')
const program_input = create_program_from_html(gl_input, {
  vertex: '#vertex_shader',
  fragment: '#fragment_shader'}, [{
    placeholder: '${NUM_SPHERES}',
    value: config.sphere_count_render
  }, {
    placeholder: '${TRACE_NUM_SPHERES}',
    value: config.sphere_count_render_2
  }])
const position_location = gl_input.getAttribLocation(program_input, 'position')

const camera = {
  position: {
    gl_location: gl_input.getUniformLocation(program_input, 'camera_position'),
    value: [0.0, 0.0, 0.0]
  },
  direction: {
    gl_location: gl_input.getUniformLocation(program_input, 'camera_direction'),
    value: [0.0, 0.0, -1.0]
  }
}

var matrixLocation = gl_input.getUniformLocation(program_input, "u_matrix");
const position_buffer = gl_input.createBuffer()
gl_input.bindBuffer(gl_input.ARRAY_BUFFER, position_buffer)
gl_input.bufferData(gl_input.ARRAY_BUFFER, new Float32Array(triangles_positions), gl_input.STATIC_DRAW)
const vao = gl_input.createVertexArray();
gl_input.bindVertexArray(vao);
gl_input.enableVertexAttribArray(position_location);
const size = 2;
const type = gl_input.FLOAT;
const normalize = false;
const stride = 0;
const offset = 0;
gl_input.vertexAttribPointer(position_location, size, type, normalize, stride, offset)
let texture_count = 0
const new_texture_data = (gl, name) => {
  const id = texture_count
  texture_count = texture_count + 1
  return {
    location: gl.getUniformLocation(program_input, name),
    gl_texture: gl.createTexture(),
    gl: gl,
    data: null,
    id: id
  }
}
const texture_update_data = (texture, data) => {
  const gl = texture.gl
  const level_2 = 0;
  const internalFormat = gl_input.RGBA32F;
  const width = data.length / 4;
  const height = 1;
  const border = 0;
  const format = texture.gl.RGBA;
  const type_3 = texture.gl.FLOAT;
  gl.activeTexture(gl.TEXTURE0 + texture.id)
  texture.gl.bindTexture(texture.gl.TEXTURE_2D, texture.gl_texture);
  texture.gl.texImage2D(texture.gl.TEXTURE_2D, level_2, internalFormat, width, height, border, format, type_3, data);
}
const use_texture = (texture) => {
  const gl = texture.gl
  gl.bindTexture(gl.TEXTURE_2D, texture.gl_texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.activeTexture(gl.TEXTURE0 + texture.id)
  gl_input.uniform1i(texture.location, texture.id);
  // const alignment = 1;
  // gl_input.pixelStorei(gl_input.UNPACK_ALIGNMENT, alignment);
}
const set_uniform3f = (gl, uniform) => {
  gl.uniform3f(uniform.gl_location,
    uniform.value[0],
    uniform.value[1],
    uniform.value[2],
  );
}

const texture_data_0 = new_texture_data(gl_input, 'texture_0')
const texture_data_1 = new_texture_data(gl_input, 'texture_1')

let last_time = Date.now()

const render = () => {
  const start_time_ms = Date.now()
  gl_input.useProgram(program_input);
  texture_update_data(texture_data_0, new Float32Array(get_geometry_data_as_rgba_texture(points.data)))
  use_texture(texture_data_0)
  texture_update_data(texture_data_1, new Float32Array(get_color_data_as_rgba_texture(points.data)))
  use_texture(texture_data_1)
  set_uniform3f(gl_input, camera.position)
  set_uniform3f(gl_input, camera.direction)
  resize_canvas(gl_input.canvas);
  gl_input.bindVertexArray(vao);
  gl_input.bindFramebuffer(gl_input.FRAMEBUFFER, null);
  gl_input.viewport(0, 0, gl_input.canvas.width, gl_input.canvas.height);
  clear_buffer(gl_input)
  gl_input.bindVertexArray(vao);


const gl = gl_input;
var fieldOfViewRadians = degToRad(90/*document.querySelector('#slider_2').value*/);
 var cameraAngleRadians = degToRad(document.querySelector('#slider_1').value);
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 0.01;
    var zFar = 20000;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    var cameraMatrix = m4.yRotation(cameraAngleRadians);
    cameraMatrix = m4.xRotate(cameraMatrix, degToRad(document.querySelector('#slider_2').value));
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, document.querySelector('#slider_3').value*0.01);
    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);
    // create a viewProjection matrix. This will both apply perspective
    // AND move the world so that the camera is effectively the origin
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    gl.uniformMatrix4fv(matrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(matrixLocation, false, viewProjectionMatrix);





  var primitiveType = gl_input.TRIANGLES;
  var offset = 0;
  var count = triangles_positions.length / size;
  gl_input.drawArrays(primitiveType, offset, count);

  //console.log(Date.now() - start_time_ms)
  console.log(Date.now() - last_time)
  last_time = Date.now()
}
const do_loop = true;
const step = () => {
  //points.data[0][0] = points.data[0][0] + 0.001;
  //camera.position.value[1] = camera.position.value[1] + 0.001;
  //camera.direction.value[0] = document.querySelector('#slider_1').value / 360.0
  //camera.direction.value[1] = document.querySelector('#slider_2').value / 360.0
}
const physic_loop = () => {

  config.interval_physic_id = setInterval(step, config.interval_physic_ms);
  /*if (do_loop) {
    window.requestAnimationFrame(physic_loop);
  }*/
}
let a = true;
const render_loop = () => {
  //config.interval_render_id = setInterval(render, config.interval_render_ms);
  if (!a) {
    render();
  }
  a = (a + 1) % 1
  if (do_loop) {
    window.requestAnimationFrame(render_loop);
  }
}
physic_loop()
render_loop()
