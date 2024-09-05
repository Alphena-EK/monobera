import { InputValidator } from "../inputValidator/inputValidator";
import { PoolState } from "../types";
import {
  InitPoolBuildOutput,
  InitPoolConfig,
  InitPoolInput,
  InitPoolInputV2,
  InitPoolInputV3,
} from "./types";
import { InitPoolV2 } from "./initPoolV2";
import { InitPoolV3 } from "./initPoolV3";

export * from "./types";

export class InitPool {
  inputValidator: InputValidator = new InputValidator();

  constructor(public config?: InitPoolConfig) {}

  buildCall(input: InitPoolInput, poolState: PoolState): InitPoolBuildOutput {
    this.inputValidator.validateInitPool(input, poolState);
    switch (poolState.protocolVersion) {
      case 2:
        return new InitPoolV2().buildCall(input as InitPoolInputV2, poolState);
      case 3:
        return new InitPoolV3().buildCall(input as InitPoolInputV3, poolState);
      default:
        throw Error(
          `SDK does not support init for vault version: ${poolState.protocolVersion}`,
        );
    }
  }
}
