import {
  BufferData,
  type BufferReader,
  BufferWriter,
} from "@heraclius/buffer-tools";
import { lazy } from "@heraclius/js-tools";
import type { HardDisk } from "./HardDisk";

export namespace HardDiskController {
  export interface Option {
    // 统计元数据条数所占用的字节数
    metaCounterBytes: number;
    // 一条元数据占用的字节数
    metaBytes: number;
    // 元数据中存储额外数据的字节数
    metaCustomBytes: number;
    // 元数据条数的最大值
    maxMetaCount: number;
    // 一个数据簇所占用的字节数
    clusterBytes: number;
  }

  // 默认配置
  export const option: Option = {
    metaCounterBytes: 4,
    metaBytes: 1024,
    metaCustomBytes: 0,
    maxMetaCount: Number.MAX_SAFE_INTEGER,
    clusterBytes: 1024 * 4,
  };

  // 数据簇中记录数据长度的字节数
  const clusterLengthBytes = lazy(() => {
    if (option.clusterBytes <= 2 ** 8) return 1;
    if (option.clusterBytes <= 2 ** 16) return 2;
    if (option.clusterBytes <= 2 ** 32) return 4;
    return 8;
  });
  // 数据簇中记录数据长度的数字类型
  const clusterLengthDataType = lazy(() =>
    BufferData.unsignedType(clusterLengthBytes.value),
  );

  export abstract class Base {
    constructor(readonly hardDisk: HardDisk.Base) {}

    // 硬盘中数据簇的理论总数目
    get clusterCount() {
      return Math.ceil(this.hardDisk.capacity / option.clusterBytes);
    }

    abstract init(): Promise<void>;
  }

  export class Default extends Base {
    async init(): Promise<void> {
      await this.hardDisk.init();
    }
  }

  class DataMeta {
    readonly customData: BufferWriter;
    readonly contentIndexes: BufferWriter;

    constructor(readonly buffer: BufferReader) {
      this.customData = buffer.slice(BufferWriter, 0, option.metaCustomBytes);
      this.contentIndexes = buffer.slice(
        BufferWriter,
        option.metaCustomBytes,
        option.metaBytes - option.metaCustomBytes,
      );
    }
  }

  class Cluster {
    constructor(readonly buffer: BufferReader) {}

    get dataLength() {
      return this.buffer.read(
        clusterLengthDataType.value,
        this.buffer.length - clusterLengthBytes.value,
      );
    }

    getContent() {
      return this.buffer.slice(
        BufferWriter,
        0,
        (this.dataLength as number) - 1,
      );
    }
  }
}
