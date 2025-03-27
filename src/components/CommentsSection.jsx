import Giscus from "@giscus/solid";

export default function CommentsSection() {
  return (
    <section class="my-12">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-white">Comments</h2>
        <p class="mt-2 text-gray-400">Share your thoughts and join the discussion</p>
      </div>
      <div class="rounded-lg border border-gray-800 bg-gray-900">
        <div class="max-h-[600px] overflow-y-auto">
          <Giscus
            id="comments"
            repo="zahrawi-dent/zahrawi-dent.github.io"
            repoId="R_kgDOOPUmpA"
            category="Blog Posts Comments"
            categoryId="DIC_kwDOOPUmpM4Cofw3"
            mapping="title"
            term="Leave a comment!"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="top"
            lang="en"
            theme="cobalt"
            loading="lazy"
            class="giscus-container"
          />
        </div>
      </div>
    </section>
  );
}
