import { readPosts } from "@/lib/blog-store";
import BlogShell from "./BlogShell";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await readPosts();
  return <BlogShell initialPosts={posts} />;
}
