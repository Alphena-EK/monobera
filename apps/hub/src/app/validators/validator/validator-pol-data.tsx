import {
  RewardVaultIncentive,
  usePollGauges,
  type Validator,
} from "@bera/berajs";
import { SimpleTable, useAsyncTable } from "@bera/shared-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@bera/ui/tabs";

import GlobalGaugeWeightChart from "~/components/global-gauge-weight-chart";
import { validator_gauge_columns } from "~/columns/gauge-incentives-columns";
import { getValidatorGaugeColumns } from "~/columns/validator-gauge-columns";
import { type ActiveIncentiveWithVault } from "~/types/validators";
import { ApiValidatorFragment } from "@bera/graphql/pol/api";

export const ValidatorPolData = ({
  validator,
}: { validator: ApiValidatorFragment }) => {
  const gaugesTable = useAsyncTable({
    fetchData: async () => {},
    columns: getValidatorGaugeColumns(validator),
    data: validator.rewardAllocationWeights ?? [],
    additionalTableProps: {
      manualSorting: false,
      meta: {
        loadingText: "Loading...",
      },
    },
  });

  const incentivesTable = useAsyncTable({
    fetchData: async () => {},
    columns: validator_gauge_columns,
    data: validator.rewardAllocationWeights ?? [],
    additionalTableProps: {
      manualSorting: false,
      meta: {
        // loading: isLoading,
        loadingText: "Loading...",
        // validating: isValidating,
      },
    },
  });

  return (
    <div className="mt-6 flex w-full flex-col gap-6 lg:flex-row">
      <div className="w-full">
        <Tabs defaultValue="gauges">
          <TabsList variant="ghost" className="">
            <TabsTrigger value="gauges">Reward Vaults</TabsTrigger>
            <TabsTrigger value="incentives">Incentives</TabsTrigger>
          </TabsList>
          <TabsContent value={"gauges"} className="mt-6">
            <SimpleTable
              table={gaugesTable}
              // variant="ghost"
              wrapperClassName={"w-full"}
              flexTable
              dynamicFlex
              showToolbar={false}
            />
          </TabsContent>
          <TabsContent value={"incentives"} className="mt-6">
            <SimpleTable
              table={incentivesTable}
              // variant="ghost"
              wrapperClassName={"w-full"}
              flexTable
              dynamicFlex
              showToolbar={false}
            />
          </TabsContent>
        </Tabs>
      </div>
      <GlobalGaugeWeightChart
        gaugeWeights={validator?.rewardAllocationWeights}
        totalAmountStaked={validator?.amountStaked ?? "0"}
        globalAmountStaked={"10000000"}
        isLoading={false}
        showTotal={false}
      />
    </div>
  );
};
