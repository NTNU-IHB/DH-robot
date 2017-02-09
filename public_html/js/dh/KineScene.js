/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


'use strict';

function KineScene() {

}

KineScene.prototype.init = function () {

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

//    this.kine.joints[1].jointValue = 45;

    var jointValues = {};
    for (var i = 1; i <= this.kine.numDOF; i++) {
        jointValues['j' + i] = 0;
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

    this.scene.add(this.kine);

    window.addEventListener('resize', function () {
        that.camera.aspect = window.innerWidth / window.innerHeight;
        that.camera.updateProjectionMatrix();
        that.renderer.setSize(window.innerWidth / window.innerHeight);
    }, false);

    var render = function () {
        requestAnimationFrame(render);
        that.renderer.render(that.scene, that.camera);
    };


    render();
};

function joint1() {

    var joint = new RevoluteJoint(new THREE.Vector3(0, 0, 1), {min: -180, max: 180});

    var radius = 0.15, height = 0.3;
    var mesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 16, 16, false), new THREE.MeshBasicMaterial({color: 0xff0000}));
    mesh.applyMatrix(new THREE.Matrix4().makeTranslation(0, height / 2, 0));
    mesh.applyMatrix(new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(90)));
    joint.add(mesh);

    return joint;

}

function link1() {

    var relPos = new THREE.Vector3(0, -0.25, 2);
    var link = new Link(relPos);

    //Create a closed wavey loop
    var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0.5),
        new THREE.Vector3(0, -0.25, 0.75),
        new THREE.Vector3(0, 0.25, 1.25),
        new THREE.Vector3(0, 0, 1.5),
        relPos
    ]);

    // Create the final object to add to the scene
    var mesh = new THREE.Mesh(new THREE.TubeBufferGeometry(curve, 40, 0.1, 30, false), new THREE.MeshBasicMaterial({color: 0x0000ff}));
//    mesh.applyMatrix(new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(90)));
    mesh.applyMatrix(new THREE.Matrix4().setPosition(relPos.clone().negate()));

    link.add(mesh);

    return link;

}

function joint2() {

    var q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(20));

    var axis = new THREE.Vector3(0, 0, 1);
    var joint = new RevoluteJoint(axis, {min: -90, max: 90});
    joint.quaternion.copy(q);

//    var joint = new RevoluteJoint(new THREE.Vector3(0, 1, 0), {min: -45, max: 90});

    var radius = 0.15, height = 0.25;
    var mesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 16, 16, false), new THREE.MeshBasicMaterial({color: 0xff0000}));
    mesh.applyMatrix(new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(90)));
//    mesh.applyMatrix(new THREE.Matrix4().setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis)));
    joint.add(mesh);

    return joint;

}

function link2() {

    var len = 3;
    var link = new Link(new THREE.Vector3(len, 0, 0));

    //Create a closed wavey loop
    var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.5, 0, 0),
        new THREE.Vector3(1.25, -0.5, 0),
        new THREE.Vector3(2, 0, 0),
        new THREE.Vector3(len, 0, 0)
    ]);


    var mesh = new THREE.Mesh(new THREE.TubeBufferGeometry(curve, 30, 0.1, 30, false), new THREE.MeshBasicMaterial({color: 0x0000ff}));
    mesh.applyMatrix(new THREE.Matrix4().makeTranslation(-len, 0, 0));
    link.add(mesh);


    return link;

}

function joint3() {

    var joint = new RevoluteJoint(new THREE.Vector3(0, 0, 1), {min: -90, max: 90});

    var radius = 0.15, height = 0.25;
    var mesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 16, 16, false), new THREE.MeshBasicMaterial({color: 0xff0000}));
//    mesh.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0));
    mesh.applyMatrix(new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(90)));
    joint.add(mesh);

    return joint;

}


function link3() {

    var len = 1;
    var link = new Link(new THREE.Vector3(0, len, 0));

    //Create a closed wavey loop
    var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(0, len, 0)
    ]);

    // Create the final object to add to the scene
    var curveObject = new THREE.Mesh(new THREE.TubeBufferGeometry(curve, 80, 0.1, 80, false), new THREE.MeshBasicMaterial({color: 0x0000ff}));
    curveObject.applyMatrix(new THREE.Matrix4().makeTranslation(0, -len, 0));
    link.add(curveObject);

    return link;

}

