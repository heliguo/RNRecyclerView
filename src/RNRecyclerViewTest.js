import React, {Component} from 'react';
import {Button, Image, StyleSheet, Text, View,ToastAndroid,TouchableNativeFeedback} from 'react-native';

import RNRecyclerView from './RNRecyclerView';
import DataSource from './DataSource';

let _gCounter = 1;

const layoutArray = [1, 2, 4];

function newItem() {
    return {
        id: _gCounter++,
        counter: 0,
    };
}

/**
 * the example of RNRecyclerView
 */
export default class RNRecyclerViewTest extends Component {
    constructor(props) {
        super(props);
        const data = Array(100).fill().map((e, i) => newItem());

        this.state = {
            dataSource: new DataSource(data, (item, index) => item.id),
            inverted: false,
        };
    }

    render() {
        const {dataSource,inverted} = this.state;

        return (
            <View style={styles.container}>

                {this.renderTopControlPanel()}
                {this.renderTopControlPanel2()}

                <RNRecyclerView
                    layoutType={layoutArray}
                    onBottom={this.onBottom}
                    onLoadMore={this.onLoadMore}
                    onTop={this.onTop}
                    ref={(component) => this._recycler = component}
                    style={{flex: 1}}
                    dataSource={dataSource}
                    renderItem={this.renderItem}
                    inverted={inverted}
                    ListHeaderComponent={header()}
                    ListFooterComponent={footer()}
                    ListEmptyComponent={empty()}

                />
            </View>
        );
    }

    renderItem = (item,index) => {
        return (
            <Item
                item={item}
                index={index}
                onRemove={() => this.remove(index)}
                onAddAbove={() => this.addAbove(index)}
                onMoveUp={() => this.moveUp(index)}
                onMoveDown={() => this.moveDown(index)}
                onAddBelow={() => this.addBelow(index)}
                onIncrementCounter={() => this.incrementCounter(index)}
                dataSource={this.state.dataSource}/>
        );
    };

    renderTopControlPanel() {
        return (
            <View style={{
                flexDirection: 'row',
                padding: 5,
                zIndex: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#e7e7e7',
            }}>
                <Button
                    title={'加载20条'}
                    onPress={() => this.addToBottom(20)}/>
                <View style={{width: 10}}/>
                <Button
                    title={'重新加载30条'}
                    onPress={() => this.reset(30)}/>

                <View style={{width: 10}}/>
                <Button
                    title={'滚动到顶'}
                    onPress={() => this.toTop()}/>

                <View style={{width: 10}}/>
                <Button
                    title={'滚动到底'}
                    onPress={() => this.toBottom()}/>
            </View>
        );
    }

    renderTopControlPanel2() {
        return (
            <View style={{
            flexDirection: 'row',
                padding: 5,
                zIndex: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#e7e7e7',
            }}>
                <Button
                    title={'反转'}
                    onPress={() => this.inverted()}/>
                <View style={{width: 10}}/>

                <Button
                    title={'置空'}
                    onPress={() => this.clear()}/>
                <View style={{width: 10}}/>

                <Button
                    title={'数据变空'}
                    onPress={() => this.empty()}/>
                <View style={{width: 10}}/>
                <Button
                    title={'更新第一条数据'}
                    onPress={() => this.updateFirst()}/>
                <View style={{width: 10}}/>

            </View>
        );
    }

    inverted() {
        this.setState({
            inverted: !this.state.inverted,
        });
    }

    updateFirst(){
        this.state.dataSource.set(0,newItem());
    }

    empty() {
        this.state.dataSource.splice(0, this.state.dataSource.size());
        this._recycler._setLayoutManager(layoutArray);//重新设置layoutManager可解决刷新问题
    }

    clear() {
        if (this.state.dataSource.size() === 0) {
            return;
        }
        this._recycler._setLayoutManager(layoutArray);//重新设置layoutManager可解决刷新问题
        this.setState({
            dataSource: new DataSource([], (item, index) => item.id),
            inverted: false,
        });

    }

    onBottom() {
        // NativeModules.CommonModule.show('~~~~到底了~~~~');
    }

