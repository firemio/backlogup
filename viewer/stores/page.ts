import { makeAutoObservable } from "mobx";
import type { RootStore } from ".";

export class PageStore {
  private rootStore: RootStore;

  public loading = false;
  public pages: any[] = [];
  public totalPage = 0;
  public currentDownloading = 0;
  public page = 0;
  public pageSize = 20;
  public issueKeyIndex: {[issueKey: string]: string} = {};

  constructor(root: RootStore) {
    this.rootStore = root;

    makeAutoObservable(this);
  }

  public async fetch() {
    if (this.pages.length > 0) {
      return;
    }

    this.loading = true;

    try {
      const pageInfo = await fetch("/assets/configs/pages.json");
      const { start, end } = await pageInfo.json();
      this.totalPage = end;

      const pages = [];
      for (let i = start; i <= end; i++) {
        this.currentDownloading = i;

        const req = await fetch(`/assets/pages/${i}.json`);
        const page: any[] = await req.json();
        pages.push(...page);

        // const index: {[issueKey: string]: string} = { ...this.issueKeyIndex };
        // page.forEach((issue) => {
        //   index[issue.issueKey] = issue.id;
        // });
        // this.issueKeyIndex = index;
      }
      this.pages = pages;
    } finally {
      this.loading = false;
    }
  }

  setPage(page: number) {
    this.page = page;
  }
  setPageSize(pageSize: number) {
    this.pageSize = pageSize;
  }
}
