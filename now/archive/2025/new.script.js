document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".gallery-slide");
    let index = 0;
    
    function showSlide(i) {
        slides.forEach((slide, idx) => {
            slide.classList.toggle("active", idx === i);
        });
        index = i;
    }
    
    document.querySelector(".prev").addEventListener("click", () => {
        showSlide((index - 1 + slides.length) % slides.length);
    });
    
    document.querySelector(".next").addEventListener("click", () => {
        showSlide((index + 1) % slides.length);
    });
});
