import { Holodeck } from './Holodeck';
import { 
    BufferGeometry, 
    Vector3, 
    XRTargetRaySpace,
    Line} from 'three';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

export type ControllerInitializer = (controller: XRTargetRaySpace) => void;

export class ControllerManager{
    private context: Holodeck;
    private controllerModelFactory: XRControllerModelFactory;
    private controllers: XRTargetRaySpace[] = [];
    private initializers: ControllerInitializer[] = [];


    constructor(context: Holodeck){
        this.context = context;
        this.controllerModelFactory = new XRControllerModelFactory();
        this.initController(0);
        this.initController(1);
    }

    public addInitializer(initializer: ControllerInitializer){
        this.controllers.forEach(initializer);
        this.initializers.push(initializer);
    }

    generateSelectionLine(){
        const geometry = new BufferGeometry();
        geometry.setFromPoints([
          new Vector3(0, 0, 0), 
          new Vector3(0, 0, -5)
        ]);
        return new Line(geometry);
    }

    initController(index: number){
        const controller = this.context.xr.getController(index);   
        this.context.scene.add(controller);
        this.controllers.push(controller);     
        controller.add(this.generateSelectionLine());
        
        const controllerGrip = this.context.xr.getControllerGrip(index);
        controllerGrip.add(this.controllerModelFactory.createControllerModel(controllerGrip));
        this.context.scene.add(controllerGrip);

        this.initializers.forEach((init) => init(controller));
    }
}