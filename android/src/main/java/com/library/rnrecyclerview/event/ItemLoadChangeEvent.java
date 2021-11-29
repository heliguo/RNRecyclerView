package com.library.rnrecyclerview.event;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.RCTEventEmitter;

/**
 * 用于提前加载更多
 */
public class ItemLoadChangeEvent extends Event<ItemLoadChangeEvent> {

    public static final String EVENT_LOAD_MORE = "loadMore";

    public ItemLoadChangeEvent(int viewTag){
        super(viewTag);
    }

    @Override
    public String getEventName() {
        return EVENT_LOAD_MORE;
    }

    @Override
    public void dispatch(RCTEventEmitter rctEventEmitter) {
        rctEventEmitter.receiveEvent(getViewTag(), EVENT_LOAD_MORE, Arguments.createMap());
    }
}
