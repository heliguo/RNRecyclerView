package com.library.rnrecyclerview.event;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.RCTEventEmitter;

/**
 * 用于提前加载更多
 */
public class ItemTopEvent extends Event<ItemTopEvent> {

    public static final String EVENT_TOP = "top";

    public ItemTopEvent(int viewTag) {
        super(viewTag);
    }

    @Override
    public String getEventName() {
        return EVENT_TOP;
    }

    @Override
    public void dispatch(RCTEventEmitter rctEventEmitter) {
        rctEventEmitter.receiveEvent(getViewTag(), EVENT_TOP, Arguments.createMap());
    }
}
