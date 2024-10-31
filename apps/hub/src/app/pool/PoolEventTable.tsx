import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@bera/ui/table";
import formatTimeAgo from "~/utils/formatTimeAgo";
import { usePoolEvents } from "./../../b-sdk/usePoolEvents";
import { blockExplorerUrl } from "@bera/config";
import { FormattedNumber, SimpleTable, useAsyncTable } from "@bera/shared-ui";
import { PoolWithMethods } from "@balancer-labs/sdk";
import { truncateHash } from "@bera/berajs";
import { bexApiGraphqlClient } from "@bera/graphql";

import {
  GetPoolEvents,
  GetPoolEventsQuery,
  GetPoolEventsQueryResult,
  GetPoolEventsQueryVariables,
  GqlPoolEventType,
} from "@bera/graphql/dex";
import { useState } from "react";

export const EventTable = ({
  pool,
  isLoading,
  types,
}: {
  pool: PoolWithMethods | undefined;
  isLoading: boolean | undefined;
  types?: GqlPoolEventType[];
}) => {
  const { data, isLoading: isEventsLoading } = usePoolEvents(pool?.id);
  // const [events, setEvents] = useState<
  //   NonNullable<GetPoolEventsQueryResult["data"]>["poolGetEvents"]
  // >([]);

  const events = types
    ? data?.poolGetEvents.filter((e) => types.includes(e.type))
    : data?.poolGetEvents;

  const table = useAsyncTable<
    NonNullable<GetPoolEventsQueryResult["data"]>["poolGetEvents"][number]
  >({
    data: events ?? [],
    enablePagination: true,

    additionalTableProps: {
      manualPagination: false,
      enableSorting: false,
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
    },
    fetchData: async (state) => {
      console.log("FETCHING DATA", state);

      if (!pool?.id) return;

      // const response = await bexApiGraphqlClient.query<GetPoolEventsQuery>({
      //   query: GetPoolEvents,
      //   variables: {
      //     poolId: pool?.id!,
      //     typeIn: [
      //       GqlPoolEventType.Swap,
      //       GqlPoolEventType.Add,
      //       GqlPoolEventType.Remove,
      //     ],
      //   } satisfies GetPoolEventsQueryVariables,
      // });
      // if (response.errors) {
      //   throw new Error(response.errors[0].message);
      // }
      return;
    },
    columns: [
      {
        header: "Action",
        accessorKey: "tx",
        cell: ({ row }) => {
          return row.original.type === "SWAP" ? (
            <span className="">Swap</span>
          ) : row.original.type === "ADD" ? (
            <span className="text-success-foreground">Add</span>
          ) : (
            <span>Withdraw</span>
          );
        },
      },
      {
        header: "Value",
        cell: ({ row }) => {
          return (
            <FormattedNumber value={row.original.valueUSD ?? 0} symbol="USD" />
          );
        },
        accessorKey: "valueUSD",
      },
      {
        header: "Txn hash",
        accessorKey: "tx",
        cell: ({ row }) => {
          return (
            <a
              href={`${blockExplorerUrl}/tx/${row.original.tx}`}
              target="_blank"
              rel="noreferrer"
            >
              {truncateHash(row.original.tx)}
            </a>
          );
        },
      },
      {
        header: "Time",
        accessorKey: "timestamp",
        cell: ({ row }) => {
          return formatTimeAgo(row.original.timestamp);
        },
      },
    ],
  });

  return (
    <SimpleTable
      dynamicFlex
      table={table}
      wrapperClassName="hidden sm:flex rounded-none"
      flexTable
      showSelection={false}
    />
  );
};
