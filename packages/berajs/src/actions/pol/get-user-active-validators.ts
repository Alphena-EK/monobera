import { BeraConfig } from "~/types";
import { getUserBoosts } from "./getUserBoosts";
import { getAllValidators } from "./get-all-validators";
import { ApiValidatorFragment } from "@bera/graphql/pol/api";
import { UserBoostsOnValidator } from "./getUserBoostsOnValidator";

export type ValidatorWithUserBoost = ApiValidatorFragment & {
  userBoosts: UserBoostsOnValidator;
};

export const getUserActiveValidators = async ({
  config,
  account,
}: {
  config: BeraConfig;
  account: string;
}): Promise<ValidatorWithUserBoost[] | undefined> => {
  const userBoosts = await getUserBoosts({ config, account });

  const validatorInfoList = await getAllValidators({
    config,
    variables: {
      where: {
        idIn: userBoosts.data.userValidatorInformations.map(
          (t) => t.validator.id,
        ),
      },
    },
  });

  return validatorInfoList?.validators.map((validator) => {
    const userDeposited = userBoosts.data.userValidatorInformations.find(
      (data) => data.validator.id.toLowerCase() === validator.id.toLowerCase(),
    );

    if (!userDeposited) {
      throw new Error("User deposited not found");
    }

    return {
      ...validator,
      userBoosts: {
        activeBoosts: userDeposited?.amountDeposited,
        queuedBoosts: userDeposited?.amountQueued,
        queueBoostStartBlock: userDeposited?.queuedStartBlock,
        queuedUnboosts: userDeposited?.amountDropQueued,
        queueUnboostStartBlock: userDeposited?.dropQueuedStartBlock,
      } satisfies UserBoostsOnValidator,
    } satisfies ValidatorWithUserBoost;
  });
};
