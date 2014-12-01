
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////     Reimbursement Calc
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var rc = {};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////     Constants
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

rc.DARK = '#272b30';
rc.MID = '#2e3338';
rc.LIGHT = '#49515a';

rc.LINE = '#3366cc';
rc.TEXT = '#c8c8c8';
rc.BACKGROUND = rc.DARK;
rc.GRID = rc.LIGHT;

rc.CHART_OPTIONS = {
    pointSize: 6,
    backgroundColor: rc.BACKGROUND,
    selectionMode: 'multiple',
    animation: {
        duration: 300
    },
    series: {
        color: rc.LINE
    },
    tooltip: {
        textStyle: {
            color: rc.TEXT
        }
    },
    hAxis: {
        titleTextStyle: {
            color: rc.TEXT
        },
        textStyle: {
            color: rc.TEXT
        },
        baselineColor: rc.GRID, 
        gridlines: {
            color: 'transparent'
        }
    },
    vAxis: {
        format: '$#,###',
        titleTextStyle: {
            color: rc.TEXT
        },
        textStyle: {
            color: rc.TEXT
        },
        baselineColor: rc.GRID, 
        gridlines: {
            color: rc.GRID
        }
    },
    legend: {
        position: 'none'
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////     Variables
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

rc.storage = undefined;
rc.chart = undefined;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////     Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @nextExpiration {Object|null} days Number of days until the next reimbursement expiration
 */
rc.completeLoadDate = function() {
    rc.drawChart();
    // todo figure out how to do this without a random sleep
    setTimeout(rc.highlightPoints, 1000);
};

/**
 * Handles mouseover events for points on the chart.
 * The matching event pair rows will be highlighted.
 * @param  {Object} point Represents the point being hovered. Has attributes row and column.
 */
rc.hoverPointHandler = function(point) {
    rc.lastPoint = point;
    // check if row is todayRow
    var todayIndex = rc.viewModel.rows.indexOf(rc.viewModel.todayRow);
    if( point.row === todayIndex) {
        rc.setChartSelection([
            {row: todayIndex, column: 1}
        ]);
        rc.colorPoints();
    } else {
        var row = rc.viewModel.rows()[point.row];
        rc.viewModel.highlight(row, true);
        rc.highlightPoints(row);
    }
};

/**
 * Handles mouseout events for points on the chart. All rows will be unhighlighted.
 */
rc.unhoverPointHandler = function() {
    rc.viewModel.rows().forEach(function(row) {
        rc.viewModel.highlight(row, false);
    });
    rc.setChartSelection();
    rc.highlightPoints();
};

/**
 * Handles select events for points on the chart.
 * The last hovered point will be re-highlighted since any click will results in a deselection of a highlighted point.
 */
rc.selectPointHandler = function() {
    rc.hoverPointHandler(rc.lastPoint);
};

rc.highlightPoints = function(row) {

    var today = rc.viewModel.todayRow;
    var todayIndex = rc.viewModel.rows.indexOf(today);
    if( typeof row === 'undefined' || row === null) {
        rc.setChartSelection([
            {row: todayIndex, column: 1}
        ]);
    } else {
        var start = row.isStart ? row : row.matchingRow;
        var stop = start.matchingRow;

        // Subtract 2 from indexes to account for the header row and size row
        var startIndex = rc.viewModel.rows.indexOf(start);
        var stopIndex = rc.viewModel.rows.indexOf(stop);

        rc.setChartSelection([
            {row: startIndex, column: 1},
            {row: stopIndex, column: 1},
            {row: todayIndex, column: 1}
        ]);
    }

    rc.colorPoints(start, stop, today, startIndex, stopIndex, todayIndex)
};

rc.colorPoints = function(start, stop, today, startIndex, stopIndex, todayIndex) {

    if (!rc.TODAY_COLOR) {
        rc.TODAY_COLOR = rc.$table.find('.active').children('td').first().css('backgroundColor');
    }

    var selectedCircles = $("svg>g>g>g>circle");
    var circles = [];
    for (var i = 0; i < selectedCircles.length; i++) {
        circles.push(selectedCircles[i].outerHTML);
    }

    var first1 = 0;
    var first2 = 1;
    var middle1 = 2;
    var middle2 = 3;
    var last1 = 4;
    var last2 = 5;

    var start1;
    var start2;
    var stop1;
    var stop2;
    var today1;
    var today2;
    if (selectedCircles.length < 6) {
        // just today dot
        rc.setSelectedPointColor(selectedCircles[0], selectedCircles[selectedCircles.length - 1], rc.TODAY_COLOR);
        return;
    } else if( selectedCircles.length > 6) {
        // The mouse is hovering over a point so 3 extra circles are being drawn between the existing circles for the hovered point

        // Check if the first point is hovered, Red-Today-Green or Red-Green-Today, must be red
        if( selectedCircles[2].getAttribute("fill") == "none") {
            first2 += 3;
            middle1 += 3;
            middle2 += 3;
            last1 += 3;
            last2 += 3;
        }
        // Check if the middle point is hovered, Red-Green-Today or Today-Red-Green
        else if( selectedCircles[4].getAttribute("fill") == "none") {
            middle2 += 3;
            last1 += 3;
            last2 += 3;
        }
        // Check if the last point is hovered, Red-Today-Green or Today-Red-Green, must be green
        else if( selectedCircles[6].getAttribute("fill") == "none") {
            last2 += 3;
        }
    }

    // Adjust today/start/stop positions
    if( todayIndex < startIndex) {
        // Today-Start-Stop
        today1 = first1;
        today2 = first2;
        start1 = middle1;
        start2 = middle2;
        stop1 = last1;
        stop2 = last2;
    } else if( todayIndex < stopIndex) {
        // Start-Today-Stop
        start1 = first1;
        start2 = first2;
        today1 = middle1;
        today2 = middle2;
        stop1 = last1;
        stop2 = last2;
    } else {
        // Start-Stop-Today
        start1 = first1;
        start2 = first2;
        stop1 = middle1;
        stop2 = middle2;
        today1 = last1;
        today2 = last2;
    }

    if (!rc.START_COLOR) {
        rc.START_COLOR = rc.$table.find('tr.start.highlight').first().css('backgroundColor');
    }
    if (!rc.STOP_COLOR) {
        rc.STOP_COLOR = rc.$table.find('tr.stop.highlight').first().css('backgroundColor');
    }

    rc.setSelectedPointColor(selectedCircles[start1], selectedCircles[start2], rc.START_COLOR);
    rc.setSelectedPointColor(selectedCircles[stop1], selectedCircles[stop2], rc.STOP_COLOR);
    rc.setSelectedPointColor(selectedCircles[today1], selectedCircles[today2], rc.TODAY_COLOR);
};

rc.setChartSelection = function(selection) {
	try {
		rc.chart.setSelection(selection);
	} catch (e) {
		console.warn("Oddity setting selection", e);
	}
};

rc.clearChartSelection = function() {
	rc.setChartSelection();
};

rc.setSelectedPointColor = function(outerCircle, innerCircle, color) {
    $(outerCircle).attr("stroke", color);
    $(innerCircle).attr("fill", color);
};

rc.drawChart = function() {
    if( !chartIsReady) {
        rc.$chart.css('visibility', 'hidden');
        console.error("Chart not ready");
    } else {
        if( !rc.chart) {
            rc.chart = new google.visualization.LineChart(document.getElementById('chart'));
            google.visualization.events.addListener(rc.chart, 'select', rc.selectPointHandler);
            google.visualization.events.addListener(rc.chart, 'onmouseover', rc.hoverPointHandler);
            google.visualization.events.addListener(rc.chart, 'onmouseout', rc.unhoverPointHandler);
        }
		var rows = rc.viewModel.rows();
        if( rows.length <= 1) {
            rc.$chart.css('visibility', 'hidden');
        } else {
            rc.$chart.css('visibility', 'visible');
        }
        var todayDot = {
            previous : null,
            today : null
        };
        var data = [];
        data[0] = ['Date', 'Owed'];
        for( var i = 0; i < rows.length; i++) {
            if( rows[i].isToday) {
                todayDot.today = rows[i];
            } else {
                if( todayDot.today) {
                    // insert todayDot, calculate value
                    var nextDate = rows[i];
                    var previousTime = todayDot.previous.date.getTime();
                    var todayTime = todayDot.today.date.getTime();
                    var nextTime = nextDate.date.getTime();
                    var totalTime = nextTime - previousTime;

                    var fractionOfTime = (todayTime - previousTime) / totalTime;

                    var previousOwed = todayDot.previous.owed().toFloat();
                    var nextOwed = nextDate.owed().toFloat();
                    var todayOwed = previousOwed + (fractionOfTime * (nextOwed - previousOwed));

                    data.push(rc.buildDot(todayDot.today, todayOwed));
                    todayDot.today = null;
                }
                todayDot.previous = rows[i];
                data.push(rc.buildDot(todayDot.previous));
            }
        }
        if( todayDot.today) {
            // today is the last dot, insert it
            data.push(rc.buildDot(todayDot.today));
        }

        rc.chart.draw(google.visualization.arrayToDataTable(data), rc.CHART_OPTIONS);
    }
};

rc.buildDot = function(row, yValue) {
    var xValue = row.date;
    var xFormatted = xValue.toString().split(' ')[1] + ' ' + xValue.getDate() + ', ' + xValue.getFullYear();
    yValue = yValue || row.owed().toFloat();
    var yFormatted = row.owed().toString();
    return [{v: xValue, f: xFormatted}, {v: yValue, f: yFormatted}];
};

rc.checkOverflow = function() {
    var colWidth = rc.$column.width();
    if( rc.lastColWidth !== colWidth) {
        rc.lastColWidth = colWidth;

        rc.$chart.css({
            width: colWidth + 'px',
            height: colWidth + 'px'
        });
        rc.drawChart();

        if( !rc.largeTableWidth) {
            rc.largeTableWidth = rc.$table.width();
        }
        rc.viewModel.isSmall(rc.largeTableWidth > colWidth);
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////     Setup
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.onload = function() {

	rc.storage = new StorageManager();
    rc.viewModel = new PageViewModel(rc.storage, rc.highlightPoints);
    ko.applyBindings(rc.viewModel);
    rc.viewModel.loadSavedData();

    rc.$table = $('#dateTable');
    rc.$column = rc.$table.parent();
    rc.$chart = $('#chart');
    rc.checkOverflow();
    $(window).resize(rc.checkOverflow);
};
