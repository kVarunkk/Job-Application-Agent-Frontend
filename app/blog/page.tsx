import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../keystatic.config";

import Link from "next/link";

// 1. Create a reader
const reader = createReader(process.cwd(), keystaticConfig);

export default async function Page() {
  // 2. Read the "Posts" collection
  const posts = await reader.collections.posts.all();
  return (
    <div>
      <div className="mx-auto  mb-12 max-w-3xl px-4 text-center">
        <h1 className="text-5xl font-bold mb-8">Blog</h1>
        <ol className="list-decimal list-inside space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className=" hover:underline">
                {post.entry.title}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
