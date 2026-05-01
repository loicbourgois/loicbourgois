else if (
    b.k == Kind.d2r
    && bd.k == Kind.pixel
    && bd.direction == Direction.up
) {
    transforms.push({
        inputs: [
            {
                i:i,
                b:structuredClone(b),
            }, 
        ],
        outputs:[
            {
                i:i,
                b:structuredClone(b),
            }, 
            {
                i: ir,
                b: {
                    k: Kind.pixel,
                    r: bd.r,
                    g: bd.g,
                    b: bd.b,
                    direction: Direction.right,
                },
            },
        ],
        deletes: [
            {
                i:id,
            },
        ]
    })
}