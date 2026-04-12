import { ref } from "vue";

function isMainScrollerAtTop(): boolean {
    const scroller = document.querySelector(".v-main__scroller") as HTMLElement | null;
    if (scroller) return scroller.scrollTop <= 0;
    return window.scrollY <= 0;
}

export function usePullToRefresh(
    onRefresh: () => Promise<void>,
    threshold = 80,
) {
    const pullStartY = ref<number | null>(null);
    const pullCanRefresh = ref(false);
    const isPullRefreshing = ref(false);

    function onPullStart(event: TouchEvent) {
        if (event.touches.length !== 1) return;
        pullCanRefresh.value = isMainScrollerAtTop();
        pullStartY.value = event.touches[0].clientY;
    }

    function resetPullState() {
        pullCanRefresh.value = false;
        pullStartY.value = null;
    }

    async function onPullEnd(event: TouchEvent) {
        if (!pullCanRefresh.value || pullStartY.value === null || isPullRefreshing.value) {
            resetPullState();
            return;
        }

        const endY = event.changedTouches[0]?.clientY ?? pullStartY.value;
        const deltaY = endY - pullStartY.value;
        resetPullState();
        if (deltaY < threshold) return;

        isPullRefreshing.value = true;
        try {
            await onRefresh();
        } finally {
            isPullRefreshing.value = false;
        }
    }

    return {
        isPullRefreshing,
        onPullStart,
        onPullEnd,
        resetPullState,
    };
}
