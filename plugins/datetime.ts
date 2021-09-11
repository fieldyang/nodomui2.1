import { Directive, Element, Expression, Model, Module, NEvent, Util } from "nodom";
import { NUITipWords } from "./msg_zh";
import { pluginBase } from "./pluginBase";
import { UIEventRegister, UITool } from "./uibase";
enum DATETYPE {
    DATE = 'date',
    TIME = 'time',
    DATETIME = 'datetime'
}

interface IUIDatetime extends Object {
    year?: number;
    month?: number;
    date?: number;
    hour?: number;
    minute?: number;
    second?: number;
    /**
     * 毫秒
     */
    msecond?: number;

    dataName: string;
    /**
     * 类型 date time datetime
     */
    type: DATETYPE;

    /**
     * 当前日期
     */
    currentDate: Date;

    /**
     * 附加数据项名
     */
    extraDataName: string;

    /**
     * 日期选择器modelId
     */
    pickerModelId: number;

    /**
     * 下拉框key
     */
    listKey: string;

    /**
     * 是否显示ms
     */
    showMs: boolean;
}



/**
 * datetime 插件
 */
class UIDatetime extends pluginBase {
    tagName: string = 'UI-DATETIME';

    year: number;
    month: number;
    date: number;
    hour: number;
    minute: number;
    second: number;
    /**
     * 毫秒
     */
    msecond: number = 0;

    dataName: string;
    /**
     * 类型 date time datetime
     */
    type: string;
    /**
     * 当前日期
     */
    currentDate: Date;
    /**
     * 附加数据项名
     */
    extraDataName: string;

    /**
     * 日期选择器modelId
     */
    pickerModelId: number;

    /**
     * 下拉框key
     */
    listKey: string;

    /**
     * 是否显示ms
     */
    showMs: boolean;


    constructor(element: Element, parent?: Element) {
        super(element);
        UITool.handleUIParam(element, this,
            ['type', 'showms|bool'],
            ['type', 'showMs'],
            ['date', null]);
        this.generate(element);
        element.tagName = 'div';
        element.defineEl = this;
    }

    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    private generate(rootDom: Element) {
        let me = this;
        rootDom.addClass('nd-datetime');

        let fieldDom: Element = new Element('div');
        fieldDom.addClass('nd-datetime-field');
        let dateIco: Element = new Element('b');
        dateIco.addClass(this.type === 'time' ? 'nd-datetime-time' : 'nd-datetime-date');

        let directive: Directive = rootDom.getDirective('field');
        if (directive) {
            this.dataName = directive.value;
            rootDom.removeDirectives(['field']);
        }
        //给input增加field指令和value 表达式
        let input: Element = new Element('input');
        if (this.dataName) {
            input.addDirective(new Directive('field', this.dataName, input));
            input.setProp('value', new Expression(this.dataName), true);
        }

        fieldDom.add(input);
        fieldDom.add(dateIco);
        //点击事件
        fieldDom.addEvent(new NEvent('click', (dom, module, e, el) => {
            me.showPicker(dom, module, e, el);
        }));

        this.extraDataName = '$ui_datetime_' + Util.genId();

        let pickerDom: Element = new Element('div');
        pickerDom.addClass('nd-datetime-picker');
        pickerDom.addDirective(new Directive('model', this.extraDataName, pickerDom));
        pickerDom.addDirective(new Directive('show', 'show', pickerDom));

        //日期和时间容器
        let tblCt: Element = new Element('div');
        tblCt.addClass('nd-datetime-tbl');
        pickerDom.add(tblCt);
        //日期面板
        if (this.type === 'date' || this.type === 'datetime') {
            tblCt.add(this.genDatePicker());
        }
        //时间面板
        if (this.type === 'time' || this.type === 'datetime') {
            tblCt.add(this.genTimePicker());
        }

        //按钮
        let btnCt: Element = new Element('div');
        btnCt.addClass('nd-datetime-btnct');

        if (this.type === 'date') {
            //当天按钮
            let btnToday: Element = new Element('button');
            btnToday.assets.set('innerHTML', NUITipWords.buttons.today);
            btnToday.addEvent(new NEvent('click', (dom, module, e) => {
                e.preventDefault();
                let nda: Date = new Date();
                me.setValue(module, nda.getFullYear() + '-' + (nda.getMonth() + 1) + '-' + nda.getDate());
            }));
            btnCt.add(btnToday);
        } else if (this.type === 'datetime' || this.type === 'time') {
            //此刻按钮
            let btn: Element = new Element('button');
            btn.assets.set('innerHTML', NUITipWords.buttons.now);
            btn.addEvent(new NEvent('click', (dom, module, e) => {
                e.preventDefault();
                let nda: Date = new Date();
                let value = nda.getFullYear() + '-' + (nda.getMonth() + 1) + '-' + nda.getDate() + ' '
                    + nda.getHours() + ':' + nda.getMinutes() + ':' + nda.getSeconds();
                if (this.showMs) {
                    value += '.' + nda.getMilliseconds();
                }
                me.setValue(module, value);
            }));
            btnCt.add(btn);
        }

        let btnOk: Element = new Element('button');
        btnOk.addClass('nd-btn-active');
        btnOk.assets.set('innerHTML', NUITipWords.buttons.ok);
        btnCt.add(btnOk);

        //确定按钮
        btnOk.addEvent(new NEvent('click', (dom, module, e) => {
            e.preventDefault();
            dom.model['show'] = false;
            let pmodel: Model = module.model;
            pmodel[this.dataName] = me.genValueStr();
        }));

        pickerDom.add(btnCt);
        rootDom.children = [fieldDom, pickerDom];
    }


