import { type BufferWriter } from "./BufferWriter";

export namespace BufferSegment {
  export abstract class Base<Value = number> {
    constructor(
      readonly buffer: BufferWriter,
      readonly offset: number,
    ) {}

    get value(): Value {
      return this._readValue();
    }

    set value(val: Value) {
      this._writeValue(val);
    }

    protected abstract _readValue(): Value;

    protected abstract _writeValue(value: Value): void;
  }

  export class Bit extends Base<1 | 0> {
    constructor(
      buffer: BufferWriter,
      offset: number,
      readonly bit: number,
    ) {
      super(buffer, offset);
    }

    protected _readValue(): 1 | 0 {
      return this.buffer.readBit(this.offset, this.bit);
    }

    protected _writeValue(value: 1 | 0): void {
      this.buffer.writeBit(value, this.offset, this.bit);
    }
  }

  export class Int8 extends Base {
    protected _readValue(): number {
      return this.buffer.readInt8(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeInt8(value, this.offset);
    }
  }

  export class Uint8 extends Base {
    protected _readValue(): number {
      return this.buffer.readUint8(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeUint8(value, this.offset);
    }
  }

  export class Int16 extends Base {
    protected _readValue(): number {
      return this.buffer.readInt16(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeInt16(value, this.offset);
    }
  }

  export class Uint16 extends Base {
    protected _readValue(): number {
      return this.buffer.readUint16(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeUint16(value, this.offset);
    }
  }

  export class Int32 extends Base {
    protected _readValue(): number {
      return this.buffer.readInt32(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeInt32(value, this.offset);
    }
  }

  export class Uint32 extends Base {
    protected _readValue(): number {
      return this.buffer.readUint32(this.offset);
    }

    protected _writeValue(value: number): void {
      this.buffer.writeUint32(value, this.offset);
    }
  }

  export class Int64 extends Base<bigint> {
    protected _readValue() {
      return this.buffer.readInt64(this.offset);
    }

    protected _writeValue(value: bigint): void {
      this.buffer.writeInt64(value, this.offset);
    }
  }

  export class Uint64 extends Base<bigint> {
    protected _readValue() {
      return this.buffer.readUint64(this.offset);
    }

    protected _writeValue(value: bigint): void {
      this.buffer.writeUint64(value, this.offset);
    }
  }

  export class String extends Base<string> {
    constructor(
      buffer: BufferWriter,
      offset: number,
      readonly length: number,
    ) {
      super(buffer, offset);
    }

    protected _readValue(): string {
      return this.buffer.slice(this.offset, this.length).toString();
    }

    protected _writeValue(value: string): void {
      const strBuffer = Buffer.from(value);
      if (strBuffer.length > this.length) throw new Error("String too long");
      this.buffer.write(strBuffer, this.offset);
    }
  }

  export class StringWithUint8Length extends Base<string> {
    constructor(
      buffer: BufferWriter,
      offset: number,
      readonly length: number,
    ) {
      super(buffer, offset);
    }

    protected _readValue(): string {
      const data = this.buffer.slice(this.offset, this.length);
      const strLength = data.readUint8(data.length - 1);
      return this.buffer.slice(this.offset, strLength).toString();
    }

    protected _writeValue(value: string): void {
      const buffer = Buffer.alloc(this.length);
      buffer.write(value);
      buffer.writeUint8(Buffer.from(value).length, this.length - 1);
      if (buffer.length > this.length) throw new Error("String too long");
      this.buffer.write(buffer, this.offset);
    }
  }
}
