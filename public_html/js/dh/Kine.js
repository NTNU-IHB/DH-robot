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

        for (var i = 0; i < this.numDOF; i++) {
            this.joints[i].jointValue = values[i];
        }

    }
    
    get jacobian() {
        
    }
    
    get endEffectorTransform() {
        
        var result = new THREE.Matrix4();
        for (var i = 0; i < this.components.length; i++) {
            var comp = this.components[i];
            result.multiply(comp.transformationMatrix);
        }
        return result;
        
    }

}

Kine.prototype.addComponent = function (comp) {

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

};


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
        this.matrix.copy(transformationMatrix);
 
        this.position.setFromMatrixPosition(transformationMatrix);
        this.quaternion.setFromRotationMatrix(transformationMatrix);

        var tubularSegments = 15, radius = 0.1, radiusSegments = 10;
        {
            var mesh = new THREE.Mesh(new THREE.TubeBufferGeometry(curve, tubularSegments, radius, radiusSegments, false), new THREE.MeshBasicMaterial({color: 0x0000ff}));
            mesh.applyMatrix(new THREE.Matrix4().getInverse(transformationMatrix));
            this.add(mesh);
        }

        {
            var mesh = new THREE.Mesh(new THREE.TubeBufferGeometry(curve, tubularSegments, radius, radiusSegments, false), new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true}));
            mesh.applyMatrix(new THREE.Matrix4().getInverse(transformationMatrix));
            this.add(mesh);
        }

    }
    
    get transformationMatrix() {
        return this.matrix;
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
            this.changeCallbacks[i]();
        }
    }

}

//##########################################################################
class RevoluteJoint extends Joint {

    constructor(name, axis, limit) {
        super(name, axis, limit);
        this.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(this.axis, THREE.Math.degToRad(this.jointValue)));
    }

    get jointValue() {
        return super.jointValue;
    }

    set jointValue(val) {
        super.jointValue = val;
        this.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(this.axis, THREE.Math.degToRad(val)));
    }
    
    get transformationMatrix() {
        return new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(this.axis, THREE.Math.degToRad(this.jointValue)));
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
    
    get transformationMatrix() {
        return new THREE.Matrix4().setPosition(new THREE.Vector3().copy(this.axis).multiplyScalar(this.jointValue));
    }

}
