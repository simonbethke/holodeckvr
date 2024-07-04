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
        const panelService:any = {};
    
        const gui = new GUI({
          width: 200
        }); 
        this.context.files.forEach((baseName) => {
          panelService[baseName] = async () => {
            this.context.updateScene(baseName + '.splat');
            this.context.audio.start(baseName);
          }
          
          gui.add(panelService, baseName);
        });
    
        gui.domElement.style.visibility = 'hidden';
    
        const group = new InteractiveGroup();
        group.listenToPointerEvents(this.context.renderer, this.context.camera);
        this.context.controller.addInitializer((controller) => group.listenToXRControllerEvents(controller));
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