export function initSidebarToggle() {
    const app = document.querySelector('.dashboard-app');
    const btn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (!app || !btn || !sidebar) return;

    let isAnimating = false;

    btn.addEventListener('click', () => {
        if (isAnimating) return;

        const gsap = window.gsap;
        const startWidth = sidebar.getBoundingClientRect().width;

        app.classList.toggle('sidebar-collapsed');
        app.classList.remove('sidebar-open');

        // Fallback to instant toggle if GSAP is unavailable.
        if (!gsap) return;

        const endWidth = sidebar.getBoundingClientRect().width;
        if (!Number.isFinite(startWidth) || !Number.isFinite(endWidth) || Math.abs(startWidth - endWidth) < 0.5) return;

        isAnimating = true;
        gsap.killTweensOf(sidebar);
        gsap.fromTo(
            sidebar,
            { width: startWidth },
            {
                width: endWidth,
                duration: 0.24,
                ease: 'power2.out',
                clearProps: 'width',
                onComplete: () => {
                    isAnimating = false;
                },
                onInterrupt: () => {
                    isAnimating = false;
                },
            },
        );
    });
}

export function initClockAndDate() {
    const clockEl = document.getElementById('clockNow');
    const dateEl = document.getElementById('dateNow');
    if (!clockEl || !dateEl) return;

    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    const render = () => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${hh}:${mm}:${ss}`;

        const day = dayNames[now.getDay()];
        dateEl.textContent = `${day}, ${now.getDate()} tháng ${now.getMonth() + 1}, ${now.getFullYear()}`;
    };

    render();
    setInterval(render, 1000);
}

export function initOverlayScrollbars(targetId = 'warningList', options = {}) {
    const os = window.OverlayScrollbarsGlobal;
    if (!os) return null;

    const { OverlayScrollbars } = os;
    const target = document.getElementById(targetId);
    if (!target) return null;

    const baseOptions = {
        scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 300,
        },
    };

    return OverlayScrollbars(target, {
        ...baseOptions,
        ...options,
        scrollbars: {
            ...baseOptions.scrollbars,
            ...(options.scrollbars || {}),
        },
    });
}

export function initHorizontalDragScroll(targetId = 'accessChartScroll', osInstance = null) {
    const host = document.getElementById(targetId);
    if (!host || host.dataset.dragScrollBound === '1') return;

    let viewport = host;
    if (osInstance?.elements) {
        const osViewport = osInstance.elements().viewport;
        if (osViewport) viewport = osViewport;
    }

    const canScrollHorizontally = () => viewport.scrollWidth > viewport.clientWidth + 1;

    let isDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;

    const startDrag = (event) => {
        if (event.button !== 0 || !canScrollHorizontally()) return;

        isDragging = true;
        dragStartX = event.clientX;
        dragStartScrollLeft = viewport.scrollLeft;
        host.classList.add('is-dragging');
        event.preventDefault();
    };

    const dragMove = (event) => {
        if (!isDragging) return;
        const deltaX = event.clientX - dragStartX;
        viewport.scrollLeft = dragStartScrollLeft - deltaX;
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        host.classList.remove('is-dragging');
    };

    const onWheel = (event) => {
        if (!canScrollHorizontally()) return;

        const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (dominantDelta === 0) return;

        viewport.scrollLeft += dominantDelta;
        event.preventDefault();
    };

    host.addEventListener('mousedown', startDrag);
    host.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', endDrag);
    host.addEventListener('mouseleave', endDrag);

    host.dataset.dragScrollBound = '1';
}
