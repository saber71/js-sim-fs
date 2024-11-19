import type { HardDisk } from "./HardDisk"

export namespace HardDiskController {
  export abstract class Base {
    constructor(readonly hardDisk: HardDisk.Base) {}

    abstract init(): Promise<void>
  }

  export class Default extends Base {
    async init(): Promise<void> {
      await this.hardDisk.init()
    }
  }

  export const dataMeta: DataMeta = {
    totalBytes: 1024,
    customBytes: 0,
    clusterBytes: 1024 * 4
  }

  export interface DataMeta {
    // 元数据所占用的总字节数
    totalBytes: number
    // 元数据中存储的额外数据的字节数
    customBytes: number
    // 一个数据簇所占用的字节数
    clusterBytes: number
  }
}
