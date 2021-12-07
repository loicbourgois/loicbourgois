const fragment_shader = `#version 300 es
precision highp float;
uniform float time_ms;
uniform float circle_diameter;
uniform vec2 buffer_dimensions;
uniform sampler2D previous_image;
uniform vec4 seeds;
uniform float birth_rate;
uniform float death_rate;
uniform float scale;
uniform float mouse_x;
uniform float mouse_y;
uniform float mouse_x_old;
uniform float mouse_y_old;
uniform float mouse_down;
uniform float slider_4;
uniform float slider_5;
in vec4 position_varying;
out vec4 color;
float decimal_part(float f) {
  return f - trunc(f);
}
float random2 (vec2 co) {
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt= dot(co.xy ,vec2(a,b));
  highp float sn= mod(dt,3.14);
  return fract(sin(sn) * c);
}
float random3 (vec3 v) {
    return random2(vec2(v.z, random2(v.xy)));
}
float random4 (vec4 v) {
    return  random2(vec2(random2(vec2(v.rg)), random2(vec2(v.ba))));
}
void main() {
  float t = time_ms * 0.001;
  // coordinates of the current fragment
  // a fragment is the pixel being rendered
  // from [0, 0] to [canvas.width, canvas.height]
  vec4 f = gl_FragCoord;
  vec4 previous_f_color = texelFetch(previous_image, ivec2(f.xy), 0);
  f *= scale;
  // coordinates of the current fragment in clipspace
  // from [-1, -1] to [1, 1]
  vec4 p = position_varying;
  color = vec4(0.0, 0.0, 0.0, 1.0);
  const vec2 neighbours[8]=vec2[8](
  	vec2(0.0, 1.0),
    vec2(0.0, -1.0),
    vec2(1.0, 0.0),
    vec2(-1.0, 0.0),
    vec2(1.0, 1.0),
    vec2(1.0, -1.0),
    vec2(-1.0, 1.0),
    vec2(-1.0, -1.0)
  );
  float birth_random = random4(vec4(p.x, f.y, t, seeds.r));
  float death_random = random4(vec4(p.x, f.y, t, seeds.g));
  int r_count = 0;
  if (birth_random < birth_rate) {
    for(int i = 0 ; i < 8 ; i++) {
      vec4 neighbour_color = texelFetch(previous_image, ivec2(f.x+neighbours[i].x, f.y+neighbours[i].y), 0);
      if (neighbour_color.r > 0.0) {
        r_count += 1;
      }
    }
    if (r_count < 2 || r_count == 5) {
      color.r = seeds.r;
      if (color.r > 0.5) {
        color.r = 1.0;
      }
    } else {
      color.r = 0.0;
    }
  }
  if (previous_f_color.r > 0.01) {
    color.r = previous_f_color.r;
  }
  if (r_count > 6) {
    color.r = 0.0;
  }
  if (death_random < death_rate) {
    color.r = color.r * 0.99;
  }
  if (color.r < 0.25) {
    //color.r = 0.0;
  }
  color.g = sqrt(color.r * 0.5);

  float pen_size = 50.0*slider_4;
  float rate = slider_5;
  if ((gl_FragCoord.x - mouse_x)*(gl_FragCoord.x - mouse_x)+(gl_FragCoord.y - mouse_y)*(gl_FragCoord.y - mouse_y) < pen_size*pen_size) {
    color.b = 1.0;
  }
  if (
    (gl_FragCoord.x - mouse_x)*(gl_FragCoord.x - mouse_x)+(gl_FragCoord.y - mouse_y)*(gl_FragCoord.y - mouse_y) < pen_size*pen_size
    && (mouse_x != mouse_x_old
      || mouse_y != mouse_y_old
    )
    && mouse_down == 1.0
  ) {
    float x_delta = mouse_x - mouse_x_old;
    float y_delta = mouse_y - mouse_y_old;
    color.r = color.r * (1.0-rate)
    + texelFetch(previous_image, ivec2(
      gl_FragCoord.x - x_delta,
      gl_FragCoord.y - y_delta)
    , 0).r * (rate);
  }

  return;
}`
