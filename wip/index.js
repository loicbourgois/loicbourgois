const conf = {
  red_amount: 0.8,
  interval_render_ms: 0,
  interval_controls_ms: 10,
  interval_main_ms: 10,
  render: {
    last_time: null
  },
  log_render_duration: true,
  zoom: 0.125,
  slider_count: 8,
  scale: 2,
  buffer_columns: 2,
  buffer_lines: 2,
  log_interval: 10,
}
let logs = []
const canvas_1 = document.querySelector('#canvas_1')
const gl = canvas_1.getContext('webgl2', {preserveDrawingBuffer: true})
let slider_placeholder_value = ''
let slider_html = ''
for (let i = 0; i < conf.slider_count; i++) {
  const id = i+1
  slider_placeholder_value += `uniform float slider_${id};`
  slider_html += `<div clas="slider_container">
    <label>slider #${id}</label>
    <input type="range" min="0" max="10000" class="slider" id="slider_${id}">
  </div>`
}
document.querySelector('#sliders').innerHTML = slider_html
gl.imageSmoothingEnabled = false
const program = create_program_from_strs(
  gl,
  {
    vertex: vertex_shader,
    fragment: fragment_shader
  },
  [
    {
      placeholder: '{RED_AMOUNT}',
      value: conf.red_amount
    },
    {
      placeholder: '{SLIDERS_DECLARATION}',
      value: slider_placeholder_value
    },
  ]
)
const uniform_sliders = []
for (let i = 0; i < conf.slider_count; i++) {
  const id = i+1
  uniform_sliders.push({
    value: 0.5,
    uniform_location: gl.getUniformLocation(program, `slider_${id}`),
    setter: set_uniform1f,
    slider: document.querySelector(`#slider_${id}`),
  })
}
const position = {
  attrib_location: gl.getAttribLocation(program, 'position'),
  vao: gl.createVertexArray(),
  buffer: gl.createBuffer(),
  data: new Float32Array(triangles_positions),
  parameters: {
    size: 2,
    type: gl.FLOAT,
    normalize: false,
    stride: 0,
    offset: 0
  },
  draw_parameters: {
    offset: 0,
    primitiveType: gl.TRIANGLES,
  },
  get draw_parameters_count() {
    return this.data.length / this.parameters.size
  }
}
gl.bindBuffer(gl.ARRAY_BUFFER, position.buffer)
gl.bufferData(gl.ARRAY_BUFFER, position.data, gl.STATIC_DRAW)
gl.bindVertexArray(position.vao)
gl.enableVertexAttribArray(position.attrib_location)
gl.vertexAttribPointer(
  position.attrib_location,
  position.parameters.size,
  position.parameters.type,
  position.parameters.normalize,
  position.parameters.stride,
  position.parameters.offset)
resize_canvas(gl.canvas, conf.scale)
const uniforms = {
  time_ms: {
    value: 0,
    uniform_location: gl.getUniformLocation(program, 'time_ms'),
    setter: set_uniform1f,
  },
  circle_diameter: {
    value: 1,
    uniform_location: gl.getUniformLocation(program, 'circle_diameter'),
    setter: set_uniform1f,
  },
  buffer_columns: {
    value: conf.buffer_columns,
    uniform_location: gl.getUniformLocation(program, 'buffer_columns'),
    setter: set_uniform1i,
  },
  buffer_lines: {
    value: conf.buffer_lines,
    uniform_location: gl.getUniformLocation(program, 'buffer_lines'),
    setter: set_uniform1i,
  },
  buffer_dimensions: {
    values: [gl.canvas.width, gl.canvas.height],
    uniform_location: gl.getUniformLocation(program, 'buffer_dimensions'),
    setter: set_uniform2f,
  },
  seeds: {
    values: [Math.random(), Math.random(), Math.random(), Math.random()],
    uniform_location: gl.getUniformLocation(program, 'seeds'),
    setter: set_uniform4f,
  },
}
const init_slider = (uniform) => {
  uniform.slider.value = uniform.value * (uniform.slider.max - uniform.slider.min)
}
const textures = {
  previous_image: {
    buffer: new Uint8Array(gl.canvas.width * gl.canvas.height * 4),
    uniform_location: gl.getUniformLocation(program, "previous_image"),
    gl_texture: gl.createTexture(),
    texture_id: 0,
    parameters: {
      mip_evel: 0,
      internal_format: gl.RGBA,
      source_format: gl.RGBA,
      source_type: gl.UNSIGNED_BYTE,
      width: gl.canvas.width,
      height: gl.canvas.height,
      border: 0
    }
  }
}
gl.activeTexture(gl.TEXTURE0 + textures.previous_image.texture_id);
gl.bindTexture(gl.TEXTURE_2D, textures.previous_image.gl_texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.useProgram(program)
const render = () => {
  const start_time_ms = Date.now()
  uniforms.seeds.values = [Math.random(), Math.random(), Math.random(), Math.random()]
  set_uniforms(gl, program, uniforms)
  set_uniforms(gl, program, uniform_sliders)
  gl.uniform1i(textures.previous_image.uniform_location, textures.previous_image.texture_id)
  load_texture(gl, textures.previous_image)
  gl.bindVertexArray(position.vao)
  // gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.vertexAttribPointer(
    position.attrib_location,
    position.parameters.size,
    position.parameters.type,
    position.parameters.normalize,
    position.parameters.stride,
    position.parameters.offset)
  // gl.bindBuffer(gl.ARRAY_BUFFER, position.buffer)
  // clear_buffer(gl)
  gl.drawArrays(
    position.draw_parameters.primitiveType,
    position.draw_parameters.offset,
    position.draw_parameters_count)
  gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, textures.previous_image.buffer);
  if (conf.log_render_duration)
  {
    logs.push({
      fps: 1000.0 / (Date.now() - conf.render.last_time),
      render_duration: Date.now() - start_time_ms,
    })
    if (logs.length >= conf.log_interval) {
      let fps_sum = 0.0
      let render_duration_sum = 0.0
      logs.forEach((log, i) => {
        fps_sum += log.fps
        render_duration_sum += log.render_duration
      });
      console.log(`fps: ${fps_sum / logs.length}`)
      console.log(`render duration: ${render_duration_sum / logs.length} ms`)
      logs = []
    }
  }
  conf.render.last_time = Date.now()
}
const update_uniform_slider_value = (uniform) => {
  uniform.value = uniform.slider.value / (uniform.slider.max - uniform.slider.min)
}
const handle_controls = () => {
  uniform_sliders.forEach((uniform_slider, i) => {
    update_uniform_slider_value(uniform_slider)
  });
}
const render_loop = () => {
  render()
  setTimeout(() => {
    render_loop()
  }, conf.interval_render_ms)
}
const controls_loop = () => {
  conf.interval_controls_id = setInterval(handle_controls, conf.interval_controls_ms);
}
const step = () => {
  uniforms.time_ms.value = Date.now() - conf.start_ms
}
const main_loop = () => {
  conf.start_ms = Date.now()
  conf.interval_main_id = setInterval(step, conf.interval_main_ms);
}
/*const canvas_2 = document.querySelector('#canvas_2')
const gl_2 = canvas_2.getContext('webgl2', {preserveDrawingBuffer: true})
resize_canvas(canvas_2, conf.scale)*/
controls_loop()
main_loop()
render_loop()
