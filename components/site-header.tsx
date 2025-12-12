"use client";
import { data } from "@/constant/sidebar-items";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { ModeToggle } from "./mode-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const nav = data.navMain;

  const currentNavItem = nav.find((item) => item.url === pathname);

  // You can use pathname or router as needed here for navigation or highlighting

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{currentNavItem?.title || ""}</h1>
      </div>
      <div className="justify-end flex w-full items-center px-4 lg:px-6">
        <ModeToggle />
      </div>
    </header>
  );
}
