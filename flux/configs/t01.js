import { Kind } from "../kind.js"
import { Direction } from "../direction.js"
import { set_block } from "../shared.js"


const t01 = (world) => {
    set_block(world, 18, 13, {
        k: Kind.create,
        r: 0,
        g: 256,
        b: 0,
    })
    set_block(world, 19, 13, {
        k: Kind.up,
    })
    set_block(world, 12, 5, {
        k: Kind.consume,
    })
    set_block(world, 18, 10, {
        k: Kind.create,
        r: 256,
        g: 0,
        b: 0,
    })
    set_block(world, 17, 10, {
        k: Kind.up,
    })
    set_block(world, 18, 4, {
        k: Kind.left,
    })
    set_block(world, 9, 10, {
        k: Kind.create,
        r: 128,
        g: 0,
        b: 0,
    })
    set_block(world, 18, 7, {
        k: Kind.split_left_right,
    })
    set_block(world, 18, 11, {
        k: Kind.split_left_right,
    })
    set_block(world, 15, 11, {
        k: Kind.mix_to_left,
    })
    set_block(world, 11, 11, {
        k: Kind.up,
    })
    set_block(world, 14, 12, {
        k: Kind.up,
    })
    set_block(world, 14, 8, {
        k: Kind.down,
    })
    set_block(world, 3, 8, {
        k: Kind.up,
    })
    set_block(world, 5, 12, {
        k: Kind.up,
    })
    set_block(world, 2, 2, {
        k: Kind.right,
    })
    set_block(world, 4, 4, {
        k: Kind.right,
    })

    set_block(world, 13, 3, {
        k: Kind.down,
    })
}


export {
    t01,
}
