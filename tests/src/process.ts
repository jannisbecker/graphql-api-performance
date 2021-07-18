import { ChildProcess, spawn, execSync, exec } from "child_process";
import { SIGINT } from "constants";
import { Impl } from "./types";

let backend_process: ChildProcess;

const sleep = (timeMs: number) => new Promise((r) => setTimeout(r, timeMs));

export function buildBackend() {
  console.log("Compiling backend");
  execSync("npm --prefix ../api run build");
}

export async function startBackend(impl: Impl) {
  if (backend_process) {
    console.log("Stopping running backend");
    backend_process.kill(SIGINT);
    // wait for it to stop
    await sleep(5000);
  }

  console.log(`Starting backend with implementation '${impl}'`);
  backend_process = exec(`npm --prefix ../api run start -- --impl ${impl}`);

  // wait for it to start
  await sleep(5000);
}
