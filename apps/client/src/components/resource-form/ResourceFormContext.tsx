import { createContext, useContext } from "react";

interface ResourceFormContextValue {
  resource?: string;
  record?: unknown;
}

const ResourceFormContext = createContext<ResourceFormContextValue | null>(
  null,
);

export const ResourceFormProvider = ResourceFormContext.Provider;

export const useFormResource = () => {
  const context = useContext(ResourceFormContext);
  if (!context) {
    throw new Error(
      "useFormResource must be used within a ResourceFormProvider",
    );
  }
  return context.resource;
};

export const useResourceForm = () => {
  const context = useContext(ResourceFormContext);
  if (!context) {
    throw new Error(
      "useResourceForm must be used within a ResourceFormProvider",
    );
  }
  return context;
};
