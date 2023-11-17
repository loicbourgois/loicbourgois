import { draw  } from "./draw.js";
import { setup_members, get_teams  } from "../member.js";
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
    draw(context, teams)
}
main()
