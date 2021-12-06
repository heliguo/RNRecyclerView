export default class DataSource {
    constructor(data: any, keyExtractor: any);
    _data: any;
    _keyExtractor: any;
    _listeners: any[];
    push(item: any): void;
    unshift(item: any): void;
    splice(start: any, deleteCount: any, ...items: any[]): void;
    size(): any;
    moveUp(index: any): void;
    moveDown(index: any): void;
    set(index: any, item: any): void;
    setDirty(): void;
    position(item: any): any;
    get(index: any): any;
    getKey(item: any, index: any): any;
    _addListener(listener: any): void;
    _removeListener(listener: any): void;
}
