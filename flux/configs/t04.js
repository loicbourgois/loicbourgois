import { Kind } from "../kind.js"
import { set_block } from "../shared.js"


const t04 = (world) => {
    set_block(world, 10, 15, {
        k: Kind.create,
        r: 0,
        g: 256,
        b: 0,
    })
    set_block(world, 11, 16, {
        k: Kind.create,
        r: 256,
        g: 0,
        b: 0,
    })
    set_block(world, 10, 14, {
        k: Kind.d2u,
    })
    set_block(world, 10, 5, {
        k: Kind.consume,
    })
    set_block(world, 8, 8, {
        k: Kind.d2l,
    })
    set_block(world, 4, 8, {
        k: Kind.r2u,
    })
    set_block(world, 4, 5, {
        k: Kind.d2r,
    })
    set_block(world, 10, 12, {
        k: Kind.d2lr,
    })
    set_block(world, 8, 12, {
        k: Kind.r2u,
    })
    set_block(world, 9, 15, {
        k: Kind.r2l,
    })
    set_block(world, 20, 12, {
        k: Kind.l2u,
    })
    set_block(world, 20, 5, {
        k: Kind.d2l,
    })
    set_block(world, 3, 15, {
        k: Kind.r2u,
    })
    set_block(world, 3, 2, {
        k: Kind.d2r,
    })
    set_block(world, 10, 2, {
        k: Kind.l2d,
    })
    set_block(world, 12, 16, {
        k: Kind.l2r,
    })
    set_block(world, 15, 16, {
        k: Kind.l2u,
    })
    set_block(world, 15, 12, {
        k: Kind.ld2r,
    })
}


export {
    t04,
}
