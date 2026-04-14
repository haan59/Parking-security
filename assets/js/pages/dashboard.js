import { initParkingStatus } from '../charts/parking-status.js';
import { initAccessBarChart } from '../charts/access-bar.js';
import { renderSidebar } from '../../includes/site-sidebar.js';
import { renderTopbar } from '../../includes/site-header.js';
import { initSidebarToggle, initClockAndDate, initOverlayScrollbars, initHorizontalDragScroll } from '../../includes/ui-common.js';

const ACCESS_VARIANTS = {
    oto: {
        labels: ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
        inData: [102, 44, 52, 14, 29, 27, 17, 85, null, null, null, null, null, null, null],
        outData: [56, 69, 16, 41, 22, 10, 102, 24, null, null, null, null, null, null, null],
        legendIn: 443,
        legendOut: 234,
    },
    xemay: {
        labels: ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
        inData: [32, 49, 27, 18, 24, 19, 31, 42, 12, 9, 6, 4, 3, 2, 1],
        outData: [21, 35, 16, 12, 15, 13, 22, 28, 8, 6, 4, 3, 2, 1, 1],
        legendIn: 186,
        legendOut: 130,
    },
};

const VEHICLE_FLOW_VARIANTS = {
    vao: [
        { label: 'Xe Container / Tải', value: 23 },
        { label: 'Ô tô con', value: 435 },
        { label: 'Xe máy', value: 33 },
        { label: 'Không xác định', value: 23 },
    ],
    ra: [
        { label: 'Xe Container / Tải', value: 19 },
        { label: 'Ô tô con', value: 402 },
        { label: 'Xe máy', value: 52 },
        { label: 'Không xác định', value: 18 },
    ],
};

function initToggleButtonGroup(groupSelector, buttonSelector, activeClass = 'is-active', onChange) {
    const group = document.querySelector(groupSelector);
    if (!group) return;

    const buttons = Array.from(group.querySelectorAll(buttonSelector));
    if (!buttons.length) return;

    const setActiveButton = (activeButton) => {
        buttons.forEach((button) => {
            const isActive = button === activeButton;
            button.classList.toggle(activeClass, isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    };

    const initiallyActiveButton = buttons.find((button) => button.classList.contains(activeClass)) ?? buttons[0];
    setActiveButton(initiallyActiveButton);
    if (typeof onChange === 'function') {
        onChange(initiallyActiveButton, buttons.indexOf(initiallyActiveButton));
    }

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            setActiveButton(button);
            if (typeof onChange === 'function') {
                onChange(button, buttons.indexOf(button));
            }
        });
    });
}

