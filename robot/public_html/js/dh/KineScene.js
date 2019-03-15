/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


'use strict';

var MODE = {
    ORBIT: 0,
    TRANSFORM: 1
};

class KineScene extends THREE.Scene {

    constructor(container) {
        super();

        this.container = container;
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    init() {

        var that = this;

        this.camera = new THREE.PerspectiveCamera(75, that.container.offsetWidth / that.container.offsetHeight, 0.1, 1000);
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(-5, 5, 5);

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor(new THREE.Color(0.9, 0.9, 0.9));
        this.renderer.setSize(that.container.offsetWidth, that.container.offsetHeight);
        that.container.appendChild(this.renderer.domElement);

        var gridHelper = new THREE.GridHelper(15, 15);
        gridHelper.rotateX(THREE.Math.degToRad(90));
        this.add(gridHelper);

        this.kine = new KineImpl();
        this.add(this.kine);

        for (let i = 2; i < this.kine.components.length; i++) {
            this.kine.components.visible = false;
        }

        this.end = new THREE.Mesh(new THREE.SphereBufferGeometry(0.15), new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: false}));
        this.add(this.end);

        this.initGUI();
        this.initControls();

        window.addEventListener('keydown', this.onKeyDown, false);

        window.addEventListener('resize', function () {
            that.camera.aspect = that.container.offsetWidth / that.container.offsetHeight;
            that.camera.updateProjectionMatrix();
            that.renderer.setSize(that.container.offsetWidth, that.container.offsetHeight);
        }, false);

        var render = () => {
            requestAnimationFrame(render);
            that.animate();
            that.renderer.render(that, that.camera);
        };

        render();

    }

    animate() {
        var m = this.kine.computeEndEffectorTransform(this.kine.jointValues);
        this.end.position.setFromMatrixPosition(m);
        this.end.quaternion.setFromRotationMatrix(m);

        if (this.mode === MODE.TRANSFORM) {
            this.transform.updateMatrixWorld();
            var v = this.transform.getWorldPosition();
            var e = this.transform.getWorldRotation();
            var target = [v.x, v.y, v.z, e.x, e.y, e.z];
            var angles = this.kine.solvePosition(target, this.kine.jointValues);
            this.kine.jointValues = angles;
        }

    }

    initControls() {

        this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.maxDistance = 500.0;
        this.orbitControls.maxPolarAngle = Math.PI * 0.495;
        this.orbitControls.target.set(0, 0, 0);

        this.transform = new THREE.AxisHelper(1);
        this.add(this.transform);

        this.transformControls = new THREE.TransformControls(this.camera, this.renderer.domElement);
        this.transformControls.setSpace("local");
        this.transformControls.attach(this.transform);
        this.add(this.transformControls);
        this.transformControls.enabled = false;
        this.transformControls.visible = false;

        this.mode = MODE.ORBIT;
    }

    initGUI() {
        var jointValues = {};
        for (let i = 1; i <= this.kine.numDOF; i++) {
            let id = 'j' + i;
            var j = this.kine.joints[i - 1];
            jointValues[id] = THREE.Math.radToDeg(j.jointValue);
            j.changeCallbacks.push((val) => jointValues[id] = THREE.Math.radToDeg(val));
        }
        var gui = new dat.GUI({autoplace: false});
        document.getElementById('gui').appendChild(gui.domElement);
        var jointValuesFolder = gui.addFolder('JointValues');
        for (var i = 1; i <= this.kine.numDOF; i++) {
            let joint = this.kine.joints[i - 1];
            var limit = joint.limit;
            var j = jointValuesFolder.add(jointValues, 'j' + i, THREE.Math.radToDeg(limit.min), THREE.Math.radToDeg(limit.max));
            j.onChange((value) => {
                joint.jointValue = THREE.Math.degToRad(value);
            });
            j.listen();
        }
        jointValuesFolder.open();
    }

    onKeyDown(evt) {

        var keycode = evt.which;
        if (keycode >= 49 && keycode <= 49 + 3) {
            this.changeVisibility(keycode - 48);
        } else if (keycode === 81) { //q
            this.switchControls();
        } else if (keycode === 87) { //w

        } else if (keycode === 82) { //r
            if (this.mode === MODE.TRANSFORM) {
                if (this.transformControls.getMode() === "translate") {
                    this.transformControls.setMode("rotate");
                } else {
                    this.transformControls.setMode("translate");
                }
            }
        }
    }

    changeVisibility(n) {

        for (var i = 0; i < n; i++) {
            var j = this.kine.joints[i];
            j.visible = true;
            j.nextLink.visible = true;
        }

        for (var i = n; i < this.kine.joints.length; i++) {
            var j = this.kine.joints[i];
            j.visible = false;
            j.nextLink.visible = false;
        }

    }

    switchControls() {
        if (this.mode === MODE.ORBIT) { //from orbit to transform

            this.transformControls.visible = true;
            this.transformControls.enabled = true;
            this.orbitControls.enabled = false;

            var m = this.kine.computeEndEffectorTransform(this.kine.jointValues);
            this.transform.position.setFromMatrixPosition(m);
            this.transform.quaternion.setFromRotationMatrix(m);
            this.transformControls.update();

            this.mode = MODE.TRANSFORM;
        } else if (this.mode === MODE.TRANSFORM) { //from transform to orbit

            this.transformControls.visible = false;
            this.transformControls.enabled = false;
            this.orbitControls.enabled = true;

            this.mode = MODE.ORBIT;
        }
    }

}



