export function initSidebarToggle() {
    const app = document.querySelector('.dashboard-app');
    const btn = document.getElementById('sidebarToggle');

    if (!app || !btn) return;

    btn.addEventListener('click', () => {
        app.classList.toggle('sidebar-collapsed');
        app.classList.remove('sidebar-open');
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

export function initOverlayScrollbars(targetId = 'warningList') {
    const os = window.OverlayScrollbarsGlobal;
    if (!os) return;

    const { OverlayScrollbars } = os;
    const target = document.getElementById(targetId);
    if (!target) return;

    OverlayScrollbars(target, {
        scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 300,
        },
    });
}
