import { Holodeck } from './Holodeck';
import { 
    BufferGeometry, 
    Vector3, 
    XRTargetRaySpace,
    Line} from 'three';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

export class ControllerManager{
    private context: Holodeck;
    private controllerModelFactory: XRControllerModelFactory;
    private controllers: XRTargetRaySpace[] = [];
    private selecting: number|null = null;
    private selectionLine!: Line;

    constructor(context: Holodeck){
        this.context = context;
        this.controllerModelFactory = new XRControllerModelFactory();
        this.initSelectionLine();
        this.initController(0);
        this.initController(1);
    }

    initSelectionLine(){
        const geometry = new BufferGeometry();
        geometry.setFromPoints([
          new Vector3(0, 0, 0), 
          new Vector3(0, 0, -5)
        ]);
        this.selectionLine = new Line(geometry);
    }

    initController(index: number){
        const geometry = new BufferGeometry();
        geometry.setFromPoints([
          new Vector3(0, 0, 0), 
          new Vector3(0, 0, -5)
        ]);
        
        const controller = this.context.xr.getController(index);
        this.context.scene.add(controller);
        this.controllers.push(controller);

        controller.addEventListener('selectstart', () => {
            if(this.selecting)
                this.entries[this.selecting].remove(this.selectionLine);
            this.selecting = index;
            controller.add(this.selectionLine);
        });
        controller.addEventListener('selectend', () => {
            if(this.selecting != index) return;
            this.selecting = null;
            controller.remove(this.selectionLine);
        });
        
        const controllerGrip = this.context.xr.getControllerGrip(index);
        controllerGrip.add(this.controllerModelFactory.createControllerModel(controllerGrip));
        this.context.scene.add(controllerGrip);
    }

    get entries(){
        return this.controllers;
    }
}