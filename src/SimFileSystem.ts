export namespace SimFileSystem {
  export const fileMetaOptions: FileMetaOptions = {
    customDataBytes: 20,
    nameBytes: 255,
    totalBytes: 1024
  }

  class FileMeta {
    constructor(
      readonly buffer: Buffer,
      readonly start: number,
      readonly length: number
    ) {}
  }

  export interface FileMetaOptions {
    // 元数据中可自定义的字节数
    customDataBytes: number
    // 文件名的字节数
    nameBytes: number
    // 元数据总共占据的字节数
    totalBytes: number
  }
}
