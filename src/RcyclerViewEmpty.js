import {requireNativeComponent, ViewPropTypes} from 'react-native';
import PropTypes from 'prop-types';
import React, {Component} from 'react';


export default class RecyclerViewEmpty extends Component {
    static propTypes = {
        style: ViewPropTypes.style,
        renderItem: PropTypes.func,
    };

    render() {
        const {style, renderItem} = this.props;


        return (
            <NativeRecyclerViewEmpty
                style={style}>
                {renderItem}
            </NativeRecyclerViewEmpty>
        );
    }
}

const NativeRecyclerViewEmpty = requireNativeComponent('RecyclerViewEmptyView');
