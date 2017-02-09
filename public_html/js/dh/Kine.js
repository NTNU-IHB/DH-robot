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

    constructor() {
        super();
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

    constructor(relPos) {
        super();
        this._relPos = relPos;
        this.transformMationMatrix = new THREE.Matrix4().setPosition(relPos);
        
        this.position.copy(relPos);
        
    }

    get relPos() {
        return this._relPos;
    }

}


//##########################################################################
class Joint extends KineComponent {

    constructor(axis, limit) {
        super();
        this._axis = axis;
        this._jointValue = 0;
        this.limit = limit;
        var axisHelper = new THREE.AxisHelper(1);
        this.add(axisHelper);
        this.changeCallbacks = [];
    }

    get axis() {
        return this._axis;
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

    constructor(axis, limit) {
        super(axis, limit);
    }

    get jointValue() {
        return super.jointValue;
    }

    set jointValue(val) {
        super.jointValue = val;
        this.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(this.axis, THREE.Math.degToRad(val)));
    }

}


//##########################################################################
class PrismaticJoint extends Joint {

    constructor(axis, limit) {
        super(axis, limit);
    }

    get jointValue() {
        return super.jointValue;
    }

    set jointValue(val) {
        super.jointValue = val;
        this.position.copy(new THREE.Vector3().copy(this.axis).multiplyScalar(val));
    }

}