    /**
     * 渲染前置方法
     * @param module 
     * @param uidom 
     */
    beforeRender(uidom: Element,module: Module) {
        let me = this;
        super.beforeRender(module, uidom);
        this.listKey = uidom.children[1].key;
        let model: Model = uidom.model;
        if (this.needPreRender) {
            //设置附加数据项
            model[this.extraDataName] = {
                show: false,
                year: 2020,
                month: 1,
                date: 1,
                hour: 0,
                minute: 0,
                second: 0,
                time: '00:00:00',
                days: []
            };

            this.pickerModelId = model[this.extraDataName].id;

            if (this.type === 'date') {
                this.genDates(module);
            } else if (this.type === 'time') {
                this.genTimes(module);
            } else {
                this.genDates(module);
                this.genTimes(module);
            }
            //增加外部点击隐藏
            UIEventRegister.addEvent('click', module.id, uidom.children[1].key, (module, dom, inOrOut, e) => {
                if (!inOrOut) {
                    model[me.extraDataName].show = false;
                }
            });

        } else {
            this.pickerModelId = model[this.extraDataName].id;
        }
    }

    /**
     * 生成datepicker
     */
    genDatePicker(): Element {
        let me = this;
        let pickerDom: Element = new Element('div');
        pickerDom.addClass('nd-datetime-datetbl');
        //年月
        let ymDom: Element = new Element('div');
        ymDom.addClass('nd-datetime-ymct');
        pickerDom.add(ymDom);

        let leftDom1: Element = new Element('b');
        leftDom1.addClass('nd-datetime-leftarrow1');

        let leftDom: Element = new Element('b');
        leftDom.addClass('nd-datetime-leftarrow');
        let rightDom: Element = new Element('b');
        rightDom.addClass('nd-datetime-rightarrow');
        let rightDom1: Element = new Element('b');
        rightDom1.addClass('nd-datetime-rightarrow1');

        let contentDom: Element = new Element('span');
        contentDom.addClass('nd-datetime-ym');
        let txtDom: Element = new Element();
        txtDom.expressions = [new Expression('year'), '/', new Expression('month')];
        contentDom.add(txtDom);

        leftDom1.addEvent(new NEvent('click', (dom, module) => {
            me.changeMonth(module, -12);
        }));

        leftDom.addEvent(new NEvent('click', (dom, module) => {
            me.changeMonth(module, -1);
        }));

        rightDom.addEvent(new NEvent('click', (dom, module) => {
            me.changeMonth(module, 1);
        }));

        rightDom1.addEvent(new NEvent('click', (dom, module) => {
            me.changeMonth(module, 12);
        }));

        ymDom.children = [leftDom1, leftDom, contentDom, rightDom, rightDom1]

        //周
        let weekDom: Element = new Element('div');
        weekDom.addClass('nd-datetime-weekdays');
        let days: string[] = Object.getOwnPropertyNames(NUITipWords.weekday);

        for (let d of days) {
            let span: Element = new Element('span');
            let txt: Element = new Element();
            txt.textContent = NUITipWords.weekday[d];
            span.add(txt);
            weekDom.add(span);
        }

        pickerDom.add(weekDom);

        let dateDom: Element = new Element('div');
        dateDom.addClass('nd-datetime-dates');
        let daySpan: Element = new Element('span');
        daySpan.addDirective(new Directive('repeat', 'days', daySpan));
        daySpan.addDirective(new Directive('class', "{'nd-datetime-today':'today','nd-datetime-disable':'disable','nd-datetime-selected':'selected'}", daySpan));
        let txt: Element = new Element();
        txt.expressions = [new Expression('date')];
        daySpan.add(txt);

        //日期点击事件
        daySpan.addEvent(new NEvent('click', (dom, module) => {
            let data = dom.model;
            if (data.disable) {
                return;
            }
            me.selectDate(module);
        }));
        dateDom.add(daySpan);
        pickerDom.add(dateDom);
        return pickerDom;
    }

