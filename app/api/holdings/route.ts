import { getAddress, isAddress } from "viem";
import { readHoldings } from "@/lib/portfolio/holdings";

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address");
  if (!address || !isAddress(address)) {
    return Response.json({ error: "Address required." }, { status: 400 });
  }
  try {
    const assets = await readHoldings(getAddress(address));
    return Response.json({ address: getAddress(address), assets });
  } catch {
    return Response.json({ error: "Balances could not be read." }, { status: 502 });
  }
}
