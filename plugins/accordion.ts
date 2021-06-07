import { DefineElementManager, Directive, Element, Expression, Model, NEvent } from "nodom";
import { pluginBase } from "./pluginBase";

/** 如果需要new的方式新建 可以参考下面
   let ui = new UIAccordion({
            active1: 'active',
            active2: 'a1',
            field1: 'levels',
            field2: 'rows',
            dispalyName1: 'title',
            dispalyName2: 'name',
            iconName1: 'icon',
            iconName2: 'icon',
            itemclick: "clickItem",
        })
 */
interface IUIAccordionCfg extends Object {
    /**
    * 第一级字段名
    */
    active1: string;
    /**
     * 第二级字段名
     */
    active2: string;
    /**
     * 第一级数据字段名
     */
    field1: string;
    /**
     * 第二级数据字段名
     */
    field2: string;
    /**
     * 一级字段显示的名字
     */
    dispalyName1: string;
    /**
     * 二级字段显示的名字
     */
    dispalyName2: string;

    /**
    * 一级菜单图标名
    */
    iconName1?: string;
    /**
     * 二级菜单图标名
     */
    iconName2?: string;
    /**
    * itemclick 事件
    */
    itemclick?: string
    /**
    * 样式名称
    */
    className?: string

}

/**
 * 手风琴插件
 */
export class UIAccordion extends pluginBase {
    tagName: string = 'UI-ACCORDION';
    /**
     * 第一级字段名
     */
    active1: string;
    /**
     * 第二级字段名
     */
    active2: string;
    /**
     * 第一级事件名
     */

    method1: string;
    /**
     * 第一级事件名
     */
    method2: string;

    /**
     * 第一级数据字段名
     */
    field1: string;
    /**
     * 第二级数据字段名
     */
    field2: string;
    /**
     * 一级字段显示的名字
     */
    dispalyName1: string;
    /**
     * 二级字段显示的名字
     */
    dispalyName2: string;

    /**
     * 一级菜单图标名
     */
    iconName1: string;
    /**
     * 二级菜单图标名
     */
    iconName2: string;

    /**
     * itemclick 事件
     */
    itemclick: string

    /**
     * 样式名称
     */
    className: string

    constructor(params: Element | IUIAccordionCfg, parent?: Element) {
        super(params);
        let rootDom = new Element();
        if (params instanceof Element) {
            // 传入的是Element对象，则按照这个Element来生成插件
            rootDom = params;
            this.generate(rootDom, true);
        } else {
            // 传入的是配置对象，那么按照配置对象来生成插件
            Object.keys(params).forEach(key => {
                this[key] = params[key]
            })
            this.generate(rootDom, false);
        }
        rootDom.tagName = 'div';
        rootDom.defineEl = this;
        this.element = rootDom;
    }

