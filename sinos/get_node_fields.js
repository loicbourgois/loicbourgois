const get_node_fields = (kind, name, a) => {
    let node_fields = ""
    if (kind == "gain") {
        node_fields = `
            <div>
                <span>gain:</span>
                <span id="${name}.gain">-</span>
            </div>
            <div>
                <span>l gain:</span>
                <span id="${name}.l_gain">-</span>
            </div>
        `
    } else if (kind == "osc") {
        node_fields = `
            <div>
                <span>type:</span>
                <span id="${name}.type">${a}</span>
            </div>
            <div>
                <span>freq:</span>
                <span id="${name}.frequency">-</span>
            </div>
            <div>
                <span>l freq:</span>
                <span id="${name}.lf">-</span>
            </div>
        `
    } else if (kind == "osc2") {
        node_fields = `
            <div>
                <span>type:</span>
                <span id="${name}.type">${a}</span>
            </div>
            <div>
                <span>f1:</span>
                <span id="${name}.f1">-</span>
            </div>
            <div>
                <span>f2:</span>
                <span id="${name}.f2">-</span>
            </div>
            <div>
                <span>l freq:</span>
                <span id="${name}.lf">-</span>
            </div>
        `
    } else if (kind == "clock") { 
        node_fields = `
            <div>
                <span>bpm:</span>
                <span id="${name}.bpm">-</span>
            </div>
            <div>
                <span>x:</span>
                <span id="${name}.x">-</span>
            </div>
            <div>
                <span>y:</span>
                <span id="${name}.y">-</span>
            </div>
            <canvas  id="${name}.canvas" class="clock_canvas"></canvas>
        `
    } else if (kind == "clock_mult") { 
        node_fields = `
            <div>
                <span>mult:</span>
                <span id="${name}.multiplier">-</span>
            </div>
            <div>
                <span>x:</span>
                <span id="${name}.x">-</span>
            </div>
            <div>
                <span>y:</span>
                <span id="${name}.y">-</span>
            </div>
            <canvas  id="${name}.canvas" class="clock_mult_canvas"></canvas>
        `
    } else if (kind == "shaper") {
        node_fields = `
            <div>
                <span>a:</span>
                <span id="${name}.a">-</span>
            </div>
            <div>
                <span>x:</span>
                <span id="${name}.x">-</span>
            </div>
            <div>
                <span>y:</span>
                <span id="${name}.y">-</span>
            </div>
            <canvas  id="${name}.canvas" class="shaper_canvas"></canvas>
        `
    } else if (kind == "delay") { 
        node_fields = `
            <div>
                <span>delay:</span>
                <span id="${name}.delay">-</span>
            </div>
        `
    } else {
        throw new Error(`html invalid kind: ${kind}`);
    }
    return node_fields
}

export {
    get_node_fields,
}
