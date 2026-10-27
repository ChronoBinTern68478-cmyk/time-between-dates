// DateSelect.js
// Генерира <select> елементи за дата (и по избор час:минута:секунда).
//
// API:
//   DateSelect.makeDatePicker(containerId, prefix, initialDate, options)
//   DateSelect.readDatePicker(prefix)  -> Date
//   DateSelect.daysInMonth(year, month0)  // month0 = 0..11
//   DateSelect.isLeap(year)
//
// options: { showTime, nowButton, minYear, maxYear }

(function (global) {
    'use strict';

    var MONTHS_BG = ['Януари','Февруари','Март','Април','Май','Юни',
                     'Юли','Август','Септември','Октомври','Ноември','Декември'];
    var DAYS_BG = ['неделя','понеделник','вторник','сряда','четвъртък','петък','събота'];

    function isLeap(y) {
        return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    }

    function daysInMonth(y, m) {
        return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30,
                31, 31, 30, 31, 30, 31][m];
    }

    function pad2(n) { return n < 10 ? '0' + n : '' + n; }

    function range(a, b) {
        var r = [];
        for (var i = a; i <= b; i++) r.push(i);
        return r;
    }

    function makeSelect(name, values, selected, labelFn) {
        var sel = document.createElement('select');
        sel.name = name;
        sel.id = name;
        values.forEach(function (v) {
            var opt = document.createElement('option');
            opt.value = v;
            opt.textContent = labelFn ? labelFn(v) : v;
            if (String(v) === String(selected)) opt.selected = true;
            sel.appendChild(opt);
        });
        return sel;
    }

    function makeDatePicker(container, prefix, initialDate, options) {
        options = options || {};
        var showTime  = !!options.showTime;
        var nowButton = !!options.nowButton;
        var minYear   = options.minYear || 1900;
        var maxYear   = options.maxYear || 2100;

        initialDate = initialDate || new Date();
        if (typeof initialDate === 'string') initialDate = new Date(initialDate);
        if (isNaN(initialDate.getTime())) initialDate = new Date();

        if (typeof container === 'string') container = document.getElementById(container);
        if (!container) throw new Error('Container not found: ' + container);
        container.innerHTML = '';

        var preferredDay = initialDate.getDate();

        var daySel   = makeSelect(prefix + 'day',   range(1, 31), preferredDay);
        var monthSel = makeSelect(prefix + 'month', range(0, 11), initialDate.getMonth(),
                                  function (i) { return MONTHS_BG[i]; });
        var yearSel  = makeSelect(prefix + 'year',  range(minYear, maxYear),
                                  initialDate.getFullYear());

        container.appendChild(daySel);
        container.appendChild(monthSel);
        container.appendChild(yearSel);

        var hourSel, minSel, secSel;
        if (showTime) {
            hourSel = makeSelect(prefix + 'hour',   range(0, 23), initialDate.getHours(),   pad2);
            minSel  = makeSelect(prefix + 'minute', range(0, 59), initialDate.getMinutes(), pad2);
            secSel  = makeSelect(prefix + 'second', range(0, 59), initialDate.getSeconds(), pad2);
            container.appendChild(document.createTextNode(' '));
            container.appendChild(hourSel);
            container.appendChild(document.createTextNode(':'));
            container.appendChild(minSel);
            container.appendChild(document.createTextNode(':'));
            container.appendChild(secSel);
        }

        // Запомняме последния "истински" избор на ден
        daySel.addEventListener('change', function () {
            preferredDay = +daySel.value;
        });

        function rebuildDays() {
            var y = +yearSel.value;
            var m = +monthSel.value;
            var n = daysInMonth(y, m);
            while (daySel.options.length > n) daySel.remove(daySel.options.length - 1);
            while (daySel.options.length < n) {
                var opt = document.createElement('option');
                opt.value = opt.textContent = daySel.options.length + 1;
                daySel.appendChild(opt);
            }
            daySel.value = Math.min(preferredDay, n);
        }
        monthSel.addEventListener('change', rebuildDays);
        yearSel.addEventListener('change', rebuildDays);
        rebuildDays();

        if (nowButton) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = 'Сега';
            btn.title = 'Задай текущата дата и час';
            btn.addEventListener('click', function () {
                var now = new Date();
                preferredDay = now.getDate();
                yearSel.value  = now.getFullYear();
                monthSel.value = now.getMonth();
                rebuildDays();
                daySel.value = now.getDate();
                if (hourSel) {
                    hourSel.value = now.getHours();
                    minSel.value  = now.getMinutes();
                    secSel.value  = now.getSeconds();
                }
            });
            container.appendChild(document.createTextNode(' '));
            container.appendChild(btn);
        }
    }

    function readDatePicker(prefix) {
        var y  = +document.getElementById(prefix + 'year').value;
        var m  = +document.getElementById(prefix + 'month').value;
        var d  = +document.getElementById(prefix + 'day').value;
        var hEl  = document.getElementById(prefix + 'hour');
        var miEl = document.getElementById(prefix + 'minute');
        var sEl  = document.getElementById(prefix + 'second');
        var h  = hEl  ? +hEl.value  : 0;
        var mi = miEl ? +miEl.value : 0;
        var s  = sEl  ? +sEl.value  : 0;
        var maxDay = daysInMonth(y, m);
        if (d > maxDay) d = maxDay;
        return new Date(y, m, d, h, mi, s);
    }

    global.DateSelect = {
        makeDatePicker: makeDatePicker,
        readDatePicker: readDatePicker,
        daysInMonth: daysInMonth,
        isLeap: isLeap,
        MONTHS_BG: MONTHS_BG,
        DAYS_BG: DAYS_BG
    };
})(window);
