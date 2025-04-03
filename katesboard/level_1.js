const map = [
    {
        a: {
            x: -500,
            y: -100,
        },
        b: {
            x: 500,
            y: -100,
        },
        k: "floor",
    },
    {
        a: {
            x: -500,
            y: 100,
        },
        b: {
            x: 500,
            y: 100,
        },
        k: "floor",
    },
    {
        a: {
            y: -50,
            x: 100,
        },
        b: {
            y: 10,
            x: 100,
        },
        k: "wall",
    },
    {
        a: {
            y: 0,
            x: -20,
        },
        b: {
            y: 70,
            x: -20,
        },
        k: "wall",
    },
    {
        a: {
            y: -20,
            x: 230,
        },
        b: {
            y: -100,
            x: 230,
        },
        k: "wall",
    },
]
const events = {
    // 1: {
    //     right: true,
    // },
    // 700: {
    //     up: true,
    // },
    // 701: {
    //     up: false,
    // },
    // 800: {
    //     up: true,
    // },
    // 1001: {
    //     up: false,
    // },
    // 1200: {
    //     up: true,
    // },
    // 1301: {
    //     up: false,
    // },
    // // 120: {
    // //     up: true,
    // // },
    // // 121: {
    // //     up: false,
    // // },
    // // 130: {
    // //     right: false,
    // //     left: true,
    // // },
    // 3000: {
    //     stop: true,
    // },
}
export {
    map,
    events,
}
