import { polEndpointUrl } from "@bera/config";
import { bgtClient } from "@bera/graphql";
import {
  GetUserValidatorInformation,
  GetUserValidatorInformationQueryVariables,
  type GetUserValidatorInformationQuery,
} from "@bera/graphql/pol/subgraph";

import {
  BeraConfig,
  type UserValidator,
  type ValidatorResponse,
} from "~/types";

export const getUserActiveValidators = async ({
  config,
  account,
}: {
  config: BeraConfig;
  account: string;
}): Promise<UserValidator[] | undefined> => {
  try {
    if (!config.subgraphs?.polSubgraph) {
      throw new Error("pol subgraph uri is not found in config");
    }

    // TODO: handle more than 1000 validators
    const result = await bgtClient.query<
      GetUserValidatorInformationQuery,
      GetUserValidatorInformationQueryVariables
    >({
      query: GetUserValidatorInformation,
      variables: { address: account.toLowerCase() },
    });

    const url = `${polEndpointUrl}/user/${account}/validators`;
    const indexerRes = await fetch(url);
    const indexerData: ValidatorResponse = await indexerRes.json();
    const validatorInfoList =
      indexerData.userValidators.map((t) => t.validator) ?? [];

    const userDepositedData = result.data.userValidatorInformations;

    return validatorInfoList.map((validator) => {
      const userDeposited = userDepositedData.find(
        (data) =>
          data.validator.id.toLowerCase() === validator.id.toLowerCase(),
      );

      return {
        ...validator,
        amountDeposited: userDeposited?.amountDeposited ?? "0",
        amountQueued: userDeposited?.amountQueued ?? "0",
        latestBlock: userDeposited?.latestBlock ?? "0",
        latestBlockTime: userDeposited?.latestBlockTime ?? "0",
      };
    });
  } catch (e) {
    console.error("getUserActiveValidators:", e);
    return undefined;
  }
};
