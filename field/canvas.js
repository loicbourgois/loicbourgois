const resize_square = ({
    // DOM element
    canvas, 
    // Scaling factor for the DOW size of the canvas
    canvas_scaling,
    // Scaling factor for the internal resolution of the canvas
    resolution_scaling,
    // 
    alignement,
}) => {
    let dim = Math.min(window.innerWidth, window.innerHeight)
    dim = parseInt(dim*canvas_scaling/alignement)*alignement
    canvas.width = dim*resolution_scaling
    canvas.height = dim*resolution_scaling
    canvas.style.width = `${parseInt(dim)}px`
    canvas.style.height = `${parseInt(dim)}px`
    console.log(`
canvas:
    external:   ${canvas.style.width} ${canvas.style.height}
    internal:   ${canvas.width} ${canvas.height}
    alignement: ${alignement}
    pixel:      ${dim*resolution_scaling/alignement}
    `)
}

export {
    resize_square,
}
