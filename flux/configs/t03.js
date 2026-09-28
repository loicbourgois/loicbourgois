import { Kind } from "../kind.js"
import { Direction } from "../direction.js"
import { set_block } from "../shared.js"


const t03 = (world) => {
    set_block(world, 10, 15, {
        k: Kind.create,
        r: 0,
        g: 256,
        b: 0,
    })
    set_block(world, 11, 15, {
        k: Kind.up,
    })
    set_block(world, 10, 5, {
        k: Kind.consume,
    })
}


export {
    t03,
}
