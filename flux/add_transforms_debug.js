else if (
    b.k == Kind.d2l
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
                i: il,
                b: {
                    k: Kind.pixel,
                    r: bd.r,
                    g: bd.g,
                    b: bd.b,
                    direction: Direction.left,
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