import { Element } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";
/**
 * 联动下拉框
 * 待写...
 */
class UILinkSelect extends pluginBase {
    /**
     * 标签名
     */
    tagName: string = 'UI-LINKSELECT';

    /**
     * 额外数据名
     */
    extraDataName: string;

    /**
     * select绑定的数据字段名
     */
    dataName: string;

    /**
     * 列表数据名
     */
    listField: string;

    /**
     * 列表值数据name
     */
    valueField: string;

    /**
     * 显示内容
     */
    displayField: string;

    /**
     * select 附加数据项modelId
     */
    extraModelId: number;

    /**
     * 下拉框key
     */
    listKey: string;

    /**
     * 过滤器方法id
     */
    filterMethodId: string;

    /**
     * 值
     */
    value: string;

    /**
     * 绑定数据项
     */
    fieldName: string;


    /**
     * 数据源
     */
    dataUrl: string;

    flag: boolean = false;

    /**
     * 资源状态防止重复请求数据
     */
    resourceState: boolean = true;

    /**
     * 初始化字段项名
     */
    initialName: string = null;

    constructor(element: Element, parent?: Element) {
        super(element);
        UITool.handleUIParam(element, this,
            ['valuefield', 'displayfield', 'listfield', 'fieldname', 'dataurl', 'name', 'initialname|string'],
            ['valueField', 'displayField', 'listField', 'fieldName', 'dataUrl', 'name', 'initialName'],
            [null, null, null, null, null, '', null]
        );

        this.generate(element);
        element.tagName = 'div';
        element.setProp('name', this.name);
        element.defineEl = this;
        this.element = element;

    }
    /**
     * 
     * @param rootDom 产生第一级下拉框
     */
    protected generate(rootDom: nodom.Element) {




    };


    /**
     * 渲染前事件
     * @param module 
     * @param dom 
     */
    beforeRender(module: nodom.Module, dom: nodom.Element) {
        module.addPlugin(this.name, this);
    };

    /**渲染后事件 */
    afterRender(module, dom) {
        let me = this;
        let model = module.model;

    }


}

nodom.PluginManager.add('UI-LINKSELECT', UILinkSelect)
