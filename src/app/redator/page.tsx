import { readPosts } from "@/lib/blog-store";
import BlogList from "@/app/admin/blog/BlogList";

export const dynamic = "force-dynamic";

export default async function RedatorHomePage() {
  const posts = await readPosts();
  return <BlogList initialPosts={posts} />;
}
