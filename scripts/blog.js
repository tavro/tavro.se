async function listBlogPosts() {
  const url = "https://api.github.com/repos/tavro/tavro.se/contents/blog/posts";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const contents = await response.json();

    const fileNames = contents
      .filter((item) => item.type === "file")
      .map((file) => ({
        name: file.name.replace(/\.md$/, ""),
        url: file.download_url,
      }));

    const ulElement = document.getElementById("blog-posts");
    ulElement.innerHTML = "";

    const params = new URLSearchParams(window.location.search);
    const selectedPost = params.get("post");

    for (const { name, url } of fileNames) {
      const li = document.createElement("li");
      li.style.cssText = `
        font-family: Verdana, Geneva, sans-serif;
        list-style: none;
        color: black;
        border: 2px dotted #555;
        padding: 6px;
        margin-bottom: 4px;
      `;

      const a = document.createElement("a");
      a.textContent = name;
      a.style.cssText = `
        color: #6fcf6f;
        text-decoration: underline;
        font-weight: bold;
        cursor: pointer;
      `;

      a.addEventListener("click", async () => {
        history.pushState(null, "", `?post=${encodeURIComponent(name)}`);
        await loadPost(url);
      });

      li.appendChild(a);
      ulElement.appendChild(li);

      if (selectedPost === name) {
        await loadPost(url);
      }
    }
  } catch (error) {
    console.error("Error fetching repo contents:", error);
  }
}

async function loadPost(url) {
  const postContent = await fetchMarkdown(url);
  const htmlContent = marked.parse(postContent);
  const contentElement = document.getElementById("post-content");
  contentElement.innerHTML = htmlContent;
}

async function fetchMarkdown(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.text();
  } catch (error) {
    console.error("Error fetching markdown content:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  listBlogPosts();

  window.addEventListener("popstate", async () => {
    const params = new URLSearchParams(window.location.search);
    const postName = params.get("post");
    if (!postName) {
      document.getElementById("post-content").innerHTML = "";
      return;
    }

    const ulElement = document.getElementById("blog-posts");
    const link = Array.from(ulElement.querySelectorAll("a")).find(a => a.textContent === postName);
    if (link) link.click();
  });
});

