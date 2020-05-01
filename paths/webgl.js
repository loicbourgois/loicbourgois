"use strict";

let
  canvasgl,
  gl, // WebGL context
  program,
  texture,
  shadersSources,
  positionLocation,
  texcoordLocation,
  positionBuffer,
  texcoordBuffer
;


const initWebgl = (image) => {
  shadersSources = [
    `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;

      void main() {
        // convert the rectangle from pixels to 0.0 to 1.0
        // convert from 0->1 to 0->2
        // convert from 0->2 to -1->+1 (clipspace)
        vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

        // Pass the texCoord to the fragment shader
        // The GPU will interpolate this value between points.
        v_texCoord = a_texCoord;
      }
    `,
    `
      precision mediump float;

      uniform sampler2D u_image;
      uniform vec2 u_textureSize;
      uniform vec4 u_randoms;

      // TexCoords passed in from the vertex shader
      varying vec2 v_texCoord;


      //
      float score(vec4 c) {
        float max_ = max(max(c.r, c.g), c.b);
        float min = min(min(c.r, c.g), c.b);
        float diff = max_ - min;
        float sum_ = c.r + c.g + c.b;
        float square_sum_ = c.r * c.r + c.g * c.g + c.b * c.b;
        float score =
          square_sum_ * min * diff * max_
          + sum_ * diff
          - sum_
          + c.g * c.b * ( 1.0-c.r)
            * ( 0.5 - c.b)
          /*+ c.r * 0.0
          + c.g * -1.0
          + c.b * 0.0
          + max_ * 0.0
          + c.r * c.g
          + c.r * c.b * -0.3
          + c.g * c.b
          + c.r * (0.5 - c.g) * c.b*/
        ;
        return score;

        score = 0.0
          + c.r * diff * min
          + c.g * diff * min
          + c.b * diff * min
          - min
          - c.r * c.g * c.b * 0.1
        ;

        return score;
      }


      //
      void main() {
        // Constants
        bool NO_BLACK = false;
        bool PIVOT = true;
        float COLOR_UNIT = 1.0 / 255.0;
        vec2 PIXEL_UNIT = vec2(1.0, 1.0) / u_textureSize;

        // Pixel
        vec2 p = v_texCoord;

        // Color
        vec4 c = texture2D(u_image, p);

        // Randoms
        float randx = fract(p.x + sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453 * u_randoms.x);
        float randy = fract(p.x + sin(dot(p.xy ,vec2(12.898,78.233))) * 43758.5453 * u_randoms.y);
        float randz = fract(p.y * p.x + sin(dot(p.xy ,vec2(12.898,78.233))) * 43758.5453 * u_randoms.z);
        float randq = fract(p.y * p.x + sin(dot(p.xy ,vec2(12.898,78.233))) * 43758.5453 * u_randoms.q);
        float randxy = randx + randy;
        float randzq = randz + randq;
        float randxq = randx + randq;

        // Neighbours
        float x_right = fract(p.x + PIXEL_UNIT.x);
        float x_left = fract(p.x - PIXEL_UNIT.x);
        float y_up = fract(p.y + PIXEL_UNIT.y);
        float y_down = fract(p.y - PIXEL_UNIT.y);

        vec2 p_right = vec2(x_right, p.y);
        vec2 p_left = vec2(x_left, p.y);
        vec2 p_up = vec2(p.x, y_up);
        vec2 p_down = vec2(p.x, y_down);

        vec4 c_right = texture2D(u_image, p_right);
        vec4 c_left = texture2D(u_image, p_left);
        vec4 c_up = texture2D(u_image, p_up);
        vec4 c_down = texture2D(u_image, p_down);

        float r_sum = c_right.r + c_left.r + c_up.r + c_down.r;
        float g_sum = c_right.g + c_left.g + c_up.g + c_down.g;
        float b_sum = c_right.b + c_left.b + c_up.b + c_down.b;
        float a_sum = c_right.a + c_left.a + c_up.a + c_down.a;

        float life_right = c_right.r + c_right.g + c_right.b;
        float life_left = c_left.r + c_left.g + c_left.b;
        float life_up = c_up.r + c_up.g + c_up.b;
        float life_down = c_down.r + c_down.g + c_down.b;

        float neighbour_count = 0.0;
        if (life_right > 0.0) {
          neighbour_count += 1.0;
        }
        if (life_left > 0.0) {
          neighbour_count += 1.0;
        }
        if (life_up > 0.0) {
          neighbour_count += 1.0;
        }
        if (life_down > 0.0) {
          neighbour_count += 1.0;
        }

        // Prolong
        // if only one neighbour
        if (
          randxy < 0.5
          && neighbour_count == 1.0
        ) {
          float r = r_sum / neighbour_count;
          float g = g_sum / neighbour_count;
          float b = b_sum / neighbour_count;
          c = vec4(r, g, b, 1.0);
        }


        // Mutation
        if (true
          && c.r + c.g + c.b > 0.0
          && randxy < 0.5
        ) {
          float mutation = 0.05;
          float r = c.r;
          r = r + mutation * (fract(randzq) - 0.5);
          r = max(0.0, min(1.0, r));

          float g = c.g;
          g = g + mutation * (fract(randz) - 0.5);
          g = max(0.0, min(1.0, g));

          float b = c.b;
          b = b + mutation * (fract(randq) - 0.5);
          b = max(0.0, min(1.0, b));

          c = vec4(r, g, b, 1.0);
        }


        // Fight
        if ( true
          //&& randxy < 0.5
          && neighbour_count > 1.0
          &&  ( c.r + c.g + c.b > 0.0 || NO_BLACK)
        ) {
          // Choose fighter
          float neighbour = fract(randxq * randxq * 8847.0);
          float n = 4.0;
          vec4 c_new = c;
          if (neighbour < 1.0 / n) {
            if (life_right > 0.0) {
              c_new = c_right;
            }
          } else if (neighbour < 2.0 / n) {
            if (life_up > 0.0) {
              c_new = c_up;
            }
          } else if (neighbour < 3.0 / n) {
            if (life_left > 0.0) {
              c_new = c_left;
            }
          } else if (neighbour < 4.0 / n) {
            if (life_down > 0.0) {
              c_new = c_down;
            }
          }

          // Pivot
          vec4 c_pivot = c;
          if (PIVOT) {
            float pivot = c_pivot.r;
            c_pivot.r = c_pivot.g;
            c_pivot.g = c_pivot.b;
            c_pivot.b = pivot;
          }

          // Fight
          if (score(c_new) > score(c_pivot)) {
            c = c_new;
          }
        }

        if (false) {
          float max_ = max(max(c.r, c.g), c.b);
          c.r = c.r / max_;
          c.g = c.g / max_;
          c.b = c.b / max_;
        }

        if (false) {
          float mult = 0.999;
          c.r = c.r * mult;
          c.g = c.g * mult;
          c.b = c.b * mult;
        }

        // Create new spawn
        if (randxy < 0.00001
          // && neighbour_count == 0.0
        ) {
          c = vec4(randz, fract(randzq), fract(randzq*fract(randzq)), 1.0);
        }

        // Assign color
        gl_FragColor = c;
      }
    `
  ];

  // Get A WebGL context
  canvasgl = document.querySelector('#canvasgl');
  gl = canvasgl.getContext('webgl');
  if (!gl) {
    return;
  }

  // Setup GLSL program
  program = webglUtils.createProgramFromSources(gl, shadersSources);

  // Look up where the vertex data needs to go
  positionLocation = gl.getAttribLocation(program, "a_position");
  texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  // Create a buffer to put three 2d clip space points in
  positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set a rectangle the same size as the image
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

  // Create a texture
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we can render any size image
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Resize canvas
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
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

  // set uniforms
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform4f(randomsLocation, Math.random(), Math.random(), Math.random(), Math.random());
  gl.uniform2f(textureSizeLocation, image.width, image.height);

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

  // Draw the rectangle.
  let primitiveType = gl.TRIANGLES;
  let offset2 = 0;
  let count = 6;
  gl.drawArrays(primitiveType, offset2, count);
}
