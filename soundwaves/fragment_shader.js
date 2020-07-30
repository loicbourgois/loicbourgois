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
uniform float slider_4;
uniform float slider_5;
uniform float slider_6;
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
vec4 color_previous_at (vec2 v) {
  return texelFetch(previous_image, ivec2(v), 0);
}
vec4 color_previous_at (vec2 v, ivec2 n) {
  return texelFetch(previous_image, ivec2(v)+n, 0);
}
#define BLACK vec4(0.0, 0.0, 0.0, 1.0)
#define NONE vec4(0.0, 0.0, 0.0, 0.0)
#define COLOR_UNIT 1.0/255.0
#define DECAY vec4(-COLOR_UNIT, -COLOR_UNIT, -COLOR_UNIT, 0.0)
void main() {
  float t = time_ms * 0.001;
  // coordinates of the current fragment
  // a fragment is the pixel being rendered
  // from [0, 0] to buffer_dimensions
  vec4 f = gl_FragCoord;
  f /= scale;
  f += vec4(-100.0*slider_4*scale, -100.0*slider_5*scale, 0.0, 0.0);
  vec4 color_previous = color_previous_at(f.xy);
  // coordinates of the current fragment in clipspace
  // from [-1, -1] to [1, 1]
  vec4 p = position_varying;
  float birth_random = random4(vec4(p.x, f.y, t, seeds.a));
  float death_random = random4(vec4(p.y, f.x, t, seeds.a));

  if (color_previous == BLACK || color_previous == NONE) {
    if (birth_random < birth_rate) {
      color.r = random4(vec4(p.x, f.y, t, seeds.r));
      color.g = random4(vec4(p.x, f.y, t, seeds.g));
      color.b = random4(vec4(p.x, f.y, t, seeds.b));
      color.a = 1.0;
    }
  }
  else if (color_previous_at(f.xy, ivec2(0,1)).r > color_previous.r) {
    color = color_previous_at(f.xy, ivec2(0,1));
  }
  else {
    color = color_previous;
  }
  if (death_random < death_rate) {
    //color.r = color_previous.r - COLOR_UNIT;
    color = color_previous + DECAY;
  }
  color.a = 1.0;


  /*
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
    color.r = 0.0;
  }
  color.g = sqrt(color.r * 0.5);
  */
}`
