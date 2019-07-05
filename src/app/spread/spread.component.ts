import { Component, OnInit } from '@angular/core';
import * as Utils from '../utils';

@Component({
    selector: 'app-spread',
    templateUrl: './spread.component.html',
    styleUrls: ['./spread.component.css']
})
export class SpreadComponent implements OnInit {

    cell_value_max;
    rustwasm;
    universe;

    constructor() {
    }

    async import_rustwasm() {
       this.rustwasm = await import('rustwasm');
    }

    async ngOnInit() {
        await this.import_rustwasm();
        const speed = 1;
        const canvas = <HTMLCanvasElement>document.getElementById('canvas');
        canvas.width = canvas.scrollWidth / speed;
        canvas.height = canvas.scrollHeight / speed;
        const context = canvas.getContext('2d');
        const image_data = context.createImageData(canvas.width, canvas.height);

        this.universe = this.rustwasm.new_universe(canvas.width, canvas.height);

        let free_cells_indexes = [];
        let cells_values = [];
        let pool = [];
        this.cell_value_max = 0;
        this.rustwasm.add_index_to_pool(this.universe, Utils.get_random_int_inclusive(0, canvas.width*canvas.height - 1));
        this.rustwasm.add_index_to_pool(this.universe, Utils.get_random_int_inclusive(0, canvas.width*canvas.height - 1));
        this.rustwasm.add_index_to_pool(this.universe, Utils.get_random_int_inclusive(0, canvas.width*canvas.height - 1));
        this.rustwasm.add_index_to_pool(this.universe, Utils.get_random_int_inclusive(0, canvas.width*canvas.height - 1));

        const interval =  setInterval( () => {
            for (let i = 0 ; i < 10 ; i++) {
                this.rustwasm.depup_pool(this.universe);
                const pool_length = this.rustwasm.get_pool_length(this.universe);
                const pool_index = Utils.get_random_int_inclusive(0, (pool_length - 1));
                this.rustwasm.tick(this.universe, pool_index);
            }
        }, 1);

        this.start_render_loop(context, image_data, cells_values);
    }

    start_render_loop(context, image_data, cells_values) {
        window.requestAnimationFrame( () => {
            this.render_loop(this, context, image_data, cells_values);
        });
    }

    render_loop (this_, context, image_data, cells_values) {
        this_.draw(
            context,
            image_data,
            this_
        );
        window.requestAnimationFrame( () => {
            this_.render_loop(this_, context, image_data, cells_values);
        });
    }

    draw (context, image_data, this_) {
        const cells_values = this.rustwasm.cells_values(this.universe);
        const cell_value_max = this.rustwasm.cells_max_value(this.universe);
        for (let i = 0, l = image_data.data.length, c = 4 ; i < l ; i += c) {
            const cell_index = i / 4;
            const cell_value = cells_values[cell_index];
            image_data.data[i+0] = 255.0 - 255.0 / cell_value_max * cell_value;;
            image_data.data[i+1] = 255.0 - 255.0 / cell_value_max * cell_value;
            image_data.data[i+2] = 255.0 - 255.0 / cell_value_max * cell_value;
            image_data.data[i+3] = 255;
        }
        context.putImageData(image_data, 0, 0);
    }
}
