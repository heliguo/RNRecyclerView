import {requireNativeComponent, ViewPropTypes} from "react-native";
import PropTypes from "prop-types";
import React, {Component} from "react";


export default class RecyclerViewItem extends Component {
    static propTypes = {
        style: ViewPropTypes.style,
        itemIndex: PropTypes.number,
        shouldUpdate: PropTypes.bool,
        dataSource: PropTypes.object,
        renderItem: PropTypes.func,
        header: PropTypes.any,
        separator: PropTypes.any,
        footer: PropTypes.any
    };

    shouldComponentUpdate(nextProps) {
        return !!((nextProps.itemIndex !== this.props.itemIndex) ||
            (nextProps.header !== this.props.header) ||
            (nextProps.footer !== this.props.footer) ||
            (nextProps.separator !== this.props.separator) ||
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
