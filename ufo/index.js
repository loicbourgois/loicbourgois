import {
  create_program_from_strs,
  triangles_positions,
  resize_canvas,
  set_uniform1f,
  set_uniform2f,
  set_uniform4f,
  set_uniforms,
  load_texture,
} from './gl.js'
import {
  vertex_shader,
} from './vertex_shader.js'
import {
  fragment_shader,
} from './fragment_shader.js'


const conf = {
  interval_render_ms: 10,
  interval_controls_ms: 10,
  interval_main_ms: 10,
  render: {
    last_time: null
  },
  log_render_duration: false,
  sliders_count: 10,
}


const sliders = []
for (let i = 0; i < conf.sliders_count; i++) {
  sliders.push({
    id: `slider_${i}`,
    index: i,
  })
}
const sliders_str = sliders.map(x => `<input type="range" min="0" max="1000" value="${1000-x.index/(conf.sliders_count-1)*1000}" class="slider" id="${x.id}">` ).join("")
document.querySelector("body").innerHTML = `
  <canvas id='canvas'></canvas>
  <div id="sliders">
    ${sliders_str}
  </div>
`


const canvas = document.querySelector('#canvas', {preserveDrawingBuffer: true})
const gl = canvas.getContext('webgl2')
gl.imageSmoothingEnabled = false
const program = create_program_from_strs(
  gl,
  {
    vertex: vertex_shader,
    fragment: fragment_shader({
      sliders: sliders
    })
  },
  []
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
for (let slider of sliders) {
  uniforms[slider.id] = {
    value: 0.0,
    uniform_location: gl.getUniformLocation(program, slider.id),
    setter: set_uniform1f,
  }
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
  gl.uniform1i(textures.previous_image.uniform_location, textures.previous_image.texture_id)
  load_texture(gl, textures.previous_image)
  gl.bindVertexArray(position.vao)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.vertexAttribPointer(
    position.attrib_location,
    position.parameters.size,
    position.parameters.type,
    position.parameters.normalize,
    position.parameters.stride,
    position.parameters.offset)
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
  window.requestAnimationFrame(render)
}


const step = () => {
  uniforms.time_ms.value = Date.now() - conf.start_ms
}


const handle_controls = () => {
  for (let slider of sliders) {
    const slider_element = document.querySelector(`#${slider.id}`)
    uniforms[slider.id].value =  slider_element.value / (slider_element.max - slider_element.min)
  }
}


const start_render_loop = () => {
  conf.start_render_loop_ms = Date.now()
  render()
}


const start_controls_loop = () => {
  conf.interval_controls_id = setInterval(handle_controls, conf.interval_controls_ms);
}


const start_main_loop = () => {
  conf.start_ms = Date.now()
  conf.interval_main_id = setInterval(step, conf.interval_main_ms);
}


start_render_loop()
start_controls_loop()
start_main_loop()
