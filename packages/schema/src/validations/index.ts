import * as v from "valibot";
import "@valibot/i18n/ja";

export const setValidationLanguage = (lang: string) => {
  v.setGlobalConfig({ lang });
};

export const setupValidationCustomMessages = () => {
  v.setSpecificMessage(v.nonEmpty, () => `This field is required`, "en");
  v.setSpecificMessage(v.nonEmpty, () => `この項目は必須です`, "ja");
};

export * from "./categorySchema";
export * from "./productSchema";
