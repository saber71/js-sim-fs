import fs from "node:fs";
import fsPromise from "node:fs/promises";
import { BufferReader } from "./BufferReader.ts";

export namespace HardDisk {
  export abstract class Base {
    constructor(
      // 硬盘容量，单位：字节
      readonly capacity: number,
    ) {}

    // 执行硬盘初始化操作
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
    private readonly _data: Buffer;

    constructor(capacity: number) {
      super(capacity);
      this._data = Buffer.alloc(capacity);
    }

    init(): Promise<void> {
      return Promise.resolve();
    }

    read(offset: number, length: number): Promise<Buffer> {
      return Promise.resolve(BufferReader.slice(this._data, offset, length));
    }

    write(data: Buffer, writeInOffset: number): Promise<void> {
      data.copy(this._data, writeInOffset, 0, data.length);
      return Promise.resolve();
    }
  }

  export class File extends Base {
    private readonly _handler: fsPromise.FileHandle;

    constructor(
      // 存储硬盘数据的文件路径
      readonly path: string,
      // 硬盘容量，单位：字节。如果不指定，则使用文件大小作为容量。如果文件不存在，则抛出异常。
      capacity: number = 0,
    ) {
      super(capacity);
    }

    async init(): Promise<void> {
      let fileSize = 0;
      if (!fs.existsSync(this.path)) {
        if (this.capacity <= 0)
          throw new Error(`硬盘数据不存在，硬盘容量必须大于0`);
      } else {
        fileSize = (await fsPromise.stat(this.path)).size;
      }
      if (this.capacity > 0 && fileSize !== this.capacity) {
        await fsPromise.writeFile(this.path, Buffer.alloc(0));
        await fsPromise.truncate(this.path, this.capacity);
      }
      (this as any)._handler = await fsPromise.open(this.path, "r+");
      return;
    }

    async read(offset: number, length: number): Promise<Buffer> {
      const buffer = Buffer.alloc(length);
      await this._handler.read(buffer, 0, length, offset);
      return buffer;
    }

    async write(data: Buffer, writeInOffset: number): Promise<void> {
      await this._handler.write(data, 0, data.length, writeInOffset);
    }
  }
}
