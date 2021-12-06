
# react-native-rnrecyclerviews

 - 使用Android原生RecyclerView实现。
 - 列表内容由React Native项目自行决定，故不对外提供item点击事件。
 - 提供滑动到顶、底及任意position回调

# Thanks for react-native-recyclerview-list-android
 see @https://www.npmjs.com/package/react-native-recyclerview-list-android

## Getting started

`$ npm install react-native-rnrecyclerviews`

## Manually install only for Android project（RN项目会自动生成）

1. Open up `android/app/src/main/java/[...]/MainApplication.java`
  - Add `import com.library.rnrecyclerview.RNRnrecyclerviewPackage;` to the imports at the top of the file
  - Add `new RNRnrecyclerviewPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-rnrecyclerviews'
  	project(':react-native-rnrecyclerviews').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-rnrecyclerviews/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-rnrecyclerviews')
  	```


## Usage

Look at the use case `RNRecyclerViewTest`

# Props

Prop name             | Description   | Type      | Default| Example
----------------------|---------------|-----------|--------------|----------
`layoutType`          | 1.设置LayoutManager(必传)<br/>2.设置spanCount<br/>3.设置loadMore回调条目数 | array | 必传 | 1.线性布局{0}、{0,4}<br/>2.网格布局{1,2}、{1,2,4}<br/>3.瀑布流{2,2}、{2,2,4}
`dataSource`          | The datasource that contains the data to render | DataSource |  |
`renderItem`          | 需要渲染的item | component |  |
`inverted`            | inverted the list | bool |  |
`ListHeaderComponent` | Component to render as header 瀑布流不要使用 | component | none | 
`ListFooterComponent` | Component to render as footer 瀑布流不要使用 | component | none | 
`ListEmptyComponent`  | Component to render in case of no items 空布局 | component | none | 
`onBottom`            | 列表滑动到底回调 | function |  |
`onLoadMore`          | 加载更多回调，可用于提前n条数据开始回调<br/>（layoutType最后一个参数设置n） | function |  |
`onTop`               | 滑动到顶回调 | function |  |
  
# Methods

`Method name`          | Params                   | Description
----------------------|--------------------------|------------
`scrollToIndex`       | `{ index, animated, velocity, viewPosition, viewOffset }` | Scroll the list to the `index` item such that it is positioned in the viewable area such that `viewPosition` 0 places it at the top, 1 at the bottom, and 0.5 centered in the middle. `viewOffset` is a fixed number of pixels to offset the final target position.  It can be `animated`. `velocity` is the amount of milliseconds per inch.
`scrollToEnd`         | `{ animated, velocity }` | Scroll to the end of the list. It can be `animated`. `velocity` is the amount of milliseconds per inch.
`scrollToTop`         | `{ animated, velocity }` | Scroll to the top of the list. It can be `animated`. `velocity` is the amount of milliseconds per inch.
`setLayoutManager`    | `layoutType`             | Reset layoutManager for resolving the refresh question
`setReverse`          | `inverted`               | inverted the list

# DataSource

It wraps your array, giving you some useful methods to update the data.

## Methods

Method name                | Params                          | Description
----------------------|---------------------------------|-----------------
`push`                | item                            | Add an item to the end of the array
`unshift`             | item                            | Add an item to the beginning of the array
`splice`              | index,deleteCount,...items      | Equals to `Array.prototype.splice`
`set`                 | index, item                     | Set the item at the specified index
`get`                 | index                           | Returns the item at the specified index
`size`                |                                 | Returns the length of the array
`setDirty`			  | 								| Forces the RecyclerViewList to render again the visible items
`moveUp`			  | index						    | Move the item up of 1 position
`moveDown` 	          | index							| Move the item down of 1 position

 
 - note:
 1. Reset layoutManager for resolving the refresh question (非顶部全局重置数据必须使用)
 2. See `RNRecyclerViewTest.js.reset()`
  

