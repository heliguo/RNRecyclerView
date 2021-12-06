package com.library.rnrecyclerview;

import android.annotation.SuppressLint;
import android.util.Log;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.StaggeredGridLayoutManager;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.views.scroll.ScrollEventType;
import com.library.rnrecyclerview.event.ContentSizeChangeEvent;
import com.library.rnrecyclerview.event.ItemLoadBottomEvent;
import com.library.rnrecyclerview.event.ItemLoadChangeEvent;
import com.library.rnrecyclerview.event.ItemTopEvent;

import java.util.ArrayList;
import java.util.Map;
import java.util.Objects;

/**
 * View manager for {@link RecyclerViewBackedScrollView}.
 */
public class RecyclerViewBackedScrollViewManager extends ViewGroupManager<RecyclerViewBackedScrollView> {

    public static final String REACT_CLASS = "AndroidRecyclerViewBackedScrollView";
    public static final int COMMAND_NOTIFY_ITEM_RANGE_INSERTED = 1;
    public static final int COMMAND_NOTIFY_ITEM_RANGE_REMOVED = 2;
    public static final int COMMAND_NOTIFY_DATASET_CHANGED = 3;
    public static final int COMMAND_SCROLL_TO_INDEX = 4;
    public static final int COMMAND_NOTIFY_ITEM_MOVED = 5;
    public static final int COMMAND_LAYOUT_MANAGER = 6;
    public static final int COMMAND_INVERTED = 7;

    public static final String LINEAR = "LINEARLAYOUTMANAGER";//(context)
    public static final String GRID = "GRIDLAYOUTMANAGER";//(context, spanCount)
    public static final String STAGGERED = "STAGGEREDGRIDLAYOUTMANAGER";//( spanCount,orientation/*HORIZONTAL=0,VERTICAL = 1*/)