    onLoadMore() {
        // NativeModules.CommonModule.show('~~~~加载更多~~~~');
    }

    onTop() {

    }

    reset(size) {
        const data = Array(size).fill().map((e, i) => newItem());
        this._recycler._setLayoutManager(layoutArray);//重新设置layoutManager可解决刷新问题
        this.setState({
            dataSource: new DataSource(data, (item, i) => item.id),
        });
    }

    toTop() {
        this._recycler.scrollToTop();
    }

    toBottom() {
        this._recycler.scrollToBottom();
    }


    remove(index) {
        this.state.dataSource.splice(index, 1);
    }

    addAbove(index) {
        this.state.dataSource.splice(index, 0, newItem());
    }

    addBelow(index) {
        const {dataSource} = this.state;
        if (index === dataSource.size() - 1 && this._recycler) {
            this._recycler.scrollToIndex({
                animated: true,
                index: dataSource.size(),
                velocity: 120,
            });
        }

        this.state.dataSource.splice(index + 1, 0, newItem());
    }

    incrementCounter(index) {
        ToastAndroid.showWithGravity('你点击了第' + index + '条数据图片', ToastAndroid.SHORT, ToastAndroid.CENTER);
        let item = this.state.dataSource.get(index);
        item.counter++;
        this.state.dataSource.set(index, item);
    }

    moveUp(index) {
        this.state.dataSource.moveUp(index);
    }

    moveDown(index) {
        this.state.dataSource.moveDown(index);
    }

    addToTop(size) {
        const currCount = this.state.dataSource.size();
        const newItems = Array(size).fill().map((e, i) => newItem());
        this.state.dataSource.splice(0, 0, ...newItems);
    }

    addToBottom(size) {
        const currCount = this.state.dataSource.size();
        const newItems = Array(size).fill().map((e, i) => newItem());
        this.state.dataSource.splice(currCount, 0, ...newItems);
    }
}

const header = () => {
    return <View style={{
        alignItems: 'center',
        borderColor: '#ff0000',
        borderWidth: 1,
    }}>
        <Text style={{fontSize: 15}}>图片可点击</Text>
    </View>;
};

const empty = () => {
    return <View style={{
        alignItems: 'center',
        borderColor: '#ff0000',
        borderWidth: 1,
    }}>
        <Text style={{fontSize: 15}}>empty...</Text>
    </View>;
};

const footer = () => {
    return <View style={{
        alignItems: 'center',
        borderColor: '#ff0000',
        borderWidth: 1,
    }}>
        <Text style={{fontSize: 15}}>footer...</Text>
    </View>;
};

class Item extends Component {
    render() {
        const {item, index, onRemove, onAddAbove, onAddBelow, onMoveUp, onMoveDown, onIncrementCounter, dataSource} = this.props;
        const {id, counter} = item;
        const imageWidth = 70;
        const imageHeight = 70 + (index % 5 === 2 ? 20 : 0);

        return (

            <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 5, marginVertical: 5}}>
                <TouchableNativeFeedback
                    onPress={onIncrementCounter}>
                    <Image
                        source={{uri: 'http://loremflickr.com/320/240?t=' + (index % 9)}}
                        style={{
                            width: imageWidth,
                            height: imageHeight,
                            marginRight: 10,
                        }}/>
                </TouchableNativeFeedback>
                <View style={{flex: 1}}>
                    <Text style={{
                        fontSize: 16,
                        color: 'black',
                    }}>Item #{id}</Text>
                    <Text style={{
                        fontSize: 14,
                        color: 'black',
                    }}>total size:{dataSource.size()}</Text>
                    <Text style={{
                        fontSize: 13,
                        color: '#888',
                    }}>count {counter ?
                        <Text style={{fontWeight: 'bold', color: 'black'}}>{counter}</Text>
                        : null}</Text>
                </View>
                <View style={{
                    borderBottomWidth: 1,
                    borderColor: '#e7e7e7',
                    marginHorizontal: 5,
                    marginVertical: 5,
                }}/>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
});
