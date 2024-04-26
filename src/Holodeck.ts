import { 
  Viewer, 
  WebXRMode } from '@mkkellogg/gaussian-splats-3d';
import { 
  WebXRManager, 
  Scene,
  WebGLRenderer,
  PerspectiveCamera} from 'three';
import { Holoroom } from './Holoroom';
import { ControllerManager } from './ControllerManager';
import { ScenePanel } from './ScenePanel';

export type AnimateFn = () => void|Promise<void>;

export class Holodeck{
  private gsFiles: string[];
  private viewer: Viewer;
  private controllerManager: ControllerManager;
  private room: Holoroom;
  private animationCallbacks: AnimateFn[] = [];
  private hideRoomWhenReady: boolean = false;
  
  constructor(gsFiles: string[]){
    this.gsFiles = gsFiles;


    this.viewer = new Viewer({
      'cameraUp': [0, 1, 0],
      'initialCameraPosition': [-3, 1.7, 3],
      'initialCameraLookAt': [0, 1, 0],    
      'webXRMode': WebXRMode.VR
    });
    
    this.room = new Holoroom(this);
    this.updateScene(this.gsFiles[0]);
    this.controllerManager = new ControllerManager(this);
    new ScenePanel(this);
  }

  public onAnimate(callback: AnimateFn){
    this.animationCallbacks.push(callback);
  }

  animate(){
    if(!this.viewer.splatMesh.visibleRegionChanging && this.hideRoomWhenReady){
      this.hideRoomWhenReady = false;
      this.room.setVisible(false);
    }

    this.animationCallbacks.forEach((cb) => cb());
  }
  
  public async updateScene(filename: string){
    this.room.setVisible(true);  
    while(this.viewer.splatMesh.scenes.length > 0){
      await this.viewer.removeSplatScene(0);
    }
      
    await this.viewer.addSplatScene('/splats/' + (filename), {
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
    this.hideRoomWhenReady = true
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

  get files(): string[]{
    return this.gsFiles;
  }

  get controller(): ControllerManager{
    return this.controllerManager;
  }
}