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

        this.kine = new KineImpl();
        this.scene.add(this.kine);

        for (let i = 2; i < this.kine.components.length; i++) {
            this.kine.components.visible = false;
        }
        
        var end = new THREE.Mesh(new THREE.SphereBufferGeometry(0.25), new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: false}));
        this.scene.add(end);

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
            j.onChange((value) => {
                joint.jointValue = value;
            });
        }
        jointValuesFolder.open();



        window.addEventListener('keydown', evt => {
            
            var keycode = evt.which;
            if (keycode >= 49 && keycode <= 49+3) {
                that.changeVisibility(keycode-48);
            }

        }, false);

        var render = () => {
            requestAnimationFrame(render);
            var m = that.kine.computeEndEffectorTransform();
            end.position.setFromMatrixPosition(m);
            end.quaternion.setFromRotationMatrix(m);
            that.renderer.render(that.scene, that.camera);
        };

        render();

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

}



