import { readPosts } from "@/lib/blog-store";
import BlogShell from "@/app/admin/blog/BlogShell";

export const dynamic = "force-dynamic";

export default async function RedatorHomePage() {
  const posts = await readPosts();
  return <BlogShell initialPosts={posts} />;
}
