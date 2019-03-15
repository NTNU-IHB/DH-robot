
'use strict';

var Kine = function (container, table) {

    var that = this;

    THREE.Object3D.call(this);

    var renderer = new THREE.WebGLRenderer({antialiasing: true});
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(new THREE.Color(0.9, 0.9, 0.9));
    container.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.add(this);

    var camera = new THREE.PerspectiveCamera(55, container.offsetWidth / container.offsetHeight, 0.5, 10000);
    camera.up.set(0, 0, 1);
    camera.position.set(-5, -5, 5);

    var MODE = {ORBIT: 0, TRANSFORM: 1};
    this.mode = MODE.ORBIT;

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxDistance = 500.0;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 0, 0);

    var transform = new THREE.Object3D();
    this.add(transform);

    var transformControls = new THREE.TransformControls(camera, renderer.domElement);
    transformControls.attach(transform);
    this.add(transformControls);
    transformControls.enabled = false;
    transformControls.visible = false;

    var gridHelper = new THREE.GridHelper(15, 15);
    gridHelper.rotateX(Math.PI / 2);
    scene.add(gridHelper);

    this.scene = scene;

    window.addEventListener('resize', function () {
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    }, false);

    this.switchControls = function (ik) {
        if (that.mode === MODE.ORBIT) { //from orbit to transform

            transformControls.visible = true;
            transformControls.enabled = true;
            controls.enabled = false;

            var v = table.getEndEffectorPosition();
            transform.position.copy(new THREE.Vector3(v[0], v[1], v[2]));
            transformControls.update();

            that.mode = MODE.TRANSFORM;
        } else if (that.mode === MODE.TRANSFORM) { //from transform to orbit

            if (ik === true) {
                table.setJointValues(table.solvePosition(transform.position.toArray()))
            }

            transformControls.visible = false;
            transformControls.enabled = false;
            controls.enabled = true;

            that.mode = MODE.ORBIT;
        }
    };

    window.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
            case 81: // Q
                that.switchControls(true);
                break;
        }
    });

    var render = function () {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    };
    render();

    this.table = table;
    this.table.updateCallback = function (dh) {
        if (that.mode === MODE.TRANSFORM) {
            that.switchControls(false);
        }
        that.setFromDH(dh);
		that.updatePos();
    };

    this.axes = [];
    this.lineGeometry = undefined;

    this.gui = undefined;
    this.values = {};
	this.end = {
		pos: ""
	};
	
	this.updatePos = function() {
		var v = table.getEndEffectorPosition();
		that.end.pos = v[0].toFixed(2) + ", " + v[1].toFixed(2) + ", " + v[2].toFixed(2); 
	};

    this.linkMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff});

    this.clearArr = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            this.remove(obj);
            obj.dispose();
        }
        arr.length = 0; //clear array
    };

    this.table.update();
	

};

Kine.prototype = Object.create(THREE.Object3D.prototype);
Kine.prototype.constructor = Kine;

Kine.prototype.setFromDH = function (dh) {

    var that = this;

    if (this.gui !== undefined) {
        this.gui.domElement.remove();
    }
    this.gui = new dat.GUI();
    $('#gui').append(this.gui.domElement);
	
    var folder = this.gui.addFolder('Joint values');
	var end = this.gui.add(this.end, 'pos');
	end.listen();
    folder.open();

    for (var i = 0; i < dh.length; i++) {

        var row = dh[i];
        if (row.isActuable === true) {

//            row.jointValue = (row.min + row.max) / 2;
            this.values['j' + (i + 1)] = row.jointValue;

            var j = folder.add(this.values, 'j' + (i + 1), row.min, row.max);
            j.onChange(function (value) {

                for (var k = 0; k < that.axes.length - 1; k++) {
                    var type = that.table.rows[k];
                    if (type.isActuable) {
                        that.table.rows[k].jointValue = that.values['j' + (k + 1)].toFixed(2);
                    }

                }
				that.updatePos();

                that.update();
            });

        }

    }

    this.update();

};

Kine.prototype.update = function () {

    var dh = this.computeFK(this.table.rows);

    this.clearArr(this.axes);

    for (var i = -1; i < dh.length; i++) {

        var link = new CustomAxis(0.5);
        if (i !== -1) {
            var matrix = dh[i];
            link.position.setFromMatrixPosition(matrix);
            link.rotation.setFromRotationMatrix(matrix);
        }

        this.add(link);
        this.axes.push(link);

    }

    var geometry = new THREE.Geometry();
    for (var i = 1; i < this.axes.length; i++) {

        var a1 = this.axes[i - 1];
        var a2 = this.axes[i];

        geometry.vertices.push(a1.position);
        geometry.vertices.push(a2.position);

    }
    if (this.lines === undefined) {
        this.lines = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0x000000}));
        this.add(this.lines);

    } else {
        this.lines.geometry.dispose();
        this.lines.geometry = geometry;
        this.lines.geometry.verticesNeedUpdate = true;
    }


};

Kine.prototype.computeFK = function (dh) {

    var tmp = new THREE.Matrix4();

    var result = new THREE.Matrix4();
    var results = [];

    for (var i = 0; i < dh.length; i++) {

        var alpha = THREE.Math.degToRad(dh[i].alpha);
        var a = dh[i].a;

        var d = dh[i].d;
        var theta = THREE.Math.degToRad(dh[i].theta);


        var ct = Math.cos(theta), st = Math.sin(theta);
        var ca = Math.cos(alpha), sa = Math.sin(alpha);

//        var n11 = ct, n12 = -st * ca, n13 = st * sa, n14 = a * ct;
//        var n21 = st, n22 = ct * ca, n23 = -ct * sa, n24 = a * st;
//        var n31 = 0, n32 = sa, n33 = ca, n34 = d;
//        var n41 = 0, n42 = 0, n43 = 0, n44 = 1;
//
        var n11 = ct, n12 = -st, n13 = 0, n14 = a;
        var n21 = st * ca, n22 = ct * ca, n23 = -sa, n24 = -d * sa;
        var n31 = st * sa, n32 = ct * sa, n33 = ca, n34 = d * ca;
        var n41 = 0, n42 = 0, n43 = 0, n44 = 1;

        result.multiply(tmp.set(
                n11, n12, n13, n14,
                n21, n22, n23, n24,
                n31, n32, n33, n34,
                n41, n42, n43, n44));

        results.push(new THREE.Matrix4().copy(result));
    }



    return results;

};

function CustomAxis(size) {

    THREE.Object3D.call(this);

    size = size || 1;

    var length = size;
    var headLength = size * 0.1;
    var headWidth = size * 0.1;

    var arrows = [
        new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), length, 0xff0000, headLength, headWidth),
        new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), length, 0x00ff00, headLength, headWidth),
        new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), length, 0x0000ff, headLength, headWidth)
    ];

    for (var i = 0; i < arrows.length; i++) {
        this.add(arrows[i]);
    }

    var sphere = new THREE.Mesh(new THREE.SphereGeometry(size * 0.05, 16, 16), new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0.9}));
    this.add(sphere);

    this.dispose = function () {
        sphere.geometry.dispose();
        for (var i = 0; i < arrows.length; i++) {
            arrows[i].line.geometry.dispose();
            arrows[i].cone.geometry.dispose();
        }

    };

}

CustomAxis.prototype = Object.create(THREE.Object3D.prototype);
CustomAxis.prototype.constructor = CustomAxis;
