import { Component, OnInit } from '@angular/core';
import * as Utils from '../utils';

@Component({
  selector: 'app-lines',
  templateUrl: './lines.component.html',
  styleUrls: ['./lines.component.css']
})
export class LinesComponent implements OnInit {

  rustwasm;
    universes;

    constructor() {
    }

    async ngOnInit() {
        await this.import_rustwasm();
        const zoom = 2;
        const canvas = <HTMLCanvasElement>document.getElementById('canvas');
        canvas.width = canvas.scrollWidth / zoom;
        canvas.height = canvas.scrollHeight / zoom;
        const context = canvas.getContext('2d');
        const image_data = context.createImageData(canvas.width, canvas.height);
        this.universes = [];
        this.universes.push(this.rustwasm.new_universe(canvas.width, canvas.height));
        const pool_size = 3;
        this.generate_initial_pools(this.universes, pool_size, canvas);
        this.action_loop(zoom * zoom);
        this.start_render_loop(context, image_data);
    }

    async import_rustwasm() {
       this.rustwasm = await import('rustwasm');
    }

    generate_initial_pools(universes, size, canvas) {
        for (let j = 0 ; j < size ; j += 1) {
            for (let i = 0 ; i < universes.length ; i += 1) {
                const index = Utils.get_random_int_inclusive(
                    0,
                    canvas.width * canvas.height - 1
                );
                this.rustwasm.add_index_to_pool(universes[i], index);
            }
        }
    }

    action_loop(iterations_par_cycle) {
        const interval =  setInterval( () => {
            for (let i = 0 ; i < this.universes.length ; i += 1) {
                const universe = this.universes[i];
                for (let j = 0 ; j < iterations_par_cycle ; j += 1) {
                    this.rustwasm.depup_pool(universe);
                    const pool_length = this.rustwasm.get_pool_length(universe);
                    const cells_length = this.rustwasm.get_cells_length(universe);
                    const pool_index = Utils.get_random_int_inclusive(0, (pool_length - 1));
                    const cells_index = Utils.get_random_int_inclusive(0, (cells_length - 1));
                    this.rustwasm.tick_lines(universe, pool_index, cells_index);
                }
            }
        }, 1);
    }

    start_render_loop(context, image_data) {
        window.requestAnimationFrame( () => {
            this.render_loop(this, context, image_data);
        });
    }

    render_loop (this_, context, image_data) {
        this_.draw(
            context,
            image_data
        );
        window.requestAnimationFrame( () => {
            this_.render_loop(this_, context, image_data);
        });
    }

    draw (context, image_data) {
        const cells_values_0 = this.rustwasm.cells_values(this.universes[0]);
        const cell_value_max_0 = this.rustwasm.cells_max_value(this.universes[0]);
        for (let i = 0, l = image_data.data.length, c = 4 ; i < l ; i += c) {
            const cell_index = i / 4;
            const cell_value_0 = cells_values_0[cell_index];
            //let a = ((255.0 - 255.0 / cell_value_max_0 * cell_value_0)*1.0 + Date.now() / 10) % 256;
            //let b = ((255.0 - 255.0 / cell_value_max_1 * cell_value_1)*1.0 + Date.now() / 10) % 256;
            let a = 255.0 - 255.0 / cell_value_max_0 * cell_value_0;
            a += (Date.now() / 20) % 256;
            a *= 1.0;
            a %= 256;
            let alpha = 255;
            if (cell_value_0 < 1 ) {
                alpha = 0;
            } else {
                // Do nothing
            }
            //a = 255;
            image_data.data[i+0] = a * 0.5;
            image_data.data[i+1] = a;
            image_data.data[i+2] = a * 0.5;
            image_data.data[i+3] = alpha;
        }
        context.putImageData(image_data, 0, 0);
    }

}
