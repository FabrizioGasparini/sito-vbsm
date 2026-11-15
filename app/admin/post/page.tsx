import { pageMetadata } from "@/lib/seo"
import PostGenerator from "./client"

export const metadata = pageMetadata({
  title: "Post partite",
  description: "Generatore dei post con i risultati delle partite.",
  path: "/admin/post",
  noIndex: true,
})

export default function PostGeneratorPage() {
  return <PostGenerator />
}
