/**
 * Just Another Javascript Calendar
 *
 * @copyright: Copyright (c) 2012 Sergey Cherepanov. (http://www.cherepanov.org.ua)
 * @license:   http://www.gnu.org/licenses/gpl.html GNU GENERAL PUBLIC LICENSE v3.0
 */

var JustCalendarException = function() 
{
    /**
     * Class constructor
     * @param message string
     */
    this.constructor = function(message) 
    {
        this.message = message ? message : "";
    };
    
    /**
     * Retrieve message
     * @returns string
     */
    this.getMessage = function()
    {
        return this.message;
    };

    /**
     * Call constructor
     */
    this.constructor.apply(this, arguments);
};

var JustCalendar = function()
{
    /**
     * Class constructor
     * @param options array
     */
    this.constructor = function(options)
    {
        this.options = {
            monthNames:      ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            dayNames:        ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            container:       null, // DOM element
            startDate:       new Date(),
            calendars:       1,
            onRender:        function(table, date) {},
            onCellRender:    function(cellContainer, cellDate, scopeDate) {},
            data:            null
        };
        this.data = {};
        this.date = null;
        if (options) {
            if (options['data']) {
                for (var property in options['data']) {
                    this.data[property] = options['data'][property];
                }
                delete options['data'];
            }
            for (var property in options) {
                this.options[property] = options[property];
            }
        }
        if (!this.options.startDate || !this.options.startDate instanceof Date) {
            throw new JustCalendarException("Start Date is not defined or incorrect!");
        } else {
            // Rest to first day of month
            this.options.startDate.setDate(1);
        }
        this.render();
    };

    /**
     * Set data value
     * 
     * @param key string
     * @param value mixed
     * @returns JustCalendar
     */
    this.setData = function(key, value) {
        this.data[key] = value;
        return this;
    };

    /**
     * Retrieve data value
     * 
     * @param key string
     * @returns JustCalendar
     */
    this.getData = function(key) {
        return this.data[key];
    };

    /**
     * Retrieve new instance of cell
     * 
     * @param cellDate Date
     * @param scopeDate Date
     * @returns {JustCalendarCell}
     */
    this.getNewCell = function(cellDate, scopeDate)
    {
        return new JustCalendarCell({
            calendarInstance: this,
            cellDate:    new Date(cellDate.getTime()),
            scopeDate:   new Date(scopeDate.getTime()),
            onRender:    this.options.onCellRender
        });
    };
    
    /**
     * Render calendar view
     * 
     * @returns {JustCalendarCell}
     */
    this.render = function()
    {
        var container = this.options.container;
        while (container.hasChildNodes()) {
            container.removeChild(container.firstChild);
        }
        var date  = new Date(this.getStartDate().getTime());
        var table = document.createElement('table');
        var tr    = document.createElement('tr');
        for (var i = 0; i < this.options.calendars; i++) {
            var td = document.createElement('td');
            td.appendChild(this.renderCalendar(date, 0 == i, (i+1 == this.options.calendars)));
            tr.appendChild(td);
            date.setMonth(date.getMonth()+1);
        }
        table.appendChild(tr);
        table.setAttribute('class', 'jajc-calendar-wrapper');
        container.appendChild(table);
        return this;
    };

    /**
     * Switch to previous moth
     * 
     * @returns {JustCalendarCell}
     */
    this.previous = function()
    {
        this.date.setMonth(this.date.getMonth() - this.options.calendars);
        return this.render();
    };

    /**
     * Switch to next month
     * 
     * @returns {JustCalendarCell}
     */
    this.next = function()
    {
        this.date.setMonth(this.date.getMonth() + this.options.calendars);
        return this.render();
    };
    
    /**
     * Render single calendar view
     * 
     * @param date Date
     * @param showPrevBtn bool
     * @param showNextBtn bool
     * @returns {HTMLElement}
     */
    this.renderCalendar = function(date, showPrevBtn, showNextBtn)
    {
        var month = this.getMonthMatrix(date);
        // Initialize DOM elements
        var table = document.createElement('table');
        var thead = this.renderHead(date, showPrevBtn, showNextBtn)
        var tfoot = document.createElement('tfoot');
        var tbody = document.createElement('tbody');

        table.setAttribute('class', 'jajc-calendar');

        for (var week in month) {
            var tr = document.createElement('tr');
            for (var day in  month[week]) {
                var td = document.createElement('td');
                td.appendChild(month[week][day].render());
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(thead);
        table.appendChild(tfoot);
        table.appendChild(tbody);
        if (this.options.onRender instanceof Function) {
            this.options.onRender.apply(this, [table, date]);
        }
        return table;
    };

    /**
     * Render single calendar header 
     * 
     * @param date Date
     * @param showPrevBtn bool
     * @param showNextBtn bool
     * @returns {HTMLElement}
     */
    this.renderHead = function(date, showPrevBtn, showNextBtn)
    {
        showPrevBtn  = ('undefined' == typeof showPrevBtn ? true : showPrevBtn);
        showNextBtn  = ('undefined' == typeof showNextBtn ? true : showNextBtn);

        var thead    = document.createElement('thead');
        var firstTr  = document.createElement('tr');
        var secondTr = document.createElement('tr');
        var prevTd   = document.createElement('td');
        var monthTd  = document.createElement('td');
        var nextTd   = document.createElement('td');

        if (showPrevBtn) {
            var prevBtn = document.createElement('span');
            prevBtn.innerHTML = "Previous";
            prevBtn.onclick = this.previous.bind(this);
            prevTd.setAttribute("class", "calendar-btn btn-prev");
            prevTd.appendChild(prevBtn);
        }

        if (showNextBtn) {
            var nextBtn = document.createElement('span');
            nextBtn.innerHTML = "Next";
            nextBtn.onclick = this.next.bind(this);
            nextTd.setAttribute("class", "calendar-btn btn-next");
            nextTd.appendChild(nextBtn);
        }

        monthTd.setAttribute("class", "month-name");
        monthTd.setAttribute("colspan", "5");
        monthTd.innerHTML = this.options.monthNames[date.getMonth()] + " - " + date.getFullYear();
        firstTr.appendChild(prevTd);
        firstTr.appendChild(monthTd);
        firstTr.appendChild(nextTd);

        for (var i = 0; i < 7; i ++) {
            var th = document.createElement('th');
            th.innerHTML = this.options.dayNames[i];
            secondTr.appendChild(th);
        }

        thead.appendChild(firstTr);
        thead.appendChild(secondTr);

        return thead;
    };
    
    /**
     * Date of begin rendering
     * 
     * @returns {Date}
     */
    this.getStartDate = function()
    {
        if (!this.date) {
            this.date = this.options.startDate || new Date()
        }
        return this.date;
    };
    
    /**
     * Retrieve month data
     * 
     * @param startDate Date
     * @returns {Object}
     */
    this.getMonthMatrix = function(startDate)
    {
        // Clone date
        var date = new Date(startDate.getTime());
        // Reset to first day of month
        date.setDate(1);
        if (date.getDay() > 0) {
            // Reset to first day of week
            date.setDate(date.getDate() - date.getDay());
        }
        var month = {};
        for (var week = 0; week < 6; week++) {
            if (!month[week]) {
                month[week] = {}
            }
            while (true) {
                month[week][date.getDay()] = this.getNewCell(date, startDate);
                // Move to next day
                date.setDate(date.getDate()+1);
                if (!date.getDay()) {
                    // Move to next week
                    break;
                }
            }
        }
        return month;
    }
    
    /**
     * Call constructor
     */
    this.constructor.apply(this, arguments);
};


/**
 * Renderer for calendar cell
 * 
 * @constructor
 */
var JustCalendarCell = function()
{
    /**
     * Class constructor
     * @param options {Object}
     */
    this.constructor = function(options)
    {
        // If the day is in current month scope
        this.inScope  = false;
        this.options  = null;
        this.options = {
            calendarInstance: null,
            cellDate:         null,
            scopeDate:        null,
            onRender:         function(container, cellDate, scopeDate) {}
        };
        // DOM element for cell
        this.element = null;
        
        if (options) {
            for (var property in options) {
                this.options[property] = options[property];
            }
        }
        var cellDate  = this.options.cellDate;
        var scopeDate = this.options.scopeDate;
        if (!cellDate || !cellDate instanceof Date) {
            throw new JustCalendarException("Cell Date is not defined or incorrect!");
        }
        if (!scopeDate || !scopeDate instanceof Date) {
            throw new JustCalendarException("Scope Date for cell not defined or incorrect!");
        }
        if (cellDate.getMonth() == scopeDate.getMonth()) {
            this.inScope = true;
        }
    };

    /**
     * Set data
     * 
     * @param key {String}
     * @param value {*}
     * @returns {JustCalendarCell}
     */
    this.setData = function(key, value) {
        this.options.calendarInstance.setData(key, value);
        return this;
    };

    /**
     * Retrieve data
     * 
     * @param key
     * @returns {*}
     */
    this.getData = function(key) {
        return this.options.calendarInstance.getData(key);
    };

    /**
     * Retrieve cell date
     * 
     * @returns {Date}
     */
    this.getDate = function ()
    {
        return this.options.cellDate;
    };
    
    /**
     * Retrieve scope date
     * 
     * @returns {Date}
     */
    this.getScopeDate = function ()
    {
        return this.options.scopeDate;
    };
    
    /**
     * Render cell element
     * 
     * @returns {HTMLElement}
     */
    this.render = function ()
    {
        if (!this.element) {
            var container = document.createElement('div');
            var span      = document.createElement('span');
    
            this.element = container;
            if (this.inScope) {
                container.setAttribute('class', 'scope')
            }
            span.innerHTML = this.getDate().getDate().toString();
            container.appendChild(span);
    
            if (this.options.onRender instanceof Function) {
                this.options.onRender.apply(this, [container, this.getDate(), this.getScopeDate()]);
            }
            this.element = container;
        }

        return this.element;
    };

    /**
     * Call constructor
     */
    this.constructor.apply(this, arguments);
};
