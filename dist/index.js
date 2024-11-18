import fs from 'node:fs';
import fsPromise from 'node:fs/promises';

var HardDisk;
(function(HardDisk) {
    let Base = class Base {
        mtfSize;
        mtfMaxCount;
        constructor(// 一条MFT记录的大小，单位：字节
        mtfSize, // MFT记录的数量上限
        mtfMaxCount){
            this.mtfSize = mtfSize;
            this.mtfMaxCount = mtfMaxCount;
        }
    };
    HardDisk.Base = Base;
    let Memory = class Memory extends Base {
        capacity;
        _data;
        constructor(// 硬盘容量，单位：字节
        capacity, mtfSize, mtfMaxCount){
            super(mtfSize, mtfMaxCount);
            this.capacity = capacity;
            this._data = Buffer.alloc(capacity);
        }
        init() {
            return Promise.resolve();
        }
        read(startPosition, length) {
            const result = Buffer.alloc(length);
            this._data.copy(result, 0, startPosition, startPosition + length);
            return Promise.resolve(result);
        }
        write(data, writeInPosition) {
            data.copy(this._data, writeInPosition, 0, data.length);
            return Promise.resolve();
        }
    };
    HardDisk.Memory = Memory;
    let File = class File extends Base {
        path;
        capacity;
        _handler;
        constructor(// 存储硬盘数据的文件路径
        path, // 硬盘容量，单位：字节。如果不指定，则使用文件大小作为容量。如果文件不存在，则抛出异常。
        capacity = 0, mtfSize, mtfMaxCount){
            super(mtfSize, mtfMaxCount);
            this.path = path;
            this.capacity = capacity;
        }
        async init() {
            let fileSize = 0;
            if (!fs.existsSync(this.path)) {
                if (this.capacity <= 0) throw new Error(`硬盘数据不存在，硬盘容量必须大于0`);
            } else {
                fileSize = (await fsPromise.stat(this.path)).size;
            }
            if (this.capacity > 0 && fileSize !== this.capacity) {
                await fsPromise.writeFile(this.path, Buffer.alloc(0));
                await fsPromise.truncate(this.path, this.capacity);
            }
            this._handler = await fsPromise.open(this.path, "r+");
            return;
        }
        async read(startPosition, length) {
            const buffer = Buffer.alloc(length);
            await this._handler.read(buffer, 0, length, startPosition);
            return buffer;
        }
        async write(data, writeInPosition) {
            await this._handler.write(data, 0, data.length, writeInPosition);
        }
    };
    HardDisk.File = File;
})(HardDisk || (HardDisk = {}));

export { HardDisk };
