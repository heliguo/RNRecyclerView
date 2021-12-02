package com.library.rnrecyclerview;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;

public class RecyclerViewHeaderViewManager extends ViewGroupManager<RecyclerViewHeaderView> {
    private static final String REACT_CLASS = "RecyclerViewHeaderView";

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected RecyclerViewHeaderView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new RecyclerViewHeaderView(reactContext);
    }

}
