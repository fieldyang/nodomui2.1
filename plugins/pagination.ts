import { DefineElementManager, Directive, Element, Expression, Model, Module, ModuleFactory, NEvent, request, Util } from "nodom";
import { NUITipWords } from "./msg_zh";
import { pluginBase } from "./pluginBase";
import { UISelect } from "./select";
import { UITool } from "./uibase";

interface IUIPagination extends Object {
    /**
 * 总条数字段名
 */
    totalName: string;

    /**
     * 页面大小
     */
    pageSize: number;

    /**
     * 是否显示total
     */
    showTotal: boolean;
    /**
     * 是否显示第几页
     */
    showGo: boolean;

    /**
     * 当前页
     */
    currentPage: number;

    /**
     * 显示页数
     */
    showNum: number;

    /**
     * 页面size列表
     */
    pageSizeData: number[];

    // /**
    //  * 处理后的page size data
    //  */
    // pageSizeDatas: object[];

    /**
     * 双箭头的步幅，默认5
     */
    steps: number;

    /**
     * 数据url
     */
    dataUrl: string;

    /**
     * 请求页号 name
     */
    pageName: string;

    /**
     * 请求 页面大小 name
     */
    sizeName: string;
    /**
     * 请求参数对戏，当dataUrl存在时有效
     */
    params?: object;

    /**
     * 变化事件 方法名或函数，如果为方法名，则属于module的method factory
     */
    onChange?: string | Function;

    /**
     * 请求前执行函数
     */
    onBeforeReq?: string | Function;

    /**
     * 请求返回后响应事件
     */
    onReq?: string | Function;

}


/**
 * 分页插件
 */
export class UIPagination extends pluginBase {
    tagName: string = 'UI-PAGINATION';
    /**
     * 总条数字段名
     */
    private totalName: string;

    /**
     * 页面大小
     */
    private pageSize: number;

    /**
     * 是否显示total
     */
    private showTotal: boolean;
    /**
     * 是否显示第几页
     */
    private showGo: boolean;

    /**
     * 当前页
     */
    private currentPage: number;

    /**
     * 显示页数
     */
    private showNum: number;

    /**
     * 页面size列表
     */
    private pageSizeData: number[];

    /**
     * 处理后的page size data
     */
    private pageSizeDatas: object[];

    /**
     * 双箭头的步幅，默认5
     */
    private steps: number;

    /**
     * 显示的最小页号
     */
    private minPage: number = 0;

    /**
     * 显示的最大页号
     */
    private maxPage: number = 0;


    /**
     * 页面总数
     */
    private pageCount: number = 0;

    /**
     * 数据记录总数
     */
    private recordCount: number = 0;
    /**
     * 数据url
     */
    private dataUrl: string;

    /**
     * 请求页号 name
     */
    private pageName: string;

    /**
     * 请求 页面大小 name
     */
    private sizeName: string;

    /**
     * 请求参数对戏，当dataUrl存在时有效
     */
    private params: object = {};

    /**
     * 变化事件 方法名或函数，如果为方法名，则属于module的method factory
     */
    private onChange: string | Function;

    /**
     * 请求前执行函数
     */
    private onBeforeReq: string | Function;

    /**
     * 请求返回后响应事件
     */
    private onReq: string | Function;

    /**
     * 准备请求
     */
    private readyReq: boolean;

