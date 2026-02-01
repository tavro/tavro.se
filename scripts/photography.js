document.addEventListener("DOMContentLoaded", () => {
  const album = document.getElementById("album");

  const images = [
    "adventure-in-visby.jpg",
    "after-a-lecture-in-norrkoping.jpg",
    "august-stringberg-museum.jpg",
    "bicycle-vacation-through-sweden.jpg",
    "budapest-observation-tower.jpg",
    "building-at-gotland.jpg",
    "camping-close-to-visingso.jpg",
    "celebrating-midsummer-in-gryt.jpg",
    "curly-hair.jpg",
    "feeding-my-bird.jpg",
    "feeding-the-hungry-animals.jpg",
    "from-liseberg.jpg",
    "hiking-in-ekero.jpg",
    "kayak-ride-in-gryt.jpg",
    "outside-my-first-non-student-apartment.jpg",
    "random-door-in-india.jpg",
    "snowy-university-campus.jpg",
    "szimpla-kert-in-budapest.jpg",
    "trying-whiskey-in-edinburgh.jpg",
    "using-my-first-film-camera.jpg"
  ];

  const overlay = document.getElementById("lightbox-overlay");
  const overlayImage = document.getElementById("lightbox-image");
  const overlayCaption = document.getElementById("lightbox-caption");

  images.forEach(filename => {
    const wrapper = document.createElement("div");
    wrapper.className = "album-item";

    const img = document.createElement("img");
    img.src = `./album/${filename}`;
    img.loading = "lazy";
    img.alt = "";

    const captionText = filename
      .replace(/\.[^/.]+$/, "")
      .replace(/-/g, " ");

    wrapper.addEventListener("click", () => {
      overlayImage.src = img.src;
      overlayCaption.textContent = captionText;
      overlay.style.display = "flex";
    });

    wrapper.appendChild(img);
    album.appendChild(wrapper);
  });

  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      overlay.style.display = "none";
      overlayImage.src = "";
      overlayCaption.textContent = "";
    }
  });
});
