import React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

type Props = {
  children: React.ReactNode;
};

const DashboardLayout = (props: Props) => {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="p-6">{props.children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
