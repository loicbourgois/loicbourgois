import { draw  } from "./draw.js";
import { compute  } from "./compute.js";
import { setup_members  } from "./member.js";
import { get_teams  } from "./teams.js";
const resize = (canvas) => {
    canvas.width = window.innerWidth*4
    canvas.height = window.innerHeight*4
}
const main = () => {
    document.body.innerHTML = `
        <canvas id="canvas"></canvas>
    `
    const canvas = document.getElementById('canvas')
    const teams = get_teams()
    setup_members(teams)
    resize(canvas)
    const context = canvas.getContext("2d")
    loop(context, teams)
}
const loop = (context, teams) => {
    for (let _ = 0; _ < 100; _++) {
        compute(teams)
    }
    draw(context, teams)
    window.requestAnimationFrame(() => {
        loop(context, teams)
    });
}
main()
