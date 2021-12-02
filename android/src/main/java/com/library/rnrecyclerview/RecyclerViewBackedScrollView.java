package com.library.rnrecyclerview;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.PointF;
import android.util.DisplayMetrics;
import android.view.ContextThemeWrapper;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.DefaultItemAnimator;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.LinearSmoothScroller;
import androidx.recyclerview.widget.RecyclerView;
import androidx.recyclerview.widget.StaggeredGridLayoutManager;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.common.annotations.VisibleForTesting;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.events.NativeGestureUtil;
import com.facebook.react.views.scroll.OnScrollDispatchHelper;
import com.facebook.react.views.scroll.ScrollEvent;
import com.facebook.react.views.scroll.ScrollEventType;
import com.facebook.react.views.scroll.VelocityHelper;
import com.library.rnrecyclerview.R;
import com.library.rnrecyclerview.event.ItemLoadBottomEvent;
import com.library.rnrecyclerview.event.ItemLoadChangeEvent;
import com.library.rnrecyclerview.event.ItemTopEvent;
import com.library.rnrecyclerview.event.VisibleItemsChangeEvent;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Wraps {@link RecyclerView} providing interface similar to `ScrollView.js` where each children
 * will be rendered as a separate {@link RecyclerView} row.
 * <p>
 * Currently supports only vertically positioned item. Views will not be automatically recycled but
 * they will be detached from native view hierarchy when scrolled offscreen.
 * <p>
 * It works by storing all child views in an array within adapter and binding appropriate views to
 * rows when requested.
 */
@VisibleForTesting
public class RecyclerViewBackedScrollView extends RecyclerView {


    private final OnScrollDispatchHelper mOnScrollDispatchHelper = new OnScrollDispatchHelper();
    private final VelocityHelper mVelocityHelper = new VelocityHelper();
    private OnScrollListener onScrollListener;

    /**
     * 最后count条数据以及到底的回调
     *
     * @param count 从倒数第几条数据开始load more
     */
    public void setLoadMoreCount(int count) {
        UIManagerModule nativeModule = getReactContext().getNativeModule(UIManagerModule.class);
        if (nativeModule == null) {
            return;
        }
        if (onScrollListener != null) {
            this.removeOnScrollListener(onScrollListener);
            onScrollListener = null;
        }
        onScrollListener = new OnScrollListener() {
            @Override
            public void onScrolled(@NonNull RecyclerView recyclerView, int dx, int dy) {
                super.onScrolled(recyclerView, dx, dy);
                if (getAdapter() == null) {
                    return;
                }
                LayoutManager layoutManager = recyclerView.getLayoutManager();
                int lastPosition = 0;
                int lastPositionMax = 0;
                int itemCount = getAdapter().getItemCount();
                if (layoutManager instanceof LinearLayoutManager) {
                    lastPositionMax = lastPosition = ((LinearLayoutManager) layoutManager).findLastCompletelyVisibleItemPosition();//完全到底
                } else if (layoutManager instanceof StaggeredGridLayoutManager) {
                    int[] positions = ((StaggeredGridLayoutManager) layoutManager).findLastCompletelyVisibleItemPositions(null);//完全到底
                    lastPosition = lastPosition(positions);
                    lastPositionMax = maxLastPosition(positions);


                    int[] ints = ((StaggeredGridLayoutManager) layoutManager).findFirstCompletelyVisibleItemPositions(null);
                    if (recyclerView.getScrollState() == RecyclerView.SCROLL_STATE_IDLE && firstPosition(ints) == 0) {
                        nativeModule.getEventDispatcher()
                                .dispatchEvent(new ItemTopEvent(getId()));
                    }
                }
                if (lastPositionMax == -1 || lastPosition == -1) {
                    return;
                }
                if (dy > 0 && lastPosition >= itemCount - 1 - count && count > 0 && lastPositionMax != itemCount - 1) {
                    nativeModule.getEventDispatcher()
                            .dispatchEvent(new ItemLoadChangeEvent(getId()));
                }
                if (lastPositionMax == itemCount - 1 && dy > 0) {
                    nativeModule.getEventDispatcher()
                            .dispatchEvent(new ItemLoadBottomEvent(getId()));
                }


            }

        };
        this.addOnScrollListener(onScrollListener);
    }

    static class ScrollOptions {
        @Nullable
        Float millisecondsPerInch;
        @Nullable
        Float viewPosition;
        @Nullable
        Float viewOffset;
    }

    /**
     * Simple implementation of {@link ViewHolder} as it's an abstract class. The only thing we need
     * to hold in this implementation is the reference to {@link RecyclableWrapperViewGroup} that
     * is already stored by default.
     */
    private static class ConcreteViewHolder extends ViewHolder {
        public ConcreteViewHolder(View itemView) {
            super(itemView);
        }
    }

