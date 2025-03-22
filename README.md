category: "Endodontics". Zod type enum
tags: ['shaping',]
- has special css for category, tags
---
- a color for each category
- in the tags index, collect the tags for each category
- rename pubDate to firstCreated?, add lastUpdated
- typography
- put categories in footer
- add ReadMore to ArticleCard
- make posts grid a component
- a page to show all categories?
- better search
- save bookmarked to cookies?
- fix pagination
-  a component for the previousLabel and nextLabel, frontmatter in each blog? like related posts to see the previous and next lessons?
- change dropdown menu style if active
---
    <main class="p-6 lg:ml-64">
      <div class="container mx-auto">
        <h1 class="mb-6 text-3xl font-bold text-gray-900">Dashboard</h1>
        <slot />
        <Footer />
      </div>
    </main>
    </SidebarReact>

            <div class="prose prose-invert max-w-none">
              <p>
                Welcome to the Starlight documentation. This guide will help you
                get started with building your documentation site using Astro
                and Starlight.
              </p>

              <h2>Quick Start</h2>
              <p>
                To create a new Starlight site, run the following command in
                your terminal:
              </p>

              <pre><code>npm create astro@latest -- --template starlight</code></pre>

              <p>
                This will create a new project directory with all the necessary
                files and configurations for your Starlight site.
              </p>

              <h2>Project Structure</h2>
              <p>A typical Starlight project structure looks like this:</p>

              <pre><code>
├── astro.config.mjs
├── package.json
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   ├── docs/
│   │   └── config.ts
│   └── pages/
└── tsconfig.json</code></pre>
            </div>
