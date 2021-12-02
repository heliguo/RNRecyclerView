import {requireNativeComponent, ViewPropTypes} from "react-native";
import PropTypes from "prop-types";
import React, {Component} from "react";
import DataSource from './DataSource';

export default class RecyclerViewItem extends Component {
    static propTypes = {
        style: ViewPropTypes.style,
        itemIndex: PropTypes.number,
        shouldUpdate: PropTypes.bool,
        dataSource: PropTypes.instanceOf(DataSource),
        renderItem: PropTypes.func,
    };

    shouldComponentUpdate(nextProps) {
        return !!((nextProps.itemIndex !== this.props.itemIndex) ||
            (nextProps.shouldUpdate));
    }

    render() {
        const {style, itemIndex, dataSource, renderItem, header, separator, footer} = this.props;
        let element = renderItem({
            item: dataSource.get(itemIndex),
            index: itemIndex
        });

        return (
            <NativeRecyclerViewItem
                style={style}
                itemIndex={itemIndex}>
                {header}
                {element}
                {separator}
                {footer}
            </NativeRecyclerViewItem>
        );
    }
}

const NativeRecyclerViewItem = requireNativeComponent('RecyclerViewItemView');
