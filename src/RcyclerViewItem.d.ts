export default class RecyclerViewItem {
    static propTypes: {
        style: any;
        itemIndex: any;
        shouldUpdate: any;
        dataSource: any;
        renderItem: any;
    };
    shouldComponentUpdate(nextProps: any): boolean;
    render(): any;
}
