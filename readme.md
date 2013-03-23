# JavaScript Calendar based on native js.

### Previews:

![Default Calendar View](https://raw.github.com/SergeyCherepanov/just-calendar/master/doc/screenshot-001.png)

### Usage

Create html container for new widget:  
```html
<div id="calendar-widget"></div>
```

Initialize and render new widget:  
```javascript
var calendarWidget = new JustCalendar({
    container: document.getElementById('calendar-widget'),
    startDate: new Date()
});
```

Demo: http://www.cherepanov.org.ua/just-calendar/examples/demo.html