    constructor(params: Element | IUIPagination, parent?: Element) {
        super(params);
        let element = new Element();
        if (params instanceof Element) {
            element = params;
            UITool.handleUIParam(element, this,
                ['totalname', 'pagesize|number', 'currentpage|number', 'showtotal|bool', 'showgo|bool', 'shownum|number', 'sizechange|array|number', 'steps|number', 'dataurl', 'pagename', 'sizename', 'onchange', 'onreq', 'onbeforereq'],
                ['totalName', 'pageSize', 'currentPage', 'showTotal', 'showGo', 'showNum', 'pageSizeData', 'steps', 'dataUrl', 'pageName', 'sizeName', 'onChange', 'onReq', 'onBeforeReq'],
                ['total', 10, 1, null, null, 10, [], 0, '', 'page', 'size', '', '', '']);
        } else {
            Object.keys(params).forEach(key => {
                this[key] = params[key]
            })
        }

        this.generate(element);
        element.tagName = 'div';
        element.defineEl = this;
        this.element = element;
        console.log(element);

    }

    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    private generate(rootDom: Element) {
        let me = this;
        if (me.steps === 0) {
            me.steps = me.pageSize;
        }
        rootDom.addClass('nd-pagination');
        rootDom.children = [];
        this.extraDataName = '$ui_pagination_' + Util.genId();

        //增加附加数据模型
        new Directive('model', this.extraDataName, rootDom);
        //显示共x条
        if (this.showTotal) {
            let totalDom: Element = new Element('div');
            let txt: Element = new Element();
            txt.textContent = NUITipWords.total;
            totalDom.add(txt);
            let span: Element = new Element('span');
            span.addClass('nd-pagination-total');
            txt = new Element();
            txt.expressions = [new Expression('total')];
            span.add(txt);
            totalDom.add(span);
            txt = new Element();
            txt.textContent = NUITipWords.record;
            totalDom.add(txt);
            rootDom.add(totalDom);
        }

        //选择页面大小
        if (this.pageSizeData && this.pageSizeData.length > 0) {
            let datas = [];
            for (let d of this.pageSizeData) {
                datas.push({
                    value: d,
                    text: d + NUITipWords.record + '/' + NUITipWords.page
                });
            }
            this.pageSizeDatas = datas;
            let select = new UISelect({
                dataName: 'pageSize',
                listField: 'sizeData',
                displayField: 'text',
                valueField: 'value',
                parentDataName: this.extraDataName
            });
            rootDom.add(select.element);
        }

        //分页内容
        let pageCt: Element = new Element('div');
        pageCt.addClass('nd-pagination-pagect');
        //左双箭头
        let left1: Element = new Element('b');
        left1.addClass('nd-pagination-leftarrow1');
        new Directive('class', "{'nd-pagination-disable':'btnAllow===1'}", left1);
        pageCt.add(left1);
        //左箭头
        let left: Element = new Element('b');
        left.addClass('nd-pagination-leftarrow');
        new Directive('class', "{'nd-pagination-disable':'btnAllow===1'}", left);
        pageCt.add(left);
        //页面数字
        let page: Element = new Element('span');
        page.addClass('nd-pagination-page');
        new Directive('repeat', 'pages', page);
        new Directive('class', "{'nd-pagination-active':'active'}", page)
        let txt: Element = new Element();
        txt.expressions = [new Expression('no')];
        page.add(txt);
        pageCt.add(page);
        //右箭头
        let right: Element = new Element('b');
        right.addClass('nd-pagination-rightarrow');
        new Directive('class', "{'nd-pagination-disable':'btnAllow===2'}", right);
        pageCt.add(right);
        //右双箭头
        let right1: Element = new Element('b');
        right1.addClass('nd-pagination-rightarrow1');
        new Directive('class', "{'nd-pagination-disable':'btnAllow===2'}", right1);
        pageCt.add(right1);

        rootDom.add(pageCt);

        //页面号点击事件
        page.addEvent(new NEvent('click',
            (dom, module) => {
                let model: Model = dom.model;
                model['pageNo'] = model['no'];
            }
        ));
        left.addEvent(new NEvent('click',
            (dom, module) => {
                if (dom.hasClass('nd-pagination-disable')) {
                    return;
                }
                if (this.currentPage === 1) {
                    return;
                }
                dom.model['pageNo'] = --this.currentPage;
            }
        ));

        right.addEvent(new NEvent('click',
            (dom, module) => {
                if (dom.hasClass('nd-pagination-disable')) {
                    return;
                }
                if (this.currentPage === this.pageCount) {
                    return;
                }
                dom.model['pageNo'] = ++this.currentPage;
            }
        ));

        left1.addEvent(new NEvent('click',
            (dom, module) => {
                if (dom.hasClass('nd-pagination-disable')) {
                    return;
                }
                let page = me.currentPage - me.steps;
                if (page < 1) {
                    page = 1;
                }
                dom.model['pageNo'] = page;
            }
        ));

        right1.addEvent(new NEvent('click',
            (dom, module) => {
                if (dom.hasClass('nd-pagination-disable')) {
                    return;
                }
                let page = me.currentPage + me.steps;
                if (page > this.pageCount) {
                    page = this.pageCount;
                }
                dom.model['pageNo'] = page;
            }
        ));
        //显示第x页及输入框
        if (this.showGo) {
            let goDom: Element = new Element('div');
            goDom.addClass('nd-pagination-go');
            let txt: Element = new Element();
            txt.textContent = NUITipWords.NO;
            goDom.add(txt);
            let input: Element = new Element('input');
            input.setProp('type', 'number');
            input.addDirective(new Directive('field', 'pageNo', input));
            input.setProp('value', new Expression('pageNo'), true);
            goDom.add(input);
            txt = new Element();
            txt.textContent = NUITipWords.page;
            goDom.add(txt);
            rootDom.add(goDom);
        }
    }

