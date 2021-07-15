import { ChildProcess, spawn, execSync, exec } from "child_process";
import { Impl } from "./types";

let backend_process: ChildProcess;

export function buildBackend() {
  console.log("Compiling backend");
  execSync("npm --prefix ../api run build");
}

export function startBackend(impl: Impl) {
  console.log(`Starting backend with implementation ${impl}`);

  if (backend_process) {
    backend_process.kill();
  }

  backend_process = exec(`npm --prefix ../api run start -- --impl ${impl}`);
}
