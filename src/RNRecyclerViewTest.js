import React, {Component} from 'react';
import {Button, Image, NativeModules, StyleSheet, Text, View} from 'react-native';

import {RNRecyclerView} from './RNRecyclerView';
import DataSource from './DataSource';

let _gCounter = 1;

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
        const {dataSource} = this.state;

        return (
            <View style={styles.container}>
                {/*<TouchableNativeFeedback*/}
                {/*    onPress={()=>this.addToBottom(20)}>*/}
                {/*    <View style={{*/}
                {/*        borderBottomWidth: 0,*/}
                {/*        borderColor: '#e7e7e7',*/}
                {/*        marginHorizontal: 5,*/}
                {/*        marginVertical: 5,*/}
                {/*    }}>*/}
                {/*        <Text style={{*/}
                {/*            fontSize: 14,*/}
                {/*            color: 'black',*/}
                {/*        }}>加载20条数据</Text>*/}
                {/*    </View>*/}
                {/*</TouchableNativeFeedback>*/}

                {this.renderTopControlPanel()}

                <RNRecyclerView
                    layoutManager={[102, 2, 4]}
                    onBottom={this.onBottom}
                    onLoadMore={this.onLoadMore}
                    onTop={this.onTop}
                    ref={(component) => this._recycler = component}
                    style={{flex: 1}}
                    dataSource={dataSource}
                    renderItem={this.renderItem}

                    // ListHeaderComponent={(
                    //     <View style={{paddingTop: 15, backgroundColor: '#eee'}}/>
                    // )}
                    // ListFooterComponent={(
                    //     <View style={{paddingTop: 15, backgroundColor: '#aaa'}}/>
                    // )}
                    // ListEmptyComponent={(
                    //     <View style={{borderColor: '#e7e7e7', borderWidth: 1, margin: 10, padding: 20}}>
                    //         <Text style={{fontSize: 15}}>No results.</Text>
                    //     </View>
                    // )}
                    // ItemSeparatorComponent={(
                    //     <View style={{
                    //         borderBottomWidth: 1,
                    //         borderColor: '#e7e7e7',
                    //         marginHorizontal: 5,
                    //         marginVertical: 5,
                    //     }}/>
                    // )}
                />
            </View>
        );
    }

    renderItem = ({item, index}) => {
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

    onBottom() {
        // NativeModules.CommonModule.show('~~~~到底了~~~~');
    }

    onLoadMore() {
        // NativeModules.CommonModule.show('~~~~加载更多~~~~');
    }

    onTop() {

    }

    reset(size) {
        // this._recycler.scrollToTop();
        const data = Array(size).fill().map((e, i) => newItem());
        this._recycler._setLayoutManager([102, 2, 4]);//重新设置layoutManager可解决刷新问题
        // this.state.dataSource.splice(0, this.state.dataSource.size(), ...data);
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

class Item extends Component {
    render() {
        const {item, index, onRemove, onAddAbove, onAddBelow, onMoveUp, onMoveDown, onIncrementCounter, dataSource} = this.props;
        const {id, counter} = item;
        const imageWidth = 70;
        const imageHeight = 70 + (index % 5 === 2 ? 20 : 0);

        return (
            // <TouchableNativeFeedback
            //     onPress={onIncrementCounter}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 5, marginVertical: 5}}>
                <Image
                    source={{uri: 'http://loremflickr.com/320/240?t=' + (id % 9)}}
                    style={{
                        width: imageWidth,
                        height: imageHeight,
                        marginRight: 10,
                    }}/>
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
            // </TouchableNativeFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
});
