import { sendMarketAction } from "@/lib/protocol/chain";

export async function POST(request: Request) {
  const body = (await request.json()) as { side?: string; symbol?: string; amount?: string };
  if (body.side !== "supply" && body.side !== "borrow") {
    return Response.json({ error: "Unsupported action." }, { status: 400 });
  }
  if (!body.symbol || !body.amount) {
    return Response.json({ error: "Missing market or amount." }, { status: 400 });
  }
  try {
    const hash = await sendMarketAction(body.side, body.symbol.toUpperCase(), body.amount);
    return Response.json({ hash });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transaction failed.";
    const cleaned = message.startsWith("The ") || message.startsWith("Not enough") || message.startsWith("Enter")
      ? message
      : message.includes("Unhealthy")
        ? "That size breaks the position."
        : message.includes("Insufficient")
          ? "Not enough liquidity in this market."
          : "Transaction failed.";
    return Response.json({ error: cleaned }, { status: 400 });
  }
}
