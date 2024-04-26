import { Holodeck } from './Holodeck';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { InteractiveGroup } from 'three/addons/interactive/InteractiveGroup.js';
import { HTMLMesh } from 'three/addons/interactive/HTMLMesh.js';

export class ScenePanel{
    private context: Holodeck;

    constructor(context: Holodeck){
        this.context = context;
        this.initPanel();
    }

    initPanel(){
        const panelService:any = {
          showRoom: false
        };
    
        const gui = new GUI({
          width: 200
        }); 
        this.context.files.forEach((f) => {
          panelService[f] = async () => this.context.updateScene(f);;
          
          gui.add(panelService, f);
        });
    
        gui.domElement.style.visibility = 'hidden';
    
        const group = new InteractiveGroup();
        group.listenToPointerEvents(this.context.renderer, this.context.camera);
        this.context.controller.entries.forEach((controller) => group.listenToXRControllerEvents(controller));
        this.context.scene.add(group);
    
        const mesh = new HTMLMesh(gui.domElement);
        mesh.position.x = -1;
        mesh.position.y = 1.5;
        mesh.position.z = -1;
        this.context.onAnimate(() => mesh.lookAt(this.context.camera.position));
        mesh.scale.setScalar(2);
        group.add(mesh);
      }
}