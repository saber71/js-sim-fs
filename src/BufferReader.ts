export class BufferReader {
  constructor(
    readonly data: Buffer,
    protected readonly _start: number,
    protected readonly _end: number = data.length - 1,
  ) {}

  get length() {
    return this._end - this._start + 1;
  }

  copy(offset: number = 0, length: number = this.length) {
    if (offset + length - 1 > this._end)
      throw new Error("length out of buffer range");
    const target = Buffer.alloc(length);
    this.data.copy(
      target,
      0,
      this._start + offset,
      this._start + offset + length,
    );
    return target;
  }

  readBit(offset: number, bit: number) {
    if (bit < 0 || bit > 7) throw new Error("bit out of range");
    const byte = this.readUint8(offset);
    const mask = 1 << bit;
    return (byte & mask) > 0 ? 1 : 0;
  }

  readInt8(offset: number) {
    offset += this._start;
    if (offset > this._end) throw new Error("offset out of buffer range");
    return this.data.readInt8(offset);
  }

  readUint8(offset: number) {
    offset += this._start;
    if (offset > this._end) throw new Error("offset out of buffer range");
    return this.data.readUint8(offset);
  }

  readInt16(offset: number) {
    offset += this._start;
    if (offset + 1 > this._end) throw new Error("offset out of buffer range");
    return this.data.readInt16BE(offset);
  }

  readUint16(offset: number) {
    offset += this._start;
    if (offset + 1 > this._end) throw new Error("offset out of buffer range");
    return this.data.readUint16BE(offset);
  }

  readInt32(offset: number) {
    offset += this._start;
    if (offset + 3 > this._end) throw new Error("offset out of buffer range");
    return this.data.readInt32BE(offset);
  }

  readUint32(offset: number) {
    offset += this._start;
    if (offset + 3 > this._end) throw new Error("offset out of buffer range");
    return this.data.readUint32BE(offset);
  }

  readInt64(offset: number) {
    offset += this._start;
    if (offset + 7 > this._end) throw new Error("offset out of buffer range");
    return this.data.readBigInt64BE(offset);
  }

  readUint64(offset: number) {
    offset += this._start;
    if (offset + 7 > this._end) throw new Error("offset out of buffer range");
    return this.data.readBigUInt64BE(offset);
  }
}
