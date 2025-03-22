import { MemberDetailsPageClient } from "./layout.client"

export default async function MemberDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Destructure id from params
  // Pass the `id` to the client component
  return <MemberDetailsPageClient id={id} />
}