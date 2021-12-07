const conf = {
  red_amount: 0.8,
  interval_render_ms: 0,
  interval_controls_ms: 0,
  interval_main_ms: 10,
  render: {
    last_time: null
  },
  log_render_duration: false
}
const data = {
  mouse_down: false
}
const canvas = document.querySelector('#canvas', {preserveDrawingBuffer: true})
const gl = canvas.getContext('webgl2')
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
  ]
)
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
resize_canvas(gl.canvas)
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
  birth_rate: {
    value: 0.2,
    uniform_location: gl.getUniformLocation(program, 'birth_rate'),
    setter: set_uniform1f,
    slider: document.querySelector('#slider_birth_rate'),
  },
  death_rate: {
    value: 0.0,
    uniform_location: gl.getUniformLocation(program, 'death_rate'),
    setter: set_uniform1f,
    slider: document.querySelector('#slider_death_rate'),
  },
  scale: {
    value: 0.25,
    uniform_location: gl.getUniformLocation(program, 'scale'),
    setter: set_uniform1f,
    slider: document.querySelector('#slider_scale'),
  },
  slider_4: {
    value: 0.25,
    uniform_location: gl.getUniformLocation(program, 'slider_4'),
    setter: set_uniform1f,
    slider: document.querySelector('#slider_4'),
  },
  slider_5: {
    value: 1.0,
    uniform_location: gl.getUniformLocation(program, 'slider_5'),
    setter: set_uniform1f,
    slider: document.querySelector('#slider_5'),
  },
  mouse_x: {
    value: 0.2,
    uniform_location: gl.getUniformLocation(program, 'mouse_x'),
    setter: set_uniform1f,
  },
  mouse_y: {
    value: 0.2,
    uniform_location: gl.getUniformLocation(program, 'mouse_y'),
    setter: set_uniform1f,
  },
  mouse_x_old: {
    value: 0.2,
    uniform_location: gl.getUniformLocation(program, 'mouse_x_old'),
    setter: set_uniform1f,
  },
  mouse_y_old: {
    value: 0.2,
    uniform_location: gl.getUniformLocation(program, 'mouse_y_old'),
    setter: set_uniform1f,
  },
  mouse_down: {
    value: 0.0,
    uniform_location: gl.getUniformLocation(program, 'mouse_down'),
    setter: set_uniform1f,
  },
}
const init_slider = (uniform) => {
  uniform.slider.value = uniform.value * (uniform.slider.max - uniform.slider.min)
}
init_slider(uniforms.birth_rate)
init_slider(uniforms.death_rate)
init_slider(uniforms.scale)
init_slider(uniforms.slider_4)
init_slider(uniforms.slider_5)
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
  uniforms.mouse_x_old.value = uniforms.mouse_x.value;
  uniforms.mouse_y_old.value = uniforms.mouse_y.value;
  uniforms.mouse_x.value = parseFloat(document.querySelector('#mouse_x').innerHTML);
  uniforms.mouse_y.value = parseFloat(document.querySelector('#mouse_y').innerHTML);
  uniforms.mouse_down.value = parseFloat(data.mouse_down);
  set_uniforms(gl, program, uniforms)
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
  if (conf.log_render_duration) {
    console.log(`a: ${Date.now() - start_time_ms}`)
    console.log(`b: ${Date.now() - conf.render.last_time}`)
  }
  conf.render.last_time = Date.now()
}
const update_uniform_slider_value = (uniform) => {
  uniform.value = uniform.slider.value / (uniform.slider.max - uniform.slider.min)
}
const handle_controls = () => {
  update_uniform_slider_value(uniforms.birth_rate)
  update_uniform_slider_value(uniforms.death_rate)
  update_uniform_slider_value(uniforms.scale)
  update_uniform_slider_value(uniforms.slider_4)
  update_uniform_slider_value(uniforms.slider_5)
}
const render_loop = () => {
  conf.start_render_loop_ms = Date.now()
  conf.interval_render_id = setInterval(render, conf.interval_render_ms);
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
document.onmousemove = (event) => {
    var eventDoc, doc, body;

    event = event || window.event; // IE-ism

    // If pageX/Y aren't available and clientX/Y are,
    // calculate pageX/Y - logic taken from jQuery.
    // (This is to support old IE)
    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;
        event.pageX = event.clientX +
          (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
          (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
          (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
          (doc && doc.clientTop  || body && body.clientTop  || 0 );
    }

    // Use event.pageX / event.pageY here
    document.querySelector('#mouse_x').innerHTML = event.pageX
    document.querySelector('#mouse_y').innerHTML = window.innerHeight - event.pageY;
    if(event.buttons) {
      data.mouse_down = 1.0;
    } else {
      data.mouse_down = 0.0;
    }
}
controls_loop()
main_loop()
render_loop()