function initWarningHotBadge() {
    const Chart = window.Chart;
    const warningFoot = document.querySelector('.warning-foot');
    if (!warningFoot) return;

    const badgeCanvas = warningFoot.querySelector('#warningHotDonut');
    const hotCountElement = warningFoot.querySelector('.warning-foot-left strong');
    const totalCountElement = warningFoot.querySelector('.warning-foot-right strong');
    if (!Chart || !badgeCanvas || !hotCountElement || !totalCountElement) return;

    const hotCount = Number.parseInt(hotCountElement.textContent, 10);
    const totalCount = Number.parseInt(totalCountElement.textContent, 10);
    if (!Number.isFinite(hotCount) || !Number.isFinite(totalCount) || totalCount <= 0) return;

    const percent = Math.max(0, Math.min(100, (hotCount / totalCount) * 100));

    new Chart(badgeCanvas, {
        type: 'doughnut',
        data: {
            datasets: [
                {
                    data: [percent, 100 - percent],
                    backgroundColor: ['#ff7a00', '#e6c8ba'],
                    borderWidth: 0,
                    cutout: '82%',
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -0.5 * Math.PI,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
        },
    });
}

function initWarningListViewport(visibleItems = 2.75) {
    const warningList = document.getElementById('warningList');
    if (!warningList) return;

    const updateMaxHeight = () => {
        const firstItem = warningList.querySelector('.warning-item');
        if (!firstItem) return;

        const itemHeight = firstItem.getBoundingClientRect().height;
        if (!itemHeight) return;

        const styles = window.getComputedStyle(warningList);
        const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
        const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
        const targetHeight = paddingTop + paddingBottom + itemHeight * visibleItems;
        warningList.style.setProperty('--warning-list-max-height', `${targetHeight / 16}rem`);
    };

    updateMaxHeight();
    window.addEventListener('resize', updateMaxHeight);

    const firstImage = warningList.querySelector('img');
    if (firstImage && !firstImage.complete) {
        firstImage.addEventListener('load', updateMaxHeight, { once: true });
    }
}

function initWarningListLazyLoad() {
    const warningList = document.getElementById('warningList');
    if (!warningList) return;

    const items = warningList.querySelectorAll('.warning-item');
    if (items.length === 0) return;

    const hasText = (element) => Boolean(element && element.textContent && element.textContent.trim().length > 0);

    const hasUsableImage = (img) => {
        if (!img) return false;
        const src = img.getAttribute('src');
        return Boolean(src && src.trim().length > 0);
    };

    const getDirectChildImage = (item) => {
        const children = Array.from(item.children);
        return children.find((child) => child.tagName === 'IMG') ?? null;
    };

    const getOrCreateThumb = (item) => {
        const existingThumb = item.querySelector('.warning-thumb');
        if (existingThumb) return existingThumb;

        const directImage = getDirectChildImage(item);
        const thumb = document.createElement('div');
        thumb.className = 'warning-thumb';
        item.insertBefore(thumb, item.firstChild);

        if (directImage) {
            thumb.appendChild(directImage);
        }

        return thumb;
    };

    const getOrCreateContent = (item) => {
        const children = Array.from(item.children);
        const existingContent = children.find((child) => child.tagName === 'DIV' && !child.classList.contains('warning-thumb'));
        if (existingContent) return existingContent;

        const content = document.createElement('div');
        item.appendChild(content);
        return content;
    };

    const ensureField = (container, selector, create) => {
        let field = container.querySelector(selector);
        if (!field) {
            field = create();
            container.appendChild(field);
        }
        return field;
    };

    const updateWarningItemSkeletonState = (item) => {
        const thumb = getOrCreateThumb(item);
        const content = getOrCreateContent(item);

        const timeEl = ensureField(content, 'small', () => document.createElement('small'));
        const titleEl = ensureField(content, 'p', () => {
            const p = document.createElement('p');
            p.className = 'mb-1';
            return p;
        });
        const placeEl = ensureField(content, '.warning-place', () => {
            const span = document.createElement('span');
            span.className = 'warning-place';
            return span;
        });

        const img = thumb?.querySelector('img') ?? null;
        const imageMissing = !hasUsableImage(img);
        const timeMissing = !hasText(timeEl);
        const titleMissing = !hasText(titleEl);
        const placeMissing = !hasText(placeEl);

        // Áp dụng skeleton class cho các field rỗng
        timeEl.classList.toggle('is-skeleton', timeMissing);
        titleEl.classList.toggle('is-skeleton', titleMissing);
        placeEl.classList.toggle('is-skeleton', placeMissing);

        // Ảnh rỗng → shimmer thumb
        if (thumb) {
            thumb.classList.toggle('is-skeleton', imageMissing);
        }

        if (img) {
            img.classList.toggle('is-skeleton-hidden', imageMissing);
        }

        // Ẩn icon nếu place rỗng
        const placeIcon = placeEl.querySelector('.warning-place-icon');
        if (placeMissing && placeIcon) {
            placeIcon.style.visibility = 'hidden';
        } else if (placeIcon) {
            placeIcon.style.visibility = 'visible';
        }

        if (img) {
            img.classList.toggle('is-skeleton-hidden', imageMissing);
        }
    };

    if (!('IntersectionObserver' in window)) {
        items.forEach((item) => {
            updateWarningItemSkeletonState(item);

            const thumb = item.querySelector('.warning-thumb');
            const img = thumb?.querySelector('img') ?? null;
            if (!img || !hasUsableImage(img)) return;

            thumb.classList.remove('loading');
            img.classList.remove('loading');
        });
        return;
    }

    // Create intersection observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 1) {
                    const item = entry.target;
                    updateWarningItemSkeletonState(item);
                    const thumb = item.querySelector('.warning-thumb');
                    const img = thumb?.querySelector('img') ?? null;
                    if (!img || !hasUsableImage(img)) {
                        observer.unobserve(item);
                        return;
                    }

                    // Reveal only when the warning item is fully visible.
                    if (thumb) thumb.classList.remove('loading');
                    img.classList.remove('loading');
                    observer.unobserve(item);
                }
            });
        },
        {
            root: warningList,
            rootMargin: '0px',
            threshold: 1,
        },
    );

    // Mark all images as loading initially
    items.forEach((item) => {
        updateWarningItemSkeletonState(item);

        const thumb = item.querySelector('.warning-thumb');
        const img = thumb?.querySelector('img') ?? null;

        if (!img || !hasUsableImage(img)) {
            if (thumb) thumb.classList.remove('loading');
            return;
        }

        if (thumb) thumb.classList.add('loading');
        img.classList.add('loading');

        observer.observe(item);
    });
}

