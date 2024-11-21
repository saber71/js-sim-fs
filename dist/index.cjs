'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const fs = require('node:fs');
const fsPromise = require('node:fs/promises');
const jsTools = require('@heraclius/js-tools');

class BufferReader {
    _data;
    _start;
    _end;
    constructor(_data, _start, _end = _data.length - 1){
        this._data = _data;
        this._start = _start;
        this._end = _end;
    }
    static slice(buffer, offset, length = buffer.length - offset) {
        const result = Buffer.alloc(length);
        buffer.copy(result, 0, offset, offset + length);
        return result;
    }
    get length() {
        return this._end - this._start + 1;
    }
    getData() {
        return this.slice();
    }
    /**
   * 从当前缓冲区读取器中切出一个新的缓冲区读取器
   *
   * 此方法允许从当前缓冲区读取器中指定一个范围，然后根据这个范围创建一个新的缓冲区读取器
   * 它主要用于在处理缓冲区数据时，提取特定部分的数据进行操作或传输
   *
   * @param offset 起始偏移量，表示从当前缓冲区读取器的哪个位置开始切分，默认为0
   * @param length 要切分的长度，表示新缓冲区读取器的长度，默认为当前缓冲区读取器的剩余长度
   * @returns 返回一个新的缓冲区读取器实例，该实例包含指定范围内的数据
   * @throws 如果指定的范围超出了当前缓冲区读取器的边界，则抛出错误
   */ slice(offset = 0, length = this.length) {
        // 检查指定的范围是否超出了当前缓冲区读取器的边界
        if (offset + length - 1 > this._end) throw new Error("length out of buffer range");
        // 调用BufferReader的slice方法，根据指定的范围从当前缓冲区读取器中切出一个新的缓冲区读取器
        return BufferReader.slice(this._data, this._start + offset, length);
    }
    readBit(offset, bit) {
        if (bit < 0 || bit > 7) throw new Error("bit out of range");
        const byte = this.readUint8(offset);
        const mask = 1 << bit;
        return (byte & mask) > 0 ? 1 : 0;
    }
    readInt8(offset) {
        offset += this._start;
        if (offset > this._end) throw new Error("offset out of buffer range");
        return this._data.readInt8(offset);
    }
    readUint8(offset) {
        offset += this._start;
        if (offset > this._end) throw new Error("offset out of buffer range");
        return this._data.readUint8(offset);
    }
    readInt16(offset) {
        offset += this._start;
        if (offset + 1 > this._end) throw new Error("offset out of buffer range");
        return this._data.readInt16BE(offset);
    }
    readUint16(offset) {
        offset += this._start;
        if (offset + 1 > this._end) throw new Error("offset out of buffer range");
        return this._data.readUint16BE(offset);
    }
    readInt32(offset) {
        offset += this._start;
        if (offset + 3 > this._end) throw new Error("offset out of buffer range");
        return this._data.readInt32BE(offset);
    }
    readUint32(offset) {
        offset += this._start;
        if (offset + 3 > this._end) throw new Error("offset out of buffer range");
        return this._data.readUint32BE(offset);
    }
    readInt64(offset) {
        offset += this._start;
        if (offset + 7 > this._end) throw new Error("offset out of buffer range");
        return this._data.readBigInt64BE(offset);
    }
    readUint64(offset) {
        offset += this._start;
        if (offset + 7 > this._end) throw new Error("offset out of buffer range");
        return this._data.readBigUInt64BE(offset);
    }
}