    /**
     * 计算最大最小页号
     * @param module 
     * @param steps 
     */
    private cacMinMax(moduleId: number) {
        let module = ModuleFactory.get(moduleId);
        if (!module) {
            module = ModuleFactory.get(this.moduleId);
        }
        let step = this.showNum / 2 | 0;
        this.minPage = this.currentPage - step;
        this.maxPage = this.currentPage + step;
        if (this.minPage < 1) {
            this.minPage = 1;
        }
        if (this.minPage > this.pageCount) {
            this.minPage = this.pageCount;
        }
        if (this.maxPage < 1) {
            this.maxPage = 1;
        }
        if (this.maxPage > this.pageCount) {
            this.maxPage = this.pageCount;
        }
        if (this.pageCount > this.showNum) {
            //补全页码个数为 showNum
            let d = this.maxPage + 1 - this.minPage - this.showNum;
            if (d < 0) {  //数量不够
                if (this.maxPage === this.pageCount) {
                    this.minPage += d;
                } else {
                    this.maxPage -= d;
                }
            } else if (d > 0) { //数量多了
                if (this.maxPage === this.pageCount) {
                    this.minPage += d;
                } else {
                    this.maxPage -= d;
                }
            }
        }
    }

    /**
     * 添加数据项watch
     * @param pmodel    插件外部模型
     * @param model     插件内部模型
     */
    private addWatch(pmodel: Model, model: Model) {
        //增加页面号
        model.$watch('pageNo', (oldVal, newVal) => {
            if (typeof newVal === 'string') {
                newVal = parseInt(newVal);
            }
            if (newVal > this.maxPage) {
                this.currentPage = this.maxPage;
            } else if (newVal < this.minPage) {
                this.currentPage = this.minPage;
            } else {
                //设置当前页
                this.currentPage = newVal;
            }
            this.cacMinMax(model.$moduleId);
            this.changeParams(model.$moduleId);
            this.doChangeEvent(model.$moduleId);
            this.doReq(model.$moduleId);
        });

        //监听页面大小
        model.$watch('pageSize', (oldVal, newVal) => {
            if (typeof newVal === 'string') {
                newVal = parseInt(newVal);
            }
            //设置页面大小
            console.log(111);

            this.pageSize = newVal;
            this.pageCount = Math.ceil(this.recordCount / this.pageSize);
            this.cacMinMax(model.$moduleId);
            this.changeParams(model.$moduleId);
            this.doChangeEvent(model.$moduleId);
            this.doReq(model.$moduleId);
        });

        //监听total
        model.$watch('total', (oldVal, newVal) => {
            let old = this.pageCount;
            this.recordCount = newVal;
            this.pageCount = Math.ceil(this.recordCount / this.pageSize);
            this.cacMinMax(model.$moduleId);
            this.changeParams(model.$moduleId);

            //total修改导致页面减少，且当前页超出最大页
            if (this.currentPage > this.pageCount) {
                model['pageNo'] = this.pageCount;
            }

            //旧页面数为0
            if (this.pageCount > 0 && old === 0) {
                model['pageNo'] = 1;
            }

        });

        // //监听父对象total
        pmodel.$watch(this.totalName, (oldVal, newVal) => {
            if (typeof newVal === 'string') {
                newVal = parseInt(newVal);
            }
            model['total'] = newVal;
        });
    }

