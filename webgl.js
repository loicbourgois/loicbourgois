"use strict";

let
  canvasgl,
  gl,
  program,
  positionLocation,
  texcoordLocation,
  positionBuffer,
  texcoordBuffer,
  texture,
  shadersSources
;

const setupwebgl = (image) => {
  shadersSources = [
    `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;
      void main() {
        // convert the rectangle from pixels to 0.0 to 1.0
        vec2 zeroToOne = a_position / u_resolution;
        // convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;
        // convert from 0->2 to -1->+1 (clipspace)
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        // pass the texCoord to the fragment shader
        // The GPU will interpolate this value between points.
        v_texCoord = a_texCoord;
      }
    `,`
      precision mediump float;

      // our texture
      uniform sampler2D u_image;
      uniform vec2 u_textureSize;
      uniform vec4 u_randoms;

      // the texCoords passed in from the vertex shader.
      varying vec2 v_texCoord;

      void main() {
        vec2 p = v_texCoord;
        float colorUnit = 1.0 / 255.0;
        vec2 pixelUnit = vec2(1.0, 1.0) / u_textureSize;

        vec4 c = texture2D(u_image, p);

        if (${CONF.SATURATE_ON_LOOP}) {
          c.r = c.r + colorUnit;
          if (c.r > 1.0) {
            c.r = 0.0;
          }
          c.g = c.g + colorUnit;
          if (c.g > 1.0) {
            c.g = 0.0;
          }
          c.b = c.b + colorUnit;
          if (c.b > 1.0) {
            c.b = 0.0;
          }
        }

        if (false) {
          if (c.r + c.g + c.b < 0.1 ) {
            c.r = c.r * 0.5;
            c.g = c.g * 0.5;
            c.b = c.b * 0.5;
          }
        }

        c.r = c.r + colorUnit * ${CONF.RGB_TO_ADD};
        c.g = c.g + colorUnit * ${CONF.RGB_TO_ADD};
        c.b = c.b + colorUnit * ${CONF.RGB_TO_ADD};

        c = c * ${CONF.FINAL_MULTIPLIER};

        if (c.r * c.g * c.b > ${CONF.FLASH_REMOVER}) {
          c.r = 0.0;
          c.g = 0.0;
          c.b = 0.0;
        }

        if (${CONF.MODULO_RGB}) {
          c.r = mod(c.r + 1.0, 1.0);
          c.g = mod(c.g + 1.0, 1.0);
          c.b = mod(c.b + 1.0, 1.0);
        }

        if (false) {
          float cr = c.r;
          c.r = c.g;
          c.g = c.b;
          c.b = cr;
        }

        if (${CONF.INVERT}) {
          c.r = 1.0 - c.r;
          c.g = 1.0 - c.g;
          c.b = 1.0 - c.b;
        }

        gl_FragColor = c;

        float randx = fract(p.x + sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453 * u_randoms.x);
        float randy = fract(p.x + sin(dot(p.xy ,vec2(12.898,78.233))) * 43758.5453 * u_randoms.y);
        float randz = fract(p.y*p.x + sin(dot(p.xy ,vec2(12.898,78.233))) * 43758.5453 * u_randoms.z);
        float randq = fract(p.y*p.x + sin(dot(p.xy ,vec2(12.898,78.233))) * 43758.5453 * u_randoms.q);
        if (randx < ${CONF.SPREAD}) {
          float xRight = fract(p.x + pixelUnit.x + 1.0);
          gl_FragColor = texture2D(u_image, vec2(xRight, p.y));
        }
        if (randy < ${CONF.SPREAD}) {
          float xLeft = fract(p.x - pixelUnit.x + 1.0);
          gl_FragColor = texture2D(u_image, vec2(xLeft, p.y));
        }
        if (randq < ${CONF.SPREAD}) {
          float yDown = fract(p.y - pixelUnit.y + 1.0);
          gl_FragColor = texture2D(u_image, vec2(p.x, yDown));
        }
        if (randz < ${CONF.SPREAD}) {
          float yUp = fract(p.y + pixelUnit.y + 1.0);
          gl_FragColor = texture2D(u_image, vec2(p.x, yUp));
        }

      }
    `
  ];

  // Get A WebGL context
  canvasgl = document.querySelector("#canvasgl");
  gl = canvasgl.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  program = webglUtils.createProgramFromSources(gl, shadersSources);

  // look up where the vertex data needs to go.
  positionLocation = gl.getAttribLocation(program, "a_position");
  texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  // Create a buffer to put three 2d clip space points in
  positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set a rectangle the same size as the image.
  setRectangle(gl, 0, 0, image.width, image.height);

  // provide texture coordinates for the rectangle.
  texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,
  ]), gl.STATIC_DRAW);

  // Create a texture.
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
}

function runwebgl(image) {
  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // lookup uniforms
  let resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  let randomsLocation = gl.getUniformLocation(program, "u_randoms");
  let textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the position attribute
  gl.enableVertexAttribArray(positionLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  let size = 2;          // 2 components per iteration
  let type = gl.FLOAT;   // the data is 32bit floats
  let normalize = false; // don't normalize the data
  let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  let offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionLocation, size, type, normalize, stride, offset);

  // Turn on the teccord attribute
  gl.enableVertexAttribArray(texcoordLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  size = 2;          // 2 components per iteration
  type = gl.FLOAT;   // the data is 32bit floats
  normalize = false; // don't normalize the data
  stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      texcoordLocation, size, type, normalize, stride, offset);

  // set uniforms
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform4f(randomsLocation, Math.random(), Math.random(), Math.random(), Math.random());
  gl.uniform2f(textureSizeLocation, image.width, image.height);

  // Draw the rectangle.
  let primitiveType = gl.TRIANGLES;
  let offset2 = 0;
  let count = 6;
  gl.drawArrays(primitiveType, offset2, count);
}

function setRectangle(gl, x, y, width, height) {
  let x1 = x;
  let x2 = x + width;
  let y1 = y;
  let y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}
