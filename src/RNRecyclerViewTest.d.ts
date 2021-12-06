/**
 * the example of RNRecyclerView
 */
export default class RNRecyclerViewTest extends Component<any, any, any> {
    constructor(props: any);
    _recycler: RNRecyclerView;
    renderItem: (item: any, index: any) => JSX.Element;
    renderTopControlPanel(): JSX.Element;
    renderTopControlPanel2(): JSX.Element;
    inverted(): void;
    updateFirst(): void;
    empty(): void;
    clear(): void;
    onBottom(): void;
    onLoadMore(): void;
    onTop(): void;
    reset(size: any): void;
    toTop(): void;
    toBottom(): void;
    remove(index: any): void;
    addAbove(index: any): void;
    addBelow(index: any): void;
    incrementCounter(index: any): void;
    moveUp(index: any): void;
    moveDown(index: any): void;
    addToTop(size: any): void;
    addToBottom(size: any): void;
}
import { Component } from "react";
import RNRecyclerView from "./RNRecyclerView";