    public static final int LAYOUT_MANAGER_LINEAR = 0;
    public static final int LAYOUT_MANAGER_GRID = 1;
    public static final int LAYOUT_MANAGER_STAGGERED = 2;


    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected RecyclerViewBackedScrollView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new RecyclerViewBackedScrollView(reactContext);
    }

    @Override
    public void addView(RecyclerViewBackedScrollView parent, View child, int index) {
        if (child instanceof BaseView) {
            BaseView item = (BaseView) child;
            parent.addViewToAdapter(item, index);
        }

    }

    @Override
    public int getChildCount(RecyclerViewBackedScrollView parent) {
        return parent.getChildCountFromAdapter();
    }

    @Override
    public View getChildAt(RecyclerViewBackedScrollView parent, int index) {
        return parent.getChildAtFromAdapter(index);
    }

    @Override
    public void removeViewAt(RecyclerViewBackedScrollView parent, int index) {
        parent.removeViewFromAdapter(index);
    }

    /**
     * setList data
     */
    @ReactProp(name = "list")
    public void setList(RecyclerViewBackedScrollView parent, ReadableArray array) {
        ArrayList<Object> objects = array.toArrayList();
        Log.e("CommonModule", "native log : " + objects.toString());

    }

    /**
     * setLayoutManager
     */
    @ReactProp(name = "layoutType")
    public void setLayoutType(RecyclerViewBackedScrollView parent, ReadableArray args) {
        setLayoutManager(parent, args);
        parent.setItemAnimator(null);

    }

    /**
     * 注册加载更多监听，滑动到底监听
     */
    @ReactProp(name = "loadMoreCount")
    public void setLoadMoreCount(RecyclerViewBackedScrollView parent, int itemCount) {
        parent.setLoadMoreCount(itemCount);
    }

    /**
     * 更新 item count
     */
    @SuppressLint("NotifyDataSetChanged")
    @ReactProp(name = "itemCount")
    public void setItemCount(RecyclerViewBackedScrollView parent, int itemCount) {
        parent.setItemCount(itemCount);
        Objects.requireNonNull(parent.getAdapter()).notifyDataSetChanged();
    }

    /**
     * 反转布局
     */
    @ReactProp(name = "inverted", defaultBoolean = false)
    public void setInverted(RecyclerViewBackedScrollView parent, boolean inverted) {
        parent.setReverse(inverted);
    }

    /**
     * item animator
     */
    @ReactProp(name = "itemAnimatorEnabled", defaultBoolean = true)
    public void setItemAnimatorEnabled(RecyclerViewBackedScrollView parent, boolean enabled) {
        parent.setItemAnimatorEnabled(enabled);
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        return MapBuilder.of(LINEAR, LAYOUT_MANAGER_LINEAR, GRID, LAYOUT_MANAGER_GRID, STAGGERED, LAYOUT_MANAGER_STAGGERED);
    }

    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                "notifyItemRangeInserted", COMMAND_NOTIFY_ITEM_RANGE_INSERTED,
                "notifyItemRangeRemoved", COMMAND_NOTIFY_ITEM_RANGE_REMOVED,
                "notifyItemMoved", COMMAND_NOTIFY_ITEM_MOVED,
                "notifyDataSetChanged", COMMAND_NOTIFY_DATASET_CHANGED,
                "scrollToIndex", COMMAND_SCROLL_TO_INDEX,
                "layoutType", COMMAND_LAYOUT_MANAGER,
                "inverted", COMMAND_INVERTED
        );
    }

    @SuppressLint("NotifyDataSetChanged")
    @Override
    public void receiveCommand(@NonNull RecyclerViewBackedScrollView parent, String commandId, @Nullable ReadableArray args) {
        if (args == null || args.size() == 0) {
            return;
        }
        switch (Integer.parseInt(commandId)) {
            case COMMAND_NOTIFY_ITEM_RANGE_INSERTED: {//insert new data
                final int position = args.getInt(0);
                final int count = args.getInt(1);
                if (parent.getAdapter() instanceof RecyclerViewBackedScrollView.ReactListAdapter) {
                    RecyclerViewBackedScrollView.ReactListAdapter adapter = (RecyclerViewBackedScrollView.ReactListAdapter) parent.getAdapter();
                    adapter.setItemCount(adapter.getItemCount() + count);
                    adapter.notifyItemRangeInserted(position, count);
                }
                return;
            }

            case COMMAND_NOTIFY_ITEM_RANGE_REMOVED: {//notify range change
                final int position = args.getInt(0);
                final int count = args.getInt(1);
                RecyclerViewBackedScrollView.ReactListAdapter adapter = (RecyclerViewBackedScrollView.ReactListAdapter) parent.getAdapter();
                assert adapter != null;
                adapter.setItemCount(adapter.getItemCount() - count);
                adapter.notifyItemRangeRemoved(position, count);
                return;
            }


            case COMMAND_NOTIFY_ITEM_MOVED: {//move
                final int currentPosition = args.getInt(0);
                final int nextPosition = args.getInt(1);
                RecyclerViewBackedScrollView.ReactListAdapter adapter = (RecyclerViewBackedScrollView.ReactListAdapter) parent.getAdapter();
                assert adapter != null;
                adapter.notifyItemMoved(currentPosition, nextPosition);
                return;
            }

            case COMMAND_NOTIFY_DATASET_CHANGED: {//notify all
                final int itemCount = args.getInt(0);
                RecyclerViewBackedScrollView.ReactListAdapter adapter = (RecyclerViewBackedScrollView.ReactListAdapter) parent.getAdapter();
                assert adapter != null;
                adapter.setItemCount(itemCount);
                adapter.notifyDataSetChanged();
                return;
            }

            case COMMAND_SCROLL_TO_INDEX: {//滚动
                boolean animated = args.getBoolean(0);
                int index = args.getInt(1);
                RecyclerViewBackedScrollView.ScrollOptions options = new RecyclerViewBackedScrollView.ScrollOptions();
                options.millisecondsPerInch = args.isNull(2) ? null : (float) args.getDouble(2);
                options.viewPosition = args.isNull(3) ? null : (float) args.getDouble(3);
                options.viewOffset = args.isNull(4) ? null : (float) args.getDouble(4);

                if (animated) {
                    parent.smoothScrollToPosition(index, options);
                } else {
                    parent.scrollToPosition(index, options);
                }
                return;
            }


            case COMMAND_LAYOUT_MANAGER:
                setLayoutManager(parent, args);
                return;

            case COMMAND_INVERTED:
                boolean inverted = args.getBoolean(0);
                parent.setReverse(inverted);
                return;

            default:
                break;
        }
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomBubblingEventTypeConstants() {
        return MapBuilder.<String, Object>builder()
                .put(ScrollEventType.getJSEventName(ScrollEventType.SCROLL), MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onScroll")))
                .put(ItemLoadBottomEvent.EVENT_BOTTOM, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onBottom")))
                .put(ItemLoadChangeEvent.EVENT_LOAD_MORE, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onLoadMore")))
                .put(ContentSizeChangeEvent.EVENT_NAME, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onContentSizeChange")))
                .put(ItemTopEvent.EVENT_TOP, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onTop")))
                .build();
    }

    private void setLayoutManager(RecyclerViewBackedScrollView parent, ReadableArray args) {
        int style = args.getInt(0);
        if (style == LAYOUT_MANAGER_LINEAR) {
            parent.setLayoutManager(new LinearLayoutManager(parent.getContext()));
            if (args.size() > 1) {
                parent.setLoadMoreCount(args.getInt(1));
            }
        } else if (style == LAYOUT_MANAGER_GRID) {
            int spanCount = 1;
            if(args.size() > 1){
                spanCount = args.getInt(1);
            }
            parent.setLayoutManager(new GridLayoutManager(parent.getContext(), spanCount));
            if (args.size() > 2) {
                parent.setLoadMoreCount(args.getInt(2));
            }
        } else if (style == LAYOUT_MANAGER_STAGGERED) {
            int spanCount = 1;
            if(args.size() > 1){
                spanCount = args.getInt(1);
            }
            StaggeredGridLayoutManager layoutManager = new StaggeredGridLayoutManager(spanCount, StaggeredGridLayoutManager.VERTICAL);
            layoutManager.setGapStrategy(StaggeredGridLayoutManager.GAP_HANDLING_NONE);//瀑布流刷新头部空白问题
            parent.setLayoutManager(layoutManager);
            if (args.size() > 2) {
                parent.setLoadMoreCount(args.getInt(2));
            }
        }
    }
}