    /**
     * 生成timepicker
     */
    genTimePicker(): Element {
        let me = this;
        let pickerDom: Element = new Element('div');
        pickerDom.addClass('nd-datetime-timetbl');

        let showDom: Element = new Element('input');
        showDom.addClass('nd-datetime-timeinput');
        showDom.setProp('value', new Expression('time'), true);

        pickerDom.add(showDom);

        let itemCt: Element = new Element('div');
        itemCt.addClass('nd-datetime-timect');
        pickerDom.add(itemCt);
        let hourDom: Element = new Element('div');
        let item: Element = new Element('div');
        item.addClass('nd-datetime-timeitem');
        item.addDirective(new Directive('repeat', 'hours', item));
        item.addDirective(new Directive('class', "{'nd-datetime-itemselect':'selected'}", item));
        let txt: Element = new Element();
        txt.expressions = [new Expression('v')];
        item.setProp('role', 'hour');
        item.add(txt);
        hourDom.add(item);

        item.addEvent(new NEvent('click',
            (dom, module, e, el) => {
                me.selectTime(module, dom, model);
            }
        ));

        let minuteDom: Element = hourDom.clone(true);
        let secondDom: Element = hourDom.clone(true);

        minuteDom.children[0].getDirective('repeat').value = 'minutes';
        minuteDom.children[0].setProp('role', 'minute');
        secondDom.children[0].getDirective('repeat').value = 'seconds';
        secondDom.children[0].setProp('role', 'second');
        itemCt.children = [hourDom, minuteDom, secondDom];
        //显示ms
        if (this.showMs) {
            let msDom: Element = hourDom.clone(true);
            msDom.children[0].getDirective('repeat').value = 'mseconds';
            msDom.children[0].setProp('role', 'msecond');
            itemCt.add(msDom);
        }
        return pickerDom;
    }
    /**
     * 产生日期数组
     * @param module    模块
     * @param year      年
     * @param month     月 
     */
    genDates(module: Module, year?: number, month?: number) {
        //获取当日
        let cda: Date = new Date();
        let cy = cda.getFullYear();
        let cm = cda.getMonth() + 1;
        let cd = cda.getDate();
        if (!year || !month) {
            year = cy;
            month = cm;
        }

        let days: number = this.cacMonthDays(year, month);
        let dayArr = [];
        let date = new Date(year + '-' + month + '-1');
        //周几
        let wd = date.getDay();
        let lastMonthDays = this.cacMonthDays(year, month, -1);
        //补充1号对应周前几天日期
        for (let d = lastMonthDays, i = 0; i < wd; i++, d--) {
            dayArr.unshift({
                disable: true,
                selected: false,
                date: d
            });
        }
        //当月日期
        for (let i = 1; i <= days; i++) {
            dayArr.push({
                date: i,
                selected: this.year === year && this.month === month && this.date === i,
                today: cy === year && cm === month && cd === i
            });
        }
        //下月日期
        date = new Date(year + '-' + month + '-' + days);
        //周几
        wd = date.getDay();
        for (let i = wd + 1; i <= 6; i++) {
            dayArr.push({
                disable: true,
                selected: false,
                date: i - wd
            });
        }

        let model: Model = module.getModel(this.pickerModelId);
        model.set('year', year);
        model.set('month', month);
        model.set('days', dayArr);
    }

