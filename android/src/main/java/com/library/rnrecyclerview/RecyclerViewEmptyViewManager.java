package com.library.rnrecyclerview;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;

public class RecyclerViewEmptyViewManager extends ViewGroupManager<RecyclerViewEmptyView> {
    private static final String REACT_CLASS = "RecyclerViewEmptyView";

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected RecyclerViewEmptyView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new RecyclerViewEmptyView(reactContext);
    }

}
