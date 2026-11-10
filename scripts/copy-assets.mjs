import { copyFile, mkdir, access } from "node:fs/promises";
import path from "node:path";

const names = [
  "maero_basic.png",
  "maero_blue.png",
  "maero_red.png",
  "pipiro.png"
];

const source = path.resolve("assets-img");
const destination = path.resolve("public/assets-img");

await mkdir(destination, { recursive: true });
await mkdir(path.resolve("public/img"), { recursive: true });
await mkdir(path.resolve("public/photos"), { recursive: true });

for (const name of names) {
  const from = path.join(source, name);
  const to = path.join(destination, name);

  try {
    await access(from);
    await copyFile(from, to);
    console.info(`[assets] ${name} 복사 완료`);
  } catch {
    try {
      await access(to);
      console.info(`[assets] 기존 public/assets-img/${name} 사용`);
    } catch {
      console.warn(
        `[assets] ${name} 없음. assets-img에 원본을 넣으면 다음 실행 때 복사됩니다.`
      );
    }
  }
}
