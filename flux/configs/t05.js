import { Kind } from "../kind.js"
import { set_block } from "../shared.js"


const t05 = (world) => {
    set_block(world, 6, 6, {
        k: Kind.create,
        r: 0,
        g: 128,
        b: 256,
    })
    set_block(world, 18, 18, {
        k: Kind.create,
        r: 0,
        g: 256,
        b: 128,
    })
    set_block(world, 12, 12, {
        k: Kind.consume,
    })
    set_block(world, 6, 18, {
        k: Kind.consume,
    })
    set_block(world, 18, 6, {
        k: Kind.consume,
    })
    set_block(world, 17, 18, {
        k: Kind.r1l,
    })
    set_block(world, 18, 17, {
        k: Kind.d2u,
    })
    set_block(world, 6, 7, {
        k: Kind.u1d,
    })
}


export {
    t05,
}
