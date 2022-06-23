const slider_uniforms = (x) => {
  return x.map(xx => `uniform float ${xx.id};`).join("\n")
}


const fragment_shader = (x) => { return `#version 300 es
precision highp float;
${slider_uniforms(x.sliders)}
uniform float time_ms;
uniform float circle_diameter;
uniform vec2 buffer_dimensions;
uniform sampler2D previous_image;
uniform vec4 seeds;


in vec4 position_varying;
out vec4 color;


float EPSILON = 0.00001;


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


float dist (vec2 v) {
  return sqrt( v.x * v.x + v.y * v.y );
}


// Smoothsetp
//  a: input value
//  d: distance
//  s: spread
float ss (float a, float d, float s) {
  float min_ = d - s;
  float max_ = d + s;
  return (max(min_, min(max_, a) ) - min_) / (max_-min_);
}


struct Object {
  vec3 c;
  float d;
};


Object object_0(vec2 p) {
  vec2 q = p - vec2(0.0);
  float d = 1.0 - ss(dist(q), 0.5, 0.5);
  vec3 c = vec3(d*0.2);
  return Object (c,d);
}


Object object_1(vec2 p) {
  vec2 q = p - vec2(0.0);
  float d = 1.0 - ss(dist(q), 0.25, 0.1);
  vec3 c = vec3(0.0, 0.0, d);
  return Object (c, d);
}


Object object_2(vec2 p) {
  vec2 q = p;
  float d = 1.0 - abs( ss( abs(p.y)*0.99, 0.1, 0.01) );
  d *= 1.0 - abs(p.x);
  vec3 c = vec3(d, d, 0.0);
  return Object (c, d);
}


Object object(int i, vec2 p) {
  switch (i) {
    case 0:
        return object_0(p);
    case 1:
        return object_1(p);
    case 2:
        return object_2(p);
  }
}


void main() {
  float t = time_ms * 0.001;
  // Texel
  vec4 tex = gl_FragCoord;
  // Previous texel color
  vec4 pc = texelFetch(previous_image, ivec2(tex.xy), 0);

  // Point, in [-1,1] space
  vec2 p = position_varying.xy * vec2(buffer_dimensions.x / buffer_dimensions.y, 1.0 );
   p.x += 0.5*sin(t*5.);
  // p.y += 0.5*sin(t*3.);
  vec2 q = p.xy - vec2(0.0);
  color = pc;
  color = vec4(vec3(0.), 1.0);


  // let
  //float c =
  float d = 0.0;
  for (int i = 2 ; i >= 0 ; i-=1) {
    Object r = object(i, p);
    d += r.d;
    color.rgb += r.c;
    if (d >= 1.0  ) {
      break;
    }
    //  if
  }
  //
  // if (distances[0] > distances[1]) {
  //   color.rgb = colors[0] * distances[0];
  // } else {
  //   color.rgb = colors[1] * distances[1];
  // }

  // if (pc.a == 0.0) {
  //   color.r = ;
  //   color.a = 1.0;
  // } else {
  //   color = pc;
  // }
  // color.b = slider_8;
  vec4 pc_ = texelFetch(previous_image, ivec2(tex.xy+vec2(cos(t*5.0)*100.0, 100.0 + sin(t)*1.0)), 0);
  color += pc_ * 0.7;
  color.a = 1.0;
}`
}


export {
  fragment_shader,
}
