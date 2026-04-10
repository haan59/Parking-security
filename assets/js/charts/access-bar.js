export function initAccessBarChart(canvasId) {
    const Chart = window.Chart;
    const canvas = document.getElementById(canvasId);
    if (!canvas || !Chart) return;

    const labels = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    const loadingFromIndex = labels.indexOf('15:00');
    const inData = [102, 44, 52, 14, 29, 27, 17, 85, 0, 0, 0, 0, 0, 0, 0];
    const outData = [56, 69, 16, 41, 22, 10, 102, 24, 0, 0, 0, 0, 0, 0, 0];

    const pxPerSlot = 64;
    const desiredWidth = labels.length * pxPerSlot;
    const track = canvas.closest('.access-chart-track');
    if (track) {
        track.style.width = `${desiredWidth}px`;
        track.style.minWidth = `${desiredWidth}px`;
    }

    const scheduleSkeletonRedraw = (chart) => {
        if (chart.$skeletonAnimationFrame) return;

        const minFrameGap = 120;
        const loop = (timestamp) => {
            if (!chart?.ctx) {
                chart.$skeletonAnimationFrame = null;
                return;
            }

            if (document.visibilityState === 'hidden') {
                chart.$skeletonAnimationFrame = requestAnimationFrame(loop);
                return;
            }

            if (!chart.$skeletonLastRedrawAt || timestamp - chart.$skeletonLastRedrawAt >= minFrameGap) {
                chart.$skeletonLastRedrawAt = timestamp;
                chart.$skeletonAnimationFrame = null;
                chart.draw();
                return;
            }

            chart.$skeletonAnimationFrame = requestAnimationFrame(loop);
        };

        chart.$skeletonAnimationFrame = requestAnimationFrame(loop);
    };

    const accessTimeLabelsPlugin = {
        id: 'accessTimeLabels',
        afterDraw(chart) {
            const { ctx, chartArea } = chart;
            const meta = chart.getDatasetMeta(0);
            if (!meta?.data?.length) return;

            ctx.save();
            ctx.font = "400 12px 'Montserrat', 'Be Vietnam Pro', sans-serif";
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            meta.data.forEach((bar, index) => {
                const label = chart.data.labels[index];
                const barWidth = bar.width ?? 0;
                const leftEdgeX = bar.x - barWidth / 2;
                const labelX = Math.max(chartArea.left, leftEdgeX);
                ctx.fillText(String(label), labelX, chartArea.bottom + 8);
            });

            ctx.restore();
        },
    };

    const accessLoadingSkeletonPlugin = {
        id: 'accessLoadingSkeleton',
        afterDatasetsDraw(chart) {
            const { ctx, chartArea } = chart;
            const inMeta = chart.getDatasetMeta(0);
            const outMeta = chart.getDatasetMeta(1);
            const skeletonPairs = [];
            for (let i = loadingFromIndex; i < chart.data.labels.length; i += 1) {
                const inBar = inMeta?.data?.[i];
                const outBar = outMeta?.data?.[i];
                if (inBar && outBar) skeletonPairs.push([inBar, outBar]);
            }
            if (!skeletonPairs.length) return;

            const barHeight = 6;
            const barBaseY = Math.min(...skeletonPairs.map(([inBar, outBar]) => Math.min(inBar.base ?? chartArea.bottom, outBar.base ?? chartArea.bottom)));
            const y = barBaseY - barHeight;
            const shimmerSpan = 26;
            const cycle = 1400;
            const phase = (performance.now() % cycle) / cycle;

            const drawShimmerRect = (x, w) => {
                const left = x - w / 2;
                const shineX = left - shimmerSpan + phase * (w + shimmerSpan * 2);

                const gradient = ctx.createLinearGradient(shineX, y, shineX + shimmerSpan, y);
                gradient.addColorStop(0, '#d7dce3');
                gradient.addColorStop(0.5, '#eef2f7');
                gradient.addColorStop(1, '#d7dce3');

                ctx.fillStyle = '#d7dce3';
                ctx.fillRect(left, y, w, barHeight);
                ctx.fillStyle = gradient;
                ctx.fillRect(left, y, w, barHeight);
            };

            ctx.save();
            skeletonPairs.forEach(([inBar, outBar]) => {
                drawShimmerRect(inBar.x, inBar.width ?? 16);
                drawShimmerRect(outBar.x, outBar.width ?? 16);
            });
            ctx.restore();

            scheduleSkeletonRedraw(chart);
        },
        beforeDestroy(chart) {
            if (chart.$skeletonAnimationFrame) {
                cancelAnimationFrame(chart.$skeletonAnimationFrame);
                chart.$skeletonAnimationFrame = null;
            }

            chart.$skeletonLastRedrawAt = null;
        },
    };

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Vao',
                    data: inData,
                    backgroundColor: '#0f4a86',
                    borderRadius: 0,
                    maxBarThickness: 50,
                    categoryPercentage: 0.84,
                    barPercentage: 0.95,
                },
                {
                    label: 'Ra',
                    data: outData,
                    backgroundColor: '#ff6a00',
                    borderRadius: 0,
                    maxBarThickness: 50,
                    categoryPercentage: 0.84,
                    barPercentage: 0.95,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            events: [],
            layout: {
                padding: {
                    left: 0,
                    right: 8,
                    bottom: 24,
                },
            },
            scales: {
                x: {
                    display: false,
                    offset: true,
                },
                y: {
                    display: false,
                    beginAtZero: true,
                },
            },
            plugins: {
                legend: { display: false },
            },
        },
        plugins: [accessTimeLabelsPlugin, accessLoadingSkeletonPlugin],
    });
}
