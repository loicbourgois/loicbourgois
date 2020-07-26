//start_gl("canvas1", getStringFromDOMElement('vs'), getStringFromDOMElement('fs'))

const points = {
  length: 6,
  dimensions: 1,
  data: [
    [100, 10, 20, 50, 100, 50]
  ]
}

const direction = [0.2, 0.1, 0.5]
console.log(JSON.stringify(points, null, 2))
const canvas = document.querySelector('#canvas')
const gl = canvas.getContext('webgl2')
const vertex_shader_source = document.querySelector('#vertex-shader').text
const fragment_shader_source = document.querySelector('#fragment-shader').text
const vertex_shader = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_source)
const fragment_shader = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_source)
const program = create_program(gl, [
  vertex_shader,
  fragment_shader
])
const position_location = gl.getAttribLocation(program, 'position')
const texture_coords_location = gl.getAttribLocation(program, 'texture_coords')
const texture_location = gl.getUniformLocation(program, "texture_uniform")
//gl.uniform1i(texture_coords_location, 0);
const position_buffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer)
const positions = [
  -1, 1,
  -1, -1,
  1, 1,
  -1, -1,
  1, -1,
  1, 1,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(position_location);
const size = 2;          // 2 components per iteration
const type = gl.FLOAT;   // the data is 32bit floats
const normalize = false; // don't normalize the data
const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
const offset = 0;        // start at the beginning of the buffer
gl.vertexAttribPointer(position_location, size, type, normalize, stride, offset)


// create the texcoord buffer, make it the current ARRAY_BUFFER
// and copy in the texcoord values
var texcoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
function setTexcoords(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // left column front
      0, 0,
      0, 1,
      1, 0,
      0, 1,
      1, 1,
      1, 0
    ]),
    gl.STATIC_DRAW);
}
setTexcoords(gl);

// Turn on the attribute
gl.enableVertexAttribArray(texture_coords_location);


var normalize_2 = false;
gl.vertexAttribPointer(
    texture_coords_location, size, type, normalize_2, stride, offset);


const alignment = 1;
//gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);


var texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

// fill texture with 3x2 pixels
const level_2 = 0;
const internalFormat = gl.R32F;
const width = 6;
const height = 1;
const border = 0;
const format = gl.RED;
const type_3 = gl.FLOAT;
const data = new Float32Array(points.data[0]);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, level_2, internalFormat, width, height, border,
              format, type_3, data);
// set the filtering so we don't need mips and it's not filtered
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);








resize_canvas(gl.canvas);
console.log(canvas)
//canvas.width = 6;
//canvas.height = 1;






//gl.drawArrays(primitiveType, offset, count);

console.log("multiply by 0.01")


// create to render to
const targetTextureWidth = 6;
const targetTextureHeight = 1;
const targetTexture = gl.createTexture();


gl.bindTexture(gl.TEXTURE_2D, targetTexture);
  const level_4 = 0;
  const internalFormat_4 = gl.RGBA;
  const border_4 = 0;
  const format_4 = gl.RGBA;
  const type_4 = gl.UNSIGNED_BYTE;
  const data_4 = null;

  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, level_4, internalFormat_4,
                targetTextureWidth, targetTextureHeight, border_4,
                format_4, type_4, data_4);
  // set the filtering so we don't need mips
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // Create and bind the framebuffer

  gl.bindTexture(gl.TEXTURE_2D, targetTexture);

  // attach the texture as the first color attachment
  // Create and bind the framebuffer
const fb = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

// attach the texture as the first color attachment
const attachmentPoint = gl.COLOR_ATTACHMENT0;
gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level_4);



const draw = () => {
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.uniform1i(texture_location, 0);
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = positions.length / size;
  gl.drawArrays(primitiveType, offset, count);
}




{
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);
  clear_buffer(gl)
  draw()
  console.log(fb)
}


{
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.bindVertexArray(vao);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  clear_buffer(gl)
  draw()
}






console.log(JSON.stringify(points, null, 2))
