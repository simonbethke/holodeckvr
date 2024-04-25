import { 
  Viewer, 
  WebXRMode } from '@mkkellogg/gaussian-splats-3d';
import { 
  BufferGeometry,
  Vector3, 
  Line, 
  LineSegments, 
  LineBasicMaterial, 
  DirectionalLight, 
  WebXRManager, 
  XRTargetRaySpace,
  Scene,
  WebGLRenderer,
  PerspectiveCamera} from 'three';
import { HTMLMesh } from 'three/addons/interactive/HTMLMesh.js';
import { InteractiveGroup } from 'three/addons/interactive/InteractiveGroup.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { BoxLineGeometry } from 'three/addons/geometries/BoxLineGeometry.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export class Holodeck{
  private gsFiles: string[];
  private currentFile: number = 0;
  private viewer: Viewer;
  private controllerModelFactory: XRControllerModelFactory;
  private liveControllers: XRTargetRaySpace[] = [];
  private room?: LineSegments;
  private animationCallbacks: (() => void)[] = [];
  
  constructor(gsFiles: string[]){
    this.gsFiles = gsFiles;
    this.controllerModelFactory = new XRControllerModelFactory();


    this.viewer = new Viewer({
      'cameraUp': [0, 1, 0],
      'initialCameraPosition': [-3, 1.7, 3],
      'initialCameraLookAt': [0, 1, 0],    
      'webXRMode': WebXRMode.VR
    });
    
    this.updateScene();
    this.initRoom();
    this.initLights();
    this.initController(0);
    this.initController(1);
    this.initPanel();
  }  
  
  initLights(){
    const light = new DirectionalLight(0xffffff, 3);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);
  }
  
  initController(index: number){
    const geometry = new BufferGeometry();
    geometry.setFromPoints([
      new Vector3(0, 0, 0), 
      new Vector3(0, 0, -5)
    ]);
    
    const controller = this.xr.getController(index);
    controller.add(new Line(geometry));
    this.scene.add(controller);
    this.liveControllers.push(controller);
    
    const controllerGrip = this.xr.getControllerGrip(index);
    controllerGrip.add(this.controllerModelFactory.createControllerModel(controllerGrip));
    this.scene.add(controllerGrip);
  }
  
  initRoom(){
    this.room = new LineSegments(
      new BoxLineGeometry(
        10, 3, 10, 
        20, 6, 20).translate(0, 1.5, 0),
      new LineBasicMaterial({
        color: 0xbcbcbc
      })
    );
  }

  animate(){
    this.animationCallbacks.forEach((cb) => cb());
  }
  
  toggleRoom(show: boolean){
    if(!this.room)
      return;
    if(show)
      this.scene.add(this.room);
    else
      this.scene.remove(this.room);
    
  }
  
  initPanel(){
    const panelService:any = {
      showRoom: false
    };

    const gui = new GUI({
      width: 200
    }); 
    this.gsFiles.forEach((f) => {
      panelService[f] = () => this.updateScene(f);
      gui.add(panelService, f);
    });

    gui.add(panelService, 'showRoom').onChange((showRoom) => this.toggleRoom(showRoom));

    gui.domElement.style.visibility = 'hidden';

    const group = new InteractiveGroup();
    group.listenToPointerEvents(this.renderer, this.camera);
    this.liveControllers.forEach((controller) => group.listenToXRControllerEvents(controller));
    this.scene.add(group);

    const mesh = new HTMLMesh(gui.domElement);
    mesh.position.x = -1;
    mesh.position.y = 1.5;
    mesh.position.z = -1;
    this.animationCallbacks.push(() => mesh.lookAt(this.camera.position));
    mesh.scale.setScalar(2);
    group.add(mesh);
  }
  
  get file(): string{
    return this.gsFiles[this.currentFile];
  }
  
  get scene(): Scene{
    return this.viewer.threeScene;
  }

  get xr(): WebXRManager{
    return this.renderer.xr;
  }

  get renderer(): WebGLRenderer{
    return this.viewer.renderer;
  }

  get camera(): PerspectiveCamera{
    return this.viewer.camera;
  }
  
  async updateScene(filename?: string){
    while(this.viewer.splatMesh.scenes.length > 0){
      await this.viewer.removeSplatScene(0);
    }
      
    await this.viewer.addSplatScene('/splats/' + (filename ?? this.file), {
      'showLoadingUI': false,
      'position': [0, 0, 0],
      'rotation':  [0, 0, 0, 1],
      'scale': [1, -1, -1]
    });
    
    if(!this.viewer.selfDrivenModeRunning){
      const originalUpdate = this.viewer.update.bind(this.viewer);
      this.viewer.update = () => {
        this.animate();
        originalUpdate();
      };
      this.viewer.start();
    }
  }
}



/*

new RGBELoader()
					.setPath( 'textures/equirectangular/' )
					.load( 'moonless_golf_1k.hdr', function ( texture ) {

						texture.mapping = THREE.EquirectangularReflectionMapping;

						scene.background = texture;
						scene.environment = texture;

					} );
          
          */