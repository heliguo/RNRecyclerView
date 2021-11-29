package com.library.rnrecyclerview;

import android.content.Context;
import android.view.ViewGroup;
import android.widget.FrameLayout;

public class RecyclerViewItemView extends FrameLayout {

    private int mItemIndex;
    private boolean mItemIndexInitialized;

    public RecyclerViewItemView(Context context) {
        super(context);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
    }

    public void setItemIndex(int itemIndex) {
        if (mItemIndexInitialized && this.mItemIndex != itemIndex) {
            this.mItemIndex = itemIndex;
            if (getParent() != null) {
                ((RecyclerViewBackedScrollView.RecyclableWrapperViewGroup) getParent()).getAdapter().notifyItemChanged(mItemIndex);
                ((RecyclerViewBackedScrollView.RecyclableWrapperViewGroup) getParent()).getAdapter().notifyItemChanged(itemIndex);
            }
        } else {
            this.mItemIndex = itemIndex;
        }

        mItemIndexInitialized = true;
    }

    public int getItemIndex() {
        return mItemIndex;
    }
}
