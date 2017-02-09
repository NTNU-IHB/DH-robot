/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


'use strict';

class KineScene {

    init() {

        var that = this;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(-5, 5, 5);

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor(new THREE.Color(0.9, 0.9, 0.9));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        controls.maxDistance = 500.0;
        controls.maxPolarAngle = Math.PI * 0.495;
        controls.target.set(0, 0, 0);

        var gridHelper = new THREE.GridHelper(15, 15);
        gridHelper.rotateX(THREE.Math.degToRad(90));
        this.scene.add(gridHelper);

        this.kine = new Kine();
        this.kine.addComponent(joint1());
        this.kine.addComponent(link1());
        this.kine.addComponent(joint2());
        this.kine.addComponent(link2());
        this.kine.addComponent(joint3());
        this.kine.addComponent(link3());
        this.kine.addComponent(joint4());
        this.kine.addComponent(link4());



        var jointValues = {};
        for (var i = 1; i <= this.kine.numDOF; i++) {
            jointValues['j' + i] = this.kine.joints[i - 1].jointValue;
        }
        var gui = new dat.GUI();
        var jointValuesFolder = gui.addFolder('JointValues');
        for (var i = 1; i <= this.kine.numDOF; i++) {
            let joint = this.kine.joints[i - 1];
            var limit = joint.limit;
            var j = jointValuesFolder.add(jointValues, 'j' + i, limit.min, limit.max);
            j.onChange(function (value) {
                joint.jointValue = value;
            });
        }
        jointValuesFolder.open();

        var end = new THREE.Mesh(new THREE.SphereBufferGeometry(0.25), new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: false}));
        this.scene.add(end);

        this.scene.add(this.kine);

        var render = function () {
            requestAnimationFrame(render);
            var m = that.kine.endEffectorTransform;
            end.position.setFromMatrixPosition(m);
            end.quaternion.setFromRotationMatrix(m);
            that.renderer.render(that.scene, that.camera);
        };

        render();

    }

}

function joint1() {

    var joint = new RevoluteJoint("j1", new THREE.Vector3(0, 0, 1), {min: -180, max: 180});

    var radius = 0.15, height = 0.3;
    var mesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 16, 16, false), new THREE.MeshBasicMaterial({color: 0xff0000}));
    mesh.applyMatrix(new THREE.Matrix4().makeTranslation(0, height / 2, 0));
    mesh.applyMatrix(new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(90)));
    joint.add(mesh);

    return joint;

}

function link1() {

    var transformMationMatrix = new THREE.Matrix4()
            .makeTranslation(0, -0.25, 1.8).multiply(new THREE.Matrix4()
            .makeRotationX(THREE.Math.degToRad(40)));

    var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0.5),
        new THREE.Vector3(0, -0.25, 0.75),
        new THREE.Vector3(0, 0.25, 1.25),
        new THREE.Vector3(0, 0, 1.5),
        new THREE.Vector3().setFromMatrixPosition(transformMationMatrix)
    ]);

    return new Link("l1", transformMationMatrix, curve);

}

function joint2() {

    var axis = new THREE.Vector3(0, 1, 0);
    var joint = new RevoluteJoint("j2", axis, {min: -90, max: 20});

    var radius = 0.15, height = 0.25;
    var mesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 16, 16, false), new THREE.MeshBasicMaterial({color: 0xff0000}));
    mesh.applyMatrix(new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(90)));
    joint.add(mesh);

    return joint;

}

function link2() {

    var transformMationMatrix = new THREE.Matrix4()
            .makeTranslation(1.5, 0, 0).multiply(new THREE.Matrix4()
            .makeRotationX(THREE.Math.degToRad(-60)));

    var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.5, 0, 0),
        new THREE.Vector3(1.25, -0.5, 0),
        new THREE.Vector3(1.5, 0, 0),
        new THREE.Vector3().setFromMatrixPosition(transformMationMatrix)
    ]);

    return new Link("l2", transformMationMatrix, curve);
}

function joint3() {

    var joint = new RevoluteJoint("j3", new THREE.Vector3(0, 0, 1), {min: -180, max: 45});

    var radius = 0.15, height = 0.25;
    var mesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 16, 16, false), new THREE.MeshBasicMaterial({color: 0xff0000}));
    mesh.applyMatrix(new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(90)));
    joint.add(mesh);

    return joint;

}

function link3() {

    var transformMationMatrix = new THREE.Matrix4()
            .makeTranslation(0, 1, 0);

    var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3().setFromMatrixPosition(transformMationMatrix)
    ]);

    return new Link("l3", transformMationMatrix, curve);

}

function joint4() {

    var joint = new RevoluteJoint("j4", new THREE.Vector3(1, 0, 0), {min: -90, max: 90});

    var radius = 0.15, height = 0.25;
    var mesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 16, 16, false), new THREE.MeshBasicMaterial({color: 0xff0000}));
    mesh.applyMatrix(new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(90)));
    joint.add(mesh);

    return joint;

}


function link4() {

    var transformMationMatrix = new THREE.Matrix4()
            .makeTranslation(1, -0.2, 0.5);

    var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(0.5, 0.2, 0.4),
        new THREE.Vector3(0.8, -0.1, 0.5),
        new THREE.Vector3().setFromMatrixPosition(transformMationMatrix)
    ]);

    return new Link("l4", transformMationMatrix, curve);

}

