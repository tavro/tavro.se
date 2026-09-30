// sizes the bars in the plays per month chart from the numbers next to them,
// so adding a month is just adding a line to the html
document.addEventListener("DOMContentLoaded", () => {
	const rows = [...document.querySelectorAll(".history li")];
	const plays = rows.map(row => parseInt(row.querySelector(".plays").textContent, 10));
	const max = Math.max(...plays);

	rows.forEach((row, i) => {
		row.querySelector(".bar").style.width = `${(plays[i] / max) * 100}%`;
	});
});
