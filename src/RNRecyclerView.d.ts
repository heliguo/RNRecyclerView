import React from 'react';
import {ViewProps} from 'react-native';
import DataSource from './DataSource';

export interface RNRecyclerViewInterface<ItemType> {
    layoutType: Array<number>;
    dataSource: DataSource;
    renderItem: (props: { item: ItemType; index: number }) => void;
    ListHeaderComponent?: React.Component;
    ListEmptyComponent?: React.Component;
    ListFooterComponent?: React.Component;
    ItemSeparatorComponent?: React.Component;
    onBottom?: Function;
    onLoadMore?: Function;
    onTop?: Function;
}

/**
 * RNRecyclerView 组件
 *
 * @param layoutType 必填 1.线性布局{0}、{0,4} 2.网格布局{1,2}、{1,2,4} 3.瀑布流{2,2}、{2,2,4}
 * @param dataSource 必填 需使用组件定义的dataSource类型创建
 * @param renderItem 必填 瀑布流渲染方法
 * @param 其他可选参数请自查
 */
export default class RNRecyclerView extends React.Component<RNRecyclerViewInterface<any> & ViewProps> {
    static propTypes: any;
    static defaultProps: {
        dataSource: DataSource;
        inverted: boolean;
    };

    constructor(props: RNRecyclerViewInterface<any> & ViewProps);

    state: {
        itemCount: any;
    };
    _shouldUpdateAll: boolean;
    _shouldUpdateKeys: any[];

    componentWillMount(): void;

    componentWillUnmount(): void;

    mounted: boolean;

    componentDidMount(): void;

    componentWillReceiveProps(nextProps: any): void;

    componentDidUpdate(prevProps: any, prevState: any): void;

    _dataSourceListener: {
        onUnshift: () => void;
        onPush: () => void;
        onMoveUp: (position: any) => void;
        onMoveDown: (position: any) => void;
        onSplice: (start: any, deleteCount: any, ...items: any[]) => void;
        onSet: (index: any, item: any) => void;
        onSetDirty: () => void;
    };

    render(): any;

    _onBottom: () => void;
    _onLoadMore: () => void;
    _onTop: () => void;
    setLocalState: (state: any, callback: any) => void;

    scrollToTop({animated, velocity}?: { animated?: boolean; velocity: any }): void;

    scrollToBottom({animated, velocity}?: { animated?: boolean; velocity: any }): void;

    scrollToIndex: ({animated, index, velocity, viewPosition, viewOffset}: { animated?: boolean; index: any; velocity: any; viewPosition: any; viewOffset: any }) => void;

    _needsItemUpdate(itemKey: any): any;

    _notifyItemMoved(currentPosition: any, nextPosition: any): void;

    _notifyItemRangeInserted(position: any, count: any): void;

    _notifyItemRangeRemoved(position: any, count: any): void;

    _notifyDataSetChanged(itemCount: any): void;

    _setLayoutManager(data: any): void;

    _setReverse(inverted: any): void;
}
