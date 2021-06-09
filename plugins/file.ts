import { DefineElementManager, Directive, Element, Expression, Model, Module, NEvent, request, Util } from "nodom";
import { NUITipWords } from "./msg_zh";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";

/**
 *         let ui = new UIFile({
            dataName: 'files',
            displayField: 'fileName',
            urlField: 'url',
            uploadName: 'file',
            valueField: 'id',
            uploadUrl: 'http://localhost:3000/upload'
        })
 */

/** 多文件
 * let ui = new UIFile({
    dataName: 'photos',
    displayField: 'fileName',
    urlField: 'url',
    uploadName: 'file',
    valueField: 'id',
    uploadUrl: 'http://localhost:3000/upload',
    multiple: true,
    fileType: "image",
    maxCount: 5
})
 */


interface IUIFile extends Object {
    /**
    * 绑定字段名
    */
    dataName: string;

    /**
     * 保存给dataName的值，一般是两个如'id,url',给dataName的值格式是{id:**,url:**}或[{id:**,url:**},...](multiple 方式)
     */
    valueField: string;

    /**
     * url字段名
     */
    urlField: string;

    /**
     * 用于显示的字段(必须属于returnFields)
     */
    displayField: string;
    /**
     * 上传url
     */
    uploadUrl: string;
    /**
     * 上传名，默认 file
     */
    uploadName: string;

    /**
     * 上传类型，如果为image，上传成功后显示缩略图，否则显示文件名
     */
    fileType?: string;

    /**
     * 可上传文件数量
     */
    maxCount?: number;

    /**
     * 删除url
     */
    deleteUrl?: string;

    /**
 * 支持多个文件
 */
    multiple?: boolean;

}


/**
 * checkbox
 */
export class UIFile extends pluginBase {
    tagName: string = 'UI-FILE';
    /**
     * 绑定字段名
     */
    dataName: string;

    /**
     * 支持多个文件
     */
    multiple: boolean;

    /**
     * 保存给dataName的值，一般是两个如'id,url',给dataName的值格式是{id:**,url:**}或[{id:**,url:**},...](multiple 方式)
     */
    valueField: string;

    /**
     * url字段名
     */
    urlField: string;

    /**
     * 用于显示的字段(必须属于returnFields)
     */
    displayField: string;

    /**
     * 上传类型，如果为image，上传成功后显示缩略图，否则显示文件名
     */
    fileType?: string;

    /**
     * 可上传文件数量
     */
    maxCount: number = 1;

    /**
     * 上传url
     */
    uploadUrl: string;

    /**
     * 删除url
     */
    deleteUrl: string;

    /**
     * 上传名，默认 file
     */
    uploadName: string;




    constructor(params: Element | IUIFile, parent?: Element) {
        super(params);
        let element = new Element()
        if (params instanceof Element) {
            element = params;
            UITool.handleUIParam(element, this,
                ['valuefield', 'displayfield', 'urlfield', 'multiple|bool', 'filetype', 'maxcount|number', 'uploadurl', 'deleteurl', 'uploadname'],
                ['valueField', 'displayField', 'urlField', 'multiple', 'fileType', 'maxCount', 'uploadUrl', 'deleteUrl', 'uploadName'],
                [null, null, '', null, '', 1, null, '', 'file']);
        } else {
            Object.keys(params).forEach(key => {
                this[key] = params[key]
            })
        }
        this.generate(element);

        element.tagName = 'span';
        element.defineEl = this;
        this.element = element;
    }

    /**
     * 生成插件的内容
     * @param rootDom 插件产生的虚拟dom
     * @param genMode 生成虚拟dom的方式，true:ast编译的模板的方式，false:传入配置对象的方式
     */
    private generate(rootDom: Element) {
        rootDom.addClass('nd-file');
        //附加数据项名
        this.extraDataName = '$ui_file_' + Util.genId();
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
            //移除事件
            rootDom.events.delete('change');
        }

