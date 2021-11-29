package com.library.rnrecyclerview.event;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.RCTEventEmitter;

/**
 * 用于发送到底事件
 */
public class ItemLoadBottomEvent extends Event<ItemLoadBottomEvent> {

    public static final String EVENT_BOTTOM = "bottom";

    public ItemLoadBottomEvent(int viewTag){
        super(viewTag);
    }

    @Override
    public String getEventName() {
        return EVENT_BOTTOM;
    }

    @Override
    public void dispatch(RCTEventEmitter rctEventEmitter) {
        rctEventEmitter.receiveEvent(getViewTag(), EVENT_BOTTOM, Arguments.createMap());
    }
}
