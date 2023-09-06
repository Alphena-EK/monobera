import React from "react";
import { RT } from "@bera/shared-ui";
import { Avatar, AvatarFallback, AvatarImage } from "@bera/ui/avatar";

import InfoButton from "~/components/info-button";
import SupplyBtn from "~/components/modals/supply-button";
import UserTokenCard from "~/components/user-token-card";
import { user_supply_columns } from "./column";

export default function UserSupply({
  markets,
  tableView = false,
}: {
  markets: any[];
  tableView?: boolean;
}) {
  const data = React.useMemo(
    () =>
      markets.slice(0, 2).map((market) => ({
        market: (
          <div className="flex w-[100px] items-center gap-2 text-sm font-medium leading-none">
            <Avatar className="h-6 w-6">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="font-bold">
                {market.title}
              </AvatarFallback>
            </Avatar>
            {market.title}
          </div>
        ),
        wallet_balance: (
          <div className="flex w-[114px] flex-col pl-1">
            <div className="font-base text-base font-medium">
              {market.totalSupply}
            </div>
            <div className="text-xs font-medium leading-tight text-muted-foreground">
              $164.74 Million
            </div>
          </div>
        ),
        supply_apy: (
          <div className="w-[114px] text-base text-success-foreground">
            12.38%
          </div>
        ),
        action: (
          <div className="flex w-[150px] gap-2">
            <SupplyBtn />
            <InfoButton address="0x20f33CE90A13a4b5E7697E3544c3083B8F8A51D4" />
          </div>
        ),
      })),
    [markets],
  );

  return (
    <>
      <div className="text-2xl font-semibold leading-loose">Your Supplies</div>
      <div className=" text-muted-foreground">
        You must supply in order to borrow funds.
      </div>
      {tableView ? (
        <RT columns={user_supply_columns} data={data} />
      ) : (
        <>
          {markets.slice(0, 2).map((market, index) => (
            <UserTokenCard market={market} key={index} type="user-supply" />
          ))}
        </>
      )}
    </>
  );
}