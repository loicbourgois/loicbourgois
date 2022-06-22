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


// float EPSILON = 0.00001;


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


const int MAX_MARCHING_STEPS = 375;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float PRECISION = 0.001;
const float EPSILON = 0.0005;


struct Surface {
    float sd; // signed distance value
    vec3 col; // color
};


Surface sdFloor(vec3 p, vec3 col) {
  float d = p.y + 1.;
  return Surface(d, col);
}


Surface sdSphere(vec3 p, float r, vec3 offset, vec3 col) {
  return Surface(length(p - offset) - r,  col);
}


Surface opUnion(Surface obj1, Surface obj2) {
  if (obj2.sd < obj1.sd) return obj2;
  return obj1;
}


Surface scene(vec3 p) {
  vec3 floorColor = vec3(0.1 + 0.7*mod(floor(p.x) + floor(p.z), 2.0));
  Surface co = sdFloor(p, floorColor);
  for (float bb = -0.0 ; bb < 5.0 ; bb += 1.0) {
      for (float aa = -5.0 ; aa < 5.0 ; aa += 1.0) {
        co = opUnion(co, sdSphere(p, .2, vec3(aa * 0.5, bb*0.5, -2), vec3(1, 0, 0)));
      }
  }
  return co;
}


Surface rayMarch(vec3 ro, vec3 rd) {
  float depth = MIN_DIST;
  Surface co; // closest object
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    vec3 p = ro + depth * rd;
    co = scene(p);
    depth += co.sd;
    if (co.sd < PRECISION || depth > MAX_DIST) break;
  }
  co.sd = depth;
  return co;
}


vec3 calcNormal(in vec3 p) {
    vec2 e = vec2(1, -1) * EPSILON;
    return normalize(
      e.xyy * scene(p + e.xyy).sd +
      e.yyx * scene(p + e.yyx).sd +
      e.yxy * scene(p + e.yxy).sd +
      e.xxx * scene(p + e.xxx).sd);
}

float softShadow(vec3 ro, vec3 rd, float mint, float tmax) {
  float res = 1.0;
  float t = mint;
  for(int i = 0; i < 16; i++) {
    float h = scene(ro + rd * t).sd;
      res = min(res, 8.0*h/t);
      t += clamp(h, 0.02, 0.10);
      if(h < 0.001 || t > tmax) break;
  }
  return clamp( res, 0.0, 1.0 );
}


void main() {
  float t = time_ms * 0.001;
  // Texel
  vec4 tex = gl_FragCoord;
  // Previous texel color
  vec4 pc = texelFetch(previous_image, ivec2(tex.xy), 0);

  // Point, in [-1,1] space
  vec2 p = position_varying.xy * vec2(buffer_dimensions.x / buffer_dimensions.y, 1.0 );


  vec2 iResolution = buffer_dimensions;
  float iTime = t;

  vec2 uv = p;
  vec3 backgroundColor = vec3(0.65, 0.9, 1.);

  vec3 col = vec3(0);
  vec3 ro = vec3(0, 1, 0.5 ); // ray origin that represents camera position
  vec3 rd = normalize(vec3(uv, -1)); // ray direction

  Surface co = rayMarch(ro, rd); // closest object

  if (co.sd > MAX_DIST) {
    col = backgroundColor; // ray didn't hit anything
  } else {
    vec3 p = ro + rd * co.sd; // point discovered from ray marching
    vec3 normal = calcNormal(p);

    vec3 lightPosition = vec3(cos(iTime), 2, sin(iTime));
    vec3 lightDirection = normalize(lightPosition - p);

    float dif = clamp(dot(normal, lightDirection), 0., 1.) + 0.5; // diffuse reflection

    float softShadow = clamp(softShadow(p, lightDirection, 0.02, 2.5), 0.1, 1.0);

    col = dif * co.col * softShadow;
  }

  col = mix(col, backgroundColor, 1.0 - exp(-0.0002 * co.sd * co.sd * co.sd)); // fog
  col = pow(col, vec3(1.0/2.2)); // Gamma correction
  color = vec4(col, 1.0); // Output to screen


  // color.a = 1.0;
}`
}


export {
  fragment_shader,
}
