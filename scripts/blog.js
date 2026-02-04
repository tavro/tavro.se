async function listBlogPosts() {
  const apiUrl =
    "https://api.github.com/repos/tavro/tavro.se/contents/blog/posts";

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const contents = await response.json();

    const posts = contents
      .filter(item => item.type === "file" && item.name.endsWith(".md"))
      .map(file => ({
        name: file.name.replace(/\.md$/, ""),
        rawUrl: file.download_url
      }));

    const ul = document.getElementById("blog-posts");
    ul.innerHTML = "";

    for (const post of posts) {
      const li = document.createElement("li");
      li.style.cssText = `
        font-family: Verdana, Geneva, sans-serif;
        list-style: none;
        border: 2px dotted #555;
        padding: 6px;
        margin-bottom: 4px;
      `;

      const a = document.createElement("a");
      a.textContent = post.name;
      a.href = `?post=${encodeURIComponent(post.name)}`;
      a.style.cssText = `
        color: #6fcf6f;
        text-decoration: underline;
        font-weight: bold;
        cursor: pointer;
      `;

      a.addEventListener("click", async (e) => {
        e.preventDefault();
        history.pushState(null, "", a.href);
        await loadPost(post.rawUrl);
      });

      li.appendChild(a);
      ul.appendChild(li);
    }

    loadPostFromURL(posts);

  } catch (error) {
    console.error("Error fetching blog posts:", error);
  }
}

async function loadPostFromURL(posts) {
  const params = new URLSearchParams(window.location.search);
  const postName = params.get("post");

  if (!postName) {
    document.getElementById("post-content").innerHTML = "";
    return;
  }

  const post = posts.find(p => p.name === postName);
  if (post) {
    await loadPost(post.rawUrl);
  }
}

async function loadPost(url) {
  const markdown = await fetchMarkdown(url);
  if (!markdown) return;

  const html = marked.parse(markdown);
  document.getElementById("post-content").innerHTML = html;
}

async function fetchMarkdown(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error("Error fetching markdown:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  listBlogPosts();

  window.addEventListener("popstate", () => {
    listBlogPosts();
  });
});

