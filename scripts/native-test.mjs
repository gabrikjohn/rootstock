import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";

const root = resolve(new URL("../", import.meta.url).pathname);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit"
  });
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
  return result;
}

run("npm", ["run", "build"]);
const listed = run("xcrun", ["simctl", "list", "devices", "available", "--json"], { capture: true });
const devices = Object.values(JSON.parse(listed.stdout).devices)
  .flat()
  .filter((device) => device.isAvailable && device.name.startsWith("iPhone"));
const requested = process.env.ROOTSTOCK_SIMULATOR_ID;
const device = requested
  ? devices.find((candidate) => candidate.udid === requested)
  : devices.find((candidate) => candidate.state === "Booted") ?? devices[0];

if (!device) throw new Error("No available iPhone Simulator was found");
if (device.state !== "Booted") {
  run("xcrun", ["simctl", "boot", device.udid], { allowFailure: true });
}
run("xcrun", ["simctl", "bootstatus", device.udid, "-b"]);
run("xcodebuild", [
  "-quiet",
  "-project", "ios/Rootstock.xcodeproj",
  "-scheme", "Rootstock",
  "-destination", `platform=iOS Simulator,id=${device.udid}`,
  "-derivedDataPath", join(tmpdir(), "rootstock-native-tests"),
  "test"
]);
