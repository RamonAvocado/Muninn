// Creates a verified test user in the auth store (the `kv` table), so dev can sign in
// without the emailed code. Usage: bun run db:seed-user [email] [password]
import { createAdapter, kvStore } from "@mimird/auth/store-adapter";
import { kvDel, kvGet, kvSet } from "../db";

const [email = "test@muninn.dev", password = "muninn123"] = process.argv.slice(2);

const store = kvStore({ get: kvGet, set: kvSet, del: kvDel });
const { auth } = createAdapter(store, { sendEmail: async () => {} });

const existing = await store.findByEmail(email);
if (!existing) {
  const res = await auth.signup({ email, password, name: "Test User", termsVersion: "1" });
  if ("error" in res) throw new Error(res.error);
}
const user = (await store.findByEmail(email))!;
await store.save({ ...user, emailVerified: true });
await store.takeCode(`verify:${email}`); // the unused sign-up code

if ("error" in (await auth.login({ email, password }))) throw new Error(`${email} exists with a different password`);

console.log(existing ? `${email} already exists (marked verified)` : `Created ${email} / ${password}`);
