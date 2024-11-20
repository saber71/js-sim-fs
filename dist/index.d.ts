export declare namespace HardDisk {
    export abstract class Base {
        abstract init(): Promise<void>;
        /**
         * 从硬盘中读取数据
         * @param startPosition 开始读取的位置
         * @param length 要读取的长度
         */
        abstract read(startPosition: number, length: number): Promise<Buffer>;
        /**
         * 写入数据到硬盘中
         * @param data 要写入的数据
         * @param writeInPosition 写入到硬盘中的位置
         */
        abstract write(data: Buffer, writeInPosition: number): Promise<void>;
    }
    export class Memory extends Base {
        readonly capacity: number;
        private readonly _data;
        constructor(capacity: number);
        init(): Promise<void>;
        read(startPosition: number, length: number): Promise<Buffer>;
        write(data: Buffer, writeInPosition: number): Promise<void>;
    }
    export class File extends Base {
        readonly path: string;
        readonly capacity: number;
        private readonly _handler;
        constructor(path: string, capacity?: number);
        init(): Promise<void>;
        read(startPosition: number, length: number): Promise<Buffer>;
        write(data: Buffer, writeInPosition: number): Promise<void>;
    }
}

export declare namespace HardDiskController {
    export abstract class Base {
        readonly hardDisk: HardDisk.Base;
        constructor(hardDisk: HardDisk.Base);
        abstract init(): Promise<void>;
    }
    export class Default extends Base {
        init(): Promise<void>;
    }
    const dataMeta: DataMeta;
    export interface DataMeta {
        totalBytes: number;
        customBytes: number;
        clusterBytes: number;
    }
}

export { }
