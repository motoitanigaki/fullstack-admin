import { useApiUrl } from "@refinedev/core";
import { FileDown } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import type { FilterDraft } from "./filters";
import { draftsToCrudFilters, filtersToSearchParams } from "./query";

type Props = {
  resource: string;
  appliedFilters: Record<string, FilterDraft>;
};

export const ResourceTableExport: React.FC<Props> = ({
  resource,
  appliedFilters,
}) => {
  const apiUrl = useApiUrl();

  const handleExport = React.useCallback(() => {
    const crud = draftsToCrudFilters(appliedFilters);
    const qs = filtersToSearchParams(crud);
    const href = `${apiUrl}/${resource}/export${
      qs.size ? `?${qs.toString()}` : ""
    }`;
    window.open(href, "_blank");
  }, [apiUrl, resource, appliedFilters]);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Export CSV"
      title="Export"
      onClick={handleExport}
    >
      <FileDown className="h-4 w-4" />
    </Button>
  );
};
