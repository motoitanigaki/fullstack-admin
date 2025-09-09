import { useBreadcrumb } from "@refinedev/core";
import { Link } from "react-router";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumb as UIBreadcrumb,
} from "@/components/ui/breadcrumb";

export const Breadcrumb = () => {
  const { breadcrumbs } = useBreadcrumb();
  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  return (
    <UIBreadcrumb className="flex h-9 justify-center">
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return [
            <BreadcrumbItem key={`item-${breadcrumb.label}`}>
              {breadcrumb.href && !isLast ? (
                <BreadcrumbLink asChild>
                  <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="font-semibold">
                  {breadcrumb.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>,
            !isLast ? (
              <BreadcrumbSeparator key={`sep-${breadcrumb.label}`} />
            ) : null,
          ];
        })}
      </BreadcrumbList>
    </UIBreadcrumb>
  );
};