    /**
     * View that is going to be used as a cell in {@link RecyclerView}. It's going to be reusable and
     * we will remove/attach views for a certain positions based on the {@code mViews} array stored
     * in the adapter class.
     * <p>
     * This method overrides {@link #onMeasure} and delegates measurements to the child view that has
     * been attached to. This is because instances of {@link RecyclableWrapperViewGroup} are created
     * outside of {@link } and their layout is not managed by that manager
     * as opposed to all the other react-native views. Instead we use dimensions of the child view
     * (dimensions has been set in layouting process) so that size of this view match the size of
     * the view it wraps.
     */
    @SuppressLint("ViewConstructor")
    static class RecyclableWrapperViewGroup extends ViewGroup {

        private final ReactListAdapter mAdapter;
        private int mLastMeasuredWidth;
        private int mLastMeasuredHeight;
        private boolean fullSize;

        public RecyclableWrapperViewGroup(Context context, ReactListAdapter adapter) {
            this(context, adapter, false);
        }

        public RecyclableWrapperViewGroup(Context context, ReactListAdapter adapter, boolean full) {
            super(context);
            mAdapter = adapter;
            mLastMeasuredHeight = 10;
            mLastMeasuredWidth = 10;
            fullSize = full;
            setClickable(true);
        }

        private final OnLayoutChangeListener mChildLayoutChangeListener = (v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom) -> {
            int oldHeight = (oldBottom - oldTop);
            int newHeight = (bottom - top);

            if (oldHeight != newHeight) {
                if (getParent() != null) {
                    requestLayout();
                    getParent().requestLayout();
                }
            }
        };

        @Override
        protected void onLayout(boolean changed, int l, int t, int r, int b) {
            // This view will only have one child that is managed by the `NativeViewHierarchyManager` and
            // its position and dimensions are set separately. We don't need to handle its layouting here
        }

        @Override
        public void onViewAdded(View child) {
            super.onViewAdded(child);
            child.addOnLayoutChangeListener(mChildLayoutChangeListener);
        }

        @Override
        public void onViewRemoved(View child) {
            super.onViewRemoved(child);
            child.removeOnLayoutChangeListener(mChildLayoutChangeListener);
        }

        @Override
        protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
            // We override measure spec and use dimensions of the children. Children is a view added
            // from the adapter and always have a correct dimensions specified as they are calculated
            // and set with NativeViewHierarchyManager.
            // In case there is no view attached, we use the last measured dimensions.

            if (getChildCount() > 0) {
                View child = getChildAt(0);
                mLastMeasuredWidth = child.getMeasuredWidth();
                mLastMeasuredHeight = child.getMeasuredHeight();
            }
            int spanCount = 1;
            if (getParent() instanceof RecyclerViewBackedScrollView) {
                RecyclerViewBackedScrollView parent = (RecyclerViewBackedScrollView) getParent();
                LayoutManager layoutManager = parent.getLayoutManager();

                if (layoutManager instanceof StaggeredGridLayoutManager) {
                    spanCount = ((StaggeredGridLayoutManager) layoutManager).getSpanCount();
                } else if (layoutManager instanceof GridLayoutManager) {
                    spanCount = ((GridLayoutManager) layoutManager).getSpanCount();
                }
            }
            if (fullSize) {
                spanCount = 1;
            }
            setMeasuredDimension(mLastMeasuredWidth / spanCount, mLastMeasuredHeight);
        }

        public ReactListAdapter getAdapter() {
            return mAdapter;
        }

