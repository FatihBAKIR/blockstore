import fs = require('fs');
import yaml = require('js-yaml');

export enum DificultyMode 
{
  Invalid,
  Static,
  Dynamic
}

export enum BroadcastMode
{
  Invalid,
  Sync,
  Async
}

export enum BroadcastMinGuarantee 
{
  Invalid,
  Single,
  Double,
  Majority,
  All
}

// For the full summary of each field, read src/ts/example/configs/verbose.yaml
export class Config
{
  opMaxSize: number;
  blkMaxSize: number;
  blkMaxOperationCount: number;
  blkDifficultyMode: DificultyMode;
  blkDifficultyTargetValue: number;
  bchnBroadcastMode: BroadcastMode;
  bchnBroadcastMinGuarantee: BroadcastMinGuarantee;

  constructor ()
  {
    this.opMaxSize = 0;
    this.blkMaxSize = 0;
    this.blkMaxOperationCount = 0;
    this.blkDifficultyMode = DificultyMode.Invalid;
    this.blkDifficultyTargetValue = 0;
    this.bchnBroadcastMode = BroadcastMode.Invalid;
    this.bchnBroadcastMinGuarantee = BroadcastMinGuarantee.Invalid;
  }

  static LoadConfig(path: string) : Config
  {
    let doc;

    try {
      doc = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
    } 
    catch (e) {
      throw new Error("Failed to read/parse the given config file");
    }

    let val;
    let config = new Config();

    val = doc.operation.maxSize;
    if (val && Number.isInteger(val) && val > 0 && val < Number.MAX_SAFE_INTEGER) {
      config.opMaxSize = val;
    }
    else {
      throw new Error("Config parameter for operation.maxSize missing or invalid");
    }

    val = doc.block.maxSize;
    if (val && Number.isInteger(val) && val > 0 && val < Number.MAX_SAFE_INTEGER) {
      config.blkMaxSize = val;
    }
    else {
      throw new Error("Config parameter for block.maxSize missing or invalid");
    }

    val = doc.block.maxOperationCount;
    if (val && Number.isInteger(val) && val > 0 && val < Number.MAX_SAFE_INTEGER) {
      config.blkMaxOperationCount = val;
    }
    else {
      throw new Error("Config parameter for block.maxOperationCount missing or invalid");
    }

    if (config.blkMaxSize < config.opMaxSize) {
      throw new Error("block.maxSize must be greater than operation.maxSize");
    }
    if (config.blkMaxSize < config.opMaxSize * config.blkMaxOperationCount) {
      throw new Error("block.maxSize must be greater than operation.maxSize multiplied by block.maxOperationCount");
    }

    val = doc.block.difficultyMode;
    if (val && (typeof val == 'string' || val instanceof String)) {
      for (let mode in DificultyMode) {
        if (!Number(mode) && val == String(mode)) {
          config.blkDifficultyMode = (<any>DificultyMode)[mode];
          break;
        }
      }
      if (config.blkDifficultyMode == DificultyMode.Invalid) {
        throw new Error("Config parameter for block.difficultyMode missing or invalid");
      }
    }
    else {
      throw new Error("Config parameter for block.difficultyMode missing or invalid");
    }

    val = doc.block.difficultyTargetValue;
    if(val && Number.isInteger(val) && val > 0 && val < 256) {
      config.blkDifficultyTargetValue = val;
    }
    else {
      throw new Error("Config parameter for block.difficultyTargetValue missing or invalid");
    }

    val = doc.blockchain.broadcastMode;
    if (val && (typeof val == 'string' || val instanceof String)) {
      for (let mode in BroadcastMode) {
        if (!Number(mode) && val == String(mode)) {
          config.bchnBroadcastMode = (<any>BroadcastMode)[mode];
          break;
        }
      }
      if (config.bchnBroadcastMode == BroadcastMode.Invalid) {
        throw new Error("Config parameter for blockchain.broadcastMode missing or invalid");
      }
    }
    else {
      throw new Error("Config parameter for blockchain.broadcastMode missing or invalid");
    }

    val = doc.blockchain.broadcastMinGuarantee;
    if (val && (typeof val == 'string' || val instanceof String)) {
      for (let mode in BroadcastMinGuarantee) {
        if (!Number(mode) && val == String(mode)) {
          config.bchnBroadcastMinGuarantee = (<any>BroadcastMinGuarantee)[mode];
          break;
        }
      }
      if (config.bchnBroadcastMinGuarantee == BroadcastMinGuarantee.Invalid) {
        throw new Error("Config parameter for blockchain.broadcastMinGuarantee missing or invalid");
      }
    }
    else if (config.bchnBroadcastMode != BroadcastMode.Async) {
      throw new Error("Config parameter for blockchain.broadcastMinGuarantee missing or invalid");
    }

    return config;
  }
}
