import { useTimeout } from '/@/hooks/core/useTimeout';
import { PageEnum } from '/@/enums/pageEnum';
import { TabItem, tabStore } from '/@/store/modules/tab';
import { appStore } from '/@/store/modules/app';
import router from '/@/router';

type Fn = () => void;
type RouteFn = (tabItem: TabItem) => void;

interface TabFn {
  refreshPageFn: RouteFn;
  closeAllFn: Fn;
  closeLeftFn: RouteFn;
  closeRightFn: RouteFn;
  closeOtherFn: RouteFn;
  closeCurrentFn: RouteFn;
}

let refreshPage: RouteFn;
let closeAll: Fn;
let closeLeft: RouteFn;
let closeRight: RouteFn;
let closeOther: RouteFn;
let closeCurrent: RouteFn;

export let isInitUseTab = false;
export function useTabs() {
  function initTabFn({
    refreshPageFn,
    closeAllFn,
    closeLeftFn,
    closeRightFn,
    closeOtherFn,
    closeCurrentFn,
  }: TabFn) {
    if (isInitUseTab) return;
    refreshPageFn && (refreshPage = refreshPageFn);
    closeAllFn && (closeAll = closeAllFn);
    closeLeftFn && (closeLeft = closeLeftFn);
    closeRightFn && (closeRight = closeRightFn);
    closeOtherFn && (closeOther = closeOtherFn);
    closeCurrentFn && (closeCurrent = closeCurrentFn);
    isInitUseTab = true;
  }

  function resetCache() {
    const def = undefined as any;
    refreshPage = def;
    closeAll = def;
    closeLeft = def;
    closeRight = def;
    closeOther = def;
    closeCurrent = def;
  }

  function canIUseFn(): boolean {
    const { getProjectConfig } = appStore;
    const { multiTabsSetting: { show } = {} } = getProjectConfig;
    if (!show) {
      throw new Error('当前未开启多标签页，请在设置中打开！');
    }
    return !!show;
  }
  return {
    initTabFn,
    refreshPage: () => canIUseFn() && refreshPage(tabStore.getCurrentTab),
    closeAll: () => canIUseFn() && closeAll(),
    closeLeft: () => canIUseFn() && closeLeft(tabStore.getCurrentTab),
    closeRight: () => canIUseFn() && closeRight(tabStore.getCurrentTab),
    closeOther: () => canIUseFn() && closeOther(tabStore.getCurrentTab),
    closeCurrent: () => canIUseFn() && closeCurrent(tabStore.getCurrentTab),
    resetCache: () => canIUseFn() && resetCache(),
    addTab: (path: PageEnum, goTo = false) => {
      useTimeout(() => {
        tabStore.addTabByPathAction(path);
      }, 0);

      goTo && router.push(path);
    },
  };
}
