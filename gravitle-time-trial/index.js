import init, * as gravitle from "./gravitle_time_trial.js";
import { test } from "./test.js";
import { View } from "./view.js";
import { draw_cells } from "./draw_cells.js";
import { ship_1 } from "./ship_1.js";
import { ship_2 } from "./ship_2.js";
import { get_cell } from "./get_cell.js";
import { wrap_around, test_wrap_around } from "./math.js";
import { cyrb128, sfc32, random_seed } from "./random.js";

const ship = ship_2;
let key_allowed = true;
let victory_celebrated = false;
let last_frame = null

const draw = (view, world, memory) => {
	const now = performance.now()
	const elapsed = now - last_frame;
	let steps = 2
	if (elapsed > 15 && last_frame != null) {
		// console.log(elapsed)
		steps = 4
	}
	last_frame = now
	for (let index = 0; index < steps; index++) {
		world.step();
		if (world.victory == 1 && !victory_celebrated) {
			console.log(world.victory_duration);
			victory_celebrated = 1;
			document.getElementById("victory_duration").innerHTML = world.victory_duration
			document.getElementById("victory").classList.add("yes")
		}
	}
	view.set_backgound("#102");
	draw_cells(gravitle, world, memory, view);
	requestAnimationFrame(() => {
		draw(view, world, memory);
	});
};
let key_bindings = new Map();
const main = async () => {
	test_wrap_around();
	await init();
	gravitle.setup();
	const memory = gravitle.initSync().memory;
	test(gravitle, memory);
	const world = gravitle.World.new();
	const kinds = {
		armor: 0,
		booster: 1,
		core: 2,
	};
	const kb = {
		s: [],
		d: [],
	};
	ship.parts.forEach((e, idx) => {
		world.add_cell(e.p.x - 0.3, e.p.y - 0.3, e.d, kinds[e.kind]);
		if (e.binding) {
			kb[e.binding].push(idx);
		}
	});
	function getQueryParam(param) {
  return params.get(param);
}

	const url = new URL(window.location.href); // Use a specific URL or window.location.href
	const params = new URLSearchParams(url.search);
	let seed_input = getQueryParam('seed');
	if (seed_input == null) {
		seed_input = "gravitle"
	}
	let stars_count = getQueryParam('stars');
	if (stars_count == null) {
		stars_count = 4
	}

	const seed = cyrb128(seed_input);
	const rand = sfc32(seed[0], seed[1], seed[2], seed[3]);

	for (let index = 0; index < 20; index++) {
		const diameter = 0.05;
		let iterations = 0;
		while (true) {
			iterations += 1;
			if (iterations > 100) {
				throw "too many iterations";
			}
			const x = rand();
			const y = rand();
			const cells_ptr = world.cells();
			const cell_size = gravitle.Cell.size();
			const cells_view = new DataView(
				memory.buffer,
				cells_ptr,
				world.cells_count() * cell_size,
			);
			let ok = true;
			for (let i = 0; i < world.cells_count(); i++) {
				const cell = get_cell(cells_view, cell_size, i);
				const wa = wrap_around(cell.p, { x, y });
				let diams = cell.diameter + diameter * 1.5;
				let colliding = wa.d_sqrd < diams * diams;
				if (colliding) {
					ok = false;
					break;
				}
			}
			if (ok) {
				world.add_cell(x, y, diameter, 4);
				break;
			}
		}
	}
	for (let index = 0; index < stars_count; index++) {
		const diameter = 0.015;
		let iterations = 0;
		while (true) {
			iterations += 1;
			if (iterations > 200) {
				throw "too many iterations";
			}
			const x = rand();
			const y = rand();
			const cells_ptr = world.cells();
			const cell_size = gravitle.Cell.size();
			const cells_view = new DataView(
				memory.buffer,
				cells_ptr,
				world.cells_count() * cell_size,
			);
			let ok = true;
			for (let i = 0; i < world.cells_count(); i++) {
				const cell = get_cell(cells_view, cell_size, i);
				const wa = wrap_around(cell.p, { x: x, y: y });
				let diams = cell.diameter * 0.5 + diameter * 5;
				let colliding = wa.d_sqrd < diams * diams;
				if (colliding) {
					ok = false;
					break;
				}
			}
			if (ok) {
				world.add_cell(x, y, diameter, 5);
				break;
			}
		}
	}
	for (const l of ship.links) {
		world.add_link(l.a, l.b);
	}
	for (let k of Object.keys(kb)) {
		if (!key_bindings.has(k)) {
			key_bindings.set(k, new Set());
		}
		for (let idx of kb[k]) {
			key_bindings.get(k).add(idx);
		}
	}
	const view = new View("canvas");
	window.addEventListener("resize", function () {
		view.resize();
	});
	document.addEventListener("keydown", (e) => {
		if (key_bindings.get(e.key)) {
			if (key_allowed) {
				// document.querySelectorAll(".disappearable").forEach((x, i) => {
				// 	x.classList.add("disappear");
				// });
				for (let idx of key_bindings.get(e.key)) {
					world.set_cell_activated(idx, 1);
				}
			}
			return;
		}
		if (e.key == " ") {
			if (winner != undefined && key_allowed) {
				again();
			}
			return;
		}
		document.querySelectorAll(".disappearable").forEach((x, i) => {
			x.classList.remove("disappear");
		});
	});
	document.addEventListener("keyup", (e) => {
		if (key_bindings.get(e.key)) {
			for (let idx of key_bindings.get(e.key)) {
				world.set_cell_activated(idx, 0);
			}
		}
	});
	document.getElementById("again").addEventListener("click", () => {
		window.location.href = `../gravitle-time-trial?seed=${seed_input}&stars=${stars_count}`
	})
	document.getElementById("new").addEventListener("click", () => {
		window.location.href = `../gravitle-time-trial?seed=${random_seed()}&stars=${stars_count}`
	})

	// document.addEventListener("click", (event) => {
	// 	const x = event.clientX;
	// 	const y = event.clientY;
	// 	view.set_mouse(x, y);
	// });
	// document.addEventListener("mousemove", (e) => {
	// 	const x = e.offsetX;
	// 	const y = e.offsetY;
	// 	view.set_mouse(x, y);
	// });
	// document
	// 	.getElementById("update_config")
	// 	.addEventListener("click", () => update_config(world));
	// update_config(world);
	draw(view, world, memory);
};
window.onload = () => {
	main();
};
