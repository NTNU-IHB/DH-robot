/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

'use strict';

class Kine extends THREE.Object3D {

    constructor() {
        super();
        this.numDOF = 0;

        this.components = [];
        this.links = [];
        this.joints = [];

    }

    get jointValues() {
        var result = [];
        for (let i = 0; i < this.numDOF; i++) {
            result[i] = this.joints[i].jointValue;
        }
        return result;
    }

    set jointValues(values) {

        for (let i = 0; i < this.numDOF; i++) {
            this.joints[i].jointValue = values[i];
        }

    }

    computeJacobian(values, full) {

        var EPS = 1E-6;
        var p1 = new THREE.Vector3(), p2 = new THREE.Vector3();
        var e1 = undefined, e2 = undefined;

        var rows = full ? 6 : 3;
        var cols = values.length;

        var J = [];
        for (let i = 0; i < rows; i++) {
            J.push(Array(cols));
        }

        var m = this.computeEndEffectorTransform(values);
        p1.setFromMatrixPosition(m);
        if (full === true) {
            e1 = new THREE.Euler().setFromRotationMatrix(m);
        }

        for (let i = 0; i < values.length; i++) {

            var vals = values.slice();
            vals[i] += EPS;

            m = this.computeEndEffectorTransform(vals);
            p2.setFromMatrixPosition(m);

            J[0][i] = (p2.x - p1.x) / EPS;
            J[1][i] = (p2.y - p1.y) / EPS;
            J[2][i] = (p2.z - p1.z) / EPS;

            if (full === true) {
                if (e2 === undefined) {
                    e2 = new THREE.Euler();
                }
                e2.setFromRotationMatrix(m);
                J[3][i] = (e2.x - e1.x) / EPS;
                J[4][i] = (e2.y - e1.y) / EPS;
                J[5][i] = (e2.z - e1.z) / EPS;
            }

        }

        return J;

    }

    solveVelocity(target, values) {

        var lambda = 0.1;
        var full = target.length === 6;

        var j = this.computeJacobian(values, full);
        var jt = numeric.transpose(j);
        var eye = numeric.identity(full ? 6 : 3);
        var jjt = numeric.dot(j, jt);
        var plus = numeric.mul(eye, lambda * lambda);
        var inv = numeric.dot(jt, numeric.inv(numeric.add(jjt, plus)));

        var vel = numeric.dot(inv, target);

        var result = [];
        for (var i = 0; i < values.length; i++) {
            result[i] = vel[i][0];
        }
        return result;

    }

    solvePosition(target, values) {

        var that = this;
        var full = target.length === 6;
        var p = new THREE.Vector3();
        var e = undefined;

        var newValues = values.slice();
        for (var i = 0; i < 1000; i++) {
            var m = that.computeEndEffectorTransform(newValues);
            p.setFromMatrixPosition(m);

            var dX;
            if (full === false) {
                dX = [[target[0] - p.x], [target[1] - p.y], [target[2] - p.z]];
            } else {
                if (e === undefined) {
                    e = new THREE.Euler();
                }
                e.setFromRotationMatrix(m);
                dX = [
                    [target[0] - p.x], [target[1] - p.y], [target[2] - p.z],
                    [target[3] - e.x], [target[4] - e.y], [target[5] - e.z]
                ];
            }


            var vel = that.solveVelocity(dX, newValues);
            for (let k = 0; k < this.numDOF; k++) {
                let lim = that.joints[k].limit;
                let newVal = newValues[k] + vel[k];
                if (lim.min > newVal) {
                    newVal = lim.min;
                } else if (lim.max < newVal) {
                    newVal = lim.max;
                }
                newValues[k] = newVal;
            }
        }
        return newValues;
    }

    addComponent(comp) {

        if (this.components.length === 0) {
            this.add(comp);
        } else {
            var prev = this.components[this.components.length - 1];
            prev.next = comp;
            comp.prev = prev;
            prev.add(comp);
        }

        if (comp instanceof Joint) {
            this.joints.push(comp);
            this.numDOF++;
        } else if (comp instanceof Link) {
            this.links.push(comp);
        }

        this.components.push(comp);

    }