    /**
     * 生成时间数据
     * @param module 
     */
    genTimes(module: Module) {
        let model: Model = module.getModel(this.pickerModelId);
        let hours = [];
        let minutes = [];
        let seconds = [];
        for (let i = 0; i < 60; i++) {
            let selected: boolean = i === 0 ? true : false;
            if (i < 24) {
                hours.push({
                    v: i < 10 ? '0' + i : i,
                    selected: selected,
                });
            }
            minutes.push({
                v: i < 10 ? '0' + i : i,
                selected: selected
            });
            seconds.push({
                v: i < 10 ? '0' + i : i,
                selected: selected
            });
        }
        model.set('hours', hours);
        model.set('minutes', minutes);
        model.set('seconds', seconds);
        //ms值
        if (this.showMs) {
            let mseconds = [];
            for (let i = 0; i < 999; i++) {
                let v = i + '';
                if (i < 10) {
                    v = '00' + i;
                } else if (i < 100) {
                    v = '0' + i;
                } else {
                    v = i + '';
                }
                mseconds.push({
                    v: v,
                    selected: i === 0 ? true : false
                });
            }
            model.set('mseconds', mseconds);
        }
    }
    /**
     * 计算一个月的天数
     * @param year      年
     * @param month     月
     * @param disMonth  相差月数
     */
    cacMonthDays(year: number, month: number, disMonth?: number): number {
        if (disMonth) {
            month += disMonth;
        }
        if (month <= 0) {
            year--;
            month += 12;
        } else if (month > 12) {
            year++;
            month -= 12;
        }

        if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
            return 31;
        } else if (month !== 2) {
            return 30;
        } else if (year % 400 === 0 || year % 4 === 0 && year % 100 !== 0) {
            return 29;
        } else {
            return 28;
        }
    }

    /**
     * 修改月份
     * @param module 
     * @param distance 
     */
    changeMonth(module: Module, distance: number) {
        let model = module.getModel(this.pickerModelId);
        let year = model.query('year');
        let month = model.query('month');

        month += distance;
        if (month <= 0) {
            year--;
            month += 12;
        } else if (month > 12) {
            year++;
            month -= 12;
        }
        if (month <= 0) {
            year--;
            month += 12;
        } else if (month > 12) {
            year++;
            month -= 12;
        }

        this.genDates(module, year, month);
    }

    /**
     * 设置日期或时间
     * @param module    模块
     * @param str       待设置值
     */
    setValue(module: Module, str: string) {
        if (str && str !== '') {
            str = str.trim();
            if (str === '') {
                return;
            }
            let model: Model = module.getModel(this.modelId);
            if (this.type === 'date' || this.type === 'datetime') {
                let date: Date = new Date(str);
                if (date.toTimeString() !== 'Invalid Date') {
                    this.year = date.getFullYear();
                    this.month = date.getMonth() + 1;
                    this.date = date.getDate();
                    this.genDates(module, this.year, this.month);
                    //datetime 需要设置时间
                    if (this.type === 'datetime') {
                        this.setTime(module, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
                    }
                } else { //日期格式不对，则直接设置插件当前日期时间值
                    model.set(this.dataName, this.genValueStr());
                }
            } else if (this.type === 'time') {
                if (/^\d{1,2}:\d{1,2}(:\d{1,2})?(\.\d{1,3})?$/.test(str)) {
                    let sa: string[] = str.split(':');
                    let h = parseInt(sa[0]);
                    let m = parseInt(sa[1]);
                    let s = 0, ms = 0;
                    if (sa.length > 2) {
                        let a = sa[2].split('.');
                        s = parseInt(a[0]);
                        if (a.length > 1) {
                            ms = parseInt(a[1]);
                        }
                    }
                    this.setTime(module, h, m, s, ms);
                }
            }
        }
    }

    /**
     * 设置时间
     * @param module 
     * @param hour 
     * @param minute 
     * @param second 
     * @param msecond 
     */
    setTime(module: Module, hour: number, minute: number, second: number, msecond?: number) {
        let model1: Model = module.getModel(this.pickerModelId);
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.msecond = msecond;
        model1.set('time', this.genValueStr('time'));
        this.setTimeSelect(module);
    }
    /**
     * 选中日期
     * @param module 
     * @param model     被点击dom绑定的model
     */
    selectDate(module: Module) {
        //把selected的项置false
        let pmodel = module.model[this.pickerModelId];
        if (pmodel) {
            let days = pmodel.query('days');
            for (let d of days) {
                if (d.selected) {
                    d.selected = false;
                    break;
                }
            }
            this.year = pmodel.query('year');
            this.month = pmodel.query('month');
        }
        if (model) {
            model.set('selected', true);
            this.date = model.query('date');
        }
    }

    /**
     * 选中日期
     * @param module 
     * @param dom       dom 节点
     * @param model     被点击dom绑定的model
     
     */
    selectTime(module: Module, dom: Element, model?: any) {
        //把selected的项置false
        let pmodel = dom.model;
        let role = dom.getProp('role');
        if (pmodel) {
            let datas = pmodel[role + 's'];
            for (let d of datas) {
                if (d.selected) {
                    d.selected = false;
                    break;
                }
            }
        }
        if (!model) {
            model = module.getModel(dom.modelId);
        }
        if (model) {
            model.set('selected', true);
        }
        //设置值
        this[role] = parseInt(model.query('v'));
        //设置time显示值
        pmodel.set('time', this.genValueStr('time'));
    }

    /**
     * 初始化并显示picker
     * @param dom       input或inputct
     * @param model     数据模型
     * @param module    模块
     * @param el        当前el
     */
    showPicker(dom: Element, module: Module, e, el: HTMLElement) {
        let data = dom.model[this.extraDataName];
        if (data) {
            if (data.show) {
                return;
            }
            data.show = true;
        }
        //父dom
        let pDom: Element = dom.tagName === 'input' ? dom.getParent(module) : dom;
        this.setValue(module, dom.model[this.dataName]);
        dom.model["show"] = true;
        let height = el.offsetHeight;
        let y = e.clientY + el.offsetHeight - e.offsetY;
        UITool.adjustPosAndSize(module, this.listKey, e.clientX, y, height, null, false);
    }

    /**
     * 设置时间选中
     */
    setTimeSelect(module: Module) {
        let me = this;
        let model: Model = module.getModel(this.pickerModelId);
        let data = [this.hour, this.minute, this.second, this.msecond];
        ['hours', 'minutes', 'seconds', 'mseconds'].forEach((item, i) => {
            let datas = model.query(item);
            if (!datas) {
                return;
            }
            //清除之前选中
            for (let d of datas) {
                if (d.selected) {
                    d.selected = false;
                    break;
                }
            }
            datas[data[i]].selected = true;
        });
        //等待渲染完后执行scroll
        setTimeout(scroll, 0);

        function scroll() {
            let uidom: Element = me.element;
            let timeCt: Element;
            //尚未打开picker
            if (uidom.children.length === 1) {
                setTimeout(scroll, 0);
                return;
            }
            if (me.type === 'datetime') {
                timeCt = uidom.children[1].children[0].children[1].children[1];
            } else if (me.type === 'time') {
                timeCt = uidom.children[1].children[0].children[0].children[1];
            }

            data.forEach((item, i) => {
                let el: HTMLElement = module.getNode(timeCt.children[i].key);
                el.scrollTo(0, data[i] * 30);
            });
        }
    }

    /**
     * 生成日期时间串
     */
    genValueStr(type?: string) {
        if (!this.year) {
            this.year = 2020;
        }
        if (!this.month) {
            this.month = 1;
        }
        if (!this.date) {
            this.date = 1;
        }
        if (!this.hour) {
            this.hour = 0;
        }
        if (!this.minute) {
            this.minute = 0;
        }
        if (!this.second) {
            this.second = 0;
        }

        let retValue;
        switch (type || this.type) {
            case 'datetime':
                retValue = [this.year, this.month < 10 ? '0' + this.month : this.month, this.date < 10 ? '0' + this.date : this.date].join('-') +
                    ' ' +
                    [this.hour < 10 ? '0' + this.hour : this.hour, this.minute < 10 ? '0' + this.minute : this.minute, this.second < 10 ? '0' + this.second : this.second].join(':');
                break;
            case 'time':
                retValue = [this.hour < 10 ? '0' + this.hour : this.hour, this.minute < 10 ? '0' + this.minute : this.minute, this.second < 10 ? '0' + this.second : this.second].join(':');
                break;
            default:
                retValue = [this.year, this.month < 10 ? '0' + this.month : this.month, this.date < 10 ? '0' + this.date : this.date].join('-');
        }
        if (this.showMs && this.type !== 'date') {
            let v;
            if (this.msecond < 10) {
                v = '00' + this.msecond;
            } else if (this.msecond < 100) {
                v = '0' + this.msecond;
            } else {
                v = this.msecond;
            }
            retValue += '.' + v;
        }
        return retValue;
    }
}

PluginManager.add('UI-DATETIME', UIDatetime);
