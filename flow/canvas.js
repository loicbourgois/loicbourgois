const resize_fullpage = ({
    // DOM element
    canvas, 
    // Scaling factor for the DOW size of the canvas
    canvas_scaling,
    // Scaling factor for the internal resolution of the canvas
    resolution_scaling,
    // 
    alignement,
}) => {
    const width = parseInt(window.innerWidth*canvas_scaling/alignement)*alignement
    const height = parseInt(window.innerHeight*canvas_scaling/alignement)*alignement
    canvas.width = width * resolution_scaling
    canvas.height = height * resolution_scaling
    canvas.style.width = `${parseInt(width)}px`
    canvas.style.height = `${parseInt(height)}px`
    console.log(`
canvas:
    external:   ${canvas.style.width} ${canvas.style.height}
    internal:   ${canvas.width} ${canvas.height}
    alignement: ${alignement}
    pixel:      ${width*resolution_scaling/alignement} ${height*resolution_scaling/alignement} 
    `)
}


export {
    resize_fullpage,
}
