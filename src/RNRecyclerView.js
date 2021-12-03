import React, {PureComponent} from 'react';
import ReactNative, {requireNativeComponent, StyleSheet, UIManager, View} from 'react-native';
import PropTypes from 'prop-types';
import DataSource from './DataSource';
import RecyclerViewItem from './RcyclerViewItem';
import RecyclerViewEmpty from './RcyclerViewEmpty';
import RecyclerViewHeader from './RcyclerViewHeader';
import RecyclerViewFooter from './RcyclerViewFooter';


export default class RNRecyclerView extends PureComponent {
    static propTypes = {
        layoutType: PropTypes.array.isRequired,
        ...View.propTypes,
        renderItem: PropTypes.func,
        dataSource: PropTypes.instanceOf(DataSource),
        inverted: PropTypes.bool,//反转列表（聊天信息）
        ListHeaderComponent: PropTypes.element,//头（无法在瀑布流中使用）
        ListFooterComponent: PropTypes.element,//尾（无法在瀑布流中使用）
        ListEmptyComponent: PropTypes.element,//空布局
        onBottom: PropTypes.func,//滑动到底
        onLoadMore: PropTypes.func,//可用于加载更多回调
        onTop: PropTypes.func,
    };

    static defaultProps = {
        dataSource: new DataSource([], (item, i) => i),
        inverted: false,
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

    UNSAFE_componentWillMount() {
    }

    UNSAFE_componentWillUnmount() {
        const {dataSource} = this.props;
        this.mounted = false;
        if (dataSource) {
            dataSource._removeListener(this._dataSourceListener);
        }
    }

    UNSAFE_componentDidMount() {
        this.mounted = true;
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {dataSource} = this.props;
        if (nextProps.dataSource.size() === 0 && dataSource.size === 0) {
            return;
        }
        if (nextProps.dataSource !== dataSource) {
            dataSource._removeListener(this._dataSourceListener);
            nextProps.dataSource._addListener(this._dataSourceListener);
            this._notifyDataSetChanged(nextProps.dataSource.size());
        }
    }

    UNSAFE_componentDidUpdate(prevProps, prevState) {
        this._shouldUpdateAll = false;
        this._shouldUpdateKeys = [];
    }

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

    render() {
        const {
            inverted,
            layoutType,
            dataSource,
            renderItem,
            ListHeaderComponent,
            ListFooterComponent,
            ListEmptyComponent,
            ...rest
        } = this.props;

        let itemCount = dataSource.size();
        let dataCount = itemCount;

        let body = [];//item集合

        if (dataCount > 0 && renderItem) {
            if (ListHeaderComponent) {
                itemCount = dataCount + 1;
                body.push(
                <RecyclerViewHeader
                style={styles.absolute}
                renderItem={ListHeaderComponent}/>,
            );
            }
            for (let i = 0; i < dataCount; i++) {
                let item = dataSource.get(i);
                let itemKey = dataSource.getKey(item, i);
                let shouldUpdate = this._needsItemUpdate(itemKey);
                body.push(
                <RecyclerViewItem
                style={styles.absolute}
                itemIndex={i}
                shouldUpdate={shouldUpdate}
                dataSource={dataSource}
                renderItem={renderItem}/>,
            );
            }
            if (ListFooterComponent) {
                itemCount++;
                body.push(
                <RecyclerViewFooter
                style={styles.absolute}
                renderItem={ListFooterComponent}/>,
            );
            }
        } else {
            if (ListHeaderComponent) {
                itemCount++;
                body.push(
                <RecyclerViewHeader
                style={styles.absolute}
                renderItem={ListHeaderComponent}/>,
            );
            }
            if (ListEmptyComponent) {
                itemCount++;
                body.push(
                <RecyclerViewEmpty
                style={styles.absolute}
                renderItem={ListEmptyComponent}/>,
            );
            }

            if (ListFooterComponent) {
                itemCount++;
                body.push(
                <RecyclerViewFooter
                style={styles.absolute}
                renderItem={ListFooterComponent}/>,
            );
            }
        }


        return (
            <NativeRecyclerView
        layoutType={layoutType}
        inverted={inverted}
        onBottom={this._onBottom}
        onLoadMore={this._onLoadMore}
        onTop={this._onTop}
        {...rest}
        itemCount={itemCount}>
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
            UIManager.AndroidRecyclerViewBackedScrollView.Commands.layoutType.toString(),
            data,
        );
    }

    _setReverse(inverted) {
        UIManager.dispatchViewManagerCommand(
            ReactNative.findNodeHandle(this),
            UIManager.AndroidRecyclerViewBackedScrollView.Commands.inverted.toString(),
            [inverted],
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
