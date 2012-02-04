/**
 * Just Another Javascript Calendar
 *
 * @copyright: Copyright (c) 2012 Sergey Cherepanov. (http://www.cherepanov.org.ua)
 * @license:   http://www.gnu.org/licenses/gpl.html GNU GENERAL PUBLIC LICENSE v3.0
 */

var JustCalendarException = Class.create({
    message:"",
    initialize: function(message)
    {
        this.message = message;
    },
    getMessage: function()
    {
        return this.message;
    }
});

var JustCalendar = Class.create({
    options:null,
    data:null,
    date:null,
    defaults:{
        monthNames:      ["January", "February", "March", "April", "May", "June", "Jule", "August", "September", "October", "November", "December"],
        dayNames:        ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        container:       null, // DOM element
        startDate:       new Date(),
        calendars:       1,
        onRender:        function(table, date) {},
        onCellRender:    function(cellContainer, cellDate, scopeDate) {},
        data:            null
    },
    setData:function(key, value) {
        this.data[key] = value;
        return this;
    },
    getData:function(key) {
        return this.data[key];
    },
    // Class constructor
    initialize: function(options)
    {
        this.options = {};
        this.data    = {};
        Object.extend(this.options, this.defaults);
        if (options) {
            if (options['data']) {
                Object.extend(this.data, options['data']);
                delete options['data'];
            }
            Object.extend(this.options, options);
        }
        if (!this.options.startDate || !this.options.startDate instanceof Date) {
            throw new JustCalendarException("Start Date is not defined or incorrect!");
        } else {
            // Rest to first day of month
            this.options.startDate.setDate(1);
        }
        this.render();
        return this;
    },
    // Retrieve new instance of cell class
    getNewCell: function(cellDate, scopeDate)
    {
        return new JustCalendarCell({
            calendarInstance: this,
            cellDate:    new Date(cellDate.getTime()),
            scopeDate:   new Date(scopeDate.getTime()),
            onRender:    this.options.onCellRender
        });
    },
    // Render calendar view
    render: function()
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
    },
    previous:function()
    {
        this.date.setMonth(this.date.getMonth() - this.options.calendars);
        this.render();
    },
    next:function()
    {
        this.date.setMonth(this.date.getMonth() + this.options.calendars);
        this.render();
    },
    // Render single calendar view
    renderCalendar: function(date, showPrevBtn, showNextBtn)
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
    },
    renderHead: function(date, showPrevBtn, showNextBtn)
    {
        showPrevBtn  = 'undefined' == typeof showPrevBtn ? true : showPrevBtn;
        showNextBtn  = 'undefined' == typeof showNextBtn ? true : showNextBtn;

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
    },
    // Date of begin render
    getStartDate: function()
    {
        if (!this.date) {
            this.date = this.options.startDate || new Date()
        }
        return this.date;
    },
    // Retrieve month data
    getMonthMatrix: function(startDate)
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
});


// Renderer for calendar cell
var JustCalendarCell = Class.create({
    options:null,
    defaults: {
        calendarInstance: null,
        cellDate:         null,
        scopeDate:        null,
        onRender:         function(container, cellDate, scopeDate) {}
    },
    inScope:false,
    element:null, // Related DOM element
    // Class constructor
    initialize:  function(options)
    {
        this.options = {};
        Object.extend(this.options, this.defaults);
        if (options) {
            Object.extend(this.options, options);
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
    },
    setData:function(key, value) {
        this.options.calendarInstance.setData(key, value);
        return this;
    },
    getData:function(key) {
        return this.options.calendarInstance.getData(key);
    },
    // Retrieve cell date
    getDate: function ()
    {
        return this.options.cellDate;
    },
    // Retrieve scope date
    getScopeDate: function ()
    {
        return this.options.scopeDate;
    },
    // Render day
    render: function ()
    {
        var container = document.createElement('div');
        var span      = document.createElement('span');

        this.element = container;
        if (this.inScope) {
            container.setAttribute('class', 'scope')
        }
        span.innerHTML = this.getDate().getDate();
        container.appendChild(span);

        if (this.options.onRender instanceof Function) {
            this.options.onRender.apply(this, [container, this.getDate(), this.getScopeDate()]);
        }

        return container;
    }
});