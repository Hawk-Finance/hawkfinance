import { readProtocol } from "@/lib/protocol/chain";

export async function GET() {
  const state = await readProtocol();
  if (!state) return Response.json({ live: false });
  return Response.json({ live: true, markets: state.markets, account: state.account });
}
