import { Command } from "commander";
import { checkpointCommand } from "./checkpoint";
import { hooksCommand } from "./hooks";

export function registerCommands(program: Command): void {
  checkpointCommand(program);
  hooksCommand(program);
}

export { checkpointCommand } from "./checkpoint";
export { hooksCommand } from "./hooks";
