import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import * as readline from "readline";
import { dbConnect } from "../lib/db";
import User from "../models/User";
import { hashPassword } from "../lib/auth";

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const q = (s: string) => new Promise<string>((res) => rl.question(s, res));
  const username = (await q("Admin username: ")).trim();
  const password = (await q("Admin password (min 6): ")).trim();
  rl.close();
  if (!username || password.length < 6) { console.error("Invalid input"); process.exit(1); }
  await dbConnect();
  const exists = await User.findOne({ username });
  if (exists) { console.error("User already exists"); process.exit(1); }
  await User.create({ username, passwordHash: await hashPassword(password), role: "ADMIN", active: true });
  console.log(`Admin ${username} created`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
