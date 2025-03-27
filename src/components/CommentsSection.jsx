import Giscus from "@giscus/solid";

export default function CommentsSection() {
  return (
    <Giscus
      id="comments"
      repo="zahrawi-dent/zahrawi-dent.github.io"
      repoId="R_kgDOOPUmpA"
      category="Blog Posts Comments"
      categoryId="DIC_kwDOOPUmpM4Cofw3"
      mapping="url"
      term="Leave a comment!"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="dark_protanopia"
      lang="en"
      loading="lazy"
    />
  );
}
