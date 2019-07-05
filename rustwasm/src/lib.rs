extern crate web_sys;

use std::cmp;

mod utils;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Universe {
    width: usize,
    height: usize,
    pool: Vec<usize>,
    free_cells: Vec<usize>,
    cells: Vec<Cell>,
    max_cell_value: Option<i32>
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Cell {
    x: usize,
    y: usize,
    index: usize,
    value: Option<usize>
}

#[wasm_bindgen]
pub fn new_universe(width: usize, height: usize) -> Universe {
    let mut cells = Vec::new();
    let mut free_cells = Vec::new();
    let pool = Vec::new();
    for y in 0..height {
        for x in 0..width {
            cells.push(Cell {
                x,
                y,
                index: cell_index(x, y, width),
                value: None
            });
            free_cells.push(cell_index(x, y, width));
        }
    }
    Universe {
        width,
        height,
        pool,
        free_cells,
        cells,
        max_cell_value: None
    }
}

pub fn cell_index(x: usize, y: usize, width: usize) -> usize {
    (y as usize) * (width) + (x as usize)
}

#[wasm_bindgen]
pub fn depup_pool(universe: &mut Universe) {
    universe.pool.sort();
    universe.pool.dedup();
}

#[wasm_bindgen]
pub fn get_pool_length(universe: & Universe) -> usize {
    universe.pool.len()
}

#[wasm_bindgen]
pub fn tick (universe: &mut Universe, pool_index: usize) {
    if(universe.pool.len() == 0) {
        return;
    }
    let cell_index = universe.pool[pool_index];
    universe.pool.remove(pool_index);
    
    let neighbours_max_value = get_neighbours_max_value(
        universe.cells.clone(),
        cell_index,
        universe.width,
        universe.height);

    let cell_value = neighbours_max_value + 1;
    universe.cells[cell_index].value = Some(cell_value);

    let free_cell_to_remove_option = universe.free_cells.iter().position(|&x| x == cell_index);

    match free_cell_to_remove_option {
        Some(free_cell_to_remove) => {
            universe.free_cells.remove(free_cell_to_remove);
        },
        None => {
            // Do nothing
        }
    }

    add_neighbours(
        &mut universe.pool,
        cell_index,
        universe.free_cells.clone(),
        universe.width,
        universe.height
    );
}

fn add_neighbours(
    pool: &mut Vec<usize>,
    cell_index: usize,
    free_cells: Vec<usize>,
    width: usize,
    height: usize
) {
    let neighbours_indexes = get_neighbours_indexes(cell_index, width, height);
    for neighbour_index in neighbours_indexes.iter() {
        match free_cells.iter().position(|&x| x == *neighbour_index) {
            Some(_) => {
                pool.push(*neighbour_index);
            },
            None => {
                // Do nothing
            }
        }
    };
}

fn get_neighbours_max_value(
        cells: Vec<Cell>,
        cell_index: usize,
        width: usize,
        height: usize
) -> usize {
    let neighbours_indexes = get_neighbours_indexes(
        cell_index,
        width,
        height
    );
    let mut max = 0;
    for neighbour_index in neighbours_indexes.iter() {
        match cells[*neighbour_index].value {
            Some(value) => {
                max = cmp::max(max, value);
            },
            None => {
                // Do nothing
            }
        }
    };
    max
}


fn get_neighbours_indexes(
    cell_index: usize,
    width: usize,
    height: usize
) -> Vec<usize> {
    let mut indexes = Vec::new();
    let x = cell_index % width;
    let y = cell_index / width;
    for delta in [(0, 1), (0, height-1), (width-1, 0), (1, 0)].iter() {
        let delta_x = delta.0;
        let delta_y = delta.1;
        let x_new = (x + delta_x) % width;
        let y_new = (y + delta_y) % height;
        indexes.push(y_new * width + x_new);
    };
    return indexes
}


#[wasm_bindgen]
pub fn add_index_to_pool(universe: &mut Universe, index: usize) {
    universe.pool.push(index);
}

#[wasm_bindgen]
pub fn cells_values (universe: &Universe) -> Vec<usize> {
    let mut values : Vec<usize> = Vec::new();
    for cell in universe.cells.iter() {
        match cell.value {
            Some(value) => values.push(value),
            None => values.push(0)
        }
    }
    values
}

#[wasm_bindgen]
pub fn cells_max_value (universe: &Universe) -> usize {
    let mut max = 0;
    for cell in universe.cells.iter() {
        match cell.value {
            Some(value) => {
                if value > max {
                    max = value;
                } else {
                    // Do nothing
                }
            },
            None => {
                // Do nothing
            }
        }
    }
    max
}
