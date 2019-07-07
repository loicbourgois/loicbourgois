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
    width: u32,
    height: u32,
    pool: Vec<u32>,
    free_cells: Vec<u32>,
    cells: Vec<Cell>
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Cell {
    x: u32,
    y: u32,
    index: u32,
    value: Option<u32>
}

#[wasm_bindgen]
pub fn new_universe(width: u32, height: u32) -> Universe {
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
        cells
    }
}

pub fn cell_index(x: u32, y: u32, width: u32) -> u32 {
    y * width + x
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
pub fn get_cells_length(universe: & Universe) -> usize {
    universe.cells.len()
}

#[wasm_bindgen]
pub fn tick (universe: &mut Universe, pool_index: usize, cell_index_: usize) {

    let cell_index = if universe.pool.len() == 0 {
        cell_index_ as u32
    } else {
        universe.pool[pool_index]
    };

    if pool_index < universe.pool.len() {
        universe.pool.remove(pool_index);
    } else {
        // Do nothing
    }

    let neighbours_max_value = get_neighbours_max_value(
        &universe.cells,
        cell_index,
        universe.width,
        universe.height
    );

    let cell_value = neighbours_max_value + 1;
    universe.cells[cell_index as usize].value = Some(cell_value);

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
        &universe.free_cells,
        universe.width,
        universe.height
    );
}

fn add_neighbours(
    pool: &mut Vec<u32>,
    cell_index: u32,
    free_cells: & Vec<u32>,
    width: u32,
    height: u32
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
        cells: & Vec<Cell>,
        cell_index: u32,
        width: u32,
        height: u32
) -> u32 {
    let neighbours_indexes = get_neighbours_indexes(
        cell_index,
        width,
        height
    );
    let mut max = 0;
    for neighbour_index in neighbours_indexes.iter() {
        match cells[(*neighbour_index) as usize].value {
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
    cell_index: u32,
    width: u32,
    height: u32
) -> [u32; 4] {
    let x = cell_index % width;
    let y = cell_index / width;
    [
        ((y + 1) % height) * width + x,
        ((y + height - 1) % height) * width + x,
        y * width + (x + 1) % width,
        y * width + (x + width - 1) % width
    ]
}


#[wasm_bindgen]
pub fn add_index_to_pool(universe: &mut Universe, index: u32) {
    universe.pool.push(index);
}

#[wasm_bindgen]
pub fn cells_values (universe: &Universe) -> Vec<u32> {
    let mut values : Vec<u32> = Vec::new();
    for cell in universe.cells.iter() {
        match cell.value {
            Some(value) => values.push(value),
            None => values.push(0)
        }
    }
    values
}

#[wasm_bindgen]
pub fn cells_max_value (universe: &Universe) -> u32 {
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

#[wasm_bindgen]
pub fn tick_lines (universe: &mut Universe, pool_index: usize, cell_index_: usize) {

    let cell_index = if universe.pool.len() == 0 {
        cell_index_ as u32
    } else {
        universe.pool[pool_index]
    };

    if pool_index < universe.pool.len() {
        universe.pool.remove(pool_index);
    } else {
        // Do nothing
        return;
    }

    let free_neighbours_count = free_neighbours_count(
        cell_index,
        &universe.cells,
        universe.width,
        universe.height
    );
    
    if free_neighbours_count >= 3 {
        let neighbours_max_value = get_neighbours_max_value(
            &universe.cells,
            cell_index,
            universe.width,
            universe.height
        );
        let cell_value = neighbours_max_value + 2;
        universe.cells[cell_index as usize].value = Some(cell_value);
        add_neighbours(
            &mut universe.pool,
            cell_index,
            &universe.free_cells,
            universe.width,
            universe.height
        );
    } else {
        universe.cells[cell_index as usize].value = Some(0);
    }

    match index_for_value(
        &universe.free_cells,
        cell_index
    ) {
        Some(index) => {
            universe.free_cells.remove(index);
        },
        None => {
            // Do nothing
        }
    }
}

fn index_for_value(
    vector: & Vec<u32>,
    value: u32
) -> Option<usize> {
    vector.iter().position(|&x| x == value)
}

fn free_neighbours_count(
    cell_index: u32,
    cells: & Vec<Cell>,
    width: u32,
    height: u32
) -> u32 {
    let neighbours_indexes = get_neighbours_indexes(
        cell_index,
        width,
        height
    );
    let mut count = 0;
    for neighbour_index in neighbours_indexes.iter() {
        match cells[(*neighbour_index) as usize].value {
            Some(_) => {
                // Do nothing
            },
            None => {
                count += 1;
            }
        }
    };
    count
}