exports.HardDisk = void 0;
(function(HardDisk) {
    let Base = class Base {
        capacity;
        constructor(// 硬盘容量，单位：字节
        capacity){
            this.capacity = capacity;
        }
    };
    HardDisk.Base = Base;
    let Memory = class Memory extends Base {
        _data;
        constructor(capacity){
            super(capacity);
            this._data = Buffer.alloc(capacity);
        }
        init() {
            return Promise.resolve();
        }
        read(offset, length) {
            return Promise.resolve(BufferReader.slice(this._data, offset, length));
        }
        write(data, writeInOffset) {
            data.copy(this._data, writeInOffset, 0, data.length);
            return Promise.resolve();
        }
    };
    HardDisk.Memory = Memory;
    let File = class File extends Base {
        path;
        _handler;
        constructor(// 存储硬盘数据的文件路径
        path, // 硬盘容量，单位：字节。如果不指定，则使用文件大小作为容量。如果文件不存在，则抛出异常。
        capacity = 0){
            super(capacity);
            this.path = path;
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
        async read(offset, length) {
            const buffer = Buffer.alloc(length);
            await this._handler.read(buffer, 0, length, offset);
            return buffer;
        }
        async write(data, writeInOffset) {
            await this._handler.write(data, 0, data.length, writeInOffset);
        }
    };
    HardDisk.File = File;
})(exports.HardDisk || (exports.HardDisk = {}));

exports.HardDiskController = void 0;
(function(HardDiskController) {
    // 默认配置
    HardDiskController.option = {
        metaCounterBytes: 4,
        metaBytes: 1024,
        metaCustomBytes: 0,
        maxMetaCount: Number.MAX_SAFE_INTEGER,
        clusterBytes: 1024 * 4
    };
    // 数据簇中记录终止位置的字节数
    new jsTools.Lazy(()=>{
        if (HardDiskController.option.clusterBytes <= 2 ** 8) return 1;
        if (HardDiskController.option.clusterBytes <= 2 ** 16) return 2;
        if (HardDiskController.option.clusterBytes <= 2 ** 32) return 4;
        return 8;
    });
    let Base = class Base {
        hardDisk;
        constructor(hardDisk){
            this.hardDisk = hardDisk;
        }
        // 硬盘中数据簇的理论总数目
        get clusterCount() {
            return Math.ceil(this.hardDisk.capacity / HardDiskController.option.clusterBytes);
        }
    };
    HardDiskController.Base = Base;
    let Default = class Default extends Base {
        async init() {
            await this.hardDisk.init();
        }
    };
    HardDiskController.Default = Default;
})(exports.HardDiskController || (exports.HardDiskController = {}));

class BufferWriter extends BufferReader {
    writeBit(bool, bit, offset) {
        if (bit < 0 || bit > 7) throw new Error("bit out of range");
        const bitValue = bool ? 1 : 0;
        const oldValue = this.readUint8(offset);
        const newValue = bitValue ? oldValue | 1 << bit : oldValue & ~(1 << bit);
        this.writeUint8(newValue, offset);
    }
    writeInt8(value, offset) {
        offset += this._start;
        if (offset > this._end) throw new Error("offset out of buffer range");
        this._data.writeInt8(value, offset);
    }
    writeUint8(value, offset) {
        offset += this._start;
        if (offset > this._end) throw new Error("offset out of buffer range");
        this._data.writeUint8(value, offset);
    }
    writeInt16(value, offset) {
        offset += this._start;
        if (offset + 1 > this._end) throw new Error("offset out of buffer range");
        this._data.writeInt16BE(value, offset);
    }
    writeUint16(value, offset) {
        offset += this._start;
        if (offset + 1 > this._end) throw new Error("offset out of buffer range");
        this._data.writeUint16BE(value, offset);
    }
    writeInt32(value, offset) {
        offset += this._start;
        if (offset + 3 > this._end) throw new Error("offset out of buffer range");
        this._data.writeInt32BE(value, offset);
    }
    writeUint32(value, offset) {
        offset += this._start;
        if (offset + 3 > this._end) throw new Error("offset out of buffer range");
        this._data.writeUint32BE(value, offset);
    }
    writeInt64(value, offset) {
        offset += this._start;
        if (offset + 7 > this._end) throw new Error("offset out of buffer range");
        this._data.writeBigInt64BE(value, offset);
    }
    writeUint64(value, offset) {
        offset += this._start;
        if (offset + 7 > this._end) throw new Error("offset out of buffer range");
        this._data.writeBigUInt64BE(value, offset);
    }
}

exports.SimFileSystem = void 0;
(function(SimFileSystem) {
    SimFileSystem.fileMetaOptions = {
        customDataBytes: 20,
        nameBytes: 255,
        totalBytes: 1024
    };
})(exports.SimFileSystem || (exports.SimFileSystem = {}));

exports.BufferReader = BufferReader;
exports.BufferWriter = BufferWriter;
