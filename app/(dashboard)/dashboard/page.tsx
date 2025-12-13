"use client";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

import data from "./data.json";
import { useState } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { User2Icon } from "lucide-react";

export default function Page() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <User2Icon />
          </EmptyMedia>
          <EmptyTitle>No User Data</EmptyTitle>
          <EmptyDescription>
            Please add a user to see the data.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          You can add a user by clicking the "Add User" button.
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="@container/main flex flex-col gap-2">
        <div className="flex flex-col gap-4">
          <SectionCards />
          <div>
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
