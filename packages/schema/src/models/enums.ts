import { status } from "@packages/constants";
import * as t from "drizzle-orm/pg-core";

export const statusEnum = t.pgEnum("status", status);
