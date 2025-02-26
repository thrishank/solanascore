export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  console.log(body);
  return new Response("OK");
}
