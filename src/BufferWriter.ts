import { BufferReader } from "./BufferReader.ts";

export class BufferWriter extends BufferReader {
  write(
    data: Buffer,
    offset: number,
    start: number = 0,
    length: number = data.length,
  ) {
    if (this._start + offset + length > this._end)
      throw new Error("offset out of buffer range");
    data.copy(this._data, this._start + offset, start, length);
  }

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
}
