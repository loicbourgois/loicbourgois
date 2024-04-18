import { 
    remaining_life_percent, 
    remaining_mana_percent,
    remaining_timer_percent,
    get_team_life_ratio,
    get_team_level,
} from "./member.js";
const draw_zoom = 0.2;
const bar_size = 0.03;
const draw = (context, teams) => {
    clear(context)
    for (const team of teams) {
        for (const member of team.members) {
            if (member.decision) {
                const target = member.decision.target.function(teams, member.mid)
                if (target) {
                    draw_line(
                        context, 
                        member.position, 
                        target.position,
                    )
                }
            }
        }
    }
    for (const team of teams) {
        const team_life_ratio = get_team_life_ratio(team)
        const team_level = get_team_level(team)
        if (team.side == "left") {
            fill_text(
                context,
                {
                    x: -0.39,
                    y: 2.0,
                },
                `level ${team_level}`
            )
            fill_rectangle_2(
                context,
                {
                    x: 0,
                    y: 0,
                },
                {
                    w: 0.49,
                    h: 0.02,
                },
                "#484",
            )
            fill_rectangle_2(
                context,
                {
                    x: 0,
                    y: 0,
                },
                {
                    w: 0.49*team_life_ratio,
                    h: 0.02,
                },
                "#4F4",
            )
        } else {
            fill_text(
                context,
                {
                    x: 0.1,
                    y: 2.0,
                },
                `level ${team_level}`
            )
            fill_rectangle_2(
                context,
                {
                    x: 1.0-0.49,
                    y: 0,
                },
                {
                    w: 0.49,
                    h: 0.02,
                },
                "#484",
            )
            fill_rectangle_2(
                context,
                {
                    x: 1.0-0.49*team_life_ratio,
                    y: 0,
                },
                {
                    w: 0.49*team_life_ratio,
                    h: 0.02,
                },
                "#4F4",
            )
        }
        for (const member of team.members) {
            const base_bar_width = member.size * 3
            fill_circle(
                context,
                member.position,
                member.size,
                "#fff",
            )
            fill_rectangle(
                context,
                {
                    x: member.position.x+member.size*0.5,
                    y: member.position.y+member.size*0.5,
                },
                {
                    w: base_bar_width,
                    h: bar_size,
                },
                "#484",
            )
            fill_rectangle(
                context,
                {
                    x: member.position.x+member.size*0.5,
                    y: member.position.y+member.size*0.5,
                },
                {
                    w: base_bar_width*remaining_life_percent(member),
                    h: bar_size,
                },
                "#2f2",
            )
            fill_rectangle(
                context,
                {
                    x: member.position.x+member.size*0.5,
                    y: member.position.y+member.size*0.5-bar_size,
                },
                {
                    w: base_bar_width,
                    h: bar_size,
                },
                "#448",
            )
            fill_rectangle(
                context,
                {
                    x: member.position.x+member.size*0.5,
                    y: member.position.y+member.size*0.5-bar_size,
                },
                {
                    w: base_bar_width*remaining_mana_percent(member),
                    h: bar_size,
                },
                "#88F",
            )

            fill_rectangle(
                context,
                {
                    x: member.position.x+member.size*0.5,
                    y: member.position.y+member.size*0.5-bar_size*2,
                },
                {
                    w: base_bar_width,
                    h: bar_size*0.5,
                },
                "#884",
            )
            fill_rectangle(
                context,
                {
                    x: member.position.x+member.size*0.5,
                    y: member.position.y+member.size*0.5-bar_size*2,
                },
                {
                    w: base_bar_width*remaining_timer_percent(member),
                    h: bar_size*0.5,
                },
                "#ff0",
            )
            if (member.decision) {
                fill_text(
                    context,
                    {
                        x: member.position.x + member.size*0.5,
                        y: member.position.y + member.size*0.5-bar_size*5,
                    },
                    member.decision.action.label
                )
            }
            // const size = 0.15
            // let margin = 0
            // if (team.side != "left") {
            //     margin = context.canvas.width - min_dim(context)*size
            // }
            // const p = {
            //     x:min_dim(context)*size*0.5 + margin,
            //     y:min_dim(context)*size*(member.order_position+0.5),
            // }
            // draw_head(context, p, size, get_head())
        }
    }
}
const clear = (context) => {
    context.clearRect(0,0,context.canvas.width, context.canvas.height)
}
const fill_text = (context, p, text, size=40, color="#fff") => {
    text = ""+`${text}`
    const cc = context_coordinates(context, p)
    context.font = `${size}px monospace`;
    context.fillStyle = color
    context.fillText(
      text,
      cc.x,
      cc.y 
    );
  }
