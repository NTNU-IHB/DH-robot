

'use strict';

var DHTable = function () {

    var that = this;

    this.rows = [];

    var ex01 = $("<button/>", {
        text: 'RRP',
        click: function () {
            that.reset();
            that.rows.push(new Row(that.rows.length + 1, 0, 0, 1, 0, 'R', -180, 180));
            that.rows.push(new Row(that.rows.length + 1, 90, -0.2, 0, 0, 'R', 90, 180));
            that.rows.push(new Row(that.rows.length + 1, 90, 0, 1.5, 0, 'P', 0, 3));
            that.update();
        }
    }).appendTo($('#exampleButtons'));

    var ex02 = $("<button/>", {
        text: 'RRR',
        click: function () {
            that.reset();
            that.rows.push(new Row(that.rows.length + 1, 0, 0, 1, 0, 'R', -180, 180));
            that.rows.push(new Row(that.rows.length + 1, 90, 0, 0, 0, 'R', 0, 90));
            that.rows.push(new Row(that.rows.length + 1, 0, 2, 0, 0, 'R', -150, -10));
            that.rows.push(new Row(that.rows.length + 1, 0, 1, 0, 0, 'F', "-", "-"));
            that.update();
        }
    }).appendTo($('#exampleButtons'));

    var ex03 = $("<button/>", {
        text: 'PUMA 560',
        click: function () {
            that.reset();
            that.rows.push(new Row(that.rows.length + 1, 0, 0, 1, 0, 'R', -180, 180));
            that.rows.push(new Row(that.rows.length + 1, -90, 0, 0, 0, 'R', -90, 90));
            that.rows.push(new Row(that.rows.length + 1, 0, 1, 1, 0, 'R', -90, 90));
            that.rows.push(new Row(that.rows.length + 1, -90, 1, 1, 0, 'R', -90, 90));
            that.rows.push(new Row(that.rows.length + 1, 90, 0, 0, 0, 'R', -90, 90));
            that.rows.push(new Row(that.rows.length + 1, -90, 0, 0, 0, 'R', -90, 90));
            that.update();
        }
    }).appendTo($('#exampleButtons'));

    var ex04 = $("<button/>", {
        text: 'Motoman L3',
        click: function () {
            that.reset();
            that.rows.push(new Row(that.rows.length + 1, 0, 0, 1, 0, 'F', "-", "-"));
            that.rows.push(new Row(that.rows.length + 1, 0, 0, 0, 0, 'R', -180, 180));
            that.rows.push(new Row(that.rows.length + 1, -90, 0, 0, 0, 'R', -90, 90));
            that.rows.push(new Row(that.rows.length + 1, 0, 1, 0, 0, 'R', -90, 90));
            that.rows.push(new Row(that.rows.length + 1, 0, 1, 0, 0, 'R', -90, 90));
            that.rows.push(new Row(that.rows.length + 1, 90, 0, 0, 0, 'R', -90, 90));
            that.update();
        }
    }).appendTo($('#exampleButtons'));
	
	 var ex05 = $("<button/>", {
        text: 'UR3',
        click: function () {
            that.reset();
            that.rows.push(new Row(that.rows.length + 1, 0, 0, 1.52, 0, 'R', -180, 180));
            that.rows.push(new Row(that.rows.length + 1, 90, 0, 1.20, -90, 'R', 0, 180));
            that.rows.push(new Row(that.rows.length + 1, 0, 2.44, -0.1, 0, 'R', -180, 180));
            that.rows.push(new Row(that.rows.length + 1, 0, 2.13, 0, -90, 'R', -180, 0));
            that.rows.push(new Row(that.rows.length + 1, -90, 0, 0.83, 0, 'R', -180, 180));
            that.rows.push(new Row(that.rows.length + 1, 90, 0, 0.82, 0, 'R', -180, 180));
            that.update();
        }
    }).appendTo($('#exampleButtons'));  

    ex01.click();


    $('#addRowButton').click(function () {
        if (that.rows.length >= 8) {
            alert('Max number of rows reached!');
        } else {
            var row = new Row(that.rows.length + 1, 0, 0, 0, 0, 'R');
            $('#dh').append(row.tr);
            that.rows.push(row);
        }
    });

    $('#removeRowButton').click(function () {
        if (that.rows.length !== 0) {
            var row = that.rows.pop();
            row.tr.remove();
        }
    });


    this.updateCallback = undefined;

    $('#updateButton').click(function () {
        var dh = $('#dh');
        for (var i = 0; i < that.rows.length; i++) {
            that.rows[i].tr.appendTo(dh);
        }
        if (that.updateCallback !== undefined) {
            that.updateCallback(that.rows);
        }

    });

};

DHTable.prototype.setJointValues = function(values) {
  
    for (var i = 0, j = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        if (row.isActuable) {
            row.jointValue = values[j++].toFixed(2);
        }
    }
    this.update();
    
};

DHTable.prototype.getJointValues = function () {

    var result = [];
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        if (row.isActuable) {
            result.push(row.jointValue);
        }
    }
    return result;

};

DHTable.prototype.getJacobian = function (values) {

    var rows = 3;
    var cols = values.length;

    var h = 1E-6;
    var J = [];
    
    for (var i = 0; i < rows; i++) {
        J.push(Array(cols));
    }

    var p1 = this.getEndEffectorPosition(values);

    for (var i = 0; i < values.length; i++) {

        var vals = values.slice();
        vals[i] += h;

        var p2 = this.getEndEffectorPosition(vals);

        J[0][i] = (p2[0] - p1[0]) / h;
        J[1][i] = (p2[1] - p1[1]) / h;
        J[2][i] = (p2[2] - p1[2]) / h;

    }

    return J;

};

