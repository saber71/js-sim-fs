export class BufferReader {
  constructor(
    protected readonly _data: Buffer,
    protected readonly _start: number,
    protected readonly _end: number = _data.length - 1,
  ) {}

  static slice(
    buffer: Buffer,
    offset: number,
    length: number = buffer.length - offset,
  ) {
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
   */
  slice(offset: number = 0, length: number = this.length) {
    // 检查指定的范围是否超出了当前缓冲区读取器的边界
    if (offset + length - 1 > this._end)
      throw new Error("length out of buffer range");

    // 调用BufferReader的slice方法，根据指定的范围从当前缓冲区读取器中切出一个新的缓冲区读取器
    return BufferReader.slice(this._data, this._start + offset, length);
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
    return this._data.readInt8(offset);
  }

  readUint8(offset: number) {
    offset += this._start;
    if (offset > this._end) throw new Error("offset out of buffer range");
    return this._data.readUint8(offset);
  }

  readInt16(offset: number) {
    offset += this._start;
    if (offset + 1 > this._end) throw new Error("offset out of buffer range");
    return this._data.readInt16BE(offset);
  }

  readUint16(offset: number) {
    offset += this._start;
    if (offset + 1 > this._end) throw new Error("offset out of buffer range");
    return this._data.readUint16BE(offset);
  }

  readInt32(offset: number) {
    offset += this._start;
    if (offset + 3 > this._end) throw new Error("offset out of buffer range");
    return this._data.readInt32BE(offset);
  }

  readUint32(offset: number) {
    offset += this._start;
    if (offset + 3 > this._end) throw new Error("offset out of buffer range");
    return this._data.readUint32BE(offset);
  }

  readInt64(offset: number) {
    offset += this._start;
    if (offset + 7 > this._end) throw new Error("offset out of buffer range");
    return this._data.readBigInt64BE(offset);
  }

  readUint64(offset: number) {
    offset += this._start;
    if (offset + 7 > this._end) throw new Error("offset out of buffer range");
    return this._data.readBigUInt64BE(offset);
  }
}
