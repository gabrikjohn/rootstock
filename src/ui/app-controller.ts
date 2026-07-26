import { startAppRuntime } from "./app-runtime";
import type { AppDependencies } from "../platform/contracts";

/** Owns application startup and injects browser/platform dependencies. */
export class AppController {
  constructor(private readonly dependencies: AppDependencies) {}

  start(): void {
    startAppRuntime(this.dependencies);
  }
}
