import type { PropsWithChildren } from "react";
import { Menu } from "@/components/menu";
import { Navbar } from "@/components/navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Menu />
        <SidebarInset>
          <Navbar />
          <main className="flex-1 px-6 py-4">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