    /**
     * 渲染前置方法
     * @param module 
     * @param uidom 
     */
    beforeRender(module: Module, uidom: Element) {
        super.beforeRender(module, uidom);
        this.handleInit(uidom, module);
    }

    /**
     * 改变pagination 参数
     * @param module    模块
     */
    private changeParams(moduleId?: number) {
        let module = ModuleFactory.get(moduleId)
        if (!module) {
            module = ModuleFactory.get(this.moduleId);
        }

        let btnAllow: number = 0;
        //页面号数据数组
        let pageArr = [];

        for (let i = this.minPage; i <= this.maxPage; i++) {
            pageArr.push({
                no: i,
                active: i === this.currentPage ? true : false
            });
        }

        //左箭头失效
        if (this.currentPage === 1) {
            btnAllow = 1;
        } else if (this.currentPage === this.pageCount) { //右箭头失效
            btnAllow = 2;
        }

        let model: Model = module.model[this.extraDataName];
        //设置箭头状态值
        model['btnAllow'] = btnAllow;
        model['pages'] = pageArr;
    }
    /**
     * 只执行一次的初始化
     * @param dom 
     * @param module
     */
    private handleInit(dom: Element, module: Module) {
        if (!this.needPreRender) {
            return;
        }
        let model: Model = module.model;
        let total = model.$query(this.totalName) || 0;
        model[this.extraDataName] = {
            total: total,
            //页面数
            pageNum: 0,
            //页号
            pageNo: 0,
            //页面大小
            pageSize: this.pageSize,
            /**
             * 1 左箭头 双左箭头失效
             * 2 右箭头 双右箭头失效
             */
            btnAllow: 0,
            //显示页号数组，如 [11,12,13,14,15]
            pages: [],
            //页面数数组
            sizeData: this.pageSizeDatas || [10, 20, 30, 50]
        };
        // 把select需要的数据放在model上而不是该插件的model上
        // model['pageSize'] = this.pageSize;
        // model['sizeData'] = this.pageSizeDatas || [10, 20, 30, 50]

        this.pageCount = Math.ceil(total / this.pageSize);
        this.cacMinMax(model.$moduleId);

        //附加数据模型
        this.addWatch(model, model[this.extraDataName]);
        if (this.pageCount > 0 || this.dataUrl !== '') {
            this.setPage(1);
        }
    }

    /**
     * 设置total值
     * @param value     total值 
     */
    public setTotal(value: number) {
        let module: Module = ModuleFactory.get(this.moduleId);
        let model: Model = module.model;
        model[this.extraDataName].total = value;
        this.changeParams(model.$moduleId);
    }

    /**
     * 获取total值
     * @returns     total值
     */
    public getTotal(): number {
        let model: Model = this.getModel();
        if (model !== null) {
            model.$query(this.extraDataName + '.total');
        }
        return 0;
    }

    /**
     * 获取total对应的字段名
     * @returns     total名
     */
    public getTotalName(): string {
        return this.totalName;
    }

    /**
     * 设置页号
     * @param value 页号 
     */
    public setPage(value: number) {
        let model: Model = this.getModel();
        if (model !== null) {
            model[this.extraDataName].pageNo = value;
        }
    }

    /**
     * 获取页号
     * @returns     页号
     */
    public getPage(): number {
        let model: Model = this.getModel();
        if (model !== null) {
            return model.$query(this.extraDataName + '.pageNo');
        }
        return 0;
    }

    /**
     * 设置页号
     * @param value 页面大小
     */
    public setPageSize(value: number) {
        this.pageSize = value;
    }

