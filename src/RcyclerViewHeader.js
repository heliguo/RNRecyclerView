import {requireNativeComponent, ViewPropTypes} from 'react-native';
import PropTypes from 'prop-types';
import React, {Component} from 'react';


export default class RecyclerViewHeader extends Component {
    static propTypes = {
        style: ViewPropTypes.style,
        renderItem: PropTypes.func,
    };

    render() {
        const {style, renderItem} = this.props;

        return (
            <NativeRecyclerViewHeader
                style={style}>
                {renderItem}
            </NativeRecyclerViewHeader>
        );
    }
}

const NativeRecyclerViewHeader = requireNativeComponent('RecyclerViewHeaderView');
