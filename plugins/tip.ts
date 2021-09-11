import { DefineElementManager, Directive, Element, Expression, Model, Module, ModuleFactory, NEvent, Util } from "nodom";
import { pluginBase } from "./pluginBase";
/**
 * tip 插件
 */


/**
 * tip 接口
 */
export interface ITip {
    /**
     * tip 内容
     */
    content: string;
    /**
     * 显示时间，默认3000
     */
    time?: number;
    /**
     * 手动关闭，如果为true，time无效
     */
    allowClose?: boolean;
    /**
     * 排它，显示时，需要关闭该区域其它tip
     */
    exclusive?: boolean;
}

/**
 * tip 管理器
 * 此管理器作为全局插件，绑定到根模块
 * 
 */
class UITip extends pluginBase {
    tagName: string = 'UI-TIP';

    /**
     * 附加数据项名
     */
    extraDataName: string;
    /**
     * 是否需要检查tip列表
     */
    needCheck: boolean = false;

    /**
     * 一共四个tip容器，分为上右下左
     */
    containers = {
        top: undefined,
        right: undefined,
        bottom: undefined,
        left: undefined
    }

    constructor(element: Element, parent?: Element) {
        super(element);
        this.generate(element);
        element.tagName = 'div';
        element.defineEl = this;
        this.element = element;
    }

    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    private generate(rootDom: Element) {
        rootDom.tagName = 'div';
        this.extraDataName = '$ui_tip_manager';

        rootDom.setProp('name', this.extraDataName);

        //绑定model
        new Directive('model', this.extraDataName, rootDom);
        for (let loc of ['top', 'right', 'bottom', 'left']) {
            let ct: Element = new Element('div');
            //增加css class
            ct.addClass('nd-tip nd-tip-' + loc);
            // 添加孩子节点 
            ct.add(this.createTipDom(loc));
            rootDom.add(ct);
        }
    }

    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(dom: Element, module: Module) {
        super.beforeRender(dom, module);
        if (this.needPreRender) {
            let model: Model = module.model;
            //构建tip数据模型
            if (!model[this.extraDataName]) {
                model[this.extraDataName] = {
                    top: [],
                    left: [],
                    bottom: [],
                    right: []
                };
                // this.modelId = mdl.id;
            }
        }
    }


    /**
     * 创建tip节点
     * @param close 
     */
    private createTipDom(loc: string) {
        let me = this;
        let dom: Element = new Element('div');
        dom.addDirective(new Directive('repeat', loc, dom));
        dom.setProp('class', new Expression("'nd-tip-item nd-box-' + theme"), true);
        let close: Element = new Element('b');
        close.addClass('nd-tip-close');
        close.addDirective(new Directive('show', 'allowClose', close));
        close.addEvent(new NEvent('click', (dom, module, e) => {
            //设置关闭
            dom.model["close"] = true;
            //检查
            me.check(true);
        }));

        let contentDom: Element = new Element('div');
        contentDom.addClass('nd-tip-content');
        let icon: Element = new Element('b');
        icon.setProp('class', new Expression("'nd-icon-' + icon"), true);
        new Directive('show', 'icon', icon);

        let txt: Element = new Element();
        txt.expressions = [new Expression('content')];
        contentDom.children = [txt];
        dom.children = [icon, contentDom, close];
        return dom;
    }

    /**
     * 检查tip列表并结束tip
     * @param force 启用check
     */
    private check(force?: boolean) {
        let me = this;

        if (force) {
            this.needCheck = true;
        }
        // || !this.modelId
        if (!this.needCheck) {
            return;
        }
        let needCheck: boolean = false;
        let model: Model = ModuleFactory.getMain().model;
        let ct: number = new Date().getTime();

        for (let loc of ['top', 'right', 'bottom', 'left']) {
            let data = model[this.extraDataName][loc];
            for (let i = 0; i < data.length; i++) {
                let d = data[i];
                if (d.close || !d.allowClose && d.start + d.time <= ct) {
                    data.splice(i--, 1);
                } else if (!d.allowClose && d.start + d.time > ct) {
                    needCheck = true;
                }
            }
        }
        this.needCheck = needCheck;
        if (this.needCheck) {
            setTimeout(() => { me.check(); }, 100);
        }
    }

    /**
     * 显示tip
     * @param config        辅助配置{}
     *          content       显示内容
     *          time        number 显示时间(ms),默认3000
     *          loc         string 显示位置，top right bottom left，默认top
     *          icon        图标名    
     *          allowClose  boolean 是否手动关闭，默认false
     *          exclusive   boolean 排它，即必须关闭同区域的其它tip    
     *          theme       主题 active error warn info
     */
    public show(config: any) {
        if (!Util.isObject(config)) {
            return;
        }

        let model: Model = ModuleFactory.getMain().model[this.extraDataName];
        if (!model) {
            return;
        }
        let loc: string = config.loc || 'top';
        let allowClose: boolean = config.allowClose || false;
        let datas = model[loc];
        let data = {
            content: config.content || 'message',
            time: config.time || 3000,
            start: new Date().getTime(),
            allowClose: allowClose,
            icon: config.icon,
            theme: config.theme || 'black'
        }
        if (config.exclusive) {
            //清空datas
            for (let d of datas) {
                datas.pop();
            }
            //增加data
            datas.push(data);
        } else {
            datas.push(data);
        }
        if (!allowClose) {
            this.check(true);
        }
    }
}
DefineElementManager.add('UI-TIP', {
    init: function (element: Element, parent?: Element) {
        new UITip(element, parent);
    }
});



/**
 * 显示tip
 * @param config        辅助配置{}
 *          content       显示内容
 *          time          number 显示时间(ms),默认3000
 *          loc           string 显示位置，top right bottom left，默认top
 *          allowClose   boolean 是否手动关闭，默认false
 *          exclusive     boolean 排它，即必须关闭同区域的其它tip    
 *          theme       主题 active error warn info
 */
export function tip(config: any) {
    let module: Module = ModuleFactory.getMain();
    if (!module) {
        return null;
    }
    let manager: UITip = <UITip>module.getNPlugin('$ui_tip_manager');
    //新建manager
    if (manager) {
        manager.show(config);
    }
}