    computeEndEffectorTransform(values) {


        var result = new THREE.Matrix4();
        for (var i = 0, j = 0; i < this.components.length; i++) {
            var comp = this.components[i];
            if (comp instanceof Joint) {
                result.multiply(comp.getTransformationMatrix(values[j++]));
            } else {
                result.multiply(comp.getTransformationMatrix());
            }
        }

        return result;
    }

}

class KineComponent extends THREE.Object3D {

    constructor(name) {
        super();
        this.name = name;
        this._prev = undefined;
        this._next = undefined;
    }

    set next(val) {
        this._next = val;
    }

    set prev(val) {
        this._prev = val;
    }

    get next() {
        return this._next;
    }

    get prev() {
        return this._prev;
    }

    get prevLink() {
        var prev = this;
        while ((prev = prev.prev) !== undefined) {
            if (prev instanceof Link) {
                return prev;
            }
        }
        return undefined;
    }

    get prevJoint() {
        var prev = this;
        while ((prev = prev.prev) !== undefined) {
            if (prev instanceof Joint) {
                return prev;
            }
        }
        return undefined;
    }

    get nextLink() {
        var next = this;
        while ((next = next.next) !== undefined) {
            if (next instanceof Link) {
                return next;
            }
        }
        return undefined;
    }

    get nextJoint() {
        var next = this;
        while ((next = next.next) !== undefined) {
            if (next instanceof Joint) {
                return next;
            }
        }
        return undefined;
    }

}


//##########################################################################
class Link extends KineComponent {

    constructor(name, transformationMatrix, curve) {
        super(name);
        this.transformationMatrix = transformationMatrix;
        var inv = new THREE.Matrix4().getInverse(transformationMatrix);

        this.position.setFromMatrixPosition(transformationMatrix);
        this.quaternion.setFromRotationMatrix(transformationMatrix);


        if (curve === undefined) {
            curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3().setFromMatrixPosition(transformationMatrix)
            ]);
        }

        var tubularSegments = 15, radius = 0.1, radiusSegments = 10;
        {
            var mesh = new THREE.Mesh(new THREE.TubeBufferGeometry(curve, tubularSegments, radius, radiusSegments, false), new THREE.MeshBasicMaterial({color: 0x0000ff}));
            mesh.applyMatrix(inv);
            this.add(mesh);
        }

        {
            var mesh = new THREE.Mesh(new THREE.TubeBufferGeometry(curve, tubularSegments, radius, radiusSegments, false), new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true}));
            mesh.applyMatrix(inv);
            this.add(mesh);
        }


    }

    getTransformationMatrix() {
        return this.transformationMatrix;
    }

}


//##########################################################################
class Joint extends KineComponent {

    constructor(name, axis, limit) {
        super(name);
        this.axis = axis;
        this.limit = limit;
        this._jointValue = (limit.max + limit.min) / 2;
        var axisHelper = new THREE.AxisHelper(1);
        this.add(axisHelper);
        this.changeCallbacks = [];
    }

    get jointValue() {
        return this._jointValue;
    }

    set jointValue(val) {
        this._jointValue = val;
        for (var i = 0; i < this.changeCallbacks.length; i++) {
            this.changeCallbacks[i](val);
        }
    }

}

//##########################################################################
class RevoluteJoint extends Joint {

    constructor(name, axis, limit) {
        super(name, axis, limit);
        this.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(this.axis, this.jointValue));
    }

    get jointValue() {
        return super.jointValue;
    }

    set jointValue(val) {
        super.jointValue = val;
        this.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(this.axis, val));
    }

    getTransformationMatrix(value) {
        return new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(this.axis, value));
    }

}




//##########################################################################
class PrismaticJoint extends Joint {

    constructor(name, axis, limit) {
        super(name, axis, limit);
        this.position.copy(new THREE.Vector3().copy(this.axis).multiplyScalar(this.jointValue));
    }

    get jointValue() {
        return super.jointValue;
    }

    set jointValue(val) {
        super.jointValue = val;
        this.position.copy(new THREE.Vector3().copy(this.axis).multiplyScalar(val));
    }

    getTransformationMatrix(value) {
        value = value || this.jointValue;
        return new THREE.Matrix4().setPosition(new THREE.Vector3().copy(this.axis).multiplyScalar(value));
    }

}