        @SuppressLint("ClickableViewAccessibility")
        @Override
        public boolean onTouchEvent(MotionEvent event) {
            // Similarly to ReactViewGroup, we return true.
            // In this case it is necessary in order to force the RecyclerView to intercept the touch events,
            // in this way we can exactly know when the drag starts because "onInterceptTouchEvent"
            // of the RecyclerView will return true.
            return true;
        }
    }

    @Override
    public void setLayoutManager(@Nullable LayoutManager layout) {
        super.setLayoutManager(layout);
        if (layout instanceof GridLayoutManager) {
            GridLayoutManager gridLayoutManager = (GridLayoutManager) layout;
            final int spanCount = gridLayoutManager.getSpanCount();
            gridLayoutManager.setSpanSizeLookup(new GridLayoutManager.SpanSizeLookup() {
                @Override
                public int getSpanSize(int position) {
                    if (getAdapter() instanceof ReactListAdapter) {
                        BaseView baseView = ((ReactListAdapter) getAdapter()).getView(position);
                        if (!(baseView instanceof RecyclerViewItemView)) {
                            return spanCount;
                        }
                    }

                    return 1;
                }
            });
        }
    }

    static class ReactListAdapter extends RecyclerView.Adapter<ConcreteViewHolder> {

        private final List<BaseView> mViews = new ArrayList<>();
        private int mItemCount = 0;

        public ReactListAdapter() {

        }

        public void addView(BaseView child, int index) {
            mViews.add(index, child);
            notifyItemChanged(index);
        }

        public void removeViewAt(int index) {
            BaseView child = mViews.get(index);
            if (child != null) {
                mViews.remove(index);
            }
        }

        public int getViewCount() {
            return mViews.size();
        }


        @NonNull
        @Override
        public ConcreteViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            if (viewType == 0)
                return new ConcreteViewHolder(new RecyclableWrapperViewGroup(parent.getContext(), this));
            else
                return new ConcreteViewHolder(new RecyclableWrapperViewGroup(parent.getContext(), this, true));
        }

        @Override
        public void onBindViewHolder(ConcreteViewHolder holder, int position) {
            RecyclableWrapperViewGroup vg = (RecyclableWrapperViewGroup) holder.itemView;
            View row = getView(position);
            if (row != null && row.getParent() != vg) {
                if (row.getParent() != null) {
                    ((ViewGroup) row.getParent()).removeView(row);
                }
                vg.addView(row, 0);
            }

        }

        @Override
        public int getItemViewType(int position) {
            BaseView baseView = getView(position);
            if (baseView instanceof RecyclerViewEmptyView) {
                return 1;
            } else if (baseView instanceof RecyclerViewHeaderView) {
                return 2;
            } else if (baseView instanceof RecyclerViewFooterView) {
                return 3;
            }
            return 0;
        }

        @Override
        public void onViewRecycled(@NonNull ConcreteViewHolder holder) {
            super.onViewRecycled(holder);
            ((RecyclableWrapperViewGroup) holder.itemView).removeAllViews();
        }

        @Override
        public int getItemCount() {
            return mItemCount;
        }

        public void setItemCount(int itemCount) {
            this.mItemCount = itemCount;
        }

        public BaseView getView(int index) {
            return mViews.get(index);
        }
    }

    private boolean mDragging;
    private int mFirstVisibleIndex, mLastVisibleIndex;

    @Override
    protected void onScrollChanged(int l, int t, int oldl, int oldt) {
        super.onScrollChanged(l, t, oldl, oldt);
        UIManagerModule nativeModule = getReactContext().getNativeModule(UIManagerModule.class);
        if (nativeModule == null) {
            return;
        }
        if (mOnScrollDispatchHelper.onScrollChanged(l, t)) {
            nativeModule.getEventDispatcher()
                    .dispatchEvent(ScrollEvent.obtain(
                            getId(),
                            ScrollEventType.SCROLL,
                            0, /* offsetX = 0, horizontal scrolling only */
                            computeVerticalScrollOffset(),
                            mOnScrollDispatchHelper.getXFlingVelocity(),
                            mOnScrollDispatchHelper.getYFlingVelocity(),
                            getWidth(),
                            computeVerticalScrollRange(),
                            getWidth(),
                            getHeight()));
        }
        LayoutManager layoutManager = getLayoutManager();
        int firstIndex = 0;
        int lastIndex = 0;
        if (layoutManager instanceof LinearLayoutManager) {
            ((LinearLayoutManager) layoutManager).findFirstVisibleItemPosition();
        } else if (layoutManager instanceof StaggeredGridLayoutManager) {
            int[] pos = ((StaggeredGridLayoutManager) getLayoutManager()).findLastVisibleItemPositions(null);
            lastIndex = maxLastPosition(pos);
        }
        if (firstIndex != mFirstVisibleIndex || lastIndex != mLastVisibleIndex) {
            nativeModule.getEventDispatcher()
                    .dispatchEvent(new VisibleItemsChangeEvent(
                            getId(),
                            firstIndex,
                            lastIndex));

            mFirstVisibleIndex = firstIndex;
            mLastVisibleIndex = lastIndex;
        }
    }

    private int firstPosition(int[] pos) {
        if (pos == null) {
            return -1;
        }
        if (pos.length == 1) {
            return pos[0];
        }
        int min = pos[0];
        for (int i = 1; i < pos.length; i++) {
            min = Math.min(min, pos[i]);
        }
        return min;
    }

    private int maxLastPosition(int[] pos) {
        if (pos == null) {
            return -1;
        }
        if (pos.length == 1) {
            return pos[0];
        }
        int max = pos[0];
        for (int i = 1; i < pos.length; i++) {
            max = Math.max(max, pos[i]);
        }
        return max;
    }

    private int lastPosition(int[] pos) {
        if (pos == null) {
            return -1;
        }
        if (pos.length == 1) {
            return pos[0];
        }
        int min = pos[0];
        for (int i = 1; i < pos.length; i++) {
            min = Math.min(min, pos[i]);
        }
        return min;
    }

    private ReactContext getReactContext() {
        return (ReactContext) ((ContextThemeWrapper) getContext()).getBaseContext();
    }

    public RecyclerViewBackedScrollView(Context context) {
        super(new ContextThemeWrapper(context, R.style.ScrollbarRecyclerView));
        setAdapter(new ReactListAdapter());
    }

    void addViewToAdapter(BaseView child, int index) {
        Adapter<?> adapter = getAdapter();
        if (adapter instanceof ReactListAdapter) {
            ((ReactListAdapter) adapter).addView(child, index);
        }
    }

    void removeViewFromAdapter(int index) {
        Adapter<?> adapter = getAdapter();
        if (adapter instanceof ReactListAdapter) {
            ((ReactListAdapter) adapter).removeViewAt(index);
        }
    }

    View getChildAtFromAdapter(int index) {
        Adapter<?> adapter = getAdapter();
        if (adapter instanceof ReactListAdapter) {
            return ((ReactListAdapter) adapter).getView(index);
        }
        return null;

    }

    int getChildCountFromAdapter() {
        Adapter<?> adapter = getAdapter();
        if (adapter instanceof ReactListAdapter) {
            return ((ReactListAdapter) adapter).getViewCount();
        }
        return 0;
    }

    void setItemCount(int itemCount) {
        Adapter<?> adapter = getAdapter();
        if (adapter instanceof ReactListAdapter) {
            ((ReactListAdapter) adapter).setItemCount(itemCount);
        }
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        if (super.onInterceptTouchEvent(ev)) {
            NativeGestureUtil.notifyNativeGestureStarted(this, ev);
            mDragging = true;
            UIManagerModule nativeModule = getReactContext().getNativeModule(UIManagerModule.class);
            if (nativeModule == null) {
                return false;
            }
            nativeModule.getEventDispatcher()
                    .dispatchEvent(ScrollEvent.obtain(
                            getId(),
                            ScrollEventType.BEGIN_DRAG,
                            0, /* offsetX = 0, horizontal scrolling only */
                            computeVerticalScrollOffset(),
                            0, // xVelocity
                            0, // yVelocity
                            getWidth(),
                            computeVerticalScrollRange(),
                            getWidth(),
                            getHeight()));
            return true;
        }

        return false;
    }

    @SuppressLint("ClickableViewAccessibility")
    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        int action = ev.getAction() & MotionEvent.ACTION_MASK;
        if (action == MotionEvent.ACTION_UP && mDragging) {
            mDragging = false;
            mVelocityHelper.calculateVelocity(ev);
            UIManagerModule nativeModule = getReactContext().getNativeModule(UIManagerModule.class);
            if (nativeModule != null) {
                nativeModule.getEventDispatcher()
                        .dispatchEvent(ScrollEvent.obtain(
                                getId(),
                                ScrollEventType.END_DRAG,
                                0, /* offsetX = 0, horizontal scrolling only */
                                computeVerticalScrollOffset(),
                                mVelocityHelper.getXVelocity(),
                                mVelocityHelper.getYVelocity(),
                                getWidth(),
                                computeVerticalScrollRange(),
                                getWidth(),
                                getHeight()));
            }
        }
        return super.onTouchEvent(ev);
    }

    private boolean mRequestedLayout = false;

    @SuppressLint("WrongCall")
    @Override
    public void requestLayout() {
        super.requestLayout();
        if (mRequestedLayout) {
            return;
        }
        mRequestedLayout = true;
        this.post(() -> {
            measure(MeasureSpec.makeMeasureSpec(getWidth(), MeasureSpec.EXACTLY),
                    MeasureSpec.makeMeasureSpec(getHeight(), MeasureSpec.EXACTLY));
            onLayout(false, getLeft(), getTop(), getRight(), getBottom());
            mRequestedLayout = false;
        });
    }

    @Override
    public void scrollToPosition(int position) {
        this.scrollToPosition(position, new ScrollOptions());
    }

    public void scrollToPosition(final int position, final ScrollOptions options) {
        if (options.viewPosition != null) {
            final LayoutManager layoutManager = getLayoutManager();
            if (layoutManager == null) return;
            final ReactListAdapter adapter = (ReactListAdapter) getAdapter();
            if (adapter == null) {
                return;
            }
            final View view = adapter.getView(position);
            if (view != null) {
                final int viewHeight = view.getHeight();

                // In order to calculate the correct offset, we need the height of the target view.
                // If the height of the view is not available it means RN has not calculated it yet.
                // So let's listen to the layout change and we will retry scrolling.
                if (viewHeight == 0) {
                    view.addOnLayoutChangeListener(new View.OnLayoutChangeListener() {
                        @Override
                        public void onLayoutChange(View v, int left, int top, int right, int bottom, int oldLeft, int oldTop, int oldRight, int oldBottom) {
                            view.removeOnLayoutChangeListener(this);
                            scrollToPosition(position, options);
                        }
                    });
                    return;
                }

                final int boxStart = layoutManager.getPaddingTop();
                final int boxEnd = layoutManager.getHeight() - layoutManager.getPaddingBottom();
                final int boxHeight = boxEnd - boxStart;
                float viewOffset = options.viewOffset != null ? PixelUtil.toPixelFromDIP(options.viewOffset) : 0;
                int offset = (int) ((boxHeight - viewHeight) * options.viewPosition + viewOffset);
                if (layoutManager instanceof LinearLayoutManager) {
                    ((LinearLayoutManager) layoutManager).scrollToPositionWithOffset(position, offset);
                } else if (layoutManager instanceof StaggeredGridLayoutManager) {
                    ((StaggeredGridLayoutManager) layoutManager).scrollToPositionWithOffset(position, offset);
                }
                return;
            }
        }

        super.scrollToPosition(position);
    }

    @Override
    public void smoothScrollToPosition(int position) {
        this.smoothScrollToPosition(position, new ScrollOptions());
    }

    public void smoothScrollToPosition(int position, final ScrollOptions options) {
        final RecyclerView.SmoothScroller smoothScroller = new LinearSmoothScroller(this.getContext()) {
            @Override
            protected int getVerticalSnapPreference() {
                return LinearSmoothScroller.SNAP_TO_START;
            }

            @Override
            public PointF computeScrollVectorForPosition(int targetPosition) {
                LayoutManager layoutManager = getLayoutManager();
                PointF pointF = null;
                if (layoutManager instanceof LinearLayoutManager) {
                    pointF = ((LinearLayoutManager) layoutManager).computeScrollVectorForPosition(targetPosition);
                } else if (layoutManager instanceof StaggeredGridLayoutManager) {
                    pointF = ((StaggeredGridLayoutManager) layoutManager).computeScrollVectorForPosition(targetPosition);
                }
                return pointF;
            }

            @Override
            protected float calculateSpeedPerPixel(DisplayMetrics displayMetrics) {
                if (options.millisecondsPerInch != null) {
                    return options.millisecondsPerInch / displayMetrics.densityDpi;
                } else {
                    return super.calculateSpeedPerPixel(displayMetrics);
                }
            }

            @Override
            public int calculateDtToFit(int viewStart, int viewEnd, int boxStart, int boxEnd, int snapPreference) {
                if (options.viewPosition != null) {
                    int viewHeight = viewEnd - viewStart;
                    int boxHeight = boxEnd - boxStart;
                    float viewOffset = options.viewOffset != null ? PixelUtil.toPixelFromDIP(options.viewOffset) : 0;
                    float target = boxStart + (boxHeight - viewHeight) * options.viewPosition + viewOffset;
                    return (int) (target - viewStart);
                } else {
                    return super.calculateDtToFit(viewStart, viewEnd, boxStart, boxEnd, snapPreference);
                }
            }
        };

        smoothScroller.setTargetPosition(position);
        Objects.requireNonNull(this.getLayoutManager()).startSmoothScroll(smoothScroller);
    }

    /**
     * 反转布局
     * @param inverted
     */
    public void setReverse(boolean inverted) {
        LayoutManager layoutManager = getLayoutManager();
        if (layoutManager instanceof LinearLayoutManager) {
            ((LinearLayoutManager) layoutManager).setReverseLayout(inverted);
        } else if (layoutManager instanceof StaggeredGridLayoutManager) {
            ((StaggeredGridLayoutManager) layoutManager).setReverseLayout(inverted);
        }

    }

    /**
     * 动画
     * @param enabled
     */
    public void setItemAnimatorEnabled(boolean enabled) {
        if (enabled) {
            DefaultItemAnimator animator = new DefaultItemAnimator();
            animator.setSupportsChangeAnimations(false);
            setItemAnimator(animator);
        } else {
            setItemAnimator(null);
        }
    }
}
