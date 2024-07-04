import { CircleGeometry, Mesh, MeshBasicMaterial, PlaneGeometry, Raycaster, Quaternion, XRTargetRaySpace, Matrix4, Vector3 } from "three";
import { Holodeck } from "./Holodeck";

export class Teleporter{    
    private context: Holodeck;
    private raycaster = new Raycaster();
    private floor!: Mesh;
    private marker!: Mesh;
    private selectingController?: XRTargetRaySpace;
    private destination?: Vector3;
    private tempMatrix = new Matrix4();
    private baseReferenceSpace!: XRReferenceSpace;

    constructor(context: Holodeck){
        this.context = context;
        this.initFloor();
        this.initMarker();
        this.initControllerListener();
        this.initRenderer();
    }

    initFloor(){
        this.floor = new Mesh(
            new PlaneGeometry( 30, 30, 2, 2 ).rotateX( - Math.PI / 2 ),
            new MeshBasicMaterial( { color: 0xbcbcbc, transparent: true, opacity: 0.25 } )
        );        
        this.context.scene.add(this.floor);
        this.floor.visible = false;
        
    }

    get baseSpace(){
        if(!this.baseReferenceSpace){
            this.baseReferenceSpace = this.context.renderer.xr.getReferenceSpace() as XRReferenceSpace;
        }
        return this.baseReferenceSpace;
    }

    initMarker(){
        this.marker = new Mesh(
            new CircleGeometry( 0.25, 32 ).rotateX( - Math.PI / 2 ),
            new MeshBasicMaterial( { color: 0xbcbcbc } )
        );      
        this.context.scene.add(this.marker);
        this.marker.visible = false;
    }

    initControllerListener(){
        this.context.controller.addInitializer((controller) => {
            controller.addEventListener('selectstart', () => this.selectingController = controller);
            controller.addEventListener('selectend', () => this.teleport());
        });
    }

    initRenderer(){
        this.context.onAnimate(() => {
            this.destination = undefined;
            if(this.selectingController){
                this.tempMatrix.identity().extractRotation(this.selectingController.matrixWorld);
					this.raycaster.ray.origin.setFromMatrixPosition(this.selectingController.matrixWorld);
					this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
					const intersects = this.raycaster.intersectObjects([this.floor]);

					if (intersects.length > 0)
						this.destination = intersects[0].point;
            }

            if (this.destination) this.marker.position.copy(this.destination);

            this.marker.visible = this.destination !== undefined;
        });
    }

    teleport(){
        this.selectingController = undefined;
        if (this.destination) {
            const offsetPosition = { x: - this.destination.x, y: - this.destination.y, z: - this.destination.z, w: 1 };
            const offsetRotation = new Quaternion();
            const transform = new XRRigidTransform( offsetPosition, offsetRotation );
            const teleportSpaceOffset = this.baseSpace.getOffsetReferenceSpace( transform );
            if(teleportSpaceOffset)
                this.context.renderer.xr.setReferenceSpace(teleportSpaceOffset);
        }
    }
}