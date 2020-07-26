const fragment_shader = `#version 300 es
precision highp float;
uniform float time_ms;
uniform float circle_diameter;
uniform vec2 buffer_dimensions;
uniform sampler2D previous_image;
uniform vec4 seeds;
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
    //f.x += time;
  f /= 4.0;
  // coordinates in clipspace
  // from [-1, -1] to [1, 1]
  vec4 p = position_varying;
  color = vec4(0.0, 0.0, 0.0, 1.0);


  const vec2 pairs[8]=vec2[8](
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
  float r = random4(vec4(p.x, f.y, t, seeds.r));
  if (r < 0.01 ) {
    for(int i = 0 ; i < 8 ; i++) {
      if (texelFetch(previous_image, ivec2(f.x+pairs[i].x, f.y+pairs[i].y), 0).r > 0.0) {
        r_count = r_count + 1;
      }
    }
    if (r_count < 2 || r_count == 5) {
      color.r = 1.0;
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

  if (random4(vec4(p.x, f.y, t, seeds.g)) < 0.09) {
    color.r = color.r * 0.99;
  }

  if (color.r < 0.25) {
    color.r = 0.0;
  }
  //color.r = sqrt(color.r* 0.5);
  color.g = sqrt(color.r * 0.5);
  //color.b = (1.0 - sqrt(color.r) * sqrt(color.r)) * 0.25 ;
  return;


  int b_count = 0;
  float b = random4(vec4(seeds.b, f.x, t, p.y));
  if (b < 0.00001 ) {
    for(int i = 0 ; i < 8 ; i++) {
      if (texelFetch(previous_image, ivec2(f.x+pairs[i].x, f.y+pairs[i].y), 0).b > 0.0) {
        b_count = b_count + 1;
      }
    }
    if (b_count < 2 || b_count == 5) {
      //color.b = 1.0;
    } else {
      color.b = 0.0;
    }
  }
  if (previous_f_color.b > 0.5) {
    //color.b = 1.0;
  }

  //color.b = texelFetch(previous_image, ivec2(f.x * 0.1, f.y*0.1), 0).r;
  //color.g = texelFetch(previous_image, ivec2(f.x * 0.01, f.y*0.01), 0).r * 0.5;

  return;
  if (p.x > 0.0) {
    color.g = 1.0;
  }
  if (p.y > 0.0) {
    color.b = 1.0;
  }
  if (sqrt(p.x*p.x + p.y*p.y) < circle_diameter*0.5) {
    color.r = {RED_AMOUNT};
  }
  color.r = color.r * (1.0 - decimal_part(t));
  if (trunc(f.x) == trunc(buffer_dimensions.x / 3.0)) {
    color.b = 1.0;
  }
  if (trunc(f.y) == trunc(buffer_dimensions.y / 3.0)) {
    color.g = 1.0;
  }
  //return;
  float a = 0.98;
  color.r = (color.r * (1.0-a) + previous_f_color.r * a);
    float ts = (sin(t*4.0) + 1.0) * 0.5 + 0.2;
  p.x = p.x * ts;
  f.x = f.x + 40.0;
  if (sqrt(p.x*p.x + p.y*p.y) < 0.4*ts) {
    color = texelFetch(previous_image, ivec2((f.xy - buffer_dimensions*0.25)*(2.0)), 0);
    color = color.brga;
  }
  f.x = f.x - 40.0;
  f.y = f.y ;
  color = (color + texelFetch(previous_image, ivec2(f.x, f.y* (sin(t*2.8) + 1.5) * sqrt(p.x*p.x + p.y*p.y)), 0)) * 0.5;
  color = color *  1.2;
  f.x = f.x + 40.0;
  if (sqrt(p.x*p.x + p.y*p.y) < 0.4*ts) {
    color = texelFetch(previous_image, ivec2((f.xy - buffer_dimensions*0.25)*(2.0)), 0);
    color = color.brga;
  }
}`
