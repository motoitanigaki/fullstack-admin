import { useMenu } from "@refinedev/core";
import { Box, ChevronLeft, ChevronRight, Home, Network } from "lucide-react";
import { NavLink } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const iconMap: Record<string, React.ElementType> = {
  products: Box,
  categories: Network,
};

export const Menu = () => {
  const { menuItems } = useMenu();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="h-12 rounded-none border-b"></SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const IconComponent =
                  iconMap[item.name as keyof typeof iconMap] || Home;
                return (
                  <SidebarMenuItem key={item.key}>
                    <NavLink
                      to={item.route ?? "/"}
                      title={collapsed ? item.label : undefined}
                    >
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive}>
                          {item.icon ? (
                            item.icon
                          ) : (
                            <IconComponent className="size-4" />
                          )}
                          {!collapsed && <span>{item.label}</span>}
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-0">
        <div className="flex h-12 w-full items-center px-2 text-muted-foreground text-xs">
          {!collapsed && (
            <span className="pl-2">© {new Date().getFullYear()}</span>
          )}
          <SidebarTrigger className="ml-auto" size="icon" variant="ghost">
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </SidebarTrigger>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
