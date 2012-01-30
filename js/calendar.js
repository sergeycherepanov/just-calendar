/**
 * Just Another Javascript Calendar
 *
 * @copyright: Copyright (c) 2012 Sergey Cherepanov. (http://www.cherepanov.org.ua)
 * @license:   http://www.gnu.org/licenses/gpl.html GNU GENERAL PUBLIC LICENSE v3.0
 */

var CalendarException = Class.create({
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

var Calendar = Class.create({
    options:null,
    defaults:{
        monthNames:     ["January", "February", "March", "April", "May", "June", "Jule", "August", "September", "October", "November", "December"],
        startDate:      new Date(),
        calendars:      1,
        onClick:         function() {},
        onMouseOver:     function() {},
        onCellRender:    function() {},
        onCellClick:     function() {},
        onCellMouseOver: function() {},
        onCellMouseOut:  function() {}
    },
    // Class constructor
    initialize: function(options)
    {
        this.options = {};
        Object.extend(this.options, this.defaults);
        if (options) {
            Object.extend(this.options, options);
        }
    },
    // Retrieve new instance of cell class
    getNewCell: function(cellDate, scopeDate)
    {
        return new CalendarCell({
            calendarInstance: this,
            cellDate:    new Date(cellDate.getTime()),
            scopeDate:   new Date(scopeDate.getTime()),
            onClick:     this.options.onCellClick,
            onMouseOver: this.options.onCellMouseOver,
            onMouseOut:  this.options.onCellMouseOut,
            onRender:    this.options.onCellRender
        });
    },
    // Render calendar view
    getCalendar: function()
    {
        var container = document.createElement('div');
        var date      = this.getStartDate();
        for (var i = 0; i < this.options.calendars; i++) {
            container.appendChild(this.render(date, 0 == i, (i+1 == this.options.calendars)));
            date.setMonth(date.getMonth()+1);
        }
        return container;
    },
    // Render single calendar view
    render: function(date, showPrevBtn, showNextBtn)
    {
        var month = this.getMonthMatrix(date);

        // Initialize DOM elements
        var table = document.createElement('table');
        var thead = this.renderHead(date, showPrevBtn, showNextBtn)
        var tfoot = document.createElement('tfoot');
        var tbody = document.createElement('tbody');

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
        return table;
    },
    renderHead: function(date, showPrevBtn, showNextBtn)
    {
        showPrevBtn = 'undefined' == typeof showPrevBtn ? true : showPrevBtn;
        showNextBtn = 'undefined' == typeof showNextBtn ? true : showNextBtn;

        var thead   = document.createElement('thead');
        var prevTd  = document.createElement('td');
        var monthTd = document.createElement('td');
        var nextTd  = document.createElement('td');

        if (showPrevBtn) {
            prevTd.setAttribute("class", "btn-prev");
            prevTd.innerHTML = "Previous";
        }

        if (showNextBtn) {
            nextTd.setAttribute("class", "btn-next");
            nextTd.innerHTML = "Next";
        }

        monthTd.setAttribute("class", "month-name");
        monthTd.setAttribute("colspan", "5");
        monthTd.innerHTML = this.options.monthNames[date.getMonth()];

        thead.appendChild(prevTd);
        thead.appendChild(monthTd);
        thead.appendChild(nextTd);

        return thead;
    },
    // Date of begin render
    getStartDate: function()
    {
        return this.options.startDate || new Date();
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
        var j = 0;
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
var CalendarCell = Class.create({
    options:null,
    defaults: {
        calendarInstance: null,
        cellDate:         null,
        scopeDate:        null,
        onClick:     function() {},
        onMouseOver: function() {},
        onMouseOut:  function() {},
        onRender:    function() {}
    },
    inScope:false,
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
            throw new CalendarException("Cell Date is not defined or incorrect!");
        }
        if (!scopeDate || !scopeDate instanceof Date) {
            throw new CalendarException("Scope Date for cell not defined or incorrect!");
        }
        if (cellDate.getMonth() == scopeDate.getMonth()) {
            this.inScope = true;
        }
    },
    getDate: function ()
    {
        return this.options.cellDate;
    },
    getScopeDate: function ()
    {
        return this.options.scopeDate;
    },
    render: function ()
    {
        var container = document.createElement('div');
        var span      = document.createElement('span');
        if (this.inScope) {
            container.addClassName('scope')
        }
        span.innerHTML = this.getDate().getDate();
        container.appendChild(span);

        if (this.options.onRender instanceof Function) {
            this.options.onRender.apply(this, [container, this.getDate(), this.getScopeDate()]);
        }
        return container;
    }
});