import { BufferReader } from "./BufferReader.ts";
import type { DataType } from "./types.ts";

export class BufferWriter extends BufferReader {
  writeBit(bool: boolean | number, bit: number, offset: number) {
    if (bit < 0 || bit > 7) throw new Error("bit out of range");
    bit = 7 - bit;
    const bitValue = bool ? 1 : 0;
    const oldValue = this.readUint8(offset);
    const newValue = bitValue ? oldValue | (1 << bit) : oldValue & ~(1 << bit);
    this.writeUint8(newValue, offset);
  }

  writeInt8(value: number, offset: number) {
    offset += this._start;
    if (offset > this._end) throw new Error("offset out of buffer range");
    this._data.writeInt8(value, offset);
  }

  writeUint8(value: number, offset: number) {
    offset += this._start;
    if (offset > this._end) throw new Error("offset out of buffer range");
    this._data.writeUint8(value, offset);
  }

  writeInt16(value: number, offset: number) {
    offset += this._start;
    if (offset + 1 > this._end) throw new Error("offset out of buffer range");
    this._data.writeInt16BE(value, offset);
  }

  writeUint16(value: number, offset: number) {
    offset += this._start;
    if (offset + 1 > this._end) throw new Error("offset out of buffer range");
    this._data.writeUint16BE(value, offset);
  }

  writeInt32(value: number, offset: number) {
    offset += this._start;
    if (offset + 3 > this._end) throw new Error("offset out of buffer range");
    this._data.writeInt32BE(value, offset);
  }

  writeUint32(value: number, offset: number) {
    offset += this._start;
    if (offset + 3 > this._end) throw new Error("offset out of buffer range");
    this._data.writeUint32BE(value, offset);
  }

  writeInt64(value: bigint, offset: number) {
    offset += this._start;
    if (offset + 7 > this._end) throw new Error("offset out of buffer range");
    this._data.writeBigInt64BE(value, offset);
  }

  writeUint64(value: bigint, offset: number) {
    offset += this._start;
    if (offset + 7 > this._end) throw new Error("offset out of buffer range");
    this._data.writeBigUInt64BE(value, offset);
  }

  write(type: DataType, value: number | bigint, offset: number) {
    if (type === "uint8") return this.writeUint8(value as any, offset);
    else if (type === "int8") return this.writeInt8(value as any, offset);
    else if (type === "int16") return this.writeInt16(value as any, offset);
    else if (type === "uint16") return this.writeUint16(value as any, offset);
    else if (type === "int32") return this.writeInt32(value as any, offset);
    else if (type === "uint32") return this.writeUint32(value as any, offset);
    else if (type === "uint64") return this.writeUint64(value as any, offset);
    else if (type === "int64") return this.writeInt64(value as any, offset);
    throw new Error("Invalid type " + type);
  }

  putArray(array: number[], type: DataType, writeInStart: number = 0) {
    let methodName = "",
      offsetStep = 1;
    switch (type) {
      case "int32":
        methodName = "writeInt32";
        offsetStep = 4;
        break;
      case "uint32":
        methodName = "writeUint32";
        offsetStep = 4;
        break;
      case "int16":
        methodName = "writeInt16";
        offsetStep = 2;
        break;
      case "uint16":
        methodName = "writeUint16";
        offsetStep = 2;
        break;
      case "int8":
        methodName = "writeInt8";
        break;
      case "uint8":
        methodName = "writeUint8";
        break;
      default:
        throw new Error("invalid type " + type);
    }
    for (let i = 0; i < array.length; i++, writeInStart += offsetStep) {
      (this as any)[methodName](array[i], writeInStart);
    }
  }

  putBigintArray(
    data: bigint[],
    writeInStart: number = 0,
    unsigned: boolean = false,
  ) {
    const methodName = unsigned ? "writeUint64" : "writeInt64";
    for (let i = 0; i < data.length; i++, writeInStart += 8) {
      (this as any)[methodName](data[i], writeInStart);
    }
  }

  putBuffer(
    data: Buffer | BufferReader,
    offset: number,
    start: number = 0,
    length: number = data.length,
  ) {
    if (this._start + offset + length > this._end)
      throw new Error("offset out of buffer range");
    if (data instanceof BufferReader) data = data.getData();
    data.copy(this._data, this._start + offset, start, length);
  }
}