DHTable.prototype.solveVelocity = function (target, currentValues) {
    
    var lambda = 0.1;
    var j = this.getJacobian(currentValues, 0.1);
    var eye = numeric.identity(3);
    var jt = numeric.transpose(j);
    var jjt = numeric.dot(j, jt);
    var plus = numeric.mul(eye, lambda * lambda);
    var inv = numeric.dot(jt, numeric.inv(numeric.add(jjt, plus)));

    var x = [[target[0]], [target[1]], [target[2]]];
    var vel = numeric.dot(inv, x);
    
    var result = [];
    for (var i = 0; i < vel.length; i++) {
        result[i] = vel[i][0];
    }
    return result;

};

DHTable.prototype.solvePosition = function (target, currentValues) {

    currentValues = currentValues || this.getJointValues();

    var newValues = currentValues.slice();
    for (var i = 0; i < 500; i++) {
        var p = this.getEndEffectorPosition(newValues);
        var vel = this.solveVelocity([target[0] - p[0], target[1] - p[1], target[2] - p[2]], newValues);
        for (var k = 0; k < vel.length; k++) {
            newValues[k] += vel[k];
        }
    }
    return newValues;

};

DHTable.prototype.getEndEffectorPosition = function (values) {

    values = Array.isArray(values) ? values : this.getJointValues();

    var result = numeric.identity(4);

    for (var i = 0, j = 0; i < this.rows.length; i++) {
        var row = this.rows[i];

        var alpha = row.alpha * (Math.PI / 180);
        var a = row.a;

        var d = row.type !== 'P' ? row.d : values[j++];
        var theta = row.type !== 'R' ? row.theta * (Math.PI / 180) : values[j++] * (Math.PI / 180);

        var ct = Math.cos(theta), st = Math.sin(theta);
        var ca = Math.cos(alpha), sa = Math.sin(alpha);

        var n11 = ct, n12 = -st, n13 = 0, n14 = a;
        var n21 = st * ca, n22 = ct * ca, n23 = -sa, n24 = -d * sa;
        var n31 = st * sa, n32 = ct * sa, n33 = ca, n34 = d * ca;
        var n41 = 0, n42 = 0, n43 = 0, n44 = 1;

        var m = [
            [n11, n12, n13, n14],
            [n21, n22, n23, n24],
            [n31, n32, n33, n34],
            [n41, n42, n43, n44]
        ];

        result = numeric.dot(result, m);

    }

    return [result[0][3], result[1][3], result[2][3]];

};

DHTable.prototype.reset = function () {
    for (var i = 0, j = this.rows.length; i < j; i++) {
        this.rows.pop().tr.remove();
    }
};

DHTable.prototype.update = function () {
    $('#updateButton').click();
};

function Row(link, alpha, a, d, theta, type, min, max) {

    var that = this;

    var tr = $('<tr>');

    $("<td></td>").text(link).appendTo(tr);

    this._alpha = $("<td contenteditable='true'></td>").text(alpha).appendTo(tr);
    this._a = $("<td contenteditable='true'></td>").text(a).appendTo(tr);
    this._d = $("<td contenteditable='true'></td>").text(d).appendTo(tr);
    this._theta = $("<td contenteditable='true'></td>").text(theta).appendTo(tr);

    var td = $("<td>").appendTo(tr);
    this.select = $('<select>').appendTo(td);
    $("<option />", {value: 'R', text: 'Revolute'}).appendTo(this.select);
    $("<option />", {value: 'P', text: 'Prismatic'}).appendTo(this.select);
    $("<option />", {value: 'F', text: 'Fixed'}).appendTo(this.select);
    this.select.val(type);

    this._min = $("<td contenteditable='true'></td>").appendTo(tr);
    this._max = $("<td contenteditable='true'></td>").appendTo(tr);

    var setDefaultLimits = function () {
        if (that.type === 'R') {
            that.min = (-90);
            that.max = (90);
        } else if (that.type === 'P') {
            that.min = (-5);
            that.max = (5);
        } else {
            that._min.text('-');
            that._max.text('-');
        }
    };

    if (min !== undefined && max !== undefined) {
        this.min = (min);
        this.max = (max);
    } else {
        setDefaultLimits();
    }

    this.select.change(function () {
        setDefaultLimits();
    });

    this.tr = tr;

}

Row.prototype = {

    constructor: Row,

    get alpha() {
        return parseFloat(this._alpha.text());
    },

    set alpha(val) {
        this._alpha.text(val);
    },

    get a() {
        return parseFloat(this._a.text());
    },

    set a(val) {
        this._a.text(val);
    },

    get d() {
        return parseFloat(this._d.text());
    },

    set d(val) {
        this._d.text(val);
    },

    get theta() {
        return parseFloat(this._theta.text());
    },

    set theta(val) {
        this._theta.text(val);
    },

    get type() {
        return this.select.val();
    },

    set type(val) {
        this.select.selected(val);
    },

    get min() {
        return parseFloat(this._min.text());
    },

    set min(val) {
        this._min.text(val);
        this.jointValue = (this.min + this.max) / 2;
    },

    get max() {
        return parseFloat(this._max.text());
    },

    set max(val) {
        this._max.text(val);
        this.jointValue = (this.min + this.max) / 2;
    },

    get jointValue() {
        if (this.type === 'R') {
            return this.theta;
        } else if (this.type === 'P') {
            return this.d;
        } else {
            return undefined;
        }
    },

    set jointValue(val) {
        if (this.type === 'R') {
            this._theta.text(val);
        } else if (this.type === 'P') {
            this._d.text(val);
        }
    },

    get isActuable() {
        return this.type === 'R' || this.type === 'P';
    }

};

