import { Component, OnInit } from '@angular/core';
import * as Utils from '../utils';

@Component({
    selector: 'app-spread',
    templateUrl: './spread.component.html',
    styleUrls: ['./spread.component.css']
})
export class SpreadComponent implements OnInit {

    rustwasm;
    universes;

    constructor() {
    }

    async import_rustwasm() {
       this.rustwasm = await import('rustwasm');
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
        this.universes.push(this.rustwasm.new_universe(canvas.width, canvas.height));
        this.universes.push(this.rustwasm.new_universe(canvas.width, canvas.height));

        for (let j = 0 ; j < 4 ; j += 1) {
            for (let i = 0 ; i < this.universes.length ; i += 1) {
                const index = Utils.get_random_int_inclusive(0, canvas.width*canvas.height - 1);
                this.rustwasm.add_index_to_pool(this.universes[i], index);
            }
        }

        const interval =  setInterval( () => {
            for (let i = 0 ; i < this.universes.length ; i += 1) {
                const universe = this.universes[i];
                for (let j = 0 ; j < zoom*zoom ; j += 1) {
                    this.rustwasm.depup_pool(universe);
                    const pool_length = this.rustwasm.get_pool_length(universe);
                    const pool_index = Utils.get_random_int_inclusive(0, (pool_length - 1));
                    this.rustwasm.tick(universe, pool_index);
                }
            }
        }, 1);

        this.start_render_loop(context, image_data);
    }

    start_render_loop(context, image_data) {
        window.requestAnimationFrame( () => {
            this.render_loop(this, context, image_data);
        });
    }

    render_loop (this_, context, image_data) {
        this_.draw(
            context,
            image_data,
            this_
        );
        window.requestAnimationFrame( () => {
            this_.render_loop(this_, context, image_data);
        });
    }

    draw (context, image_data, this_) {
        const cells_values_0 = this.rustwasm.cells_values(this.universes[0]);
        const cell_value_max_0 = this.rustwasm.cells_max_value(this.universes[0]);
        const cells_values_1 = this.rustwasm.cells_values(this.universes[1]);
        const cell_value_max_1 = this.rustwasm.cells_max_value(this.universes[1]);
        const cells_values_2 = this.rustwasm.cells_values(this.universes[2]);
        const cell_value_max_2 = this.rustwasm.cells_max_value(this.universes[2]);
        for (let i = 0, l = image_data.data.length, c = 4 ; i < l ; i += c) {
            const cell_index = i / 4;
            const cell_value_0 = cells_values_0[cell_index];
            const cell_value_1 = cells_values_1[cell_index];
            const cell_value_2 = cells_values_2[cell_index];
            const a = ((255.0 / cell_value_max_2 * cell_value_2)*5.0) % 255;
            const b = (a + 255.0 / cell_value_max_0 * cell_value_0) % 255;
            image_data.data[i+0] = a;
            image_data.data[i+1] = 0.0;
            image_data.data[i+2] = a;
            image_data.data[i+3] = 255;
        }
        context.putImageData(image_data, 0, 0);
    }
}
