async function listBlogPosts() {
      const url = "https://api.github.com/repos/tavro/blog-posts/contents/";

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

        fileNames.forEach(({ name, url }) => {
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
          `;
          a.href = "#";

          a.addEventListener("click", async () => {
            const postContent = await fetchMarkdown(url);
            const htmlContent = marked.parse(postContent);
            const contentElement = document.getElementById("post-content");
            contentElement.innerHTML = htmlContent;
          });

          li.appendChild(a);
          ulElement.appendChild(li);
        });
      } catch (error) {
        console.error("Error fetching repo contents:", error);
      }
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
    });
