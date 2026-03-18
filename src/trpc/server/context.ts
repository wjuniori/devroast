import { headers } from "next/headers";

export async function createTRPCContext() {
  const heads = new Headers(await headers());
  return {
    headers: heads,
  };
}
