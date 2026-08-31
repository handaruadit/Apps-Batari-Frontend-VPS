const fs = require("fs");
const net = require("net");
const path = require("path");
const { spawn } = require("child_process");

const API_HOST = "127.0.0.1";
const API_PORT = Number(process.env.EXPO_PUBLIC_API_PORT || 3001);
const DEFAULT_API_PATH = path.resolve(
  process.cwd(),
  "..",
  "..",
  "belajar-api",
  "belajar-api",
);
const API_PATH = path.resolve(
  process.env.BELAJAR_API_PATH || DEFAULT_API_PATH,
);
const API_ENTRY = path.join(API_PATH, "src", "index.js");

function isPortOpen() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: API_HOST, port: API_PORT });
    const finish = (isOpen) => {
      socket.destroy();
      resolve(isOpen);
    };

    socket.setTimeout(500);
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
  });
}

async function waitForApi() {
  const deadline = Date.now() + 10000;

  while (Date.now() < deadline) {
    if (await isPortOpen()) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return false;
}

async function main() {
  if (await isPortOpen()) {
    console.log(`[startup] Backend API sudah aktif pada port ${API_PORT}.`);
    return;
  }

  if (!fs.existsSync(API_ENTRY)) {
    throw new Error(
      `Backend tidak ditemukan di ${API_PATH}. Atur BELAJAR_API_PATH ke folder belajar-api.`,
    );
  }

  const backend = spawn(process.execPath, [API_ENTRY], {
    cwd: API_PATH,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  backend.unref();

  if (!(await waitForApi())) {
    throw new Error(`Backend gagal aktif pada port ${API_PORT}.`);
  }

  console.log(`[startup] Backend API dijalankan pada port ${API_PORT}.`);
}

main().catch((error) => {
  console.error(`[startup] ${error.message}`);
  process.exitCode = 1;
});
