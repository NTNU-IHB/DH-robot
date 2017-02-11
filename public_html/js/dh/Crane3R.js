/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class Crane3R extends Kine {
    
    constructor() {
        super();
        
        this.addComponent(new RevoluteJoint("j1", new THREE.Vector3(0,0,1), {min: THREE.Math.degToRad(-180), max: THREE.Math.degToRad(180)}));
        this.addComponent(new Link("l1", new THREE.Matrix4().makeTranslation(0,0,2)));
        this.addComponent(new RevoluteJoint("j2", new THREE.Vector3(0,1,0), {min: THREE.Math.degToRad(-90), max: THREE.Math.degToRad(45)}));
        this.addComponent(new Link("l2", new THREE.Matrix4().makeTranslation(7,0,0)));
        this.addComponent(new RevoluteJoint("j3", new THREE.Vector3(0,1,0), {min: THREE.Math.degToRad(10), max: THREE.Math.degToRad(120)}));
        this.addComponent(new Link("l3", new THREE.Matrix4().makeTranslation(5,0,0)));
        
    }
    
}
