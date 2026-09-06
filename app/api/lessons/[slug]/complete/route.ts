export async function POST() {
  return Response.json({ error: "Lessons are no longer available. Explore the recipe collection instead." }, { status: 410 });
}
