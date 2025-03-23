import { MemberListPageClient } from "./MemberListPage.client"

export default async function MemberDetailsPage({ params }:  { params: Promise<{ id: string }> }) {
  const {id} = await params;
  // Pass the `id` to the client component
  return <MemberListPageClient id={id} />
}