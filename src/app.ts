import { AppController } from "./ui/app-controller";
import { browserDependencies } from "./platform/contracts";
import { registerPwa } from "./platform/pwa";

new AppController(browserDependencies()).start();
registerPwa();
