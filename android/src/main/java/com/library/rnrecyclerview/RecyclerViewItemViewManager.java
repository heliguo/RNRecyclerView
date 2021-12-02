package com.library.rnrecyclerview;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;

public class RecyclerViewItemViewManager extends ViewGroupManager<RecyclerViewItemView> {
    private static final String REACT_CLASS = "RecyclerViewItemView";

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected RecyclerViewItemView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new RecyclerViewItemView(reactContext);
    }

}
