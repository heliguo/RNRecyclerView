package com.library.rnrecyclerview;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;

public class RecyclerViewFooterViewManager extends ViewGroupManager<RecyclerViewFooterView> {

    private static final String REACT_CLASS = "RecyclerViewFooterView";

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected RecyclerViewFooterView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new RecyclerViewFooterView(reactContext);
    }

}
