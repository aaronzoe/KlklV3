﻿/**
 * ag-grid - Advanced Framework Agnostic Javascript Datagrid.
 * @version v3.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
/// <references path='events.ts'/>
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var ColumnChangeEvent = (function () {
            function ColumnChangeEvent(type) {
                this.type = type;
            }
            ColumnChangeEvent.prototype.toString = function () {
                var result = 'ColumnChangeEvent {type: ' + this.type;
                if (this.column) {
                    result += ', column: ' + this.column.getColId();
                }
                if (this.columnGroup) {
                    result += ', columnGroup: ' + this.columnGroup.getColGroupDef() ? this.columnGroup.getColGroupDef().headerName : '(not defined]';
                }
                if (this.fromIndex) {
                    result += ', fromIndex: ' + this.fromIndex;
                }
                if (this.toIndex) {
                    result += ', toIndex: ' + this.toIndex;
                }
                if (this.visible) {
                    result += ', visible: ' + this.visible;
                }
                if (this.pinned) {
                    result += ', visible: ' + this.visible;
                }
                if (typeof this.finished == 'boolean') {
                    result += ', finished: ' + this.finished;
                }
                result += '}';
                return result;
            };
            ColumnChangeEvent.prototype.withPinned = function (pinned) {
                this.pinned = pinned;
                return this;
            };
            ColumnChangeEvent.prototype.withVisible = function (visible) {
                this.visible = visible;
                return this;
            };
            ColumnChangeEvent.prototype.isVisible = function () {
                return this.visible;
            };
            ColumnChangeEvent.prototype.getPinned = function () {
                return this.pinned;
            };
            ColumnChangeEvent.prototype.withColumn = function (column) {
                this.column = column;
                return this;
            };
            ColumnChangeEvent.prototype.withColumns = function (columns) {
                this.columns = columns;
                return this;
            };
            ColumnChangeEvent.prototype.withFinished = function (finished) {
                this.finished = finished;
                return this;
            };
            ColumnChangeEvent.prototype.withColumnGroup = function (columnGroup) {
                this.columnGroup = columnGroup;
                return this;
            };
            ColumnChangeEvent.prototype.withFromIndex = function (fromIndex) {
                this.fromIndex = fromIndex;
                return this;
            };
            ColumnChangeEvent.prototype.withToIndex = function (toIndex) {
                this.toIndex = toIndex;
                return this;
            };
            ColumnChangeEvent.prototype.getFromIndex = function () {
                return this.fromIndex;
            };
            ColumnChangeEvent.prototype.getToIndex = function () {
                return this.toIndex;
            };
            ColumnChangeEvent.prototype.getType = function () {
                return this.type;
            };
            ColumnChangeEvent.prototype.getColumn = function () {
                return this.column;
            };
            ColumnChangeEvent.prototype.getColumns = function () {
                return this.columns;
            };
            ColumnChangeEvent.prototype.getColumnGroup = function () {
                return this.columnGroup;
            };
            ColumnChangeEvent.prototype.isRowGroupChanged = function () {
                return this.type === grid.Events.EVENT_COLUMN_ROW_GROUP_CHANGE || this.type === grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED;
            };
            ColumnChangeEvent.prototype.isValueChanged = function () {
                return this.type === grid.Events.EVENT_COLUMN_VALUE_CHANGE || this.type === grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED;
            };
            ColumnChangeEvent.prototype.isIndividualColumnResized = function () {
                return this.type === grid.Events.EVENT_COLUMN_RESIZED && this.column !== undefined && this.column !== null;
            };
            ColumnChangeEvent.prototype.isFinished = function () {
                return this.finished;
            };
            return ColumnChangeEvent;
        })();
        grid.ColumnChangeEvent = ColumnChangeEvent;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var Constants = (function () {
            function Constants() {
            }
            Constants.STEP_EVERYTHING = 0;
            Constants.STEP_FILTER = 1;
            Constants.STEP_SORT = 2;
            Constants.STEP_MAP = 3;
            Constants.ROW_BUFFER_SIZE = 20;
            Constants.MIN_COL_WIDTH = 10;
            Constants.KEY_TAB = 9;
            Constants.KEY_ENTER = 13;
            Constants.KEY_BACKSPACE = 8;
            Constants.KEY_DELETE = 46;
            Constants.KEY_ESCAPE = 27;
            Constants.KEY_SPACE = 32;
            Constants.KEY_DOWN = 40;
            Constants.KEY_UP = 38;
            Constants.KEY_LEFT = 37;
            Constants.KEY_RIGHT = 39;
            return Constants;
        })();
        grid.Constants = Constants;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid_1) {
        var LINE_SEPARATOR = '\r\n';
        var CsvCreator = (function () {
            function CsvCreator(rowController, columnController, grid, valueService) {
                this.rowController = rowController;
                this.columnController = columnController;
                this.grid = grid;
                this.valueService = valueService;
            }
            CsvCreator.prototype.exportDataAsCsv = function (params) {
                var csvString = this.getDataAsCsv(params);
                var fileNamePresent = params && params.fileName && params.fileName.length !== 0;
                var fileName = fileNamePresent ? params.fileName : 'export.csv';
                // for Excel, we need \ufeff at the start
                // http://stackoverflow.com/questions/17879198/adding-utf-8-bom-to-string-blob
                var blobObject = new Blob(["\ufeff", csvString], {
                    type: "text/csv;charset=utf-8;"
                });
                // Internet Explorer
                if (window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(blobObject, fileName);
                }
                else {
                    // Chrome
                    var downloadLink = document.createElement("a");
                    downloadLink.href = window.URL.createObjectURL(blobObject);
                    downloadLink.download = fileName;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
            };
            CsvCreator.prototype.getDataAsCsv = function (params) {
                var _this = this;
                if (!this.grid.isUsingInMemoryModel()) {
                    console.log('ag-Grid: getDataAsCsv not available when doing virtual pagination');
                    return '';
                }
                var result = '';
                var skipGroups = params && params.skipGroups;
                var skipHeader = params && params.skipHeader;
                var skipFooters = params && params.skipFooters;
                var includeCustomHeader = params && params.customHeader;
                var includeCustomFooter = params && params.customFooter;
                var allColumns = params && params.allColumns;
                var columnSeparator = (params && params.columnSeparator) || ',';
                var columnsToExport;
                if (allColumns) {
                    columnsToExport = this.columnController.getAllColumns();
                }
                else {
                    columnsToExport = this.columnController.getAllDisplayedColumns();
                }
                if (!columnsToExport || columnsToExport.length === 0) {
                    return '';
                }
                if (includeCustomHeader) {
                    result += params.customHeader;
                }
                // first pass, put in the header names of the cols
                if (!skipHeader) {
                    columnsToExport.forEach(function (column, index) {
                        var nameForCol = _this.columnController.getDisplayNameForCol(column);
                        if (nameForCol === null || nameForCol === undefined) {
                            nameForCol = '';
                        }
                        if (index != 0) {
                            result += columnSeparator;
                        }
                        result += '"' + _this.escape(nameForCol) + '"';
                    });
                    result += LINE_SEPARATOR;
                }
                this.rowController.forEachNodeAfterFilterAndSort(function (node) {
                    if (skipGroups && node.group) {
                        return;
                    }
                    if (skipFooters && node.footer) {
                        return;
                    }
                    columnsToExport.forEach(function (column, index) {
                        var valueForCell;
                        if (node.group && index === 0) {
                            valueForCell = _this.createValueForGroupNode(node);
                        }
                        else {
                            valueForCell = _this.valueService.getValue(column.getColDef(), node.data, node);
                        }
                        if (valueForCell === null || valueForCell === undefined) {
                            valueForCell = '';
                        }
                        if (index != 0) {
                            result += columnSeparator;
                        }
                        result += '"' + _this.escape(valueForCell) + '"';
                    });
                    result += LINE_SEPARATOR;
                });
                if (includeCustomFooter) {
                    result += params.customFooter;
                }
                return result;
            };
            CsvCreator.prototype.createValueForGroupNode = function (node) {
                var keys = [node.key];
                while (node.parent) {
                    node = node.parent;
                    keys.push(node.key);
                }
                return keys.reverse().join(' -> ');
            };
            // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
            CsvCreator.prototype.escape = function (value) {
                if (value === null || value === undefined) {
                    return '';
                }
                var stringValue;
                if (typeof value === 'string') {
                    stringValue = value;
                }
                else if (typeof value.toString === 'function') {
                    stringValue = value.toString();
                }
                else {
                    console.warn('known value type during csv conversio');
                    stringValue = '';
                }
                return stringValue.replace(/"/g, "\"\"");
            };
            return CsvCreator;
        })();
        grid_1.CsvCreator = CsvCreator;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var Events = (function () {
            function Events() {
            }
            /** A new set of columns has been entered, everything has potentially changed. */
            Events.EVENT_COLUMN_EVERYTHING_CHANGED = 'columnEverythingChanged';
            /** A row group column was added, removed or order changed. */
            Events.EVENT_COLUMN_ROW_GROUP_CHANGE = 'columnRowGroupChanged';
            /** A value column was added, removed or agg function was changed. */
            Events.EVENT_COLUMN_VALUE_CHANGE = 'columnValueChanged';
            /** A column was moved */
            Events.EVENT_COLUMN_MOVED = 'columnMoved';
            /** One or more columns was shown / hidden */
            Events.EVENT_COLUMN_VISIBLE = 'columnVisible';
            /** One or more columns was pinned / unpinned*/
            Events.EVENT_COLUMN_PINNED = 'columnPinned';
            /** A column group was opened / closed */
            Events.EVENT_COLUMN_GROUP_OPENED = 'columnGroupOpened';
            /** One or more columns was resized. If just one, the column in the event is set. */
            Events.EVENT_COLUMN_RESIZED = 'columnResized';
            Events.EVENT_MODEL_UPDATED = 'modelUpdated';
            Events.EVENT_CELL_CLICKED = 'cellClicked';
            Events.EVENT_CELL_DOUBLE_CLICKED = 'cellDoubleClicked';
            Events.EVENT_CELL_CONTEXT_MENU = 'cellContextMenu';
            Events.EVENT_CELL_VALUE_CHANGED = 'cellValueChanged';
            Events.EVENT_CELL_FOCUSED = 'cellFocused';
            Events.EVENT_ROW_SELECTED = 'rowSelected';
            Events.EVENT_ROW_DESELECTED = 'rowDeselected';
            Events.EVENT_SELECTION_CHANGED = 'selectionChanged';
            Events.EVENT_BEFORE_FILTER_CHANGED = 'beforeFilterChanged';
            Events.EVENT_AFTER_FILTER_CHANGED = 'afterFilterChanged';
            Events.EVENT_FILTER_MODIFIED = 'filterModified';
            Events.EVENT_BEFORE_SORT_CHANGED = 'beforeSortChanged';
            Events.EVENT_AFTER_SORT_CHANGED = 'afterSortChanged';
            Events.EVENT_VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';
            Events.EVENT_ROW_CLICKED = 'rowClicked';
            Events.EVENT_ROW_DOUBLE_CLICKED = 'rowDoubleClicked';
            Events.EVENT_READY = 'ready';
            Events.EVENT_GRID_SIZE_CHANGED = 'gridSizeChanged';
            return Events;
        })();
        grid.Events = Events;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var FUNCTION_STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var FUNCTION_ARGUMENT_NAMES = /([^\s,]+)/g;
        var Utils = (function () {
            function Utils() {
            }
            Utils.iterateObject = function (object, callback) {
                var keys = Object.keys(object);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var value = object[key];
                    callback(key, value);
                }
            };
            Utils.cloneObject = function (object) {
                var copy = {};
                var keys = Object.keys(object);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var value = object[key];
                    copy[key] = value;
                }
                return copy;
            };
            Utils.map = function (array, callback) {
                var result = [];
                for (var i = 0; i < array.length; i++) {
                    var item = array[i];
                    var mappedItem = callback(item);
                    result.push(mappedItem);
                }
                return result;
            };
            Utils.forEach = function (array, callback) {
                if (!array) {
                    return;
                }
                for (var i = 0; i < array.length; i++) {
                    var value = array[i];
                    callback(value, i);
                }
            };
            Utils.filter = function (array, callback) {
                var result = [];
                array.forEach(function (item) {
                    if (callback(item)) {
                        result.push(item);
                    }
                });
                return result;
            };
            Utils.assign = function (object, source) {
                Utils.iterateObject(source, function (key, value) {
                    object[key] = value;
                });
            };
            Utils.getFunctionParameters = function (func) {
                var fnStr = func.toString().replace(FUNCTION_STRIP_COMMENTS, '');
                var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(FUNCTION_ARGUMENT_NAMES);
                if (result === null) {
                    return [];
                }
                else {
                    return result;
                }
            };
            Utils.find = function (collection, predicate, value) {
                if (collection === null || collection === undefined) {
                    return null;
                }
                for (var i = 0; i < collection.length; i++) {
                    if (collection[i][predicate] === value) {
                        return collection[i];
                    }
                }
                return null;
            };
            Utils.toStrings = function (array) {
                return this.map(array, function (item) {
                    if (item === undefined || item === null || !item.toString) {
                        return null;
                    }
                    else {
                        return item.toString();
                    }
                });
            };
            Utils.iterateArray = function (array, callback) {
                for (var index = 0; index < array.length; index++) {
                    var value = array[index];
                    callback(value, index);
                }
            };
            //Returns true if it is a DOM node
            //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
            Utils.isNode = function (o) {
                return (typeof Node === "object" ? o instanceof Node :
                    o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string");
            };
            //Returns true if it is a DOM element
            //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
            Utils.isElement = function (o) {
                return (typeof HTMLElement === "object" ? o instanceof HTMLElement :
                    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string");
            };
            Utils.isNodeOrElement = function (o) {
                return this.isNode(o) || this.isElement(o);
            };
            //adds all type of change listeners to an element, intended to be a text field
            Utils.addChangeListener = function (element, listener) {
                element.addEventListener("changed", listener);
                element.addEventListener("paste", listener);
                element.addEventListener("input", listener);
                // IE doesn't fire changed for special keys (eg delete, backspace), so need to
                // listen for this further ones
                element.addEventListener("keydown", listener);
                element.addEventListener("keyup", listener);
            };
            //if value is undefined, null or blank, returns null, otherwise returns the value
            Utils.makeNull = function (value) {
                if (value === null || value === undefined || value === "") {
                    return null;
                }
                else {
                    return value;
                }
            };
            Utils.removeAllChildren = function (node) {
                if (node) {
                    while (node.hasChildNodes()) {
                        node.removeChild(node.lastChild);
                    }
                }
            };
            Utils.removeElement = function (parent, cssSelector) {
                this.removeFromParent(parent.querySelector(cssSelector));
            };
            Utils.removeFromParent = function (node) {
                if (node && node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            };
            Utils.isVisible = function (element) {
                return (element.offsetParent !== null);
            };
            /**
             * loads the template and returns it as an element. makes up for no simple way in
             * the dom api to load html directly, eg we cannot do this: document.createElement(template)
             */
            Utils.loadTemplate = function (template) {
                var tempDiv = document.createElement("div");
                tempDiv.innerHTML = template;
                return tempDiv.firstChild;
            };
            Utils.querySelectorAll_addCssClass = function (eParent, selector, cssClass) {
                var eRows = eParent.querySelectorAll(selector);
                for (var k = 0; k < eRows.length; k++) {
                    this.addCssClass(eRows[k], cssClass);
                }
            };
            Utils.querySelectorAll_removeCssClass = function (eParent, selector, cssClass) {
                var eRows = eParent.querySelectorAll(selector);
                for (var k = 0; k < eRows.length; k++) {
                    this.removeCssClass(eRows[k], cssClass);
                }
            };
            Utils.querySelectorAll_replaceCssClass = function (eParent, selector, cssClassToRemove, cssClassToAdd) {
                var eRows = eParent.querySelectorAll(selector);
                for (var k = 0; k < eRows.length; k++) {
                    this.removeCssClass(eRows[k], cssClassToRemove);
                    this.addCssClass(eRows[k], cssClassToAdd);
                }
            };
            Utils.addOrRemoveCssClass = function (element, className, addOrRemove) {
                if (addOrRemove) {
                    this.addCssClass(element, className);
                }
                else {
                    this.removeCssClass(element, className);
                }
            };
            Utils.addCssClass = function (element, className) {
                if (element.className && element.className.length > 0) {
                    var cssClasses = element.className.split(' ');
                    if (cssClasses.indexOf(className) < 0) {
                        cssClasses.push(className);
                        element.className = cssClasses.join(' ');
                    }
                }
                else {
                    element.className = className;
                }
            };
            Utils.offsetHeight = function (element) {
                return element && element.clientHeight ? element.clientHeight : 0;
            };
            Utils.offsetWidth = function (element) {
                return element && element.clientWidth ? element.clientWidth : 0;
            };
            Utils.removeCssClass = function (element, className) {
                if (element.className && element.className.length > 0) {
                    var cssClasses = element.className.split(' ');
                    var index = cssClasses.indexOf(className);
                    if (index >= 0) {
                        cssClasses.splice(index, 1);
                        element.className = cssClasses.join(' ');
                    }
                }
            };
            Utils.removeFromArray = function (array, object) {
                if (array.indexOf(object) >= 0) {
                    array.splice(array.indexOf(object), 1);
                }
            };
            Utils.defaultComparator = function (valueA, valueB) {
                var valueAMissing = valueA === null || valueA === undefined;
                var valueBMissing = valueB === null || valueB === undefined;
                if (valueAMissing && valueBMissing) {
                    return 0;
                }
                if (valueAMissing) {
                    return -1;
                }
                if (valueBMissing) {
                    return 1;
                }
                if (valueA < valueB) {
                    return -1;
                }
                else if (valueA > valueB) {
                    return 1;
                }
                else {
                    return 0;
                }
            };
            Utils.formatWidth = function (width) {
                if (typeof width === "number") {
                    return width + "px";
                }
                else {
                    return width;
                }
            };
            /**
             * Tries to use the provided renderer.
             */
            Utils.useRenderer = function (eParent, eRenderer, params) {
                var resultFromRenderer = eRenderer(params);
                //TypeScript type inference magic
                if (typeof resultFromRenderer === 'string') {
                    var eTextSpan = document.createElement('span');
                    eTextSpan.innerHTML = resultFromRenderer;
                    eParent.appendChild(eTextSpan);
                }
                else if (this.isNodeOrElement(resultFromRenderer)) {
                    //a dom node or element was returned, so add child
                    eParent.appendChild(resultFromRenderer);
                }
            };
            /**
             * If icon provided, use this (either a string, or a function callback).
             * if not, then use the second parameter, which is the svgFactory function
             */
            Utils.createIcon = function (iconName, gridOptionsWrapper, column, svgFactoryFunc) {
                var eResult = document.createElement('span');
                eResult.appendChild(this.createIconNoSpan(iconName, gridOptionsWrapper, column, svgFactoryFunc));
                return eResult;
            };
            Utils.createIconNoSpan = function (iconName, gridOptionsWrapper, colDefWrapper, svgFactoryFunc) {
                var userProvidedIcon;
                // check col for icon first
                if (colDefWrapper && colDefWrapper.getColDef().icons) {
                    userProvidedIcon = colDefWrapper.getColDef().icons[iconName];
                }
                // it not in col, try grid options
                if (!userProvidedIcon && gridOptionsWrapper.getIcons()) {
                    userProvidedIcon = gridOptionsWrapper.getIcons()[iconName];
                }
                // now if user provided, use it
                if (userProvidedIcon) {
                    var rendererResult;
                    if (typeof userProvidedIcon === 'function') {
                        rendererResult = userProvidedIcon();
                    }
                    else if (typeof userProvidedIcon === 'string') {
                        rendererResult = userProvidedIcon;
                    }
                    else {
                        throw 'icon from grid options needs to be a string or a function';
                    }
                    if (typeof rendererResult === 'string') {
                        return this.loadTemplate(rendererResult);
                    }
                    else if (this.isNodeOrElement(rendererResult)) {
                        return rendererResult;
                    }
                    else {
                        throw 'iconRenderer should return back a string or a dom object';
                    }
                }
                else {
                    // otherwise we use the built in icon
                    return svgFactoryFunc();
                }
            };
            Utils.addStylesToElement = function (eElement, styles) {
                Object.keys(styles).forEach(function (key) {
                    eElement.style[key] = styles[key];
                });
            };
            Utils.getScrollbarWidth = function () {
                var outer = document.createElement("div");
                outer.style.visibility = "hidden";
                outer.style.width = "100px";
                outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
                document.body.appendChild(outer);
                var widthNoScroll = outer.offsetWidth;
                // force scrollbars
                outer.style.overflow = "scroll";
                // add innerdiv
                var inner = document.createElement("div");
                inner.style.width = "100%";
                outer.appendChild(inner);
                var widthWithScroll = inner.offsetWidth;
                // remove divs
                outer.parentNode.removeChild(outer);
                return widthNoScroll - widthWithScroll;
            };
            Utils.isKeyPressed = function (event, keyToCheck) {
                var pressedKey = event.which || event.keyCode;
                return pressedKey === keyToCheck;
            };
            Utils.setVisible = function (element, visible) {
                if (visible) {
                    element.style.display = 'inline';
                }
                else {
                    element.style.display = 'none';
                }
            };
            Utils.isBrowserIE = function () {
                if (this.isIE === undefined) {
                    this.isIE = false || !!document.documentMode; // At least IE6
                }
                return this.isIE;
            };
            Utils.isBrowserSafari = function () {
                if (this.isSafari === undefined) {
                    this.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
                }
                return this.isSafari;
            };
            return Utils;
        })();
        grid.Utils = Utils;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="utils.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var EventService = (function () {
            function EventService() {
                this.allListeners = {};
                this.globalListeners = [];
            }
            EventService.prototype.init = function (loggerFactory) {
                this.logger = loggerFactory.create('EventService');
            };
            EventService.prototype.getListenerList = function (eventType) {
                var listenerList = this.allListeners[eventType];
                if (!listenerList) {
                    listenerList = [];
                    this.allListeners[eventType] = listenerList;
                }
                return listenerList;
            };
            EventService.prototype.addEventListener = function (eventType, listener) {
                var listenerList = this.getListenerList(eventType);
                if (listenerList.indexOf(listener) < 0) {
                    listenerList.push(listener);
                }
            };
            EventService.prototype.addGlobalListener = function (listener) {
                this.globalListeners.push(listener);
            };
            EventService.prototype.removeEventListener = function (eventType, listener) {
                var listenerList = this.getListenerList(eventType);
                _.removeFromArray(listenerList, listener);
            };
            EventService.prototype.removeGlobalListener = function (listener) {
                _.removeFromArray(this.globalListeners, listener);
            };
            // why do we pass the type here? the type is in ColumnChangeEvent, so unless the
            // type is not in other types of events???
            EventService.prototype.dispatchEvent = function (eventType, event) {
                if (!event) {
                    event = {};
                }
                //this.logger.log('dispatching: ' + event);
                var listenerList = this.getListenerList(eventType);
                listenerList.forEach(function (listener) {
                    listener(event);
                });
                this.globalListeners.forEach(function (listener) {
                    listener(eventType, event);
                });
            };
            return EventService;
        })();
        grid.EventService = EventService;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var ExpressionService = (function () {
            function ExpressionService() {
                this.expressionToFunctionCache = {};
            }
            ExpressionService.prototype.init = function (loggerFactory) {
                this.logger = loggerFactory.create('ExpressionService');
            };
            ExpressionService.prototype.evaluate = function (expression, params) {
                try {
                    var javaScriptFunction = this.createExpressionFunction(expression);
                    var result = javaScriptFunction(params.value, params.context, params.node, params.data, params.colDef, params.rowIndex, params.api, params.getValue);
                    return result;
                }
                catch (e) {
                    // the expression failed, which can happen, as it's the client that
                    // provides the expression. so print a nice message
                    this.logger.log('Processing of the expression failed');
                    this.logger.log('Expression = ' + expression);
                    this.logger.log('Exception = ' + e);
                    return null;
                }
            };
            ExpressionService.prototype.createExpressionFunction = function (expression) {
                // check cache first
                if (this.expressionToFunctionCache[expression]) {
                    return this.expressionToFunctionCache[expression];
                }
                // if not found in cache, return the function
                var functionBody = this.createFunctionBody(expression);
                var theFunction = new Function('x, ctx, node, data, colDef, rowIndex, api, getValue', functionBody);
                // store in cache
                this.expressionToFunctionCache[expression] = theFunction;
                return theFunction;
            };
            ExpressionService.prototype.createFunctionBody = function (expression) {
                // if the expression has the 'return' word in it, then use as is,
                // if not, then wrap it with return and ';' to make a function
                if (expression.indexOf('return') >= 0) {
                    return expression;
                }
                else {
                    return 'return ' + expression + ';';
                }
            };
            return ExpressionService;
        })();
        grid.ExpressionService = ExpressionService;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../entities/rowNode.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var FloatingRowModel = (function () {
            function FloatingRowModel() {
            }
            FloatingRowModel.prototype.init = function (gridOptionsWrapper) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.setFloatingTopRowData(gridOptionsWrapper.getFloatingTopRowData());
                this.setFloatingBottomRowData(gridOptionsWrapper.getFloatingBottomRowData());
            };
            FloatingRowModel.prototype.setFloatingTopRowData = function (rowData) {
                this.floatingTopRows = this.createNodesFromData(rowData, false);
            };
            FloatingRowModel.prototype.setFloatingBottomRowData = function (rowData) {
                this.floatingBottomRows = this.createNodesFromData(rowData, false);
            };
            FloatingRowModel.prototype.createNodesFromData = function (allData, isTop) {
                var _this = this;
                var rowNodes = [];
                if (allData) {
                    var nextRowTop = 0;
                    allData.forEach(function (dataItem) {
                        var rowNode = {
                            data: dataItem,
                            floating: true,
                            floatingTop: isTop,
                            floatingBottom: !isTop,
                            rowTop: nextRowTop,
                            rowHeight: null
                        };
                        rowNode.rowHeight = _this.gridOptionsWrapper.getRowHeightForNode(rowNode);
                        nextRowTop += rowNode.rowHeight;
                        rowNodes.push(rowNode);
                    });
                }
                return rowNodes;
            };
            FloatingRowModel.prototype.getFloatingTopRowData = function () {
                return this.floatingTopRows;
            };
            FloatingRowModel.prototype.getFloatingBottomRowData = function () {
                return this.floatingBottomRows;
            };
            FloatingRowModel.prototype.getFloatingTopTotalHeight = function () {
                return this.getTotalHeight(this.floatingTopRows);
            };
            FloatingRowModel.prototype.getFloatingBottomTotalHeight = function () {
                return this.getTotalHeight(this.floatingBottomRows);
            };
            FloatingRowModel.prototype.getTotalHeight = function (rowNodes) {
                if (!rowNodes || rowNodes.length === 0) {
                    return 0;
                }
                else {
                    var lastNode = rowNodes[rowNodes.length - 1];
                    return lastNode.rowTop + lastNode.rowHeight;
                }
            };
            return FloatingRowModel;
        })();
        grid.FloatingRowModel = FloatingRowModel;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="constants.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var DEFAULT_ROW_HEIGHT = 25;
        var constants = grid.Constants;
        function isTrue(value) {
            return value === true || value === 'true';
        }
        var GridOptionsWrapper = (function () {
            function GridOptionsWrapper() {
            }
            GridOptionsWrapper.prototype.init = function (gridOptions, eventService) {
                this.gridOptions = gridOptions;
                this.headerHeight = gridOptions.headerHeight;
                eventService.addGlobalListener(this.globalEventHandler.bind(this));
                this.checkForDeprecated();
            };
            GridOptionsWrapper.prototype.isRowSelection = function () { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; };
            GridOptionsWrapper.prototype.isRowDeselection = function () { return isTrue(this.gridOptions.rowDeselection); };
            GridOptionsWrapper.prototype.isRowSelectionMulti = function () { return this.gridOptions.rowSelection === 'multiple'; };
            GridOptionsWrapper.prototype.getContext = function () { return this.gridOptions.context; };
            GridOptionsWrapper.prototype.isVirtualPaging = function () { return isTrue(this.gridOptions.virtualPaging); };
            GridOptionsWrapper.prototype.isShowToolPanel = function () { return isTrue(this.gridOptions.showToolPanel); };
            GridOptionsWrapper.prototype.isToolPanelSuppressGroups = function () { return isTrue(this.gridOptions.toolPanelSuppressGroups); };
            GridOptionsWrapper.prototype.isToolPanelSuppressValues = function () { return isTrue(this.gridOptions.toolPanelSuppressValues); };
            GridOptionsWrapper.prototype.isRowsAlreadyGrouped = function () { return isTrue(this.gridOptions.rowsAlreadyGrouped); };
            GridOptionsWrapper.prototype.isGroupSelectsChildren = function () { return isTrue(this.gridOptions.groupSelectsChildren); };
            GridOptionsWrapper.prototype.isGroupHideGroupColumns = function () { return isTrue(this.gridOptions.groupHideGroupColumns); };
            GridOptionsWrapper.prototype.isGroupIncludeFooter = function () { return isTrue(this.gridOptions.groupIncludeFooter); };
            GridOptionsWrapper.prototype.isGroupSuppressBlankHeader = function () { return isTrue(this.gridOptions.groupSuppressBlankHeader); };
            GridOptionsWrapper.prototype.isSuppressRowClickSelection = function () { return isTrue(this.gridOptions.suppressRowClickSelection); };
            GridOptionsWrapper.prototype.isSuppressCellSelection = function () { return isTrue(this.gridOptions.suppressCellSelection); };
            GridOptionsWrapper.prototype.isSuppressMultiSort = function () { return isTrue(this.gridOptions.suppressMultiSort); };
            GridOptionsWrapper.prototype.isGroupSuppressAutoColumn = function () { return isTrue(this.gridOptions.groupSuppressAutoColumn); };
            GridOptionsWrapper.prototype.isForPrint = function () { return isTrue(this.gridOptions.forPrint); };
            GridOptionsWrapper.prototype.isSuppressHorizontalScroll = function () { return isTrue(this.gridOptions.suppressHorizontalScroll); };
            GridOptionsWrapper.prototype.isSuppressLoadingOverlay = function () { return isTrue(this.gridOptions.suppressLoadingOverlay); };
            GridOptionsWrapper.prototype.isSuppressNoRowsOverlay = function () { return isTrue(this.gridOptions.suppressNoRowsOverlay); };
            GridOptionsWrapper.prototype.getFloatingTopRowData = function () { return this.gridOptions.floatingTopRowData; };
            GridOptionsWrapper.prototype.getFloatingBottomRowData = function () { return this.gridOptions.floatingBottomRowData; };
            GridOptionsWrapper.prototype.isUnSortIcon = function () { return isTrue(this.gridOptions.unSortIcon); };
            GridOptionsWrapper.prototype.isSuppressMenuHide = function () { return isTrue(this.gridOptions.suppressMenuHide); };
            GridOptionsWrapper.prototype.getRowStyle = function () { return this.gridOptions.rowStyle; };
            GridOptionsWrapper.prototype.getRowClass = function () { return this.gridOptions.rowClass; };
            GridOptionsWrapper.prototype.getRowStyleFunc = function () { return this.gridOptions.getRowStyle; };
            GridOptionsWrapper.prototype.getRowClassFunc = function () { return this.gridOptions.getRowClass; };
            GridOptionsWrapper.prototype.getBusinessKeyForNodeFunc = function () { return this.gridOptions.getBusinessKeyForNode; };
            GridOptionsWrapper.prototype.getHeaderCellRenderer = function () { return this.gridOptions.headerCellRenderer; };
            GridOptionsWrapper.prototype.getApi = function () { return this.gridOptions.api; };
            GridOptionsWrapper.prototype.isEnableColResize = function () { return isTrue(this.gridOptions.enableColResize); };
            GridOptionsWrapper.prototype.isSingleClickEdit = function () { return isTrue(this.gridOptions.singleClickEdit); };
            GridOptionsWrapper.prototype.getGroupDefaultExpanded = function () { return this.gridOptions.groupDefaultExpanded; };
            GridOptionsWrapper.prototype.getGroupAggFunction = function () { return this.gridOptions.groupAggFunction; };
            GridOptionsWrapper.prototype.getRowData = function () { return this.gridOptions.rowData; };
            GridOptionsWrapper.prototype.isGroupUseEntireRow = function () { return isTrue(this.gridOptions.groupUseEntireRow); };
            GridOptionsWrapper.prototype.getGroupColumnDef = function () { return this.gridOptions.groupColumnDef; };
            GridOptionsWrapper.prototype.isGroupSuppressRow = function () { return isTrue(this.gridOptions.groupSuppressRow); };
            GridOptionsWrapper.prototype.isAngularCompileRows = function () { return isTrue(this.gridOptions.angularCompileRows); };
            GridOptionsWrapper.prototype.isAngularCompileFilters = function () { return isTrue(this.gridOptions.angularCompileFilters); };
            GridOptionsWrapper.prototype.isAngularCompileHeaders = function () { return isTrue(this.gridOptions.angularCompileHeaders); };
            GridOptionsWrapper.prototype.isDebug = function () { return isTrue(this.gridOptions.debug); };
            GridOptionsWrapper.prototype.getColumnDefs = function () { return this.gridOptions.columnDefs; };
            GridOptionsWrapper.prototype.getDatasource = function () { return this.gridOptions.datasource; };
            GridOptionsWrapper.prototype.isEnableSorting = function () { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); };
            GridOptionsWrapper.prototype.isEnableCellExpressions = function () { return isTrue(this.gridOptions.enableCellExpressions); };
            GridOptionsWrapper.prototype.isEnableServerSideSorting = function () { return isTrue(this.gridOptions.enableServerSideSorting); };
            GridOptionsWrapper.prototype.isEnableFilter = function () { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); };
            GridOptionsWrapper.prototype.isEnableServerSideFilter = function () { return this.gridOptions.enableServerSideFilter; };
            GridOptionsWrapper.prototype.isSuppressScrollLag = function () { return isTrue(this.gridOptions.suppressScrollLag); };
            GridOptionsWrapper.prototype.getIcons = function () { return this.gridOptions.icons; };
            GridOptionsWrapper.prototype.getIsScrollLag = function () { return this.gridOptions.isScrollLag; };
            GridOptionsWrapper.prototype.getSortingOrder = function () { return this.gridOptions.sortingOrder; };
            GridOptionsWrapper.prototype.getSlaveGrids = function () { return this.gridOptions.slaveGrids; };
            GridOptionsWrapper.prototype.getGroupRowRenderer = function () { return this.gridOptions.groupRowRenderer; };
            GridOptionsWrapper.prototype.getOverlayLoadingTemplate = function () { return this.gridOptions.overlayLoadingTemplate; };
            GridOptionsWrapper.prototype.getOverlayNoRowsTemplate = function () { return this.gridOptions.overlayNoRowsTemplate; };
            GridOptionsWrapper.prototype.getCheckboxSelection = function () { return this.gridOptions.checkboxSelection; };
            GridOptionsWrapper.prototype.isSuppressAutoSize = function () { return isTrue(this.gridOptions.suppressAutoSize); };
            GridOptionsWrapper.prototype.isSuppressParentsInRowNodes = function () { return isTrue(this.gridOptions.suppressParentsInRowNodes); };
            GridOptionsWrapper.prototype.getHeaderCellTemplate = function () { return this.gridOptions.headerCellTemplate; };
            GridOptionsWrapper.prototype.getHeaderCellTemplateFunc = function () { return this.gridOptions.getHeaderCellTemplate; };
            // properties
            GridOptionsWrapper.prototype.getHeaderHeight = function () {
                if (typeof this.headerHeight === 'number') {
                    return this.headerHeight;
                }
                else {
                    return 25;
                }
            };
            GridOptionsWrapper.prototype.setHeaderHeight = function (headerHeight) { this.headerHeight = headerHeight; };
            GridOptionsWrapper.prototype.isExternalFilterPresent = function () {
                if (typeof this.gridOptions.isExternalFilterPresent === 'function') {
                    return this.gridOptions.isExternalFilterPresent();
                }
                else {
                    return false;
                }
            };
            GridOptionsWrapper.prototype.doesExternalFilterPass = function (node) {
                if (typeof this.gridOptions.doesExternalFilterPass === 'function') {
                    return this.gridOptions.doesExternalFilterPass(node);
                }
                else {
                    return false;
                }
            };
            GridOptionsWrapper.prototype.getGroupRowInnerRenderer = function () {
                return this.gridOptions.groupRowInnerRenderer;
            };
            GridOptionsWrapper.prototype.getColWidth = function () {
                if (typeof this.gridOptions.colWidth !== 'number' || this.gridOptions.colWidth < constants.MIN_COL_WIDTH) {
                    return 200;
                }
                else {
                    return this.gridOptions.colWidth;
                }
            };
            GridOptionsWrapper.prototype.getRowBuffer = function () {
                if (typeof this.gridOptions.rowBuffer === 'number') {
                    if (this.gridOptions.rowBuffer < 0) {
                        console.warn('ag-Grid: rowBuffer should not be negative');
                    }
                    return this.gridOptions.rowBuffer;
                }
                else {
                    return constants.ROW_BUFFER_SIZE;
                }
            };
            GridOptionsWrapper.prototype.checkForDeprecated = function () {
                // casting to generic object, so typescript compiles even though
                // we are looking for attributes that don't exist
                var options = this.gridOptions;
                if (options.suppressUnSort) {
                    console.warn('ag-grid: as of v1.12.4 suppressUnSort is not used. Please use sortOrder instead.');
                }
                if (options.suppressDescSort) {
                    console.warn('ag-grid: as of v1.12.4 suppressDescSort is not used. Please use sortOrder instead.');
                }
                if (options.groupAggFields) {
                    console.warn('ag-grid: as of v3 groupAggFields is not used. Please add appropriate agg fields to your columns.');
                }
                if (options.groupHidePivotColumns) {
                    console.warn('ag-grid: as of v3 groupHidePivotColumns is not used as pivot columns are now called rowGroup columns. Please refer to the documentation');
                }
                if (options.groupKeys) {
                    console.warn('ag-grid: as of v3 groupKeys is not used. You need to set rowGroupIndex on the columns to group. Please refer to the documentation');
                }
            };
            GridOptionsWrapper.prototype.getLocaleTextFunc = function () {
                if (this.gridOptions.localeTextFunc) {
                    return this.gridOptions.localeTextFunc;
                }
                var that = this;
                return function (key, defaultValue) {
                    var localeText = that.gridOptions.localeText;
                    if (localeText && localeText[key]) {
                        return localeText[key];
                    }
                    else {
                        return defaultValue;
                    }
                };
            };
            // responsible for calling the onXXX functions on gridOptions
            GridOptionsWrapper.prototype.globalEventHandler = function (eventName, event) {
                var callbackMethodName = this.getCallbackForEvent(eventName);
                if (typeof this.gridOptions[callbackMethodName] === 'function') {
                    this.gridOptions[callbackMethodName](event);
                }
            };
            GridOptionsWrapper.prototype.getCallbackForEvent = function (eventName) {
                if (!eventName || eventName.length < 2) {
                    return eventName;
                }
                else {
                    return 'on' + eventName[0].toUpperCase() + eventName.substr(1);
                }
            };
            // we don't allow dynamic row height for virtual paging
            GridOptionsWrapper.prototype.getRowHeightForVirtualPagiation = function () {
                if (typeof this.gridOptions.rowHeight === 'number') {
                    return this.gridOptions.rowHeight;
                }
                else {
                    return DEFAULT_ROW_HEIGHT;
                }
            };
            GridOptionsWrapper.prototype.getRowHeightForNode = function (rowNode) {
                if (typeof this.gridOptions.rowHeight === 'number') {
                    return this.gridOptions.rowHeight;
                }
                else if (typeof this.gridOptions.getRowHeight === 'function') {
                    var params = {
                        node: rowNode,
                        data: rowNode.data,
                        api: this.gridOptions.api,
                        context: this.gridOptions.context
                    };
                    return this.gridOptions.getRowHeight(params);
                }
                else {
                    return DEFAULT_ROW_HEIGHT;
                }
            };
            return GridOptionsWrapper;
        })();
        grid.GridOptionsWrapper = GridOptionsWrapper;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="textAndNumberFilterParameters.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var template = '<div>' +
            '<div>' +
            '<select class="ag-filter-select" id="filterType">' +
            '<option value="1">[CONTAINS]</option>' +
            '<option value="2">[EQUALS]</option>' +
            '<option value="3">[STARTS WITH]</option>' +
            '<option value="4">[ENDS WITH]</option>' +
            '</select>' +
            '</div>' +
            '<div>' +
            '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>' +
            '</div>' +
            '<div class="ag-filter-apply-panel" id="applyPanel">' +
            '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
            '</div>' +
            '</div>';
        var CONTAINS = 1;
        var EQUALS = 2;
        var STARTS_WITH = 3;
        var ENDS_WITH = 4;
        var TextFilter = (function () {
            function TextFilter() {
            }
            TextFilter.prototype.init = function (params) {
                this.filterParams = params.filterParams;
                this.applyActive = this.filterParams && this.filterParams.apply == true;
                this.filterChangedCallback = params.filterChangedCallback;
                this.filterModifiedCallback = params.filterModifiedCallback;
                this.localeTextFunc = params.localeTextFunc;
                this.valueGetter = params.valueGetter;
                this.createGui();
                this.filterText = null;
                this.filterType = CONTAINS;
                this.createApi();
            };
            TextFilter.prototype.onNewRowsLoaded = function () {
                var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
                if (!keepSelection) {
                    this.api.setType(CONTAINS);
                    this.api.setFilter(null);
                }
            };
            TextFilter.prototype.afterGuiAttached = function () {
                this.eFilterTextField.focus();
            };
            TextFilter.prototype.doesFilterPass = function (node) {
                if (!this.filterText) {
                    return true;
                }
                var value = this.valueGetter(node);
                if (!value) {
                    return false;
                }
                var valueLowerCase = value.toString().toLowerCase();
                switch (this.filterType) {
                    case CONTAINS:
                        return valueLowerCase.indexOf(this.filterText) >= 0;
                    case EQUALS:
                        return valueLowerCase === this.filterText;
                    case STARTS_WITH:
                        return valueLowerCase.indexOf(this.filterText) === 0;
                    case ENDS_WITH:
                        var index = valueLowerCase.indexOf(this.filterText);
                        return index >= 0 && index === (valueLowerCase.length - this.filterText.length);
                    default:
                        // should never happen
                        console.warn('invalid filter type ' + this.filterType);
                        return false;
                }
            };
            TextFilter.prototype.getGui = function () {
                return this.eGui;
            };
            TextFilter.prototype.isFilterActive = function () {
                return this.filterText !== null;
            };
            TextFilter.prototype.createTemplate = function () {
                return template
                    .replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...'))
                    .replace('[EQUALS]', this.localeTextFunc('equals', 'Equals'))
                    .replace('[CONTAINS]', this.localeTextFunc('contains', 'Contains'))
                    .replace('[STARTS WITH]', this.localeTextFunc('startsWith', 'Starts with'))
                    .replace('[ENDS WITH]', this.localeTextFunc('endsWith', 'Ends with'))
                    .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
            };
            TextFilter.prototype.createGui = function () {
                this.eGui = utils.loadTemplate(this.createTemplate());
                this.eFilterTextField = this.eGui.querySelector("#filterText");
                this.eTypeSelect = this.eGui.querySelector("#filterType");
                utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
                this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
                this.setupApply();
            };
            TextFilter.prototype.setupApply = function () {
                var _this = this;
                if (this.applyActive) {
                    this.eApplyButton = this.eGui.querySelector('#applyButton');
                    this.eApplyButton.addEventListener('click', function () {
                        _this.filterChangedCallback();
                    });
                }
                else {
                    utils.removeElement(this.eGui, '#applyPanel');
                }
            };
            TextFilter.prototype.onTypeChanged = function () {
                this.filterType = parseInt(this.eTypeSelect.value);
                this.filterChanged();
            };
            TextFilter.prototype.onFilterChanged = function () {
                var filterText = utils.makeNull(this.eFilterTextField.value);
                if (filterText && filterText.trim() === '') {
                    filterText = null;
                }
                var newFilterText;
                if (filterText !== null && filterText !== undefined) {
                    newFilterText = filterText.toLowerCase();
                }
                else {
                    newFilterText = null;
                }
                if (this.filterText !== newFilterText) {
                    this.filterText = newFilterText;
                    this.filterChanged();
                }
            };
            TextFilter.prototype.filterChanged = function () {
                this.filterModifiedCallback();
                if (!this.applyActive) {
                    this.filterChangedCallback();
                }
            };
            TextFilter.prototype.createApi = function () {
                var that = this;
                this.api = {
                    EQUALS: EQUALS,
                    CONTAINS: CONTAINS,
                    STARTS_WITH: STARTS_WITH,
                    ENDS_WITH: ENDS_WITH,
                    setType: function (type) {
                        that.filterType = type;
                        that.eTypeSelect.value = type;
                    },
                    setFilter: function (filter) {
                        filter = utils.makeNull(filter);
                        if (filter) {
                            that.filterText = filter.toLowerCase();
                            that.eFilterTextField.value = filter;
                        }
                        else {
                            that.filterText = null;
                            that.eFilterTextField.value = null;
                        }
                    },
                    getType: function () {
                        return that.filterType;
                    },
                    getFilter: function () {
                        return that.filterText;
                    },
                    getModel: function () {
                        if (that.isFilterActive()) {
                            return {
                                type: that.filterType,
                                filter: that.filterText
                            };
                        }
                        else {
                            return null;
                        }
                    },
                    setModel: function (dataModel) {
                        if (dataModel) {
                            this.setType(dataModel.type);
                            this.setFilter(dataModel.filter);
                        }
                        else {
                            this.setFilter(null);
                        }
                    }
                };
            };
            TextFilter.prototype.getApi = function () {
                return this.api;
            };
            return TextFilter;
        })();
        grid.TextFilter = TextFilter;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="textAndNumberFilterParameters.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var template = '<div>' +
            '<div>' +
            '<select class="ag-filter-select" id="filterType">' +
            '<option value="1">[EQUALS]</option>' +
            '<option value="2">[LESS THAN]</option>' +
            '<option value="3">[GREATER THAN]</option>' +
            '</select>' +
            '</div>' +
            '<div>' +
            '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>' +
            '</div>' +
            '<div class="ag-filter-apply-panel" id="applyPanel">' +
            '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
            '</div>' +
            '</div>';
        var EQUALS = 1;
        var LESS_THAN = 2;
        var GREATER_THAN = 3;
        var NumberFilter = (function () {
            function NumberFilter() {
            }
            NumberFilter.prototype.init = function (params) {
                this.filterParams = params.filterParams;
                this.applyActive = this.filterParams && this.filterParams.apply == true;
                this.filterChangedCallback = params.filterChangedCallback;
                this.filterModifiedCallback = params.filterModifiedCallback;
                this.localeTextFunc = params.localeTextFunc;
                this.valueGetter = params.valueGetter;
                this.createGui();
                this.filterNumber = null;
                this.filterType = EQUALS;
                this.createApi();
            };
            NumberFilter.prototype.onNewRowsLoaded = function () {
                var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
                if (!keepSelection) {
                    this.api.setType(EQUALS);
                    this.api.setFilter(null);
                }
            };
            NumberFilter.prototype.afterGuiAttached = function () {
                this.eFilterTextField.focus();
            };
            NumberFilter.prototype.doesFilterPass = function (node) {
                if (this.filterNumber === null) {
                    return true;
                }
                var value = this.valueGetter(node);
                if (!value && value !== 0) {
                    return false;
                }
                var valueAsNumber;
                if (typeof value === 'number') {
                    valueAsNumber = value;
                }
                else {
                    valueAsNumber = parseFloat(value);
                }
                switch (this.filterType) {
                    case EQUALS:
                        return valueAsNumber === this.filterNumber;
                    case LESS_THAN:
                        return valueAsNumber < this.filterNumber;
                    case GREATER_THAN:
                        return valueAsNumber > this.filterNumber;
                    default:
                        // should never happen
                        console.warn('invalid filter type ' + this.filterType);
                        return false;
                }
            };
            NumberFilter.prototype.getGui = function () {
                return this.eGui;
            };
            NumberFilter.prototype.isFilterActive = function () {
                return this.filterNumber !== null;
            };
            NumberFilter.prototype.createTemplate = function () {
                return template
                    .replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...'))
                    .replace('[EQUALS]', this.localeTextFunc('equals', 'Equals'))
                    .replace('[LESS THAN]', this.localeTextFunc('lessThan', 'Less than'))
                    .replace('[GREATER THAN]', this.localeTextFunc('greaterThan', 'Greater than'))
                    .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
            };
            NumberFilter.prototype.createGui = function () {
                this.eGui = utils.loadTemplate(this.createTemplate());
                this.eFilterTextField = this.eGui.querySelector("#filterText");
                this.eTypeSelect = this.eGui.querySelector("#filterType");
                utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
                this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
                this.setupApply();
            };
            NumberFilter.prototype.setupApply = function () {
                var _this = this;
                if (this.applyActive) {
                    this.eApplyButton = this.eGui.querySelector('#applyButton');
                    this.eApplyButton.addEventListener('click', function () {
                        _this.filterChangedCallback();
                    });
                }
                else {
                    utils.removeElement(this.eGui, '#applyPanel');
                }
            };
            NumberFilter.prototype.onTypeChanged = function () {
                this.filterType = parseInt(this.eTypeSelect.value);
                this.filterChanged();
            };
            NumberFilter.prototype.filterChanged = function () {
                this.filterModifiedCallback();
                if (!this.applyActive) {
                    this.filterChangedCallback();
                }
            };
            NumberFilter.prototype.onFilterChanged = function () {
                var filterText = utils.makeNull(this.eFilterTextField.value);
                if (filterText && filterText.trim() === '') {
                    filterText = null;
                }
                var newFilter;
                if (filterText !== null && filterText !== undefined) {
                    newFilter = parseFloat(filterText);
                }
                else {
                    newFilter = null;
                }
                if (this.filterNumber !== newFilter) {
                    this.filterNumber = newFilter;
                    this.filterChanged();
                }
            };
            NumberFilter.prototype.createApi = function () {
                var that = this;
                this.api = {
                    EQUALS: EQUALS,
                    LESS_THAN: LESS_THAN,
                    GREATER_THAN: GREATER_THAN,
                    setType: function (type) {
                        that.filterType = type;
                        that.eTypeSelect.value = type;
                    },
                    setFilter: function (filter) {
                        filter = utils.makeNull(filter);
                        if (filter !== null && !(typeof filter === 'number')) {
                            filter = parseFloat(filter);
                        }
                        that.filterNumber = filter;
                        that.eFilterTextField.value = filter;
                    },
                    getType: function () {
                        return that.filterType;
                    },
                    getFilter: function () {
                        return that.filterNumber;
                    },
                    getModel: function () {
                        if (that.isFilterActive()) {
                            return {
                                type: that.filterType,
                                filter: that.filterNumber
                            };
                        }
                        else {
                            return null;
                        }
                    },
                    setModel: function (dataModel) {
                        if (dataModel) {
                            this.setType(dataModel.type);
                            this.setFilter(dataModel.filter);
                        }
                        else {
                            this.setFilter(null);
                        }
                    }
                };
            };
            NumberFilter.prototype.getApi = function () {
                return this.api;
            };
            return NumberFilter;
        })();
        grid.NumberFilter = NumberFilter;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../entities/colDef.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var SetFilterModel = (function () {
            function SetFilterModel(colDef, rowModel, valueGetter, doesRowPassOtherFilters) {
                this.colDef = colDef;
                this.rowModel = rowModel;
                this.valueGetter = valueGetter;
                this.doesRowPassOtherFilters = doesRowPassOtherFilters;
                this.filterParams = this.colDef.filterParams;
                this.usingProvidedSet = this.filterParams && this.filterParams.values;
                this.showingAvailableOnly = this.filterParams && !this.filterParams.suppressRemoveEntries;
                this.createAllUniqueValues();
                this.createAvailableUniqueValues();
                // by default, no filter, so we display everything
                this.displayedValues = this.availableUniqueValues;
                this.miniFilter = null;
                // we use a map rather than an array for the selected values as the lookup
                // for a map is much faster than the lookup for an array, especially when
                // the length of the array is thousands of records long
                this.selectedValuesMap = {};
                this.selectEverything();
            }
            // if keepSelection not set will always select all filters
            // if keepSelection set will keep current state of selected filters
            //    unless selectAll chosen in which case will select all
            SetFilterModel.prototype.refreshAfterNewRowsLoaded = function (keepSelection, isSelectAll) {
                this.createAllUniqueValues();
                this.createAvailableUniqueValues();
                var oldModel = Object.keys(this.selectedValuesMap);
                this.selectedValuesMap = {};
                this.processMiniFilter();
                if (keepSelection) {
                    this.setModel(oldModel, isSelectAll);
                }
                else {
                    this.selectEverything();
                }
            };
            SetFilterModel.prototype.refreshAfterAnyFilterChanged = function () {
                if (this.showingAvailableOnly) {
                    this.createAvailableUniqueValues();
                    this.processMiniFilter();
                }
            };
            SetFilterModel.prototype.createAllUniqueValues = function () {
                if (this.usingProvidedSet) {
                    this.allUniqueValues = _.toStrings(this.filterParams.values);
                }
                else {
                    this.allUniqueValues = _.toStrings(this.getUniqueValues(false));
                }
                this.sortValues(this.allUniqueValues);
            };
            SetFilterModel.prototype.createAvailableUniqueValues = function () {
                var dontCheckAvailableValues = !this.showingAvailableOnly || this.usingProvidedSet;
                if (dontCheckAvailableValues) {
                    this.availableUniqueValues = this.allUniqueValues;
                    return;
                }
                this.availableUniqueValues = _.toStrings(this.getUniqueValues(true));
                this.sortValues(this.availableUniqueValues);
            };
            SetFilterModel.prototype.sortValues = function (values) {
                if (this.filterParams && this.filterParams.comparator) {
                    values.sort(this.filterParams.comparator);
                }
                else if (this.colDef.comparator) {
                    values.sort(this.colDef.comparator);
                }
                else {
                    values.sort(_.defaultComparator);
                }
            };
            SetFilterModel.prototype.getUniqueValues = function (filterOutNotAvailable) {
                var _this = this;
                var uniqueCheck = {};
                var result = [];
                this.rowModel.forEachNode(function (node) {
                    if (!node.group) {
                        var value = _this.valueGetter(node);
                        if (value === "" || value === undefined) {
                            value = null;
                        }
                        if (filterOutNotAvailable) {
                            if (!_this.doesRowPassOtherFilters(node)) {
                                return;
                            }
                        }
                        if (value != null && Array.isArray(value)) {
                            for (var j = 0; j < value.length; j++) {
                                addUniqueValueIfMissing(value[j]);
                            }
                        }
                        else {
                            addUniqueValueIfMissing(value);
                        }
                    }
                });
                function addUniqueValueIfMissing(value) {
                    if (!uniqueCheck.hasOwnProperty(value)) {
                        result.push(value);
                        uniqueCheck[value] = 1;
                    }
                }
                return result;
            };
            //sets mini filter. returns true if it changed from last value, otherwise false
            SetFilterModel.prototype.setMiniFilter = function (newMiniFilter) {
                newMiniFilter = _.makeNull(newMiniFilter);
                if (this.miniFilter === newMiniFilter) {
                    //do nothing if filter has not changed
                    return false;
                }
                this.miniFilter = newMiniFilter;
                this.processMiniFilter();
                return true;
            };
            SetFilterModel.prototype.getMiniFilter = function () {
                return this.miniFilter;
            };
            SetFilterModel.prototype.processMiniFilter = function () {
                // if no filter, just use the unique values
                if (this.miniFilter === null) {
                    this.displayedValues = this.availableUniqueValues;
                    return;
                }
                // if filter present, we filter down the list
                this.displayedValues = [];
                var miniFilterUpperCase = this.miniFilter.toUpperCase();
                for (var i = 0, l = this.availableUniqueValues.length; i < l; i++) {
                    var filteredValue = this.availableUniqueValues[i];
                    if (filteredValue !== null && filteredValue.toString().toUpperCase().indexOf(miniFilterUpperCase) >= 0) {
                        this.displayedValues.push(filteredValue);
                    }
                }
            };
            SetFilterModel.prototype.getDisplayedValueCount = function () {
                return this.displayedValues.length;
            };
            SetFilterModel.prototype.getDisplayedValue = function (index) {
                return this.displayedValues[index];
            };
            SetFilterModel.prototype.selectEverything = function () {
                var count = this.allUniqueValues.length;
                for (var i = 0; i < count; i++) {
                    var value = this.allUniqueValues[i];
                    this.selectedValuesMap[value] = null;
                }
                this.selectedValuesCount = count;
            };
            SetFilterModel.prototype.isFilterActive = function () {
                return this.allUniqueValues.length !== this.selectedValuesCount;
            };
            SetFilterModel.prototype.selectNothing = function () {
                this.selectedValuesMap = {};
                this.selectedValuesCount = 0;
            };
            SetFilterModel.prototype.getUniqueValueCount = function () {
                return this.allUniqueValues.length;
            };
            SetFilterModel.prototype.getUniqueValue = function (index) {
                return this.allUniqueValues[index];
            };
            SetFilterModel.prototype.unselectValue = function (value) {
                if (this.selectedValuesMap[value] !== undefined) {
                    delete this.selectedValuesMap[value];
                    this.selectedValuesCount--;
                }
            };
            SetFilterModel.prototype.selectValue = function (value) {
                if (this.selectedValuesMap[value] === undefined) {
                    this.selectedValuesMap[value] = null;
                    this.selectedValuesCount++;
                }
            };
            SetFilterModel.prototype.isValueSelected = function (value) {
                return this.selectedValuesMap[value] !== undefined;
            };
            SetFilterModel.prototype.isEverythingSelected = function () {
                return this.allUniqueValues.length === this.selectedValuesCount;
            };
            SetFilterModel.prototype.isNothingSelected = function () {
                return this.allUniqueValues.length === 0;
            };
            SetFilterModel.prototype.getModel = function () {
                if (!this.isFilterActive()) {
                    return null;
                }
                var selectedValues = [];
                _.iterateObject(this.selectedValuesMap, function (key) {
                    selectedValues.push(key);
                });
                return selectedValues;
            };
            SetFilterModel.prototype.setModel = function (model, isSelectAll) {
                if (model && !isSelectAll) {
                    this.selectNothing();
                    for (var i = 0; i < model.length; i++) {
                        var newValue = model[i];
                        if (this.allUniqueValues.indexOf(newValue) >= 0) {
                            this.selectValue(model[i]);
                        }
                        else {
                            console.warn('Value ' + newValue + ' is not a valid value for filter');
                        }
                    }
                }
                else {
                    this.selectEverything();
                }
            };
            return SetFilterModel;
        })();
        grid.SetFilterModel = SetFilterModel;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/** The filter parameters for set filter */
/// <reference path="../utils.ts" />
/// <reference path="setFilterModel.ts" />
/// <reference path="setFilterParameters.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var template = '<div>' +
            '<div class="ag-filter-header-container">' +
            '<input class="ag-filter-filter" type="text" placeholder="[SEARCH...]"/>' +
            '</div>' +
            '<div class="ag-filter-header-container">' +
            '<label>' +
            '<input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>' +
            '([SELECT ALL])' +
            '</label>' +
            '</div>' +
            '<div class="ag-filter-list-viewport">' +
            '<div class="ag-filter-list-container">' +
            '<div id="itemForRepeat" class="ag-filter-item">' +
            '<label>' +
            '<input type="checkbox" class="ag-filter-checkbox" filter-checkbox="true"/>' +
            '<span class="ag-filter-value"></span>' +
            '</label>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="ag-filter-apply-panel" id="applyPanel">' +
            '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
            '</div>' +
            '</div>';
        var DEFAULT_ROW_HEIGHT = 20;
        var SetFilter = (function () {
            function SetFilter() {
            }
            SetFilter.prototype.init = function (params) {
                this.filterParams = params.filterParams;
                this.rowHeight = (this.filterParams && this.filterParams.cellHeight) ? this.filterParams.cellHeight : DEFAULT_ROW_HEIGHT;
                this.applyActive = this.filterParams && this.filterParams.apply == true;
                this.model = new grid.SetFilterModel(params.colDef, params.rowModel, params.valueGetter, params.doesRowPassOtherFilter);
                this.filterChangedCallback = params.filterChangedCallback;
                this.filterModifiedCallback = params.filterModifiedCallback;
                this.valueGetter = params.valueGetter;
                this.rowsInBodyContainer = {};
                this.colDef = params.colDef;
                this.localeTextFunc = params.localeTextFunc;
                if (this.filterParams) {
                    this.cellRenderer = this.filterParams.cellRenderer;
                }
                this.createGui();
                this.addScrollListener();
                this.createApi();
            };
            // we need to have the gui attached before we can draw the virtual rows, as the
            // virtual row logic needs info about the gui state
            SetFilter.prototype.afterGuiAttached = function () {
                this.drawVirtualRows();
            };
            SetFilter.prototype.isFilterActive = function () {
                return this.model.isFilterActive();
            };
            SetFilter.prototype.doesFilterPass = function (node) {
                // if no filter, always pass
                if (this.model.isEverythingSelected()) {
                    return true;
                }
                // if nothing selected in filter, always fail
                if (this.model.isNothingSelected()) {
                    return false;
                }
                var value = this.valueGetter(node);
                value = _.makeNull(value);
                if (Array.isArray(value)) {
                    for (var i = 0; i < value.length; i++) {
                        if (this.model.isValueSelected(value[i])) {
                            return true;
                        }
                    }
                    return false;
                }
                else {
                    return this.model.isValueSelected(value);
                }
            };
            SetFilter.prototype.getGui = function () {
                return this.eGui;
            };
            SetFilter.prototype.onNewRowsLoaded = function () {
                var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
                var isSelectAll = this.eSelectAll && this.eSelectAll.checked && !this.eSelectAll.indeterminate;
                // default is reset
                this.model.refreshAfterNewRowsLoaded(keepSelection, isSelectAll);
                this.setContainerHeight();
                this.refreshVirtualRows();
            };
            SetFilter.prototype.onAnyFilterChanged = function () {
                this.model.refreshAfterAnyFilterChanged();
                this.setContainerHeight();
                this.refreshVirtualRows();
            };
            SetFilter.prototype.createTemplate = function () {
                return template
                    .replace('[SELECT ALL]', this.localeTextFunc('selectAll', 'Select All'))
                    .replace('[SEARCH...]', this.localeTextFunc('searchOoo', 'Search...'))
                    .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
            };
            SetFilter.prototype.createGui = function () {
                var _this = this;
                this.eGui = _.loadTemplate(this.createTemplate());
                this.eListContainer = this.eGui.querySelector(".ag-filter-list-container");
                this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
                this.eSelectAll = this.eGui.querySelector("#selectAll");
                this.eListViewport = this.eGui.querySelector(".ag-filter-list-viewport");
                this.eMiniFilter = this.eGui.querySelector(".ag-filter-filter");
                this.eListContainer.style.height = (this.model.getUniqueValueCount() * this.rowHeight) + "px";
                this.setContainerHeight();
                this.eMiniFilter.value = this.model.getMiniFilter();
                _.addChangeListener(this.eMiniFilter, function () {
                    _this.onMiniFilterChanged();
                });
                _.removeAllChildren(this.eListContainer);
                this.eSelectAll.onclick = this.onSelectAll.bind(this);
                if (this.model.isEverythingSelected()) {
                    this.eSelectAll.indeterminate = false;
                    this.eSelectAll.checked = true;
                }
                else if (this.model.isNothingSelected()) {
                    this.eSelectAll.indeterminate = false;
                    this.eSelectAll.checked = false;
                }
                else {
                    this.eSelectAll.indeterminate = true;
                }
                this.setupApply();
            };
            SetFilter.prototype.setupApply = function () {
                var _this = this;
                if (this.applyActive) {
                    this.eApplyButton = this.eGui.querySelector('#applyButton');
                    this.eApplyButton.addEventListener('click', function () {
                        _this.filterChangedCallback();
                    });
                }
                else {
                    _.removeElement(this.eGui, '#applyPanel');
                }
            };
            SetFilter.prototype.setContainerHeight = function () {
                this.eListContainer.style.height = (this.model.getDisplayedValueCount() * this.rowHeight) + "px";
            };
            SetFilter.prototype.drawVirtualRows = function () {
                var topPixel = this.eListViewport.scrollTop;
                var bottomPixel = topPixel + this.eListViewport.offsetHeight;
                var firstRow = Math.floor(topPixel / this.rowHeight);
                var lastRow = Math.floor(bottomPixel / this.rowHeight);
                this.ensureRowsRendered(firstRow, lastRow);
            };
            SetFilter.prototype.ensureRowsRendered = function (start, finish) {
                var _this = this;
                //at the end, this array will contain the items we need to remove
                var rowsToRemove = Object.keys(this.rowsInBodyContainer);
                //add in new rows
                for (var rowIndex = start; rowIndex <= finish; rowIndex++) {
                    //see if item already there, and if yes, take it out of the 'to remove' array
                    if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                        rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                        continue;
                    }
                    //check this row actually exists (in case overflow buffer window exceeds real data)
                    if (this.model.getDisplayedValueCount() > rowIndex) {
                        var value = this.model.getDisplayedValue(rowIndex);
                        _this.insertRow(value, rowIndex);
                    }
                }
                //at this point, everything in our 'rowsToRemove' . . .
                this.removeVirtualRows(rowsToRemove);
            };
            //takes array of row id's
            SetFilter.prototype.removeVirtualRows = function (rowsToRemove) {
                var _this = this;
                rowsToRemove.forEach(function (indexToRemove) {
                    var eRowToRemove = _this.rowsInBodyContainer[indexToRemove];
                    _this.eListContainer.removeChild(eRowToRemove);
                    delete _this.rowsInBodyContainer[indexToRemove];
                });
            };
            SetFilter.prototype.insertRow = function (value, rowIndex) {
                var _this = this;
                var eFilterValue = this.eFilterValueTemplate.cloneNode(true);
                var valueElement = eFilterValue.querySelector(".ag-filter-value");
                if (this.cellRenderer) {
                    //renderer provided, so use it
                    var resultFromRenderer = this.cellRenderer({
                        value: value
                    });
                    if (_.isNode(resultFromRenderer)) {
                        //a dom node or element was returned, so add child
                        valueElement.appendChild(resultFromRenderer);
                    }
                    else {
                        //otherwise assume it was html, so just insert
                        valueElement.innerHTML = resultFromRenderer;
                    }
                }
                else {
                    //otherwise display as a string
                    var blanksText = '(' + this.localeTextFunc('blanks', 'Blanks') + ')';
                    var displayNameOfValue = value === null ? blanksText : value;
                    valueElement.innerHTML = displayNameOfValue;
                }
                var eCheckbox = eFilterValue.querySelector("input");
                eCheckbox.checked = this.model.isValueSelected(value);
                eCheckbox.onclick = function () {
                    _this.onCheckboxClicked(eCheckbox, value);
                };
                eFilterValue.style.top = (this.rowHeight * rowIndex) + "px";
                this.eListContainer.appendChild(eFilterValue);
                this.rowsInBodyContainer[rowIndex] = eFilterValue;
            };
            SetFilter.prototype.onCheckboxClicked = function (eCheckbox, value) {
                var checked = eCheckbox.checked;
                if (checked) {
                    this.model.selectValue(value);
                    if (this.model.isEverythingSelected()) {
                        this.eSelectAll.indeterminate = false;
                        this.eSelectAll.checked = true;
                    }
                    else {
                        this.eSelectAll.indeterminate = true;
                    }
                }
                else {
                    this.model.unselectValue(value);
                    //if set is empty, nothing is selected
                    if (this.model.isNothingSelected()) {
                        this.eSelectAll.indeterminate = false;
                        this.eSelectAll.checked = false;
                    }
                    else {
                        this.eSelectAll.indeterminate = true;
                    }
                }
                this.filterChanged();
            };
            SetFilter.prototype.filterChanged = function () {
                this.filterModifiedCallback();
                if (!this.applyActive) {
                    this.filterChangedCallback();
                }
            };
            SetFilter.prototype.onMiniFilterChanged = function () {
                var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
                if (miniFilterChanged) {
                    this.setContainerHeight();
                    this.refreshVirtualRows();
                }
            };
            SetFilter.prototype.refreshVirtualRows = function () {
                this.clearVirtualRows();
                this.drawVirtualRows();
            };
            SetFilter.prototype.clearVirtualRows = function () {
                var rowsToRemove = Object.keys(this.rowsInBodyContainer);
                this.removeVirtualRows(rowsToRemove);
            };
            SetFilter.prototype.onSelectAll = function () {
                var checked = this.eSelectAll.checked;
                if (checked) {
                    this.model.selectEverything();
                }
                else {
                    this.model.selectNothing();
                }
                this.updateAllCheckboxes(checked);
                this.filterChanged();
            };
            SetFilter.prototype.updateAllCheckboxes = function (checked) {
                var currentlyDisplayedCheckboxes = this.eListContainer.querySelectorAll("[filter-checkbox=true]");
                for (var i = 0, l = currentlyDisplayedCheckboxes.length; i < l; i++) {
                    currentlyDisplayedCheckboxes[i].checked = checked;
                }
            };
            SetFilter.prototype.addScrollListener = function () {
                var _this = this;
                this.eListViewport.addEventListener("scroll", function () {
                    _this.drawVirtualRows();
                });
            };
            SetFilter.prototype.getApi = function () {
                return this.api;
            };
            SetFilter.prototype.createApi = function () {
                var model = this.model;
                var that = this;
                this.api = {
                    setMiniFilter: function (newMiniFilter) {
                        model.setMiniFilter(newMiniFilter);
                    },
                    getMiniFilter: function () {
                        return model.getMiniFilter();
                    },
                    selectEverything: function () {
                        that.eSelectAll.indeterminate = false;
                        that.eSelectAll.checked = true;
                        // not sure if we need to call this, as checking the checkout above might
                        // fire events.
                        model.selectEverything();
                    },
                    isFilterActive: function () {
                        return model.isFilterActive();
                    },
                    selectNothing: function () {
                        that.eSelectAll.indeterminate = false;
                        that.eSelectAll.checked = false;
                        // not sure if we need to call this, as checking the checkout above might
                        // fire events.
                        model.selectNothing();
                    },
                    unselectValue: function (value) {
                        model.unselectValue(value);
                        that.refreshVirtualRows();
                    },
                    selectValue: function (value) {
                        model.selectValue(value);
                        that.refreshVirtualRows();
                    },
                    isValueSelected: function (value) {
                        return model.isValueSelected(value);
                    },
                    isEverythingSelected: function () {
                        return model.isEverythingSelected();
                    },
                    isNothingSelected: function () {
                        return model.isNothingSelected();
                    },
                    getUniqueValueCount: function () {
                        return model.getUniqueValueCount();
                    },
                    getUniqueValue: function (index) {
                        return model.getUniqueValue(index);
                    },
                    getModel: function () {
                        return model.getModel();
                    },
                    setModel: function (dataModel) {
                        model.setModel(dataModel);
                        that.refreshVirtualRows();
                    }
                };
            };
            return SetFilter;
        })();
        grid.SetFilter = SetFilter;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var PopupService = (function () {
            function PopupService() {
            }
            PopupService.prototype.init = function (ePopupParent) {
                this.ePopupParent = ePopupParent;
            };
            PopupService.prototype.positionPopup = function (eventSource, ePopup, keepWithinBounds) {
                var sourceRect = eventSource.getBoundingClientRect();
                var parentRect = this.ePopupParent.getBoundingClientRect();
                var x = sourceRect.left - parentRect.left;
                var y = sourceRect.top - parentRect.top + sourceRect.height;
                // if popup is overflowing to the right, move it left
                if (keepWithinBounds) {
                    var minWidth;
                    if (ePopup.clientWidth > 0) {
                        minWidth = ePopup.clientWidth;
                    }
                    else {
                        minWidth = 200;
                    }
                    var widthOfParent = parentRect.right - parentRect.left;
                    var maxX = widthOfParent - minWidth;
                    if (x > maxX) {
                        x = maxX;
                    }
                    if (x < 0) {
                        x = 0;
                    }
                }
                ePopup.style.left = x + "px";
                ePopup.style.top = y + "px";
            };
            //adds an element to a div, but also listens to background checking for clicks,
            //so that when the background is clicked, the child is removed again, giving
            //a model look to popups.
            PopupService.prototype.addAsModalPopup = function (eChild, closeOnEsc) {
                var eBody = document.body;
                if (!eBody) {
                    console.warn('ag-grid: could not find the body of the document, document.body is empty');
                    return;
                }
                var popupAlreadyShown = _.isVisible(eChild);
                if (popupAlreadyShown) {
                    return;
                }
                this.ePopupParent.appendChild(eChild);
                var that = this;
                // if we add these listeners now, then the current mouse
                // click will be included, which we don't want
                setTimeout(function () {
                    if (closeOnEsc) {
                        eBody.addEventListener('keydown', hidePopupOnEsc);
                    }
                    eBody.addEventListener('click', hidePopup);
                    eChild.addEventListener('click', consumeClick);
                }, 0);
                var eventFromChild = null;
                function hidePopupOnEsc(event) {
                    var key = event.which || event.keyCode;
                    if (key === grid.Constants.KEY_ESCAPE) {
                        hidePopup(null);
                    }
                }
                function hidePopup(event) {
                    if (event && event === eventFromChild) {
                        return;
                    }
                    that.ePopupParent.removeChild(eChild);
                    eBody.removeEventListener('keydown', hidePopupOnEsc);
                    eBody.removeEventListener('click', hidePopup);
                    eChild.removeEventListener('click', consumeClick);
                }
                function consumeClick(event) {
                    eventFromChild = event;
                }
                return hidePopup;
            };
            return PopupService;
        })();
        grid.PopupService = PopupService;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="textFilter.ts" />
/// <reference path="numberFilter.ts" />
/// <reference path="setFilter.ts" />
/// <reference path="../widgets/agPopupService.ts" />
/// <reference path="../widgets/agPopupService.ts" />
/// <reference path="../grid.ts" />
/// <reference path="../entities/rowNode.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid_2) {
        var _ = grid_2.Utils;
        var FilterManager = (function () {
            function FilterManager() {
            }
            FilterManager.prototype.init = function (grid, gridOptionsWrapper, $compile, $scope, columnController, popupService, valueService) {
                this.$compile = $compile;
                this.$scope = $scope;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.grid = grid;
                this.allFilters = {};
                this.columnController = columnController;
                this.popupService = popupService;
                this.valueService = valueService;
                this.columnController = columnController;
                this.quickFilter = null;
            };
            FilterManager.prototype.setFilterModel = function (model) {
                var _this = this;
                if (model) {
                    // mark the filters as we set them, so any active filters left over we stop
                    var modelKeys = Object.keys(model);
                    _.iterateObject(this.allFilters, function (colId, filterWrapper) {
                        _.removeFromArray(modelKeys, colId);
                        var newModel = model[colId];
                        _this.setModelOnFilterWrapper(filterWrapper.filter, newModel);
                    });
                    // at this point, processedFields contains data for which we don't have a filter working yet
                    _.iterateArray(modelKeys, function (colId) {
                        var column = _this.columnController.getColumn(colId);
                        if (!column) {
                            console.warn('Warning ag-grid setFilterModel - no column found for colId ' + colId);
                            return;
                        }
                        var filterWrapper = _this.getOrCreateFilterWrapper(column);
                        _this.setModelOnFilterWrapper(filterWrapper.filter, model[colId]);
                    });
                }
                else {
                    _.iterateObject(this.allFilters, function (key, filterWrapper) {
                        _this.setModelOnFilterWrapper(filterWrapper.filter, null);
                    });
                }
                this.grid.onFilterChanged();
            };
            FilterManager.prototype.setModelOnFilterWrapper = function (filter, newModel) {
                // because user can provide filters, we provide useful error checking and messages
                if (typeof filter.getApi !== 'function') {
                    console.warn('Warning ag-grid - filter missing getApi method, which is needed for getFilterModel');
                    return;
                }
                var filterApi = filter.getApi();
                if (typeof filterApi.setModel !== 'function') {
                    console.warn('Warning ag-grid - filter API missing setModel method, which is needed for setFilterModel');
                    return;
                }
                filterApi.setModel(newModel);
            };
            FilterManager.prototype.getFilterModel = function () {
                var result = {};
                _.iterateObject(this.allFilters, function (key, filterWrapper) {
                    // because user can provide filters, we provide useful error checking and messages
                    if (typeof filterWrapper.filter.getApi !== 'function') {
                        console.warn('Warning ag-grid - filter missing getApi method, which is needed for getFilterModel');
                        return;
                    }
                    var filterApi = filterWrapper.filter.getApi();
                    if (typeof filterApi.getModel !== 'function') {
                        console.warn('Warning ag-grid - filter API missing getModel method, which is needed for getFilterModel');
                        return;
                    }
                    var model = filterApi.getModel();
                    if (model) {
                        result[key] = model;
                    }
                });
                return result;
            };
            FilterManager.prototype.setRowModel = function (rowModel) {
                this.rowModel = rowModel;
            };
            // returns true if any advanced filter (ie not quick filter) active
            FilterManager.prototype.isAdvancedFilterPresent = function () {
                var atLeastOneActive = false;
                _.iterateObject(this.allFilters, function (key, filterWrapper) {
                    if (!filterWrapper.filter.isFilterActive) {
                        console.error('Filter is missing method isFilterActive');
                    }
                    if (filterWrapper.filter.isFilterActive()) {
                        atLeastOneActive = true;
                    }
                });
                return atLeastOneActive;
            };
            // returns true if quickFilter or advancedFilter
            FilterManager.prototype.isAnyFilterPresent = function () {
                return this.isQuickFilterPresent() || this.advancedFilterPresent || this.externalFilterPresent;
            };
            // returns true if given col has a filter active
            FilterManager.prototype.isFilterPresentForCol = function (colId) {
                var filterWrapper = this.allFilters[colId];
                if (!filterWrapper) {
                    return false;
                }
                if (!filterWrapper.filter.isFilterActive) {
                    console.error('Filter is missing method isFilterActive');
                }
                var filterPresent = filterWrapper.filter.isFilterActive();
                return filterPresent;
            };
            FilterManager.prototype.doesFilterPass = function (node, filterToSkip) {
                var data = node.data;
                var colKeys = Object.keys(this.allFilters);
                for (var i = 0, l = colKeys.length; i < l; i++) {
                    var colId = colKeys[i];
                    var filterWrapper = this.allFilters[colId];
                    // if no filter, always pass
                    if (filterWrapper === undefined) {
                        continue;
                    }
                    if (filterWrapper.filter === filterToSkip) {
                        continue;
                    }
                    if (!filterWrapper.filter.doesFilterPass) {
                        console.error('Filter is missing method doesFilterPass');
                    }
                    var params = {
                        node: node,
                        data: data
                    };
                    if (!filterWrapper.filter.doesFilterPass(params)) {
                        return false;
                    }
                }
                // all filters passed
                return true;
            };
            // returns true if it has changed (not just same value again)
            FilterManager.prototype.setQuickFilter = function (newFilter) {
                if (newFilter === undefined || newFilter === "") {
                    newFilter = null;
                }
                if (this.quickFilter !== newFilter) {
                    if (this.gridOptionsWrapper.isVirtualPaging()) {
                        console.warn('ag-grid: cannot do quick filtering when doing virtual paging');
                        return;
                    }
                    //want 'null' to mean to filter, so remove undefined and empty string
                    if (newFilter === undefined || newFilter === "") {
                        newFilter = null;
                    }
                    if (newFilter !== null) {
                        newFilter = newFilter.toUpperCase();
                    }
                    this.quickFilter = newFilter;
                    return true;
                }
                else {
                    return false;
                }
            };
            FilterManager.prototype.onFilterChanged = function () {
                this.advancedFilterPresent = this.isAdvancedFilterPresent();
                this.externalFilterPresent = this.gridOptionsWrapper.isExternalFilterPresent();
                _.iterateObject(this.allFilters, function (key, filterWrapper) {
                    if (filterWrapper.filter.onAnyFilterChanged) {
                        filterWrapper.filter.onAnyFilterChanged();
                    }
                });
            };
            FilterManager.prototype.isQuickFilterPresent = function () {
                return this.quickFilter !== null;
            };
            FilterManager.prototype.doesRowPassOtherFilters = function (filterToSkip, node) {
                return this.doesRowPassFilter(node, filterToSkip);
            };
            FilterManager.prototype.doesRowPassFilter = function (node, filterToSkip) {
                //first up, check quick filter
                if (this.isQuickFilterPresent()) {
                    if (!node.quickFilterAggregateText) {
                        this.aggregateRowForQuickFilter(node);
                    }
                    if (node.quickFilterAggregateText.indexOf(this.quickFilter) < 0) {
                        //quick filter fails, so skip item
                        return false;
                    }
                }
                //secondly, give the client a chance to reject this row
                if (this.externalFilterPresent) {
                    if (!this.gridOptionsWrapper.doesExternalFilterPass(node)) {
                        return false;
                    }
                }
                //lastly, check our internal advanced filter
                if (this.advancedFilterPresent) {
                    if (!this.doesFilterPass(node, filterToSkip)) {
                        return false;
                    }
                }
                //got this far, all filters pass
                return true;
            };
            FilterManager.prototype.aggregateRowForQuickFilter = function (node) {
                var aggregatedText = '';
                var that = this;
                this.columnController.getAllColumns().forEach(function (column) {
                    var data = node.data;
                    var value = that.valueService.getValue(column.getColDef(), data, node);
                    if (value && value !== '') {
                        aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
                    }
                });
                node.quickFilterAggregateText = aggregatedText;
            };
            FilterManager.prototype.onNewRowsLoaded = function () {
                var that = this;
                Object.keys(this.allFilters).forEach(function (field) {
                    var filter = that.allFilters[field].filter;
                    if (filter.onNewRowsLoaded) {
                        filter.onNewRowsLoaded();
                    }
                });
            };
            FilterManager.prototype.createValueGetter = function (column) {
                var that = this;
                return function valueGetter(node) {
                    return that.valueService.getValue(column.getColDef(), node.data, node);
                };
            };
            FilterManager.prototype.getFilterApi = function (column) {
                var filterWrapper = this.getOrCreateFilterWrapper(column);
                if (filterWrapper) {
                    if (typeof filterWrapper.filter.getApi === 'function') {
                        return filterWrapper.filter.getApi();
                    }
                }
            };
            FilterManager.prototype.getOrCreateFilterWrapper = function (column) {
                var filterWrapper = this.allFilters[column.getColId()];
                if (!filterWrapper) {
                    filterWrapper = this.createFilterWrapper(column);
                    this.allFilters[column.getColId()] = filterWrapper;
                }
                return filterWrapper;
            };
            FilterManager.prototype.createFilterWrapper = function (column) {
                var colDef = column.getColDef();
                var filterWrapper = {
                    column: column,
                    filter: null,
                    scope: null,
                    gui: null
                };
                if (typeof colDef.filter === 'function') {
                    // if user provided a filter, just use it
                    // first up, create child scope if needed
                    if (this.gridOptionsWrapper.isAngularCompileFilters()) {
                        filterWrapper.scope = this.$scope.$new();
                        ;
                    }
                    // now create filter (had to cast to any to get 'new' working)
                    this.assertMethodHasNoParameters(colDef.filter);
                    filterWrapper.filter = new colDef.filter();
                }
                else if (colDef.filter === 'text') {
                    filterWrapper.filter = new grid_2.TextFilter();
                }
                else if (colDef.filter === 'number') {
                    filterWrapper.filter = new grid_2.NumberFilter();
                }
                else {
                    filterWrapper.filter = new grid_2.SetFilter();
                }
                var filterChangedCallback = this.grid.onFilterChanged.bind(this.grid);
                var filterModifiedCallback = this.grid.onFilterModified.bind(this.grid);
                var doesRowPassOtherFilters = this.doesRowPassOtherFilters.bind(this, filterWrapper.filter);
                var filterParams = colDef.filterParams;
                var params = {
                    colDef: colDef,
                    rowModel: this.rowModel,
                    filterChangedCallback: filterChangedCallback,
                    filterModifiedCallback: filterModifiedCallback,
                    filterParams: filterParams,
                    localeTextFunc: this.gridOptionsWrapper.getLocaleTextFunc(),
                    valueGetter: this.createValueGetter(column),
                    doesRowPassOtherFilter: doesRowPassOtherFilters,
                    context: this.gridOptionsWrapper.getContext,
                    $scope: filterWrapper.scope
                };
                if (!filterWrapper.filter.init) {
                    throw 'Filter is missing method init';
                }
                filterWrapper.filter.init(params);
                if (!filterWrapper.filter.getGui) {
                    throw 'Filter is missing method getGui';
                }
                var eFilterGui = document.createElement('div');
                eFilterGui.className = 'ag-filter';
                var guiFromFilter = filterWrapper.filter.getGui();
                if (_.isNodeOrElement(guiFromFilter)) {
                    //a dom node or element was returned, so add child
                    eFilterGui.appendChild(guiFromFilter);
                }
                else {
                    //otherwise assume it was html, so just insert
                    var eTextSpan = document.createElement('span');
                    eTextSpan.innerHTML = guiFromFilter;
                    eFilterGui.appendChild(eTextSpan);
                }
                if (filterWrapper.scope) {
                    filterWrapper.gui = this.$compile(eFilterGui)(filterWrapper.scope)[0];
                }
                else {
                    filterWrapper.gui = eFilterGui;
                }
                return filterWrapper;
            };
            FilterManager.prototype.assertMethodHasNoParameters = function (theMethod) {
                var getRowsParams = _.getFunctionParameters(theMethod);
                if (getRowsParams.length > 0) {
                    console.warn('ag-grid: It looks like your filter is of the old type and expecting parameters in the constructor.');
                    console.warn('ag-grid: From ag-grid 1.14, the constructor should take no parameters and init() used instead.');
                }
            };
            FilterManager.prototype.showFilter = function (column, eventSource) {
                var filterWrapper = this.getOrCreateFilterWrapper(column);
                // need to show filter before positioning, as only after filter
                // is visible can we find out what the width of it is
                var hidePopup = this.popupService.addAsModalPopup(filterWrapper.gui, true);
                this.popupService.positionPopup(eventSource, filterWrapper.gui, true);
                if (filterWrapper.filter.afterGuiAttached) {
                    var params = {
                        hidePopup: hidePopup,
                        eventSource: eventSource
                    };
                    filterWrapper.filter.afterGuiAttached(params);
                }
            };
            return FilterManager;
        })();
        grid_2.FilterManager = FilterManager;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="./columnGroupChild.ts"/>
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var ColumnGroup = (function () {
            function ColumnGroup(colGroupDef, groupId, instanceId) {
                // depends on the open/closed state of the group, only displaying columns are stored here
                this.displayedChildren = [];
                this.expandable = false;
                this.expanded = false;
                this.colGroupDef = colGroupDef;
                this.groupId = groupId;
                this.instanceId = instanceId;
            }
            // returns header name if it exists, otherwise null. if will not exist if
            // this group is a padding group, as they don't have colGroupDef's
            ColumnGroup.prototype.getHeaderName = function () {
                if (this.colGroupDef) {
                    return this.colGroupDef.headerName;
                }
                else {
                    return null;
                }
            };
            ColumnGroup.prototype.getGroupId = function () {
                return this.groupId;
            };
            ColumnGroup.prototype.getInstanceId = function () {
                return this.instanceId;
            };
            ColumnGroup.prototype.setExpanded = function (expanded) {
                this.expanded = expanded;
            };
            ColumnGroup.prototype.isExpandable = function () {
                return this.expandable;
            };
            ColumnGroup.prototype.isExpanded = function () {
                return this.expanded;
            };
            ColumnGroup.prototype.getColGroupDef = function () {
                return this.colGroupDef;
            };
            ColumnGroup.prototype.isChildInThisGroupDeepSearch = function (wantedChild) {
                var result = false;
                this.children.forEach(function (foundChild) {
                    if (wantedChild === foundChild) {
                        result = true;
                    }
                    if (foundChild instanceof ColumnGroup) {
                        if (foundChild.isChildInThisGroupDeepSearch(wantedChild)) {
                            result = true;
                        }
                    }
                });
                return result;
            };
            ColumnGroup.prototype.getActualWidth = function () {
                var groupActualWidth = 0;
                if (this.displayedChildren) {
                    this.displayedChildren.forEach(function (child) {
                        groupActualWidth += child.getActualWidth();
                    });
                }
                return groupActualWidth;
            };
            ColumnGroup.prototype.getMinimumWidth = function () {
                var result = 0;
                this.displayedChildren.forEach(function (groupChild) {
                    result += groupChild.getMinimumWidth();
                });
                return result;
            };
            ColumnGroup.prototype.addChild = function (child) {
                if (!this.children) {
                    this.children = [];
                }
                this.children.push(child);
            };
            ColumnGroup.prototype.getDisplayedChildren = function () {
                return this.displayedChildren;
            };
            ColumnGroup.prototype.getDisplayedLeafColumns = function () {
                var result = [];
                this.addDisplayedLeafColumns(result);
                return result;
            };
            ColumnGroup.prototype.getDefinition = function () {
                return this.colGroupDef;
            };
            ColumnGroup.prototype.addDisplayedLeafColumns = function (leafColumns) {
                this.displayedChildren.forEach(function (child) {
                    if (child instanceof grid.Column) {
                        leafColumns.push(child);
                    }
                    else if (child instanceof ColumnGroup) {
                        child.addDisplayedLeafColumns(leafColumns);
                    }
                });
            };
            ColumnGroup.prototype.getChildren = function () {
                return this.children;
            };
            ColumnGroup.prototype.getColumnGroupShow = function () {
                if (this.colGroupDef) {
                    return this.colGroupDef.columnGroupShow;
                }
                else {
                    // if there is no col def, then this must be a padding
                    // group, which means we exactly only child. we then
                    // take the value from the child and push it up, making
                    // this group 'invisible'.
                    return this.children[0].getColumnGroupShow();
                }
            };
            // need to check that this group has at least one col showing when both expanded and contracted.
            // if not, then we don't allow expanding and contracting on this group
            ColumnGroup.prototype.calculateExpandable = function () {
                // want to make sure the group doesn't disappear when it's open
                var atLeastOneShowingWhenOpen = false;
                // want to make sure the group doesn't disappear when it's closed
                var atLeastOneShowingWhenClosed = false;
                // want to make sure the group has something to show / hide
                var atLeastOneChangeable = false;
                for (var i = 0, j = this.children.length; i < j; i++) {
                    var abstractColumn = this.children[i];
                    // if the abstractColumn is a grid generated group, there will be no colDef
                    var headerGroupShow = abstractColumn.getColumnGroupShow();
                    if (headerGroupShow === 'open') {
                        atLeastOneShowingWhenOpen = true;
                        atLeastOneChangeable = true;
                    }
                    else if (headerGroupShow === 'closed') {
                        atLeastOneShowingWhenClosed = true;
                        atLeastOneChangeable = true;
                    }
                    else {
                        atLeastOneShowingWhenOpen = true;
                        atLeastOneShowingWhenClosed = true;
                    }
                }
                this.expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
            };
            ColumnGroup.prototype.calculateDisplayedColumns = function () {
                // clear out last time we calculated
                this.displayedChildren = [];
                // it not expandable, everything is visible
                if (!this.expandable) {
                    this.displayedChildren = this.children;
                    return;
                }
                // and calculate again
                for (var i = 0, j = this.children.length; i < j; i++) {
                    var abstractColumn = this.children[i];
                    var headerGroupShow = abstractColumn.getColumnGroupShow();
                    switch (headerGroupShow) {
                        case 'open':
                            // when set to open, only show col if group is open
                            if (this.expanded) {
                                this.displayedChildren.push(abstractColumn);
                            }
                            break;
                        case 'closed':
                            // when set to open, only show col if group is open
                            if (!this.expanded) {
                                this.displayedChildren.push(abstractColumn);
                            }
                            break;
                        default:
                            // default is always show the column
                            this.displayedChildren.push(abstractColumn);
                            break;
                    }
                }
            };
            return ColumnGroup;
        })();
        grid.ColumnGroup = ColumnGroup;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../constants.ts" />
/// <reference path="columnGroup.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var constants = grid.Constants;
        // Wrapper around a user provide column definition. The grid treats the column definition as ready only.
        // This class contains all the runtime information about a column, plus some logic (the definition has no logic).
        // This class implements both interfaces ColumnGroupChild and OriginalColumnGroupChild as the class can
        // appear as a child of either the original tree or the displayed tree. However the relevant group classes
        // for each type only implements one, as each group can only appear in it's associated tree (eg OriginalColumnGroup
        // can only appear in OriginalColumn tree).
        var Column = (function () {
            function Column(colDef, actualWidth, colId) {
                this.colDef = colDef;
                this.actualWidth = actualWidth;
                this.visible = !colDef.hide;
                this.sort = colDef.sort;
                this.sortedAt = colDef.sortedAt;
                this.colId = colId;
                if (colDef.pinned === true || colDef.pinned === 'left') {
                    this.pinned = 'left';
                }
                else if (colDef.pinned === 'right') {
                    this.pinned = 'right';
                }
            }
            Column.prototype.getSort = function () {
                return this.sort;
            };
            Column.prototype.setSort = function (sort) {
                this.sort = sort;
            };
            Column.prototype.getSortedAt = function () {
                return this.sortedAt;
            };
            Column.prototype.setSortedAt = function (sortedAt) {
                this.sortedAt = sortedAt;
            };
            Column.prototype.setAggFunc = function (aggFunc) {
                this.aggFunc = aggFunc;
            };
            Column.prototype.getAggFunc = function () {
                return this.aggFunc;
            };
            Column.prototype.getIndex = function () {
                return this.index;
            };
            Column.prototype.setIndex = function (index) {
                this.index = index;
            };
            Column.prototype.setPinned = function (pinned) {
                if (pinned === true || pinned === Column.PINNED_LEFT) {
                    this.pinned = Column.PINNED_LEFT;
                }
                else if (pinned === Column.PINNED_RIGHT) {
                    this.pinned = Column.PINNED_RIGHT;
                }
                else {
                    this.pinned = null;
                }
            };
            Column.prototype.isPinned = function () {
                return this.pinned === Column.PINNED_LEFT || this.pinned === Column.PINNED_RIGHT;
            };
            Column.prototype.getPinned = function () {
                return this.pinned;
            };
            Column.prototype.setVisible = function (visible) {
                this.visible = visible === true;
            };
            Column.prototype.isVisible = function () {
                return this.visible;
            };
            Column.prototype.getColDef = function () {
                return this.colDef;
            };
            Column.prototype.getColumnGroupShow = function () {
                return this.colDef.columnGroupShow;
            };
            Column.prototype.getColId = function () {
                return this.colId;
            };
            Column.prototype.getDefinition = function () {
                return this.colDef;
            };
            Column.prototype.getActualWidth = function () {
                return this.actualWidth;
            };
            Column.prototype.setActualWidth = function (actualWidth) {
                this.actualWidth = actualWidth;
            };
            Column.prototype.isGreaterThanMax = function (width) {
                if (this.colDef.maxWidth >= constants.MIN_COL_WIDTH) {
                    return width > this.colDef.maxWidth;
                }
                else {
                    return false;
                }
            };
            Column.prototype.getMinimumWidth = function () {
                return Math.max(this.colDef.minWidth, constants.MIN_COL_WIDTH);
            };
            Column.prototype.setMinimum = function () {
                this.actualWidth = this.getMinimumWidth();
            };
            Column.PINNED_RIGHT = 'right';
            Column.PINNED_LEFT = 'left';
            Column.AGG_SUM = 'sum';
            Column.AGG_MIN = 'min';
            Column.AGG_MAX = 'max';
            Column.SORT_ASC = 'asc';
            Column.SORT_DESC = 'desc';
            return Column;
        })();
        grid.Column = Column;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var LoggerFactory = (function () {
            function LoggerFactory() {
            }
            LoggerFactory.prototype.init = function (gridOptionsWrapper) {
                this.logging = gridOptionsWrapper.isDebug();
            };
            LoggerFactory.prototype.create = function (name) {
                return new Logger(name, this.logging);
            };
            return LoggerFactory;
        })();
        grid.LoggerFactory = LoggerFactory;
        var Logger = (function () {
            function Logger(name, logging) {
                this.name = name;
                this.logging = logging;
            }
            Logger.prototype.log = function (message) {
                if (this.logging) {
                    console.log('ag-Grid.' + this.name + ': ' + message);
                }
            };
            return Logger;
        })();
        grid.Logger = Logger;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="columnController/columnController.ts" />
/// <reference path="gridOptionsWrapper.ts" />
/// <reference path="logger.ts" />
/// <reference path="events.ts" />
/// <reference path="eventService.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var MasterSlaveService = (function () {
            function MasterSlaveService() {
                // flag to mark if we are consuming. to avoid cyclic events (ie slave firing back to master
                // while processing a master event) we mark this if consuming an event, and if we are, then
                // we don't fire back any events.
                this.consuming = false;
            }
            MasterSlaveService.prototype.init = function (gridOptionsWrapper, columnController, gridPanel, loggerFactory, eventService) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.columnController = columnController;
                this.gridPanel = gridPanel;
                this.eventService = eventService;
                this.logger = loggerFactory.create('MasterSlaveService');
                eventService.addEventListener(grid.Events.EVENT_COLUMN_MOVED, this.fireColumnEvent.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_VISIBLE, this.fireColumnEvent.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_PINNED, this.fireColumnEvent.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_GROUP_OPENED, this.fireColumnEvent.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_RESIZED, this.fireColumnEvent.bind(this));
            };
            // common logic across all the fire methods
            MasterSlaveService.prototype.fireEvent = function (callback) {
                // if we are already consuming, then we are acting on an event from a master,
                // so we don't cause a cyclic firing of events
                if (this.consuming) {
                    return;
                }
                // iterate through the slave grids, and pass each slave service to the callback
                var slaveGrids = this.gridOptionsWrapper.getSlaveGrids();
                if (slaveGrids) {
                    slaveGrids.forEach(function (slaveGridOptions) {
                        if (slaveGridOptions.api) {
                            var slaveService = slaveGridOptions.api.__getMasterSlaveService();
                            callback(slaveService);
                        }
                    });
                }
            };
            // common logic across all consume methods. very little common logic, however extracting
            // guarantees consistency across the methods.
            MasterSlaveService.prototype.onEvent = function (callback) {
                this.consuming = true;
                callback();
                this.consuming = false;
            };
            MasterSlaveService.prototype.fireColumnEvent = function (event) {
                this.fireEvent(function (slaveService) {
                    slaveService.onColumnEvent(event);
                });
            };
            MasterSlaveService.prototype.fireHorizontalScrollEvent = function (horizontalScroll) {
                this.fireEvent(function (slaveService) {
                    slaveService.onScrollEvent(horizontalScroll);
                });
            };
            MasterSlaveService.prototype.onScrollEvent = function (horizontalScroll) {
                var _this = this;
                this.onEvent(function () {
                    _this.gridPanel.setHorizontalScrollPosition(horizontalScroll);
                });
            };
            MasterSlaveService.prototype.getMasterColumns = function (event) {
                var result = [];
                if (event.getColumn()) {
                    result.push(event.getColumn());
                }
                if (event.getColumns()) {
                    event.getColumns().forEach(function (column) {
                        result.push(column);
                    });
                }
                return result;
            };
            MasterSlaveService.prototype.getColumnIds = function (event) {
                var result = [];
                if (event.getColumn()) {
                    result.push(event.getColumn().getColId());
                }
                if (event.getColumns()) {
                    event.getColumns().forEach(function (column) {
                        result.push(column.getColId());
                    });
                }
                return result;
            };
            MasterSlaveService.prototype.onColumnEvent = function (event) {
                var _this = this;
                this.onEvent(function () {
                    // the column in the event is from the master grid. need to
                    // look up the equivalent from this (slave) grid
                    var masterColumn = event.getColumn();
                    var slaveColumn;
                    if (masterColumn) {
                        slaveColumn = _this.columnController.getColumn(masterColumn.getColId());
                    }
                    // if event was with respect to a master column, that is not present in this
                    // grid, then we ignore the event
                    if (masterColumn && !slaveColumn) {
                        return;
                    }
                    // likewise for column group
                    var masterColumnGroup = event.getColumnGroup();
                    var slaveColumnGroup;
                    if (masterColumnGroup) {
                        var colId = masterColumnGroup.getGroupId();
                        var instanceId = masterColumnGroup.getInstanceId();
                        slaveColumnGroup = _this.columnController.getColumnGroup(colId, instanceId);
                    }
                    if (masterColumnGroup && !slaveColumnGroup) {
                        return;
                    }
                    // in time, all the methods below should use the column ids, it's a more generic way
                    // of handling columns, and also allows for single or multi column events
                    var columnIds = _this.getColumnIds(event);
                    var masterColumns = _this.getMasterColumns(event);
                    switch (event.getType()) {
                        case grid.Events.EVENT_COLUMN_MOVED:
                            _this.logger.log('onColumnEvent-> processing ' + event + ' fromIndex = ' + event.getFromIndex() + ', toIndex = ' + event.getToIndex());
                            _this.columnController.moveColumn(event.getFromIndex(), event.getToIndex());
                            break;
                        case grid.Events.EVENT_COLUMN_VISIBLE:
                            _this.logger.log('onColumnEvent-> processing ' + event + ' visible = ' + event.isVisible());
                            _this.columnController.setColumnsVisible(columnIds, event.isVisible());
                            break;
                        case grid.Events.EVENT_COLUMN_PINNED:
                            _this.logger.log('onColumnEvent-> processing ' + event + ' pinned = ' + event.getPinned());
                            _this.columnController.setColumnsPinned(columnIds, event.getPinned());
                            break;
                        case grid.Events.EVENT_COLUMN_GROUP_OPENED:
                            _this.logger.log('onColumnEvent-> processing ' + event + ' expanded = ' + masterColumnGroup.isExpanded());
                            _this.columnController.setColumnGroupOpened(slaveColumnGroup, masterColumnGroup.isExpanded());
                            break;
                        case grid.Events.EVENT_COLUMN_RESIZED:
                            masterColumns.forEach(function (masterColumn) {
                                _this.logger.log('onColumnEvent-> processing ' + event + ' actualWidth = ' + masterColumn.getActualWidth());
                                _this.columnController.setColumnWidth(masterColumn.getColId(), masterColumn.getActualWidth(), event.isFinished());
                            });
                            break;
                    }
                });
            };
            return MasterSlaveService;
        })();
        grid.MasterSlaveService = MasterSlaveService;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        // class returns unique instance id's for columns.
        // eg, the following calls (in this order) will result in:
        //
        // getInstanceIdForKey('country') => 0
        // getInstanceIdForKey('country') => 1
        // getInstanceIdForKey('country') => 2
        // getInstanceIdForKey('country') => 3
        // getInstanceIdForKey('age') => 0
        // getInstanceIdForKey('age') => 1
        // getInstanceIdForKey('country') => 4
        var GroupInstanceIdCreator = (function () {
            function GroupInstanceIdCreator() {
                // this map contains keys to numbers, so we remember what the last call was
                this.existingIds = {};
            }
            GroupInstanceIdCreator.prototype.getInstanceIdForKey = function (key) {
                var lastResult = this.existingIds[key];
                var result;
                if (typeof lastResult !== 'number') {
                    // first time this key
                    result = 0;
                }
                else {
                    result = lastResult + 1;
                }
                this.existingIds[key] = result;
                return result;
            };
            return GroupInstanceIdCreator;
        })();
        grid.GroupInstanceIdCreator = GroupInstanceIdCreator;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path='../entities/colDef.ts'/>
/// <reference path='../entities/column.ts'/>
/// <reference path='../entities/columnGroup.ts'/>
/// <reference path='../logger.ts'/>
/// <reference path='groupInstanceIdCreator.ts'/>
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        // takes in a list of columns, as specified by the column definitions, and returns column groups
        var DisplayedGroupCreator = (function () {
            function DisplayedGroupCreator() {
            }
            DisplayedGroupCreator.prototype.init = function (columnUtils) {
                this.columnUtils = columnUtils;
            };
            DisplayedGroupCreator.prototype.createDisplayedGroups = function (sortedVisibleColumns, balancedColumnTree, groupInstanceIdCreator) {
                var _this = this;
                var result = [];
                var previousRealPath;
                var previousOriginalPath;
                // go through each column, then do a bottom up comparison to the previous column, and start
                // to share groups if they converge at any point.
                sortedVisibleColumns.forEach(function (currentColumn) {
                    var currentOriginalPath = _this.getOriginalPathForColumn(balancedColumnTree, currentColumn);
                    var currentRealPath = [];
                    var firstColumn = !previousOriginalPath;
                    for (var i = 0; i < currentOriginalPath.length; i++) {
                        if (firstColumn || currentOriginalPath[i] !== previousOriginalPath[i]) {
                            // new group needed
                            var originalGroup = currentOriginalPath[i];
                            var groupId = originalGroup.getGroupId();
                            var instanceId = groupInstanceIdCreator.getInstanceIdForKey(groupId);
                            var newGroup = new grid.ColumnGroup(originalGroup.getColGroupDef(), groupId, instanceId);
                            currentRealPath[i] = newGroup;
                            // if top level, add to result, otherwise add to parent
                            if (i == 0) {
                                result.push(newGroup);
                            }
                            else {
                                currentRealPath[i - 1].addChild(newGroup);
                            }
                        }
                        else {
                            // reuse old group
                            currentRealPath[i] = previousRealPath[i];
                        }
                    }
                    var noColumnGroups = currentRealPath.length === 0;
                    if (noColumnGroups) {
                        // if we are not grouping, then the result of the above is an empty
                        // path (no groups), and we just add the column to the root list.
                        result.push(currentColumn);
                    }
                    else {
                        var leafGroup = currentRealPath[currentRealPath.length - 1];
                        leafGroup.addChild(currentColumn);
                    }
                    previousRealPath = currentRealPath;
                    previousOriginalPath = currentOriginalPath;
                });
                this.columnUtils.deptFirstAllColumnTreeSearch(result, function (child) {
                    if (child instanceof grid.ColumnGroup) {
                        child.calculateExpandable();
                    }
                });
                return result;
            };
            DisplayedGroupCreator.prototype.createFakePath = function (balancedColumnTree) {
                var result = [];
                var currentChildren = balancedColumnTree;
                // this while look does search on the balanced tree, so our result is the right length
                var index = 0;
                while (currentChildren && currentChildren[0] && currentChildren[0] instanceof grid.OriginalColumnGroup) {
                    // putting in a deterministic fake id, in case the API in the future needs to reference the col
                    result.push(new grid.OriginalColumnGroup(null, 'FAKE_PATH_' + index));
                    currentChildren = currentChildren[0].getChildren();
                    index++;
                }
                return result;
            };
            DisplayedGroupCreator.prototype.getOriginalPathForColumn = function (balancedColumnTree, column) {
                var result = [];
                var found = false;
                recursePath(balancedColumnTree, 0);
                // it's possible we didn't find a path. this happens if the column is generated
                // by the grid, in that the definition didn't come from the client. in this case,
                // we create a fake original path.
                if (found) {
                    return result;
                }
                else {
                    return this.createFakePath(balancedColumnTree);
                }
                function recursePath(balancedColumnTree, dept) {
                    for (var i = 0; i < balancedColumnTree.length; i++) {
                        if (found) {
                            // quit the search, so 'result' is kept with the found result
                            return;
                        }
                        var node = balancedColumnTree[i];
                        if (node instanceof grid.OriginalColumnGroup) {
                            var nextNode = node;
                            recursePath(nextNode.getChildren(), dept + 1);
                            result[dept] = node;
                        }
                        else {
                            if (node === column) {
                                found = true;
                            }
                        }
                    }
                }
            };
            return DisplayedGroupCreator;
        })();
        grid.DisplayedGroupCreator = DisplayedGroupCreator;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="./originalColumnGroupChild.ts"/>
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var OriginalColumnGroup = (function () {
            function OriginalColumnGroup(colGroupDef, groupId) {
                this.colGroupDef = colGroupDef;
                this.groupId = groupId;
            }
            OriginalColumnGroup.prototype.getGroupId = function () {
                return this.groupId;
            };
            OriginalColumnGroup.prototype.setChildren = function (children) {
                this.children = children;
            };
            OriginalColumnGroup.prototype.getChildren = function () {
                return this.children;
            };
            OriginalColumnGroup.prototype.getColGroupDef = function () {
                return this.colGroupDef;
            };
            return OriginalColumnGroup;
        })();
        grid.OriginalColumnGroup = OriginalColumnGroup;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        // class returns a unique id to use for the column. it checks the existing columns, and if the requested
        // id is already taken, it will start appending numbers until it gets a unique id.
        // eg, if the col field is 'name', it will try ids: {name, name_1, name_2...}
        // if no field or id provided in the col, it will try the ids of natural numbers
        var ColumnKeyCreator = (function () {
            function ColumnKeyCreator() {
                this.existingKeys = [];
            }
            ColumnKeyCreator.prototype.getUniqueKey = function (colId, colField) {
                var count = 0;
                while (true) {
                    var idToTry;
                    if (colId) {
                        idToTry = colId;
                        if (count !== 0) {
                            idToTry += '_' + count;
                        }
                    }
                    else if (colField) {
                        idToTry = colField;
                        if (count !== 0) {
                            idToTry += '_' + count;
                        }
                    }
                    else {
                        idToTry = '' + count;
                    }
                    if (this.existingKeys.indexOf(idToTry) < 0) {
                        this.existingKeys.push(idToTry);
                        return idToTry;
                    }
                    count++;
                }
            };
            return ColumnKeyCreator;
        })();
        grid.ColumnKeyCreator = ColumnKeyCreator;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path='../entities/colDef.ts'/>
/// <reference path='../entities/column.ts'/>
/// <reference path='../entities/originalColumnGroup.ts'/>
/// <reference path='../logger.ts'/>
/// <reference path='columnKeyCreator.ts'/>
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        // takes in a list of columns, as specified by the column definitions, and returns column groups
        var BalancedColumnTreeBuilder = (function () {
            function BalancedColumnTreeBuilder() {
            }
            BalancedColumnTreeBuilder.prototype.init = function (gridOptionsWrapper, loggerFactory, columnUtils) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.columnUtils = columnUtils;
                this.logger = loggerFactory.create('BalancedColumnTreeBuilder');
            };
            BalancedColumnTreeBuilder.prototype.createBalancedColumnGroups = function (abstractColDefs) {
                // column key creator dishes out unique column id's in a deterministic way,
                // so if we have two grids (that cold be master/slave) with same column definitions,
                // then this ensures the two grids use identical id's.
                var columnKeyCreator = new grid.ColumnKeyCreator();
                // create am unbalanced tree that maps the provided definitions
                var unbalancedTree = this.recursivelyCreateColumns(abstractColDefs, 0, columnKeyCreator);
                var treeDept = this.findMaxDept(unbalancedTree, 0);
                this.logger.log('Number of levels for grouped columns is ' + treeDept);
                var balancedTree = this.balanceColumnTree(unbalancedTree, 0, treeDept, columnKeyCreator);
                return {
                    balancedTree: balancedTree,
                    treeDept: treeDept
                };
            };
            BalancedColumnTreeBuilder.prototype.balanceColumnTree = function (unbalancedTree, currentDept, columnDept, columnKeyCreator) {
                var _this = this;
                var result = [];
                // go through each child, for groups, recurse a level deeper,
                // for columns we need to pad
                unbalancedTree.forEach(function (child) {
                    if (child instanceof grid.OriginalColumnGroup) {
                        var originalGroup = child;
                        var newChildren = _this.balanceColumnTree(originalGroup.getChildren(), currentDept + 1, columnDept, columnKeyCreator);
                        originalGroup.setChildren(newChildren);
                        result.push(originalGroup);
                    }
                    else {
                        var newChild = child;
                        for (var i = columnDept - 1; i >= currentDept; i--) {
                            var newColId = columnKeyCreator.getUniqueKey(null, null);
                            var paddedGroup = new grid.OriginalColumnGroup(null, newColId);
                            paddedGroup.setChildren([newChild]);
                            newChild = paddedGroup;
                        }
                        result.push(newChild);
                    }
                });
                return result;
            };
            BalancedColumnTreeBuilder.prototype.findMaxDept = function (treeChildren, dept) {
                var maxDeptThisLevel = dept;
                for (var i = 0; i < treeChildren.length; i++) {
                    var abstractColumn = treeChildren[i];
                    if (abstractColumn instanceof grid.OriginalColumnGroup) {
                        var originalGroup = abstractColumn;
                        var newDept = this.findMaxDept(originalGroup.getChildren(), dept + 1);
                        if (maxDeptThisLevel < newDept) {
                            maxDeptThisLevel = newDept;
                        }
                    }
                }
                return maxDeptThisLevel;
            };
            BalancedColumnTreeBuilder.prototype.recursivelyCreateColumns = function (abstractColDefs, level, columnKeyCreator) {
                var _this = this;
                var result = [];
                if (!abstractColDefs) {
                    return result;
                }
                abstractColDefs.forEach(function (abstractColDef) {
                    _this.checkForDeprecatedItems(abstractColDef);
                    if (_this.isColumnGroup(abstractColDef)) {
                        var groupColDef = abstractColDef;
                        var groupId = columnKeyCreator.getUniqueKey(groupColDef.groupId, null);
                        var originalGroup = new grid.OriginalColumnGroup(groupColDef, groupId);
                        var children = _this.recursivelyCreateColumns(groupColDef.children, level + 1, columnKeyCreator);
                        originalGroup.setChildren(children);
                        result.push(originalGroup);
                    }
                    else {
                        var colDef = abstractColDef;
                        var width = _this.columnUtils.calculateColInitialWidth(colDef);
                        var colId = columnKeyCreator.getUniqueKey(colDef.colId, colDef.field);
                        var column = new grid.Column(colDef, width, colId);
                        result.push(column);
                    }
                });
                return result;
            };
            BalancedColumnTreeBuilder.prototype.checkForDeprecatedItems = function (colDef) {
                if (colDef) {
                    var colDefNoType = colDef; // take out the type, so we can access attributes not defined in the type
                    if (colDefNoType.group !== undefined) {
                        console.warn('ag-grid: colDef.group is invalid, please check documentation on how to do grouping as it changed in version 3');
                    }
                    if (colDefNoType.headerGroup !== undefined) {
                        console.warn('ag-grid: colDef.headerGroup is invalid, please check documentation on how to do grouping as it changed in version 3');
                    }
                    if (colDefNoType.headerGroupShow !== undefined) {
                        console.warn('ag-grid: colDef.headerGroupShow is invalid, should be columnGroupShow, please check documentation on how to do grouping as it changed in version 3');
                    }
                }
            };
            // if object has children, we assume it's a group
            BalancedColumnTreeBuilder.prototype.isColumnGroup = function (abstractColDef) {
                return abstractColDef.children !== undefined;
            };
            return BalancedColumnTreeBuilder;
        })();
        grid.BalancedColumnTreeBuilder = BalancedColumnTreeBuilder;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var AutoWidthCalculator = (function () {
            function AutoWidthCalculator() {
            }
            AutoWidthCalculator.prototype.init = function (rowRenderer, gridPanel) {
                this.gridPanel = gridPanel;
                this.rowRenderer = rowRenderer;
            };
            // this is the trick: we create a dummy container and clone all the cells
            // into the dummy, then check the dummy's width. then destroy the dummy
            // as we don't need it any more.
            // drawback: only the cells visible on the screen are considered
            AutoWidthCalculator.prototype.getPreferredWidthForColumn = function (column) {
                var eDummyContainer = document.createElement('span');
                // position fixed, so it isn't restricted to the boundaries of the parent
                eDummyContainer.style.position = 'fixed';
                eDummyContainer.style.backgroundColor = 'red';
                // we put the dummy into the body container, so it will inherit all the
                // css styles that the real cells are inheriting
                var eBodyContainer = this.gridPanel.getBodyContainer();
                eBodyContainer.appendChild(eDummyContainer);
                // get all the cells that are currently displayed (this only brings back
                // rendered cells, rows not rendered due to row visualisation will not be here)
                var eOriginalCells = this.rowRenderer.getAllCellsForColumn(column);
                eOriginalCells.forEach(function (eCell, index) {
                    // make a deep clone of the cell
                    var eCellClone = eCell.cloneNode(true);
                    // the original has a fixed width, we remove this to allow the natural width based on content
                    eCellClone.style.width = '';
                    // we put the cell into a containing div, as otherwise the cells would just line up
                    // on the same line, standard flow layout, by putting them into divs, they are laid
                    // out one per line
                    var eCloneParent = document.createElement('div');
                    // table-row, so that each cell is on a row. i also tried display='block', but this
                    // didn't work in IE
                    eCloneParent.style.display = 'table-row';
                    // the twig on the branch, the branch on the tree, the tree in the hole,
                    // the hole in the bog, the bog in the clone, the clone in the parent,
                    // the parent in the dummy, and the dummy down in the vall-e-ooo, OOOOOOOOO! Oh row the rattling bog....
                    eCloneParent.appendChild(eCellClone);
                    eDummyContainer.appendChild(eCloneParent);
                });
                // at this point, all the clones are lined up vertically with natural widths. the dummy
                // container will have a width wide enough just to fit the largest.
                var dummyContainerWidth = eDummyContainer.offsetWidth;
                // we are finished with the dummy container, so get rid of it
                eBodyContainer.removeChild(eDummyContainer);
                // we add 4 as I found without it, the gui still put '...' after some of the texts
                return dummyContainerWidth + 4;
            };
            return AutoWidthCalculator;
        })();
        grid.AutoWidthCalculator = AutoWidthCalculator;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../entities/column.ts" />
/// <reference path="../entities/columnGroup.ts" />
/// <reference path="../columnChangeEvent.ts" />
/// <reference path="../masterSlaveService.ts" />
/// <reference path="./displayedGroupCreator.ts" />
/// <reference path="./balancedColumnTreeBuilder.ts" />
/// <reference path="../rendering/autoWidthCalculator.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var constants = grid.Constants;
        var ColumnApi = (function () {
            function ColumnApi(_columnController) {
                this._columnController = _columnController;
            }
            ColumnApi.prototype.sizeColumnsToFit = function (gridWidth) { this._columnController.sizeColumnsToFit(gridWidth); };
            ColumnApi.prototype.setColumnGroupOpened = function (group, newValue, instanceId) { this._columnController.setColumnGroupOpened(group, newValue, instanceId); };
            ColumnApi.prototype.getColumnGroup = function (name, instanceId) { return this._columnController.getColumnGroup(name, instanceId); };
            ColumnApi.prototype.getDisplayNameForCol = function (column) { return this._columnController.getDisplayNameForCol(column); };
            ColumnApi.prototype.getColumn = function (key) { return this._columnController.getColumn(key); };
            ColumnApi.prototype.setState = function (columnState) { return this._columnController.setState(columnState); };
            ColumnApi.prototype.getState = function () { return this._columnController.getState(); };
            ColumnApi.prototype.resetState = function () { this._columnController.resetState(); };
            ColumnApi.prototype.isPinning = function () { return this._columnController.isPinningLeft() || this._columnController.isPinningRight(); };
            ColumnApi.prototype.isPinningLeft = function () { return this._columnController.isPinningLeft(); };
            ColumnApi.prototype.isPinningRight = function () { return this._columnController.isPinningRight(); };
            ColumnApi.prototype.getDisplayedColAfter = function (col) { return this._columnController.getDisplayedColAfter(col); };
            ColumnApi.prototype.getDisplayedColBefore = function (col) { return this._columnController.getDisplayedColBefore(col); };
            ColumnApi.prototype.setColumnVisible = function (key, visible) { this._columnController.setColumnVisible(key, visible); };
            ColumnApi.prototype.setColumnsVisible = function (keys, visible) { this._columnController.setColumnsVisible(keys, visible); };
            ColumnApi.prototype.setColumnPinned = function (key, pinned) { this._columnController.setColumnPinned(key, pinned); };
            ColumnApi.prototype.setColumnsPinned = function (keys, pinned) { this._columnController.setColumnsPinned(keys, pinned); };
            ColumnApi.prototype.getAllColumns = function () { return this._columnController.getAllColumns(); };
            ColumnApi.prototype.getDisplayedLeftColumns = function () { return this._columnController.getDisplayedLeftColumns(); };
            ColumnApi.prototype.getDisplayedCenterColumns = function () { return this._columnController.getDisplayedCenterColumns(); };
            ColumnApi.prototype.getDisplayedRightColumns = function () { return this._columnController.getDisplayedRightColumns(); };
            ColumnApi.prototype.getRowGroupColumns = function () { return this._columnController.getRowGroupColumns(); };
            ColumnApi.prototype.getValueColumns = function () { return this._columnController.getValueColumns(); };
            ColumnApi.prototype.moveColumn = function (fromIndex, toIndex) { this._columnController.moveColumn(fromIndex, toIndex); };
            ColumnApi.prototype.moveRowGroupColumn = function (fromIndex, toIndex) { this._columnController.moveRowGroupColumn(fromIndex, toIndex); };
            ColumnApi.prototype.setColumnAggFunction = function (column, aggFunc) { this._columnController.setColumnAggFunction(column, aggFunc); };
            ColumnApi.prototype.setColumnWidth = function (key, newWidth, finished) {
                if (finished === void 0) { finished = true; }
                this._columnController.setColumnWidth(key, newWidth, finished);
            };
            ColumnApi.prototype.removeValueColumn = function (column) { this._columnController.removeValueColumn(column); };
            ColumnApi.prototype.addValueColumn = function (column) { this._columnController.addValueColumn(column); };
            ColumnApi.prototype.removeRowGroupColumn = function (column) { this._columnController.removeRowGroupColumn(column); };
            ColumnApi.prototype.addRowGroupColumn = function (column) { this._columnController.addRowGroupColumn(column); };
            ColumnApi.prototype.getLeftDisplayedColumnGroups = function () { return this._columnController.getLeftDisplayedColumnGroups(); };
            ColumnApi.prototype.getCenterDisplayedColumnGroups = function () { return this._columnController.getCenterDisplayedColumnGroups(); };
            ColumnApi.prototype.getRightDisplayedColumnGroups = function () { return this._columnController.getRightDisplayedColumnGroups(); };
            ColumnApi.prototype.getAllDisplayedColumnGroups = function () { return this._columnController.getAllDisplayedColumnGroups(); };
            ColumnApi.prototype.autoSizeColumn = function (key) { return this._columnController.autoSizeColumn(key); };
            ColumnApi.prototype.autoSizeColumns = function (keys) { return this._columnController.autoSizeColumns(keys); };
            ColumnApi.prototype.columnGroupOpened = function (group, newValue) {
                console.error('ag-Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
                this.setColumnGroupOpened(group, newValue);
            };
            ColumnApi.prototype.hideColumns = function (colIds, hide) {
                console.error('ag-Grid: hideColumns is deprecated, use setColumnsVisible');
                this._columnController.setColumnsVisible(colIds, !hide);
            };
            ColumnApi.prototype.hideColumn = function (colId, hide) {
                console.error('ag-Grid: hideColumn is deprecated, use setColumnVisible');
                this._columnController.setColumnVisible(colId, !hide);
            };
            return ColumnApi;
        })();
        grid.ColumnApi = ColumnApi;
        var ColumnController = (function () {
            function ColumnController() {
                this.headerRowCount = 0;
                this.setupComplete = false;
            }
            ColumnController.prototype.init = function (angularGrid, selectionRendererFactory, gridOptionsWrapper, expressionService, valueService, masterSlaveController, eventService, balancedColumnTreeBuilder, displayedGroupCreator, columnUtils, autoWidthCalculator, loggerFactory) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.angularGrid = angularGrid;
                this.selectionRendererFactory = selectionRendererFactory;
                this.expressionService = expressionService;
                this.valueService = valueService;
                this.masterSlaveController = masterSlaveController;
                this.eventService = eventService;
                this.balancedColumnTreeBuilder = balancedColumnTreeBuilder;
                this.displayedGroupCreator = displayedGroupCreator;
                this.columnUtils = columnUtils;
                this.autoWidthCalculator = autoWidthCalculator;
                this.logger = loggerFactory.create('ColumnController');
            };
            ColumnController.prototype.autoSizeColumns = function (keys) {
                var _this = this;
                this.actionOnColumns(keys, function (column) {
                    var requiredWidth = _this.autoWidthCalculator.getPreferredWidthForColumn(column);
                    if (requiredWidth > 0) {
                        var newWidth = _this.normaliseColumnWidth(column, requiredWidth);
                        column.setActualWidth(newWidth);
                    }
                }, function () {
                    return new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_RESIZED).withFinished(true);
                });
            };
            ColumnController.prototype.autoSizeColumn = function (key) {
                this.autoSizeColumns([key]);
            };
            ColumnController.prototype.getColumnsFromTree = function (rootColumns) {
                var result = [];
                recursiveFindColumns(rootColumns);
                return result;
                function recursiveFindColumns(childColumns) {
                    for (var i = 0; i < childColumns.length; i++) {
                        var child = childColumns[i];
                        if (child instanceof grid.Column) {
                            result.push(child);
                        }
                        else if (child instanceof grid.OriginalColumnGroup) {
                            recursiveFindColumns(child.getChildren());
                        }
                    }
                }
            };
            ColumnController.prototype.getAllDisplayedColumnGroups = function () {
                if (this.displayedLeftColumnTree && this.displayedRightColumnTree && this.displayedCentreColumnTree) {
                    return this.displayedLeftColumnTree
                        .concat(this.displayedCentreColumnTree)
                        .concat(this.displayedRightColumnTree);
                }
                else {
                    return null;
                }
            };
            ColumnController.prototype.getColumnApi = function () {
                return new ColumnApi(this);
            };
            ColumnController.prototype.isSetupComplete = function () {
                return this.setupComplete;
            };
            // + gridPanel -> for resizing the body and setting top margin
            ColumnController.prototype.getHeaderRowCount = function () {
                return this.headerRowCount;
            };
            // + headerRenderer -> setting pinned body width
            ColumnController.prototype.getLeftDisplayedColumnGroups = function () {
                return this.displayedLeftColumnTree;
            };
            // + headerRenderer -> setting pinned body width
            ColumnController.prototype.getRightDisplayedColumnGroups = function () {
                return this.displayedRightColumnTree;
            };
            // + headerRenderer -> setting pinned body width
            ColumnController.prototype.getCenterDisplayedColumnGroups = function () {
                return this.displayedCentreColumnTree;
            };
            // + csvCreator
            ColumnController.prototype.getAllDisplayedColumns = function () {
                // order we add the arrays together is important, so the result
                // has the columns left to right, as they appear on the screen.
                return this.displayedLeftColumns
                    .concat(this.displayedCenterColumns)
                    .concat(this.displayedRightColumns);
            };
            // used by:
            // + angularGrid -> setting pinned body width
            ColumnController.prototype.getPinnedLeftContainerWidth = function () {
                return this.getWithOfColsInList(this.displayedLeftColumns);
            };
            ColumnController.prototype.getPinnedRightContainerWidth = function () {
                return this.getWithOfColsInList(this.displayedRightColumns);
            };
            ColumnController.prototype.addRowGroupColumn = function (column) {
                if (this.allColumns.indexOf(column) < 0) {
                    console.warn('not a valid column: ' + column);
                    return;
                }
                if (this.rowGroupColumns.indexOf(column) >= 0) {
                    console.warn('column is already a value column');
                    return;
                }
                this.rowGroupColumns.push(column);
                // because we could be taking out columns, the displayed
                // columns may differ, so need to work out all the columns again
                this.updateModel();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_ROW_GROUP_CHANGE);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, event);
            };
            ColumnController.prototype.removeRowGroupColumn = function (column) {
                if (this.rowGroupColumns.indexOf(column) < 0) {
                    console.warn('column not a row group');
                    return;
                }
                _.removeFromArray(this.rowGroupColumns, column);
                this.updateModel();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_ROW_GROUP_CHANGE);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, event);
            };
            ColumnController.prototype.addValueColumn = function (column) {
                if (this.allColumns.indexOf(column) < 0) {
                    console.warn('not a valid column: ' + column);
                    return;
                }
                if (this.valueColumns.indexOf(column) >= 0) {
                    console.warn('column is already a value column');
                    return;
                }
                if (!column.getAggFunc()) {
                    column.setAggFunc(grid.Column.AGG_SUM);
                }
                this.valueColumns.push(column);
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_VALUE_CHANGE);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_VALUE_CHANGE, event);
            };
            ColumnController.prototype.removeValueColumn = function (column) {
                if (this.valueColumns.indexOf(column) < 0) {
                    console.warn('column not a value');
                    return;
                }
                _.removeFromArray(this.valueColumns, column);
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_VALUE_CHANGE);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_VALUE_CHANGE, event);
            };
            ColumnController.prototype.doesColumnExistInGrid = function (column) {
                var columnInAllColumns = this.allColumns.indexOf(column) >= 0;
                var columnIsGroupAutoColumn = column === this.groupAutoColumn;
                return columnInAllColumns || columnIsGroupAutoColumn;
            };
            ColumnController.prototype.getFirstRightPinnedColIndex = function () {
                return this.displayedLeftColumns.length + this.displayedCenterColumns.length;
            };
            // returns the widht we can set to this col, taking into consideration min and max widths
            ColumnController.prototype.normaliseColumnWidth = function (column, newWidth) {
                if (newWidth < column.getMinimumWidth()) {
                    newWidth = column.getMinimumWidth();
                }
                if (column.isGreaterThanMax(newWidth)) {
                    newWidth = column.getColDef().maxWidth;
                }
                return newWidth;
            };
            ColumnController.prototype.setColumnWidth = function (key, newWidth, finished) {
                var column = this.getColumn(key);
                if (!column) {
                    return;
                }
                newWidth = this.normaliseColumnWidth(column, newWidth);
                // check for change first, to avoid unnecessary firing of events
                // however we always fire 'finished' events. this is important
                // when groups are resized, as if the group is changing slowly,
                // eg 1 pixel at a time, then each change will fire change events
                // in all the columns in the group, but only one with get the pixel.
                if (finished || column.getActualWidth() !== newWidth) {
                    column.setActualWidth(newWidth);
                    var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_RESIZED).withColumn(column).withFinished(finished);
                    this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_RESIZED, event);
                }
            };
            ColumnController.prototype.setColumnAggFunction = function (column, aggFunc) {
                column.setAggFunc(aggFunc);
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_VALUE_CHANGE);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_VALUE_CHANGE, event);
            };
            ColumnController.prototype.moveRowGroupColumn = function (fromIndex, toIndex) {
                var column = this.rowGroupColumns[fromIndex];
                this.rowGroupColumns.splice(fromIndex, 1);
                this.rowGroupColumns.splice(toIndex, 0, column);
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_ROW_GROUP_CHANGE);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, event);
            };
            ColumnController.prototype.moveColumn = function (fromIndex, toIndex) {
                var column = this.allColumns[fromIndex];
                this.allColumns.splice(fromIndex, 1);
                this.allColumns.splice(toIndex, 0, column);
                this.updateModel();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_MOVED)
                    .withFromIndex(fromIndex)
                    .withToIndex(toIndex);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_MOVED, event);
            };
            // used by:
            // + angularGrid -> for setting body width
            // + rowController -> setting main row widths (when inserting and resizing)
            ColumnController.prototype.getBodyContainerWidth = function () {
                var result = this.getWithOfColsInList(this.displayedCenterColumns);
                return result;
            };
            // + rowController
            ColumnController.prototype.getValueColumns = function () {
                return this.valueColumns;
            };
            // + toolPanel
            ColumnController.prototype.getRowGroupColumns = function () {
                return this.rowGroupColumns;
            };
            // + rowController -> while inserting rows
            ColumnController.prototype.getDisplayedCenterColumns = function () {
                return this.displayedCenterColumns;
            };
            // + rowController -> while inserting rows
            ColumnController.prototype.getDisplayedLeftColumns = function () {
                return this.displayedLeftColumns;
            };
            ColumnController.prototype.getDisplayedRightColumns = function () {
                return this.displayedRightColumns;
            };
            // used by:
            // + inMemoryRowController -> sorting, building quick filter text
            // + headerRenderer -> sorting (clearing icon)
            ColumnController.prototype.getAllColumns = function () {
                return this.allColumns;
            };
            ColumnController.prototype.setColumnVisible = function (key, visible) {
                this.setColumnsVisible([key], visible);
            };
            ColumnController.prototype.setColumnsVisible = function (keys, visible) {
                this.actionOnColumns(keys, function (column) {
                    column.setVisible(visible);
                }, function () {
                    return new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_VISIBLE).withVisible(visible);
                });
            };
            ColumnController.prototype.setColumnPinned = function (key, pinned) {
                this.setColumnsPinned([key], pinned);
            };
            ColumnController.prototype.setColumnsPinned = function (keys, pinned) {
                var actualPinned;
                if (pinned === true || pinned === grid.Column.PINNED_LEFT) {
                    actualPinned = grid.Column.PINNED_LEFT;
                }
                else if (pinned === grid.Column.PINNED_RIGHT) {
                    actualPinned = grid.Column.PINNED_RIGHT;
                }
                else {
                    actualPinned = null;
                }
                this.actionOnColumns(keys, function (column) {
                    column.setPinned(actualPinned);
                }, function () {
                    return new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_PINNED).withPinned(actualPinned);
                });
            };
            // does an action on a set of columns. provides common functionality for looking up the
            // columns based on key, getting a list of effected columns, and then updated the event
            // with either one column (if it was just one col) or a list of columns
            ColumnController.prototype.actionOnColumns = function (keys, action, createEvent) {
                var _this = this;
                if (!keys || keys.length === 0) {
                    return;
                }
                var updatedColumns = [];
                keys.forEach(function (key) {
                    var column = _this.getColumn(key);
                    if (!column) {
                        return;
                    }
                    action(column);
                    updatedColumns.push(column);
                });
                if (updatedColumns.length === 0) {
                    return;
                }
                this.updateModel();
                var event = createEvent();
                event.withColumns(updatedColumns);
                if (updatedColumns.length === 1) {
                    event.withColumn(updatedColumns[0]);
                }
                this.eventService.dispatchEvent(event.getType(), event);
            };
            ColumnController.prototype.getDisplayedColBefore = function (col) {
                var allDisplayedColumns = this.getAllDisplayedColumns();
                var oldIndex = allDisplayedColumns.indexOf(col);
                if (oldIndex > 0) {
                    return allDisplayedColumns[oldIndex - 1];
                }
                else {
                    return null;
                }
            };
            // used by:
            // + rowRenderer -> for navigation
            ColumnController.prototype.getDisplayedColAfter = function (col) {
                var allDisplayedColumns = this.getAllDisplayedColumns();
                var oldIndex = allDisplayedColumns.indexOf(col);
                if (oldIndex < (allDisplayedColumns.length - 1)) {
                    return allDisplayedColumns[oldIndex + 1];
                }
                else {
                    return null;
                }
            };
            ColumnController.prototype.isPinningLeft = function () {
                return this.displayedLeftColumns.length > 0;
            };
            ColumnController.prototype.isPinningRight = function () {
                return this.displayedRightColumns.length > 0;
            };
            ColumnController.prototype.getState = function () {
                if (!this.allColumns || this.allColumns.length < 0) {
                    return [];
                }
                var result = [];
                for (var i = 0; i < this.allColumns.length; i++) {
                    var column = this.allColumns[i];
                    var rowGroupIndex = this.rowGroupColumns.indexOf(column);
                    var resultItem = {
                        colId: column.getColId(),
                        hide: !column.isVisible(),
                        aggFunc: column.getAggFunc() ? column.getAggFunc() : null,
                        width: column.getActualWidth(),
                        pinned: column.getPinned(),
                        rowGroupIndex: rowGroupIndex >= 0 ? rowGroupIndex : null
                    };
                    result.push(resultItem);
                }
                return result;
            };
            ColumnController.prototype.resetState = function () {
                // we can't use 'allColumns' as the order might of messed up, so get the original ordered list
                var originalColumns = this.allColumns = this.getColumnsFromTree(this.originalBalancedTree);
                var state = [];
                if (originalColumns) {
                    originalColumns.forEach(function (column) {
                        state.push({
                            colId: column.getColId(),
                            aggFunc: column.getColDef().aggFunc,
                            hide: column.getColDef().hide,
                            pinned: column.getColDef().pinned,
                            rowGroupIndex: column.getColDef().rowGroupIndex,
                            width: column.getColDef().width
                        });
                    });
                }
                this.setState(state);
            };
            ColumnController.prototype.setState = function (columnState) {
                var _this = this;
                var oldColumnList = this.allColumns;
                this.allColumns = [];
                this.rowGroupColumns = [];
                this.valueColumns = [];
                if (columnState) {
                    columnState.forEach(function (stateItem) {
                        var oldColumn = _.find(oldColumnList, 'colId', stateItem.colId);
                        if (!oldColumn) {
                            console.warn('ag-grid: column ' + stateItem.colId + ' not found');
                            return;
                        }
                        // following ensures we are left with boolean true or false, eg converts (null, undefined, 0) all to true
                        oldColumn.setVisible(!stateItem.hide);
                        // sets pinned to 'left' or 'right'
                        oldColumn.setPinned(stateItem.pinned === true);
                        // if width provided and valid, use it, otherwise stick with the old width
                        if (stateItem.width >= constants.MIN_COL_WIDTH) {
                            oldColumn.setActualWidth(stateItem.width);
                        }
                        // accept agg func only if valid
                        var aggFuncValid = [grid.Column.AGG_MIN, grid.Column.AGG_MAX, grid.Column.AGG_SUM].indexOf(stateItem.aggFunc) >= 0;
                        if (aggFuncValid) {
                            oldColumn.setAggFunc(stateItem.aggFunc);
                            _this.valueColumns.push(oldColumn);
                        }
                        else {
                            oldColumn.setAggFunc(null);
                        }
                        // if rowGroup
                        if (typeof stateItem.rowGroupIndex === 'number' && stateItem.rowGroupIndex >= 0) {
                            _this.rowGroupColumns.push(oldColumn);
                        }
                        _this.allColumns.push(oldColumn);
                        oldColumnList.splice(oldColumnList.indexOf(oldColumn), 1);
                    });
                }
                // anything left over, we got no data for, so add in the column as non-value, non-rowGroup and hidden
                oldColumnList.forEach(function (oldColumn) {
                    oldColumn.setVisible(false);
                    oldColumn.setAggFunc(null);
                    oldColumn.setPinned(null);
                    _this.allColumns.push(oldColumn);
                });
                // sort the row group columns
                this.rowGroupColumns.sort(function (colA, colB) {
                    var rowGroupIndexA = -1;
                    var rowGroupIndexB = -1;
                    for (var i = 0; i < columnState.length; i++) {
                        var state = columnState[i];
                        if (state.colId === colA.getColId()) {
                            rowGroupIndexA = state.rowGroupIndex;
                        }
                        if (state.colId === colB.getColId()) {
                            rowGroupIndexB = state.rowGroupIndex;
                        }
                    }
                    return rowGroupIndexA - rowGroupIndexB;
                });
                this.updateModel();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED, event);
            };
            ColumnController.prototype.getColumns = function (keys) {
                var _this = this;
                var foundColumns = [];
                if (keys) {
                    keys.forEach(function (key) {
                        var column = _this.getColumn(key);
                        if (column) {
                            foundColumns.push(column);
                        }
                    });
                }
                return foundColumns;
            };
            ColumnController.prototype.getColumn = function (key) {
                if (!key) {
                    return null;
                }
                for (var i = 0; i < this.allColumns.length; i++) {
                    if (colMatches(this.allColumns[i])) {
                        return this.allColumns[i];
                    }
                }
                if (this.groupAutoColumn && colMatches(this.groupAutoColumn)) {
                    return this.groupAutoColumn;
                }
                function colMatches(column) {
                    var columnMatches = column === key;
                    var colDefMatches = column.getColDef() === key;
                    var idMatches = column.getColId() === key;
                    return columnMatches || colDefMatches || idMatches;
                }
                console.log('could not find column for key ' + key);
                return null;
            };
            ColumnController.prototype.getDisplayNameForCol = function (column) {
                var colDef = column.colDef;
                var headerValueGetter = colDef.headerValueGetter;
                if (headerValueGetter) {
                    var params = {
                        colDef: colDef,
                        api: this.gridOptionsWrapper.getApi(),
                        context: this.gridOptionsWrapper.getContext()
                    };
                    if (typeof headerValueGetter === 'function') {
                        // valueGetter is a function, so just call it
                        return headerValueGetter(params);
                    }
                    else if (typeof headerValueGetter === 'string') {
                        // valueGetter is an expression, so execute the expression
                        return this.expressionService.evaluate(headerValueGetter, params);
                    }
                    else {
                        console.warn('ag-grid: headerValueGetter must be a function or a string');
                    }
                }
                else if (colDef.displayName) {
                    console.warn("ag-grid: Found displayName " + colDef.displayName + ", please use headerName instead, displayName is deprecated.");
                    return colDef.displayName;
                }
                else {
                    return colDef.headerName;
                }
            };
            // returns the group with matching colId and instanceId. If instanceId is missing,
            // matches only on the colId.
            ColumnController.prototype.getColumnGroup = function (colId, instanceId) {
                if (!colId) {
                    return null;
                }
                if (colId instanceof grid.ColumnGroup) {
                    return colId;
                }
                var allColumnGroups = this.getAllDisplayedColumnGroups();
                var checkInstanceId = typeof instanceId === 'number';
                var result = null;
                this.columnUtils.deptFirstAllColumnTreeSearch(allColumnGroups, function (child) {
                    if (child instanceof grid.ColumnGroup) {
                        var columnGroup = child;
                        var matched;
                        if (checkInstanceId) {
                            matched = colId === columnGroup.getGroupId() && instanceId === columnGroup.getInstanceId();
                        }
                        else {
                            matched = colId === columnGroup.getGroupId();
                        }
                        if (matched) {
                            result = columnGroup;
                        }
                    }
                });
                return result;
            };
            // called by angularGrid
            ColumnController.prototype.onColumnsChanged = function () {
                var columnDefs = this.gridOptionsWrapper.getColumnDefs();
                var balancedTreeResult = this.balancedColumnTreeBuilder.createBalancedColumnGroups(columnDefs);
                this.originalBalancedTree = balancedTreeResult.balancedTree;
                this.headerRowCount = balancedTreeResult.treeDept + 1;
                this.allColumns = this.getColumnsFromTree(this.originalBalancedTree);
                this.extractRowGroupColumns();
                this.createValueColumns();
                this.updateModel();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED, event);
                this.setupComplete = true;
            };
            ColumnController.prototype.extractRowGroupColumns = function () {
                var _this = this;
                this.rowGroupColumns = [];
                // pull out the columns
                this.allColumns.forEach(function (column) {
                    if (typeof column.getColDef().rowGroupIndex === 'number') {
                        _this.rowGroupColumns.push(column);
                    }
                });
                // then sort them
                this.rowGroupColumns.sort(function (colA, colB) {
                    return colA.getColDef().rowGroupIndex - colB.getColDef().rowGroupIndex;
                });
            };
            // called by headerRenderer - when a header is opened or closed
            ColumnController.prototype.setColumnGroupOpened = function (passedGroup, newValue, instanceId) {
                var groupToUse = this.getColumnGroup(passedGroup, instanceId);
                if (!groupToUse) {
                    return;
                }
                this.logger.log('columnGroupOpened(' + groupToUse.getGroupId() + ',' + newValue + ')');
                groupToUse.setExpanded(newValue);
                this.updateGroupsAndDisplayedColumns();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_GROUP_OPENED).withColumnGroup(groupToUse);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_GROUP_OPENED, event);
            };
            ColumnController.prototype.updateModel = function () {
                // following 3 methods are only called from here
                this.createGroupAutoColumn();
                var visibleColumns = this.updateVisibleColumns();
                // only called from here
                this.buildAllGroups(visibleColumns);
                // this is also called when a group is opened or closed
                this.updateGroupsAndDisplayedColumns();
            };
            ColumnController.prototype.updateGroupsAndDisplayedColumns = function () {
                this.updateGroups();
                this.updateDisplayedColumnsFromGroups();
            };
            ColumnController.prototype.updateDisplayedColumnsFromGroups = function () {
                var _this = this;
                // if grouping, then only show col as per group rules
                this.displayedLeftColumns = [];
                this.displayedRightColumns = [];
                this.displayedCenterColumns = [];
                this.columnUtils.deptFirstDisplayedColumnTreeSearch(this.displayedLeftColumnTree, function (child) {
                    if (child instanceof grid.Column) {
                        _this.displayedLeftColumns.push(child);
                    }
                });
                this.columnUtils.deptFirstDisplayedColumnTreeSearch(this.displayedRightColumnTree, function (child) {
                    if (child instanceof grid.Column) {
                        _this.displayedRightColumns.push(child);
                    }
                });
                this.columnUtils.deptFirstDisplayedColumnTreeSearch(this.displayedCentreColumnTree, function (child) {
                    if (child instanceof grid.Column) {
                        _this.displayedCenterColumns.push(child);
                    }
                });
            };
            // called from api
            ColumnController.prototype.sizeColumnsToFit = function (gridWidth) {
                var _this = this;
                // avoid divide by zero
                var allDisplayedColumns = this.getAllDisplayedColumns();
                if (gridWidth <= 0 || allDisplayedColumns.length === 0) {
                    return;
                }
                var colsToNotSpread = _.filter(allDisplayedColumns, function (column) {
                    return column.getColDef().suppressSizeToFit === true;
                });
                var colsToSpread = _.filter(allDisplayedColumns, function (column) {
                    return column.getColDef().suppressSizeToFit !== true;
                });
                // make a copy of the cols that are going to be resized
                var colsToFireEventFor = colsToSpread.slice(0);
                var finishedResizing = false;
                while (!finishedResizing) {
                    finishedResizing = true;
                    var availablePixels = gridWidth - getTotalWidth(colsToNotSpread);
                    if (availablePixels <= 0) {
                        // no width, set everything to minimum
                        colsToSpread.forEach(function (column) {
                            column.setMinimum();
                        });
                    }
                    else {
                        var scale = availablePixels / getTotalWidth(colsToSpread);
                        // we set the pixels for the last col based on what's left, as otherwise
                        // we could be a pixel or two short or extra because of rounding errors.
                        var pixelsForLastCol = availablePixels;
                        // backwards through loop, as we are removing items as we go
                        for (var i = colsToSpread.length - 1; i >= 0; i--) {
                            var column = colsToSpread[i];
                            var newWidth = Math.round(column.getActualWidth() * scale);
                            if (newWidth < column.getMinimumWidth()) {
                                column.setMinimum();
                                moveToNotSpread(column);
                                finishedResizing = false;
                            }
                            else if (column.isGreaterThanMax(newWidth)) {
                                column.setActualWidth(column.getColDef().maxWidth);
                                moveToNotSpread(column);
                                finishedResizing = false;
                            }
                            else {
                                var onLastCol = i === 0;
                                if (onLastCol) {
                                    column.setActualWidth(pixelsForLastCol);
                                }
                                else {
                                    pixelsForLastCol -= newWidth;
                                    column.setActualWidth(newWidth);
                                }
                            }
                        }
                    }
                }
                // widths set, refresh the gui
                colsToFireEventFor.forEach(function (column) {
                    var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_RESIZED).withColumn(column);
                    _this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_RESIZED, event);
                });
                function moveToNotSpread(column) {
                    _.removeFromArray(colsToSpread, column);
                    colsToNotSpread.push(column);
                }
                function getTotalWidth(columns) {
                    var result = 0;
                    for (var i = 0; i < columns.length; i++) {
                        result += columns[i].getActualWidth();
                    }
                    return result;
                }
            };
            ColumnController.prototype.buildAllGroups = function (visibleColumns) {
                var leftVisibleColumns = _.filter(visibleColumns, function (column) {
                    return column.getPinned() === 'left';
                });
                var rightVisibleColumns = _.filter(visibleColumns, function (column) {
                    return column.getPinned() === 'right';
                });
                var centerVisibleColumns = _.filter(visibleColumns, function (column) {
                    return column.getPinned() !== 'left' && column.getPinned() !== 'right';
                });
                var groupInstanceIdCreator = new grid.GroupInstanceIdCreator();
                this.displayedLeftColumnTree = this.displayedGroupCreator.createDisplayedGroups(leftVisibleColumns, this.originalBalancedTree, groupInstanceIdCreator);
                this.displayedRightColumnTree = this.displayedGroupCreator.createDisplayedGroups(rightVisibleColumns, this.originalBalancedTree, groupInstanceIdCreator);
                this.displayedCentreColumnTree = this.displayedGroupCreator.createDisplayedGroups(centerVisibleColumns, this.originalBalancedTree, groupInstanceIdCreator);
            };
            ColumnController.prototype.updateGroups = function () {
                var allGroups = this.getAllDisplayedColumnGroups();
                this.columnUtils.deptFirstAllColumnTreeSearch(allGroups, function (child) {
                    if (child instanceof grid.ColumnGroup) {
                        var group = child;
                        group.calculateDisplayedColumns();
                    }
                });
            };
            ColumnController.prototype.createGroupAutoColumn = function () {
                // see if we need to insert the default grouping column
                var needAGroupColumn = this.rowGroupColumns.length > 0
                    && !this.gridOptionsWrapper.isGroupSuppressAutoColumn()
                    && !this.gridOptionsWrapper.isGroupUseEntireRow()
                    && !this.gridOptionsWrapper.isGroupSuppressRow();
                if (needAGroupColumn) {
                    // if one provided by user, use it, otherwise create one
                    var groupColDef = this.gridOptionsWrapper.getGroupColumnDef();
                    if (!groupColDef) {
                        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                        groupColDef = {
                            headerName: localeTextFunc('group', 'Group'),
                            cellRenderer: {
                                renderer: 'group'
                            }
                        };
                    }
                    var groupColumnWidth = this.columnUtils.calculateColInitialWidth(groupColDef);
                    var colId = 'ag-Grid-AutoColumn';
                    this.groupAutoColumn = new grid.Column(groupColDef, groupColumnWidth, colId);
                }
                else {
                    this.groupAutoColumn = null;
                }
            };
            ColumnController.prototype.updateVisibleColumns = function () {
                var visibleColumns = [];
                if (this.groupAutoColumn) {
                    visibleColumns.push(this.groupAutoColumn);
                }
                for (var i = 0; i < this.allColumns.length; i++) {
                    var column = this.allColumns[i];
                    var hideBecauseOfRowGroup = this.rowGroupColumns.indexOf(column) >= 0
                        && this.gridOptionsWrapper.isGroupHideGroupColumns();
                    if (column.isVisible() && !hideBecauseOfRowGroup) {
                        column.setIndex(visibleColumns.length);
                        visibleColumns.push(this.allColumns[i]);
                    }
                }
                return visibleColumns;
            };
            ColumnController.prototype.createValueColumns = function () {
                this.valueColumns = [];
                // override with columns that have the aggFunc specified explicitly
                for (var i = 0; i < this.allColumns.length; i++) {
                    var column = this.allColumns[i];
                    if (column.getColDef().aggFunc) {
                        column.setAggFunc(column.getColDef().aggFunc);
                        this.valueColumns.push(column);
                    }
                }
            };
            ColumnController.prototype.getWithOfColsInList = function (columnList) {
                var result = 0;
                for (var i = 0; i < columnList.length; i++) {
                    result += columnList[i].getActualWidth();
                }
                return result;
            };
            return ColumnController;
        })();
        grid.ColumnController = ColumnController;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var SVG_NS = "http://www.w3.org/2000/svg";
        var SvgFactory = (function () {
            function SvgFactory() {
            }
            SvgFactory.getInstance = function () {
                if (!this.theInstance) {
                    this.theInstance = new SvgFactory();
                }
                return this.theInstance;
            };
            SvgFactory.prototype.createFilterSvg = function () {
                var eSvg = createIconSvg();
                var eFunnel = document.createElementNS(SVG_NS, "polygon");
                eFunnel.setAttribute("points", "0,0 4,4 4,10 6,10 6,4 10,0");
                eFunnel.setAttribute("class", "ag-header-icon");
                eSvg.appendChild(eFunnel);
                return eSvg;
            };
            SvgFactory.prototype.createColumnShowingSvg = function () {
                return createCircle(true);
            };
            SvgFactory.prototype.createColumnHiddenSvg = function () {
                return createCircle(false);
            };
            SvgFactory.prototype.createMenuSvg = function () {
                var eSvg = document.createElementNS(SVG_NS, "svg");
                var size = "12";
                eSvg.setAttribute("width", size);
                eSvg.setAttribute("height", size);
                ["0", "5", "10"].forEach(function (y) {
                    var eLine = document.createElementNS(SVG_NS, "rect");
                    eLine.setAttribute("y", y);
                    eLine.setAttribute("width", size);
                    eLine.setAttribute("height", "2");
                    eLine.setAttribute("class", "ag-header-icon");
                    eSvg.appendChild(eLine);
                });
                return eSvg;
            };
            SvgFactory.prototype.createArrowUpSvg = function () {
                return createPolygonSvg("0,10 5,0 10,10");
            };
            SvgFactory.prototype.createArrowLeftSvg = function () {
                return createPolygonSvg("10,0 0,5 10,10");
            };
            SvgFactory.prototype.createArrowDownSvg = function () {
                return createPolygonSvg("0,0 5,10 10,0");
            };
            SvgFactory.prototype.createArrowRightSvg = function () {
                return createPolygonSvg("0,0 10,5 0,10");
            };
            SvgFactory.prototype.createSmallArrowDownSvg = function () {
                return createPolygonSvg("0,0 3,6 6,0", 6);
            };
            // UnSort Icon SVG
            SvgFactory.prototype.createArrowUpDownSvg = function () {
                var svg = createIconSvg();
                var eAscIcon = document.createElementNS(SVG_NS, "polygon");
                eAscIcon.setAttribute("points", '0,4 5,0 10,4');
                svg.appendChild(eAscIcon);
                var eDescIcon = document.createElementNS(SVG_NS, "polygon");
                eDescIcon.setAttribute("points", '0,6 5,10 10,6');
                svg.appendChild(eDescIcon);
                return svg;
            };
            return SvgFactory;
        })();
        grid.SvgFactory = SvgFactory;
        function createPolygonSvg(points, width) {
            var eSvg = createIconSvg(width);
            var eDescIcon = document.createElementNS(SVG_NS, "polygon");
            eDescIcon.setAttribute("points", points);
            eSvg.appendChild(eDescIcon);
            return eSvg;
        }
        // util function for the above
        function createIconSvg(width) {
            var eSvg = document.createElementNS(SVG_NS, "svg");
            if (width > 0) {
                eSvg.setAttribute("width", width);
                eSvg.setAttribute("height", width);
            }
            else {
                eSvg.setAttribute("width", "10");
                eSvg.setAttribute("height", "10");
            }
            return eSvg;
        }
        function createCircle(fill) {
            var eSvg = createIconSvg();
            var eCircle = document.createElementNS(SVG_NS, "circle");
            eCircle.setAttribute("cx", "5");
            eCircle.setAttribute("cy", "5");
            eCircle.setAttribute("r", "5");
            eCircle.setAttribute("stroke", "black");
            eCircle.setAttribute("stroke-width", "2");
            if (fill) {
                eCircle.setAttribute("fill", "black");
            }
            else {
                eCircle.setAttribute("fill", "none");
            }
            eSvg.appendChild(eCircle);
            return eSvg;
        }
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts"/>
/// <reference path="../svgFactory.ts"/>
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var svgFactory = grid.SvgFactory.getInstance();
        var HeaderTemplateLoader = (function () {
            function HeaderTemplateLoader() {
            }
            HeaderTemplateLoader.prototype.init = function (gridOptionsWrapper) {
                this.gridOptionsWrapper = gridOptionsWrapper;
            };
            HeaderTemplateLoader.prototype.createHeaderElement = function (column) {
                var params = {
                    column: column,
                    colDef: column.getColDef,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
                };
                // option 1 - see if user provided a template in colDef
                var userProvidedTemplate = column.getColDef().headerCellTemplate;
                if (typeof userProvidedTemplate === 'function') {
                    var colDefFunc = userProvidedTemplate;
                    userProvidedTemplate = colDefFunc(params);
                }
                // option 2 - check the gridOptions for cellTemplate
                if (!userProvidedTemplate && this.gridOptionsWrapper.getHeaderCellTemplate()) {
                    userProvidedTemplate = this.gridOptionsWrapper.getHeaderCellTemplate();
                }
                // option 3 - check the gridOptions for templateFunction
                if (!userProvidedTemplate && this.gridOptionsWrapper.getHeaderCellTemplateFunc()) {
                    var gridOptionsFunc = this.gridOptionsWrapper.getHeaderCellTemplateFunc();
                    userProvidedTemplate = gridOptionsFunc(params);
                }
                // finally, if still no template, use the default
                if (!userProvidedTemplate) {
                    userProvidedTemplate = this.createDefaultHeaderElement(column);
                }
                // template can be a string or a dom element, if string we need to convert to a dom element
                var result;
                if (typeof userProvidedTemplate === 'string') {
                    result = _.loadTemplate(userProvidedTemplate);
                }
                else if (_.isNodeOrElement(userProvidedTemplate)) {
                    result = userProvidedTemplate;
                }
                else {
                    console.error('ag-Grid: header template must be a string or an HTML element');
                }
                return result;
            };
            HeaderTemplateLoader.prototype.createDefaultHeaderElement = function (column) {
                var eTemplate = _.loadTemplate(HeaderTemplateLoader.HEADER_CELL_TEMPLATE);
                this.addInIcon(eTemplate, 'sortAscending', '#agSortAsc', column, svgFactory.createArrowUpSvg);
                this.addInIcon(eTemplate, 'sortDescending', '#agSortDesc', column, svgFactory.createArrowDownSvg);
                this.addInIcon(eTemplate, 'sortUnSort', '#agNoSort', column, svgFactory.createArrowUpDownSvg);
                this.addInIcon(eTemplate, 'menu', '#agMenu', column, svgFactory.createMenuSvg);
                this.addInIcon(eTemplate, 'filter', '#agFilter', column, svgFactory.createFilterSvg);
                return eTemplate;
            };
            HeaderTemplateLoader.prototype.addInIcon = function (eTemplate, iconName, cssSelector, column, defaultIconFactory) {
                var eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, column, defaultIconFactory);
                eTemplate.querySelector(cssSelector).appendChild(eIcon);
            };
            HeaderTemplateLoader.HEADER_CELL_TEMPLATE = '<div class="ag-header-cell">' +
                '  <div id="agResizeBar" class="ag-header-cell-resize"></div>' +
                '  <span id="agMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
                '  <div class="ag-header-cell-label">' +
                '    <span id="agSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
                '    <span id="agSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
                '    <span id="agNoSort" class="ag-header-icon ag-sort-none-icon"></span>' +
                '    <span id="agFilter" class="ag-header-icon ag-filter-icon"></span>' +
                '    <span id="agText" class="ag-header-cell-text"></span>' +
                '  </div>' +
                '</div>';
            return HeaderTemplateLoader;
        })();
        grid.HeaderTemplateLoader = HeaderTemplateLoader;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var TemplateService = (function () {
            function TemplateService() {
                this.templateCache = {};
                this.waitingCallbacks = {};
            }
            TemplateService.prototype.init = function ($scope) {
                this.$scope = $scope;
            };
            // returns the template if it is loaded, or null if it is not loaded
            // but will call the callback when it is loaded
            TemplateService.prototype.getTemplate = function (url, callback) {
                var templateFromCache = this.templateCache[url];
                if (templateFromCache) {
                    return templateFromCache;
                }
                var callbackList = this.waitingCallbacks[url];
                var that = this;
                if (!callbackList) {
                    // first time this was called, so need a new list for callbacks
                    callbackList = [];
                    this.waitingCallbacks[url] = callbackList;
                    // and also need to do the http request
                    var client = new XMLHttpRequest();
                    client.onload = function () {
                        that.handleHttpResult(this, url);
                    };
                    client.open("GET", url);
                    client.send();
                }
                // add this callback
                if (callback) {
                    callbackList.push(callback);
                }
                // caller needs to wait for template to load, so return null
                return null;
            };
            TemplateService.prototype.handleHttpResult = function (httpResult, url) {
                if (httpResult.status !== 200 || httpResult.response === null) {
                    console.warn('Unable to get template error ' + httpResult.status + ' - ' + url);
                    return;
                }
                // response success, so process it
                // in IE9 the response is in - responseText
                this.templateCache[url] = httpResult.response || httpResult.responseText;
                // inform all listeners that this is now in the cache
                var callbacks = this.waitingCallbacks[url];
                for (var i = 0; i < callbacks.length; i++) {
                    var callback = callbacks[i];
                    // we could pass the callback the response, however we know the client of this code
                    // is the cell renderer, and it passes the 'cellRefresh' method in as the callback
                    // which doesn't take any parameters.
                    callback();
                }
                if (this.$scope) {
                    var that = this;
                    setTimeout(function () {
                        that.$scope.$apply();
                    }, 0);
                }
            };
            return TemplateService;
        })();
        grid.TemplateService = TemplateService;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var SelectionRendererFactory = (function () {
            function SelectionRendererFactory() {
            }
            SelectionRendererFactory.prototype.init = function (angularGrid, selectionController) {
                this.angularGrid = angularGrid;
                this.selectionController = selectionController;
            };
            SelectionRendererFactory.prototype.createSelectionCheckbox = function (node, rowIndex) {
                var eCheckbox = document.createElement('input');
                eCheckbox.type = "checkbox";
                eCheckbox.name = "name";
                eCheckbox.className = 'ag-selection-checkbox';
                setCheckboxState(eCheckbox, this.selectionController.isNodeSelected(node));
                var that = this;
                eCheckbox.onclick = function (event) {
                    event.stopPropagation();
                };
                eCheckbox.onchange = function () {
                    var newValue = eCheckbox.checked;
                    if (newValue) {
                        that.selectionController.selectIndex(rowIndex, true);
                    }
                    else {
                        that.selectionController.deselectIndex(rowIndex);
                    }
                };
                this.angularGrid.addVirtualRowListener(rowIndex, {
                    rowSelected: function (selected) {
                        setCheckboxState(eCheckbox, selected);
                    },
                    rowRemoved: function () {
                    }
                });
                return eCheckbox;
            };
            return SelectionRendererFactory;
        })();
        grid.SelectionRendererFactory = SelectionRendererFactory;
        function setCheckboxState(eCheckbox, state) {
            if (typeof state === 'boolean') {
                eCheckbox.checked = state;
                eCheckbox.indeterminate = false;
            }
            else {
                // isNodeSelected returns back undefined if it's a group and the children
                // are a mix of selected and unselected
                eCheckbox.indeterminate = true;
            }
        }
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
var ag;
(function (ag) {
    var vdom;
    (function (vdom) {
        var _ = ag.grid.Utils;
        var VElement = (function () {
            function VElement() {
                this.id = VElement.idSequence++;
            }
            VElement.prototype.getId = function () {
                return this.id;
            };
            VElement.prototype.addElementAttachedListener = function (listener) {
                if (!this.elementAttachedListeners) {
                    this.elementAttachedListeners = [];
                }
                this.elementAttachedListeners.push(listener);
            };
            VElement.prototype.fireElementAttached = function (element) {
                if (!this.elementAttachedListeners) {
                    return;
                }
                for (var i = 0; i < this.elementAttachedListeners.length; i++) {
                    var listener = this.elementAttachedListeners[i];
                    listener(element);
                }
            };
            // abstract
            VElement.prototype.elementAttached = function (element) {
                this.fireElementAttached(element);
            };
            VElement.prototype.toHtmlString = function () { return null; };
            VElement.idSequence = 0;
            return VElement;
        })();
        vdom.VElement = VElement;
    })(vdom = ag.vdom || (ag.vdom = {}));
})(ag || (ag = {}));
/// <reference path="vElement.ts" />
/// <reference path="../utils.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ag;
(function (ag) {
    var vdom;
    (function (vdom) {
        var _ = ag.grid.Utils;
        var VHtmlElement = (function (_super) {
            __extends(VHtmlElement, _super);
            function VHtmlElement(type) {
                _super.call(this);
                this.style = {};
                this.type = type;
            }
            VHtmlElement.prototype.getElement = function () {
                return this.element;
            };
            VHtmlElement.prototype.setInnerHtml = function (innerHtml) {
                if (this.bound) {
                    this.element.innerHTML = innerHtml;
                }
                else {
                    this.innerHtml = innerHtml;
                }
            };
            VHtmlElement.prototype.addStyles = function (styles) {
                var _this = this;
                if (!styles) {
                    return;
                }
                if (!this.bound && !this.style) {
                    this.style = {};
                }
                _.iterateObject(styles, function (key, value) {
                    if (_this.bound) {
                        var style = _this.element.style;
                        style[key] = value;
                    }
                    else {
                        _this.style[key] = value;
                    }
                });
            };
            VHtmlElement.prototype.attachEventListeners = function (node) {
                if (!this.eventListeners) {
                    return;
                }
                for (var i = 0; i < this.eventListeners.length; i++) {
                    var listener = this.eventListeners[i];
                    node.addEventListener(listener.event, listener.listener);
                }
            };
            VHtmlElement.prototype.addClass = function (newClass) {
                if (this.bound) {
                    _.addCssClass(this.element, newClass);
                }
                else {
                    if (!this.classes) {
                        this.classes = [];
                    }
                    this.classes.push(newClass);
                }
            };
            VHtmlElement.prototype.removeClass = function (oldClass) {
                if (this.bound) {
                    _.removeCssClass(this.element, oldClass);
                }
                else {
                    if (!this.classes) {
                        return;
                    }
                    while (this.classes.indexOf(oldClass) >= 0) {
                        _.removeFromArray(this.classes, oldClass);
                    }
                }
            };
            VHtmlElement.prototype.addClasses = function (classes) {
                if (!classes || classes.length <= 0) {
                    return;
                }
                if (this.bound) {
                    for (var i = 0; i < classes.length; i++) {
                        _.addCssClass(this.element, classes[i]);
                    }
                }
                else {
                    if (!this.classes) {
                        this.classes = [];
                    }
                    for (var j = 0; j < classes.length; j++) {
                        this.classes.push(classes[j]);
                    }
                }
            };
            VHtmlElement.prototype.toHtmlString = function () {
                var buff = '';
                // opening element
                buff += '<' + this.type + ' v_element_id="' + this.getId() + '" ';
                buff += this.toHtmlStringClasses();
                buff += this.toHtmlStringAttributes();
                buff += this.toHtmlStringStyles();
                buff += '>';
                // contents
                if (this.innerHtml !== null && this.innerHtml !== undefined) {
                    buff += this.innerHtml;
                }
                buff += this.toHtmlStringChildren();
                // closing element
                buff += '</' + this.type + '>';
                return buff;
            };
            VHtmlElement.prototype.toHtmlStringChildren = function () {
                if (!this.children) {
                    return '';
                }
                var result = '';
                for (var i = 0; i < this.children.length; i++) {
                    result += this.children[i].toHtmlString();
                }
                return result;
            };
            VHtmlElement.prototype.toHtmlStringAttributes = function () {
                if (!this.attributes) {
                    return '';
                }
                var result = '';
                _.iterateObject(this.attributes, function (key, value) {
                    result += ' ' + key + '="' + value + '"';
                });
                return result;
            };
            VHtmlElement.prototype.toHtmlStringClasses = function () {
                if (!this.classes) {
                    return '';
                }
                return ' class="' + this.classes.join(' ') + '"';
            };
            VHtmlElement.prototype.toHtmlStringStyles = function () {
                var result = ' style="';
                var atLeastOne = false;
                _.iterateObject(this.style, function (key, value) {
                    result += ' ' + key + ': ' + value + ';';
                    atLeastOne = true;
                });
                result += '"';
                if (atLeastOne) {
                    return result;
                }
                else {
                    return '';
                }
            };
            VHtmlElement.prototype.appendChild = function (child) {
                if (this.bound) {
                    if (_.isNodeOrElement(child)) {
                        this.element.appendChild(child);
                    }
                    else {
                        console.error('cannot appendChild with virtual child to already bound VHTMLElement');
                    }
                }
                else {
                    if (!this.children) {
                        this.children = [];
                    }
                    if (_.isNodeOrElement(child)) {
                        this.children.push(new vdom.VWrapperElement(child));
                    }
                    else {
                        this.children.push(child);
                    }
                }
            };
            VHtmlElement.prototype.setAttribute = function (key, value) {
                if (this.bound) {
                    this.element.setAttribute(key, value);
                }
                else {
                    if (!this.attributes) {
                        this.attributes = {};
                    }
                    this.attributes[key] = value;
                }
            };
            VHtmlElement.prototype.addEventListener = function (event, listener) {
                if (this.bound) {
                    this.element.addEventListener(event, listener);
                }
                else {
                    if (!this.eventListeners) {
                        this.eventListeners = [];
                    }
                    var entry = new VEventListener(event, listener);
                    this.eventListeners.push(entry);
                }
            };
            VHtmlElement.prototype.elementAttached = function (element) {
                _super.prototype.elementAttached.call(this, element);
                this.element = element;
                this.attachEventListeners(element);
                this.fireElementAttachedToChildren(element);
                this.bound = true;
            };
            VHtmlElement.prototype.fireElementAttachedToChildren = function (element) {
                if (!this.children) {
                    return;
                }
                for (var i = 0; i < this.children.length; i++) {
                    var child = this.children[i];
                    var childElement = element.querySelector('[v_element_id="' + child.getId() + '"]');
                    child.elementAttached(childElement);
                }
            };
            return VHtmlElement;
        })(vdom.VElement);
        vdom.VHtmlElement = VHtmlElement;
        var VEventListener = (function () {
            function VEventListener(event, listener) {
                this.event = event;
                this.listener = listener;
            }
            return VEventListener;
        })();
    })(vdom = ag.vdom || (ag.vdom = {}));
})(ag || (ag = {}));
/// <reference path="vElement.ts" />
var ag;
(function (ag) {
    var vdom;
    (function (vdom) {
        var VWrapperElement = (function (_super) {
            __extends(VWrapperElement, _super);
            function VWrapperElement(wrappedElement) {
                _super.call(this);
                this.wrappedElement = wrappedElement;
            }
            VWrapperElement.prototype.toHtmlString = function () {
                return '<span v_element_id="' + this.getId() + '"></span>';
            };
            VWrapperElement.prototype.elementAttached = function (element) {
                var parent = element.parentNode;
                parent.insertBefore(this.wrappedElement, element);
                parent.removeChild(element);
            };
            return VWrapperElement;
        })(vdom.VElement);
        vdom.VWrapperElement = VWrapperElement;
    })(vdom = ag.vdom || (ag.vdom = {}));
})(ag || (ag = {}));
/// <reference path='../columnController/columnController.ts' />
/// <reference path='../utils.ts' />
/// <reference path="../gridOptionsWrapper.ts" />
/// <reference path="../expressionService.ts" />
/// <reference path="../selectionRendererFactory.ts" />
/// <reference path="rowRenderer.ts" />
/// <reference path="../selectionController.ts" />
/// <reference path="../templateService.ts" />
/// <reference path="../virtualDom/vHtmlElement.ts" />
/// <reference path="../virtualDom/vWrapperElement.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var RenderedCell = (function () {
            function RenderedCell(firstRightPinnedCol, column, $compile, rowRenderer, gridOptionsWrapper, expressionService, selectionRendererFactory, selectionController, templateService, cellRendererMap, node, rowIndex, colIndex, scope, columnController, valueService, eventService) {
                this.firstRightPinnedColumn = firstRightPinnedCol;
                this.column = column;
                this.rowRenderer = rowRenderer;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.expressionService = expressionService;
                this.selectionRendererFactory = selectionRendererFactory;
                this.selectionController = selectionController;
                this.cellRendererMap = cellRendererMap;
                this.$compile = $compile;
                this.templateService = templateService;
                this.columnController = columnController;
                this.valueService = valueService;
                this.eventService = eventService;
                this.node = node;
                this.rowIndex = rowIndex;
                this.colIndex = colIndex;
                this.scope = scope;
                this.data = this.getDataForRow();
                this.value = this.getValue();
                this.checkboxSelection = this.calculateCheckboxSelection();
                this.setupComponents();
            }
            RenderedCell.prototype.calculateCheckboxSelection = function () {
                // never allow selection on floating rows
                if (this.node.floating) {
                    return false;
                }
                // if boolean set, then just use it
                var colDef = this.column.getColDef();
                if (typeof colDef.checkboxSelection === 'boolean') {
                    return colDef.checkboxSelection;
                }
                // if function, then call the function to find out. we first check colDef for
                // a function, and if missing then check gridOptions, so colDef has precedence
                var selectionFunc;
                if (typeof colDef.checkboxSelection === 'function') {
                    selectionFunc = colDef.checkboxSelection;
                }
                if (!selectionFunc && this.gridOptionsWrapper.getCheckboxSelection()) {
                    selectionFunc = this.gridOptionsWrapper.getCheckboxSelection();
                }
                if (selectionFunc) {
                    var params = this.createParams();
                    return selectionFunc(params);
                }
                return false;
            };
            RenderedCell.prototype.getColumn = function () {
                return this.column;
            };
            RenderedCell.prototype.getValue = function () {
                return this.valueService.getValue(this.column.getColDef(), this.data, this.node);
            };
            RenderedCell.prototype.getVGridCell = function () {
                return this.vGridCell;
            };
            RenderedCell.prototype.getDataForRow = function () {
                if (this.node.footer) {
                    // if footer, we always show the data
                    return this.node.data;
                }
                else if (this.node.group) {
                    // if header and header is expanded, we show data in footer only
                    var footersEnabled = this.gridOptionsWrapper.isGroupIncludeFooter();
                    var suppressHideHeader = this.gridOptionsWrapper.isGroupSuppressBlankHeader();
                    if (this.node.expanded && footersEnabled && !suppressHideHeader) {
                        return undefined;
                    }
                    else {
                        return this.node.data;
                    }
                }
                else {
                    // otherwise it's a normal node, just return data as normal
                    return this.node.data;
                }
            };
            RenderedCell.prototype.setupComponents = function () {
                this.vGridCell = new ag.vdom.VHtmlElement("div");
                this.vGridCell.setAttribute("col", (this.column.getIndex() !== undefined && this.column.getIndex() !== null) ? this.column.getIndex().toString() : '');
                this.vGridCell.setAttribute("colId", this.column.getColId());
                // only set tab index if cell selection is enabled
                if (!this.gridOptionsWrapper.isSuppressCellSelection() && !this.node.floating) {
                    this.vGridCell.setAttribute("tabindex", "-1");
                }
                // these are the grid styles, don't change between soft refreshes
                this.addClasses();
                this.addCellClickedHandler();
                this.addCellDoubleClickedHandler();
                this.addCellContextMenuHandler();
                if (!this.node.floating) {
                    this.addCellNavigationHandler();
                }
                this.vGridCell.addStyles({ width: this.column.getActualWidth() + "px" });
                this.createParentOfValue();
                this.populateCell();
                if (this.eCheckbox) {
                    this.setSelected(this.selectionController.isNodeSelected(this.node));
                }
            };
            // called by rowRenderer when user navigates via tab key
            RenderedCell.prototype.startEditing = function (key) {
                var _this = this;
                var that = this;
                this.editingCell = true;
                _.removeAllChildren(this.vGridCell.getElement());
                var eInput = document.createElement('input');
                eInput.type = 'text';
                _.addCssClass(eInput, 'ag-cell-edit-input');
                var startWithOldValue = key !== grid.Constants.KEY_BACKSPACE && key !== grid.Constants.KEY_DELETE;
                var value = this.getValue();
                if (startWithOldValue && value !== null && value !== undefined) {
                    eInput.value = value;
                }
                eInput.style.width = (this.column.getActualWidth() - 14) + 'px';
                this.vGridCell.appendChild(eInput);
                eInput.focus();
                eInput.select();
                var blurListener = function () {
                    that.stopEditing(eInput, blurListener);
                };
                //stop entering if we loose focus
                eInput.addEventListener("blur", blurListener);
                //stop editing if enter pressed
                eInput.addEventListener('keypress', function (event) {
                    var key = event.which || event.keyCode;
                    if (key === grid.Constants.KEY_ENTER) {
                        _this.stopEditing(eInput, blurListener);
                        _this.focusCell(true);
                    }
                });
                //stop editing if enter pressed
                eInput.addEventListener('keydown', function (event) {
                    var key = event.which || event.keyCode;
                    if (key === grid.Constants.KEY_ESCAPE) {
                        _this.stopEditing(eInput, blurListener, true);
                        _this.focusCell(true);
                    }
                });
                // tab key doesn't generate keypress, so need keydown to listen for that
                eInput.addEventListener('keydown', function (event) {
                    var key = event.which || event.keyCode;
                    if (key == grid.Constants.KEY_TAB) {
                        that.stopEditing(eInput, blurListener);
                        that.rowRenderer.startEditingNextCell(that.rowIndex, that.column, event.shiftKey);
                        // we don't want the default tab action, so return false, this stops the event from bubbling
                        event.preventDefault();
                        return false;
                    }
                });
            };
            RenderedCell.prototype.focusCell = function (forceBrowserFocus) {
                this.rowRenderer.focusCell(this.vGridCell.getElement(), this.rowIndex, this.column.getIndex(), this.column.getColDef(), forceBrowserFocus);
            };
            RenderedCell.prototype.stopEditing = function (eInput, blurListener, reset) {
                if (reset === void 0) { reset = false; }
                this.editingCell = false;
                var newValue = eInput.value;
                var colDef = this.column.getColDef();
                //If we don't remove the blur listener first, we get:
                //Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is no longer a child of this node. Perhaps it was moved in a 'blur' event handler?
                eInput.removeEventListener('blur', blurListener);
                if (!reset) {
                    var paramsForCallbacks = {
                        node: this.node,
                        data: this.node.data,
                        oldValue: this.node.data[colDef.field],
                        newValue: newValue,
                        rowIndex: this.rowIndex,
                        colDef: colDef,
                        api: this.gridOptionsWrapper.getApi(),
                        context: this.gridOptionsWrapper.getContext()
                    };
                    if (colDef.newValueHandler) {
                        colDef.newValueHandler(paramsForCallbacks);
                    }
                    else {
                        this.node.data[colDef.field] = newValue;
                    }
                    // at this point, the value has been updated
                    this.value = this.getValue();
                    paramsForCallbacks.newValue = this.value;
                    if (typeof colDef.onCellValueChanged === 'function') {
                        colDef.onCellValueChanged(paramsForCallbacks);
                    }
                    this.eventService.dispatchEvent(grid.Events.EVENT_CELL_VALUE_CHANGED, paramsForCallbacks);
                }
                _.removeAllChildren(this.vGridCell.getElement());
                if (this.checkboxSelection) {
                    this.vGridCell.appendChild(this.vCellWrapper.getElement());
                }
                this.refreshCell();
            };
            RenderedCell.prototype.createParams = function () {
                var params = {
                    node: this.node,
                    data: this.node.data,
                    value: this.value,
                    rowIndex: this.rowIndex,
                    colIndex: this.colIndex,
                    colDef: this.column.getColDef(),
                    $scope: this.scope,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
                };
                return params;
            };
            RenderedCell.prototype.createEvent = function (event, eventSource) {
                var agEvent = this.createParams();
                agEvent.event = event;
                agEvent.eventSource = eventSource;
                return agEvent;
            };
            RenderedCell.prototype.addCellDoubleClickedHandler = function () {
                var that = this;
                var colDef = this.column.getColDef();
                this.vGridCell.addEventListener('dblclick', function (event) {
                    // always dispatch event to eventService
                    var agEvent = that.createEvent(event, this);
                    that.eventService.dispatchEvent(grid.Events.EVENT_CELL_DOUBLE_CLICKED, agEvent);
                    // check if colDef also wants to handle event
                    if (typeof colDef.onCellDoubleClicked === 'function') {
                        colDef.onCellDoubleClicked(agEvent);
                    }
                    if (!that.gridOptionsWrapper.isSingleClickEdit() && that.isCellEditable()) {
                        that.startEditing();
                    }
                });
            };
            RenderedCell.prototype.addCellContextMenuHandler = function () {
                var that = this;
                var colDef = this.column.getColDef();
                this.vGridCell.addEventListener('contextmenu', function (event) {
                    var agEvent = that.createEvent(event, this);
                    that.eventService.dispatchEvent(grid.Events.EVENT_CELL_CONTEXT_MENU, agEvent);
                    if (colDef.onCellContextMenu) {
                        colDef.onCellContextMenu(agEvent);
                    }
                });
            };
            RenderedCell.prototype.isCellEditable = function () {
                if (this.editingCell) {
                    return false;
                }
                // never allow editing of groups
                if (this.node.group) {
                    return false;
                }
                // if boolean set, then just use it
                var colDef = this.column.getColDef();
                if (typeof colDef.editable === 'boolean') {
                    return colDef.editable;
                }
                // if function, then call the function to find out
                if (typeof colDef.editable === 'function') {
                    var params = this.createParams();
                    var editableFunc = colDef.editable;
                    return editableFunc(params);
                }
                return false;
            };
            RenderedCell.prototype.addCellClickedHandler = function () {
                var colDef = this.column.getColDef();
                var that = this;
                this.vGridCell.addEventListener("click", function (event) {
                    // we pass false to focusCell, as we don't want the cell to focus
                    // also get the browser focus. if we did, then the cellRenderer could
                    // have a text field in it, for example, and as the user clicks on the
                    // text field, the text field, the focus doesn't get to the text
                    // field, instead to goes to the div behind, making it impossible to
                    // select the text field.
                    if (!that.node.floating) {
                        that.focusCell(false);
                    }
                    var agEvent = that.createEvent(event, this);
                    that.eventService.dispatchEvent(grid.Events.EVENT_CELL_CLICKED, agEvent);
                    if (colDef.onCellClicked) {
                        colDef.onCellClicked(agEvent);
                    }
                    if (that.gridOptionsWrapper.isSingleClickEdit() && that.isCellEditable()) {
                        that.startEditing();
                    }
                });
            };
            RenderedCell.prototype.populateCell = function () {
                // populate
                this.putDataIntoCell();
                // style
                this.addStylesFromCollDef();
                this.addClassesFromCollDef();
                this.addClassesFromRules();
            };
            RenderedCell.prototype.addStylesFromCollDef = function () {
                var colDef = this.column.getColDef();
                if (colDef.cellStyle) {
                    var cssToUse;
                    if (typeof colDef.cellStyle === 'function') {
                        var cellStyleParams = {
                            value: this.value,
                            data: this.node.data,
                            node: this.node,
                            colDef: colDef,
                            column: this.column,
                            $scope: this.scope,
                            context: this.gridOptionsWrapper.getContext(),
                            api: this.gridOptionsWrapper.getApi()
                        };
                        var cellStyleFunc = colDef.cellStyle;
                        cssToUse = cellStyleFunc(cellStyleParams);
                    }
                    else {
                        cssToUse = colDef.cellStyle;
                    }
                    if (cssToUse) {
                        this.vGridCell.addStyles(cssToUse);
                    }
                }
            };
            RenderedCell.prototype.addClassesFromCollDef = function () {
                var _this = this;
                var colDef = this.column.getColDef();
                if (colDef.cellClass) {
                    var classToUse;
                    if (typeof colDef.cellClass === 'function') {
                        var cellClassParams = {
                            value: this.value,
                            data: this.node.data,
                            node: this.node,
                            colDef: colDef,
                            $scope: this.scope,
                            context: this.gridOptionsWrapper.getContext(),
                            api: this.gridOptionsWrapper.getApi()
                        };
                        var cellClassFunc = colDef.cellClass;
                        classToUse = cellClassFunc(cellClassParams);
                    }
                    else {
                        classToUse = colDef.cellClass;
                    }
                    if (typeof classToUse === 'string') {
                        this.vGridCell.addClass(classToUse);
                    }
                    else if (Array.isArray(classToUse)) {
                        classToUse.forEach(function (cssClassItem) {
                            _this.vGridCell.addClass(cssClassItem);
                        });
                    }
                }
            };
            RenderedCell.prototype.addClassesFromRules = function () {
                var colDef = this.column.getColDef();
                var classRules = colDef.cellClassRules;
                if (typeof classRules === 'object' && classRules !== null) {
                    var params = {
                        value: this.value,
                        data: this.node.data,
                        node: this.node,
                        colDef: colDef,
                        rowIndex: this.rowIndex,
                        api: this.gridOptionsWrapper.getApi(),
                        context: this.gridOptionsWrapper.getContext()
                    };
                    var classNames = Object.keys(classRules);
                    for (var i = 0; i < classNames.length; i++) {
                        var className = classNames[i];
                        var rule = classRules[className];
                        var resultOfRule;
                        if (typeof rule === 'string') {
                            resultOfRule = this.expressionService.evaluate(rule, params);
                        }
                        else if (typeof rule === 'function') {
                            resultOfRule = rule(params);
                        }
                        if (resultOfRule) {
                            this.vGridCell.addClass(className);
                        }
                        else {
                            this.vGridCell.removeClass(className);
                        }
                    }
                }
            };
            // rename this to 'add key event listener
            RenderedCell.prototype.addCellNavigationHandler = function () {
                var that = this;
                this.vGridCell.addEventListener('keydown', function (event) {
                    if (that.editingCell) {
                        return;
                    }
                    // only interested on key presses that are directly on this element, not any children elements. this
                    // stops navigation if the user is in, for example, a text field inside the cell, and user hits
                    // on of the keys we are looking for.
                    if (event.target !== that.vGridCell.getElement()) {
                        return;
                    }
                    var key = event.which || event.keyCode;
                    var startNavigation = key === grid.Constants.KEY_DOWN || key === grid.Constants.KEY_UP
                        || key === grid.Constants.KEY_LEFT || key === grid.Constants.KEY_RIGHT;
                    if (startNavigation) {
                        event.preventDefault();
                        that.rowRenderer.navigateToNextCell(key, that.rowIndex, that.column);
                        return;
                    }
                    var startEdit = that.isKeycodeForStartEditing(key);
                    if (startEdit && that.isCellEditable()) {
                        that.startEditing(key);
                        // if we don't prevent default, then the editor that get displayed also picks up the 'enter key'
                        // press, and stops editing immediately, hence giving he user experience that nothing happened
                        event.preventDefault();
                        return;
                    }
                    var selectRow = key === grid.Constants.KEY_SPACE;
                    if (selectRow && that.gridOptionsWrapper.isRowSelection()) {
                        var selected = that.selectionController.isNodeSelected(that.node);
                        if (selected) {
                            that.selectionController.deselectNode(that.node);
                        }
                        else {
                            that.selectionController.selectNode(that.node, true);
                        }
                        event.preventDefault();
                        return;
                    }
                });
            };
            RenderedCell.prototype.isKeycodeForStartEditing = function (key) {
                return key === grid.Constants.KEY_ENTER || key === grid.Constants.KEY_BACKSPACE || key === grid.Constants.KEY_DELETE;
            };
            RenderedCell.prototype.createSelectionCheckbox = function () {
                this.eCheckbox = document.createElement('input');
                this.eCheckbox.type = "checkbox";
                this.eCheckbox.name = "name";
                this.eCheckbox.className = 'ag-selection-checkbox';
                this.eCheckbox.addEventListener('click', function (event) {
                    event.stopPropagation();
                });
                var that = this;
                this.checkboxOnChangeListener = function () {
                    var newValue = that.eCheckbox.checked;
                    if (newValue) {
                        that.selectionController.selectIndex(that.rowIndex, true);
                    }
                    else {
                        that.selectionController.deselectIndex(that.rowIndex);
                    }
                };
                this.eCheckbox.onchange = this.checkboxOnChangeListener;
            };
            RenderedCell.prototype.setSelected = function (state) {
                if (!this.eCheckbox) {
                    return;
                }
                this.eCheckbox.onchange = null;
                if (typeof state === 'boolean') {
                    this.eCheckbox.checked = state;
                    this.eCheckbox.indeterminate = false;
                }
                else {
                    // isNodeSelected returns back undefined if it's a group and the children
                    // are a mix of selected and unselected
                    this.eCheckbox.indeterminate = true;
                }
                this.eCheckbox.onchange = this.checkboxOnChangeListener;
            };
            RenderedCell.prototype.createParentOfValue = function () {
                if (this.checkboxSelection) {
                    this.vCellWrapper = new ag.vdom.VHtmlElement('span');
                    this.vCellWrapper.addClass('ag-cell-wrapper');
                    this.vGridCell.appendChild(this.vCellWrapper);
                    this.createSelectionCheckbox();
                    this.vCellWrapper.appendChild(new ag.vdom.VWrapperElement(this.eCheckbox));
                    // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
                    this.vSpanWithValue = new ag.vdom.VHtmlElement('span');
                    this.vSpanWithValue.addClass('ag-cell-value');
                    this.vCellWrapper.appendChild(this.vSpanWithValue);
                    this.vParentOfValue = this.vSpanWithValue;
                }
                else {
                    this.vGridCell.addClass('ag-cell-value');
                    this.vParentOfValue = this.vGridCell;
                }
            };
            RenderedCell.prototype.isVolatile = function () {
                return this.column.getColDef().volatile;
            };
            RenderedCell.prototype.refreshCell = function () {
                _.removeAllChildren(this.vParentOfValue.getElement());
                this.value = this.getValue();
                this.populateCell();
                if (this.checkboxSelection) {
                    this.setSelected(this.selectionController.isNodeSelected(this.node));
                }
                // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
                if (this.gridOptionsWrapper.isAngularCompileRows()) {
                    this.$compile(this.vGridCell.getElement())(this.scope);
                }
            };
            RenderedCell.prototype.putDataIntoCell = function () {
                // template gets preference, then cellRenderer, then do it ourselves
                var colDef = this.column.getColDef();
                if (colDef.template) {
                    this.vParentOfValue.setInnerHtml(colDef.template);
                }
                else if (colDef.templateUrl) {
                    var template = this.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
                    if (template) {
                        this.vParentOfValue.setInnerHtml(template);
                    }
                }
                else if (colDef.floatingCellRenderer && this.node.floating) {
                    this.useCellRenderer(colDef.floatingCellRenderer);
                }
                else if (colDef.cellRenderer) {
                    this.useCellRenderer(colDef.cellRenderer);
                }
                else {
                    // if we insert undefined, then it displays as the string 'undefined', ugly!
                    if (this.value !== undefined && this.value !== null && this.value !== '') {
                        this.vParentOfValue.setInnerHtml(this.value.toString());
                    }
                }
            };
            RenderedCell.prototype.useCellRenderer = function (cellRenderer) {
                var colDef = this.column.getColDef();
                var rendererParams = {
                    value: this.value,
                    valueGetter: this.getValue,
                    data: this.node.data,
                    node: this.node,
                    colDef: colDef,
                    column: this.column,
                    $scope: this.scope,
                    rowIndex: this.rowIndex,
                    api: this.gridOptionsWrapper.getApi(),
                    context: this.gridOptionsWrapper.getContext(),
                    refreshCell: this.refreshCell.bind(this),
                    eGridCell: this.vGridCell
                };
                // start duplicated code
                var actualCellRenderer;
                if (typeof cellRenderer === 'object' && cellRenderer !== null) {
                    var cellRendererObj = cellRenderer;
                    actualCellRenderer = this.cellRendererMap[cellRendererObj.renderer];
                    if (!actualCellRenderer) {
                        throw 'Cell renderer ' + cellRenderer + ' not found, available are ' + Object.keys(this.cellRendererMap);
                    }
                }
                else if (typeof cellRenderer === 'function') {
                    actualCellRenderer = cellRenderer;
                }
                else {
                    throw 'Cell Renderer must be String or Function';
                }
                var resultFromRenderer = actualCellRenderer(rendererParams);
                // end duplicated code
                if (_.isNodeOrElement(resultFromRenderer)) {
                    // a dom node or element was returned, so add child
                    this.vParentOfValue.appendChild(resultFromRenderer);
                }
                else {
                    // otherwise assume it was html, so just insert
                    this.vParentOfValue.setInnerHtml(resultFromRenderer);
                }
            };
            RenderedCell.prototype.addClasses = function () {
                this.vGridCell.addClass('ag-cell');
                this.vGridCell.addClass('ag-cell-no-focus');
                this.vGridCell.addClass('cell-col-' + this.column.getIndex());
                if (this.node.group && this.node.footer) {
                    this.vGridCell.addClass('ag-footer-cell');
                }
                if (this.node.group && !this.node.footer) {
                    this.vGridCell.addClass('ag-group-cell');
                }
                if (this.firstRightPinnedColumn) {
                    this.vGridCell.addClass('ag-cell-first-right-pinned');
                }
            };
            return RenderedCell;
        })();
        grid.RenderedCell = RenderedCell;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../gridOptionsWrapper.ts" />
/// <reference path="../grid.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../columnController/columnController.ts" />
/// <reference path="../expressionService.ts" />
/// <reference path="rowRenderer.ts" />
/// <reference path="../templateService.ts" />
/// <reference path="../selectionController.ts" />
/// <reference path="renderedCell.ts" />
/// <reference path="../virtualDom/vHtmlElement.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var RenderedRow = (function () {
            function RenderedRow(gridOptionsWrapper, valueService, parentScope, angularGrid, columnController, expressionService, cellRendererMap, selectionRendererFactory, $compile, templateService, selectionController, rowRenderer, eBodyContainer, ePinnedLeftContainer, ePinnedRightContainer, node, rowIndex, eventService) {
                this.renderedCells = {};
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.valueService = valueService;
                this.parentScope = parentScope;
                this.angularGrid = angularGrid;
                this.expressionService = expressionService;
                this.columnController = columnController;
                this.cellRendererMap = cellRendererMap;
                this.selectionRendererFactory = selectionRendererFactory;
                this.$compile = $compile;
                this.templateService = templateService;
                this.selectionController = selectionController;
                this.rowRenderer = rowRenderer;
                this.eBodyContainer = eBodyContainer;
                this.ePinnedLeftContainer = ePinnedLeftContainer;
                this.ePinnedRightContainer = ePinnedRightContainer;
                this.pinningLeft = columnController.isPinningLeft();
                this.pinningRight = columnController.isPinningRight();
                this.eventService = eventService;
                var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();
                var rowIsHeaderThatSpans = node.group && groupHeaderTakesEntireRow;
                this.vBodyRow = this.createRowContainer();
                if (this.pinningLeft) {
                    this.vPinnedLeftRow = this.createRowContainer();
                }
                if (this.pinningRight) {
                    this.vPinnedRightRow = this.createRowContainer();
                }
                this.rowIndex = rowIndex;
                this.node = node;
                this.scope = this.createChildScopeOrNull(node.data);
                if (!rowIsHeaderThatSpans) {
                    this.drawNormalRow();
                }
                this.addDynamicStyles();
                this.addDynamicClasses();
                var rowStr = this.rowIndex.toString();
                if (this.node.floatingBottom) {
                    rowStr = 'fb-' + rowStr;
                }
                else if (this.node.floatingTop) {
                    rowStr = 'ft-' + rowStr;
                }
                this.vBodyRow.setAttribute('row', rowStr);
                if (this.pinningLeft) {
                    this.vPinnedLeftRow.setAttribute('row', rowStr);
                }
                if (this.pinningRight) {
                    this.vPinnedRightRow.setAttribute('row', rowStr);
                }
                if (typeof this.gridOptionsWrapper.getBusinessKeyForNodeFunc() === 'function') {
                    var businessKey = this.gridOptionsWrapper.getBusinessKeyForNodeFunc()(this.node);
                    if (typeof businessKey === 'string' || typeof businessKey === 'number') {
                        this.vBodyRow.setAttribute('row-id', businessKey);
                        if (this.pinningLeft) {
                            this.vPinnedLeftRow.setAttribute('row-id', businessKey);
                        }
                        if (this.pinningRight) {
                            this.vPinnedRightRow.setAttribute('row-id', businessKey);
                        }
                    }
                }
                // if showing scrolls, position on the container
                if (!this.gridOptionsWrapper.isForPrint()) {
                    var topPx = this.node.rowTop + "px";
                    this.vBodyRow.style.top = topPx;
                    if (this.pinningLeft) {
                        this.vPinnedLeftRow.style.top = topPx;
                    }
                    if (this.pinningRight) {
                        this.vPinnedRightRow.style.top = topPx;
                    }
                }
                var heightPx = this.node.rowHeight + 'px';
                this.vBodyRow.style.height = heightPx;
                if (this.pinningLeft) {
                    this.vPinnedLeftRow.style.height = heightPx;
                }
                if (this.pinningRight) {
                    this.vPinnedRightRow.style.height = heightPx;
                }
                // if group item, insert the first row
                if (rowIsHeaderThatSpans) {
                    this.createGroupRow();
                }
                this.bindVirtualElement(this.vBodyRow);
                if (this.pinningLeft) {
                    this.bindVirtualElement(this.vPinnedLeftRow);
                }
                if (this.pinningRight) {
                    this.bindVirtualElement(this.vPinnedRightRow);
                }
                if (this.scope) {
                    this.$compile(this.vBodyRow.getElement())(this.scope);
                    if (this.pinningLeft) {
                        this.$compile(this.vPinnedLeftRow.getElement())(this.scope);
                    }
                    if (this.pinningRight) {
                        this.$compile(this.vPinnedRightRow.getElement())(this.scope);
                    }
                }
                this.eBodyContainer.appendChild(this.vBodyRow.getElement());
                if (this.pinningLeft) {
                    this.ePinnedLeftContainer.appendChild(this.vPinnedLeftRow.getElement());
                }
                if (this.pinningRight) {
                    this.ePinnedRightContainer.appendChild(this.vPinnedRightRow.getElement());
                }
            }
            RenderedRow.prototype.onRowSelected = function (selected) {
                _.iterateObject(this.renderedCells, function (key, renderedCell) {
                    renderedCell.setSelected(selected);
                });
            };
            RenderedRow.prototype.softRefresh = function () {
                _.iterateObject(this.renderedCells, function (key, renderedCell) {
                    if (renderedCell.isVolatile()) {
                        renderedCell.refreshCell();
                    }
                });
            };
            RenderedRow.prototype.getRenderedCellForColumn = function (column) {
                return this.renderedCells[column.getIndex()];
            };
            RenderedRow.prototype.getCellForCol = function (column) {
                var renderedCell = this.renderedCells[column.getIndex()];
                if (renderedCell) {
                    return renderedCell.getVGridCell().getElement();
                }
                else {
                    return null;
                }
            };
            RenderedRow.prototype.destroy = function () {
                this.destroyScope();
                if (this.pinningLeft) {
                    this.ePinnedLeftContainer.removeChild(this.vPinnedLeftRow.getElement());
                }
                if (this.pinningRight) {
                    this.ePinnedRightContainer.removeChild(this.vPinnedRightRow.getElement());
                }
                this.eBodyContainer.removeChild(this.vBodyRow.getElement());
            };
            RenderedRow.prototype.destroyScope = function () {
                if (this.scope) {
                    this.scope.$destroy();
                    this.scope = null;
                }
            };
            RenderedRow.prototype.isDataInList = function (rows) {
                return rows.indexOf(this.node.data) >= 0;
            };
            RenderedRow.prototype.isNodeInList = function (nodes) {
                return nodes.indexOf(this.node) >= 0;
            };
            RenderedRow.prototype.isGroup = function () {
                return this.node.group === true;
            };
            RenderedRow.prototype.drawNormalRow = function () {
                var columns = this.columnController.getAllDisplayedColumns();
                var firstRightPinnedColIndex = this.columnController.getFirstRightPinnedColIndex();
                for (var colIndex = 0; colIndex < columns.length; colIndex++) {
                    var column = columns[colIndex];
                    var firstRightPinnedCol = colIndex === firstRightPinnedColIndex;
                    var renderedCell = new grid.RenderedCell(firstRightPinnedCol, column, this.$compile, this.rowRenderer, this.gridOptionsWrapper, this.expressionService, this.selectionRendererFactory, this.selectionController, this.templateService, this.cellRendererMap, this.node, this.rowIndex, colIndex, this.scope, this.columnController, this.valueService, this.eventService);
                    var vGridCell = renderedCell.getVGridCell();
                    if (column.getPinned() === grid.Column.PINNED_LEFT) {
                        this.vPinnedLeftRow.appendChild(vGridCell);
                    }
                    else if (column.getPinned() === grid.Column.PINNED_RIGHT) {
                        this.vPinnedRightRow.appendChild(vGridCell);
                    }
                    else {
                        this.vBodyRow.appendChild(vGridCell);
                    }
                    this.renderedCells[column.getIndex()] = renderedCell;
                }
            };
            RenderedRow.prototype.bindVirtualElement = function (vElement) {
                var html = vElement.toHtmlString();
                var element = _.loadTemplate(html);
                vElement.elementAttached(element);
            };
            RenderedRow.prototype.createGroupRow = function () {
                var eGroupRow = this.createGroupSpanningEntireRowCell(false);
                if (this.pinningLeft) {
                    this.vPinnedLeftRow.appendChild(eGroupRow);
                    var eGroupRowPadding = this.createGroupSpanningEntireRowCell(true);
                    this.vBodyRow.appendChild(eGroupRowPadding);
                }
                else {
                    this.vBodyRow.appendChild(eGroupRow);
                }
                if (this.pinningRight) {
                    var ePinnedRightPadding = this.createGroupSpanningEntireRowCell(true);
                    this.vPinnedRightRow.appendChild(ePinnedRightPadding);
                }
            };
            RenderedRow.prototype.createGroupSpanningEntireRowCell = function (padding) {
                var eRow;
                // padding means we are on the right hand side of a pinned table, ie
                // in the main body.
                if (padding) {
                    eRow = document.createElement('span');
                }
                else {
                    var rowCellRenderer = this.gridOptionsWrapper.getGroupRowRenderer();
                    if (!rowCellRenderer) {
                        rowCellRenderer = {
                            renderer: 'group',
                            innerRenderer: this.gridOptionsWrapper.getGroupRowInnerRenderer()
                        };
                    }
                    var params = {
                        node: this.node,
                        data: this.node.data,
                        rowIndex: this.rowIndex,
                        api: this.gridOptionsWrapper.getApi(),
                        colDef: {
                            cellRenderer: rowCellRenderer
                        }
                    };
                    // start duplicated code
                    var actualCellRenderer;
                    if (typeof rowCellRenderer === 'object' && rowCellRenderer !== null) {
                        var cellRendererObj = rowCellRenderer;
                        actualCellRenderer = this.cellRendererMap[cellRendererObj.renderer];
                        if (!actualCellRenderer) {
                            throw 'Cell renderer ' + rowCellRenderer + ' not found, available are ' + Object.keys(this.cellRendererMap);
                        }
                    }
                    else if (typeof rowCellRenderer === 'function') {
                        actualCellRenderer = rowCellRenderer;
                    }
                    else {
                        throw 'Cell Renderer must be String or Function';
                    }
                    var resultFromRenderer = actualCellRenderer(params);
                    // end duplicated code
                    if (_.isNodeOrElement(resultFromRenderer)) {
                        // a dom node or element was returned, so add child
                        eRow = resultFromRenderer;
                    }
                    else {
                        // otherwise assume it was html, so just insert
                        eRow = _.loadTemplate(resultFromRenderer);
                    }
                }
                if (this.node.footer) {
                    _.addCssClass(eRow, 'ag-footer-cell-entire-row');
                }
                else {
                    _.addCssClass(eRow, 'ag-group-cell-entire-row');
                }
                return eRow;
            };
            RenderedRow.prototype.setMainRowWidth = function (width) {
                this.vBodyRow.addStyles({ width: width + "px" });
            };
            RenderedRow.prototype.createChildScopeOrNull = function (data) {
                if (this.gridOptionsWrapper.isAngularCompileRows()) {
                    var newChildScope = this.parentScope.$new();
                    newChildScope.data = data;
                    return newChildScope;
                }
                else {
                    return null;
                }
            };
            RenderedRow.prototype.addDynamicStyles = function () {
                var rowStyle = this.gridOptionsWrapper.getRowStyle();
                if (rowStyle) {
                    if (typeof rowStyle === 'function') {
                        console.log('ag-Grid: rowStyle should be a string or an array, not be a function, use getRowStyle() instead');
                    }
                    else {
                        this.vBodyRow.addStyles(rowStyle);
                        if (this.pinningLeft) {
                            this.vPinnedLeftRow.addStyles(rowStyle);
                        }
                        if (this.pinningRight) {
                            this.vPinnedRightRow.addStyles(rowStyle);
                        }
                    }
                }
                var rowStyleFunc = this.gridOptionsWrapper.getRowStyleFunc();
                if (rowStyleFunc) {
                    var params = {
                        data: this.node.data,
                        node: this.node,
                        api: this.gridOptionsWrapper.getApi(),
                        context: this.gridOptionsWrapper.getContext(),
                        $scope: this.scope
                    };
                    var cssToUseFromFunc = rowStyleFunc(params);
                    this.vBodyRow.addStyles(cssToUseFromFunc);
                    if (this.pinningLeft) {
                        this.vPinnedLeftRow.addStyles(cssToUseFromFunc);
                    }
                    if (this.pinningRight) {
                        this.vPinnedRightRow.addStyles(cssToUseFromFunc);
                    }
                }
            };
            RenderedRow.prototype.createParams = function () {
                var params = {
                    node: this.node,
                    data: this.node.data,
                    rowIndex: this.rowIndex,
                    $scope: this.scope,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
                };
                return params;
            };
            RenderedRow.prototype.createEvent = function (event, eventSource) {
                var agEvent = this.createParams();
                agEvent.event = event;
                agEvent.eventSource = eventSource;
                return agEvent;
            };
            RenderedRow.prototype.createRowContainer = function () {
                var vRow = new ag.vdom.VHtmlElement('div');
                var that = this;
                vRow.addEventListener("click", function (event) {
                    var agEvent = that.createEvent(event, this);
                    that.eventService.dispatchEvent(grid.Events.EVENT_ROW_CLICKED, agEvent);
                    // ctrlKey for windows, metaKey for Apple
                    var multiSelectKeyPressed = event.ctrlKey || event.metaKey;
                    that.angularGrid.onRowClicked(multiSelectKeyPressed, that.rowIndex, that.node);
                });
                vRow.addEventListener("dblclick", function (event) {
                    var agEvent = that.createEvent(event, this);
                    that.eventService.dispatchEvent(grid.Events.EVENT_ROW_DOUBLE_CLICKED, agEvent);
                });
                return vRow;
            };
            RenderedRow.prototype.getRowNode = function () {
                return this.node;
            };
            RenderedRow.prototype.getRowIndex = function () {
                return this.rowIndex;
            };
            RenderedRow.prototype.refreshCells = function (colIds) {
                if (!colIds) {
                    return;
                }
                var columnsToRefresh = this.columnController.getColumns(colIds);
                _.iterateObject(this.renderedCells, function (key, renderedCell) {
                    var colForCel = renderedCell.getColumn();
                    if (columnsToRefresh.indexOf(colForCel) >= 0) {
                        renderedCell.refreshCell();
                    }
                });
            };
            RenderedRow.prototype.addDynamicClasses = function () {
                var classes = [];
                classes.push('ag-row');
                classes.push('ag-row-no-focus');
                classes.push(this.rowIndex % 2 == 0 ? "ag-row-even" : "ag-row-odd");
                if (this.selectionController.isNodeSelected(this.node)) {
                    classes.push("ag-row-selected");
                }
                if (this.node.group) {
                    classes.push("ag-row-group");
                    // if a group, put the level of the group in
                    classes.push("ag-row-level-" + this.node.level);
                    if (!this.node.footer && this.node.expanded) {
                        classes.push("ag-row-group-expanded");
                    }
                    if (!this.node.footer && !this.node.expanded) {
                        // opposite of expanded is contracted according to the internet.
                        classes.push("ag-row-group-contracted");
                    }
                    if (this.node.footer) {
                        classes.push("ag-row-footer");
                    }
                }
                else {
                    // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
                    if (this.node.parent) {
                        classes.push("ag-row-level-" + (this.node.parent.level + 1));
                    }
                    else {
                        classes.push("ag-row-level-0");
                    }
                }
                // add in extra classes provided by the config
                var gridOptionsRowClass = this.gridOptionsWrapper.getRowClass();
                if (gridOptionsRowClass) {
                    if (typeof gridOptionsRowClass === 'function') {
                        console.warn('ag-Grid: rowClass should not be a function, please use getRowClass instead');
                    }
                    else {
                        if (typeof gridOptionsRowClass === 'string') {
                            classes.push(gridOptionsRowClass);
                        }
                        else if (Array.isArray(gridOptionsRowClass)) {
                            gridOptionsRowClass.forEach(function (classItem) {
                                classes.push(classItem);
                            });
                        }
                    }
                }
                var gridOptionsRowClassFunc = this.gridOptionsWrapper.getRowClassFunc();
                if (gridOptionsRowClassFunc) {
                    var params = {
                        node: this.node,
                        data: this.node.data,
                        rowIndex: this.rowIndex,
                        context: this.gridOptionsWrapper.getContext(),
                        api: this.gridOptionsWrapper.getApi()
                    };
                    var classToUseFromFunc = gridOptionsRowClassFunc(params);
                    if (classToUseFromFunc) {
                        if (typeof classToUseFromFunc === 'string') {
                            classes.push(classToUseFromFunc);
                        }
                        else if (Array.isArray(classToUseFromFunc)) {
                            classToUseFromFunc.forEach(function (classItem) {
                                classes.push(classItem);
                            });
                        }
                    }
                }
                this.vBodyRow.addClasses(classes);
                if (this.pinningLeft) {
                    this.vPinnedLeftRow.addClasses(classes);
                }
                if (this.pinningRight) {
                    this.vPinnedRightRow.addClasses(classes);
                }
            };
            return RenderedRow;
        })();
        grid.RenderedRow = RenderedRow;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../svgFactory.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var svgFactory = grid.SvgFactory.getInstance();
        var utils = grid.Utils;
        var constants = grid.Constants;
        function groupCellRendererFactory(gridOptionsWrapper, selectionRendererFactory, expressionService) {
            return function groupCellRenderer(params) {
                var eGroupCell = document.createElement('span');
                var node = params.node;
                var cellExpandable = node.group && !node.footer;
                if (cellExpandable) {
                    addExpandAndContract(eGroupCell, params);
                }
                var checkboxNeeded = params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.checkbox && !node.footer;
                if (checkboxNeeded) {
                    var eCheckbox = selectionRendererFactory.createSelectionCheckbox(node, params.rowIndex);
                    eGroupCell.appendChild(eCheckbox);
                }
                if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.innerRenderer) {
                    createFromInnerRenderer(eGroupCell, params, params.colDef.cellRenderer.innerRenderer);
                }
                else if (node.footer) {
                    createFooterCell(eGroupCell, params);
                }
                else if (node.group) {
                    createGroupCell(eGroupCell, params);
                }
                else {
                    createLeafCell(eGroupCell, params);
                }
                // only do this if an indent - as this overwrites the padding that
                // the theme set, which will make things look 'not aligned' for the
                // first group level.
                var suppressPadding = params.colDef && params.colDef.cellRenderer
                    && params.colDef.cellRenderer.suppressPadding;
                if (!suppressPadding && (node.footer || node.level > 0)) {
                    var paddingFactor;
                    if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.padding >= 0) {
                        paddingFactor = params.colDef.cellRenderer.padding;
                    }
                    else {
                        paddingFactor = 10;
                    }
                    var paddingPx = node.level * paddingFactor;
                    if (node.footer) {
                        paddingPx += 10;
                    }
                    else if (!node.group) {
                        paddingPx += 5;
                    }
                    eGroupCell.style.paddingLeft = paddingPx + 'px';
                }
                return eGroupCell;
            };
            function addExpandAndContract(eGroupCell, params) {
                var eExpandIcon = createGroupExpandIcon(true);
                var eContractIcon = createGroupExpandIcon(false);
                eGroupCell.appendChild(eExpandIcon);
                eGroupCell.appendChild(eContractIcon);
                eExpandIcon.addEventListener('click', expandOrContract);
                eContractIcon.addEventListener('click', expandOrContract);
                eGroupCell.addEventListener('dblclick', expandOrContract);
                showAndHideExpandAndContract(eExpandIcon, eContractIcon, params.node.expanded);
                // if parent cell was passed, then we can listen for when focus is on the cell,
                // and then expand / contract as the user hits enter or space-bar
                if (params.eGridCell) {
                    params.eGridCell.addEventListener('keydown', function (event) {
                        if (utils.isKeyPressed(event, constants.KEY_ENTER)) {
                            expandOrContract();
                            event.preventDefault();
                        }
                    });
                }
                function expandOrContract() {
                    expandGroup(eExpandIcon, eContractIcon, params);
                }
            }
            function showAndHideExpandAndContract(eExpandIcon, eContractIcon, expanded) {
                utils.setVisible(eExpandIcon, !expanded);
                utils.setVisible(eContractIcon, expanded);
            }
            function createFromInnerRenderer(eGroupCell, params, renderer) {
                utils.useRenderer(eGroupCell, renderer, params);
            }
            function getRefreshFromIndex(params) {
                if (gridOptionsWrapper.isGroupIncludeFooter()) {
                    return params.rowIndex;
                }
                else {
                    return params.rowIndex + 1;
                }
            }
            function expandGroup(eExpandIcon, eContractIcon, params) {
                params.node.expanded = !params.node.expanded;
                var refreshIndex = getRefreshFromIndex(params);
                params.api.onGroupExpandedOrCollapsed(refreshIndex);
                showAndHideExpandAndContract(eExpandIcon, eContractIcon, params.node.expanded);
            }
            function createGroupExpandIcon(expanded) {
                var eIcon;
                if (expanded) {
                    eIcon = utils.createIcon('groupContracted', gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
                }
                else {
                    eIcon = utils.createIcon('groupExpanded', gridOptionsWrapper, null, svgFactory.createArrowDownSvg);
                }
                utils.addCssClass(eIcon, 'ag-group-expand');
                return eIcon;
            }
            // creates cell with 'Total {{key}}' for a group
            function createFooterCell(eGroupCell, params) {
                var footerValue;
                var groupName = getGroupName(params);
                if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.footerValueGetter) {
                    var footerValueGetter = params.colDef.cellRenderer.footerValueGetter;
                    // params is same as we were given, except we set the value as the item to display
                    var paramsClone = utils.cloneObject(params);
                    paramsClone.value = groupName;
                    if (typeof footerValueGetter === 'function') {
                        footerValue = footerValueGetter(paramsClone);
                    }
                    else if (typeof footerValueGetter === 'string') {
                        footerValue = expressionService.evaluate(footerValueGetter, paramsClone);
                    }
                    else {
                        console.warn('ag-Grid: footerValueGetter should be either a function or a string (expression)');
                    }
                }
                else {
                    footerValue = 'Total ' + groupName;
                }
                var eText = document.createTextNode(footerValue);
                eGroupCell.appendChild(eText);
            }
            function getGroupName(params) {
                var cellRenderer = params.colDef.cellRenderer;
                if (cellRenderer && cellRenderer.keyMap
                    && typeof cellRenderer.keyMap === 'object' && params.colDef.cellRenderer !== null) {
                    var valueFromMap = cellRenderer.keyMap[params.node.key];
                    if (valueFromMap) {
                        return valueFromMap;
                    }
                    else {
                        return params.node.key;
                    }
                }
                else {
                    return params.node.key;
                }
            }
            // creates cell with '{{key}} ({{childCount}})' for a group
            function createGroupCell(eGroupCell, params) {
                var groupName = getGroupName(params);
                var colDefOfGroupedCol = params.api.getColumnDef(params.node.field);
                if (colDefOfGroupedCol && typeof colDefOfGroupedCol.cellRenderer === 'function') {
                    params.value = groupName;
                    utils.useRenderer(eGroupCell, colDefOfGroupedCol.cellRenderer, params);
                }
                else {
                    eGroupCell.appendChild(document.createTextNode(groupName));
                }
                // only include the child count if it's included, eg if user doing custom aggregation,
                // then this could be left out, or set to -1, ie no child count
                var suppressCount = params.colDef.cellRenderer && params.colDef.cellRenderer.suppressCount;
                if (!suppressCount && params.node.allChildrenCount >= 0) {
                    eGroupCell.appendChild(document.createTextNode(" (" + params.node.allChildrenCount + ")"));
                }
            }
            // creates cell with '{{key}} ({{childCount}})' for a group
            function createLeafCell(eParent, params) {
                if (params.value) {
                    var eText = document.createTextNode(' ' + params.value);
                    eParent.appendChild(eText);
                }
            }
        }
        grid.groupCellRendererFactory = groupCellRendererFactory;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../rowControllers/floatingRowModel.ts" />
/// <reference path="renderedRow.ts" />
/// <reference path="../cellRenderers/groupCellRendererFactory.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var RowRenderer = (function () {
            function RowRenderer() {
                this.renderedTopFloatingRows = [];
                this.renderedBottomFloatingRows = [];
            }
            RowRenderer.prototype.init = function (columnModel, gridOptionsWrapper, gridPanel, angularGrid, selectionRendererFactory, $compile, $scope, selectionController, expressionService, templateService, valueService, eventService, floatingRowModel) {
                this.columnModel = columnModel;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.angularGrid = angularGrid;
                this.selectionRendererFactory = selectionRendererFactory;
                this.gridPanel = gridPanel;
                this.$compile = $compile;
                this.$scope = $scope;
                this.selectionController = selectionController;
                this.expressionService = expressionService;
                this.templateService = templateService;
                this.valueService = valueService;
                this.findAllElements(gridPanel);
                this.eventService = eventService;
                this.floatingRowModel = floatingRowModel;
                this.cellRendererMap = {
                    'group': grid.groupCellRendererFactory(gridOptionsWrapper, selectionRendererFactory, expressionService),
                    'default': function (params) {
                        return params.value;
                    }
                };
                // map of row ids to row objects. keeps track of which elements
                // are rendered for which rows in the dom.
                this.renderedRows = {};
            };
            RowRenderer.prototype.setRowModel = function (rowModel) {
                this.rowModel = rowModel;
            };
            RowRenderer.prototype.getAllCellsForColumn = function (column) {
                var eCells = [];
                _.iterateObject(this.renderedRows, callback);
                _.iterateObject(this.renderedBottomFloatingRows, callback);
                _.iterateObject(this.renderedBottomFloatingRows, callback);
                function callback(key, renderedRow) {
                    var eCell = renderedRow.getCellForCol(column);
                    if (eCell) {
                        eCells.push(eCell);
                    }
                }
                return eCells;
            };
            RowRenderer.prototype.onIndividualColumnResized = function (column) {
                var newWidthPx = column.getActualWidth() + "px";
                var selectorForAllColsInCell = ".cell-col-" + column.getIndex();
                this.eParentsOfRows.forEach(function (rowContainer) {
                    var cellsForThisCol = rowContainer.querySelectorAll(selectorForAllColsInCell);
                    for (var i = 0; i < cellsForThisCol.length; i++) {
                        var element = cellsForThisCol[i];
                        element.style.width = newWidthPx;
                    }
                });
            };
            RowRenderer.prototype.setMainRowWidths = function () {
                var mainRowWidth = this.columnModel.getBodyContainerWidth() + "px";
                this.eAllBodyContainers.forEach(function (container) {
                    var unpinnedRows = container.querySelectorAll(".ag-row");
                    for (var i = 0; i < unpinnedRows.length; i++) {
                        unpinnedRows[i].style.width = mainRowWidth;
                    }
                });
            };
            RowRenderer.prototype.findAllElements = function (gridPanel) {
                this.eBodyContainer = gridPanel.getBodyContainer();
                this.ePinnedLeftColsContainer = gridPanel.getPinnedLeftColsContainer();
                this.ePinnedRightColsContainer = gridPanel.getPinnedRightColsContainer();
                this.eFloatingTopContainer = gridPanel.getFloatingTopContainer();
                this.eFloatingTopPinnedLeftContainer = gridPanel.getPinnedLeftFloatingTop();
                this.eFloatingTopPinnedRightContainer = gridPanel.getPinnedRightFloatingTop();
                this.eFloatingBottomContainer = gridPanel.getFloatingBottomContainer();
                this.eFloatingBottomPinnedLeftContainer = gridPanel.getPinnedLeftFloatingBottom();
                this.eFloatingBottomPinnedRightContainer = gridPanel.getPinnedRightFloatingBottom();
                this.eBodyViewport = gridPanel.getBodyViewport();
                this.eParentsOfRows = gridPanel.getRowsParent();
                this.eAllBodyContainers = [this.eBodyContainer, this.eFloatingBottomContainer,
                    this.eFloatingTopContainer];
                this.eAllPinnedLeftContainers = [
                    this.ePinnedLeftColsContainer,
                    this.eFloatingBottomPinnedLeftContainer,
                    this.eFloatingTopPinnedLeftContainer];
                this.eAllPinnedRightContainers = [
                    this.ePinnedRightColsContainer,
                    this.eFloatingBottomPinnedRightContainer,
                    this.eFloatingTopPinnedRightContainer];
            };
            RowRenderer.prototype.refreshAllFloatingRows = function () {
                this.refreshFloatingRows(this.renderedTopFloatingRows, this.floatingRowModel.getFloatingTopRowData(), this.eFloatingTopPinnedLeftContainer, this.eFloatingTopPinnedRightContainer, this.eFloatingTopContainer);
                this.refreshFloatingRows(this.renderedBottomFloatingRows, this.floatingRowModel.getFloatingBottomRowData(), this.eFloatingBottomPinnedLeftContainer, this.eFloatingBottomPinnedRightContainer, this.eFloatingBottomContainer);
            };
            RowRenderer.prototype.refreshFloatingRows = function (renderedRows, rowNodes, pinnedLeftContainer, pinnedRightContainer, bodyContainer) {
                var _this = this;
                renderedRows.forEach(function (row) {
                    row.destroy();
                });
                renderedRows.length = 0;
                // if no cols, don't draw row - can we get rid of this???
                var columns = this.columnModel.getAllDisplayedColumns();
                if (!columns || columns.length == 0) {
                    return;
                }
                // should we be storing this somewhere???
                var mainRowWidth = this.columnModel.getBodyContainerWidth();
                if (rowNodes) {
                    rowNodes.forEach(function (node, rowIndex) {
                        var renderedRow = new grid.RenderedRow(_this.gridOptionsWrapper, _this.valueService, _this.$scope, _this.angularGrid, _this.columnModel, _this.expressionService, _this.cellRendererMap, _this.selectionRendererFactory, _this.$compile, _this.templateService, _this.selectionController, _this, bodyContainer, pinnedLeftContainer, pinnedRightContainer, node, rowIndex, _this.eventService);
                        renderedRow.setMainRowWidth(mainRowWidth);
                        renderedRows.push(renderedRow);
                    });
                }
            };
            RowRenderer.prototype.refreshView = function (refreshFromIndex) {
                if (!this.gridOptionsWrapper.isForPrint()) {
                    var containerHeight = this.rowModel.getVirtualRowCombinedHeight();
                    this.eBodyContainer.style.height = containerHeight + "px";
                    this.ePinnedLeftColsContainer.style.height = containerHeight + "px";
                    this.ePinnedRightColsContainer.style.height = containerHeight + "px";
                }
                this.refreshAllVirtualRows(refreshFromIndex);
                this.refreshAllFloatingRows();
            };
            RowRenderer.prototype.softRefreshView = function () {
                _.iterateObject(this.renderedRows, function (key, renderedRow) {
                    renderedRow.softRefresh();
                });
            };
            RowRenderer.prototype.refreshRows = function (rowNodes) {
                if (!rowNodes || rowNodes.length == 0) {
                    return;
                }
                // we only need to be worried about rendered rows, as this method is
                // called to whats rendered. if the row isn't rendered, we don't care
                var indexesToRemove = [];
                _.iterateObject(this.renderedRows, function (key, renderedRow) {
                    var rowNode = renderedRow.getRowNode();
                    if (rowNodes.indexOf(rowNode) >= 0) {
                        indexesToRemove.push(key);
                    }
                });
                // remove the rows
                this.removeVirtualRow(indexesToRemove);
                // add draw them again
                this.drawVirtualRows();
            };
            RowRenderer.prototype.refreshCells = function (rowNodes, colIds) {
                if (!rowNodes || rowNodes.length == 0) {
                    return;
                }
                // we only need to be worried about rendered rows, as this method is
                // called to whats rendered. if the row isn't rendered, we don't care
                _.iterateObject(this.renderedRows, function (key, renderedRow) {
                    var rowNode = renderedRow.getRowNode();
                    if (rowNodes.indexOf(rowNode) >= 0) {
                        renderedRow.refreshCells(colIds);
                    }
                });
            };
            RowRenderer.prototype.rowDataChanged = function (rows) {
                // we only need to be worried about rendered rows, as this method is
                // called to whats rendered. if the row isn't rendered, we don't care
                var indexesToRemove = [];
                var renderedRows = this.renderedRows;
                Object.keys(renderedRows).forEach(function (key) {
                    var renderedRow = renderedRows[key];
                    // see if the rendered row is in the list of rows we have to update
                    if (renderedRow.isDataInList(rows)) {
                        indexesToRemove.push(key);
                    }
                });
                // remove the rows
                this.removeVirtualRow(indexesToRemove);
                // add draw them again
                this.drawVirtualRows();
            };
            RowRenderer.prototype.refreshAllVirtualRows = function (fromIndex) {
                // remove all current virtual rows, as they have old data
                var rowsToRemove = Object.keys(this.renderedRows);
                this.removeVirtualRow(rowsToRemove, fromIndex);
                // add in new rows
                this.drawVirtualRows();
            };
            // public - removes the group rows and then redraws them again
            RowRenderer.prototype.refreshGroupRows = function () {
                // find all the group rows
                var rowsToRemove = [];
                var that = this;
                Object.keys(this.renderedRows).forEach(function (key) {
                    var renderedRow = that.renderedRows[key];
                    if (renderedRow.isGroup()) {
                        rowsToRemove.push(key);
                    }
                });
                // remove the rows
                this.removeVirtualRow(rowsToRemove);
                // and draw them back again
                this.ensureRowsRendered();
            };
            // takes array of row indexes
            RowRenderer.prototype.removeVirtualRow = function (rowsToRemove, fromIndex) {
                var that = this;
                // if no fromIndex then set to -1, which will refresh everything
                var realFromIndex = (typeof fromIndex === 'number') ? fromIndex : -1;
                rowsToRemove.forEach(function (indexToRemove) {
                    if (indexToRemove >= realFromIndex) {
                        that.unbindVirtualRow(indexToRemove);
                        // if the row was last to have focus, we remove the fact that it has focus
                        if (that.focusedCell && that.focusedCell.rowIndex == indexToRemove) {
                            that.focusedCell = null;
                        }
                    }
                });
            };
            RowRenderer.prototype.unbindVirtualRow = function (indexToRemove) {
                var renderedRow = this.renderedRows[indexToRemove];
                renderedRow.destroy();
                var event = { node: renderedRow.getRowNode(), rowIndex: indexToRemove };
                this.eventService.dispatchEvent(grid.Events.EVENT_VIRTUAL_ROW_REMOVED, event);
                this.angularGrid.onVirtualRowRemoved(indexToRemove);
                delete this.renderedRows[indexToRemove];
            };
            RowRenderer.prototype.drawVirtualRows = function () {
                this.workOutFirstAndLastRowsToRender();
                this.ensureRowsRendered();
            };
            RowRenderer.prototype.workOutFirstAndLastRowsToRender = function () {
                var rowCount = this.rowModel.getVirtualRowCount();
                if (rowCount === 0) {
                    this.firstVirtualRenderedRow = 0;
                    this.lastVirtualRenderedRow = -1; // setting to -1 means nothing in range
                    return;
                }
                if (this.gridOptionsWrapper.isForPrint()) {
                    this.firstVirtualRenderedRow = 0;
                    this.lastVirtualRenderedRow = rowCount;
                }
                else {
                    var topPixel = this.eBodyViewport.scrollTop;
                    var bottomPixel = topPixel + this.eBodyViewport.offsetHeight;
                    var first = this.rowModel.getRowAtPixel(topPixel);
                    var last = this.rowModel.getRowAtPixel(bottomPixel);
                    //add in buffer
                    var buffer = this.gridOptionsWrapper.getRowBuffer();
                    first = first - buffer;
                    last = last + buffer;
                    // adjust, in case buffer extended actual size
                    if (first < 0) {
                        first = 0;
                    }
                    if (last > rowCount - 1) {
                        last = rowCount - 1;
                    }
                    this.firstVirtualRenderedRow = first;
                    this.lastVirtualRenderedRow = last;
                }
            };
            RowRenderer.prototype.getFirstVirtualRenderedRow = function () {
                return this.firstVirtualRenderedRow;
            };
            RowRenderer.prototype.getLastVirtualRenderedRow = function () {
                return this.lastVirtualRenderedRow;
            };
            RowRenderer.prototype.ensureRowsRendered = function () {
                //var start = new Date().getTime();
                var mainRowWidth = this.columnModel.getBodyContainerWidth();
                var that = this;
                // at the end, this array will contain the items we need to remove
                var rowsToRemove = Object.keys(this.renderedRows);
                // add in new rows
                for (var rowIndex = this.firstVirtualRenderedRow; rowIndex <= this.lastVirtualRenderedRow; rowIndex++) {
                    // see if item already there, and if yes, take it out of the 'to remove' array
                    if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                        rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                        continue;
                    }
                    // check this row actually exists (in case overflow buffer window exceeds real data)
                    var node = this.rowModel.getVirtualRow(rowIndex);
                    if (node) {
                        that.insertRow(node, rowIndex, mainRowWidth);
                    }
                }
                // at this point, everything in our 'rowsToRemove' . . .
                this.removeVirtualRow(rowsToRemove);
                // if we are doing angular compiling, then do digest the scope here
                if (this.gridOptionsWrapper.isAngularCompileRows()) {
                    // we do it in a timeout, in case we are already in an apply
                    setTimeout(function () {
                        that.$scope.$apply();
                    }, 0);
                }
                //var end = new Date().getTime();
                //console.log(end-start);
            };
            RowRenderer.prototype.insertRow = function (node, rowIndex, mainRowWidth) {
                var columns = this.columnModel.getAllDisplayedColumns();
                // if no cols, don't draw row
                if (!columns || columns.length == 0) {
                    return;
                }
                var renderedRow = new grid.RenderedRow(this.gridOptionsWrapper, this.valueService, this.$scope, this.angularGrid, this.columnModel, this.expressionService, this.cellRendererMap, this.selectionRendererFactory, this.$compile, this.templateService, this.selectionController, this, this.eBodyContainer, this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, node, rowIndex, this.eventService);
                renderedRow.setMainRowWidth(mainRowWidth);
                this.renderedRows[rowIndex] = renderedRow;
            };
            RowRenderer.prototype.getRenderedNodes = function () {
                var renderedRows = this.renderedRows;
                return Object.keys(renderedRows).map(function (key) {
                    return renderedRows[key].getRowNode();
                });
            };
            RowRenderer.prototype.getIndexOfRenderedNode = function (node) {
                var renderedRows = this.renderedRows;
                var keys = Object.keys(renderedRows);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (renderedRows[key].getRowNode() === node) {
                        return renderedRows[key].getRowIndex();
                    }
                }
                return -1;
            };
            // we use index for rows, but column object for columns, as the next column (by index) might not
            // be visible (header grouping) so it's not reliable, so using the column object instead.
            RowRenderer.prototype.navigateToNextCell = function (key, rowIndex, column) {
                var cellToFocus = { rowIndex: rowIndex, column: column };
                var renderedRow;
                var eCell;
                // we keep searching for a next cell until we find one. this is how the group rows get skipped
                while (!eCell) {
                    cellToFocus = this.getNextCellToFocus(key, cellToFocus);
                    // no next cell means we have reached a grid boundary, eg left, right, top or bottom of grid
                    if (!cellToFocus) {
                        return;
                    }
                    // see if the next cell is selectable, if yes, use it, if not, skip it
                    renderedRow = this.renderedRows[cellToFocus.rowIndex];
                    eCell = renderedRow.getCellForCol(cellToFocus.column);
                }
                // this scrolls the row into view
                this.gridPanel.ensureIndexVisible(renderedRow.getRowIndex());
                // this changes the css on the cell
                this.focusCell(eCell, cellToFocus.rowIndex, cellToFocus.column.getIndex(), cellToFocus.column.getColDef(), true);
            };
            RowRenderer.prototype.getNextCellToFocus = function (key, lastCellToFocus) {
                var lastRowIndex = lastCellToFocus.rowIndex;
                var lastColumn = lastCellToFocus.column;
                var nextRowToFocus;
                var nextColumnToFocus;
                switch (key) {
                    case grid.Constants.KEY_UP:
                        // if already on top row, do nothing
                        if (lastRowIndex === this.firstVirtualRenderedRow) {
                            return null;
                        }
                        nextRowToFocus = lastRowIndex - 1;
                        nextColumnToFocus = lastColumn;
                        break;
                    case grid.Constants.KEY_DOWN:
                        // if already on bottom, do nothing
                        if (lastRowIndex === this.lastVirtualRenderedRow) {
                            return null;
                        }
                        nextRowToFocus = lastRowIndex + 1;
                        nextColumnToFocus = lastColumn;
                        break;
                    case grid.Constants.KEY_RIGHT:
                        var colToRight = this.columnModel.getDisplayedColAfter(lastColumn);
                        // if already on right, do nothing
                        if (!colToRight) {
                            return null;
                        }
                        nextRowToFocus = lastRowIndex;
                        nextColumnToFocus = colToRight;
                        break;
                    case grid.Constants.KEY_LEFT:
                        var colToLeft = this.columnModel.getDisplayedColBefore(lastColumn);
                        // if already on left, do nothing
                        if (!colToLeft) {
                            return null;
                        }
                        nextRowToFocus = lastRowIndex;
                        nextColumnToFocus = colToLeft;
                        break;
                }
                return {
                    rowIndex: nextRowToFocus,
                    column: nextColumnToFocus
                };
            };
            RowRenderer.prototype.onRowSelected = function (rowIndex, selected) {
                if (this.renderedRows[rowIndex]) {
                    this.renderedRows[rowIndex].onRowSelected(selected);
                }
            };
            // called by the renderedRow
            RowRenderer.prototype.focusCell = function (eCell, rowIndex, colIndex, colDef, forceBrowserFocus) {
                // do nothing if cell selection is off
                if (this.gridOptionsWrapper.isSuppressCellSelection()) {
                    return;
                }
                this.eParentsOfRows.forEach(function (rowContainer) {
                    // remove any previous focus
                    _.querySelectorAll_replaceCssClass(rowContainer, '.ag-cell-focus', 'ag-cell-focus', 'ag-cell-no-focus');
                    _.querySelectorAll_replaceCssClass(rowContainer, '.ag-row-focus', 'ag-row-focus', 'ag-row-no-focus');
                    var selectorForCell = '[row="' + rowIndex + '"] [col="' + colIndex + '"]';
                    _.querySelectorAll_replaceCssClass(rowContainer, selectorForCell, 'ag-cell-no-focus', 'ag-cell-focus');
                    var selectorForRow = '[row="' + rowIndex + '"]';
                    _.querySelectorAll_replaceCssClass(rowContainer, selectorForRow, 'ag-row-no-focus', 'ag-row-focus');
                });
                this.focusedCell = { rowIndex: rowIndex, colIndex: colIndex, node: this.rowModel.getVirtualRow(rowIndex), colDef: colDef };
                // this puts the browser focus on the cell (so it gets key presses)
                if (forceBrowserFocus) {
                    eCell.focus();
                }
                this.eventService.dispatchEvent(grid.Events.EVENT_CELL_FOCUSED, this.focusedCell);
            };
            // for API
            RowRenderer.prototype.getFocusedCell = function () {
                return this.focusedCell;
            };
            // called via API
            RowRenderer.prototype.setFocusedCell = function (rowIndex, colIndex) {
                var renderedRow = this.renderedRows[rowIndex];
                var column = this.columnModel.getAllDisplayedColumns()[colIndex];
                if (renderedRow && column) {
                    var eCell = renderedRow.getCellForCol(column);
                    this.focusCell(eCell, rowIndex, colIndex, column.getColDef(), true);
                }
            };
            // called by the cell, when tab is pressed while editing
            RowRenderer.prototype.startEditingNextCell = function (rowIndex, column, shiftKey) {
                var firstRowToCheck = this.firstVirtualRenderedRow;
                var lastRowToCheck = this.lastVirtualRenderedRow;
                var currentRowIndex = rowIndex;
                var visibleColumns = this.columnModel.getAllDisplayedColumns();
                var currentCol = column;
                while (true) {
                    var indexOfCurrentCol = visibleColumns.indexOf(currentCol);
                    // move backward
                    if (shiftKey) {
                        // move along to the previous cell
                        currentCol = visibleColumns[indexOfCurrentCol - 1];
                        // check if end of the row, and if so, go back a row
                        if (!currentCol) {
                            currentCol = visibleColumns[visibleColumns.length - 1];
                            currentRowIndex--;
                        }
                        // if got to end of rendered rows, then quit looking
                        if (currentRowIndex < firstRowToCheck) {
                            return;
                        }
                    }
                    else {
                        // move along to the next cell
                        currentCol = visibleColumns[indexOfCurrentCol + 1];
                        // check if end of the row, and if so, go forward a row
                        if (!currentCol) {
                            currentCol = visibleColumns[0];
                            currentRowIndex++;
                        }
                        // if got to end of rendered rows, then quit looking
                        if (currentRowIndex > lastRowToCheck) {
                            return;
                        }
                    }
                    var nextRenderedRow = this.renderedRows[currentRowIndex];
                    var nextRenderedCell = nextRenderedRow.getRenderedCellForColumn(currentCol);
                    if (nextRenderedCell.isCellEditable()) {
                        nextRenderedCell.startEditing();
                        nextRenderedCell.focusCell(false);
                        return;
                    }
                }
            };
            return RowRenderer;
        })();
        grid.RowRenderer = RowRenderer;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="utils.ts" />
/// <reference path="rendering/rowRenderer.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        // these constants are used for determining if groups should
        // be selected or deselected when selecting groups, and the group
        // then selects the children.
        var SELECTED = 0;
        var UNSELECTED = 1;
        var MIXED = 2;
        var DO_NOT_CARE = 3;
        var SelectionController = (function () {
            function SelectionController() {
            }
            SelectionController.prototype.init = function (angularGrid, gridPanel, gridOptionsWrapper, $scope, rowRenderer, eventService) {
                this.eParentsOfRows = gridPanel.getRowsParent();
                this.angularGrid = angularGrid;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.$scope = $scope;
                this.rowRenderer = rowRenderer;
                this.eventService = eventService;
                this.initSelectedNodesById();
                this.selectedRows = [];
            };
            SelectionController.prototype.initSelectedNodesById = function () {
                this.selectedNodesById = {};
            };
            SelectionController.prototype.getSelectedNodesById = function () {
                return this.selectedNodesById;
            };
            SelectionController.prototype.getSelectedRows = function () {
                return this.selectedRows;
            };
            SelectionController.prototype.getSelectedNodes = function () {
                var selectedNodes = [];
                var keys = Object.keys(this.selectedNodesById);
                for (var i = 0; i < keys.length; i++) {
                    var id = keys[i];
                    var selectedNode = this.selectedNodesById[id];
                    selectedNodes.push(selectedNode);
                }
                return selectedNodes;
            };
            // returns a list of all nodes at 'best cost' - a feature to be used
            // with groups / trees. if a group has all it's children selected,
            // then the group appears in the result, but not the children.
            // Designed for use with 'children' as the group selection type,
            // where groups don't actually appear in the selection normally.
            SelectionController.prototype.getBestCostNodeSelection = function () {
                if (typeof this.rowModel.getTopLevelNodes !== 'function') {
                    throw 'selectAll not available when rows are on the server';
                }
                var topLevelNodes = this.rowModel.getTopLevelNodes();
                var result = [];
                var that = this;
                // recursive function, to find the selected nodes
                function traverse(nodes) {
                    for (var i = 0, l = nodes.length; i < l; i++) {
                        var node = nodes[i];
                        if (that.isNodeSelected(node)) {
                            result.push(node);
                        }
                        else {
                            // if not selected, then if it's a group, and the group
                            // has children, continue to search for selections
                            if (node.group && node.children) {
                                traverse(node.children);
                            }
                        }
                    }
                }
                traverse(topLevelNodes);
                return result;
            };
            SelectionController.prototype.setRowModel = function (rowModel) {
                this.rowModel = rowModel;
            };
            // this clears the selection, but doesn't clear down the css - when it is called, the
            // caller then gets the grid to refresh.
            SelectionController.prototype.deselectAll = function () {
                this.initSelectedNodesById();
                //var keys = Object.keys(this.selectedNodesById);
                //for (var i = 0; i < keys.length; i++) {
                //    delete this.selectedNodesById[keys[i]];
                //}
                this.syncSelectedRowsAndCallListener();
            };
            // this selects everything, but doesn't clear down the css - when it is called, the
            // caller then gets the grid to refresh.
            SelectionController.prototype.selectAll = function () {
                if (typeof this.rowModel.getTopLevelNodes !== 'function') {
                    throw 'selectAll not available when rows are on the server';
                }
                var selectedNodesById = this.selectedNodesById;
                // if the selection is "don't include groups", then we don't include them!
                var includeGroups = !this.gridOptionsWrapper.isGroupSelectsChildren();
                function recursivelySelect(nodes) {
                    if (nodes) {
                        for (var i = 0; i < nodes.length; i++) {
                            var node = nodes[i];
                            if (node.group) {
                                recursivelySelect(node.children);
                                if (includeGroups) {
                                    selectedNodesById[node.id] = node;
                                }
                            }
                            else {
                                selectedNodesById[node.id] = node;
                            }
                        }
                    }
                }
                var topLevelNodes = this.rowModel.getTopLevelNodes();
                recursivelySelect(topLevelNodes);
                this.syncSelectedRowsAndCallListener();
            };
            SelectionController.prototype.selectNode = function (node, tryMulti, suppressEvents) {
                var multiSelect = this.gridOptionsWrapper.isRowSelectionMulti() && tryMulti;
                // if the node is a group, then selecting this is the same as selecting the parent,
                // so to have only one flow through the below, we always select the header parent
                // (which then has the side effect of selecting the child).
                var nodeToSelect;
                if (node.footer) {
                    nodeToSelect = node.sibling;
                }
                else {
                    nodeToSelect = node;
                }
                // at the end, if this is true, we inform the callback
                var atLeastOneItemUnselected = false;
                var atLeastOneItemSelected = false;
                // see if rows to be deselected
                if (!multiSelect) {
                    atLeastOneItemUnselected = this.doWorkOfDeselectAllNodes(null, suppressEvents);
                }
                if (this.gridOptionsWrapper.isGroupSelectsChildren() && nodeToSelect.group) {
                    // don't select the group, select the children instead
                    atLeastOneItemSelected = this.recursivelySelectAllChildren(nodeToSelect);
                }
                else {
                    // see if row needs to be selected
                    atLeastOneItemSelected = this.doWorkOfSelectNode(nodeToSelect, suppressEvents);
                }
                if (atLeastOneItemUnselected || atLeastOneItemSelected) {
                    this.syncSelectedRowsAndCallListener(suppressEvents);
                }
                this.updateGroupParentsIfNeeded();
            };
            SelectionController.prototype.recursivelySelectAllChildren = function (node, suppressEvents) {
                var atLeastOne = false;
                if (node.children) {
                    for (var i = 0; i < node.children.length; i++) {
                        var child = node.children[i];
                        if (child.group) {
                            if (this.recursivelySelectAllChildren(child)) {
                                atLeastOne = true;
                            }
                        }
                        else {
                            if (this.doWorkOfSelectNode(child, suppressEvents)) {
                                atLeastOne = true;
                            }
                        }
                    }
                }
                return atLeastOne;
            };
            SelectionController.prototype.recursivelyDeselectAllChildren = function (node, suppressEvents) {
                if (node.children) {
                    for (var i = 0; i < node.children.length; i++) {
                        var child = node.children[i];
                        if (child.group) {
                            this.recursivelyDeselectAllChildren(child, suppressEvents);
                        }
                        else {
                            this.deselectRealNode(child, suppressEvents);
                        }
                    }
                }
            };
            // 1 - selects a node
            // 2 - updates the UI
            // 3 - calls callbacks
            SelectionController.prototype.doWorkOfSelectNode = function (node, suppressEvents) {
                if (this.selectedNodesById[node.id]) {
                    return false;
                }
                this.selectedNodesById[node.id] = node;
                this.addCssClassForNode_andInformVirtualRowListener(node);
                // also color in the footer if there is one
                if (node.group && node.expanded && node.sibling) {
                    this.addCssClassForNode_andInformVirtualRowListener(node.sibling);
                }
                // inform the rowSelected listener, if any
                if (!suppressEvents) {
                    var event = { node: node };
                    this.eventService.dispatchEvent(grid.Events.EVENT_ROW_SELECTED, event);
                }
                return true;
            };
            // 1 - selects a node
            // 2 - updates the UI
            // 3 - calls callbacks
            // wow - what a big name for a method, exception case, it's saying what the method does
            SelectionController.prototype.addCssClassForNode_andInformVirtualRowListener = function (node) {
                var virtualRenderedRowIndex = this.rowRenderer.getIndexOfRenderedNode(node);
                if (virtualRenderedRowIndex >= 0) {
                    this.eParentsOfRows.forEach(function (rowContainer) {
                        utils.querySelectorAll_addCssClass(rowContainer, '[row="' + virtualRenderedRowIndex + '"]', 'ag-row-selected');
                    });
                    // inform virtual row listener
                    this.angularGrid.onVirtualRowSelected(virtualRenderedRowIndex, true);
                }
            };
            // 1 - un-selects a node
            // 2 - updates the UI
            // 3 - calls callbacks
            SelectionController.prototype.doWorkOfDeselectAllNodes = function (nodeToKeepSelected, suppressEvents) {
                // not doing multi-select, so deselect everything other than the 'just selected' row
                var atLeastOneSelectionChange;
                var selectedNodeKeys = Object.keys(this.selectedNodesById);
                for (var i = 0; i < selectedNodeKeys.length; i++) {
                    // skip the 'just selected' row
                    var key = selectedNodeKeys[i];
                    var nodeToDeselect = this.selectedNodesById[key];
                    if (nodeToDeselect === nodeToKeepSelected) {
                        continue;
                    }
                    else {
                        this.deselectRealNode(nodeToDeselect, suppressEvents);
                        atLeastOneSelectionChange = true;
                    }
                }
                return atLeastOneSelectionChange;
            };
            SelectionController.prototype.deselectRealNode = function (node, suppressEvents) {
                // deselect the css
                this.removeCssClassForNode(node);
                // if node is a header, and if it has a sibling footer, deselect the footer also
                if (node.group && node.expanded && node.sibling) {
                    this.removeCssClassForNode(node.sibling);
                }
                // remove the row
                delete this.selectedNodesById[node.id];
                if (!suppressEvents) {
                    var event = { node: node };
                    this.eventService.dispatchEvent(grid.Events.EVENT_ROW_DESELECTED, event);
                }
            };
            SelectionController.prototype.removeCssClassForNode = function (node) {
                var virtualRenderedRowIndex = this.rowRenderer.getIndexOfRenderedNode(node);
                if (virtualRenderedRowIndex >= 0) {
                    this.eParentsOfRows.forEach(function (rowContainer) {
                        utils.querySelectorAll_removeCssClass(rowContainer, '[row="' + virtualRenderedRowIndex + '"]', 'ag-row-selected');
                    });
                    // inform virtual row listener
                    this.angularGrid.onVirtualRowSelected(virtualRenderedRowIndex, false);
                }
            };
            // used by selectionRendererFactory
            SelectionController.prototype.deselectIndex = function (rowIndex, suppressEvents) {
                if (suppressEvents === void 0) { suppressEvents = false; }
                var node = this.rowModel.getVirtualRow(rowIndex);
                this.deselectNode(node, suppressEvents);
            };
            // used by api
            SelectionController.prototype.deselectNode = function (node, suppressEvents) {
                if (suppressEvents === void 0) { suppressEvents = false; }
                if (node) {
                    if (this.gridOptionsWrapper.isGroupSelectsChildren() && node.group) {
                        // want to deselect children, not this node, so recursively deselect
                        this.recursivelyDeselectAllChildren(node, suppressEvents);
                    }
                    else {
                        this.deselectRealNode(node, suppressEvents);
                    }
                }
                this.syncSelectedRowsAndCallListener();
                this.updateGroupParentsIfNeeded();
            };
            // used by selectionRendererFactory & api
            SelectionController.prototype.selectIndex = function (index, tryMulti, suppressEvents) {
                if (suppressEvents === void 0) { suppressEvents = false; }
                var node = this.rowModel.getVirtualRow(index);
                this.selectNode(node, tryMulti, suppressEvents);
            };
            // updates the selectedRows with the selectedNodes and calls selectionChanged listener
            SelectionController.prototype.syncSelectedRowsAndCallListener = function (suppressEvents) {
                // update selected rows
                var selectedRows = this.selectedRows;
                var oldCount = selectedRows.length;
                // clear selected rows
                selectedRows.length = 0;
                var keys = Object.keys(this.selectedNodesById);
                for (var i = 0; i < keys.length; i++) {
                    if (this.selectedNodesById[keys[i]] !== undefined) {
                        var selectedNode = this.selectedNodesById[keys[i]];
                        selectedRows.push(selectedNode.data);
                    }
                }
                // this stop the event firing the very first the time grid is initialised. without this, the documentation
                // page had a popup in the 'selection' page as soon as the page was loaded!!
                var nothingChangedMustBeInitialising = oldCount === 0 && selectedRows.length === 0;
                if (!nothingChangedMustBeInitialising && !suppressEvents) {
                    var event = {
                        selectedNodesById: this.selectedNodesById,
                        selectedRows: this.selectedRows
                    };
                    this.eventService.dispatchEvent(grid.Events.EVENT_SELECTION_CHANGED, event);
                }
                var that = this;
                if (this.$scope) {
                    setTimeout(function () {
                        that.$scope.$apply();
                    }, 0);
                }
            };
            SelectionController.prototype.recursivelyCheckIfSelected = function (node) {
                var foundSelected = false;
                var foundUnselected = false;
                if (node.children) {
                    for (var i = 0; i < node.children.length; i++) {
                        var child = node.children[i];
                        var result;
                        if (child.group) {
                            result = this.recursivelyCheckIfSelected(child);
                            switch (result) {
                                case SELECTED:
                                    foundSelected = true;
                                    break;
                                case UNSELECTED:
                                    foundUnselected = true;
                                    break;
                                case MIXED:
                                    foundSelected = true;
                                    foundUnselected = true;
                                    break;
                            }
                        }
                        else {
                            if (this.isNodeSelected(child)) {
                                foundSelected = true;
                            }
                            else {
                                foundUnselected = true;
                            }
                        }
                        if (foundSelected && foundUnselected) {
                            // if mixed, then no need to go further, just return up the chain
                            return MIXED;
                        }
                    }
                }
                // got this far, so no conflicts, either all children selected, unselected, or neither
                if (foundSelected) {
                    return SELECTED;
                }
                else if (foundUnselected) {
                    return UNSELECTED;
                }
                else {
                    return DO_NOT_CARE;
                }
            };
            // used by selectionRendererFactory
            // returns:
            // true: if selected
            // false: if unselected
            // undefined: if it's a group and 'children selection' is used and 'children' are a mix of selected and unselected
            SelectionController.prototype.isNodeSelected = function (node) {
                if (this.gridOptionsWrapper.isGroupSelectsChildren() && node.group) {
                    // doing child selection, we need to traverse the children
                    var resultOfChildren = this.recursivelyCheckIfSelected(node);
                    switch (resultOfChildren) {
                        case SELECTED:
                            return true;
                        case UNSELECTED:
                            return false;
                        default:
                            return undefined;
                    }
                }
                else {
                    return this.selectedNodesById[node.id] !== undefined;
                }
            };
            SelectionController.prototype.updateGroupParentsIfNeeded = function () {
                // we only do this if parent nodes are responsible
                // for selecting their children.
                if (!this.gridOptionsWrapper.isGroupSelectsChildren()) {
                    return;
                }
                var firstRow = this.rowRenderer.getFirstVirtualRenderedRow();
                var lastRow = this.rowRenderer.getLastVirtualRenderedRow();
                for (var rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
                    // see if node is a group
                    var node = this.rowModel.getVirtualRow(rowIndex);
                    if (node.group) {
                        var selected = this.isNodeSelected(node);
                        this.angularGrid.onVirtualRowSelected(rowIndex, selected);
                        this.eParentsOfRows.forEach(function (rowContainer) {
                            if (selected) {
                                utils.querySelectorAll_addCssClass(rowContainer, '[row="' + rowIndex + '"]', 'ag-row-selected');
                            }
                            else {
                                utils.querySelectorAll_removeCssClass(rowContainer, '[row="' + rowIndex + '"]', 'ag-row-selected');
                            }
                        });
                    }
                }
            };
            return SelectionController;
        })();
        grid.SelectionController = SelectionController;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var RenderedHeaderElement = (function () {
            function RenderedHeaderElement(eRoot) {
                this.eRoot = eRoot;
            }
            // methods implemented by the base classes
            RenderedHeaderElement.prototype.destroy = function () { };
            RenderedHeaderElement.prototype.refreshFilterIcon = function () { };
            RenderedHeaderElement.prototype.refreshSortIcon = function () { };
            RenderedHeaderElement.prototype.onDragStart = function () { };
            RenderedHeaderElement.prototype.onDragging = function (dragChange, finished) { };
            RenderedHeaderElement.prototype.onIndividualColumnResized = function (column) { };
            RenderedHeaderElement.prototype.getGui = function () { return null; };
            RenderedHeaderElement.prototype.addDragHandler = function (eDraggableElement) {
                var that = this;
                eDraggableElement.addEventListener('mousedown', function (downEvent) {
                    that.onDragStart();
                    that.eRoot.style.cursor = "col-resize";
                    that.dragStartX = downEvent.clientX;
                    var listenersToRemove = {};
                    var lastDelta = 0;
                    listenersToRemove.mousemove = function (moveEvent) {
                        var newX = moveEvent.clientX;
                        lastDelta = newX - that.dragStartX;
                        that.onDragging(lastDelta, false);
                    };
                    listenersToRemove.mouseup = function () {
                        that.stopDragging(listenersToRemove, lastDelta);
                    };
                    listenersToRemove.mouseleave = function () {
                        that.stopDragging(listenersToRemove, lastDelta);
                    };
                    that.eRoot.addEventListener('mousemove', listenersToRemove.mousemove);
                    that.eRoot.addEventListener('mouseup', listenersToRemove.mouseup);
                    that.eRoot.addEventListener('mouseleave', listenersToRemove.mouseleave);
                });
            };
            RenderedHeaderElement.prototype.stopDragging = function (listenersToRemove, dragChange) {
                this.eRoot.style.cursor = "";
                var that = this;
                _.iterateObject(listenersToRemove, function (key, listener) {
                    that.eRoot.removeEventListener(key, listener);
                });
                that.onDragging(dragChange, true);
            };
            return RenderedHeaderElement;
        })();
        grid.RenderedHeaderElement = RenderedHeaderElement;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path='../utils.ts' />
/// <reference path='../filter/filterManager.ts' />
/// <reference path='../gridOptionsWrapper.ts' />
/// <reference path='../columnController/columnController.ts' />
/// <reference path='renderedHeaderElement.ts' />
/// <reference path='headerTemplateLoader.ts' />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var RenderedHeaderCell = (function (_super) {
            __extends(RenderedHeaderCell, _super);
            function RenderedHeaderCell(column, parentGroup, gridOptionsWrapper, parentScope, filterManager, columnController, $compile, angularGrid, eRoot, headerTemplateLoader) {
                _super.call(this, eRoot);
                this.column = column;
                this.parentGroup = parentGroup;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.parentScope = parentScope;
                this.filterManager = filterManager;
                this.columnController = columnController;
                this.$compile = $compile;
                this.grid = angularGrid;
                this.headerTemplateLoader = headerTemplateLoader;
                this.setupComponents();
            }
            RenderedHeaderCell.prototype.getGui = function () {
                return this.eHeaderCell;
            };
            RenderedHeaderCell.prototype.destroy = function () {
                if (this.childScope) {
                    this.childScope.$destroy();
                }
            };
            RenderedHeaderCell.prototype.createScope = function () {
                if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
                    this.childScope = this.parentScope.$new();
                    this.childScope.colDef = this.column.getColDef();
                    this.childScope.colIndex = this.column.getIndex();
                    this.childScope.colDefWrapper = this.column;
                }
            };
            RenderedHeaderCell.prototype.addAttributes = function () {
                this.eHeaderCell.setAttribute("col", (this.column.getIndex() !== undefined
                    && this.column.getIndex() !== null)
                    ? this.column.getIndex().toString() : '');
                this.eHeaderCell.setAttribute("colId", this.column.getColId());
            };
            RenderedHeaderCell.prototype.addMenu = function () {
                var eMenu = this.eHeaderCell.querySelector('#agMenu');
                // if no menu provided in template, do nothing
                if (!eMenu) {
                    return;
                }
                var weWantMenu = this.gridOptionsWrapper.isEnableFilter() && !this.column.getColDef().suppressMenu;
                if (!weWantMenu) {
                    _.removeFromParent(eMenu);
                    return;
                }
                var that = this;
                eMenu.addEventListener('click', function () {
                    that.filterManager.showFilter(that.column, this);
                });
                if (!this.gridOptionsWrapper.isSuppressMenuHide()) {
                    eMenu.style.opacity = '0';
                    this.eHeaderCell.addEventListener('mouseenter', function () {
                        eMenu.style.opacity = '1';
                    });
                    this.eHeaderCell.addEventListener('mouseleave', function () {
                        eMenu.style.opacity = '0';
                    });
                }
                var style = eMenu.style;
                style['transition'] = 'opacity 0.5s, border 0.2s';
                style['-webkit-transition'] = 'opacity 0.5s, border 0.2s';
            };
            RenderedHeaderCell.prototype.removeSortIcons = function () {
                _.removeFromParent(this.eHeaderCell.querySelector('#agSortAsc'));
                _.removeFromParent(this.eHeaderCell.querySelector('#agSortDesc'));
                _.removeFromParent(this.eHeaderCell.querySelector('#agNoSort'));
            };
            RenderedHeaderCell.prototype.addSortIcons = function () {
                this.eSortAsc = this.eHeaderCell.querySelector('#agSortAsc');
                this.eSortDesc = this.eHeaderCell.querySelector('#agSortDesc');
                this.eSortNone = this.eHeaderCell.querySelector('#agNoSort');
                if (this.eSortAsc) {
                    this.eSortAsc.style.display = 'none';
                }
                if (this.eSortDesc) {
                    this.eSortDesc.style.display = 'none';
                }
                var showingNoSortIcon = this.column.getColDef().unSortIcon || this.gridOptionsWrapper.isUnSortIcon();
                // 'no sort' icon
                if (!showingNoSortIcon) {
                    _.removeFromParent(this.eSortNone);
                }
            };
            RenderedHeaderCell.prototype.setupComponents = function () {
                this.eHeaderCell = this.headerTemplateLoader.createHeaderElement(this.column);
                _.addCssClass(this.eHeaderCell, 'ag-header-cell');
                this.createScope();
                this.addAttributes();
                this.addHeaderClassesFromCollDef();
                var colDef = this.column.getColDef();
                // add tooltip if exists
                if (colDef.headerTooltip) {
                    this.eHeaderCell.title = colDef.headerTooltip;
                }
                this.addResize();
                this.addMenu();
                // label div
                this.eText = this.eHeaderCell.querySelector('#agText');
                // add in sort icons
                this.addSort();
                // add in filter icon
                this.eFilterIcon = this.eHeaderCell.querySelector('#agFilter');
                // render the cell, use a renderer if one is provided
                var headerCellRenderer;
                if (colDef.headerCellRenderer) {
                    headerCellRenderer = colDef.headerCellRenderer;
                }
                else if (this.gridOptionsWrapper.getHeaderCellRenderer()) {
                    headerCellRenderer = this.gridOptionsWrapper.getHeaderCellRenderer();
                }
                var headerNameValue = this.columnController.getDisplayNameForCol(this.column);
                if (this.eText) {
                    if (headerCellRenderer) {
                        this.useRenderer(headerNameValue, headerCellRenderer);
                    }
                    else {
                        // no renderer, default text render
                        this.eText.className = 'ag-header-cell-text';
                        this.eText.innerHTML = headerNameValue;
                    }
                }
                this.eHeaderCell.style.width = _.formatWidth(this.column.getActualWidth());
                this.refreshFilterIcon();
                this.refreshSortIcon();
            };
            RenderedHeaderCell.prototype.addSort = function () {
                var enableSorting = this.gridOptionsWrapper.isEnableSorting() && !this.column.getColDef().suppressSorting;
                if (enableSorting) {
                    this.addSortIcons();
                    this.addSortHandling();
                }
                else {
                    this.removeSortIcons();
                }
            };
            RenderedHeaderCell.prototype.addResize = function () {
                var _this = this;
                var colDef = this.column.getColDef();
                var eResize = this.eHeaderCell.querySelector('#agResizeBar');
                // if no eResize in template, do nothing
                if (!eResize) {
                    return;
                }
                var weWantResize = this.gridOptionsWrapper.isEnableColResize() && !colDef.suppressResize;
                if (!weWantResize) {
                    _.removeFromParent(eResize);
                    return;
                }
                this.addDragHandler(eResize);
                var weWantAutoSize = !this.gridOptionsWrapper.isSuppressAutoSize() && !colDef.suppressAutoSize;
                if (weWantAutoSize) {
                    eResize.addEventListener('dblclick', function (event) {
                        _this.columnController.autoSizeColumn(_this.column);
                    });
                }
            };
            RenderedHeaderCell.prototype.useRenderer = function (headerNameValue, headerCellRenderer) {
                // renderer provided, use it
                var cellRendererParams = {
                    colDef: this.column.getColDef(),
                    $scope: this.childScope,
                    context: this.gridOptionsWrapper.getContext(),
                    value: headerNameValue,
                    api: this.gridOptionsWrapper.getApi(),
                    eHeaderCell: this.eHeaderCell
                };
                var cellRendererResult = headerCellRenderer(cellRendererParams);
                var childToAppend;
                if (_.isNodeOrElement(cellRendererResult)) {
                    // a dom node or element was returned, so add child
                    childToAppend = cellRendererResult;
                }
                else {
                    // otherwise assume it was html, so just insert
                    var eTextSpan = document.createElement("span");
                    eTextSpan.innerHTML = cellRendererResult;
                    childToAppend = eTextSpan;
                }
                // angular compile header if option is turned on
                if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
                    var childToAppendCompiled = this.$compile(childToAppend)(this.childScope)[0];
                    this.eText.appendChild(childToAppendCompiled);
                }
                else {
                    this.eText.appendChild(childToAppend);
                }
            };
            RenderedHeaderCell.prototype.refreshFilterIcon = function () {
                var filterPresent = this.filterManager.isFilterPresentForCol(this.column.getColId());
                if (this.eFilterIcon) {
                    _.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-filtered', filterPresent);
                    this.eFilterIcon.style.display = filterPresent ? 'inline' : 'none';
                }
            };
            RenderedHeaderCell.prototype.refreshSortIcon = function () {
                // update visibility of icons
                var sortAscending = this.column.getSort() === grid.Column.SORT_ASC;
                var sortDescending = this.column.getSort() === grid.Column.SORT_DESC;
                var sortNone = this.column.getSort() !== grid.Column.SORT_DESC && this.column.getSort() !== grid.Column.SORT_ASC;
                if (this.eSortAsc) {
                    _.setVisible(this.eSortAsc, sortAscending);
                }
                if (this.eSortDesc) {
                    _.setVisible(this.eSortDesc, sortDescending);
                }
                if (this.eSortNone) {
                    _.setVisible(this.eSortNone, sortNone);
                }
                _.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-sorted-asc', sortAscending);
                _.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-sorted-desc', sortDescending);
                _.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-sorted-none', sortNone);
            };
            RenderedHeaderCell.prototype.getNextSortDirection = function () {
                var sortingOrder;
                if (this.column.getColDef().sortingOrder) {
                    sortingOrder = this.column.getColDef().sortingOrder;
                }
                else if (this.gridOptionsWrapper.getSortingOrder()) {
                    sortingOrder = this.gridOptionsWrapper.getSortingOrder();
                }
                else {
                    sortingOrder = RenderedHeaderCell.DEFAULT_SORTING_ORDER;
                }
                if (!Array.isArray(sortingOrder) || sortingOrder.length <= 0) {
                    console.warn('ag-grid: sortingOrder must be an array with at least one element, currently it\'s ' + sortingOrder);
                    return;
                }
                var currentIndex = sortingOrder.indexOf(this.column.getSort());
                var notInArray = currentIndex < 0;
                var lastItemInArray = currentIndex == sortingOrder.length - 1;
                var result;
                if (notInArray || lastItemInArray) {
                    result = sortingOrder[0];
                }
                else {
                    result = sortingOrder[currentIndex + 1];
                }
                // verify the sort type exists, as the user could provide the sortOrder, need to make sure it's valid
                if (RenderedHeaderCell.DEFAULT_SORTING_ORDER.indexOf(result) < 0) {
                    console.warn('ag-grid: invalid sort type ' + result);
                    return null;
                }
                return result;
            };
            RenderedHeaderCell.prototype.addSortHandling = function () {
                var _this = this;
                this.eText.addEventListener("click", function (event) {
                    // update sort on current col
                    _this.column.setSort(_this.getNextSortDirection());
                    // sortedAt used for knowing order of cols when multi-col sort
                    if (_this.column.getSort()) {
                        _this.column.setSortedAt(new Date().valueOf());
                    }
                    else {
                        _this.column.setSortedAt(null);
                    }
                    var doingMultiSort = !_this.gridOptionsWrapper.isSuppressMultiSort() && event.shiftKey;
                    // clear sort on all columns except this one, and update the icons
                    if (!doingMultiSort) {
                        _this.columnController.getAllColumns().forEach(function (columnToClear) {
                            // Do not clear if either holding shift, or if column in question was clicked
                            if (!(columnToClear === _this.column)) {
                                columnToClear.sort = null;
                            }
                        });
                    }
                    _this.grid.onSortingChanged();
                });
            };
            RenderedHeaderCell.prototype.onDragStart = function () {
                this.startWidth = this.column.getActualWidth();
            };
            RenderedHeaderCell.prototype.onDragging = function (dragChange, finished) {
                var newWidth = this.startWidth + dragChange;
                this.columnController.setColumnWidth(this.column, newWidth, finished);
            };
            RenderedHeaderCell.prototype.onIndividualColumnResized = function (column) {
                if (this.column !== column) {
                    return;
                }
                var newWidthPx = column.getActualWidth() + "px";
                this.eHeaderCell.style.width = newWidthPx;
            };
            RenderedHeaderCell.prototype.addHeaderClassesFromCollDef = function () {
                var _this = this;
                if (this.column.getColDef().headerClass) {
                    var classToUse;
                    if (typeof this.column.getColDef().headerClass === 'function') {
                        var params = {
                            colDef: this.column.getColDef(),
                            $scope: this.childScope,
                            context: this.gridOptionsWrapper.getContext(),
                            api: this.gridOptionsWrapper.getApi()
                        };
                        var headerClassFunc = this.column.getColDef().headerClass;
                        classToUse = headerClassFunc(params);
                    }
                    else {
                        classToUse = this.column.getColDef().headerClass;
                    }
                    if (typeof classToUse === 'string') {
                        _.addCssClass(this.eHeaderCell, classToUse);
                    }
                    else if (Array.isArray(classToUse)) {
                        classToUse.forEach(function (cssClassItem) {
                            _.addCssClass(_this.eHeaderCell, cssClassItem);
                        });
                    }
                }
            };
            RenderedHeaderCell.DEFAULT_SORTING_ORDER = [grid.Column.SORT_ASC, grid.Column.SORT_DESC, null];
            return RenderedHeaderCell;
        })(grid.RenderedHeaderElement);
        grid.RenderedHeaderCell = RenderedHeaderCell;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path='../utils.ts' />
/// <reference path='renderedHeaderCell.ts' />
/// <reference path='renderedHeaderElement.ts' />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var constants = grid.Constants;
        var svgFactory = grid.SvgFactory.getInstance();
        var RenderedHeaderGroupCell = (function (_super) {
            __extends(RenderedHeaderGroupCell, _super);
            function RenderedHeaderGroupCell(columnGroup, gridOptionsWrapper, columnController, eRoot, angularGrid, parentScope, filterManager, $compile) {
                _super.call(this, eRoot);
                this.columnController = columnController;
                this.columnGroup = columnGroup;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.parentScope = parentScope;
                this.filterManager = filterManager;
                this.$compile = $compile;
                this.angularGrid = angularGrid;
                this.setupComponents();
            }
            RenderedHeaderGroupCell.prototype.getGui = function () {
                return this.eHeaderGroupCell;
            };
            RenderedHeaderGroupCell.prototype.onIndividualColumnResized = function (column) {
                if (this.columnGroup.isChildInThisGroupDeepSearch(column)) {
                    this.setWidthOfGroupHeaderCell();
                }
            };
            RenderedHeaderGroupCell.prototype.setupComponents = function () {
                var _this = this;
                this.eHeaderGroupCell = document.createElement('div');
                var classNames = ['ag-header-group-cell'];
                // having different classes below allows the style to not have a bottom border
                // on the group header, if no group is specified
                if (this.columnGroup.getColGroupDef()) {
                    classNames.push('ag-header-group-cell-with-group');
                }
                else {
                    classNames.push('ag-header-group-cell-no-group');
                }
                this.eHeaderGroupCell.className = classNames.join(' ');
                this.eHeaderGroupCell.style.height = this.gridOptionsWrapper.getHeaderHeight() + 'px';
                if (this.gridOptionsWrapper.isEnableColResize()) {
                    this.eHeaderCellResize = document.createElement("div");
                    this.eHeaderCellResize.className = "ag-header-cell-resize";
                    this.eHeaderGroupCell.appendChild(this.eHeaderCellResize);
                    this.addDragHandler(this.eHeaderCellResize);
                    if (!this.gridOptionsWrapper.isSuppressAutoSize()) {
                        this.eHeaderCellResize.addEventListener('dblclick', function (event) {
                            // get list of all the column keys we are responsible for
                            var keys = [];
                            _this.columnGroup.getDisplayedLeafColumns().forEach(function (column) {
                                // not all cols in the group may be participating with auto-resize
                                if (!column.getColDef().suppressAutoSize) {
                                    keys.push(column.getColId());
                                }
                            });
                            if (keys.length > 0) {
                                _this.columnController.autoSizeColumns(keys);
                            }
                        });
                    }
                }
                // no renderer, default text render
                var groupName = this.columnGroup.getHeaderName();
                if (groupName && groupName !== '') {
                    var eGroupCellLabel = document.createElement("div");
                    eGroupCellLabel.className = 'ag-header-group-cell-label';
                    this.eHeaderGroupCell.appendChild(eGroupCellLabel);
                    var eInnerText = document.createElement("span");
                    eInnerText.className = 'ag-header-group-text';
                    eInnerText.innerHTML = groupName;
                    eGroupCellLabel.appendChild(eInnerText);
                    if (this.columnGroup.isExpandable()) {
                        this.addGroupExpandIcon(eGroupCellLabel);
                    }
                }
                this.setWidthOfGroupHeaderCell();
            };
            RenderedHeaderGroupCell.prototype.setWidthOfGroupHeaderCell = function () {
                this.eHeaderGroupCell.style.width = _.formatWidth(this.columnGroup.getActualWidth());
            };
            RenderedHeaderGroupCell.prototype.addGroupExpandIcon = function (eGroupCellLabel) {
                var eGroupIcon;
                if (this.columnGroup.isExpanded()) {
                    eGroupIcon = _.createIcon('columnGroupOpened', this.gridOptionsWrapper, null, svgFactory.createArrowLeftSvg);
                }
                else {
                    eGroupIcon = _.createIcon('columnGroupClosed', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
                }
                eGroupIcon.className = 'ag-header-expand-icon';
                eGroupCellLabel.appendChild(eGroupIcon);
                var that = this;
                eGroupIcon.onclick = function () {
                    var newExpandedValue = !that.columnGroup.isExpanded();
                    that.columnController.setColumnGroupOpened(that.columnGroup, newExpandedValue);
                };
            };
            RenderedHeaderGroupCell.prototype.onDragStart = function () {
                var _this = this;
                this.groupWidthStart = this.columnGroup.getActualWidth();
                this.childrenWidthStarts = [];
                this.columnGroup.getDisplayedLeafColumns().forEach(function (column) {
                    _this.childrenWidthStarts.push(column.getActualWidth());
                });
            };
            RenderedHeaderGroupCell.prototype.onDragging = function (dragChange, finished) {
                var _this = this;
                var newWidth = this.groupWidthStart + dragChange;
                var minWidth = this.columnGroup.getMinimumWidth();
                if (newWidth < minWidth) {
                    newWidth = minWidth;
                }
                // set the new width to the group header
                //var newWidthPx = newWidth + "px";
                //this.eHeaderGroupCell.style.width = newWidthPx;
                //this.columnGroup.actualWidth = newWidth;
                // distribute the new width to the child headers
                var changeRatio = newWidth / this.groupWidthStart;
                // keep track of pixels used, and last column gets the remaining,
                // to cater for rounding errors, and min width adjustments
                var pixelsToDistribute = newWidth;
                var displayedColumns = this.columnGroup.getDisplayedLeafColumns();
                displayedColumns.forEach(function (column, index) {
                    var notLastCol = index !== (displayedColumns.length - 1);
                    var newChildSize;
                    if (notLastCol) {
                        // if not the last col, calculate the column width as normal
                        var startChildSize = _this.childrenWidthStarts[index];
                        newChildSize = startChildSize * changeRatio;
                        if (newChildSize < column.getMinimumWidth()) {
                            newChildSize = column.getMinimumWidth();
                        }
                        pixelsToDistribute -= newChildSize;
                    }
                    else {
                        // if last col, give it the remaining pixels
                        newChildSize = pixelsToDistribute;
                    }
                    _this.columnController.setColumnWidth(column, newChildSize, finished);
                });
            };
            return RenderedHeaderGroupCell;
        })(grid.RenderedHeaderElement);
        grid.RenderedHeaderGroupCell = RenderedHeaderGroupCell;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../headerRendering/renderedHeaderElement.ts" />
/// <reference path="../headerRendering/renderedHeaderCell.ts" />
/// <reference path="../headerRendering/renderedHeaderGroupCell.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var HeaderRenderer = (function () {
            function HeaderRenderer() {
                this.headerElements = [];
            }
            HeaderRenderer.prototype.init = function (gridOptionsWrapper, columnController, gridPanel, angularGrid, filterManager, $scope, $compile, headerTemplateLoader) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.columnController = columnController;
                this.angularGrid = angularGrid;
                this.filterManager = filterManager;
                this.$scope = $scope;
                this.$compile = $compile;
                this.headerTemplateLoader = headerTemplateLoader;
                this.findAllElements(gridPanel);
            };
            HeaderRenderer.prototype.findAllElements = function (gridPanel) {
                this.ePinnedLeftHeader = gridPanel.getPinnedLeftHeader();
                this.ePinnedRightHeader = gridPanel.getPinnedRightHeader();
                this.eHeaderContainer = gridPanel.getHeaderContainer();
                this.eHeaderViewport = gridPanel.getHeaderViewport();
                this.eRoot = gridPanel.getRoot();
            };
            HeaderRenderer.prototype.refreshHeader = function () {
                utils.removeAllChildren(this.ePinnedLeftHeader);
                utils.removeAllChildren(this.ePinnedRightHeader);
                utils.removeAllChildren(this.eHeaderContainer);
                this.headerElements.forEach(function (headerElement) {
                    headerElement.destroy();
                });
                this.headerElements = [];
                this.insertHeaderRowsIntoContainer(this.columnController.getLeftDisplayedColumnGroups(), this.ePinnedLeftHeader);
                this.insertHeaderRowsIntoContainer(this.columnController.getRightDisplayedColumnGroups(), this.ePinnedRightHeader);
                this.insertHeaderRowsIntoContainer(this.columnController.getCenterDisplayedColumnGroups(), this.eHeaderContainer);
            };
            HeaderRenderer.prototype.addTreeNodesAtDept = function (cellTree, dept, result) {
                var _this = this;
                cellTree.forEach(function (abstractColumn) {
                    if (dept === 0) {
                        result.push(abstractColumn);
                    }
                    else if (abstractColumn instanceof grid.ColumnGroup) {
                        var columnGroup = abstractColumn;
                        _this.addTreeNodesAtDept(columnGroup.getDisplayedChildren(), dept - 1, result);
                    }
                    else {
                    }
                });
            };
            HeaderRenderer.prototype.setPinnedColContainerWidth = function () {
                if (this.gridOptionsWrapper.isForPrint()) {
                    // pinned col doesn't exist when doing forPrint
                    return;
                }
                var pinnedLeftWidth = this.columnController.getPinnedLeftContainerWidth() + 'px';
                this.eHeaderViewport.style.marginLeft = pinnedLeftWidth;
                var pinnedRightWidth = this.columnController.getPinnedRightContainerWidth() + 'px';
                this.eHeaderViewport.style.marginRight = pinnedRightWidth;
            };
            HeaderRenderer.prototype.insertHeaderRowsIntoContainer = function (cellTree, eContainerToAddTo) {
                var _this = this;
                // if we are displaying header groups, then we have many rows here.
                // go through each row of the header, one by one.
                for (var dept = 0;; dept++) {
                    var nodesAtDept = [];
                    this.addTreeNodesAtDept(cellTree, dept, nodesAtDept);
                    // we want to break the for loop when we get to an empty set of cells,
                    // that's how we know we have finished rendering the last row.
                    if (nodesAtDept.length === 0) {
                        break;
                    }
                    var eRow = document.createElement('div');
                    eRow.className = 'ag-header-row';
                    eRow.style.top = (dept * this.gridOptionsWrapper.getHeaderHeight()) + 'px';
                    eRow.style.height = this.gridOptionsWrapper.getHeaderHeight() + 'px';
                    nodesAtDept.forEach(function (child) {
                        var renderedHeaderElement = _this.createHeaderElement(child);
                        _this.headerElements.push(renderedHeaderElement);
                        eRow.appendChild(renderedHeaderElement.getGui());
                    });
                    eContainerToAddTo.appendChild(eRow);
                }
            };
            HeaderRenderer.prototype.createHeaderElement = function (columnGroupChild) {
                if (columnGroupChild instanceof grid.ColumnGroup) {
                    return new grid.RenderedHeaderGroupCell(columnGroupChild, this.gridOptionsWrapper, this.columnController, this.eRoot, this.angularGrid, this.$scope, this.filterManager, this.$compile);
                }
                else {
                    return new grid.RenderedHeaderCell(columnGroupChild, null, this.gridOptionsWrapper, this.$scope, this.filterManager, this.columnController, this.$compile, this.angularGrid, this.eRoot, this.headerTemplateLoader);
                }
            };
            HeaderRenderer.prototype.updateSortIcons = function () {
                this.headerElements.forEach(function (headerElement) {
                    headerElement.refreshSortIcon();
                });
            };
            HeaderRenderer.prototype.updateFilterIcons = function () {
                this.headerElements.forEach(function (headerElement) {
                    headerElement.refreshFilterIcon();
                });
            };
            HeaderRenderer.prototype.onIndividualColumnResized = function (column) {
                this.headerElements.forEach(function (headerElement) {
                    headerElement.onIndividualColumnResized(column);
                });
            };
            return HeaderRenderer;
        })();
        grid.HeaderRenderer = HeaderRenderer;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var GroupCreator = (function () {
            function GroupCreator() {
            }
            GroupCreator.prototype.init = function (valueService, gridOptionsWrapper) {
                this.valueService = valueService;
                this.gridOptionsWrapper = gridOptionsWrapper;
            };
            GroupCreator.prototype.group = function (rowNodes, groupedCols, expandByDefault) {
                var topMostGroup = {
                    level: -1,
                    children: [],
                    _childrenMap: {}
                };
                var allGroups = [];
                allGroups.push(topMostGroup);
                var levelToInsertChild = groupedCols.length - 1;
                var i;
                var currentLevel;
                var node;
                var data;
                var currentGroup;
                var groupKey;
                var nextGroup;
                var includeParents = !this.gridOptionsWrapper.isSuppressParentsInRowNodes();
                // start at -1 and go backwards, as all the positive indexes
                // are already used by the nodes.
                var index = -1;
                for (i = 0; i < rowNodes.length; i++) {
                    node = rowNodes[i];
                    data = node.data;
                    // all leaf nodes have the same level in this grouping, which is one level after the last group
                    node.level = levelToInsertChild + 1;
                    for (currentLevel = 0; currentLevel < groupedCols.length; currentLevel++) {
                        var groupColumn = groupedCols[currentLevel];
                        groupKey = this.valueService.getValue(groupColumn.getColDef(), data, node);
                        if (currentLevel === 0) {
                            currentGroup = topMostGroup;
                        }
                        // if group doesn't exist yet, create it
                        nextGroup = currentGroup._childrenMap[groupKey];
                        if (!nextGroup) {
                            nextGroup = {
                                group: true,
                                field: groupColumn.getColDef().field,
                                id: index--,
                                key: groupKey,
                                expanded: this.isExpanded(expandByDefault, currentLevel),
                                children: [],
                                // for top most level, parent is null
                                parent: null,
                                allChildrenCount: 0,
                                level: currentGroup.level + 1,
                                _childrenMap: {} //this is a temporary map, we remove at the end of this method
                            };
                            if (includeParents) {
                                nextGroup.parent = currentGroup === topMostGroup ? null : currentGroup;
                            }
                            currentGroup._childrenMap[groupKey] = nextGroup;
                            currentGroup.children.push(nextGroup);
                            allGroups.push(nextGroup);
                        }
                        nextGroup.allChildrenCount++;
                        if (currentLevel == levelToInsertChild) {
                            if (includeParents) {
                                node.parent = nextGroup === topMostGroup ? null : nextGroup;
                            }
                            nextGroup.children.push(node);
                        }
                        else {
                            currentGroup = nextGroup;
                        }
                    }
                }
                //remove the temporary map
                for (i = 0; i < allGroups.length; i++) {
                    delete allGroups[i]._childrenMap;
                }
                return topMostGroup.children;
            };
            GroupCreator.prototype.isExpanded = function (expandByDefault, level) {
                if (typeof expandByDefault === 'number') {
                    return level < expandByDefault;
                }
                else {
                    return expandByDefault === true || expandByDefault === 'true';
                }
            };
            return GroupCreator;
        })();
        grid.GroupCreator = GroupCreator;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../groupCreator.ts" />
/// <reference path="../entities/rowNode.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var constants = grid.Constants;
        var RecursionType;
        (function (RecursionType) {
            RecursionType[RecursionType["Normal"] = 0] = "Normal";
            RecursionType[RecursionType["AfterFilter"] = 1] = "AfterFilter";
            RecursionType[RecursionType["AfterFilterAndSort"] = 2] = "AfterFilterAndSort";
        })(RecursionType || (RecursionType = {}));
        ;
        var InMemoryRowController = (function () {
            function InMemoryRowController() {
                this.createModel();
            }
            InMemoryRowController.prototype.init = function (gridOptionsWrapper, columnController, angularGrid, filterManager, $scope, groupCreator, valueService, eventService) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.columnController = columnController;
                this.angularGrid = angularGrid;
                this.filterManager = filterManager;
                this.$scope = $scope;
                this.groupCreator = groupCreator;
                this.valueService = valueService;
                this.eventService = eventService;
                this.allRows = null;
                this.rowsAfterGroup = null;
                this.rowsAfterFilter = null;
                this.rowsAfterSort = null;
                this.rowsToDisplay = null;
            };
            InMemoryRowController.prototype.createModel = function () {
                var that = this;
                this.model = {
                    // this method is implemented by the inMemory model only,
                    // it gives the top level of the selection. used by the selection
                    // controller, when it needs to do a full traversal
                    getTopLevelNodes: function () {
                        return that.rowsAfterGroup;
                    },
                    getVirtualRow: function (index) {
                        return that.rowsToDisplay[index];
                    },
                    getVirtualRowCount: function () {
                        if (that.rowsToDisplay) {
                            return that.rowsToDisplay.length;
                        }
                        else {
                            return 0;
                        }
                    },
                    getRowAtPixel: function (pixel) {
                        return that.getRowAtPixel(pixel);
                    },
                    getVirtualRowCombinedHeight: function () {
                        return that.getVirtualRowCombinedHeight();
                    },
                    forEachInMemory: function (callback) {
                        that.forEachInMemory(callback);
                    },
                    forEachNode: function (callback) {
                        that.forEachNode(callback);
                    },
                    forEachNodeAfterFilter: function (callback) {
                        that.forEachNodeAfterFilter(callback);
                    },
                    forEachNodeAfterFilterAndSort: function (callback) {
                        that.forEachNodeAfterFilterAndSort(callback);
                    }
                };
            };
            InMemoryRowController.prototype.getRowAtPixel = function (pixelToMatch) {
                // do binary search of tree
                // http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
                var bottomPointer = 0;
                var topPointer = this.rowsToDisplay.length - 1;
                // quick check, if the pixel is out of bounds, then return last row
                var lastNode = this.rowsToDisplay[this.rowsToDisplay.length - 1];
                if (lastNode.rowTop <= pixelToMatch) {
                    return this.rowsToDisplay.length - 1;
                }
                while (true) {
                    var midPointer = Math.floor((bottomPointer + topPointer) / 2);
                    var currentRowNode = this.rowsToDisplay[midPointer];
                    if (this.isRowInPixel(currentRowNode, pixelToMatch)) {
                        return midPointer;
                    }
                    else if (currentRowNode.rowTop < pixelToMatch) {
                        bottomPointer = midPointer + 1;
                    }
                    else if (currentRowNode.rowTop > pixelToMatch) {
                        topPointer = midPointer - 1;
                    }
                }
            };
            InMemoryRowController.prototype.isRowInPixel = function (rowNode, pixelToMatch) {
                var topPixel = rowNode.rowTop;
                var bottomPixel = rowNode.rowTop + rowNode.rowHeight;
                var pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
                return pixelInRow;
            };
            InMemoryRowController.prototype.getVirtualRowCombinedHeight = function () {
                if (this.rowsToDisplay && this.rowsToDisplay.length > 0) {
                    var lastRow = this.rowsToDisplay[this.rowsToDisplay.length - 1];
                    var lastPixel = lastRow.rowTop + lastRow.rowHeight;
                    return lastPixel;
                }
                else {
                    return 0;
                }
            };
            InMemoryRowController.prototype.getModel = function () {
                return this.model;
            };
            InMemoryRowController.prototype.forEachInMemory = function (callback) {
                console.warn('ag-Grid: please use forEachNode instead of forEachInMemory, method is same, I just renamed it, forEachInMemory is deprecated');
                this.forEachNode(callback);
            };
            InMemoryRowController.prototype.forEachNode = function (callback) {
                this.recursivelyWalkNodesAndCallback(this.rowsAfterGroup, callback, RecursionType.Normal, 0);
            };
            InMemoryRowController.prototype.forEachNodeAfterFilter = function (callback) {
                this.recursivelyWalkNodesAndCallback(this.rowsAfterFilter, callback, RecursionType.AfterFilter, 0);
            };
            InMemoryRowController.prototype.forEachNodeAfterFilterAndSort = function (callback) {
                this.recursivelyWalkNodesAndCallback(this.rowsAfterSort, callback, RecursionType.AfterFilterAndSort, 0);
            };
            // iterates through each item in memory, and calls the callback function
            // nodes - the rowNodes to traverse
            // callback - the user provided callback
            // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
            // index - works similar to the index in forEach in javascripts array function
            InMemoryRowController.prototype.recursivelyWalkNodesAndCallback = function (nodes, callback, recursionType, index) {
                if (nodes) {
                    for (var i = 0; i < nodes.length; i++) {
                        var node = nodes[i];
                        callback(node, index++);
                        // go to the next level if it is a group
                        if (node.group) {
                            // depending on the recursion type, we pick a difference set of children
                            var nodeChildren;
                            switch (recursionType) {
                                case RecursionType.Normal:
                                    nodeChildren = node.children;
                                    break;
                                case RecursionType.AfterFilter:
                                    nodeChildren = node.childrenAfterFilter;
                                    break;
                                case RecursionType.AfterFilterAndSort:
                                    nodeChildren = node.childrenAfterSort;
                                    break;
                            }
                            if (nodeChildren) {
                                index = this.recursivelyWalkNodesAndCallback(nodeChildren, callback, recursionType, index);
                            }
                        }
                    }
                }
                return index;
            };
            InMemoryRowController.prototype.updateModel = function (step) {
                var _this = this;
                // fallthrough in below switch is on purpose
                switch (step) {
                    case constants.STEP_EVERYTHING:
                    case constants.STEP_FILTER:
                        this.doFilter();
                        this.doAggregate();
                    case constants.STEP_SORT:
                        this.doSort();
                    case constants.STEP_MAP:
                        this.doRowsToDisplay();
                }
                this.eventService.dispatchEvent(grid.Events.EVENT_MODEL_UPDATED);
                if (this.$scope) {
                    setTimeout(function () {
                        _this.$scope.$apply();
                    }, 0);
                }
            };
            InMemoryRowController.prototype.ensureRowHasHeight = function (rowNode) {
            };
            InMemoryRowController.prototype.defaultGroupAggFunctionFactory = function (valueColumns) {
                // make closure of variable, so is available for methods below
                var _valueService = this.valueService;
                return function groupAggFunction(rows) {
                    var result = {};
                    for (var j = 0; j < valueColumns.length; j++) {
                        var valueColumn = valueColumns[j];
                        var colKey = valueColumn.getColDef().field;
                        if (!colKey) {
                            console.log('ag-Grid: you need to provide a field for all value columns so that ' +
                                'the grid knows what field to store the result in. so even if using a valueGetter, ' +
                                'the result will not be stored in a value getter.');
                        }
                        // at this point, if no values were numbers, the result is null (not zero)
                        result[colKey] = aggregateColumn(rows, valueColumn.getAggFunc(), colKey, valueColumn.getColDef());
                    }
                    return result;
                };
                // if colDef is passed in, we are working off a column value, if it is not passed in, we are
                // working off colKeys passed in to the gridOptions
                function aggregateColumn(rowNodes, aggFunc, colKey, colDef) {
                    var resultForColumn = null;
                    for (var i = 0; i < rowNodes.length; i++) {
                        var rowNode = rowNodes[i];
                        // if the row is a group, then it will only have an agg result value,
                        // which means valueGetter is never used.
                        var thisColumnValue;
                        if (colDef && !rowNode.group) {
                            thisColumnValue = _valueService.getValue(colDef, rowNode.data, rowNode);
                        }
                        else {
                            thisColumnValue = rowNode.data[colKey];
                        }
                        // only include if the value is a number
                        if (typeof thisColumnValue === 'number') {
                            switch (aggFunc) {
                                case grid.Column.AGG_SUM:
                                    resultForColumn += thisColumnValue;
                                    break;
                                case grid.Column.AGG_MIN:
                                    if (resultForColumn === null) {
                                        resultForColumn = thisColumnValue;
                                    }
                                    else if (resultForColumn > thisColumnValue) {
                                        resultForColumn = thisColumnValue;
                                    }
                                    break;
                                case grid.Column.AGG_MAX:
                                    if (resultForColumn === null) {
                                        resultForColumn = thisColumnValue;
                                    }
                                    else if (resultForColumn < thisColumnValue) {
                                        resultForColumn = thisColumnValue;
                                    }
                                    break;
                            }
                        }
                    }
                    return resultForColumn;
                }
            };
            // it's possible to recompute the aggregate without doing the other parts
            InMemoryRowController.prototype.doAggregate = function () {
                var groupAggFunction = this.gridOptionsWrapper.getGroupAggFunction();
                if (typeof groupAggFunction === 'function') {
                    this.recursivelyCreateAggData(this.rowsAfterFilter, groupAggFunction, 0);
                    return;
                }
                var valueColumns = this.columnController.getValueColumns();
                if (valueColumns && valueColumns.length > 0) {
                    var defaultAggFunction = this.defaultGroupAggFunctionFactory(valueColumns);
                    this.recursivelyCreateAggData(this.rowsAfterFilter, defaultAggFunction, 0);
                }
                else {
                    // if no agg data, need to clear out any previous items, when can be left behind
                    // if use is creating / removing columns using the tool panel.
                    // one exception - don't do this if already grouped, as this breaks the File Explorer example!!
                    // to fix another day - how to we reset when the user provided the data??
                    if (!this.gridOptionsWrapper.isRowsAlreadyGrouped()) {
                        this.recursivelyClearAggData(this.rowsAfterFilter);
                    }
                }
            };
            InMemoryRowController.prototype.expandOrCollapseAll = function (expand, rowNodes) {
                var _this = this;
                // if first call in recursion, we set list to parent list
                if (rowNodes === null) {
                    rowNodes = this.rowsAfterGroup;
                }
                if (!rowNodes) {
                    return;
                }
                rowNodes.forEach(function (node) {
                    if (node.group) {
                        node.expanded = expand;
                        _this.expandOrCollapseAll(expand, node.children);
                    }
                });
            };
            InMemoryRowController.prototype.recursivelyClearAggData = function (nodes) {
                for (var i = 0, l = nodes.length; i < l; i++) {
                    var node = nodes[i];
                    if (node.group) {
                        // agg function needs to start at the bottom, so traverse first
                        this.recursivelyClearAggData(node.childrenAfterFilter);
                        node.data = null;
                    }
                }
            };
            InMemoryRowController.prototype.recursivelyCreateAggData = function (nodes, groupAggFunction, level) {
                for (var i = 0, l = nodes.length; i < l; i++) {
                    var node = nodes[i];
                    if (node.group) {
                        // agg function needs to start at the bottom, so traverse first
                        this.recursivelyCreateAggData(node.childrenAfterFilter, groupAggFunction, level++);
                        // after traversal, we can now do the agg at this level
                        var data = groupAggFunction(node.childrenAfterFilter, level);
                        node.data = data;
                        // if we are grouping, then it's possible there is a sibling footer
                        // to the group, so update the data here also if there is one
                        if (node.sibling) {
                            node.sibling.data = data;
                        }
                    }
                }
            };
            InMemoryRowController.prototype.doSort = function () {
                var sorting;
                // if the sorting is already done by the server, then we should not do it here
                if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
                    sorting = false;
                }
                else {
                    //see if there is a col we are sorting by
                    var sortingOptions = [];
                    this.columnController.getAllColumns().forEach(function (column) {
                        if (column.getSort()) {
                            var ascending = column.getSort() === grid.Column.SORT_ASC;
                            sortingOptions.push({
                                inverter: ascending ? 1 : -1,
                                sortedAt: column.getSortedAt(),
                                column: column
                            });
                        }
                    });
                    if (sortingOptions.length > 0) {
                        sorting = true;
                    }
                }
                var rowNodesReadyForSorting = this.rowsAfterFilter ? this.rowsAfterFilter.slice(0) : null;
                if (sorting) {
                    // The columns are to be sorted in the order that the user selected them:
                    sortingOptions.sort(function (optionA, optionB) {
                        return optionA.sortedAt - optionB.sortedAt;
                    });
                    this.sortList(rowNodesReadyForSorting, sortingOptions);
                }
                else {
                    // if no sorting, set all group children after sort to the original list.
                    // note: it is important to do this, even if doing server side sorting,
                    // to allow the rows to pass to the next stage (ie set the node value
                    // childrenAfterSort)
                    this.recursivelyResetSort(rowNodesReadyForSorting);
                }
                this.rowsAfterSort = rowNodesReadyForSorting;
            };
            InMemoryRowController.prototype.recursivelyResetSort = function (rowNodes) {
                if (!rowNodes) {
                    return;
                }
                for (var i = 0, l = rowNodes.length; i < l; i++) {
                    var item = rowNodes[i];
                    if (item.group && item.children) {
                        item.childrenAfterSort = item.childrenAfterFilter;
                        this.recursivelyResetSort(item.children);
                    }
                }
                this.updateChildIndexes(rowNodes);
            };
            InMemoryRowController.prototype.sortList = function (nodes, sortOptions) {
                // sort any groups recursively
                for (var i = 0, l = nodes.length; i < l; i++) {
                    var node = nodes[i];
                    if (node.group && node.children) {
                        node.childrenAfterSort = node.childrenAfterFilter.slice(0);
                        this.sortList(node.childrenAfterSort, sortOptions);
                    }
                }
                var that = this;
                function compare(nodeA, nodeB, column, isInverted) {
                    var valueA = that.valueService.getValue(column.getColDef(), nodeA.data, nodeA);
                    var valueB = that.valueService.getValue(column.getColDef(), nodeB.data, nodeB);
                    if (column.getColDef().comparator) {
                        //if comparator provided, use it
                        return column.getColDef().comparator(valueA, valueB, nodeA, nodeB, isInverted);
                    }
                    else {
                        //otherwise do our own comparison
                        return _.defaultComparator(valueA, valueB);
                    }
                }
                nodes.sort(function (nodeA, nodeB) {
                    // Iterate columns, return the first that doesn't match
                    for (var i = 0, len = sortOptions.length; i < len; i++) {
                        var sortOption = sortOptions[i];
                        var compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);
                        if (compared !== 0) {
                            return compared * sortOption.inverter;
                        }
                    }
                    // All matched, these are identical as far as the sort is concerned:
                    return 0;
                });
                this.updateChildIndexes(nodes);
            };
            InMemoryRowController.prototype.updateChildIndexes = function (nodes) {
                for (var j = 0; j < nodes.length; j++) {
                    var node = nodes[j];
                    node.firstChild = j === 0;
                    node.lastChild = j === nodes.length - 1;
                    node.childIndex = j;
                }
            };
            // called by grid when row group cols change
            InMemoryRowController.prototype.onRowGroupChanged = function () {
                this.doRowGrouping();
                this.updateModel(constants.STEP_EVERYTHING);
            };
            InMemoryRowController.prototype.doRowGrouping = function () {
                var rowsAfterGroup;
                var groupedCols = this.columnController.getRowGroupColumns();
                var rowsAlreadyGrouped = this.gridOptionsWrapper.isRowsAlreadyGrouped();
                var doingGrouping = !rowsAlreadyGrouped && groupedCols.length > 0;
                if (doingGrouping) {
                    var expandByDefault = this.gridOptionsWrapper.isGroupSuppressRow() || this.gridOptionsWrapper.getGroupDefaultExpanded();
                    rowsAfterGroup = this.groupCreator.group(this.allRows, groupedCols, expandByDefault);
                }
                else {
                    rowsAfterGroup = this.allRows;
                }
                this.rowsAfterGroup = rowsAfterGroup;
            };
            InMemoryRowController.prototype.doFilter = function () {
                var doingFilter;
                if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
                    doingFilter = false;
                }
                else {
                    doingFilter = this.filterManager.isAnyFilterPresent();
                }
                var rowsAfterFilter;
                if (doingFilter) {
                    rowsAfterFilter = this.filterItems(this.rowsAfterGroup);
                }
                else {
                    // do it here
                    rowsAfterFilter = this.rowsAfterGroup;
                    this.recursivelyResetFilter(this.rowsAfterGroup);
                }
                this.rowsAfterFilter = rowsAfterFilter;
            };
            InMemoryRowController.prototype.filterItems = function (rowNodes) {
                var result = [];
                for (var i = 0, l = rowNodes.length; i < l; i++) {
                    var node = rowNodes[i];
                    if (node.group) {
                        // deal with group
                        node.childrenAfterFilter = this.filterItems(node.children);
                        if (node.childrenAfterFilter.length > 0) {
                            node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
                            result.push(node);
                        }
                    }
                    else {
                        if (this.filterManager.doesRowPassFilter(node)) {
                            result.push(node);
                        }
                    }
                }
                return result;
            };
            InMemoryRowController.prototype.recursivelyResetFilter = function (nodes) {
                if (!nodes) {
                    return;
                }
                for (var i = 0, l = nodes.length; i < l; i++) {
                    var node = nodes[i];
                    if (node.group && node.children) {
                        node.childrenAfterFilter = node.children;
                        this.recursivelyResetFilter(node.children);
                        node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
                    }
                }
            };
            // rows: the rows to put into the model
            // firstId: the first id to use, used for paging, where we are not on the first page
            InMemoryRowController.prototype.setAllRows = function (rows, firstId) {
                var nodes;
                if (this.gridOptionsWrapper.isRowsAlreadyGrouped()) {
                    nodes = rows;
                    this.recursivelyCheckUserProvidedNodes(nodes, null, 0);
                }
                else {
                    // place each row into a wrapper
                    var nodes = [];
                    if (rows) {
                        for (var i = 0; i < rows.length; i++) {
                            var node = {};
                            node.data = rows[i];
                            nodes.push(node);
                        }
                    }
                }
                // if firstId provided, use it, otherwise start at 0
                var firstIdToUse = firstId ? firstId : 0;
                this.recursivelyAddIdToNodes(nodes, firstIdToUse);
                this.allRows = nodes;
                // group here, so filters have the agg data ready
                if (this.columnController.isSetupComplete()) {
                    this.doRowGrouping();
                }
            };
            // add in index - this is used by the selectionController - so quick
            // to look up selected rows
            InMemoryRowController.prototype.recursivelyAddIdToNodes = function (nodes, index) {
                if (!nodes) {
                    return;
                }
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    node.id = index++;
                    if (node.group && node.children) {
                        index = this.recursivelyAddIdToNodes(node.children, index);
                    }
                }
                return index;
            };
            // add in index - this is used by the selectionController - so quick
            // to look up selected rows
            InMemoryRowController.prototype.recursivelyCheckUserProvidedNodes = function (nodes, parent, level) {
                if (!nodes) {
                    return;
                }
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    if (parent && !this.gridOptionsWrapper.isSuppressParentsInRowNodes()) {
                        node.parent = parent;
                    }
                    node.level = level;
                    if (node.group && node.children) {
                        this.recursivelyCheckUserProvidedNodes(node.children, node, level + 1);
                    }
                }
            };
            InMemoryRowController.prototype.getTotalChildCount = function (rowNodes) {
                var count = 0;
                for (var i = 0, l = rowNodes.length; i < l; i++) {
                    var item = rowNodes[i];
                    if (item.group) {
                        count += item.allChildrenCount;
                    }
                    else {
                        count++;
                    }
                }
                return count;
            };
            InMemoryRowController.prototype.doRowsToDisplay = function () {
                // even if not doing grouping, we do the mapping, as the client might
                // of passed in data that already has a grouping in it somewhere
                this.rowsToDisplay = [];
                this.nextRowTop = 0;
                this.recursivelyAddToRowsToDisplay(this.rowsAfterSort);
            };
            InMemoryRowController.prototype.recursivelyAddToRowsToDisplay = function (rowNodes) {
                if (!rowNodes) {
                    return;
                }
                var groupSuppressRow = this.gridOptionsWrapper.isGroupSuppressRow();
                for (var i = 0; i < rowNodes.length; i++) {
                    var rowNode = rowNodes[i];
                    var skipGroupNode = groupSuppressRow && rowNode.group;
                    if (!skipGroupNode) {
                        this.addRowNodeToRowsToDisplay(rowNode);
                    }
                    if (rowNode.group && rowNode.expanded) {
                        this.recursivelyAddToRowsToDisplay(rowNode.childrenAfterSort);
                        // put a footer in if user is looking for it
                        if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
                            var footerNode = this.createFooterNode(rowNode);
                            this.addRowNodeToRowsToDisplay(footerNode);
                        }
                    }
                }
            };
            // duplicated method, it's also in floatingRowModel
            InMemoryRowController.prototype.addRowNodeToRowsToDisplay = function (rowNode) {
                this.rowsToDisplay.push(rowNode);
                rowNode.rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode);
                rowNode.rowTop = this.nextRowTop;
                this.nextRowTop += rowNode.rowHeight;
            };
            InMemoryRowController.prototype.createFooterNode = function (groupNode) {
                var footerNode = {};
                Object.keys(groupNode).forEach(function (key) {
                    footerNode[key] = groupNode[key];
                });
                footerNode.footer = true;
                // get both header and footer to reference each other as siblings. this is never undone,
                // only overwritten. so if a group is expanded, then contracted, it will have a ghost
                // sibling - but that's fine, as we can ignore this if the header is contracted.
                footerNode.sibling = groupNode;
                groupNode.sibling = footerNode;
                return footerNode;
            };
            return InMemoryRowController;
        })();
        grid.InMemoryRowController = InMemoryRowController;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/*
 * This row controller is used for infinite scrolling only. For normal 'in memory' table,
 * or standard pagination, the inMemoryRowController is used.
 */
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var logging = false;
        var VirtualPageRowController = (function () {
            function VirtualPageRowController() {
            }
            VirtualPageRowController.prototype.init = function (rowRenderer, gridOptionsWrapper, angularGrid) {
                this.rowRenderer = rowRenderer;
                this.datasourceVersion = 0;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.angularGrid = angularGrid;
            };
            VirtualPageRowController.prototype.setDatasource = function (datasource) {
                this.datasource = datasource;
                if (!datasource) {
                    // only continue if we have a valid datasource to working with
                    return;
                }
                this.reset();
            };
            VirtualPageRowController.prototype.reset = function () {
                // see if datasource knows how many rows there are
                if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
                    this.virtualRowCount = this.datasource.rowCount;
                    this.foundMaxRow = true;
                }
                else {
                    this.virtualRowCount = 0;
                    this.foundMaxRow = false;
                }
                // in case any daemon requests coming from datasource, we know it ignore them
                this.datasourceVersion++;
                // map of page numbers to rows in that page
                this.pageCache = {};
                this.pageCacheSize = 0;
                // if a number is in this array, it means we are pending a load from it
                this.pageLoadsInProgress = [];
                this.pageLoadsQueued = [];
                this.pageAccessTimes = {}; // keeps a record of when each page was last viewed, used for LRU cache
                this.accessTime = 0; // rather than using the clock, we use this counter
                // the number of concurrent loads we are allowed to the server
                if (typeof this.datasource.maxConcurrentRequests === 'number' && this.datasource.maxConcurrentRequests > 0) {
                    this.maxConcurrentDatasourceRequests = this.datasource.maxConcurrentRequests;
                }
                else {
                    this.maxConcurrentDatasourceRequests = 2;
                }
                // the number of pages to keep in browser cache
                if (typeof this.datasource.maxPagesInCache === 'number' && this.datasource.maxPagesInCache > 0) {
                    this.maxPagesInCache = this.datasource.maxPagesInCache;
                }
                else {
                    // null is default, means don't  have any max size on the cache
                    this.maxPagesInCache = null;
                }
                this.pageSize = this.datasource.pageSize; // take a copy of page size, we don't want it changing
                this.overflowSize = this.datasource.overflowSize; // take a copy of page size, we don't want it changing
                this.doLoadOrQueue(0);
            };
            VirtualPageRowController.prototype.createNodesFromRows = function (pageNumber, rows) {
                var nodes = [];
                if (rows) {
                    for (var i = 0, j = rows.length; i < j; i++) {
                        var virtualRowIndex = (pageNumber * this.pageSize) + i;
                        var node = this.createNode(rows[i], virtualRowIndex);
                        nodes.push(node);
                    }
                }
                return nodes;
            };
            VirtualPageRowController.prototype.createNode = function (data, virtualRowIndex) {
                var rowHeight = this.getRowHeightAsNumber();
                var top = rowHeight * virtualRowIndex;
                console.log(virtualRowIndex + ' ' + rowHeight + ' - ' + top);
                var rowNode = {
                    data: data,
                    id: virtualRowIndex,
                    rowTop: top,
                    rowHeight: rowHeight
                };
                return rowNode;
            };
            VirtualPageRowController.prototype.removeFromLoading = function (pageNumber) {
                var index = this.pageLoadsInProgress.indexOf(pageNumber);
                this.pageLoadsInProgress.splice(index, 1);
            };
            VirtualPageRowController.prototype.pageLoadFailed = function (pageNumber) {
                this.removeFromLoading(pageNumber);
                this.checkQueueForNextLoad();
            };
            VirtualPageRowController.prototype.pageLoaded = function (pageNumber, rows, lastRow) {
                this.putPageIntoCacheAndPurge(pageNumber, rows);
                this.checkMaxRowAndInformRowRenderer(pageNumber, lastRow);
                this.removeFromLoading(pageNumber);
                this.checkQueueForNextLoad();
            };
            VirtualPageRowController.prototype.putPageIntoCacheAndPurge = function (pageNumber, rows) {
                this.pageCache[pageNumber] = this.createNodesFromRows(pageNumber, rows);
                this.pageCacheSize++;
                if (logging) {
                    console.log('adding page ' + pageNumber);
                }
                var needToPurge = this.maxPagesInCache && this.maxPagesInCache < this.pageCacheSize;
                if (needToPurge) {
                    // find the LRU page
                    var youngestPageIndex = this.findLeastRecentlyAccessedPage(Object.keys(this.pageCache));
                    if (logging) {
                        console.log('purging page ' + youngestPageIndex + ' from cache ' + Object.keys(this.pageCache));
                    }
                    delete this.pageCache[youngestPageIndex];
                    this.pageCacheSize--;
                }
            };
            VirtualPageRowController.prototype.checkMaxRowAndInformRowRenderer = function (pageNumber, lastRow) {
                if (!this.foundMaxRow) {
                    // if we know the last row, use if
                    if (typeof lastRow === 'number' && lastRow >= 0) {
                        this.virtualRowCount = lastRow;
                        this.foundMaxRow = true;
                    }
                    else {
                        // otherwise, see if we need to add some virtual rows
                        var thisPagePlusBuffer = ((pageNumber + 1) * this.pageSize) + this.overflowSize;
                        if (this.virtualRowCount < thisPagePlusBuffer) {
                            this.virtualRowCount = thisPagePlusBuffer;
                        }
                    }
                    // if rowCount changes, refreshView, otherwise just refreshAllVirtualRows
                    this.rowRenderer.refreshView();
                }
                else {
                    this.rowRenderer.refreshAllVirtualRows();
                }
            };
            VirtualPageRowController.prototype.isPageAlreadyLoading = function (pageNumber) {
                var result = this.pageLoadsInProgress.indexOf(pageNumber) >= 0 || this.pageLoadsQueued.indexOf(pageNumber) >= 0;
                return result;
            };
            VirtualPageRowController.prototype.doLoadOrQueue = function (pageNumber) {
                // if we already tried to load this page, then ignore the request,
                // otherwise server would be hit 50 times just to display one page, the
                // first row to find the page missing is enough.
                if (this.isPageAlreadyLoading(pageNumber)) {
                    return;
                }
                // try the page load - if not already doing a load, then we can go ahead
                if (this.pageLoadsInProgress.length < this.maxConcurrentDatasourceRequests) {
                    // go ahead, load the page
                    this.loadPage(pageNumber);
                }
                else {
                    // otherwise, queue the request
                    this.addToQueueAndPurgeQueue(pageNumber);
                }
            };
            VirtualPageRowController.prototype.addToQueueAndPurgeQueue = function (pageNumber) {
                if (logging) {
                    console.log('queueing ' + pageNumber + ' - ' + this.pageLoadsQueued);
                }
                this.pageLoadsQueued.push(pageNumber);
                // see if there are more pages queued that are actually in our cache, if so there is
                // no point in loading them all as some will be purged as soon as loaded
                var needToPurge = this.maxPagesInCache && this.maxPagesInCache < this.pageLoadsQueued.length;
                if (needToPurge) {
                    // find the LRU page
                    var youngestPageIndex = this.findLeastRecentlyAccessedPage(this.pageLoadsQueued);
                    if (logging) {
                        console.log('de-queueing ' + pageNumber + ' - ' + this.pageLoadsQueued);
                    }
                    var indexToRemove = this.pageLoadsQueued.indexOf(youngestPageIndex);
                    this.pageLoadsQueued.splice(indexToRemove, 1);
                }
            };
            VirtualPageRowController.prototype.findLeastRecentlyAccessedPage = function (pageIndexes) {
                var youngestPageIndex = -1;
                var youngestPageAccessTime = Number.MAX_VALUE;
                var that = this;
                pageIndexes.forEach(function (pageIndex) {
                    var accessTimeThisPage = that.pageAccessTimes[pageIndex];
                    if (accessTimeThisPage < youngestPageAccessTime) {
                        youngestPageAccessTime = accessTimeThisPage;
                        youngestPageIndex = pageIndex;
                    }
                });
                return youngestPageIndex;
            };
            VirtualPageRowController.prototype.checkQueueForNextLoad = function () {
                if (this.pageLoadsQueued.length > 0) {
                    // take from the front of the queue
                    var pageToLoad = this.pageLoadsQueued[0];
                    this.pageLoadsQueued.splice(0, 1);
                    if (logging) {
                        console.log('dequeueing ' + pageToLoad + ' - ' + this.pageLoadsQueued);
                    }
                    this.loadPage(pageToLoad);
                }
            };
            VirtualPageRowController.prototype.loadPage = function (pageNumber) {
                this.pageLoadsInProgress.push(pageNumber);
                var startRow = pageNumber * this.pageSize;
                var endRow = (pageNumber + 1) * this.pageSize;
                var that = this;
                var datasourceVersionCopy = this.datasourceVersion;
                var sortModel;
                if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
                    sortModel = this.angularGrid.getSortModel();
                }
                var filterModel;
                if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
                    filterModel = this.angularGrid.getFilterModel();
                }
                var params = {
                    startRow: startRow,
                    endRow: endRow,
                    successCallback: successCallback,
                    failCallback: failCallback,
                    sortModel: sortModel,
                    filterModel: filterModel
                };
                // check if old version of datasource used
                var getRowsParams = utils.getFunctionParameters(this.datasource.getRows);
                if (getRowsParams.length > 1) {
                    console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
                    console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
                }
                this.datasource.getRows(params);
                function successCallback(rows, lastRowIndex) {
                    if (that.requestIsDaemon(datasourceVersionCopy)) {
                        return;
                    }
                    that.pageLoaded(pageNumber, rows, lastRowIndex);
                }
                function failCallback() {
                    if (that.requestIsDaemon(datasourceVersionCopy)) {
                        return;
                    }
                    that.pageLoadFailed(pageNumber);
                }
            };
            // check that the datasource has not changed since the lats time we did a request
            VirtualPageRowController.prototype.requestIsDaemon = function (datasourceVersionCopy) {
                return this.datasourceVersion !== datasourceVersionCopy;
            };
            VirtualPageRowController.prototype.getVirtualRow = function (rowIndex) {
                if (rowIndex > this.virtualRowCount) {
                    return null;
                }
                var pageNumber = Math.floor(rowIndex / this.pageSize);
                var page = this.pageCache[pageNumber];
                // for LRU cache, track when this page was last hit
                this.pageAccessTimes[pageNumber] = this.accessTime++;
                if (!page) {
                    this.doLoadOrQueue(pageNumber);
                    // return back an empty row, so table can at least render empty cells
                    var dummyNode = this.createNode({}, rowIndex);
                    return dummyNode;
                }
                else {
                    var indexInThisPage = rowIndex % this.pageSize;
                    return page[indexInThisPage];
                }
            };
            VirtualPageRowController.prototype.forEachNode = function (callback) {
                var pageKeys = Object.keys(this.pageCache);
                for (var i = 0; i < pageKeys.length; i++) {
                    var pageKey = pageKeys[i];
                    var page = this.pageCache[pageKey];
                    for (var j = 0; j < page.length; j++) {
                        var node = page[j];
                        callback(node);
                    }
                }
            };
            VirtualPageRowController.prototype.getRowHeightAsNumber = function () {
                var rowHeight = this.gridOptionsWrapper.getRowHeightForVirtualPagiation();
                if (typeof rowHeight === 'number') {
                    return rowHeight;
                }
                else {
                    console.warn('ag-Grid row height must be a number when doing virtual paging');
                    return 25;
                }
            };
            VirtualPageRowController.prototype.getVirtualRowCombinedHeight = function () {
                return this.virtualRowCount * this.getRowHeightAsNumber();
            };
            VirtualPageRowController.prototype.getRowAtPixel = function (pixel) {
                var rowHeight = this.getRowHeightAsNumber();
                if (rowHeight !== 0) {
                    return Math.floor(pixel / rowHeight);
                }
                else {
                    return 0;
                }
            };
            VirtualPageRowController.prototype.getModel = function () {
                var that = this;
                return {
                    getRowAtPixel: function (pixel) {
                        return that.getRowAtPixel(pixel);
                    },
                    getVirtualRowCombinedHeight: function () {
                        return that.getVirtualRowCombinedHeight();
                    },
                    getVirtualRow: function (index) {
                        return that.getVirtualRow(index);
                    },
                    getVirtualRowCount: function () {
                        return that.virtualRowCount;
                    },
                    forEachInMemory: function (callback) {
                        that.forEachNode(callback);
                    },
                    forEachNode: function (callback) {
                        that.forEachNode(callback);
                    },
                    forEachNodeAfterFilter: function (callback) {
                        console.warn('forEachNodeAfterFilter - does not work with virtual pagination');
                    },
                    forEachNodeAfterFilterAndSort: function (callback) {
                        console.warn('forEachNodeAfterFilterAndSort - does not work with virtual pagination');
                    }
                };
            };
            return VirtualPageRowController;
        })();
        grid.VirtualPageRowController = VirtualPageRowController;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var template = '<div class="ag-paging-panel">' +
            '<span id="pageRowSummaryPanel" class="ag-paging-row-summary-panel">' +
            '<span id="firstRowOnPage"></span>' +
            ' [到] ' +
            '<span id="lastRowOnPage"></span>' +
            ' 总共 ' +
            '<span id="recordCount"></span>条' +
            '</span>' +
            '<span class="ag-paging-page-summary-panel">' +
            '<button type="button" class="btn btn-info" id="btFirst">首页</button>&nbsp;&nbsp;' +
            '<button type="button" class="btn btn-info" id="btPrevious">上一页</button>' +
            '第 ' +
            '<span id="current"></span>页' +
            ' 总页数 ' +
            '<span id="total"></span>' +
            '<button type="button" class="btn btn-info" id="btNext">下一页</button>&nbsp;&nbsp;' +
            '<button type="button" class="btn btn-info" id="btLast">尾页</button>' +
            '</span>' +
            '</div>';
        var PaginationController = (function () {
            function PaginationController() {
            }
            PaginationController.prototype.init = function (angularGrid, gridOptionsWrapper) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.angularGrid = angularGrid;
                this.setupComponents();
                this.callVersion = 0;
            };
            PaginationController.prototype.setDatasource = function (datasource) {
                this.datasource = datasource;
                if (!datasource) {
                    // only continue if we have a valid datasource to work with
                    return;
                }
                this.reset();
            };
            PaginationController.prototype.reset = function () {
                // copy pageSize, to guard against it changing the the datasource between calls
                if (this.datasource.pageSize && typeof this.datasource.pageSize !== 'number') {
                    console.warn('datasource.pageSize should be a number');
                }
                this.pageSize = this.datasource.pageSize;
                // see if we know the total number of pages, or if it's 'to be decided'
                if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
                    this.rowCount = this.datasource.rowCount;
                    this.foundMaxRow = true;
                    this.calculateTotalPages();
                }
                else {
                    this.rowCount = 0;
                    this.foundMaxRow = false;
                    this.totalPages = null;
                }
                this.currentPage = 0;
                // hide the summary panel until something is loaded
                this.ePageRowSummaryPanel.style.visibility = 'hidden';
                this.setTotalLabels();
                this.loadPage();
            };
            // the native method number.toLocaleString(undefined, {minimumFractionDigits: 0}) puts in decimal places in IE
            PaginationController.prototype.myToLocaleString = function (input) {
                if (typeof input !== 'number') {
                    return '';
                }
                else {
                    // took this from: http://blog.tompawlak.org/number-currency-formatting-javascript
                    return input.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                }
            };
            PaginationController.prototype.setTotalLabels = function () {
                if (this.foundMaxRow) {
                    this.lbTotal.innerHTML = this.myToLocaleString(this.totalPages);
                    this.lbRecordCount.innerHTML = this.myToLocaleString(this.rowCount);
                }
                else {
                    var moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
                    this.lbTotal.innerHTML = moreText;
                    this.lbRecordCount.innerHTML = moreText;
                }
            };
            PaginationController.prototype.calculateTotalPages = function () {
                this.totalPages = Math.floor((this.rowCount - 1) / this.pageSize) + 1;
            };
            PaginationController.prototype.pageLoaded = function (rows, lastRowIndex) {
                var firstId = this.currentPage * this.pageSize;
                this.angularGrid.setRowData(rows, firstId);
                // see if we hit the last row
                if (!this.foundMaxRow && typeof lastRowIndex === 'number' && lastRowIndex >= 0) {
                    this.foundMaxRow = true;
                    this.rowCount = lastRowIndex;
                    this.calculateTotalPages();
                    this.setTotalLabels();
                    // if overshot pages, go back
                    if (this.currentPage > this.totalPages) {
                        this.currentPage = this.totalPages - 1;
                        this.loadPage();
                    }
                }
                this.enableOrDisableButtons();
                this.updateRowLabels();
            };
            PaginationController.prototype.updateRowLabels = function () {
                var startRow;
                var endRow;
                if (this.isZeroPagesToDisplay()) {
                    startRow = 0;
                    endRow = 0;
                }
                else {
                    startRow = (this.pageSize * this.currentPage) + 1;
                    endRow = startRow + this.pageSize - 1;
                    if (this.foundMaxRow && endRow > this.rowCount) {
                        endRow = this.rowCount;
                    }
                }
                this.lbFirstRowOnPage.innerHTML = this.myToLocaleString(startRow);
                this.lbLastRowOnPage.innerHTML = this.myToLocaleString(endRow);
                // show the summary panel, when first shown, this is blank
                this.ePageRowSummaryPanel.style.visibility = "";
            };
            PaginationController.prototype.loadPage = function () {
                this.enableOrDisableButtons();
                var startRow = this.currentPage * this.datasource.pageSize;
                var endRow = (this.currentPage + 1) * this.datasource.pageSize;
                this.lbCurrent.innerHTML = this.myToLocaleString(this.currentPage + 1);
                this.callVersion++;
                var callVersionCopy = this.callVersion;
                var that = this;
                this.angularGrid.showLoadingOverlay();
                var sortModel;
                if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
                    sortModel = this.angularGrid.getSortModel();
                }
                var filterModel;
                if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
                    filterModel = this.angularGrid.getFilterModel();
                }
                var params = {
                    startRow: startRow,
                    endRow: endRow,
                    successCallback: successCallback,
                    failCallback: failCallback,
                    sortModel: sortModel,
                    filterModel: filterModel
                };
                // check if old version of datasource used
                var getRowsParams = utils.getFunctionParameters(this.datasource.getRows);
                if (getRowsParams.length > 1) {
                    console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
                    console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
                }
                this.datasource.getRows(params);
                function successCallback(rows, lastRowIndex) {
                    if (that.isCallDaemon(callVersionCopy)) {
                        return;
                    }
                    that.pageLoaded(rows, lastRowIndex);
                }
                function failCallback() {
                    if (that.isCallDaemon(callVersionCopy)) {
                        return;
                    }
                    // set in an empty set of rows, this will at
                    // least get rid of the loading panel, and
                    // stop blocking things
                    that.angularGrid.setRowData([]);
                }
            };
            PaginationController.prototype.isCallDaemon = function (versionCopy) {
                return versionCopy !== this.callVersion;
            };
            PaginationController.prototype.onBtNext = function () {
                this.currentPage++;
                this.loadPage();
            };
            PaginationController.prototype.onBtPrevious = function () {
                this.currentPage--;
                this.loadPage();
            };
            PaginationController.prototype.onBtFirst = function () {
                this.currentPage = 0;
                this.loadPage();
            };
            PaginationController.prototype.onBtLast = function () {
                this.currentPage = this.totalPages - 1;
                this.loadPage();
            };
            PaginationController.prototype.isZeroPagesToDisplay = function () {
                return this.foundMaxRow && this.totalPages === 0;
            };
            PaginationController.prototype.enableOrDisableButtons = function () {
                var disablePreviousAndFirst = this.currentPage === 0;
                this.btPrevious.disabled = disablePreviousAndFirst;
                this.btFirst.disabled = disablePreviousAndFirst;
                var zeroPagesToDisplay = this.isZeroPagesToDisplay();
                var onLastPage = this.foundMaxRow && this.currentPage === (this.totalPages - 1);
                var disableNext = onLastPage || zeroPagesToDisplay;
                this.btNext.disabled = disableNext;
                var disableLast = !this.foundMaxRow || zeroPagesToDisplay || this.currentPage === (this.totalPages - 1);
                this.btLast.disabled = disableLast;
            };
            PaginationController.prototype.createTemplate = function () {
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                return template
                    .replace('[PAGE]', localeTextFunc('page', 'Page'))
                    .replace('[TO]', localeTextFunc('to', 'to'))
                    .replace('[OF]', localeTextFunc('of', 'of'))
                    .replace('[OF]', localeTextFunc('of', 'of'))
                    .replace('[FIRST]', localeTextFunc('first', 'First'))
                    .replace('[PREVIOUS]', localeTextFunc('previous', 'Previous'))
                    .replace('[NEXT]', localeTextFunc('next', 'Next'))
                    .replace('[LAST]', localeTextFunc('last', 'Last'));
            };
            PaginationController.prototype.getGui = function () {
                return this.eGui;
            };
            PaginationController.prototype.setupComponents = function () {
                this.eGui = utils.loadTemplate(this.createTemplate());
                this.btNext = this.eGui.querySelector('#btNext');
                this.btPrevious = this.eGui.querySelector('#btPrevious');
                this.btFirst = this.eGui.querySelector('#btFirst');
                this.btLast = this.eGui.querySelector('#btLast');
                this.lbCurrent = this.eGui.querySelector('#current');
                this.lbTotal = this.eGui.querySelector('#total');
                this.lbRecordCount = this.eGui.querySelector('#recordCount');
                this.lbFirstRowOnPage = this.eGui.querySelector('#firstRowOnPage');
                this.lbLastRowOnPage = this.eGui.querySelector('#lastRowOnPage');
                this.ePageRowSummaryPanel = this.eGui.querySelector('#pageRowSummaryPanel');
                var that = this;
                this.btNext.addEventListener('click', function () {
                    that.onBtNext();
                });
                this.btPrevious.addEventListener('click', function () {
                    that.onBtPrevious();
                });
                this.btFirst.addEventListener('click', function () {
                    that.onBtFirst();
                });
                this.btLast.addEventListener('click', function () {
                    that.onBtLast();
                });
            };
            return PaginationController;
        })();
        grid.PaginationController = PaginationController;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var BorderLayout = (function () {
            function BorderLayout(params) {
                this.sizeChangeListeners = [];
                this.isLayoutPanel = true;
                this.fullHeight = !params.north && !params.south;
                var template;
                if (!params.dontFill) {
                    if (this.fullHeight) {
                        template =
                            '<div style="height: 100%; overflow: auto; position: relative;">' +
                                '<div id="west" style="height: 100%; float: left;"></div>' +
                                '<div id="east" style="height: 100%; float: right;"></div>' +
                                '<div id="center" style="height: 100%;"></div>' +
                                '<div id="overlay" style="pointer-events: none; position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
                                '</div>';
                    }
                    else {
                        template =
                            '<div style="height: 100%; position: relative;">' +
                                '<div id="north"></div>' +
                                '<div id="centerRow" style="height: 100%; overflow: hidden;">' +
                                '<div id="west" style="height: 100%; float: left;"></div>' +
                                '<div id="east" style="height: 100%; float: right;"></div>' +
                                '<div id="center" style="height: 100%;"></div>' +
                                '</div>' +
                                '<div id="south"></div>' +
                                '<div id="overlay" style="pointer-events: none; position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
                                '</div>';
                    }
                    this.layoutActive = true;
                }
                else {
                    template =
                        '<div style="position: relative;">' +
                            '<div id="north"></div>' +
                            '<div id="centerRow">' +
                            '<div id="west"></div>' +
                            '<div id="east"></div>' +
                            '<div id="center"></div>' +
                            '</div>' +
                            '<div id="south"></div>' +
                            '<div id="overlay" style="pointer-events: none; position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
                            '</div>';
                    this.layoutActive = false;
                }
                this.eGui = _.loadTemplate(template);
                this.id = 'borderLayout';
                if (params.name) {
                    this.id += '_' + params.name;
                }
                this.eGui.setAttribute('id', this.id);
                this.childPanels = [];
                if (params) {
                    this.setupPanels(params);
                }
                this.overlays = params.overlays;
                this.setupOverlays();
            }
            BorderLayout.prototype.addSizeChangeListener = function (listener) {
                this.sizeChangeListeners.push(listener);
            };
            BorderLayout.prototype.fireSizeChanged = function () {
                this.sizeChangeListeners.forEach(function (listener) {
                    listener();
                });
            };
            BorderLayout.prototype.setupPanels = function (params) {
                this.eNorthWrapper = this.eGui.querySelector('#north');
                this.eSouthWrapper = this.eGui.querySelector('#south');
                this.eEastWrapper = this.eGui.querySelector('#east');
                this.eWestWrapper = this.eGui.querySelector('#west');
                this.eCenterWrapper = this.eGui.querySelector('#center');
                this.eOverlayWrapper = this.eGui.querySelector('#overlay');
                this.eCenterRow = this.eGui.querySelector('#centerRow');
                this.eNorthChildLayout = this.setupPanel(params.north, this.eNorthWrapper);
                this.eSouthChildLayout = this.setupPanel(params.south, this.eSouthWrapper);
                this.eEastChildLayout = this.setupPanel(params.east, this.eEastWrapper);
                this.eWestChildLayout = this.setupPanel(params.west, this.eWestWrapper);
                this.eCenterChildLayout = this.setupPanel(params.center, this.eCenterWrapper);
            };
            BorderLayout.prototype.setupPanel = function (content, ePanel) {
                if (!ePanel) {
                    return;
                }
                if (content) {
                    if (content.isLayoutPanel) {
                        this.childPanels.push(content);
                        ePanel.appendChild(content.getGui());
                        return content;
                    }
                    else {
                        ePanel.appendChild(content);
                        return null;
                    }
                }
                else {
                    ePanel.parentNode.removeChild(ePanel);
                    return null;
                }
            };
            BorderLayout.prototype.getGui = function () {
                return this.eGui;
            };
            // returns true if any item changed size, otherwise returns false
            BorderLayout.prototype.doLayout = function () {
                if (!_.isVisible(this.eGui)) {
                    return false;
                }
                var atLeastOneChanged = false;
                var childLayouts = [this.eNorthChildLayout, this.eSouthChildLayout, this.eEastChildLayout, this.eWestChildLayout];
                var that = this;
                _.forEach(childLayouts, function (childLayout) {
                    var childChangedSize = that.layoutChild(childLayout);
                    if (childChangedSize) {
                        atLeastOneChanged = true;
                    }
                });
                if (this.layoutActive) {
                    var ourHeightChanged = this.layoutHeight();
                    var ourWidthChanged = this.layoutWidth();
                    if (ourHeightChanged || ourWidthChanged) {
                        atLeastOneChanged = true;
                    }
                }
                var centerChanged = this.layoutChild(this.eCenterChildLayout);
                if (centerChanged) {
                    atLeastOneChanged = true;
                }
                if (atLeastOneChanged) {
                    this.fireSizeChanged();
                }
                return atLeastOneChanged;
            };
            BorderLayout.prototype.layoutChild = function (childPanel) {
                if (childPanel) {
                    return childPanel.doLayout();
                }
                else {
                    return false;
                }
            };
            BorderLayout.prototype.layoutHeight = function () {
                if (this.fullHeight) {
                    return this.layoutHeightFullHeight();
                }
                else {
                    return this.layoutHeightNormal();
                }
            };
            // full height never changes the height, because the center is always 100%,
            // however we do check for change, to inform the listeners
            BorderLayout.prototype.layoutHeightFullHeight = function () {
                var centerHeight = _.offsetHeight(this.eGui);
                if (centerHeight < 0) {
                    centerHeight = 0;
                }
                if (this.centerHeightLastTime !== centerHeight) {
                    this.centerHeightLastTime = centerHeight;
                    return true;
                }
                else {
                    return false;
                }
            };
            BorderLayout.prototype.layoutHeightNormal = function () {
                var totalHeight = _.offsetHeight(this.eGui);
                var northHeight = _.offsetHeight(this.eNorthWrapper);
                var southHeight = _.offsetHeight(this.eSouthWrapper);
                var centerHeight = totalHeight - northHeight - southHeight;
                if (centerHeight < 0) {
                    centerHeight = 0;
                }
                if (this.centerHeightLastTime !== centerHeight) {
                    this.eCenterRow.style.height = centerHeight + 'px';
                    this.centerHeightLastTime = centerHeight;
                    return true; // return true because there was a change
                }
                else {
                    return false;
                }
            };
            BorderLayout.prototype.getCentreHeight = function () {
                return this.centerHeightLastTime;
            };
            BorderLayout.prototype.layoutWidth = function () {
                var totalWidth = _.offsetWidth(this.eGui);
                var eastWidth = _.offsetWidth(this.eEastWrapper);
                var westWidth = _.offsetWidth(this.eWestWrapper);
                var centerWidth = totalWidth - eastWidth - westWidth;
                if (centerWidth < 0) {
                    centerWidth = 0;
                }
                this.eCenterWrapper.style.width = centerWidth + 'px';
            };
            BorderLayout.prototype.setEastVisible = function (visible) {
                if (this.eEastWrapper) {
                    this.eEastWrapper.style.display = visible ? '' : 'none';
                }
                this.doLayout();
            };
            BorderLayout.prototype.setupOverlays = function () {
                // if no overlays, just remove the panel
                if (!this.overlays) {
                    this.eOverlayWrapper.parentNode.removeChild(this.eOverlayWrapper);
                    return;
                }
                this.hideOverlay();
                //
                //this.setOverlayVisible(false);
            };
            BorderLayout.prototype.hideOverlay = function () {
                _.removeAllChildren(this.eOverlayWrapper);
                this.eOverlayWrapper.style.display = 'none';
            };
            BorderLayout.prototype.showOverlay = function (key) {
                var overlay = this.overlays ? this.overlays[key] : null;
                if (overlay) {
                    _.removeAllChildren(this.eOverlayWrapper);
                    this.eOverlayWrapper.style.display = '';
                    this.eOverlayWrapper.appendChild(overlay);
                }
                else {
                    console.log('ag-Grid: unknown overlay');
                    this.hideOverlay();
                }
            };
            BorderLayout.prototype.setSouthVisible = function (visible) {
                if (this.eSouthWrapper) {
                    this.eSouthWrapper.style.display = visible ? '' : 'none';
                }
                this.doLayout();
            };
            return BorderLayout;
        })();
        grid.BorderLayout = BorderLayout;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../layout/borderLayout.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        // the long lines below are on purpose, otherwise there is while space between some of the dives that
        // we do not want to have, and this white space ends up as gaps in some of the browsers
        var gridHtml = "<div>\n                <!-- header -->\n                <div class=\"ag-header\">\n                    <div class=\"ag-pinned-left-header\"></div><div class=\"ag-pinned-right-header\"></div><div class=\"ag-header-viewport\"><div class=\"ag-header-container\"></div></div>\n                </div>\n                <!-- floating top -->\n                <div class=\"ag-floating-top\">\n                    <div class=\"ag-pinned-left-floating-top\"></div><div class=\"ag-pinned-right-floating-top\"></div><div class=\"ag-floating-top-viewport\"><div class=\"ag-floating-top-container\"></div></div>\n                </div>\n                <!-- floating bottom -->\n                <div class=\"ag-floating-bottom\">\n                    <div class=\"ag-pinned-left-floating-bottom\"></div><div class=\"ag-pinned-right-floating-bottom\"></div><div class=\"ag-floating-bottom-viewport\"><div class=\"ag-floating-bottom-container\"></div></div>\n                </div>\n                <!-- body -->\n                <div class=\"ag-body\">\n                    <div class=\"ag-pinned-left-cols-viewport\">\n                        <div class=\"ag-pinned-left-cols-container\"></div>\n                    </div>\n                    <div class=\"ag-pinned-right-cols-viewport\">\n                        <div class=\"ag-pinned-right-cols-container\"></div>\n                    </div>\n                    <div class=\"ag-body-viewport-wrapper\">\n                        <div class=\"ag-body-viewport\">\n                            <div class=\"ag-body-container\"></div>\n                        </div>\n                    </div>\n                </div>\n            </div>";
        var gridForPrintHtml = "<div>\n                <!-- header -->\n                <div class=\"ag-header-container\"></div>\n                <!-- floating top -->\n                <div class=\"ag-floating-top-container\"></div>\n                <!-- body -->\n                <div class=\"ag-body-container\"></div>\n                <!-- floating bottom -->\n                <div class=\"ag-floating-bottom-container\"></div>\n            </div>";
        // wrapping in outer div, and wrapper, is needed to center the loading icon
        // The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
        var mainOverlayTemplate = '<div class="ag-overlay-panel">' +
            '<div class="ag-overlay-wrapper ag-overlay-[OVERLAY_NAME]-wrapper">[OVERLAY_TEMPLATE]</div>' +
            '</div>';
        var defaultLoadingOverlayTemplate = '<span class="ag-overlay-loading-center">[数据加载中...]</span>';
        var defaultNoRowsOverlayTemplate = '<span class="ag-overlay-no-rows-center">[没有数据]</span>';
        var _ = grid.Utils;
        var GridPanel = (function () {
            function GridPanel() {
                this.scrollLagCounter = 0;
                this.lastLeftPosition = -1;
                this.lastTopPosition = -1;
            }
            GridPanel.prototype.init = function (gridOptionsWrapper, columnModel, rowRenderer, masterSlaveService, loggerFactory, floatingRowModel) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                // makes code below more readable if we pull 'forPrint' out
                this.forPrint = this.gridOptionsWrapper.isForPrint();
                this.setupComponents();
                this.scrollWidth = _.getScrollbarWidth();
                this.columnModel = columnModel;
                this.rowRenderer = rowRenderer;
                this.masterSlaveService = masterSlaveService;
                this.floatingRowModel = floatingRowModel;
                this.logger = loggerFactory.create('GridPanel');
            };
            GridPanel.prototype.getLayout = function () {
                return this.layout;
            };
            GridPanel.prototype.setupComponents = function () {
                if (this.forPrint) {
                    this.eRoot = _.loadTemplate(gridForPrintHtml);
                    _.addCssClass(this.eRoot, 'ag-root ag-no-scrolls');
                }
                else {
                    this.eRoot = _.loadTemplate(gridHtml);
                    _.addCssClass(this.eRoot, 'ag-root ag-scrolls');
                }
                this.findElements();
                this.layout = new grid.BorderLayout({
                    overlays: {
                        loading: _.loadTemplate(this.createLoadingOverlayTemplate()),
                        noRows: _.loadTemplate(this.createNoRowsOverlayTemplate())
                    },
                    center: this.eRoot,
                    dontFill: this.forPrint,
                    name: 'eGridPanel'
                });
                this.layout.addSizeChangeListener(this.onBodyHeightChange.bind(this));
                this.addScrollListener();
                if (this.gridOptionsWrapper.isSuppressHorizontalScroll()) {
                    this.eBodyViewport.style.overflowX = 'hidden';
                }
            };
            GridPanel.prototype.getPinnedLeftFloatingTop = function () {
                return this.ePinnedLeftFloatingTop;
            };
            GridPanel.prototype.getPinnedRightFloatingTop = function () {
                return this.ePinnedRightFloatingTop;
            };
            GridPanel.prototype.getFloatingTopContainer = function () {
                return this.eFloatingTopContainer;
            };
            GridPanel.prototype.getPinnedLeftFloatingBottom = function () {
                return this.ePinnedLeftFloatingBottom;
            };
            GridPanel.prototype.getPinnedRightFloatingBottom = function () {
                return this.ePinnedRightFloatingBottom;
            };
            GridPanel.prototype.getFloatingBottomContainer = function () {
                return this.eFloatingBottomContainer;
            };
            GridPanel.prototype.createOverlayTemplate = function (name, defaultTemplate, userProvidedTemplate) {
                var template = mainOverlayTemplate
                    .replace('[OVERLAY_NAME]', name);
                if (userProvidedTemplate) {
                    template = template.replace('[OVERLAY_TEMPLATE]', userProvidedTemplate);
                }
                else {
                    template = template.replace('[OVERLAY_TEMPLATE]', defaultTemplate);
                }
                return template;
            };
            GridPanel.prototype.createLoadingOverlayTemplate = function () {
                var userProvidedTemplate = this.gridOptionsWrapper.getOverlayLoadingTemplate();
                var templateNotLocalised = this.createOverlayTemplate('loading', defaultLoadingOverlayTemplate, userProvidedTemplate);
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                var templateLocalised = templateNotLocalised.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));
                return templateLocalised;
            };
            GridPanel.prototype.createNoRowsOverlayTemplate = function () {
                var userProvidedTemplate = this.gridOptionsWrapper.getOverlayNoRowsTemplate();
                var templateNotLocalised = this.createOverlayTemplate('no-rows', defaultNoRowsOverlayTemplate, userProvidedTemplate);
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                var templateLocalised = templateNotLocalised.replace('[NO_ROWS_TO_SHOW]', localeTextFunc('noRowsToShow', 'No Rows To Show'));
                return templateLocalised;
            };
            GridPanel.prototype.ensureIndexVisible = function (index) {
                this.logger.log('ensureIndexVisible: ' + index);
                var lastRow = this.rowModel.getVirtualRowCount();
                if (typeof index !== 'number' || index < 0 || index >= lastRow) {
                    console.warn('invalid row index for ensureIndexVisible: ' + index);
                    return;
                }
                var nodeAtIndex = this.rowModel.getVirtualRow(index);
                var rowTopPixel = nodeAtIndex.rowTop;
                var rowBottomPixel = rowTopPixel + nodeAtIndex.rowHeight;
                var viewportTopPixel = this.eBodyViewport.scrollTop;
                var viewportHeight = this.eBodyViewport.offsetHeight;
                var scrollShowing = this.isHorizontalScrollShowing();
                if (scrollShowing) {
                    viewportHeight -= this.scrollWidth;
                }
                var viewportBottomPixel = viewportTopPixel + viewportHeight;
                var viewportScrolledPastRow = viewportTopPixel > rowTopPixel;
                var viewportScrolledBeforeRow = viewportBottomPixel < rowBottomPixel;
                var eViewportToScroll = this.columnModel.isPinningRight() ? this.ePinnedRightColsViewport : this.eBodyViewport;
                if (viewportScrolledPastRow) {
                    // if row is before, scroll up with row at top
                    eViewportToScroll.scrollTop = rowTopPixel;
                }
                else if (viewportScrolledBeforeRow) {
                    // if row is below, scroll down with row at bottom
                    var newScrollPosition = rowBottomPixel - viewportHeight;
                    eViewportToScroll.scrollTop = newScrollPosition;
                }
                // otherwise, row is already in view, so do nothing
            };
            GridPanel.prototype.isHorizontalScrollShowing = function () {
                var result = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
                return result;
            };
            GridPanel.prototype.isVerticalScrollShowing = function () {
                if (this.columnModel.isPinningRight()) {
                    // if pinning right, then the scroll bar can show, however for some reason
                    // it overlays the grid and doesn't take space.
                    return false;
                }
                else {
                    return this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight;
                }
            };
            // gets called every 500 ms. we use this to set padding on right pinned column
            GridPanel.prototype.periodicallyCheck = function () {
                if (this.columnModel.isPinningRight()) {
                    var bodyHorizontalScrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
                    if (bodyHorizontalScrollShowing) {
                        this.ePinnedRightColsContainer.style.marginBottom = this.scrollWidth + 'px';
                    }
                    else {
                        this.ePinnedRightColsContainer.style.marginBottom = '';
                    }
                }
            };
            GridPanel.prototype.ensureColIndexVisible = function (index) {
                var leftColumns = this.columnModel.getDisplayedLeftColumns();
                var centerColumns = this.columnModel.getDisplayedCenterColumns();
                var minAllowedIndex = leftColumns.length;
                var maxAllowedIndex = minAllowedIndex + centerColumns.length - 1;
                var indexIsInRange = index >= minAllowedIndex && index <= maxAllowedIndex;
                if (!indexIsInRange) {
                    console.warn('index is not in range, should be between '
                        + minAllowedIndex + ' and ' + maxAllowedIndex);
                    console.warn('Remember it makes no sense to scroll to a pinned column');
                    return;
                }
                var centerIndex = index - leftColumns.length;
                var column = centerColumns[centerIndex];
                // sum up all col width to the let to get the start pixel
                var colLeftPixel = 0;
                for (var i = 0; i < centerIndex; i++) {
                    colLeftPixel += centerColumns[i].getActualWidth();
                }
                var colRightPixel = colLeftPixel + column.getActualWidth();
                var viewportLeftPixel = this.eBodyViewport.scrollLeft;
                var viewportWidth = this.eBodyViewport.offsetWidth;
                var scrollShowing = this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight;
                if (scrollShowing) {
                    viewportWidth -= this.scrollWidth;
                }
                var viewportRightPixel = viewportLeftPixel + viewportWidth;
                var viewportScrolledPastCol = viewportLeftPixel > colLeftPixel;
                var viewportScrolledBeforeCol = viewportRightPixel < colRightPixel;
                if (viewportScrolledPastCol) {
                    // if viewport's left side is after col's left side, scroll right to pull col into viewport at left
                    this.eBodyViewport.scrollLeft = colLeftPixel;
                }
                else if (viewportScrolledBeforeCol) {
                    // if viewport's right side is before col's right side, scroll left to pull col into viewport at right
                    var newScrollPosition = colRightPixel - viewportWidth;
                    this.eBodyViewport.scrollLeft = newScrollPosition;
                }
                // otherwise, col is already in view, so do nothing
            };
            GridPanel.prototype.showLoadingOverlay = function () {
                if (!this.gridOptionsWrapper.isSuppressLoadingOverlay()) {
                    this.layout.showOverlay('loading');
                }
            };
            GridPanel.prototype.showNoRowsOverlay = function () {
                if (!this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
                    this.layout.showOverlay('noRows');
                }
            };
            GridPanel.prototype.hideOverlay = function () {
                this.layout.hideOverlay();
            };
            GridPanel.prototype.getWidthForSizeColsToFit = function () {
                var availableWidth = this.eBody.clientWidth;
                var scrollShowing = this.isVerticalScrollShowing();
                if (scrollShowing) {
                    availableWidth -= this.scrollWidth;
                }
                return availableWidth;
            };
            // method will call itself if no available width. this covers if the grid
            // isn't visible, but is just about to be visible.
            GridPanel.prototype.sizeColumnsToFit = function (nextTimeout) {
                var _this = this;
                var availableWidth = this.getWidthForSizeColsToFit();
                if (availableWidth > 0) {
                    this.columnModel.sizeColumnsToFit(availableWidth);
                }
                else {
                    if (nextTimeout === undefined) {
                        setTimeout(function () {
                            _this.sizeColumnsToFit(100);
                        }, 0);
                    }
                    else if (nextTimeout === 100) {
                        setTimeout(function () {
                            _this.sizeColumnsToFit(-1);
                        }, 100);
                    }
                    else {
                        console.log('ag-Grid: tried to call sizeColumnsToFit() but the grid is coming back with zero width, mabye the grid is not visible yet on the screen?');
                    }
                }
            };
            GridPanel.prototype.setRowModel = function (rowModel) {
                this.rowModel = rowModel;
            };
            GridPanel.prototype.getBodyContainer = function () {
                return this.eBodyContainer;
            };
            GridPanel.prototype.getBodyViewport = function () {
                return this.eBodyViewport;
            };
            GridPanel.prototype.getPinnedLeftColsContainer = function () {
                return this.ePinnedLeftColsContainer;
            };
            GridPanel.prototype.getPinnedRightColsContainer = function () {
                return this.ePinnedRightColsContainer;
            };
            GridPanel.prototype.getHeaderContainer = function () {
                return this.eHeaderContainer;
            };
            GridPanel.prototype.getRoot = function () {
                return this.eRoot;
            };
            GridPanel.prototype.getPinnedLeftHeader = function () {
                return this.ePinnedLeftHeader;
            };
            GridPanel.prototype.getPinnedRightHeader = function () {
                return this.ePinnedRightHeader;
            };
            GridPanel.prototype.getRowsParent = function () {
                return this.eParentsOfRows;
            };
            GridPanel.prototype.queryHtmlElement = function (selector) {
                return this.eRoot.querySelector(selector);
            };
            GridPanel.prototype.findElements = function () {
                if (this.forPrint) {
                    this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
                    this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
                    this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
                    this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');
                    this.eParentsOfRows = [this.eBodyContainer, this.eFloatingTopContainer, this.eFloatingBottomContainer];
                }
                else {
                    this.eBody = this.queryHtmlElement('.ag-body');
                    this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
                    this.eBodyViewport = this.queryHtmlElement('.ag-body-viewport');
                    this.eBodyViewportWrapper = this.queryHtmlElement('.ag-body-viewport-wrapper');
                    this.ePinnedLeftColsContainer = this.queryHtmlElement('.ag-pinned-left-cols-container');
                    this.ePinnedRightColsContainer = this.queryHtmlElement('.ag-pinned-right-cols-container');
                    this.ePinnedLeftColsViewport = this.queryHtmlElement('.ag-pinned-left-cols-viewport');
                    this.ePinnedRightColsViewport = this.queryHtmlElement('.ag-pinned-right-cols-viewport');
                    this.ePinnedLeftHeader = this.queryHtmlElement('.ag-pinned-left-header');
                    this.ePinnedRightHeader = this.queryHtmlElement('.ag-pinned-right-header');
                    this.eHeader = this.queryHtmlElement('.ag-header');
                    this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
                    this.eHeaderViewport = this.queryHtmlElement('.ag-header-viewport');
                    this.eFloatingTop = this.queryHtmlElement('.ag-floating-top');
                    this.ePinnedLeftFloatingTop = this.queryHtmlElement('.ag-pinned-left-floating-top');
                    this.ePinnedRightFloatingTop = this.queryHtmlElement('.ag-pinned-right-floating-top');
                    this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
                    this.eFloatingBottom = this.queryHtmlElement('.ag-floating-bottom');
                    this.ePinnedLeftFloatingBottom = this.queryHtmlElement('.ag-pinned-left-floating-bottom');
                    this.ePinnedRightFloatingBottom = this.queryHtmlElement('.ag-pinned-right-floating-bottom');
                    this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');
                    // for scrolls, all rows live in eBody (containing pinned and normal body)
                    this.eParentsOfRows = [this.eBody, this.eFloatingTop, this.eFloatingBottom];
                    // IE9, Chrome, Safari, Opera
                    this.ePinnedLeftColsViewport.addEventListener('mousewheel', this.pinnedLeftMouseWheelListener.bind(this));
                    this.eBodyViewport.addEventListener('mousewheel', this.centerMouseWheelListener.bind(this));
                    // Firefox
                    this.ePinnedLeftColsViewport.addEventListener('DOMMouseScroll', this.pinnedLeftMouseWheelListener.bind(this));
                    this.eBodyViewport.addEventListener('DOMMouseScroll', this.centerMouseWheelListener.bind(this));
                }
            };
            GridPanel.prototype.getHeaderViewport = function () {
                return this.eHeaderViewport;
            };
            GridPanel.prototype.centerMouseWheelListener = function (event) {
                // we are only interested in mimicking the mouse wheel if we are pinning on the right,
                // as if we are not pinning on the right, then we have scrollbars in the center body, and
                // as such we just use the default browser wheel behaviour.
                if (this.columnModel.isPinningRight()) {
                    return this.generalMouseWheelListener(event, this.ePinnedRightColsViewport);
                }
            };
            GridPanel.prototype.pinnedLeftMouseWheelListener = function (event) {
                var targetPanel;
                if (this.columnModel.isPinningRight()) {
                    targetPanel = this.ePinnedRightColsViewport;
                }
                else {
                    targetPanel = this.eBodyViewport;
                }
                return this.generalMouseWheelListener(event, targetPanel);
            };
            GridPanel.prototype.generalMouseWheelListener = function (event, targetPanel) {
                var delta;
                if (event.deltaY && event.deltaX != 0) {
                    // tested on chrome
                    delta = event.deltaY;
                }
                else if (event.wheelDelta && event.wheelDelta != 0) {
                    // tested on IE
                    delta = -event.wheelDelta;
                }
                else if (event.detail && event.detail != 0) {
                    // tested on Firefox. Firefox appears to be slower, 20px rather than the 100px in Chrome and IE
                    delta = event.detail * 20;
                }
                else {
                    // couldn't find delta
                    return;
                }
                var newTopPosition = this.eBodyViewport.scrollTop + delta;
                targetPanel.scrollTop = newTopPosition;
                // if we don't prevent default, then the whole browser will scroll also as well as the grid
                event.preventDefault();
                return false;
            };
            GridPanel.prototype.setBodyContainerWidth = function () {
                var mainRowWidth = this.columnModel.getBodyContainerWidth() + 'px';
                this.eBodyContainer.style.width = mainRowWidth;
                if (!this.forPrint) {
                    this.eFloatingBottomContainer.style.width = mainRowWidth;
                    this.eFloatingTopContainer.style.width = mainRowWidth;
                }
            };
            GridPanel.prototype.setPinnedColContainerWidth = function () {
                if (this.forPrint) {
                    // pinned col doesn't exist when doing forPrint
                    return;
                }
                var pinnedLeftWidth = this.columnModel.getPinnedLeftContainerWidth() + 'px';
                this.ePinnedLeftColsContainer.style.width = pinnedLeftWidth;
                this.ePinnedLeftFloatingBottom.style.width = pinnedLeftWidth;
                this.ePinnedLeftFloatingTop.style.width = pinnedLeftWidth;
                this.eBodyViewportWrapper.style.marginLeft = pinnedLeftWidth;
                var pinnedRightWidth = this.columnModel.getPinnedRightContainerWidth() + 'px';
                this.ePinnedRightColsContainer.style.width = pinnedRightWidth;
                this.ePinnedRightFloatingBottom.style.width = pinnedRightWidth;
                this.ePinnedRightFloatingTop.style.width = pinnedRightWidth;
                this.eBodyViewportWrapper.style.marginRight = pinnedRightWidth;
            };
            GridPanel.prototype.showPinnedColContainersIfNeeded = function () {
                // no need to do this if not using scrolls
                if (this.forPrint) {
                    return;
                }
                //some browsers had layout issues with the blank divs, so if blank,
                //we don't display them
                if (this.columnModel.isPinningLeft()) {
                    this.ePinnedLeftHeader.style.display = 'inline-block';
                    this.ePinnedLeftColsViewport.style.display = 'inline';
                }
                else {
                    this.ePinnedLeftHeader.style.display = 'none';
                    this.ePinnedLeftColsViewport.style.display = 'none';
                }
                if (this.columnModel.isPinningRight()) {
                    this.ePinnedRightHeader.style.display = 'inline-block';
                    this.ePinnedRightColsViewport.style.display = 'inline';
                    this.eBodyViewport.style.overflowY = 'hidden';
                }
                else {
                    this.ePinnedRightHeader.style.display = 'none';
                    this.ePinnedRightColsViewport.style.display = 'none';
                    this.eBodyViewport.style.overflowY = 'auto';
                }
            };
            GridPanel.prototype.onBodyHeightChange = function () {
                this.sizeHeaderAndBody();
            };
            GridPanel.prototype.sizeHeaderAndBody = function () {
                if (this.forPrint) {
                    this.sizeHeaderAndBodyForPrint();
                }
                else {
                    this.sizeHeaderAndBodyNormal();
                }
            };
            GridPanel.prototype.sizeHeaderAndBodyNormal = function () {
                var heightOfContainer = this.layout.getCentreHeight();
                if (!heightOfContainer) {
                    return;
                }
                var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
                var numberOfRowsInHeader = this.columnModel.getHeaderRowCount();
                var totalHeaderHeight = headerHeight * numberOfRowsInHeader;
                this.eHeader.style['height'] = totalHeaderHeight + 'px';
                // padding top covers the header and the floating rows on top
                var floatingTopHeight = this.floatingRowModel.getFloatingTopTotalHeight();
                var paddingTop = totalHeaderHeight + floatingTopHeight;
                // bottom is just the bottom floating rows
                var floatingBottomHeight = this.floatingRowModel.getFloatingBottomTotalHeight();
                var floatingBottomTop = heightOfContainer - floatingBottomHeight;
                var heightOfCentreRows = heightOfContainer - totalHeaderHeight - floatingBottomHeight - floatingTopHeight;
                this.eBody.style.paddingTop = paddingTop + 'px';
                this.eBody.style.paddingBottom = floatingBottomHeight + 'px';
                this.eFloatingTop.style.top = totalHeaderHeight + 'px';
                this.eFloatingTop.style.height = floatingTopHeight + 'px';
                this.eFloatingBottom.style.height = floatingBottomHeight + 'px';
                this.eFloatingBottom.style.top = floatingBottomTop + 'px';
                this.ePinnedLeftColsViewport.style.height = heightOfCentreRows + 'px';
                this.ePinnedRightColsViewport.style.height = heightOfCentreRows + 'px';
            };
            GridPanel.prototype.sizeHeaderAndBodyForPrint = function () {
                var headerHeightPixels = this.gridOptionsWrapper.getHeaderHeight() + 'px';
                this.eHeaderContainer.style['height'] = headerHeightPixels;
            };
            GridPanel.prototype.setHorizontalScrollPosition = function (hScrollPosition) {
                this.eBodyViewport.scrollLeft = hScrollPosition;
            };
            GridPanel.prototype.addScrollListener = function () {
                var _this = this;
                // if printing, then no scrolling, so no point in listening for scroll events
                if (this.forPrint) {
                    return;
                }
                this.eBodyViewport.addEventListener('scroll', function () {
                    // we are always interested in horizontal scrolls of the body
                    var newLeftPosition = _this.eBodyViewport.scrollLeft;
                    if (newLeftPosition !== _this.lastLeftPosition) {
                        _this.lastLeftPosition = newLeftPosition;
                        _this.horizontallyScrollHeaderCenterAndFloatingCenter(newLeftPosition);
                        _this.masterSlaveService.fireHorizontalScrollEvent(newLeftPosition);
                    }
                    // if we are pinning to the right, then it's the right pinned container
                    // that has the scroll.
                    if (!_this.columnModel.isPinningRight()) {
                        var newTopPosition = _this.eBodyViewport.scrollTop;
                        if (newTopPosition !== _this.lastTopPosition) {
                            _this.lastTopPosition = newTopPosition;
                            _this.verticallyScrollLeftPinned(newTopPosition);
                            _this.requestDrawVirtualRows();
                        }
                    }
                });
                this.ePinnedRightColsViewport.addEventListener('scroll', function () {
                    var newTopPosition = _this.ePinnedRightColsViewport.scrollTop;
                    if (newTopPosition !== _this.lastTopPosition) {
                        _this.lastTopPosition = newTopPosition;
                        _this.verticallyScrollLeftPinned(newTopPosition);
                        _this.verticallyScrollBody(newTopPosition);
                        _this.requestDrawVirtualRows();
                    }
                });
                // this means the pinned panel was moved, which can only
                // happen when the user is navigating in the pinned container
                // as the pinned col should never scroll. so we rollback
                // the scroll on the pinned.
                this.ePinnedLeftColsViewport.addEventListener('scroll', function () {
                    _this.ePinnedLeftColsViewport.scrollTop = 0;
                });
            };
            GridPanel.prototype.requestDrawVirtualRows = function () {
                var _this = this;
                // if we are in IE or Safari, then we only redraw if there was no scroll event
                // in the 50ms following this scroll event. without this, these browsers have
                // a bad scrolling feel, where the redraws clog the scroll experience
                // (makes the scroll clunky and sticky). this method is like throttling
                // the scroll events.
                var useScrollLag;
                // let the user override scroll lag option
                if (this.gridOptionsWrapper.isSuppressScrollLag()) {
                    useScrollLag = false;
                }
                else if (this.gridOptionsWrapper.getIsScrollLag()) {
                    useScrollLag = this.gridOptionsWrapper.getIsScrollLag()();
                }
                else {
                    useScrollLag = _.isBrowserIE() || _.isBrowserSafari();
                }
                if (useScrollLag) {
                    this.scrollLagCounter++;
                    var scrollLagCounterCopy = this.scrollLagCounter;
                    setTimeout(function () {
                        if (_this.scrollLagCounter === scrollLagCounterCopy) {
                            _this.rowRenderer.drawVirtualRows();
                        }
                    }, 50);
                }
                else {
                    this.rowRenderer.drawVirtualRows();
                }
            };
            GridPanel.prototype.horizontallyScrollHeaderCenterAndFloatingCenter = function (bodyLeftPosition) {
                // this.eHeaderContainer.style.transform = 'translate3d(' + -bodyLeftPosition + 'px,0,0)';
                this.eHeaderContainer.style.left = -bodyLeftPosition + 'px';
                this.eFloatingBottomContainer.style.left = -bodyLeftPosition + 'px';
                this.eFloatingTopContainer.style.left = -bodyLeftPosition + 'px';
            };
            GridPanel.prototype.verticallyScrollLeftPinned = function (bodyTopPosition) {
                // this.ePinnedColsContainer.style.transform = 'translate3d(0,' + -bodyTopPosition + 'px,0)';
                this.ePinnedLeftColsContainer.style.top = -bodyTopPosition + 'px';
            };
            GridPanel.prototype.verticallyScrollBody = function (position) {
                this.eBodyViewport.scrollTop = position;
            };
            return GridPanel;
        })();
        grid.GridPanel = GridPanel;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var DragAndDropService = (function () {
            function DragAndDropService() {
            }
            DragAndDropService.prototype.init = function (loggerFactory) {
                this.logger = loggerFactory.create('DragAndDropService');
                // need to clean this up, add to 'finished' logic in grid
                var that = this;
                this.mouseUpEventListener = function listener() {
                    that.stopDragging();
                };
                document.addEventListener('mouseup', this.mouseUpEventListener);
                this.logger.log('initialised');
            };
            DragAndDropService.prototype.destroy = function () {
                document.removeEventListener('mouseup', this.mouseUpEventListener);
                this.logger.log('destroyed');
            };
            DragAndDropService.prototype.stopDragging = function () {
                if (this.dragItem) {
                    this.setDragCssClasses(this.dragItem.eDragSource, false);
                    this.dragItem = null;
                }
            };
            DragAndDropService.prototype.setDragCssClasses = function (eListItem, dragging) {
                _.addOrRemoveCssClass(eListItem, 'ag-dragging', dragging);
                _.addOrRemoveCssClass(eListItem, 'ag-not-dragging', !dragging);
            };
            DragAndDropService.prototype.addDragSource = function (eDragSource, dragSourceCallback) {
                this.setDragCssClasses(eDragSource, false);
                eDragSource.addEventListener('mousedown', this.onMouseDownDragSource.bind(this, eDragSource, dragSourceCallback));
            };
            DragAndDropService.prototype.onMouseDownDragSource = function (eDragSource, dragSourceCallback) {
                if (this.dragItem) {
                    this.stopDragging();
                }
                var data;
                if (dragSourceCallback.getData) {
                    data = dragSourceCallback.getData();
                }
                var containerId;
                if (dragSourceCallback.getContainerId) {
                    containerId = dragSourceCallback.getContainerId();
                }
                this.dragItem = {
                    eDragSource: eDragSource,
                    data: data,
                    containerId: containerId
                };
                this.setDragCssClasses(this.dragItem.eDragSource, true);
            };
            DragAndDropService.prototype.addDropTarget = function (eDropTarget, dropTargetCallback) {
                var mouseIn = false;
                var acceptDrag = false;
                var that = this;
                eDropTarget.addEventListener('mouseover', function () {
                    if (!mouseIn) {
                        mouseIn = true;
                        if (that.dragItem) {
                            acceptDrag = dropTargetCallback.acceptDrag(that.dragItem);
                        }
                        else {
                            acceptDrag = false;
                        }
                    }
                });
                eDropTarget.addEventListener('mouseout', function () {
                    if (acceptDrag) {
                        dropTargetCallback.noDrop();
                    }
                    mouseIn = false;
                    acceptDrag = false;
                });
                eDropTarget.addEventListener('mouseup', function () {
                    // dragItem should never be null, checking just in case
                    if (acceptDrag && that.dragItem) {
                        dropTargetCallback.drop(that.dragItem);
                    }
                });
            };
            return DragAndDropService;
        })();
        grid.DragAndDropService = DragAndDropService;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../dragAndDrop/dragAndDropService" />
/// <amd-dependency path="text!agList.html"/>
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var template = '<div class="ag-list-selection">' +
            '<div>' +
            '<div ag-repeat class="ag-list-item">' +
            '</div>' +
            '</div>' +
            '</div>';
        var DropTargetLocation;
        (function (DropTargetLocation) {
            DropTargetLocation[DropTargetLocation["NOT_DROP_TARGET"] = 0] = "NOT_DROP_TARGET";
            DropTargetLocation[DropTargetLocation["DROP_TARGET_ABOVE"] = 1] = "DROP_TARGET_ABOVE";
            DropTargetLocation[DropTargetLocation["DROP_TARGET_BELOW"] = 2] = "DROP_TARGET_BELOW";
        })(DropTargetLocation || (DropTargetLocation = {}));
        ;
        var AgList = (function () {
            function AgList(dragAndDropService) {
                this.readOnly = false;
                this.dragAndDropService = dragAndDropService;
                this.setupComponents();
                this.uniqueId = 'CheckboxSelection-' + Math.random();
                this.modelChangedListeners = [];
                this.itemSelectedListeners = [];
                this.itemMovedListeners = [];
                this.beforeDropListeners = [];
                this.dragSources = [];
                this.setupAsDropTarget();
            }
            AgList.prototype.setReadOnly = function (readOnly) {
                this.readOnly = readOnly;
            };
            AgList.prototype.setEmptyMessage = function (emptyMessage) {
                this.emptyMessage = emptyMessage;
                this.refreshView();
            };
            AgList.prototype.getUniqueId = function () {
                return this.uniqueId;
            };
            AgList.prototype.addStyles = function (styles) {
                utils.addStylesToElement(this.eGui, styles);
            };
            AgList.prototype.addCssClass = function (cssClass) {
                utils.addCssClass(this.eGui, cssClass);
            };
            AgList.prototype.addDragSource = function (dragSource) {
                this.dragSources.push(dragSource);
            };
            AgList.prototype.addModelChangedListener = function (listener) {
                this.modelChangedListeners.push(listener);
            };
            AgList.prototype.addItemSelectedListener = function (listener) {
                this.itemSelectedListeners.push(listener);
            };
            AgList.prototype.addItemMovedListener = function (listener) {
                this.itemMovedListeners.push(listener);
            };
            AgList.prototype.addBeforeDropListener = function (listener) {
                this.beforeDropListeners.push(listener);
            };
            AgList.prototype.fireItemMoved = function (fromIndex, toIndex) {
                for (var i = 0; i < this.itemMovedListeners.length; i++) {
                    this.itemMovedListeners[i](fromIndex, toIndex);
                }
            };
            AgList.prototype.fireModelChanged = function () {
                for (var i = 0; i < this.modelChangedListeners.length; i++) {
                    this.modelChangedListeners[i](this.model);
                }
            };
            AgList.prototype.fireItemSelected = function (item) {
                for (var i = 0; i < this.itemSelectedListeners.length; i++) {
                    this.itemSelectedListeners[i](item);
                }
            };
            AgList.prototype.fireBeforeDrop = function (item) {
                for (var i = 0; i < this.beforeDropListeners.length; i++) {
                    this.beforeDropListeners[i](item);
                }
            };
            AgList.prototype.setupComponents = function () {
                this.eGui = utils.loadTemplate(template);
                this.eFilterValueTemplate = this.eGui.querySelector("[ag-repeat]");
                this.eListParent = this.eFilterValueTemplate.parentNode;
                utils.removeAllChildren(this.eListParent);
            };
            AgList.prototype.setModel = function (model) {
                this.model = model;
                this.refreshView();
            };
            AgList.prototype.getModel = function () {
                return this.model;
            };
            AgList.prototype.setCellRenderer = function (cellRenderer) {
                this.cellRenderer = cellRenderer;
            };
            AgList.prototype.refreshView = function () {
                utils.removeAllChildren(this.eListParent);
                if (this.model && this.model.length > 0) {
                    this.insertRows();
                }
                else {
                    this.insertBlankMessage();
                }
            };
            AgList.prototype.insertRows = function () {
                for (var i = 0; i < this.model.length; i++) {
                    var item = this.model[i];
                    //var text = this.getText(item);
                    //var selected = this.isSelected(item);
                    var eListItem = this.eFilterValueTemplate.cloneNode(true);
                    if (this.cellRenderer) {
                        var params = { value: item };
                        utils.useRenderer(eListItem, this.cellRenderer, params);
                    }
                    else {
                        eListItem.innerHTML = item;
                    }
                    eListItem.addEventListener('click', this.fireItemSelected.bind(this, item));
                    this.addDragAndDropToListItem(eListItem, item);
                    this.eListParent.appendChild(eListItem);
                }
            };
            AgList.prototype.insertBlankMessage = function () {
                if (this.emptyMessage) {
                    var eMessage = document.createElement('div');
                    eMessage.style.color = 'grey';
                    eMessage.style.padding = '4px';
                    eMessage.style.textAlign = 'center';
                    eMessage.innerHTML = this.emptyMessage;
                    this.eListParent.appendChild(eMessage);
                }
            };
            AgList.prototype.setupAsDropTarget = function () {
                this.dragAndDropService.addDropTarget(this.eGui, {
                    acceptDrag: this.externalAcceptDrag.bind(this),
                    drop: this.externalDrop.bind(this),
                    noDrop: this.externalNoDrop.bind(this)
                });
            };
            AgList.prototype.externalAcceptDrag = function (dragEvent) {
                var allowedSource = this.dragSources.indexOf(dragEvent.containerId) >= 0;
                if (!allowedSource) {
                    return false;
                }
                var alreadyHaveCol = this.model.indexOf(dragEvent.data) >= 0;
                if (alreadyHaveCol) {
                    return false;
                }
                this.eGui.style.backgroundColor = 'lightgreen';
                return true;
            };
            AgList.prototype.externalDrop = function (dragEvent) {
                var newListItem = dragEvent.data;
                this.fireBeforeDrop(newListItem);
                if (!this.readOnly) {
                    this.addItemToList(newListItem);
                }
                this.eGui.style.backgroundColor = '';
            };
            AgList.prototype.externalNoDrop = function () {
                this.eGui.style.backgroundColor = '';
            };
            AgList.prototype.addItemToList = function (newItem) {
                this.model.push(newItem);
                this.refreshView();
                this.fireModelChanged();
            };
            AgList.prototype.addDragAndDropToListItem = function (eListItem, item) {
                var that = this;
                this.dragAndDropService.addDragSource(eListItem, {
                    getData: function () {
                        return item;
                    },
                    getContainerId: function () {
                        return that.uniqueId;
                    }
                });
                this.dragAndDropService.addDropTarget(eListItem, {
                    acceptDrag: function (dragItem) {
                        return that.internalAcceptDrag(item, dragItem, eListItem);
                    },
                    drop: function (dragItem) {
                        that.internalDrop(item, dragItem.data);
                    },
                    noDrop: function () {
                        that.internalNoDrop(eListItem);
                    }
                });
            };
            AgList.prototype.internalAcceptDrag = function (targetColumn, dragItem, eListItem) {
                var result = dragItem.data !== targetColumn && dragItem.containerId === this.uniqueId;
                if (result) {
                    if (this.dragAfterThisItem(targetColumn, dragItem.data)) {
                        this.setDropCssClasses(eListItem, DropTargetLocation.DROP_TARGET_ABOVE);
                    }
                    else {
                        this.setDropCssClasses(eListItem, DropTargetLocation.DROP_TARGET_BELOW);
                    }
                }
                return result;
            };
            AgList.prototype.internalDrop = function (targetColumn, draggedColumn) {
                var oldIndex = this.model.indexOf(draggedColumn);
                var newIndex = this.model.indexOf(targetColumn);
                if (this.readOnly) {
                    this.fireItemMoved(oldIndex, newIndex);
                }
                else {
                    this.model.splice(oldIndex, 1);
                    this.model.splice(newIndex, 0, draggedColumn);
                    this.refreshView();
                    this.fireModelChanged();
                }
            };
            AgList.prototype.internalNoDrop = function (eListItem) {
                this.setDropCssClasses(eListItem, DropTargetLocation.NOT_DROP_TARGET);
            };
            AgList.prototype.dragAfterThisItem = function (targetColumn, draggedColumn) {
                return this.model.indexOf(targetColumn) < this.model.indexOf(draggedColumn);
            };
            AgList.prototype.setDropCssClasses = function (eListItem, state) {
                utils.addOrRemoveCssClass(eListItem, 'ag-not-drop-target', state === DropTargetLocation.NOT_DROP_TARGET);
                utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-above', state === DropTargetLocation.DROP_TARGET_ABOVE);
                utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-below', state === DropTargetLocation.DROP_TARGET_BELOW);
            };
            AgList.prototype.getGui = function () {
                return this.eGui;
            };
            return AgList;
        })();
        grid.AgList = AgList;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../widgets/agList.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../layout/BorderLayout.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var svgFactory = grid.SvgFactory.getInstance();
        var ColumnSelectionPanel = (function () {
            function ColumnSelectionPanel(columnController, gridOptionsWrapper, eventService, dragAndDropService) {
                this.dragAndDropService = dragAndDropService;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.columnController = columnController;
                this.setupComponents();
                eventService.addEventListener(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.columnsChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_MOVED, this.columnsChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_VISIBLE, this.columnsChanged.bind(this));
            }
            ColumnSelectionPanel.prototype.columnsChanged = function () {
                this.cColumnList.setModel(this.columnController.getAllColumns());
            };
            ColumnSelectionPanel.prototype.getDragSource = function () {
                return this.cColumnList.getUniqueId();
            };
            ColumnSelectionPanel.prototype.columnCellRenderer = function (params) {
                var column = params.value;
                var colDisplayName = this.columnController.getDisplayNameForCol(column);
                var eResult = document.createElement('span');
                var eVisibleIcons = document.createElement('span');
                utils.addCssClass(eVisibleIcons, 'ag-visible-icons');
                var eShowing = utils.createIcon('columnVisible', this.gridOptionsWrapper, column, svgFactory.createColumnShowingSvg);
                var eHidden = utils.createIcon('columnHidden', this.gridOptionsWrapper, column, svgFactory.createColumnHiddenSvg);
                eVisibleIcons.appendChild(eShowing);
                eVisibleIcons.appendChild(eHidden);
                eShowing.style.display = column.visible ? '' : 'none';
                eHidden.style.display = column.visible ? 'none' : '';
                eResult.appendChild(eVisibleIcons);
                var eValue = document.createElement('span');
                eValue.innerHTML = colDisplayName;
                eResult.appendChild(eValue);
                if (!column.visible) {
                    utils.addCssClass(eResult, 'ag-column-not-visible');
                }
                // change visible if use clicks the visible icon, or if row is double clicked
                eVisibleIcons.addEventListener('click', showEventListener);
                var that = this;
                function showEventListener() {
                    that.columnController.setColumnVisible(column, !column.visible);
                }
                return eResult;
            };
            ColumnSelectionPanel.prototype.setupComponents = function () {
                this.cColumnList = new grid.AgList(this.dragAndDropService);
                this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
                this.cColumnList.addStyles({ height: '100%', overflow: 'auto' });
                this.cColumnList.addItemMovedListener(this.onItemMoved.bind(this));
                this.cColumnList.setReadOnly(true);
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                var columnsLocalText = localeTextFunc('columns', 'Columns');
                var eNorthPanel = document.createElement('div');
                eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';
                this.layout = new grid.BorderLayout({
                    center: this.cColumnList.getGui(),
                    north: eNorthPanel
                });
            };
            ColumnSelectionPanel.prototype.onItemMoved = function (fromIndex, toIndex) {
                this.columnController.moveColumn(fromIndex, toIndex);
            };
            ColumnSelectionPanel.prototype.getGui = function () {
                return this.eRootPanel.getGui();
            };
            return ColumnSelectionPanel;
        })();
        grid.ColumnSelectionPanel = ColumnSelectionPanel;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../widgets/agList.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../layout/BorderLayout.ts" />
/// <reference path="../constants.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var svgFactory = grid.SvgFactory.getInstance();
        var GroupSelectionPanel = (function () {
            function GroupSelectionPanel(columnController, inMemoryRowController, gridOptionsWrapper, eventService, dragAndDropService) {
                this.dragAndDropService = dragAndDropService;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.setupComponents();
                this.columnController = columnController;
                this.inMemoryRowController = inMemoryRowController;
                eventService.addEventListener(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.columnsChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.columnsChanged.bind(this));
            }
            GroupSelectionPanel.prototype.columnsChanged = function () {
                this.cColumnList.setModel(this.columnController.getRowGroupColumns());
            };
            GroupSelectionPanel.prototype.addDragSource = function (dragSource) {
                this.cColumnList.addDragSource(dragSource);
            };
            GroupSelectionPanel.prototype.columnCellRenderer = function (params) {
                var column = params.value;
                var colDisplayName = this.columnController.getDisplayNameForCol(column);
                var eResult = document.createElement('span');
                var eRemove = _.createIcon('columnRemoveFromGroup', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
                _.addCssClass(eRemove, 'ag-visible-icons');
                eResult.appendChild(eRemove);
                var that = this;
                eRemove.addEventListener('click', function () {
                    that.columnController.removeRowGroupColumn(column);
                });
                var eValue = document.createElement('span');
                eValue.innerHTML = colDisplayName;
                eResult.appendChild(eValue);
                return eResult;
            };
            GroupSelectionPanel.prototype.setupComponents = function () {
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                var columnsLocalText = localeTextFunc('rowGroupColumns', 'Row Groupings');
                var rowGroupColumnsEmptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag columns from above to group rows');
                this.cColumnList = new grid.AgList(this.dragAndDropService);
                this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
                this.cColumnList.addBeforeDropListener(this.onBeforeDrop.bind(this));
                this.cColumnList.addItemMovedListener(this.onItemMoved.bind(this));
                this.cColumnList.setEmptyMessage(rowGroupColumnsEmptyMessage);
                this.cColumnList.addStyles({ height: '100%', overflow: 'auto' });
                this.cColumnList.setReadOnly(true);
                var eNorthPanel = document.createElement('div');
                eNorthPanel.style.paddingTop = '10px';
                eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';
                this.layout = new grid.BorderLayout({
                    center: this.cColumnList.getGui(),
                    north: eNorthPanel
                });
            };
            GroupSelectionPanel.prototype.onBeforeDrop = function (newItem) {
                this.columnController.addRowGroupColumn(newItem);
            };
            GroupSelectionPanel.prototype.onItemMoved = function (fromIndex, toIndex) {
                this.columnController.moveRowGroupColumn(fromIndex, toIndex);
            };
            return GroupSelectionPanel;
        })();
        grid.GroupSelectionPanel = GroupSelectionPanel;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="./agList.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../widgets/agPopupService.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var svgFactory = grid.SvgFactory.getInstance();
        var AgDropdownList = (function () {
            function AgDropdownList(popupService, dragAndDropService) {
                this.popupService = popupService;
                this.setupComponents(dragAndDropService);
                this.itemSelectedListeners = [];
            }
            AgDropdownList.prototype.setWidth = function (width) {
                this.eValue.style.width = width + 'px';
                this.agList.addStyles({ width: width + 'px' });
            };
            AgDropdownList.prototype.addItemSelectedListener = function (listener) {
                this.itemSelectedListeners.push(listener);
            };
            AgDropdownList.prototype.fireItemSelected = function (item) {
                for (var i = 0; i < this.itemSelectedListeners.length; i++) {
                    this.itemSelectedListeners[i](item);
                }
            };
            AgDropdownList.prototype.setupComponents = function (dragAndDropService) {
                this.eGui = document.createElement('span');
                this.eValue = document.createElement('span');
                this.eGui.appendChild(this.eValue);
                this.agList = new grid.AgList(dragAndDropService);
                this.eValue.addEventListener('click', this.onClick.bind(this));
                this.agList.addItemSelectedListener(this.itemSelected.bind(this));
                this.agList.addCssClass('ag-popup-list');
                utils.addStylesToElement(this.eValue, {
                    border: '1px solid darkgrey',
                    display: 'inline-block',
                    paddingLeft: 2
                });
                utils.addStylesToElement(this.eGui, { position: 'relative' });
                this.agList.addStyles({
                    display: 'inline-block',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroudColor: 'white'
                });
            };
            AgDropdownList.prototype.itemSelected = function (item) {
                this.setSelected(item);
                if (this.hidePopupCallback) {
                    this.hidePopupCallback();
                }
                this.fireItemSelected(item);
            };
            AgDropdownList.prototype.onClick = function () {
                var agListGui = this.agList.getGui();
                this.popupService.positionPopup(this.eGui, agListGui, false);
                this.hidePopupCallback = this.popupService.addAsModalPopup(agListGui, true);
            };
            AgDropdownList.prototype.getGui = function () {
                return this.eGui;
            };
            AgDropdownList.prototype.setSelected = function (item) {
                this.selectedItem = item;
                this.refreshView();
            };
            AgDropdownList.prototype.setCellRenderer = function (cellRenderer) {
                this.agList.setCellRenderer(cellRenderer);
                this.cellRenderer = cellRenderer;
            };
            AgDropdownList.prototype.refreshView = function () {
                utils.removeAllChildren(this.eValue);
                if (this.selectedItem) {
                    if (this.cellRenderer) {
                        var params = { value: this.selectedItem };
                        utils.useRenderer(this.eValue, this.cellRenderer, params);
                    }
                    else {
                        this.eValue.appendChild(document.createTextNode(this.selectedItem));
                    }
                }
                var eDownIcon = svgFactory.createSmallArrowDownSvg();
                eDownIcon.style.float = 'right';
                eDownIcon.style.marginTop = '6';
                eDownIcon.style.marginRight = '2';
                this.eValue.appendChild(eDownIcon);
            };
            AgDropdownList.prototype.setModel = function (model) {
                this.agList.setModel(model);
            };
            return AgDropdownList;
        })();
        grid.AgDropdownList = AgDropdownList;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../widgets/agList.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../layout/borderLayout.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../widgets/agDropdownList.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var svgFactory = grid.SvgFactory.getInstance();
        var constants = grid.Constants;
        var utils = grid.Utils;
        var ValuesSelectionPanel = (function () {
            function ValuesSelectionPanel(columnController, gridOptionsWrapper, popupService, eventService, dragAndDropService) {
                this.dragAndDropService = dragAndDropService;
                this.popupService = popupService;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.setupComponents();
                this.columnController = columnController;
                eventService.addEventListener(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.columnsChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_VALUE_CHANGE, this.columnsChanged.bind(this));
            }
            ValuesSelectionPanel.prototype.getLayout = function () {
                return this.layout;
            };
            ValuesSelectionPanel.prototype.columnsChanged = function () {
                this.cColumnList.setModel(this.columnController.getValueColumns());
            };
            ValuesSelectionPanel.prototype.addDragSource = function (dragSource) {
                this.cColumnList.addDragSource(dragSource);
            };
            ValuesSelectionPanel.prototype.cellRenderer = function (params) {
                var column = params.value;
                var colDisplayName = this.columnController.getDisplayNameForCol(column);
                var eResult = document.createElement('span');
                var eRemove = utils.createIcon('columnRemoveFromGroup', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
                utils.addCssClass(eRemove, 'ag-visible-icons');
                eResult.appendChild(eRemove);
                var that = this;
                eRemove.addEventListener('click', function () {
                    that.columnController.removeValueColumn(column);
                });
                var agValueType = new grid.AgDropdownList(this.popupService, this.dragAndDropService);
                agValueType.setModel([grid.Column.AGG_SUM, grid.Column.AGG_MIN, grid.Column.AGG_MAX]);
                agValueType.setSelected(column.aggFunc);
                agValueType.setWidth(45);
                agValueType.addItemSelectedListener(function (item) {
                    that.columnController.setColumnAggFunction(column, item);
                });
                eResult.appendChild(agValueType.getGui());
                var eValue = document.createElement('span');
                eValue.innerHTML = colDisplayName;
                eValue.style.paddingLeft = '2px';
                eResult.appendChild(eValue);
                return eResult;
            };
            ValuesSelectionPanel.prototype.setupComponents = function () {
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                var columnsLocalText = localeTextFunc('valueColumns', 'Aggregations');
                var emptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag columns from above to aggregate values');
                this.cColumnList = new grid.AgList(this.dragAndDropService);
                this.cColumnList.setCellRenderer(this.cellRenderer.bind(this));
                this.cColumnList.setEmptyMessage(emptyMessage);
                this.cColumnList.addStyles({ height: '100%', overflow: 'auto' });
                this.cColumnList.addBeforeDropListener(this.beforeDropListener.bind(this));
                this.cColumnList.setReadOnly(true);
                var eNorthPanel = document.createElement('div');
                eNorthPanel.style.paddingTop = '10px';
                eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';
                this.layout = new grid.BorderLayout({
                    center: this.cColumnList.getGui(),
                    north: eNorthPanel
                });
            };
            ValuesSelectionPanel.prototype.beforeDropListener = function (newItem) {
                this.columnController.addValueColumn(newItem);
            };
            return ValuesSelectionPanel;
        })();
        grid.ValuesSelectionPanel = ValuesSelectionPanel;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var VerticalStack = (function () {
            function VerticalStack() {
                this.isLayoutPanel = true;
                this.childPanels = [];
                this.eGui = document.createElement('div');
                this.eGui.style.height = '100%';
            }
            VerticalStack.prototype.addPanel = function (panel, height) {
                var component;
                if (panel.isLayoutPanel) {
                    this.childPanels.push(panel);
                    component = panel.getGui();
                }
                else {
                    component = panel;
                }
                if (height) {
                    component.style.height = height;
                }
                this.eGui.appendChild(component);
            };
            VerticalStack.prototype.getGui = function () {
                return this.eGui;
            };
            VerticalStack.prototype.doLayout = function () {
                for (var i = 0; i < this.childPanels.length; i++) {
                    this.childPanels[i].doLayout();
                }
            };
            return VerticalStack;
        })();
        grid.VerticalStack = VerticalStack;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="./columnSelectionPanel.ts" />
/// <reference path="./groupSelectionPanel.ts" />
/// <reference path="./valuesSelectionPanel.ts" />
/// <reference path="../layout/verticalStack.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var ToolPanel = (function () {
            function ToolPanel() {
                this.layout = new grid.VerticalStack();
            }
            ToolPanel.prototype.init = function (columnController, inMemoryRowController, gridOptionsWrapper, popupService, eventService, dragAndDropService) {
                var suppressGroupAndValues = gridOptionsWrapper.isToolPanelSuppressGroups();
                var suppressValues = gridOptionsWrapper.isToolPanelSuppressValues();
                var showGroups = !suppressGroupAndValues;
                var showValues = !suppressGroupAndValues && !suppressValues;
                // top list, column reorder and visibility
                var columnSelectionPanel = new grid.ColumnSelectionPanel(columnController, gridOptionsWrapper, eventService, dragAndDropService);
                var heightColumnSelection = suppressGroupAndValues ? '100%' : '50%';
                this.layout.addPanel(columnSelectionPanel.layout, heightColumnSelection);
                var dragSource = columnSelectionPanel.getDragSource();
                if (showValues) {
                    var valuesSelectionPanel = new grid.ValuesSelectionPanel(columnController, gridOptionsWrapper, popupService, eventService, dragAndDropService);
                    this.layout.addPanel(valuesSelectionPanel.getLayout(), '25%');
                    valuesSelectionPanel.addDragSource(dragSource);
                }
                if (showGroups) {
                    var groupSelectionPanel = new grid.GroupSelectionPanel(columnController, inMemoryRowController, gridOptionsWrapper, eventService, dragAndDropService);
                    var heightGroupSelection = showValues ? '25%' : '50%';
                    this.layout.addPanel(groupSelectionPanel.layout, heightGroupSelection);
                    groupSelectionPanel.addDragSource(dragSource);
                }
                var eGui = this.layout.getGui();
                utils.addCssClass(eGui, 'ag-tool-panel-container');
            };
            return ToolPanel;
        })();
        grid.ToolPanel = ToolPanel;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="colDef.ts" />
/// <reference path="grid.ts" />
/// <reference path="rendering/rowRenderer.ts" />
/// <reference path="headerRendering/headerRenderer.ts" />
/// <reference path="csvCreator.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid_3) {
        var GridApi = (function () {
            function GridApi(grid, rowRenderer, headerRenderer, filterManager, columnController, inMemoryRowController, selectionController, gridOptionsWrapper, gridPanel, valueService, masterSlaveService, eventService, floatingRowModel) {
                this.grid = grid;
                this.rowRenderer = rowRenderer;
                this.headerRenderer = headerRenderer;
                this.filterManager = filterManager;
                this.columnController = columnController;
                this.inMemoryRowController = inMemoryRowController;
                this.selectionController = selectionController;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.gridPanel = gridPanel;
                this.valueService = valueService;
                this.masterSlaveService = masterSlaveService;
                this.eventService = eventService;
                this.floatingRowModel = floatingRowModel;
                this.csvCreator = new grid_3.CsvCreator(this.inMemoryRowController, this.columnController, this.grid, this.valueService);
            }
            /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
            GridApi.prototype.__getMasterSlaveService = function () {
                return this.masterSlaveService;
            };
            GridApi.prototype.getDataAsCsv = function (params) {
                return this.csvCreator.getDataAsCsv(params);
            };
            GridApi.prototype.exportDataAsCsv = function (params) {
                this.csvCreator.exportDataAsCsv(params);
            };
            GridApi.prototype.setDatasource = function (datasource) {
                this.grid.setDatasource(datasource);
            };
            GridApi.prototype.onNewDatasource = function () {
                console.log('ag-Grid: onNewDatasource deprecated, please use setDatasource()');
                this.grid.setDatasource();
            };
            GridApi.prototype.setRowData = function (rowData) {
                this.grid.setRowData(rowData);
            };
            GridApi.prototype.setRows = function (rows) {
                console.log('ag-Grid: setRows deprecated, please use setRowData()');
                this.grid.setRowData(rows);
            };
            GridApi.prototype.onNewRows = function () {
                console.log('ag-Grid: onNewRows deprecated, please use setRowData()');
                this.grid.setRowData();
            };
            GridApi.prototype.setFloatingTopRowData = function (rows) {
                this.floatingRowModel.setFloatingTopRowData(rows);
                this.gridPanel.onBodyHeightChange();
                this.refreshView();
            };
            GridApi.prototype.setFloatingBottomRowData = function (rows) {
                this.floatingRowModel.setFloatingBottomRowData(rows);
                this.gridPanel.onBodyHeightChange();
                this.refreshView();
            };
            GridApi.prototype.onNewCols = function () {
                console.error("ag-Grid: deprecated, please call setColumnDefs instead providing a list of the defs");
                this.grid.setColumnDefs();
            };
            GridApi.prototype.setColumnDefs = function (colDefs) {
                this.grid.setColumnDefs(colDefs);
            };
            GridApi.prototype.unselectAll = function () {
                console.error("unselectAll deprecated, call deselectAll instead");
                this.deselectAll();
            };
            GridApi.prototype.refreshRows = function (rowNodes) {
                this.rowRenderer.refreshRows(rowNodes);
            };
            GridApi.prototype.refreshCells = function (rowNodes, colIds) {
                this.rowRenderer.refreshCells(rowNodes, colIds);
            };
            GridApi.prototype.rowDataChanged = function (rows) {
                this.rowRenderer.rowDataChanged(rows);
            };
            GridApi.prototype.refreshView = function () {
                this.rowRenderer.refreshView();
            };
            GridApi.prototype.softRefreshView = function () {
                this.rowRenderer.softRefreshView();
            };
            GridApi.prototype.refreshGroupRows = function () {
                this.rowRenderer.refreshGroupRows();
            };
            GridApi.prototype.refreshHeader = function () {
                // need to review this - the refreshHeader should also refresh all icons in the header
                this.headerRenderer.refreshHeader();
                this.headerRenderer.updateFilterIcons();
            };
            GridApi.prototype.isAnyFilterPresent = function () {
                return this.filterManager.isAnyFilterPresent();
            };
            GridApi.prototype.isAdvancedFilterPresent = function () {
                return this.filterManager.isAdvancedFilterPresent();
            };
            GridApi.prototype.isQuickFilterPresent = function () {
                return this.filterManager.isQuickFilterPresent();
            };
            GridApi.prototype.getModel = function () {
                return this.grid.getRowModel();
            };
            GridApi.prototype.onGroupExpandedOrCollapsed = function (refreshFromIndex) {
                this.grid.updateModelAndRefresh(grid_3.Constants.STEP_MAP, refreshFromIndex);
            };
            GridApi.prototype.expandAll = function () {
                this.inMemoryRowController.expandOrCollapseAll(true, null);
                this.grid.updateModelAndRefresh(grid_3.Constants.STEP_MAP);
            };
            GridApi.prototype.collapseAll = function () {
                this.inMemoryRowController.expandOrCollapseAll(false, null);
                this.grid.updateModelAndRefresh(grid_3.Constants.STEP_MAP);
            };
            GridApi.prototype.addVirtualRowListener = function (rowIndex, callback) {
                this.grid.addVirtualRowListener(rowIndex, callback);
            };
            GridApi.prototype.setQuickFilter = function (newFilter) {
                this.grid.onQuickFilterChanged(newFilter);
            };
            GridApi.prototype.selectIndex = function (index, tryMulti, suppressEvents) {
                this.selectionController.selectIndex(index, tryMulti, suppressEvents);
            };
            GridApi.prototype.deselectIndex = function (index, suppressEvents) {
                if (suppressEvents === void 0) { suppressEvents = false; }
                this.selectionController.deselectIndex(index, suppressEvents);
            };
            GridApi.prototype.selectNode = function (node, tryMulti, suppressEvents) {
                if (tryMulti === void 0) { tryMulti = false; }
                if (suppressEvents === void 0) { suppressEvents = false; }
                this.selectionController.selectNode(node, tryMulti, suppressEvents);
            };
            GridApi.prototype.deselectNode = function (node, suppressEvents) {
                if (suppressEvents === void 0) { suppressEvents = false; }
                this.selectionController.deselectNode(node, suppressEvents);
            };
            GridApi.prototype.selectAll = function () {
                this.selectionController.selectAll();
                this.rowRenderer.refreshView();
            };
            GridApi.prototype.deselectAll = function () {
                this.selectionController.deselectAll();
                this.rowRenderer.refreshView();
            };
            GridApi.prototype.recomputeAggregates = function () {
                this.inMemoryRowController.doAggregate();
                this.rowRenderer.refreshGroupRows();
            };
            GridApi.prototype.sizeColumnsToFit = function () {
                if (this.gridOptionsWrapper.isForPrint()) {
                    console.warn('ag-grid: sizeColumnsToFit does not work when forPrint=true');
                    return;
                }
                var availableWidth = this.gridPanel.sizeColumnsToFit();
            };
            GridApi.prototype.showLoadingOverlay = function () {
                this.grid.showLoadingOverlay();
            };
            GridApi.prototype.showNoRowsOverlay = function () {
                this.grid.showNoRowsOverlay();
            };
            GridApi.prototype.hideOverlay = function () {
                this.grid.hideOverlay();
            };
            GridApi.prototype.showLoading = function (show) {
                console.warn('ag-Grid: showLoading is deprecated, please use api.showLoadingOverlay() and api.hideOverlay() instead');
                if (show) {
                    this.grid.showLoadingOverlay();
                }
                else {
                    this.grid.hideOverlay();
                }
            };
            GridApi.prototype.isNodeSelected = function (node) {
                return this.selectionController.isNodeSelected(node);
            };
            GridApi.prototype.getSelectedNodesById = function () {
                return this.selectionController.getSelectedNodesById();
            };
            GridApi.prototype.getSelectedNodes = function () {
                return this.selectionController.getSelectedNodes();
            };
            GridApi.prototype.getSelectedRows = function () {
                return this.selectionController.getSelectedRows();
            };
            GridApi.prototype.getBestCostNodeSelection = function () {
                return this.selectionController.getBestCostNodeSelection();
            };
            GridApi.prototype.getRenderedNodes = function () {
                return this.rowRenderer.getRenderedNodes();
            };
            GridApi.prototype.ensureColIndexVisible = function (index) {
                this.gridPanel.ensureColIndexVisible(index);
            };
            GridApi.prototype.ensureIndexVisible = function (index) {
                this.gridPanel.ensureIndexVisible(index);
            };
            GridApi.prototype.ensureNodeVisible = function (comparator) {
                this.grid.ensureNodeVisible(comparator);
            };
            GridApi.prototype.forEachInMemory = function (callback) {
                console.warn('ag-Grid: please use forEachNode instead of forEachInMemory, method is same, I just renamed it, forEachInMemory is deprecated');
                this.forEachNode(callback);
            };
            GridApi.prototype.forEachNode = function (callback) {
                this.grid.getRowModel().forEachNode(callback);
            };
            GridApi.prototype.forEachNodeAfterFilter = function (callback) {
                this.grid.getRowModel().forEachNodeAfterFilter(callback);
            };
            GridApi.prototype.forEachNodeAfterFilterAndSort = function (callback) {
                this.grid.getRowModel().forEachNodeAfterFilterAndSort(callback);
            };
            GridApi.prototype.getFilterApiForColDef = function (colDef) {
                console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
                return this.getFilterApi(colDef);
            };
            GridApi.prototype.getFilterApi = function (key) {
                var column = this.columnController.getColumn(key);
                return this.filterManager.getFilterApi(column);
            };
            GridApi.prototype.getColumnDef = function (key) {
                var column = this.columnController.getColumn(key);
                if (column) {
                    return column.getColDef();
                }
                else {
                    return null;
                }
            };
            GridApi.prototype.onFilterChanged = function () {
                this.grid.onFilterChanged();
            };
            GridApi.prototype.setSortModel = function (sortModel) {
                this.grid.setSortModel(sortModel);
            };
            GridApi.prototype.getSortModel = function () {
                return this.grid.getSortModel();
            };
            GridApi.prototype.setFilterModel = function (model) {
                this.filterManager.setFilterModel(model);
            };
            GridApi.prototype.getFilterModel = function () {
                return this.grid.getFilterModel();
            };
            GridApi.prototype.getFocusedCell = function () {
                return this.rowRenderer.getFocusedCell();
            };
            GridApi.prototype.setFocusedCell = function (rowIndex, colIndex) {
                this.grid.setFocusedCell(rowIndex, colIndex);
            };
            GridApi.prototype.setHeaderHeight = function (headerHeight) {
                this.gridOptionsWrapper.setHeaderHeight(headerHeight);
                this.gridPanel.onBodyHeightChange();
            };
            GridApi.prototype.showToolPanel = function (show) {
                this.grid.showToolPanel(show);
            };
            GridApi.prototype.isToolPanelShowing = function () {
                return this.grid.isToolPanelShowing();
            };
            GridApi.prototype.doLayout = function () {
                this.grid.doLayout();
            };
            GridApi.prototype.getValue = function (colDef, data, node) {
                return this.valueService.getValue(colDef, data, node);
            };
            GridApi.prototype.addEventListener = function (eventType, listener) {
                this.eventService.addEventListener(eventType, listener);
            };
            GridApi.prototype.addGlobalListener = function (listener) {
                this.eventService.addGlobalListener(listener);
            };
            GridApi.prototype.removeEventListener = function (eventType, listener) {
                this.eventService.removeEventListener(eventType, listener);
            };
            GridApi.prototype.removeGlobalListener = function (listener) {
                this.eventService.removeGlobalListener(listener);
            };
            GridApi.prototype.dispatchEvent = function (eventType, event) {
                this.eventService.dispatchEvent(eventType, event);
            };
            GridApi.prototype.refreshRowGroup = function () {
                this.grid.refreshRowGroup();
            };
            GridApi.prototype.destroy = function () {
                this.grid.destroy();
            };
            return GridApi;
        })();
        grid_3.GridApi = GridApi;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="gridOptionsWrapper.ts" />
/// <reference path="expressionService.ts" />
/// <reference path="columnController/columnController.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var ValueService = (function () {
            function ValueService() {
            }
            ValueService.prototype.init = function (gridOptionsWrapper, expressionService, columnController) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.expressionService = expressionService;
                this.columnController = columnController;
            };
            ValueService.prototype.getValue = function (colDef, data, node) {
                var cellExpressions = this.gridOptionsWrapper.isEnableCellExpressions();
                var field = colDef.field;
                var result;
                // if there is a value getter, this gets precedence over a field
                if (colDef.valueGetter) {
                    result = this.executeValueGetter(colDef.valueGetter, data, colDef, node);
                }
                else if (field && data) {
                    result = this.getValueUsingField(data, field);
                }
                else {
                    result = undefined;
                }
                // the result could be an expression itself, if we are allowing cell values to be expressions
                if (cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
                    var cellValueGetter = result.substring(1);
                    result = this.executeValueGetter(cellValueGetter, data, colDef, node);
                }
                return result;
            };
            ValueService.prototype.getValueUsingField = function (data, field) {
                if (!field || !data) {
                    return;
                }
                // if no '.', then it's not a deep value
                if (field.indexOf('.') < 0) {
                    return data[field];
                }
                else {
                    // otherwise it is a deep value, so need to dig for it
                    var fields = field.split('.');
                    var currentObject = data;
                    for (var i = 0; i < fields.length; i++) {
                        currentObject = currentObject[fields[i]];
                        if (!currentObject) {
                            return null;
                        }
                    }
                    return currentObject;
                }
            };
            ValueService.prototype.executeValueGetter = function (valueGetter, data, colDef, node) {
                var context = this.gridOptionsWrapper.getContext();
                var api = this.gridOptionsWrapper.getApi();
                var params = {
                    data: data,
                    node: node,
                    colDef: colDef,
                    api: api,
                    context: context,
                    getValue: this.getValueCallback.bind(this, data, node)
                };
                if (typeof valueGetter === 'function') {
                    // valueGetter is a function, so just call it
                    return valueGetter(params);
                }
                else if (typeof valueGetter === 'string') {
                    // valueGetter is an expression, so execute the expression
                    return this.expressionService.evaluate(valueGetter, params);
                }
            };
            ValueService.prototype.getValueCallback = function (data, node, field) {
                var otherColumn = this.columnController.getColumn(field);
                if (otherColumn) {
                    return this.getValue(otherColumn.getColDef(), data, node);
                }
                else {
                    return null;
                }
            };
            return ValueService;
        })();
        grid.ValueService = ValueService;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path='../entities/colDef.ts'/>
/// <reference path='../entities/column.ts'/>
/// <reference path='../entities/originalColumnGroup.ts'/>
/// <reference path='../logger.ts'/>
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var constants = grid.Constants;
        // takes in a list of columns, as specified by the column definitions, and returns column groups
        var ColumnUtils = (function () {
            function ColumnUtils() {
            }
            ColumnUtils.prototype.init = function (gridOptionsWrapper) {
                this.gridOptionsWrapper = gridOptionsWrapper;
            };
            ColumnUtils.prototype.calculateColInitialWidth = function (colDef) {
                if (!colDef.width) {
                    // if no width defined in colDef, use default
                    return this.gridOptionsWrapper.getColWidth();
                }
                else if (colDef.width < constants.MIN_COL_WIDTH) {
                    // if width in col def to small, set to min width
                    return constants.MIN_COL_WIDTH;
                }
                else {
                    // otherwise use the provided width
                    return colDef.width;
                }
            };
            ColumnUtils.prototype.deptFirstAllColumnTreeSearch = function (tree, callback) {
                var _this = this;
                if (!tree) {
                    return;
                }
                tree.forEach(function (child) {
                    if (child instanceof grid.ColumnGroup) {
                        _this.deptFirstAllColumnTreeSearch(child.getChildren(), callback);
                    }
                    callback(child);
                });
            };
            ColumnUtils.prototype.deptFirstDisplayedColumnTreeSearch = function (tree, callback) {
                var _this = this;
                if (!tree) {
                    return;
                }
                tree.forEach(function (child) {
                    if (child instanceof grid.ColumnGroup) {
                        _this.deptFirstDisplayedColumnTreeSearch(child.getDisplayedChildren(), callback);
                    }
                    callback(child);
                });
            };
            return ColumnUtils;
        })();
        grid.ColumnUtils = ColumnUtils;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="constants.ts" />
/// <reference path="rowControllers/floatingRowModel.ts" />
/// <reference path="gridOptionsWrapper.ts" />
/// <reference path="utils.ts" />
/// <reference path="filter/filterManager.ts" />
/// <reference path="columnController/columnController.ts" />
/// <reference path="columnController/balancedColumnTreeBuilder.ts" />
/// <reference path="headerRendering/headerTemplateLoader.ts" />
/// <reference path="selectionController.ts" />
/// <reference path="selectionRendererFactory.ts" />
/// <reference path="rendering/rowRenderer.ts" />
/// <reference path="headerRendering/headerRenderer.ts" />
/// <reference path="rowControllers/inMemoryRowController.ts" />
/// <reference path="rowControllers/virtualPageRowController.ts" />
/// <reference path="rowControllers/paginationController.ts" />
/// <reference path="expressionService.ts" />
/// <reference path="templateService.ts" />
/// <reference path="gridPanel/gridPanel.ts" />
/// <reference path="toolPanel/toolPanel.ts" />
/// <reference path="widgets/agPopupService.ts" />
/// <reference path="entities/gridOptions.ts" />
/// <reference path="gridApi.ts" />
/// <reference path="valueService.ts" />
/// <reference path="masterSlaveService.ts" />
/// <reference path="logger.ts" />
/// <reference path="eventService.ts" />
/// <reference path="columnController/columnUtils.ts" />
/// <reference path="dragAndDrop/dragAndDropService.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var Grid = (function () {
            function Grid(eGridDiv, gridOptions, globalEventListener, $scope, $compile, quickFilterOnScope) {
                if (globalEventListener === void 0) { globalEventListener = null; }
                if ($scope === void 0) { $scope = null; }
                if ($compile === void 0) { $compile = null; }
                if (quickFilterOnScope === void 0) { quickFilterOnScope = null; }
                this.virtualRowCallbacks = {};
                if (!eGridDiv) {
                    console.warn('ag-Grid: no div element provided to the grid');
                }
                if (!gridOptions) {
                    console.warn('ag-Grid: no gridOptions provided to the grid');
                }
                this.gridOptions = gridOptions;
                this.setupComponents($scope, $compile, eGridDiv, globalEventListener);
                this.gridOptions.api = new grid.GridApi(this, this.rowRenderer, this.headerRenderer, this.filterManager, this.columnController, this.inMemoryRowController, this.selectionController, this.gridOptionsWrapper, this.gridPanel, this.valueService, this.masterSlaveService, this.eventService, this.floatingRowModel);
                this.gridOptions.columnApi = this.columnController.getColumnApi();
                var that = this;
                // if using angular, watch for quickFilter changes
                if ($scope) {
                    $scope.$watch(quickFilterOnScope, function (newFilter) {
                        that.onQuickFilterChanged(newFilter);
                    });
                }
                if (!this.gridOptionsWrapper.isForPrint()) {
                    this.addWindowResizeListener();
                }
                this.inMemoryRowController.setAllRows(this.gridOptionsWrapper.getRowData());
                this.setupColumns();
                this.updateModelAndRefresh(grid.Constants.STEP_EVERYTHING);
                this.decideStartingOverlay();
                // if datasource provided, use it
                if (this.gridOptionsWrapper.getDatasource()) {
                    this.setDatasource();
                }
                this.doLayout();
                this.finished = false;
                this.periodicallyDoLayout();
                // if ready function provided, use it
                var readyParams = { api: gridOptions.api };
                this.eventService.dispatchEvent(grid.Events.EVENT_READY, readyParams);
                this.logger.log('initialised');
            }
            Grid.prototype.decideStartingOverlay = function () {
                // if not virtual paging, then we might need to show an overlay if no data
                var notDoingVirtualPaging = !this.gridOptionsWrapper.isVirtualPaging();
                if (notDoingVirtualPaging) {
                    var showLoading = !this.gridOptionsWrapper.getRowData();
                    var showNoData = this.gridOptionsWrapper.getRowData() && this.gridOptionsWrapper.getRowData().length == 0;
                    if (showLoading) {
                        this.showLoadingOverlay();
                    }
                    if (showNoData) {
                        this.showNoRowsOverlay();
                    }
                }
            };
            Grid.prototype.addWindowResizeListener = function () {
                var that = this;
                // putting this into a function, so when we remove the function,
                // we are sure we are removing the exact same function (i'm not
                // sure what 'bind' does to the function reference, if it's safe
                // the result from 'bind').
                this.windowResizeListener = function resizeListener() {
                    that.doLayout();
                };
                window.addEventListener('resize', this.windowResizeListener);
            };
            Grid.prototype.getRowModel = function () {
                return this.rowModel;
            };
            Grid.prototype.periodicallyDoLayout = function () {
                if (!this.finished) {
                    var that = this;
                    setTimeout(function () {
                        that.doLayout();
                        that.gridPanel.periodicallyCheck();
                        that.periodicallyDoLayout();
                    }, 500);
                }
            };
            Grid.prototype.setupComponents = function ($scope, $compile, eUserProvidedDiv, globalEventListener) {
                this.eUserProvidedDiv = eUserProvidedDiv;
                // create all the beans
                var headerTemplateLoader = new grid.HeaderTemplateLoader();
                var floatingRowModel = new grid.FloatingRowModel();
                var balancedColumnTreeBuilder = new grid.BalancedColumnTreeBuilder();
                var displayedGroupCreator = new grid.DisplayedGroupCreator();
                var eventService = new grid.EventService();
                var gridOptionsWrapper = new grid.GridOptionsWrapper();
                var selectionController = new grid.SelectionController();
                var filterManager = new grid.FilterManager();
                var selectionRendererFactory = new grid.SelectionRendererFactory();
                var columnController = new grid.ColumnController();
                var rowRenderer = new grid.RowRenderer();
                var headerRenderer = new grid.HeaderRenderer();
                var inMemoryRowController = new grid.InMemoryRowController();
                var virtualPageRowController = new grid.VirtualPageRowController();
                var expressionService = new grid.ExpressionService();
                var templateService = new grid.TemplateService();
                var gridPanel = new grid.GridPanel();
                var popupService = new grid.PopupService();
                var valueService = new grid.ValueService();
                var groupCreator = new grid.GroupCreator();
                var masterSlaveService = new grid.MasterSlaveService();
                var loggerFactory = new grid.LoggerFactory();
                var dragAndDropService = new grid.DragAndDropService();
                var columnUtils = new grid.ColumnUtils();
                var autoWidthCalculator = new grid.AutoWidthCalculator();
                // initialise all the beans
                gridOptionsWrapper.init(this.gridOptions, eventService);
                loggerFactory.init(gridOptionsWrapper);
                this.logger = loggerFactory.create('Grid');
                this.logger.log('initialising');
                headerTemplateLoader.init(gridOptionsWrapper);
                floatingRowModel.init(gridOptionsWrapper);
                columnUtils.init(gridOptionsWrapper);
                autoWidthCalculator.init(rowRenderer, gridPanel);
                dragAndDropService.init(loggerFactory);
                eventService.init(loggerFactory);
                gridPanel.init(gridOptionsWrapper, columnController, rowRenderer, masterSlaveService, loggerFactory, floatingRowModel);
                templateService.init($scope);
                expressionService.init(loggerFactory);
                selectionController.init(this, gridPanel, gridOptionsWrapper, $scope, rowRenderer, eventService);
                filterManager.init(this, gridOptionsWrapper, $compile, $scope, columnController, popupService, valueService);
                selectionRendererFactory.init(this, selectionController);
                balancedColumnTreeBuilder.init(gridOptionsWrapper, loggerFactory, columnUtils);
                displayedGroupCreator.init(columnUtils);
                columnController.init(this, selectionRendererFactory, gridOptionsWrapper, expressionService, valueService, masterSlaveService, eventService, balancedColumnTreeBuilder, displayedGroupCreator, columnUtils, autoWidthCalculator, loggerFactory);
                rowRenderer.init(columnController, gridOptionsWrapper, gridPanel, this, selectionRendererFactory, $compile, $scope, selectionController, expressionService, templateService, valueService, eventService, floatingRowModel);
                headerRenderer.init(gridOptionsWrapper, columnController, gridPanel, this, filterManager, $scope, $compile, headerTemplateLoader);
                inMemoryRowController.init(gridOptionsWrapper, columnController, this, filterManager, $scope, groupCreator, valueService, eventService);
                virtualPageRowController.init(rowRenderer, gridOptionsWrapper, this);
                valueService.init(gridOptionsWrapper, expressionService, columnController);
                groupCreator.init(valueService, gridOptionsWrapper);
                masterSlaveService.init(gridOptionsWrapper, columnController, gridPanel, loggerFactory, eventService);
                if (globalEventListener) {
                    eventService.addGlobalListener(globalEventListener);
                }
                var toolPanelLayout = null;
                var toolPanel = null;
                if (!gridOptionsWrapper.isForPrint()) {
                    toolPanel = new grid.ToolPanel();
                    toolPanelLayout = toolPanel.layout;
                    toolPanel.init(columnController, inMemoryRowController, gridOptionsWrapper, popupService, eventService, dragAndDropService);
                }
                // this is a child bean, get a reference and pass it on
                // CAN WE DELETE THIS? it's done in the setDatasource section
                var rowModel = inMemoryRowController.getModel();
                selectionController.setRowModel(rowModel);
                filterManager.setRowModel(rowModel);
                rowRenderer.setRowModel(rowModel);
                gridPanel.setRowModel(rowModel);
                // and the last bean, done in it's own section, as it's optional
                var paginationController = null;
                var paginationGui = null;
                if (!gridOptionsWrapper.isForPrint()) {
                    paginationController = new grid.PaginationController();
                    paginationController.init(this, gridOptionsWrapper);
                    paginationGui = paginationController.getGui();
                }
                this.rowModel = rowModel;
                this.usingInMemoryModel = true;
                this.selectionController = selectionController;
                this.columnController = columnController;
                this.inMemoryRowController = inMemoryRowController;
                this.virtualPageRowController = virtualPageRowController;
                this.rowRenderer = rowRenderer;
                this.headerRenderer = headerRenderer;
                this.paginationController = paginationController;
                this.filterManager = filterManager;
                this.toolPanel = toolPanel;
                this.gridPanel = gridPanel;
                this.valueService = valueService;
                this.masterSlaveService = masterSlaveService;
                this.eventService = eventService;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.dragAndDropService = dragAndDropService;
                this.floatingRowModel = floatingRowModel;
                this.eRootPanel = new grid.BorderLayout({
                    center: gridPanel.getLayout(),
                    east: toolPanelLayout,
                    south: paginationGui,
                    dontFill: gridOptionsWrapper.isForPrint(),
                    name: 'eRootPanel'
                });
                popupService.init(this.eRootPanel.getGui());
                // default is we don't show paging panel, this is set to true when datasource is set
                this.eRootPanel.setSouthVisible(false);
                // see what the grid options are for default of toolbar
                this.showToolPanel(gridOptionsWrapper.isShowToolPanel());
                eUserProvidedDiv.appendChild(this.eRootPanel.getGui());
                this.logger.log('grid DOM added');
                eventService.addEventListener(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_GROUP_OPENED, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_MOVED, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_RESIZED, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_VALUE_CHANGE, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_VISIBLE, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_PINNED, this.onColumnChanged.bind(this));
            };
            Grid.prototype.onColumnChanged = function (event) {
                if (event.isRowGroupChanged()) {
                    this.inMemoryRowController.onRowGroupChanged();
                }
                if (event.isValueChanged()) {
                    this.inMemoryRowController.doAggregate();
                }
                if (event.isIndividualColumnResized()) {
                    this.onIndividualColumnResized(event.getColumn());
                }
                else {
                    this.refreshHeaderAndBody();
                }
                this.gridPanel.showPinnedColContainersIfNeeded();
            };
            Grid.prototype.refreshRowGroup = function () {
                this.inMemoryRowController.onRowGroupChanged();
                this.refreshHeaderAndBody();
            };
            Grid.prototype.onIndividualColumnResized = function (column) {
                this.headerRenderer.onIndividualColumnResized(column);
                this.rowRenderer.onIndividualColumnResized(column);
                if (column.isPinned()) {
                    this.updatePinnedColContainerWidthAfterColResize();
                }
                else {
                    this.updateBodyContainerWidthAfterColResize();
                }
            };
            Grid.prototype.showToolPanel = function (show) {
                if (!this.toolPanel) {
                    this.toolPanelShowing = false;
                    return;
                }
                this.toolPanelShowing = show;
                this.eRootPanel.setEastVisible(show);
            };
            Grid.prototype.isToolPanelShowing = function () {
                return this.toolPanelShowing;
            };
            Grid.prototype.isUsingInMemoryModel = function () {
                return this.usingInMemoryModel;
            };
            Grid.prototype.setDatasource = function (datasource) {
                // if datasource provided, then set it
                if (datasource) {
                    this.gridOptions.datasource = datasource;
                }
                // get the set datasource (if null was passed to this method,
                // then need to get the actual datasource from options
                var datasourceToUse = this.gridOptionsWrapper.getDatasource();
                this.doingVirtualPaging = this.gridOptionsWrapper.isVirtualPaging() && datasourceToUse;
                this.doingPagination = datasourceToUse && !this.doingVirtualPaging;
                var showPagingPanel;
                if (this.doingVirtualPaging) {
                    this.paginationController.setDatasource(null);
                    this.virtualPageRowController.setDatasource(datasourceToUse);
                    this.rowModel = this.virtualPageRowController.getModel();
                    this.usingInMemoryModel = false;
                    showPagingPanel = false;
                }
                else if (this.doingPagination) {
                    this.paginationController.setDatasource(datasourceToUse);
                    this.virtualPageRowController.setDatasource(null);
                    this.rowModel = this.inMemoryRowController.getModel();
                    this.usingInMemoryModel = true;
                    showPagingPanel = true;
                }
                else {
                    this.paginationController.setDatasource(null);
                    this.virtualPageRowController.setDatasource(null);
                    this.rowModel = this.inMemoryRowController.getModel();
                    this.usingInMemoryModel = true;
                    showPagingPanel = false;
                }
                this.selectionController.setRowModel(this.rowModel);
                this.filterManager.setRowModel(this.rowModel);
                this.rowRenderer.setRowModel(this.rowModel);
                this.gridPanel.setRowModel(this.rowModel);
                this.eRootPanel.setSouthVisible(showPagingPanel);
                // because we just set the rowModel, need to update the gui
                this.rowRenderer.refreshView();
                this.doLayout();
            };
            // gets called after columns are shown / hidden from groups expanding
            Grid.prototype.refreshHeaderAndBody = function () {
                this.headerRenderer.refreshHeader();
                this.headerRenderer.updateFilterIcons();
                this.headerRenderer.updateSortIcons();
                this.headerRenderer.setPinnedColContainerWidth();
                this.gridPanel.setBodyContainerWidth();
                this.gridPanel.setPinnedColContainerWidth();
                this.rowRenderer.refreshView();
            };
            Grid.prototype.destroy = function () {
                if (this.windowResizeListener) {
                    window.removeEventListener('resize', this.windowResizeListener);
                    this.logger.log('Removing windowResizeListener');
                }
                this.finished = true;
                this.dragAndDropService.destroy();
                this.eUserProvidedDiv.removeChild(this.eRootPanel.getGui());
                this.logger.log('Grid DOM removed');
            };
            Grid.prototype.onQuickFilterChanged = function (newFilter) {
                var actuallyChanged = this.filterManager.setQuickFilter(newFilter);
                if (actuallyChanged) {
                    this.onFilterChanged();
                }
            };
            Grid.prototype.onFilterModified = function () {
                this.eventService.dispatchEvent(grid.Events.EVENT_FILTER_MODIFIED);
            };
            Grid.prototype.onFilterChanged = function () {
                this.eventService.dispatchEvent(grid.Events.EVENT_BEFORE_FILTER_CHANGED);
                this.filterManager.onFilterChanged();
                this.headerRenderer.updateFilterIcons();
                if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
                    // if doing server side filtering, changing the sort has the impact
                    // of resetting the datasource
                    this.setDatasource();
                }
                else {
                    // if doing in memory filtering, we just update the in memory data
                    this.updateModelAndRefresh(grid.Constants.STEP_FILTER);
                }
                this.eventService.dispatchEvent(grid.Events.EVENT_AFTER_FILTER_CHANGED);
            };
            Grid.prototype.onRowClicked = function (multiSelectKeyPressed, rowIndex, node) {
                // we do not allow selecting groups by clicking (as the click here expands the group)
                // so return if it's a group row
                if (node.group) {
                    return;
                }
                // we also don't allow selection of floating rows
                if (node.floating) {
                    return;
                }
                // making local variables to make the below more readable
                var gridOptionsWrapper = this.gridOptionsWrapper;
                var selectionController = this.selectionController;
                // if no selection method enabled, do nothing
                if (!gridOptionsWrapper.isRowSelection()) {
                    return;
                }
                // if click selection suppressed, do nothing
                if (gridOptionsWrapper.isSuppressRowClickSelection()) {
                    return;
                }
                var doDeselect = multiSelectKeyPressed
                    && selectionController.isNodeSelected(node)
                    && gridOptionsWrapper.isRowDeselection();
                if (doDeselect) {
                    selectionController.deselectNode(node);
                }
                else {
                    selectionController.selectNode(node, multiSelectKeyPressed);
                }
            };
            Grid.prototype.showLoadingOverlay = function () {
                this.gridPanel.showLoadingOverlay();
            };
            Grid.prototype.showNoRowsOverlay = function () {
                this.gridPanel.showNoRowsOverlay();
            };
            Grid.prototype.hideOverlay = function () {
                this.gridPanel.hideOverlay();
            };
            Grid.prototype.setupColumns = function () {
                this.columnController.onColumnsChanged();
                this.gridPanel.showPinnedColContainersIfNeeded();
                this.gridPanel.onBodyHeightChange();
            };
            // rowsToRefresh is at what index to start refreshing the rows. the assumption is
            // if we are expanding or collapsing a group, then only he rows below the group
            // need to be refresh. this allows the context (eg focus) of the other cells to
            // remain.
            Grid.prototype.updateModelAndRefresh = function (step, refreshFromIndex) {
                this.inMemoryRowController.updateModel(step);
                this.rowRenderer.refreshView(refreshFromIndex);
            };
            Grid.prototype.setRowData = function (rows, firstId) {
                if (rows) {
                    this.gridOptions.rowData = rows;
                }
                var rowData = this.gridOptionsWrapper.getRowData();
                this.inMemoryRowController.setAllRows(rowData, firstId);
                this.selectionController.deselectAll();
                this.filterManager.onNewRowsLoaded();
                this.updateModelAndRefresh(grid.Constants.STEP_EVERYTHING);
                this.headerRenderer.updateFilterIcons();
                if (rowData && rowData.length > 0) {
                    this.hideOverlay();
                }
                else {
                    this.showNoRowsOverlay();
                }
            };
            Grid.prototype.ensureNodeVisible = function (comparator) {
                if (this.doingVirtualPaging) {
                    throw 'Cannot use ensureNodeVisible when doing virtual paging, as we cannot check rows that are not in memory';
                }
                // look for the node index we want to display
                var rowCount = this.rowModel.getVirtualRowCount();
                var comparatorIsAFunction = typeof comparator === 'function';
                var indexToSelect = -1;
                // go through all the nodes, find the one we want to show
                for (var i = 0; i < rowCount; i++) {
                    var node = this.rowModel.getVirtualRow(i);
                    if (comparatorIsAFunction) {
                        if (comparator(node)) {
                            indexToSelect = i;
                            break;
                        }
                    }
                    else {
                        // check object equality against node and data
                        if (comparator === node || comparator === node.data) {
                            indexToSelect = i;
                            break;
                        }
                    }
                }
                if (indexToSelect >= 0) {
                    this.gridPanel.ensureIndexVisible(indexToSelect);
                }
            };
            Grid.prototype.getFilterModel = function () {
                return this.filterManager.getFilterModel();
            };
            Grid.prototype.setFocusedCell = function (rowIndex, colIndex) {
                this.gridPanel.ensureIndexVisible(rowIndex);
                this.gridPanel.ensureColIndexVisible(colIndex);
                var that = this;
                setTimeout(function () {
                    that.rowRenderer.setFocusedCell(rowIndex, colIndex);
                }, 10);
            };
            Grid.prototype.getSortModel = function () {
                var allColumns = this.columnController.getAllColumns();
                var columnsWithSorting = [];
                var i;
                for (i = 0; i < allColumns.length; i++) {
                    if (allColumns[i].getSort()) {
                        columnsWithSorting.push(allColumns[i]);
                    }
                }
                columnsWithSorting.sort(function (a, b) {
                    return a.sortedAt - b.sortedAt;
                });
                var result = [];
                for (i = 0; i < columnsWithSorting.length; i++) {
                    var resultEntry = {
                        colId: columnsWithSorting[i].colId,
                        sort: columnsWithSorting[i].sort
                    };
                    result.push(resultEntry);
                }
                return result;
            };
            Grid.prototype.setSortModel = function (sortModel) {
                if (!this.gridOptionsWrapper.isEnableSorting()) {
                    console.warn('ag-grid: You are setting the sort model on a grid that does not have sorting enabled');
                    return;
                }
                // first up, clear any previous sort
                var sortModelProvided = sortModel !== null && sortModel !== undefined && sortModel.length > 0;
                var allColumns = this.columnController.getAllColumns();
                for (var i = 0; i < allColumns.length; i++) {
                    var column = allColumns[i];
                    var sortForCol = null;
                    var sortedAt = -1;
                    if (sortModelProvided && !column.getColDef().suppressSorting) {
                        for (var j = 0; j < sortModel.length; j++) {
                            var sortModelEntry = sortModel[j];
                            if (typeof sortModelEntry.colId === 'string'
                                && typeof column.getColId() === 'string'
                                && sortModelEntry.colId === column.getColId()) {
                                sortForCol = sortModelEntry.sort;
                                sortedAt = j;
                            }
                        }
                    }
                    if (sortForCol) {
                        column.setSort(sortForCol);
                        column.setSortedAt(sortedAt);
                    }
                    else {
                        column.setSort(null);
                        column.setSortedAt(null);
                    }
                }
                this.onSortingChanged();
            };
            Grid.prototype.onSortingChanged = function () {
                this.eventService.dispatchEvent(grid.Events.EVENT_BEFORE_SORT_CHANGED);
                this.headerRenderer.updateSortIcons();
                if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
                    // if doing server side sorting, changing the sort has the impact
                    // of resetting the datasource
                    this.setDatasource();
                }
                else {
                    // if doing in memory sorting, we just update the in memory data
                    this.updateModelAndRefresh(grid.Constants.STEP_SORT);
                }
                this.eventService.dispatchEvent(grid.Events.EVENT_AFTER_SORT_CHANGED);
            };
            Grid.prototype.addVirtualRowListener = function (rowIndex, callback) {
                if (!this.virtualRowCallbacks[rowIndex]) {
                    this.virtualRowCallbacks[rowIndex] = [];
                }
                this.virtualRowCallbacks[rowIndex].push(callback);
            };
            Grid.prototype.onVirtualRowSelected = function (rowIndex, selected) {
                // inform the callbacks of the event
                if (this.virtualRowCallbacks[rowIndex]) {
                    this.virtualRowCallbacks[rowIndex].forEach(function (callback) {
                        if (typeof callback.rowSelected === 'function') {
                            callback.rowSelected(selected);
                        }
                    });
                }
                this.rowRenderer.onRowSelected(rowIndex, selected);
            };
            Grid.prototype.onVirtualRowRemoved = function (rowIndex) {
                // inform the callbacks of the event
                if (this.virtualRowCallbacks[rowIndex]) {
                    this.virtualRowCallbacks[rowIndex].forEach(function (callback) {
                        if (typeof callback.rowRemoved === 'function') {
                            callback.rowRemoved();
                        }
                    });
                }
                // remove the callbacks
                delete this.virtualRowCallbacks[rowIndex];
            };
            Grid.prototype.setColumnDefs = function (colDefs) {
                if (colDefs) {
                    this.gridOptions.columnDefs = colDefs;
                }
                this.setupColumns();
                this.updateModelAndRefresh(grid.Constants.STEP_EVERYTHING);
                // found that adding pinned column can upset the layout
                this.doLayout();
            };
            Grid.prototype.updateBodyContainerWidthAfterColResize = function () {
                this.rowRenderer.setMainRowWidths();
                this.gridPanel.setBodyContainerWidth();
            };
            Grid.prototype.updatePinnedColContainerWidthAfterColResize = function () {
                this.gridPanel.setPinnedColContainerWidth();
                this.headerRenderer.setPinnedColContainerWidth();
            };
            Grid.prototype.doLayout = function () {
                // need to do layout first, as drawVirtualRows and setPinnedColHeight
                // need to know the result of the resizing of the panels.
                var sizeChanged = this.eRootPanel.doLayout();
                // both of the two below should be done in gridPanel, the gridPanel should register 'resize' to the panel
                if (sizeChanged) {
                    this.rowRenderer.drawVirtualRows();
                    var event = {
                        clientWidth: this.eRootPanel.getGui().clientWidth,
                        clientHeight: this.eRootPanel.getGui().clientHeight
                    };
                    this.eventService.dispatchEvent(grid.Events.EVENT_GRID_SIZE_CHANGED, event);
                }
            };
            return Grid;
        })();
        grid.Grid = Grid;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var ComponentUtil = (function () {
            function ComponentUtil() {
            }
            ComponentUtil.copyAttributesToGridOptions = function (gridOptions, component) {
                // create empty grid options if none were passed
                if (typeof gridOptions !== 'object') {
                    gridOptions = {};
                }
                // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
                var pGridOptions = gridOptions;
                // add in all the simple properties
                ComponentUtil.SIMPLE_PROPERTIES.concat(ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES).forEach(function (key) {
                    if (typeof (component)[key] !== 'undefined') {
                        pGridOptions[key] = component[key];
                    }
                });
                ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES.concat(ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES).forEach(function (key) {
                    if (typeof (component)[key] !== 'undefined') {
                        pGridOptions[key] = ComponentUtil.toBoolean(component[key]);
                    }
                });
                ComponentUtil.SIMPLE_NUMBER_PROPERTIES.concat(ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES).forEach(function (key) {
                    if (typeof (component)[key] !== 'undefined') {
                        pGridOptions[key] = ComponentUtil.toNumber(component[key]);
                    }
                });
                return gridOptions;
            };
            ComponentUtil.processOnChange = function (changes, gridOptions, component) {
                if (!component._initialised || !changes) {
                    return;
                }
                // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
                //var pThis = <any>this;
                var pGridOptions = gridOptions;
                // check if any change for the simple types, and if so, then just copy in the new value
                ComponentUtil.SIMPLE_PROPERTIES.forEach(function (key) {
                    if (changes[key]) {
                        pGridOptions[key] = changes[key].currentValue;
                    }
                });
                ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES.forEach(function (key) {
                    if (changes[key]) {
                        pGridOptions[key] = ComponentUtil.toBoolean(changes[key].currentValue);
                    }
                });
                ComponentUtil.SIMPLE_NUMBER_PROPERTIES.forEach(function (key) {
                    if (changes[key]) {
                        pGridOptions[key] = ComponentUtil.toNumber(changes[key].currentValue);
                    }
                });
                if (changes.showToolPanel) {
                    component.api.showToolPanel(component.showToolPanel);
                }
                if (changes.quickFilterText) {
                    component.api.setQuickFilter(component.quickFilterText);
                }
                if (changes.rowData) {
                    component.api.setRowData(component.rowData);
                }
                if (changes.floatingTopRowData) {
                    component.api.setFloatingTopRowData(component.floatingTopRowData);
                }
                if (changes.floatingBottomRowData) {
                    component.api.setFloatingBottomRowData(component.floatingBottomRowData);
                }
                if (changes.columnDefs) {
                    component.api.setColumnDefs(component.columnDefs);
                }
                if (changes.datasource) {
                    component.api.setDatasource(component.datasource);
                }
                if (changes.pinnedColumnCount) {
                    component.columnApi.setPinnedColumnCount(component.pinnedColumnCount);
                }
                if (changes.pinnedColumnCount) {
                    component.columnApi.setPinnedColumnCount(component.pinnedColumnCount);
                }
                if (changes.headerHeight) {
                    component.api.setHeaderHeight(component.headerHeight);
                }
                // need to review this, it is not impacting anything, they should
                // call something on the API to update the grid
                if (changes.groupAggFunction) {
                    component.gridOptions.groupAggFunction = component.groupAggFunction;
                }
            };
            ComponentUtil.toBoolean = function (value) {
                if (typeof value === 'boolean') {
                    return value;
                }
                else if (typeof value === 'string') {
                    // for boolean, compare to empty String to allow attributes appearing with
                    // not value to be treated as 'true'
                    return value.toUpperCase() === 'TRUE' || value == '';
                }
                else {
                    return false;
                }
            };
            ComponentUtil.toNumber = function (value) {
                if (typeof value === 'number') {
                    return value;
                }
                else if (typeof value === 'string') {
                    return Number(value);
                }
                else {
                    return undefined;
                }
            };
            ComponentUtil.SIMPLE_PROPERTIES = [
                'sortingOrder',
                'icons', 'localeText', 'localeTextFunc',
                'groupColumnDef', 'context', 'rowStyle', 'rowClass', 'headerCellRenderer',
                'groupDefaultExpanded', 'slaveGrids', 'rowSelection',
                'overlayLoadingTemplate', 'overlayNoRowsTemplate',
                'headerCellTemplate'
            ];
            ComponentUtil.SIMPLE_NUMBER_PROPERTIES = [
                'rowHeight', 'rowBuffer', 'colWidth'
            ];
            ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES = [
                'virtualPaging', 'toolPanelSuppressGroups', 'toolPanelSuppressValues', 'rowsAlreadyGrouped',
                'suppressRowClickSelection', 'suppressCellSelection', 'suppressHorizontalScroll', 'debug',
                'enableColResize', 'enableCellExpressions', 'enableSorting', 'enableServerSideSorting',
                'enableFilter', 'enableServerSideFilter', 'angularCompileRows', 'angularCompileFilters',
                'angularCompileHeaders', 'groupSuppressAutoColumn', 'groupSelectsChildren', 'groupHideGroupColumns',
                'groupIncludeFooter', 'groupUseEntireRow', 'groupSuppressRow', 'groupSuppressBlankHeader', 'forPrint',
                'suppressMenuHide', 'rowDeselection', 'unSortIcon', 'suppressMultiSort', 'suppressScrollLag',
                'singleClickEdit', 'suppressLoadingOverlay', 'suppressNoRowsOverlay', 'suppressAutoSize',
                'suppressParentsInRowNodes'
            ];
            ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES = ['pinnedColumnCount', 'headerHeight'];
            ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES = ['showToolPanel'];
            ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES = [
                'rowData', 'floatingTopRowData', 'floatingBottomRowData',
                'columnDefs', 'datasource', 'quickFilterText'];
            ComponentUtil.CALLBACKS = ['groupRowInnerRenderer', 'groupRowRenderer', 'groupAggFunction',
                'isScrollLag', 'isExternalFilterPresent', 'doesExternalFilterPass', 'getRowClass', 'getRowStyle',
                'headerCellRenderer', 'getHeaderCellTemplate'];
            ComponentUtil.ALL_PROPERTIES = ComponentUtil.SIMPLE_PROPERTIES
                .concat(ComponentUtil.SIMPLE_NUMBER_PROPERTIES)
                .concat(ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES)
                .concat(ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES)
                .concat(ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES)
                .concat(ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES);
            return ComponentUtil;
        })();
        grid.ComponentUtil = ComponentUtil;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path='componentUtil.ts'/>
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        // lets load angular 2 if we can find it
        var _ng;
        // we are not using annotations on purpose, as if we do, then there is a runtime dependency
        // on the annotation, which would break this code if angular 2 was not included, which is bad,
        // as angular 2 is optional for ag-grid
        var AgGridNg2 = (function () {
            function AgGridNg2(elementDef) {
                this.elementDef = elementDef;
                this._initialised = false;
                // core grid events
                this.modelUpdated = new _ng.core.EventEmitter();
                this.cellClicked = new _ng.core.EventEmitter();
                this.cellDoubleClicked = new _ng.core.EventEmitter();
                this.cellContextMenu = new _ng.core.EventEmitter();
                this.cellValueChanged = new _ng.core.EventEmitter();
                this.cellFocused = new _ng.core.EventEmitter();
                this.rowSelected = new _ng.core.EventEmitter();
                this.rowDeselected = new _ng.core.EventEmitter();
                this.selectionChanged = new _ng.core.EventEmitter();
                this.beforeFilterChanged = new _ng.core.EventEmitter();
                this.afterFilterChanged = new _ng.core.EventEmitter();
                this.filterModified = new _ng.core.EventEmitter();
                this.beforeSortChanged = new _ng.core.EventEmitter();
                this.afterSortChanged = new _ng.core.EventEmitter();
                this.virtualRowRemoved = new _ng.core.EventEmitter();
                this.rowClicked = new _ng.core.EventEmitter();
                this.rowDoubleClicked = new _ng.core.EventEmitter();
                this.ready = new _ng.core.EventEmitter();
                this.gridSizeChanged = new _ng.core.EventEmitter();
                // column grid events
                this.columnEverythingChanged = new _ng.core.EventEmitter();
                this.columnRowGroupChanged = new _ng.core.EventEmitter();
                this.columnValueChanged = new _ng.core.EventEmitter();
                this.columnMoved = new _ng.core.EventEmitter();
                this.columnVisible = new _ng.core.EventEmitter();
                this.columnGroupOpened = new _ng.core.EventEmitter();
                this.columnResized = new _ng.core.EventEmitter();
                this.columnPinnedCountChanged = new _ng.core.EventEmitter();
            }
            // this gets called after the directive is initialised
            AgGridNg2.prototype.ngOnInit = function () {
                this.gridOptions = grid.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
                var nativeElement = this.elementDef.nativeElement;
                var globalEventLister = this.globalEventListener.bind(this);
                this._agGrid = new ag.grid.Grid(nativeElement, this.gridOptions, globalEventLister);
                this.api = this.gridOptions.api;
                this.columnApi = this.gridOptions.columnApi;
                this._initialised = true;
            };
            AgGridNg2.prototype.ngOnChanges = function (changes) {
                grid.ComponentUtil.processOnChange(changes, this.gridOptions, this);
            };
            AgGridNg2.prototype.ngOnDestroy = function () {
                this.api.destroy();
            };
            AgGridNg2.prototype.globalEventListener = function (eventType, event) {
                var emitter;
                switch (eventType) {
                    case grid.Events.EVENT_COLUMN_GROUP_OPENED:
                        emitter = this.columnGroupOpened;
                        break;
                    case grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED:
                        emitter = this.columnEverythingChanged;
                        break;
                    case grid.Events.EVENT_COLUMN_MOVED:
                        emitter = this.columnMoved;
                        break;
                    case grid.Events.EVENT_COLUMN_ROW_GROUP_CHANGE:
                        emitter = this.columnRowGroupChanged;
                        break;
                    case grid.Events.EVENT_COLUMN_RESIZED:
                        emitter = this.columnResized;
                        break;
                    case grid.Events.EVENT_COLUMN_VALUE_CHANGE:
                        emitter = this.columnValueChanged;
                        break;
                    case grid.Events.EVENT_COLUMN_VISIBLE:
                        emitter = this.columnVisible;
                        break;
                    case grid.Events.EVENT_MODEL_UPDATED:
                        emitter = this.modelUpdated;
                        break;
                    case grid.Events.EVENT_CELL_CLICKED:
                        emitter = this.cellClicked;
                        break;
                    case grid.Events.EVENT_CELL_DOUBLE_CLICKED:
                        emitter = this.cellDoubleClicked;
                        break;
                    case grid.Events.EVENT_CELL_CONTEXT_MENU:
                        emitter = this.cellContextMenu;
                        break;
                    case grid.Events.EVENT_CELL_VALUE_CHANGED:
                        emitter = this.cellValueChanged;
                        break;
                    case grid.Events.EVENT_CELL_FOCUSED:
                        emitter = this.cellFocused;
                        break;
                    case grid.Events.EVENT_ROW_SELECTED:
                        emitter = this.rowSelected;
                        break;
                    case grid.Events.EVENT_ROW_DESELECTED:
                        emitter = this.rowDeselected;
                        break;
                    case grid.Events.EVENT_SELECTION_CHANGED:
                        emitter = this.selectionChanged;
                        break;
                    case grid.Events.EVENT_BEFORE_FILTER_CHANGED:
                        emitter = this.beforeFilterChanged;
                        break;
                    case grid.Events.EVENT_AFTER_FILTER_CHANGED:
                        emitter = this.afterFilterChanged;
                        break;
                    case grid.Events.EVENT_AFTER_SORT_CHANGED:
                        emitter = this.afterSortChanged;
                        break;
                    case grid.Events.EVENT_BEFORE_SORT_CHANGED:
                        emitter = this.beforeSortChanged;
                        break;
                    case grid.Events.EVENT_FILTER_MODIFIED:
                        emitter = this.filterModified;
                        break;
                    case grid.Events.EVENT_VIRTUAL_ROW_REMOVED:
                        emitter = this.virtualRowRemoved;
                        break;
                    case grid.Events.EVENT_ROW_CLICKED:
                        emitter = this.rowClicked;
                        break;
                    case grid.Events.EVENT_ROW_DOUBLE_CLICKED:
                        emitter = this.rowDoubleClicked;
                        break;
                    case grid.Events.EVENT_READY:
                        emitter = this.ready;
                        break;
                    case grid.Events.EVENT_GRID_SIZE_CHANGED:
                        emitter = this.ready;
                        break;
                    default:
                        console.log('ag-Grid: AgGridNg2 - unknown event type: ' + eventType);
                        return;
                }
                emitter.next(event);
            };
            return AgGridNg2;
        })();
        grid.AgGridNg2 = AgGridNg2;
        // check for angular and component, as if angular 1, we will find angular but the wrong version
        if (typeof (window) !== 'undefined') {
            if (window && window.ng && window.ng.core && window.ng.core.Component) {
                var ng = window.ng;
                initialiseAgGridWithAngular2(ng);
            }
        }
        function initialiseAgGridWithAngular2(ng) {
            _ng = ng;
            AgGridNg2.annotations = [
                new _ng.core.Component({
                    selector: 'ag-grid-ng2',
                    outputs: [
                        // core grid events
                        'modelUpdated', 'cellClicked', 'cellDoubleClicked', 'cellContextMenu', 'cellValueChanged', 'cellFocused',
                        'rowSelected', 'rowDeselected', 'selectionChanged', 'beforeFilterChanged', 'afterFilterChanged',
                        'filterModified', 'beforeSortChanged', 'afterSortChanged', 'virtualRowRemoved',
                        'rowClicked', 'rowDoubleClicked', 'ready', 'gridSizeChanged',
                        // column events
                        'columnEverythingChanged', 'columnRowGroupChanged', 'columnValueChanged', 'columnMoved',
                        'columnVisible', 'columnGroupOpened', 'columnResized', 'columnPinnedCountChanged'],
                    inputs: ['gridOptions']
                        .concat(grid.ComponentUtil.SIMPLE_PROPERTIES)
                        .concat(grid.ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES)
                        .concat(grid.ComponentUtil.SIMPLE_NUMBER_PROPERTIES)
                        .concat(grid.ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES)
                        .concat(grid.ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES)
                        .concat(grid.ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES)
                        .concat(grid.ComponentUtil.CALLBACKS),
                    compileChildren: false // no angular on the inside thanks
                }),
                new _ng.core.View({
                    template: '',
                    // tell angular we don't want view encapsulation, we don't want a shadow root
                    encapsulation: _ng.core.ViewEncapsulation.None
                })
            ];
            AgGridNg2.parameters = [[_ng.core.ElementRef]];
        }
        grid.initialiseAgGridWithAngular2 = initialiseAgGridWithAngular2;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid_4) {
        // provide a reference to angular
        var angular;
        if (typeof window !== 'undefined') {
            angular = window.angular;
        }
        // if angular is present, register the directive - checking for 'module' and 'directive' also to make
        // sure it's Angular 1 and not Angular 2
        if (typeof angular !== 'undefined' && typeof angular.module !== 'undefined' && angular.directive !== 'undefined') {
            initialiseAgGridWithAngular1(angular);
        }
        function initialiseAgGridWithAngular1(angular) {
            var angularModule = angular.module("agGrid", []);
            angularModule.directive("agGrid", function () {
                return {
                    restrict: "A",
                    controller: ['$element', '$scope', '$compile', '$attrs', AngularDirectiveController],
                    scope: true
                };
            });
        }
        grid_4.initialiseAgGridWithAngular1 = initialiseAgGridWithAngular1;
        function AngularDirectiveController($element, $scope, $compile, $attrs) {
            var gridOptions;
            var quickFilterOnScope;
            var keyOfGridInScope = $attrs.agGrid;
            quickFilterOnScope = keyOfGridInScope + '.quickFilterText';
            gridOptions = $scope.$eval(keyOfGridInScope);
            if (!gridOptions) {
                console.warn("WARNING - grid options for ag-Grid not found. Please ensure the attribute ag-grid points to a valid object on the scope");
                return;
            }
            var eGridDiv = $element[0];
            var grid = new ag.grid.Grid(eGridDiv, gridOptions, null, $scope, $compile, quickFilterOnScope);
            $scope.$on("$destroy", function () {
                grid.destroy();
            });
        }
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path='componentUtil.ts'/>
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        if (typeof document !== 'undefined' && document.registerElement) {
            // i don't think this type of extension is possible in TypeScript, so back to
            // plain Javascript to create this object
            var AgileGridProto = Object.create(HTMLElement.prototype);
            // wrap each property with a get and set method, so we can track when changes are done
            grid.ComponentUtil.ALL_PROPERTIES.forEach(function (key) {
                Object.defineProperty(AgileGridProto, key, {
                    set: function (v) {
                        this.__agGridSetProperty(key, v);
                    },
                    get: function () {
                        return this.__agGridGetProperty(key);
                    }
                });
            });
            AgileGridProto.__agGridSetProperty = function (key, value) {
                if (!this.__attributes) {
                    this.__attributes = {};
                }
                this.__attributes[key] = value;
                // keeping this consistent with the ng2 onChange, so I can reuse the handling code
                var changeObject = {};
                changeObject[key] = { currentValue: value };
                this.onChange(changeObject);
            };
            AgileGridProto.onChange = function (changes) {
                grid.ComponentUtil.processOnChange(changes, this.gridOptions, this);
            };
            AgileGridProto.__agGridGetProperty = function (key) {
                if (!this.__attributes) {
                    this.__attributes = {};
                }
                return this.__attributes[key];
            };
            AgileGridProto.setGridOptions = function (options) {
                var globalEventListener = this.globalEventListener.bind(this);
                this._gridOptions = grid.ComponentUtil.copyAttributesToGridOptions(options, this);
                this._agGrid = new ag.grid.Grid(this, this._gridOptions, globalEventListener);
                this.api = options.api;
                this.columnApi = options.columnApi;
                this._initialised = true;
            };
            // copies all the attributes into this object
            AgileGridProto.createdCallback = function () {
                for (var i = 0; i < this.attributes.length; i++) {
                    var attribute = this.attributes[i];
                    this.setPropertyFromAttribute(attribute);
                }
            };
            AgileGridProto.setPropertyFromAttribute = function (attribute) {
                var name = toCamelCase(attribute.nodeName);
                var value = attribute.nodeValue;
                if (grid.ComponentUtil.ALL_PROPERTIES.indexOf(name) >= 0) {
                    this[name] = value;
                }
            };
            AgileGridProto.attachedCallback = function (params) { };
            AgileGridProto.detachedCallback = function (params) { };
            AgileGridProto.attributeChangedCallback = function (attributeName) {
                var attribute = this.attributes[attributeName];
                this.setPropertyFromAttribute(attribute);
            };
            AgileGridProto.globalEventListener = function (eventType, event) {
                var eventLowerCase = eventType.toLowerCase();
                var browserEvent = new Event(eventLowerCase);
                var browserEventNoType = browserEvent;
                browserEventNoType.agGridDetails = event;
                this.dispatchEvent(browserEvent);
                var callbackMethod = 'on' + eventLowerCase;
                if (typeof this[callbackMethod] === 'function') {
                    this[callbackMethod](browserEvent);
                }
            };
            // finally, register
            document.registerElement('ag-grid', { prototype: AgileGridProto });
        }
        function toCamelCase(myString) {
            if (typeof myString === 'string') {
                var result = myString.replace(/-([a-z])/g, function (g) {
                    return g[1].toUpperCase();
                });
                return result;
            }
            else {
                return myString;
            }
        }
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="components/agGridNg2.ts" />
/// <reference path="components/agGridNg1.ts" />
/// <reference path="components/agGridWebComponent.ts" />
/// <reference path="../../typings/tsd" />
// creating the random local variable was needed to get the unit tests working.
// if not, the tests would not load as we were referencing an undefined window object
var __RANDOM_GLOBAL_VARIABLE_FSKJFHSKJFHKSDAJF;
if (typeof window !== 'undefined') {
    __RANDOM_GLOBAL_VARIABLE_FSKJFHSKJFHKSDAJF = window;
}
(function () {
    // Establish the root object, `window` or `exports`
    var root = this;
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = angularGridGlobalFunction;
        }
        exports.angularGrid = angularGridGlobalFunction;
    }
    root.agGridGlobalFunc = angularGridGlobalFunction;
    // Global Function - this function is used for creating a grid, outside of any AngularJS
    function angularGridGlobalFunction(element, gridOptions) {
        // see if element is a query selector, or a real element
        var eGridDiv;
        if (typeof element === 'string') {
            eGridDiv = document.querySelector(element);
            if (!eGridDiv) {
                console.warn('WARNING - was not able to find element ' + element + ' in the DOM, ag-Grid initialisation aborted.');
                return;
            }
        }
        else {
            eGridDiv = element;
        }
        new ag.grid.Grid(eGridDiv, gridOptions);
    }
}).call(__RANDOM_GLOBAL_VARIABLE_FSKJFHSKJFHKSDAJF);
