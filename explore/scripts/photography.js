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
    "using-my-first-film-camera.jpg",
    "artsy-photograph-in-ryd.jpg",
    "beer-yoga-in-skeda-udde.jpg",
    "birdies-exploring.jpg",
    "champaign-tasting.jpg",
    "christmas-in-ryd.jpg",
    "early-interaction-with-boye.jpg",
    "fast-food-comparison.jpg",
    "fika-concert-ostergotland-county.jpg",
    "funky-piano-grooves.jpg",
    "late-night-adventures.jpg",
    "liseberg.jpg",
    "mewing-and-mogging.jpg",
    "moving-from-ryd.jpg",
    "post-birthday-party.jpg",
    "sauna-hotel-gastis-2.jpg",
    "sauna-hotel-gastis.jpg",
    "summer-hangout-in-smaland.jpg",
    "summer-vacation-with-friends.jpg",
    "varldens-bar-norrkoping.jpg",
    "animal-hangout.jpg",
    "beer-yoga-in-skeda-udde-2.jpg",
    "bowling.jpg",
    "dykallan.jpg",
    "film-photography-improvising.jpg",
    "first-night-in-new-apartment.jpg",
    "green-on-green-on-green.jpg",
    "gryt-skargard.jpg",
    "halloween-prep.jpg",
    "kerala-resort-2.jpg",
    "kerala-resort.jpg",
    "reception-period-feelz.jpg",
    "red-room.jpg",
    "studenthuset.jpg",
    "summer-night-agatan.jpg",
    "summer-party.jpg",
    "szimpla-kert-2.jpg",
  ];

  const overlay = document.getElementById("lightbox-overlay");
  const overlayImage = document.getElementById("lightbox-image");
  const overlayCaption = document.getElementById("lightbox-caption");

  images.forEach(filename => {
    const wrapper = document.createElement("div");
    wrapper.className = "album-item";

    const img = document.createElement("img");
    img.src = `./album/thumbs/${filename}`;
    img.loading = "lazy";
    img.alt = "";

    const captionText = filename
      .replace(/\.[^/.]+$/, "")
      .replace(/-/g, " ");

    // the grid shows downscaled thumbnails; the lightbox loads the full-size file
    wrapper.addEventListener("click", () => {
      overlayImage.src = `./album/${filename}`;
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