function initVehicleFlowBars() {
    const card = document.querySelector('.vehicle-flow-card');
    if (!card) return;

    const list = card.querySelector('.vehicle-flow-list');
    if (!list) return;

    const parseValue = (text) => {
        const numeric = Number.parseFloat(String(text).replace(/[^\d.-]/g, ''));
        return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
    };

    const valueElements = Array.from(list.querySelectorAll('.vehicle-flow-value'));
    const labelElements = Array.from(list.querySelectorAll('.vehicle-flow-label'));

    const animateFill = (fill, percent) => {
        fill.style.width = '0%';
        fill.getBoundingClientRect();
        requestAnimationFrame(() => {
            fill.style.width = `${percent}%`;
        });
    };

    const renderBars = () => {
        const items = Array.from(list.querySelectorAll('.vehicle-flow-item'));
        if (!items.length) return;

        items.forEach((item) => {
            const fill = item.querySelector('.vehicle-flow-fill');
            if (!fill) return;

            const valueEl = item.querySelector('.vehicle-flow-value');
            const value = parseValue(valueEl?.textContent ?? '0');

            if (value <= 0) {
                fill.style.width = '0%';
                return;
            }

            const percent = Math.min(100, value);
            animateFill(fill, percent);
        });
    };

    const updateData = (nextItems) => {
        if (!Array.isArray(nextItems) || !nextItems.length) return;

        nextItems.forEach((item, index) => {
            if (labelElements[index] && typeof item.label === 'string') {
                labelElements[index].textContent = item.label;
            }

            if (valueElements[index] && Number.isFinite(item.value)) {
                valueElements[index].textContent = String(item.value);
            }
        });

        renderBars();
    };

    renderBars();

    if ('MutationObserver' in window) {
        const observer = new MutationObserver(renderBars);
        observer.observe(list, {
            childList: true,
            characterData: true,
            subtree: true,
        });
    }

    return {
        updateData,
    };
}

window.addEventListener('DOMContentLoaded', () => {
    renderSidebar('dashboard');
    renderTopbar('Bảng điều khiển');

    // Keep topbar clock/date alive even when other widget initializers fail.
    initClockAndDate();

    const safeInit = (initializer) => {
        try {
            return initializer();
        } catch (error) {
            // Continue initializing remaining widgets.
            console.error(error);
            return null;
        }
    };

    safeInit(() => initParkingStatus('parkingStatus'));
    const accessChartController = safeInit(() => initAccessBarChart('accessBarChart', ACCESS_VARIANTS.oto));
    safeInit(initWarningHotBadge);
    const vehicleFlowController = safeInit(initVehicleFlowBars);
    safeInit(initWarningListViewport);
    safeInit(initWarningListLazyLoad);
    const accessLegendIn = document.querySelector('.access-legend .legend-item-in .legend-value');
    const accessLegendOut = document.querySelector('.access-legend .legend-item-out .legend-value');

    safeInit(() =>
        initToggleButtonGroup('.access-filter-toggle', '.access-filter-btn', 'is-active', (_, index) => {
            const variantKey = index === 1 ? 'xemay' : 'oto';
            const variant = ACCESS_VARIANTS[variantKey];

            accessChartController?.updateData(variant);

            if (accessLegendIn) {
                accessLegendIn.textContent = String(variant.legendIn);
            }

            if (accessLegendOut) {
                accessLegendOut.textContent = String(variant.legendOut);
            }
        }),
    );

    safeInit(() =>
        initToggleButtonGroup('.vehicle-flow-toggle', '.vehicle-flow-tab', 'is-active', (_, index) => {
            const variantKey = index === 1 ? 'ra' : 'vao';
            vehicleFlowController?.updateData(VEHICLE_FLOW_VARIANTS[variantKey]);
        }),
    );

    safeInit(() => initOverlayScrollbars('warningList'));
    const accessScrollbar = safeInit(() =>
        initOverlayScrollbars('accessChartScroll', {
            overflow: {
                x: 'scroll',
                y: 'hidden',
            },
            scrollbars: {
                autoHide: 'leave',
                autoHideDelay: 300,
                dragScroll: true,
                clickScroll: true,
            },
        }),
    );
    safeInit(() => initHorizontalDragScroll('accessChartScroll', accessScrollbar));
    safeInit(initSidebarToggle);
});
