import React, {PureComponent} from 'react';
import ReactNative, {requireNativeComponent, StyleSheet, UIManager, View} from 'react-native';
import PropTypes from 'prop-types';
import DataSource from './DataSource';
import RecyclerViewItem from './RcyclerViewItem';


export default class RNRecyclerView extends PureComponent {
    static propTypes = {
        layoutManager: PropTypes.array.isRequired,
        ...View.propTypes,
        renderItem: PropTypes.func,
        dataSource: PropTypes.instanceOf(DataSource),
        ListHeaderComponent: PropTypes.element,//头
        ListFooterComponent: PropTypes.element,//尾
        ListEmptyComponent: PropTypes.element,//空
        ItemSeparatorComponent: PropTypes.element,//分割
        onBottom: PropTypes.func,//滑动到底
        onLoadMore: PropTypes.func,//可用于加载更多回调
        onTop: PropTypes.func,
    };

    static defaultProps = {
        dataSource: new DataSource([], (item, i) => i),
    };


    _dataSourceListener = {

        onUnshift: () => {
            this._notifyItemRangeInserted(0, 1);
            this._shouldUpdateAll = true;
        },

        onPush: () => {
            const {dataSource} = this.props;
            this._notifyItemRangeInserted(dataSource.size(), 1);
            this._shouldUpdateAll = true;
        },

        onMoveUp: (position) => {
            this._notifyItemMoved(position, position - 1);
            this._shouldUpdateAll = true;
        },

        onMoveDown: (position) => {
            this._notifyItemMoved(position, position + 1);
            this._shouldUpdateAll = true;
        },

        onSplice: (start, deleteCount, ...items) => {
            if (deleteCount > 0) {
                this._notifyItemRangeRemoved(start, deleteCount);
            }
            if (items.length > 0) {
                this._notifyItemRangeInserted(start, items.length);
            }
            this._shouldUpdateAll = true;
        },

        onSet: (index, item) => {
            this._shouldUpdateKeys.push(this.props.dataSource.getKey(item, index));
            this.forceUpdate();
        },

        onSetDirty: () => {
            this._shouldUpdateAll = true;
            this.forceUpdate();
        },
    };

    constructor(props) {
        super(props);
        const {
            dataSource,//数据
        } = this.props;

        dataSource._addListener(this._dataSourceListener);

        this.state = {
            itemCount: dataSource.size(),
        };

        this._shouldUpdateAll = true;
        this._shouldUpdateKeys = [];
    }

    componentWillMount() {
    }

