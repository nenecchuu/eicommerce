#!/usr/bin/env node
import { Command } from "commander";
import { registerTenantCreate } from "./commands/tenant-create.js";
import { registerTenantList } from "./commands/tenant-list.js";
import { registerTenantUpdate } from "./commands/tenant-update.js";
import { registerTenantDelete } from "./commands/tenant-delete.js";
import { registerHomepageUpdate } from "./commands/homepage-update.js";
import { registerProductsImport } from "./commands/products-import.js";
import { registerProductsList } from "./commands/products-list.js";
import { registerProductsPurge } from "./commands/products-purge.js";

const program = new Command();

program
  .name("vei-cli")
  .description("Vei Ops CLI — onboarding tenant dan import produk")
  .version("1.0.0");

registerTenantCreate(program);
registerTenantList(program);
registerTenantUpdate(program);
registerTenantDelete(program);
registerHomepageUpdate(program);
registerProductsImport(program);
registerProductsList(program);
registerProductsPurge(program);

program.parse(process.argv);
