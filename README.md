
# Thanks for react-native-recyclerview-list-android
 see @https://www.npmjs.com/package/react-native-recyclerview-list-android

# react-native-rnrecyclerviews

## Getting started

`$ npm install react-native-rnrecyclerviews --save`

### Mostly automatic installation

`$ react-native link react-native-rnrecyclerviews`


#### only use for Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
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

Look at the use case @ RNRecyclerViewTest

## props

layoutManager array
 1.LinearLayoutManager   [100]    or [100,4]   线性布局  
  必传 100；可选 4 用提前加载更多（列表加载至倒数第4条数据的回调）
 2.GridLayoutManager     [101，2] or [101,2,4] 网格布局  
  必传 101；2 spanCount；可选 4 用于提前加载更多（列表加载至倒数第4条数据的回调）
 3.StaggeredGridLayoutManager [102，2] or [102,2,4] 瀑布流    
  必传 102；2 spanCount；可选 4 用于提前加载更多（列表加载至倒数第4条数据的回调）

renderItem
 渲染的item view
 
dataSource
 数据
 
onBottom
 滑动到底部回调

onLoadMore 
 用于加载更多回调（提前 ？条数据开始回调）
 
onTop 
 滑动到顶回调
 
其他:
 1.notifyXXX 数据更新
 2.scrollXXX 滑动功能
 
question:
 1.reset layoutManager for resolving the refresh question (顶部刷新不必使用)
 2.see @ RNRecyclerViewTest.js.reset(size)
  

