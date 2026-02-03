function constructArchiveList() {
	const list = document.getElementById("archive-list");

	const MANIFEST_URL = "https://raw.githubusercontent.com/tavro/tavro.se/main/now/archive/manifest.json";
	fetch(MANIFEST_URL)
    		.then(res => res.text())
    		.then(text => JSON.parse(text))
    		.then(entries => {
      			entries.forEach(entry => {
        			const li = document.createElement("li");
        			const a = document.createElement("a");

       				a.href = `archive/${entry.year}/${entry.month}/index.html`;
        			a.textContent = entry.date;

        			li.appendChild(a);
        			list.appendChild(li);
      			});
    		})
    		.catch(err => {
      			console.error("Failed to load archive manifest:", err);
    		});
}

document.addEventListener("DOMContentLoaded", () => {
	document
	.getElementById("archive-toggle")
	.addEventListener("click", function () {
		const list = document.getElementById("archive-list");
		const isVisible = list.style.display === "block";
		list.style.display = isVisible ? "none" : "block";
        
		this.textContent = isVisible
		? "‣ see what i have been up to previously"
		: "▾ see what i have been up to previously";
	});
    
	constructArchiveList();
    
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
