import {array_product} from './shared.js'


class Field {
    constructor({
        device,
        resolution,
        attributs_count,
        dispatch_count,
        workgroup_size,
        data,
    }) {
        this.cells_count = resolution*resolution;
        if (!data) {
            let wip = {}
            for (const r of [4, 8, 16, 32]) {
                for (let y = 0; y < r; y++) {
                    for (let x = 0; x < r; x++) {
                        wip[[r,x,y]] = Math.random()
                    }
                }
            }
            // for (const r of [4, 8, 16, 32]) {
            //     let local_vals = [];
            //     for (let y = 0; y < r; y++) {
            //         for (let x = 0; x < r; x++) {
            //             const val = Math.random();
            //             wip[[r, x, y]] = val;
            //             local_vals.push(val);
            //         }
            //     }
            //     const minVal = Math.min(...local_vals);
            //     const maxVal = Math.max(...local_vals);
            //     console.log(minVal, maxVal)
            //     const denom = (maxVal - minVal) !== 0 ? (maxVal - minVal) : 1;
            //     for (let y = 0; y < r; y++) {
            //         for (let x = 0; x < r; x++) {
            //             wip[[r, x, y]] = (wip[[r, x, y]] - minVal) / denom;
            //         }
            //     }
            // }
            const data_ = []
            let i = 0
            for (let y = 0; y < resolution; y++) {
                for (let x = 0; x < resolution; x++) {
                    data_.push(i);
                    data_.push(x);
                    data_.push(y);
                    for (let _ = 0; _ < attributs_count-3; _++) {
                        const scales = [4, 8, 16, 32];
                        let acc = 0;
                        let ratio = 0
                        let ii = 1
                        for (const r of scales) {
                            const xr = Math.floor((x / resolution) * r);
                            const yr = Math.floor((y / resolution) * r);
                            ii += 1
                            ratio += 1/ii
                            acc += wip[[r, xr, yr]] / ii;
                            
                        }
                        const value = acc / ratio;
                        data_.push(value);
                    }
                    i += 1
                }
            }
            this.buffer_js = new Float32Array(data_)
        } else {
            this.buffer_js = new Float32Array(data)
        }
        this.resolution = resolution;
        this.buffer_gpu_in = device.createBuffer({
            size: this.buffer_js.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });
        this.buffer_gpu_out = device.createBuffer({
            size: this.buffer_js.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(this.buffer_gpu_in, 0, this.buffer_js);
        device.queue.writeBuffer(this.buffer_gpu_out, 0, this.buffer_js);
        this.dispatch_count = dispatch_count ;
        this.workgroup_size = workgroup_size ;
        const numThreadsPerWorkgroup = array_product(this.workgroup_size);
        this.numThreadsPerWorkgroup = array_product(this.workgroup_size);
        const numWorkgroups = array_product(this.dispatch_count);
        const numResults = numWorkgroups * numThreadsPerWorkgroup;
        const cells_count = this.buffer_js.length/attributs_count;
        if (cells_count != numResults) {
            throw `Invalid cells count: ${cells_count} != ${numResults}`
        }
    }
}


export {
    Field,
}