    /**
     * 获取页面大小
     * @returns     页面大小
     */
    public getPageSize(): number {
        return this.pageSize || 0;
    }

    /**
     * 设置参数值
     * @param name      参数名 或对象，如果为对象，则分别设置值
     * @param value     参数值
     */
    public setParam(name, value) {
        if (typeof name === 'object') {
            for (let p in name) {
                this.params[p] = name[p];
            }
        } else {
            this.params[name] = value;
        }
    }

    /**
     * 获取参数值
     * @param name      参数名 
     * @returns         参数值
     */
    public getParam(name: string): any {
        return this.params[name];
    }

    /**
     * 移除属性
     * @param name  参数名或参数名数组 
     */
    public removeParam(name: string | string[]) {
        if (Array.isArray(name)) {
            for (let n of name) {
                delete this.params[n];
            }
        } else {
            delete this.params[name];
        }
    }
    /**
     * 请求数据
     */
    public doReq(moduleId?: number) {
        let module = ModuleFactory.get(moduleId)
        if (this.readyReq || this.dataUrl === '') {
            return;
        }
        //设置待请求标志，避免重复请求
        this.readyReq = true;
        if (!module) {
            module = ModuleFactory.get(this.moduleId);
        }

        this.doBeforeReqEvent(module);

        //复制参数
        let params = Util.clone(this.params);
        params[this.pageName] = this.currentPage;
        params[this.sizeName] = this.pageSize;
        setTimeout(() => {
            //延迟处理
            request({
                url: this.dataUrl,
                // params: params,
                type: 'json'
            }).then(r => {
                this.readyReq = false;
                if (!r) {
                    return;
                }
                if (r.total) {
                    this.setTotal(r.total);
                } else if (Array.isArray(r)) { //无total且结果为数组，则设置total为数组长度
                    this.setTotal(r.length);
                }
                this.doReqEvent(r, module);
            });
        }, 0);
    }

    /**
     * 执行change事件
     * @param module    模块
     */
    private doChangeEvent(moduleId?: number) {
        let module = ModuleFactory.get(moduleId);
        if (this.onChange === '') {
            return;
        }
        if (!module) {
            module = ModuleFactory.get(this.moduleId);
        }
        let foo: Function;
        if (typeof this.onChange === 'string') {
            this.onChange = module.getMethod(this.onChange);
            foo = this.onChange;
        } else if (Util.isFunction(this.onChange)) {
            foo = this.onChange;
        }
        if (foo) {
            foo.apply(this, [module, this.currentPage, this.pageSize]);
        }
    }

    /**
     * 执行请求后事件
     * @param data 
     * @param module 
     */
    private doReqEvent(data: any, module?: Module) {
        if (this.onReq === '') {
            return;
        }
        if (!module) {
            module = ModuleFactory.get(this.moduleId);
        }
        // onReq事件
        let foo: Function;
        if (typeof this.onReq === 'string') {
            this.onReq = module.getMethod(this.onReq);
            foo = this.onReq;
        } else if (Util.isFunction(this.onReq)) {
            foo = this.onReq;
        }
        if (foo) {
            foo.apply(this, [module, data]);
        }
    }

    /**
     * 执行请求后事件
     * @param module 
     */
    private doBeforeReqEvent(module?: Module) {
        if (this.onBeforeReq === '') {
            return;
        }
        if (!module) {
            module = ModuleFactory.get(this.moduleId);
        }
        // onReq事件
        let foo: Function;
        if (typeof this.onBeforeReq === 'string') {
            this.onBeforeReq = module.getMethod(this.onBeforeReq);
            foo = this.onBeforeReq;
        } else if (Util.isFunction(this.onReq)) {
            foo = this.onBeforeReq;
        }
        if (foo) {
            foo.apply(this, [module, this]);
        }
    }
}

DefineElementManager.add('UI-PAGINATION', {
    init: function (element: Element, parent?: Element) {
        new UIPagination(element, parent);
    }
});
