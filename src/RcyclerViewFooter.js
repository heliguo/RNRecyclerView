import {requireNativeComponent, ViewPropTypes} from 'react-native';
import PropTypes from 'prop-types';
import React, {Component} from 'react';


export default class RecyclerViewFooter extends Component {
    static propTypes = {
        style: ViewPropTypes.style,
        renderItem: PropTypes.func,
    };

    render() {
        const {style, renderItem} = this.props;

        return (
            <NativeRecyclerViewFooter
                style={style}>
                {renderItem}
            </NativeRecyclerViewFooter>
        );
    }
}

const NativeRecyclerViewFooter = requireNativeComponent('RecyclerViewFooterView');