const rand = (a,b,c) => {
    if (c) {
        return ((c-b)*Math.random()+b)*a
    } else {
        if (a>b) {
            console.error(a, b)
        }
        return (b-a)*Math.random()+a
    }
}
const get_head = () => {
    let min_eye = 0.15
    let eye_size = rand(min_eye, 0.3)
    let eye_inner_size = rand(eye_size, 0.3, 0.5)
    let eye_y = rand(eye_size*0.51, min_eye*1.1)
    let mouth_size = rand(0.05, 0.2)
    let head = [
        [0,   0.,    0.8,    "#26a"],
        [eye_y,   0.1,    eye_size,    "#fff"],
        [-eye_y,  0.1,    eye_size,    "#fff"],
        [eye_y,   0.1,    eye_inner_size,    "#000"],
        [-eye_y,  0.1,    eye_inner_size,    "#000"],
        [0,  -0.2,    mouth_size,    "#000"],
    ]
    return head
}
const draw_head = (context, p, size, head) => {
    fill_circle_2(
        context,
        p,
        size*0.75,
        "#444",
    )
    for (const part of head) {
        fill_circle_2(
            context,
            {
                x:p.x + part[0]*size*min_dim(context),
                y:p.y - part[1]*size*min_dim(context)
            },
            size*part[2],
            part[3],
        )
    }
} 
const fill_circle_2 = (context, p, diameter, color) => {
    const cc = p
    const radius = diameter * min_dim(context) * 0.5;
    context.beginPath();
    context.arc(cc.x, cc.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
  }
const fill_circle = (context, p, diameter, color) => {
    const cc = context_coordinates(context, p)
    const radius = diameter * min_dim(context) * 0.5 * draw_zoom;
    context.beginPath();
    context.arc(cc.x, cc.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
}

const fill_rectangle = (context, p, dimensions, color) => {
    const cc = context_coordinates(context, p)
    context.fillStyle = color;
    context.fillRect(
        cc.x,cc.y,
        dimensions.w*draw_zoom*min_dim(context), 
        dimensions.h*draw_zoom*min_dim(context),
    );
}
const fill_rectangle_2 = (context, p, dimensions, color) => {
    const cc = p
    context.fillStyle = color;
    context.fillRect(
        cc.x*context.canvas.width,
        cc.y*context.canvas.height,
        dimensions.w*context.canvas.width,
        dimensions.h*min_dim(context),
    );
}
const context_coordinates = (context, p) => {
    const draw_center = [0.0, 0.0]
    return {
      x: min_dim(context) * ((p.x - draw_center[0]) * draw_zoom + 0.5) 
        + (context.canvas.width-min_dim(context))*0.5,
      y: context.canvas.height - min_dim(context) * ((p.y - draw_center[1]) * draw_zoom + 0.5)
        - (context.canvas.height-min_dim(context))*0.5
    }
}
const min_dim = (context) => {
    return Math.min(context.canvas.width, context.canvas.height)
}
const min_dim_ratio_width = (context) => {
    return context.canvas.width/min_dim(context)
}
const min_dim_ratio_height = (context) => {
    return context.canvas.height/min_dim(context)
}
const draw_line = (context, a, b) => {
    const cca = context_coordinates(context, a)
    const ccb = context_coordinates(context, b)
    context.beginPath(); // Start a new path
    context.moveTo(cca.x, cca.y); // Move the pen to (30, 50)
    context.lineTo(ccb.x, ccb.y); // Draw a line to (150, 100)
    context.strokeStyle = "#fff";
    context.stroke(); // Render the path
}
export {
    draw,
    get_head,
    min_dim,
    draw_head,
}
