import { getPostBySlug } from "@/lib/blog-store";
import { notFound } from "next/navigation";
import BlogEditor from "@/app/admin/blog/BlogEditor";

export const dynamic = "force-dynamic";

export default async function RedatorEditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <BlogEditor
      mode="edit"
      slug={post.slug}
      initial={{
        title: post.title,
        description: post.description,
        publishedAt: post.publishedAt,
        status: post.status,
        content: post.content,
      }}
    />
  );
}