    /**
     * 生成插件的内容
     * @param rootDom 插件产生的虚拟dom
     * @param genMode 生成虚拟dom的方式，true:ast编译的模板的方式，false:传入配置对象的方式
     */
    private generate(rootDom: Element, genMode: boolean) {
        let me = this;
        rootDom.addClass('nd-accordion');
        let firstDom: Element = new Element();
        let secondDom: Element = new Element();
        firstDom.tagName = 'DIV';
        secondDom.tagName = 'DIV';
        firstDom.addClass('nd-accordion-item');
        if (genMode === false) {
            // 希望通过new 传入配置对象的方式来生成插件
            // 绑定传入对象的className
            rootDom.addClass(this.className);
            // 添加repeat指令
            // 第一级的容器
            let firstDiv = new Element('div');
            new Directive('repeat', this.field1, firstDom);
            firstDiv.addClass('nd-accordion-first');
            // 添加事件
            firstDiv.addEvent(new NEvent('click', function (dom, module, e) {
                let pmodel: Model = me.model;
                let data = pmodel[me.field1];
                //选中字段名
                let f: string = me.active1;
                //取消之前选中
                for (let d of data) {
                    if (d[f] === true) {
                        d[f] = false;
                    }
                }
                dom.model[f] = true;

            }));
            // 生成span
            let span = new Element('span');
            if (this.iconName1 != '') {
                // 如果由icon则加一个b标签放在icon里面
                let b = new Element('b');
                let ra: Array<any> = ['n', 'd', '-', 'i', 'c', 'o', 'n', '-'];
                let exp = new Expression(this.iconName1);
                ra.push(exp);
                b.setProp('class', ra, true);
                span.add(b);
            }
            //  一级标题
            let txt = new Element();
            txt.expressions.push(new Expression(this.dispalyName1));
            span.add(txt);
            firstDiv.add(span);
            // 右边的展开标签
            let icon: Element = new Element('b');
            icon.addClass('nd-accordion-icon nd-icon-right');
            new Directive('class', "{'nd-accordion-open':'" + this.active1 + "'}", icon);
            firstDiv.add(icon);

            // 二级容器
            let secondDiv = new Element('div');
            secondDiv.addClass('nd-accordion-secondct');
            let a = new Element('a');
            new Directive('repeat', this.field2, a);
            a.addClass("nd-accordion-second");
            // 添加点击事件
            if (this.itemclick != '') {
                a.addEvent(new NEvent('click', this.itemclick));
            }
            a.addEvent(new NEvent('click', function (dom, module, e) {
                let pmodel: Model = me.model;
                let data = pmodel[me.field1];
                //选中字段名
                let f: string = me.active2;
                //取消之前选中
                for (let d of data) {
                    for (let d1 of d[me.field2]) {
                        if (d1[f] === true) {
                            d1[f] = false;
                        }
                    }
                }
                dom.model[f] = true;
            }));

            new Directive('class', "{'nd-accordion-selected':'" + this.active2 + "'}", a);
            if (this.iconName2 != '') {
                // 如果由icon则加一个b标签放在icon里面
                let b = new Element('b');
                let ra: Array<any> = ['n', 'd', '-', 'i', 'c', 'o', 'n', '-'];
                let exp = new Expression(this.iconName2);
                ra.push(exp);
                b.setProp('class', ra, true);
                a.add(b);
            }
            txt = new Element();
            txt.expressions.push(new Expression(this.dispalyName2));
            a.add(txt);
            new Directive('class', "{'nd-accordion-hide':'!" + this.active1 + "'}", secondDiv);
            secondDiv.add(a);
            firstDom.add(firstDiv);
            firstDom.add(secondDiv);
            rootDom.children = [firstDom];
        } else {
            // 正常通过编译ast的到插件

            //第一级active field name
            let activeName1: string;
            //第二级active field name
            let activeName2: string;


            for (let i = 0; i < rootDom.children.length; i++) {
                let item = rootDom.children[i];
                if (!item.tagName) {
                    continue;
                }
                if (item.hasProp('first')) {
                    //添加repeat指令
                    new Directive('repeat', item.getProp('data'), firstDom);
                    item.addClass('nd-accordion-first');
                    //增加事件
                    item.addEvent(new NEvent('click', function (dom, module, e) {
                        let pmodel: Model = me.model;
                        let data = pmodel[me.field1];
                        //选中字段名
                        let f: string = me.active1;
                        //取消之前选中
                        for (let d of data) {
                            if (d[f] === true) {
                                d[f] = false;
                            }
                        }
                        dom.model[f] = true;

                    }));

                    activeName1 = item.getProp('activename') || 'active';
                    //存激活field name
                    this.active1 = activeName1;

                    firstDom.add(item);

                    //替换children
                    let span = new Element('span');
                    span.children = item.children;
                    item.children = [span];
                    //图标
                    if (item.hasProp('icon')) {
                        span.addClass('nd-icon-' + item.getProp('icon'));
                    }
                    //保存第一级field
                    this.field1 = item.getProp('data');
                    //展开图标
                    let icon: Element = new Element('b');
                    icon.addClass('nd-accordion-icon nd-icon-right');
                    new Directive('class', "{'nd-accordion-open':'" + activeName1 + "'}", icon);
                    item.add(icon);
                    item.delProp(['activename', 'first']);
                } else if (item.hasProp('second')) {
                    activeName2 = item.getProp('activename') || 'active';
                    //存激活field name
                    this.active2 = activeName2;
                    item.addDirective(new Directive('repeat', item.getProp('data'), item));
                    //保存第二级field
                    this.field2 = item.getProp('data');
                    item.addClass('nd-accordion-second');
                    if (item.hasProp('itemclick')) {
                        item.addEvent(new NEvent('click', item.getProp('itemclick')));
                    }
                    new Directive('class', "{'nd-accordion-selected':'" + activeName2 + "'}", item);
                    secondDom.addClass('nd-accordion-secondct');
                    secondDom.add(item);
                    new Directive('class', "{'nd-accordion-hide':'!" + activeName1 + "'}", secondDom);
                }
                item.delProp(['data', 'second']);
            }
            firstDom.add(secondDom);
            rootDom.children = [firstDom];
        }
    }
}

DefineElementManager.add('UI-ACCORDION', {
    init: function (element: Element, parent: Element) {
        new UIAccordion(element, parent);
    }
});
