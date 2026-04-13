const functionItems = [
    { key: 'dashboard', icon: 'ri:dashboard-fill', label: 'Bảng điều khiển', href: 'index.html' },
    { key: 'alert', icon: 'ant-design:alert-outlined', label: 'Cảnh báo', href: 'Alert.html' },
    { key: 'camera', icon: 'mingcute:live-line', label: 'Xem trực tiếp', href: 'Camera.html' },
    { key: 'vehicle', icon: 'tabler:car', label: 'Phương tiện', href: 'Vehicle.html' },
    { key: 'report', icon: 'gridicons:stats-up-alt', label: 'Thống kê & Báo cáo', href: 'Report.html' },
];

const manageItems = [
    { key: 'manage-area', icon: 'gridicons:stats-up-alt', label: 'Quản lý khu vực', href: '#' },
    { key: 'manage-camera', icon: 'lucide:cctv', label: 'Quản lý Cameras', href: '#' },
    { key: 'manage-task', icon: 'mingcute:task-2-line', label: 'Nhiệm vụ Camera', href: '#' },
    { key: 'manage-object', icon: 'ix:user-profile', label: 'Đối tượng', href: '#' },
    { key: 'manage-setting', icon: 'uil:setting', label: 'Cấu hình khác', href: '#' },
];

export function renderSidebar(activeKey) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const functionHtml = functionItems
        .map((item) => {
            const activeClass = item.key === activeKey ? 'active' : '';
            const alertBadgeHtml = item.key === 'alert' ? '<span class="nav-alert-badge" aria-label="23 cảnh báo mới">23</span>' : '';
            const liveDotHtml = item.key === 'camera' ? '<span class="nav-live-dot" aria-hidden="true"></span>' : '';
            return `
                <li class="nav-item">
                    <a class="nav-link ${activeClass}" href="${item.href}">
                        <iconify-icon icon="${item.icon}"></iconify-icon>
                        <span class="nav-label">${item.label}</span>
                        ${liveDotHtml}
                        ${alertBadgeHtml}
                    </a>
                </li>
            `;
        })
        .join('');

    const manageHtml = manageItems
        .map((item) => {
            const activeClass = item.key === activeKey ? 'active' : '';
            return `
                <li class="nav-item">
                    <a class="nav-link ${activeClass}" href="${item.href}">
                        <iconify-icon icon="${item.icon}"></iconify-icon>
                        <span class="nav-label">${item.label}</span>
                    </a>
                </li>
            `;
        })
        .join('');

    sidebar.innerHTML = `
        <div class="brand-box d-flex align-items-center">
            <button class="btn btn-light-subtle sidebar-toggle" id="sidebarToggle" type="button">
                <iconify-icon icon="ci:menu-alt-02"></iconify-icon>
            </button>
            <div class="brand-text">
                <p class="mb-0 small text-uppercase">HỆ THỐNG GIÁM SÁT</p>
                <h1 class="h6 mb-0">AN NINH BÃI XE</h1>
            </div>
        </div>

        <hr />

        <div class="sidebar-section mt-3">
            <p class="sidebar-title">Chức năng</p>
            <ul class="nav nav-pills flex-column gap-1">${functionHtml}</ul>
        </div>

        <div class="sidebar-section mt-3">
            <p class="sidebar-title">Quản lý</p>
            <ul class="nav nav-pills flex-column gap-1">${manageHtml}</ul>
        </div>
    `;
}
