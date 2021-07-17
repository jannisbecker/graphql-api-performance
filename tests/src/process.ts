import { ChildProcess, spawn, execSync, exec } from "child_process";
import { Impl } from "./types";

let backend_process: ChildProcess;

export function buildBackend() {
  console.log("Compiling backend");
  execSync("npm --prefix ../api run build");
}

export function startBackend(impl: Impl) {
  if (backend_process) {
    console.log("Stopping running backend");
    backend_process.kill();
  }

  console.log(`Starting backend with implementation ${impl}`);
  backend_process = exec(`npm --prefix ../api run start -- --impl ${impl}`);
}
