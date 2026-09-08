/**
 * 从 env.local.template 生成 .env.local（已存在则跳过，避免覆盖你的密钥）。
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "env.local.template");
const dest = path.join(root, ".env.local");

if (!fs.existsSync(src)) {
  console.error("Missing env.local.template");
  process.exit(1);
}
if (fs.existsSync(dest)) {
  console.log(".env.local 已存在，未覆盖。若要重来请先删除 .env.local");
  process.exit(0);
}
fs.copyFileSync(src, dest);
console.log("已创建 .env.local（来自 env.local.template）");
console.log("请编辑其中的 OPENAI_* 等变量，然后:");
console.log("  npm run db:migrate   # 首次或 schema 变更后（读 .env.local）");
console.log("  npm run dev          # 启动站点");
