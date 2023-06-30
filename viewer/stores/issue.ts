import { makeAutoObservable } from "mobx";
import type { RootStore } from ".";

export class IssueStore {
  private rootStore: RootStore;

  public issue: any = {};
  public comments: any[] = [];

  constructor(root: RootStore) {
    this.rootStore = root;

    makeAutoObservable(this);
  }

  public async fetch(issueId?: string) {
    if (!issueId) {
      return;
    }

    const [issue, comments] = await Promise.all([
      fetch(`/assets/issues/${issueId}/issue.json`),
      fetch(`/assets/issues/${issueId}/comments.json`)
    ]);
    this.issue = await issue.json();
    this.comments = await comments.json();
  }

  public clear() {
    this.issue = {};
    this.comments = [];
  }
}
