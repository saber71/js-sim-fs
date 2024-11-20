export declare class BufferReader {
    protected readonly _data: Buffer;
    protected readonly _start: number;
    protected readonly _end: number;
    constructor(_data: Buffer, _start: number, _end?: number);
    static slice(buffer: Buffer, offset: number, length?: number): Buffer;
    get length(): number;
    getData(): Buffer;
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
     */
    slice(offset?: number, length?: number): Buffer;
    readBit(offset: number, bit: number): 1 | 0;
    readInt8(offset: number): number;
    readUint8(offset: number): number;
    readInt16(offset: number): number;
    readUint16(offset: number): number;
    readInt32(offset: number): number;
    readUint32(offset: number): number;
    readInt64(offset: number): bigint;
    readUint64(offset: number): bigint;
}

export declare class BufferWriter extends BufferReader {
    writeBit(bool: boolean | number, bit: number, offset: number): void;
    writeInt8(value: number, offset: number): void;
    writeUint8(value: number, offset: number): void;
    writeInt16(value: number, offset: number): void;
    writeUint16(value: number, offset: number): void;
    writeInt32(value: number, offset: number): void;
    writeUint32(value: number, offset: number): void;
    writeInt64(value: bigint, offset: number): void;
    writeUint64(value: bigint, offset: number): void;
}

export declare namespace HardDisk {
    export abstract class Base {
        readonly capacity: number;
        constructor(capacity: number);
        abstract init(): Promise<void>;
        /**
         * 从硬盘中读取数据
         * @param offset 开始读取的位置
         * @param length 要读取的长度
         */
        abstract read(offset: number, length: number): Promise<Buffer>;
        /**
         * 写入数据到硬盘中
         * @param data 要写入的数据
         * @param writeInOffset 写入到硬盘中的位置
         */
        abstract write(data: Buffer, writeInOffset: number): Promise<void>;
    }
    export class Memory extends Base {
        private readonly _data;
        constructor(capacity: number);
        init(): Promise<void>;
        read(offset: number, length: number): Promise<Buffer>;
        write(data: Buffer, writeInOffset: number): Promise<void>;
    }
    export class File extends Base {
        readonly path: string;
        private readonly _handler;
        constructor(path: string, capacity?: number);
        init(): Promise<void>;
        read(offset: number, length: number): Promise<Buffer>;
        write(data: Buffer, writeInOffset: number): Promise<void>;
    }
}

export declare namespace HardDiskController {
    export interface Option {
        metaCounterBytes: number;
        metaBytes: number;
        metaCustomBytes: number;
        maxMetaCount: number;
        clusterBytes: number;
    }
    const option: Option;
    export abstract class Base {
        readonly hardDisk: HardDisk.Base;
        constructor(hardDisk: HardDisk.Base);
        get clusterCount(): number;
        abstract init(): Promise<void>;
    }
    export class Default extends Base {
        init(): Promise<void>;
    }
}

export declare namespace SimFileSystem {
    const fileMetaOptions: FileMetaOptions;
    export interface FileMetaOptions {
        customDataBytes: number;
        nameBytes: number;
        totalBytes: number;
    }
}

export { }