    componentWillUnmount() {
        const {dataSource} = this.props;
        this.mounted = false;
        if (dataSource) {
            dataSource._removeListener(this._dataSourceListener);
        }
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillReceiveProps(nextProps) {
        const {dataSource} = this.props;
        if (nextProps.dataSource !== dataSource) {
            dataSource._removeListener(this._dataSourceListener);
            nextProps.dataSource._addListener(this._dataSourceListener);
            this._notifyDataSetChanged(nextProps.dataSource.size());
        }
    }

    componentDidUpdate(prevProps, prevState) {
        this._shouldUpdateAll = false;
        this._shouldUpdateKeys = [];
    }

    render() {
        const {
            layoutManager,
            dataSource,
            renderItem,
            ListHeaderComponent,
            ListFooterComponent,
            ListEmptyComponent,
            ItemSeparatorComponent,
            ...rest
        } = this.props;

        const itemCount = dataSource.size();
        let stateItemCount = this.state.itemCount;

        let body = [];//item集合

        if (ListHeaderComponent) {
            var headerElement = React.isValidElement(ListHeaderComponent)
                ? ListHeaderComponent
                : <ListHeaderComponent/>;
        }

        if (ListFooterComponent) {
            var footerElement = React.isValidElement(ListFooterComponent)
                ? ListFooterComponent
                : <ListFooterComponent/>;
        }

        if (ItemSeparatorComponent) {
            var separatorElement = React.isValidElement(ItemSeparatorComponent)
                ? ItemSeparatorComponent
                : <ItemSeparatorComponent/>;
        }

        if (itemCount > 0) {
            for (let i = 0; i < itemCount; i++) {
                let item = dataSource.get(i);
                let itemKey = dataSource.getKey(item, i);
                let shouldUpdate = this._needsItemUpdate(itemKey);
                body.push(
                <RecyclerViewItem
                key={itemKey}
                style={styles.absolute}
                itemIndex={i}
                shouldUpdate={shouldUpdate}
                dataSource={dataSource}
                renderItem={renderItem}
                header={headerElement}
                separator={separatorElement}
                footer={footerElement}/>,
            );
            }
        } else if (ListEmptyComponent) {
            const emptyElement = React.isValidElement(ListEmptyComponent)
                ? ListEmptyComponent
                : <ListEmptyComponent/>;

            body.push(
            <RecyclerViewItem
            style={styles.absolute}
            key="$empty"
            itemIndex={0}
            shouldUpdate={true}
            dataSource={dataSource}
            renderItem={() => emptyElement}
            header={headerElement}
            footer={footerElement}/>,
        );

            stateItemCount = 1;
        }

        return (
            <NativeRecyclerView
        layoutManager={layoutManager}
        onBottom={this._onBottom}
        onLoadMore={this._onLoadMore}
        onTop={this._onTop}
        {...rest}
        itemCount={stateItemCount}>
            {body}
            </NativeRecyclerView>
    );
    }

    _onBottom = () => {
        const {onBottom} = this.props;
        if (onBottom) {
            onBottom();
        }
    };

    _onLoadMore = () => {
        const {onLoadMore} = this.props;
        if (onLoadMore) {
            onLoadMore();
        }
    };

    _onTop = () => {
        const {onTop} = this.props;
        if (onTop) {
            onTop();
        }
    };

    setLocalState = (state, callback) => {
        if (this.mounted) {
            this.setState(state, callback);
        }
    };

    scrollToTop({animated = true, velocity} = {}) {
        this.scrollToIndex({
            index: 0,
            animated,
            velocity,
        });
    }

    scrollToBottom({animated = true, velocity} = {}) {
        this.scrollToIndex({
            index: this.props.dataSource.size() - 1,
            animated,
            velocity,
        });
    }

    scrollToIndex = ({animated = true, index, velocity, viewPosition, viewOffset}) => {
        UIManager.dispatchViewManagerCommand(
            ReactNative.findNodeHandle(this),
            UIManager.AndroidRecyclerViewBackedScrollView.Commands.scrollToIndex.toString(),
            [animated, index, velocity, viewPosition, viewOffset],
        );

    };

    _needsItemUpdate(itemKey) {
        return this._shouldUpdateAll || this._shouldUpdateKeys.includes(itemKey);
    }

    _notifyItemMoved(currentPosition, nextPosition) {
        UIManager.dispatchViewManagerCommand(
            ReactNative.findNodeHandle(this),
            UIManager.AndroidRecyclerViewBackedScrollView.Commands.notifyItemMoved.toString(),
            [currentPosition, nextPosition],
        );
        this.forceUpdate();
    }

    _notifyItemRangeInserted(position, count) {
        UIManager.dispatchViewManagerCommand(
            ReactNative.findNodeHandle(this),
            UIManager.AndroidRecyclerViewBackedScrollView.Commands.notifyItemRangeInserted.toString(),
            [position, count],
        );
        this.forceUpdate();
    }

    _notifyItemRangeRemoved(position, count) {
        UIManager.dispatchViewManagerCommand(
            ReactNative.findNodeHandle(this),
            UIManager.AndroidRecyclerViewBackedScrollView.Commands.notifyItemRangeRemoved.toString(),
            [position, count],
        );
        this.forceUpdate();
    }

    _notifyDataSetChanged(itemCount) {
        UIManager.dispatchViewManagerCommand(
            ReactNative.findNodeHandle(this),
            UIManager.AndroidRecyclerViewBackedScrollView.Commands.notifyDataSetChanged.toString(),
            [itemCount],
        );
        this.setLocalState({
            itemCount,
        });
    }

    _setLayoutManager(data) {
        UIManager.dispatchViewManagerCommand(
            ReactNative.findNodeHandle(this),
            UIManager.AndroidRecyclerViewBackedScrollView.Commands.layoutManager.toString(),
            data,
        );
    }

}

const nativeOnlyProps = {
    nativeOnly: {
        onVisibleItemsChange: true,
        onBottom: true,
        onLoadMore: true,
        itemCount: true,
    },
};

const styles = StyleSheet.create({
    absolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
});

const NativeRecyclerView = requireNativeComponent('AndroidRecyclerViewBackedScrollView', RNRecyclerView, nativeOnlyProps);

module.exports = RNRecyclerView;
