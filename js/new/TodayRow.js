
TodayRow.prototype = Object.create(Row.prototype);

function TodayRow() {
    Row.apply(this, arguments);
}

Row.prototype.build = function() {
    var tr = Row.prototype.build.apply(this, []);
    tr.className = 'active';
    return tr;
};