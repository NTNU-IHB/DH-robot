/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class KineImpl extends Kine {

    constructor() {
        super();
       
        this.addComponent(joint1());
        this.addComponent(link1());
        this.addComponent(joint2());
        this.addComponent(link2());
        this.addComponent(joint3());
        this.addComponent(link3());
        this.addComponent(joint4());
        this.addComponent(link4());
        
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