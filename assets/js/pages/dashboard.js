import { initSafetyGauge } from '../charts/safety-gauge.js';
import { initAccessBarChart } from '../charts/access-bar.js';
import { renderSidebar } from '../../includes/site-sidebar.js';
import { renderTopbar } from '../../includes/site-header.js';
import { initSidebarToggle, initClockAndDate, initOverlayScrollbars, initHorizontalDragScroll } from '../../includes/ui-common.js';

function initSimpleDonut(canvasId, percentage, color) {
    const Chart = window.Chart;
    const canvas = document.getElementById(canvasId);
    if (!canvas || !Chart) return;

    const textElement = document.getElementById(`${canvasId}Text`);
    const parsedHtmlPercent = textElement ? Number.parseInt(textElement.textContent, 10) : NaN;
    const finalPercentage = Number.isFinite(parsedHtmlPercent) ? Math.max(0, Math.min(100, parsedHtmlPercent)) : Math.max(0, Math.min(100, percentage));

    if (textElement) {
        textElement.textContent = `${finalPercentage}%`;
    }

    new Chart(canvas, {
        type: 'doughnut',
        data: {
            datasets: [
                {
                    data: [finalPercentage, 100 - finalPercentage],
                    backgroundColor: [color, '#e5e7eb'],
                    borderWidth: 0,
                    cutout: '86%',
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
        },
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
        warningList.style.setProperty('--warning-list-max-height', `${targetHeight}px`);
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
        if (!directImage) return null;

        const thumb = document.createElement('div');
        thumb.className = 'warning-thumb';
        item.insertBefore(thumb, directImage);
        thumb.appendChild(directImage);
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

        timeEl.classList.toggle('is-skeleton', timeMissing);
        titleEl.classList.toggle('is-skeleton', titleMissing);
        placeEl.classList.toggle('is-skeleton', placeMissing);

        if (thumb) {
            thumb.classList.toggle('is-skeleton', imageMissing);
        }

        if (img) {
            img.classList.toggle('is-skeleton-hidden', imageMissing);
        }

        if (placeMissing) {
            const placeIcon = placeEl.querySelector('.warning-place-icon');
            if (placeIcon) placeIcon.style.visibility = 'hidden';
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

window.addEventListener('DOMContentLoaded', () => {
    renderSidebar('dashboard');
    renderTopbar('Bảng điều khiển');

    initSafetyGauge('safetyGauge');
    initAccessBarChart('accessBarChart');
    initSimpleDonut('uniformDonut', 93, '#6bc24a');
    initSimpleDonut('helmetDonut', 63, '#f58f1b');
    initSimpleDonut('maskDonut', 25, '#5f4b8b');
    initWarningHotBadge();
    initWarningListViewport();
    initWarningListLazyLoad();

    initOverlayScrollbars('warningList');
    const accessScrollbar = initOverlayScrollbars('accessChartScroll', {
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
    });
    initHorizontalDragScroll('accessChartScroll', accessScrollbar);
    initSidebarToggle();
    initClockAndDate();
});
