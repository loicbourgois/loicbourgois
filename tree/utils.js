const assert_eq = (a, b, message) => {
    if ( Math.abs(a - b) > 0.001 ) {
        throw (message || "Assertion failed" ) + `Got ${a}, Expected ${b}`;
    }
}


export {
  assert_eq,
}
