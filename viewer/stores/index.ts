import React from "react";
import { PageStore } from "./page";
import { IssueStore } from "./issue";

export class RootStore {
  public pageStore: PageStore;
  public issueStore: IssueStore;

  constructor() {
    this.pageStore = new PageStore(this);
    this.issueStore = new IssueStore(this);
  }
}

const StoresContext = React.createContext(new RootStore());

export const useStore = () => React.useContext(StoresContext);