        if (!this.multiple) {
            this.maxCount = 1;
        }
        rootDom.children = [this.genShowDom(), this.genUploadDom()];

    }

    /**
     * 产生上传dom
     * @returns     上传前
     */
    private genShowDom(): Element {
        const me = this;
        //上传容器
        let uploadDom: Element = new Element('div');
        uploadDom.addClass('nd-file-uploadct');
        //当文件数量==maxcount时不再显示
        new Directive('show', this.dataName + '.length<' + this.maxCount, uploadDom);

        //文件
        let fDom: Element = new Element('input');
        fDom.setProp('type', 'file');
        fDom.addClass('nd-file-input');

        //input file change事件
        fDom.addEvent(new NEvent('change',
            (dom, module, e, el) => {
                if (!el.files) {
                    return;
                }
                //上传标志
                this.model[me.extraDataName].state = 1;
                //上传显示
                this.model[me.extraDataName].uploading = NUITipWords.uploading;
                let form = new FormData();
                for (let f of el.files) {
                    form.append(me.uploadName, f);
                }
                //提交请求
                request({
                    url: me.uploadUrl,
                    method: 'POST',
                    params: form,
                    header: {
                        'Content-Type': 'multipart/form-data'
                    },
                    type: 'json'
                }).then((r) => {
                    //上传显示
                    this.model[me.extraDataName].state = 0;
                    //设置显示数据
                    this.model[me.dataName].push(r);
                }).catch(r => {
                    this.reset(module);
                })
            }
        ));

        //上传框
        let uploadingDom: Element = new Element('div');
        uploadingDom.addClass('nd-file-uploading');
        //上传(+号)
        let span1: Element = new Element('span');
        span1.addClass('nd-file-add');
        new Directive('show', this.extraDataName + '.state==0', span1);
        uploadingDom.add(span1);
        //上传中
        let span2: Element = new Element('span');
        span2.addClass('nd-file-progress');
        new Directive('show', this.extraDataName + '.state==1', span2);
        let txt: Element = new Element();
        txt.expressions = [new Expression((this.extraDataName + '.uploading') || NUITipWords.uploading)];
        span2.add(txt);
        uploadingDom.add(span2);
        uploadDom.add(uploadingDom);
        uploadDom.add(fDom);
        return uploadDom;
    }

    /**
     * 创建显示dom
     * @returns     上传后的显示dom
     */
    private genUploadDom(): Element {
        const me = this;
        //文件显示container
        let ctDom: Element = new Element('div');
        ctDom.addClass('nd-file-showct');
        new Directive('repeat', this.dataName, ctDom);

        //显示框
        let showDom: Element = new Element('a');
        showDom.addClass('nd-file-content');
        showDom.setProp('target', 'blank');
        let expr: Expression;
        if (this.urlField !== '') {
            expr = new Expression(this.urlField);
            showDom.setProp('href', expr, true);
        } else { //图片类型可以直接使用displayfield
            expr = new Expression(this.displayField);
        }

        if (this.fileType === 'image') { //图片
            let img: Element = new Element('img');
            img.setProp('src', expr, true);
            showDom.add(img);
        } else {
            let txt: Element = new Element();
            txt.expressions = [new Expression(this.displayField)];
            showDom.add(txt);
        }
        ctDom.add(showDom);

        //删除按钮
        let delDom: Element = new Element('b');
        delDom.addClass('nd-file-del')
        ctDom.add(delDom);
        //点击删除
        delDom.addEvent(new NEvent('click', (dom, module, e) => {
            let params = {};
            let id = dom.model[me.valueField];
            params[me.valueField] = id;
            if (this.deleteUrl !== '') {  //存在del url，则需要从服务器删除
                request({
                    url: me.deleteUrl,
                    params: params
                }).then((r) => {
                    me.removeFile(module, id);
                });
            } else {
                me.removeFile(module, id);
            }
        }));
        return ctDom;
    }

    /**
     * 删除文件
     * @param module    模块
     * @param id        res id
     */
    private removeFile(module: Module, id: any) {
        let pm: Model = this.model;
        let rows = pm[this.dataName];
        //从上传结果中删除
        if (Array.isArray(rows)) {
            for (let i = 0; i < rows.length; i++) {
                if (rows[i][this.valueField] === id) {
                    rows.splice(i, 1);
                    break;
                }
            }
        }
        pm[this.extraDataName].state = 0;
        pm[this.extraDataName].uploading = false;
    }

    beforeRender(module: Module, dom: Element) {
        super.beforeRender(module, dom);
        if (this.needPreRender) {
            let model = this.model;
            //增加附加model
            if (model) {
                model[this.extraDataName] = {
                    state: 0,
                    uploading: false
                }
            }
        }
    }

    /**
     * 重置初始状态
     * @param module    模块
     */
    public reset(module) {
        let model = this.model;
        //增加附加model
        if (model) {
            model[this.extraDataName] = {
                state: 0,
                uploading: false
            }
        }
    }
}

DefineElementManager.add('UI-FILE', {
    init: function (element: Element, parent?: Element) {
        new UIFile(element, parent)
    }
});
