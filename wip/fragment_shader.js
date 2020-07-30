const fragment_shader = `#version 300 es
precision highp float;
uniform float time_ms;
uniform float circle_diameter;
uniform int buffer_columns;
uniform int buffer_lines;
uniform vec2 buffer_dimensions;
uniform sampler2D buffer_1;
#define previous_image buffer_1
uniform vec4 seeds;
uniform float birth_rate;
uniform float death_rate;
uniform float scale;
{SLIDERS_DECLARATION}
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
vec4 data_at (sampler2D buffer, vec2 v) {
  return texelFetch(buffer, ivec2(v), 0);
}
vec4 data_at (sampler2D buffer, vec2 v, ivec2 n) {
  return texelFetch(buffer, ivec2(v)+n, 0);
}
vec4 cell_previous_at (vec2 v, ivec2 n) {
  return texelFetch(previous_image, ivec2(v)+n, 0);
}
#define DEAD vec4(0.0, 0.0, 0.0, 1.0)
#define NONE vec4(0.0, 0.0, 0.0, 0.0)
#define UNIT 1.0/255.0
#define DECAY vec4(-UNIT, -UNIT, -UNIT, 0.0)
#define TYPE_SUNLIGHT   1.0/255.0
#define TYPE_PLANT      2.0/255.0
#define TYPE_GROUND     3.0/255.0
#define TYPE_WATER      4.0/255.0
#define TYPE_ROCK       5.0/255.0
#define TYPE_EMPTY      255.0/255.0
#define LIFE g
#define TYPE b
#define WORLD_WIDTH int(buffer_dimensions.x) / buffer_columns
#define WORLD_HEIGHT int(buffer_dimensions.y) / buffer_lines
#define LEFT ivec2(-1,0)
#define RIGHT ivec2(1,0)
#define RIGHT_DOWN ivec2(1,-1)
#define LEFT_DOWN ivec2(-1,-1)
#define RIGHT_UP ivec2(-1,1)
#define LEFT_UP ivec2(-1,1)
#define UP ivec2(0,1)
#define DOWN ivec2(0,-1)
#define CENTER ivec2(0,0)
#define CENTER_UP UP
struct Cell {
  float life;
  float type;
  int x;
  int y;
  float xf;
  float yf;
  bool is_none;
  vec3 color;
  ivec2 buffer_id;
};
ivec2 pos_in_world_from_buffer_pos() {
  ivec2 pos_buffer = ivec2(gl_FragCoord);
  return ivec2(
    pos_buffer.x % (int(buffer_dimensions.x) / buffer_columns),
    pos_buffer.y % (int(buffer_dimensions.y) / buffer_lines)
  );
}
Cell new_cell_at (float type, int x, int y) {
  return Cell(
    1.0,
    type,
    x,
    y,
    float(x),
    float(y),
    false,
    vec3(1.0, 1.0, 1.0),
    ivec2(
      int(gl_FragCoord.x / buffer_dimensions.x * float(buffer_columns)),
      int(gl_FragCoord.y / buffer_dimensions.y * float(buffer_lines))
    )
  );
}
Cell new_cell (float type) {
  vec4 c = vec4(0.0, 0.0, 0.0, 1.0);
  ivec2 pos = pos_in_world_from_buffer_pos();
  return new_cell_at(type, pos.x, pos.y);
}
Cell cell_at_relative(int delta_x, int delta_y) {
  ivec2 pos = pos_in_world_from_buffer_pos();
  int x = pos.x + delta_x;
  int y = pos.y + delta_y;
  vec4 data_color = texelFetch(buffer_1, ivec2(x, y + WORLD_HEIGHT), 0);
  // vec4 data_ = texelFetch(buffer_1, ivec2(x, y), 0);
  vec4 data_life_life_life = texelFetch(buffer_1, ivec2(x + WORLD_WIDTH, y + WORLD_HEIGHT), 0);
  vec4 data_type_type_type = texelFetch(buffer_1, ivec2(x + WORLD_WIDTH, y), 0);
  bool is_none = false;
  if (data_color.a == 0.0) {
    is_none = true;
  }
  return Cell(
    data_life_life_life.LIFE,
    data_type_type_type.TYPE,
    x,
    y,
    float(x),
    float(y),
    is_none,
    vec3(data_color),
    ivec2(
      int(gl_FragCoord.x / buffer_dimensions.x * float(buffer_columns)),
      int(gl_FragCoord.y / buffer_dimensions.y * float(buffer_lines))
    )
  );
}
Cell CR(int delta_x, int delta_y) {
  return cell_at_relative(delta_x, delta_y);
}
Cell CR(ivec2 delta_pos) {
  return cell_at_relative(delta_pos.x, delta_pos.y);
}
const ivec2 neighbours_4[4]=ivec2[4](
  ivec2(0, 1),
  ivec2(0, -1),
  ivec2(1, 0),
  ivec2(1, 0)
);
const ivec2 neighbours_8[8]=ivec2[8](
  ivec2(0, 1),
  ivec2(0, -1),
  ivec2(1, 0),
  ivec2(1, 0),
  ivec2(1, 1),
  ivec2(1, -1),
  ivec2(-1, 1),
  ivec2(-1, -1)
);
int live_neighbours_8_count() {
  int count = 0;
  for(int i = 0 ; i < 8 ; i++) {
    Cell neighbour = CR(neighbours_8[i].x, neighbours_8[i].y);
    if (neighbour.life > 0.0) {
      count += 1;
    }
  }
  return count;
}
int live_neighbours_8_count_of_type(float type) {
  int count = 0;
  for(int i = 0 ; i < 8 ; i++) {
    Cell neighbour = CR(neighbours_8[i].x, neighbours_8[i].y);
    if (neighbour.life > 0.0 && neighbour.type == type) {
      count += 1;
    }
  }
  return count;
}
vec4 cell_top(vec4 f) {
  return cell_previous_at(f.xy, ivec2(0, 1));
}
vec4 cell_bottom(vec4 f) {
  return cell_previous_at(f.xy, ivec2(0, -1));
}
vec4 cell_at(vec4 f, int x, int y) {
  return cell_previous_at(f.xy, ivec2(x, y));
}
int count_neighbours_8(vec4 f, float type) {
  int count = 0;
  for(int i = 0 ; i < 8 ; i++) {
    Cell neighbour = CR(neighbours_8[i].x, neighbours_8[i].y);
    if (neighbour.life > 0.0 && neighbour.type == type) {
      count += 1;
    }
  }
  return count;
}
vec4 get_color(Cell c) {
  if (c.buffer_id.x == 0
    && c.buffer_id.y == 1
  ) {
    if (c.type == TYPE_GROUND) {
      return vec4(0.2, 0.2, .1, 1.0);
    }
    if (c.type == TYPE_WATER) {
      return vec4(c.life*0.2, c.life*0.2, c.life*.9, 1.0);
    }
    if (c.type == TYPE_SUNLIGHT) {
      return vec4(c.life, c.life, c.type, 1.0);
    }
    if (c.type == TYPE_PLANT) {
      return vec4(c.life*0.5, c.life, c.type, 1.0);
    }
    if (c.type == TYPE_EMPTY) {
      return vec4(0.0, 0.0, 0.0, 1.0);
    }
    if (c.type == TYPE_ROCK) {
      return vec4(0.5, 0.3, 0.2, 1.0);
    }
    return vec4(1.0, 0.5, 0.0, 1.0);
  }
  if (c.buffer_id.x == 1
    && c.buffer_id.y == 1
  ) {
    return vec4(c.life, c.life, c.life, 1.0);
  }
  if (c.buffer_id.x == 1
    && c.buffer_id.y == 0
  ) {
    return vec4(c.type, c.type, c.type, 1.0);
  }
  return vec4(0.0, 0.0, 0.0, 1.0);
}
void main() {
  int world_width = WORLD_WIDTH;
  int world_height = WORLD_HEIGHT;
  float t = time_ms * 0.001;
  Cell c = CR(0,0);
  float random_4 = random4(vec4(c.x, c.y, t, seeds.r));
  float random_5 = random4(vec4(c.x, c.y, t, seeds.g));
  float random_6 = random4(vec4(c.x, c.y, t, seeds.b));
  float random_7 = random4(vec4(c.x, c.y, t, seeds.a));
  // Init
  if (c.is_none) {
    int ground_height = int(float(world_height)*0.6);
    if (c.y <= ground_height) {
      c = new_cell(TYPE_GROUND);
    }
    if (c.y <= ground_height
      && c.yf >= float(ground_height)*0.8
      && c.xf >= float(world_width)*0.2
      && c.xf <= float(world_width)*0.4
    ) {
      c = new_cell(TYPE_WATER);
    }
    if (c.yf <= float(ground_height) * 1.1
      && c.yf >= float(ground_height)*0.9
      && c.xf >= float(world_width)*0.6
      && c.xf <= float(world_width)*0.9
    ) {
      c = new_cell(TYPE_ROCK);
    }
    if (c.yf <= float(ground_height) * 1.3
      && c.yf >= float(ground_height)* 1.2
      && c.xf >= float(world_width)*0.7
      && c.xf <= float(world_width)*0.8
    ) {
      c = new_cell(TYPE_WATER);
    }
    if (c.yf <= float(ground_height) * 1.4
      && c.yf >= float(ground_height)*0.9
      && c.xf >= float(world_width)*0.5
      && c.xf <= float(world_width)*0.6
    ) {
      c = new_cell(TYPE_ROCK);
    }
  }
  // Start sunlight
  if (c.type == TYPE_EMPTY
    && random_4 < slider_4
    && c.y > world_height - 3
    && live_neighbours_8_count() == 0
  ) {
    c = new_cell(TYPE_SUNLIGHT);
  }
  // Grow sunlight
  if (c.type == TYPE_EMPTY
    && random_4 < slider_4
    && CR(0,1).type == TYPE_SUNLIGHT
  ) {
    c = new_cell(TYPE_SUNLIGHT);
  }
  // Start plant
  if (CR(0,0).type == TYPE_SUNLIGHT
     && CR(0, -1).type == TYPE_GROUND
     && live_neighbours_8_count_of_type(TYPE_WATER) > 0
     && random_5 < slider_5
  ) {
    c = new_cell(TYPE_PLANT);
  }
  // Grow plant up
  if (random_6 < slider_6
    && CR(0,1).type == TYPE_SUNLIGHT
    && CR(0,1).life >= 0.9
    && CR(1,0).type != TYPE_PLANT
    && CR(-1,0).type != TYPE_PLANT
    && CR(0,-1).type == TYPE_PLANT
  ) {
    c = new_cell(TYPE_PLANT);
  }
  // Grow plant sideway
  int x = 1;
  if (random_7 < slider_7) {
    x = -1;
  }
  if (CR(0,1).type == TYPE_SUNLIGHT
    && CR(0,1).life > 0.1
    && CR(x,0).type == TYPE_PLANT
    && CR(x*-1,0).type != TYPE_PLANT
    && CR(x*-2,0).type != TYPE_PLANT
    && CR(0,-1).type != TYPE_PLANT
    && CR(x*-1,-1).type != TYPE_PLANT
  ) {
    c = new_cell(TYPE_PLANT);
  }
  // Decay sunlight
  if (c.type == TYPE_SUNLIGHT) {
    c.life -= UNIT*10.0;
  }
  // Move water down
  /*if (c.type == TYPE_EMPTY
    && CR(0,1).type == TYPE_WATER
  ) {
    c = new_cell(TYPE_WATER);
  }
  if (CR(0,0).type == TYPE_WATER
    && CR(0,-1).type == TYPE_EMPTY
  ) {
    c.life = 0.0;
  }*/
  // Move water left
  if (CR(CENTER).type == TYPE_EMPTY
    && CR(RIGHT_UP).type == TYPE_WATER
    && CR(RIGHT).type != TYPE_EMPTY
    //&& CR(RIGHT_UP).type == TYPE_WATER
    //&& CR(LEFT).type != TYPE_WATER
  ) {
    c = new_cell(TYPE_WATER);
  }
  if (CR(LEFT).type == TYPE_EMPTY
    && CR(CENTER_UP).type == TYPE_WATER
    && CR(CENTER).type != TYPE_EMPTY
    //&& CR(UP).type == TYPE_WATER
  ) {
    c.life = 0.0;
  }
  // Move water right
  if (CR(CENTER).type == TYPE_EMPTY
    && CR(LEFT).type == TYPE_WATER
    && CR(LEFT_DOWN).type != TYPE_EMPTY
    //&& CR(RIGHT).type != TYPE_WATER
  ) {
    //c = new_cell(TYPE_WATER);
  }
  if (CR(RIGHT).type == TYPE_EMPTY
    && CR(0,0).type == TYPE_WATER
    && CR(DOWN).type != TYPE_EMPTY
  ) {
    //c.life = 0.0;
  }
  // Decay water
  // if (c.type == TYPE_WATER) {
  //  c.life -= UNIT*1.0;
  //}
  // Empty cell
  if (c.life <= 0.0) {
    c.type = TYPE_EMPTY;
  }
  color = get_color(c);
}`

/*
sand
// Move sand down-left
if (c.type == TYPE_EMPTY
  && CR(1,0).type != TYPE_EMPTY
  && CR(1,1).type == TYPE_WATER
) {
  c = new_cell(TYPE_WATER);
}
if (CR(0,0).type == TYPE_WATER
  && CR(0,-1).type != TYPE_EMPTY
  && CR(-1,-1).type == TYPE_EMPTY
) {
  c.life = 0.0;
}
*/
