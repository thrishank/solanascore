import { NextResponse } from "next/server";

export async function GET() {
  const options = {
    method: "GET",
    headers: { "X-Dune-Api-Key": "i3Ko8OSHBL1GVVNMT6zv1RBOGUEwf0a0" },
  };

  const res = await fetch(
    "https://api.dune.com/api/echo/beta/transactions/svm/52nCnLjs2ArzLyWDe97F9DgkjUiAUi6mseaLMqbWr1Ng?limit=20000",
    options,
  );
  const data = await res.json();

  return NextResponse.json(data);
}
