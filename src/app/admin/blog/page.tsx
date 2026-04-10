import { readPosts } from "@/lib/blog-store";
import BlogList from "./BlogList";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await readPosts();
  return <BlogList initialPosts={posts} />;
}
