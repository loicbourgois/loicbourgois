const geometry = {}
// http://paulbourke.net/geometry/pointlineplane/javascript.txt
geometry.intersect = (x1, y1, x2, y2, x3, y3, x4, y4) => {
	if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
		return false
	}
	denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
	if (denominator === 0) {
		return false
	}
	const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
	const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		return false
	}
	const x = x1 + ua * (x2 - x1)
	const y = y1 + ua * (y2 - y1)
  const r = {
    x: x,
    y: y
  }
	return r
}
