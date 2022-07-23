const bob = `
  precision mediump float;

  uniform sampler2D u_image;
  uniform vec2 u_textureSize;
  uniform vec4 u_randoms;

  // TexCoords passed in from the vertex shader
  varying vec2 v_texCoord;

  void main() {
    // Constants
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

    float a_sum = c_right.a + c_left.a + c_up.a + c_down.a;
    float r_sum = c_right.r + c_left.r + c_up.r + c_down.r;
    float g_sum = c_right.g + c_left.g + c_up.g + c_down.g;
    float b_sum = c_right.b + c_left.b + c_up.b + c_down.b;

    // // Prolong
    // if (randxy < 0.5) {
    //   // Only one neighbour
    //   if (r_sum == 1.0) {
    //     c = vec4(1.0, g_sum/r_sum, 0.0, 1.0);
    //   }
    // }
    //
    // //c.g += COLOR_UNIT*1.0;
    // //c.g = fract(c.g * 1.1);
    // c.b = fract(c.b + COLOR_UNIT) * c.r;
    //
    // // Die
    // if (r_sum > 3.0) {
    //   //c = vec4(0.0, 0.0, 0.0, 1.0);
    // }
    // if (r_sum == 0.0 && randxy < 1.0) {
    //   //c = vec4(0.0, 0.0, 0.0, 1.0);
    // }
    //
    // // Create new spawn
    // if (randxy < 0.0001) {
    //   c = vec4(1.0, fract(randzq), 0.0, 1.0);
    // }
    //
    // c.g = fract(c.g - COLOR_UNIT) * c.r;


    // Assign color
    gl_FragColor = c;
  }
`;
