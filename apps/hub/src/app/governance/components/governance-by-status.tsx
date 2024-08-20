import React from "react";
import Link from "next/link";
import { Button } from "@bera/ui/button";

import { ProposalsList } from "./proposals-list";

export default function GovernanceByStatus() {
  return (
    <div>
      <div className="text-forergound text-center text-3xl font-bold leading-9 sm:text-5xl sm:leading-[48px]">
        🗳️Vote on proposals or <br />
        create your own
      </div>
      <div className="mx-auto mb-8 mt-6 flex w-[165px] flex-col justify-center gap-3 sm:w-full sm:flex-row">
        <Link href="/governance/create">
          <Button>Create proposal</Button>
        </Link>
        <Button variant="outline">Visit forums</Button>
      </div>

      <ProposalsList />
    </div>
  );
}
