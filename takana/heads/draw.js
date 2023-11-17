import {
    get_head,
    min_dim,
    draw_head,
} from '../draw.js'
const draw = (context) => {
    for (let x = 0; x < 7; x++) {
        for (let y = 0; y < 6; y++) {
            draw_head(context, {
                    x:x*0.15*min_dim(context)+400,
                    y:y*0.15*min_dim(context)+400
                }, 0.15, get_head()
            )
        }
    }
}
export {
    draw,
}