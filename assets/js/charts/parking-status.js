function getParkingPercent(rawValue) {
	if (!Number.isFinite(rawValue)) return 76;
	if (rawValue <= 1) return Math.max(0, Math.min(100, rawValue * 100));
	if (rawValue <= 5) return Math.max(0, Math.min(100, (rawValue / 5) * 100));
	return Math.max(0, Math.min(100, rawValue));
}

function drawDotMatrix(canvas, percent) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const dpr = window.devicePixelRatio || 1;
	const cssWidth = Math.max(112, Math.floor(canvas.clientWidth || 130));
	const cssHeight = Math.max(64, Math.floor(canvas.clientHeight || 74));

	canvas.width = Math.floor(cssWidth * dpr);
	canvas.height = Math.floor(cssHeight * dpr);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, cssWidth, cssHeight);

	const rows = 4;
	const cols = 8;
	const totalDots = rows * cols;
	const activeDots = Math.round((percent / 100) * totalDots);

	const matrixWidth = Math.min(Math.max(112, cssWidth - 4), 156);
	const matrixHeight = Math.min(cssHeight, 70);

	const preferredGapX = 2.2;
	const preferredGapY = 2.2;
	const maxRadiusByWidth = (matrixWidth - preferredGapX * (cols - 1)) / (2 * cols);
	const maxRadiusByHeight = (matrixHeight - preferredGapY * (rows - 1)) / (2 * rows);
	const radius = Math.max(4.3, Math.min(5.5, maxRadiusByWidth, maxRadiusByHeight));

	const dotSize = radius * 2;
	const gapX = Math.max(1.8, (matrixWidth - dotSize * cols) / (cols - 1));
	const gapY = Math.max(2.2, (matrixHeight - dotSize * rows) / rows);
	const gridWidth = dotSize * cols + gapX * (cols - 1);
	const gridHeight = dotSize * rows + gapY * (rows - 1);
	const offsetY = (cssHeight - matrixHeight) / 2;
	const startX = Math.max(4, Math.round((cssWidth - gridWidth) / 2)) + radius;
	const startY = offsetY + (matrixHeight - gridHeight) / 2 + radius;

	for (let col = 0; col < cols; col += 1) {
		for (let row = 0; row < rows; row += 1) {
			const index = col * rows + row;
			const x = startX + col * (dotSize + gapX);
			const y = startY + row * (dotSize + gapY);

			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fillStyle = index < activeDots ? '#0f4a86' : '#d0d4db';
			ctx.fill();
		}
	}
}

export function initParkingStatus(canvasId) {
	const canvas = document.getElementById(canvasId);
	if (!canvas) return;

	const valueElement = document.getElementById(`${canvasId}Value`);

	const render = () => {
		const parsedValue = valueElement ? Number.parseFloat(valueElement.textContent) : Number.NaN;
		const percent = getParkingPercent(parsedValue);
		drawDotMatrix(canvas, percent);
	};

	render();
	window.addEventListener('resize', render);

	if (valueElement && 'MutationObserver' in window) {
		const observer = new MutationObserver(render);
		observer.observe(valueElement, {
			childList: true,
			characterData: true,
			subtree: true,
		});
	}
}
