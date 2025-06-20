import { SplatFileType, SplatMesh, VRButton } from "@sparkjsdev/spark";
import { 
  WebXRManager, 
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Color,
  Camera} from 'three';
import { ControllerManager } from './ControllerManager';
import { ScenePanel } from './ScenePanel';
import { Audioscape } from './Audioscape';
import { Teleporter } from './Teleporter';
import { Holoroom } from "./Holoroom";

export type AnimateFn = () => void|Promise<void>;

export class Holodeck{
  private gsFiles: string[];
  private controllerManager: ControllerManager;
  private room: Holoroom;
  private animationCallbacks: AnimateFn[] = [];
  private audioscape?: Audioscape;

  private _scene!: Scene;
  private _camera!: Camera;
  private _renderer!: WebGLRenderer;
  
  private currentSplat?: SplatMesh;
  
  constructor(gsFiles: string[]){
    this.gsFiles = gsFiles;

    this.init();

    this.room = new Holoroom(this);
    
    this.updateScene(this.gsFiles[0]);
    this.controllerManager = new ControllerManager(this);
    new Teleporter(this);
    new ScenePanel(this);
  }

  init(){
    this._scene = new Scene();
    this._camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._renderer = new WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this._renderer.domElement);    
    const vrButton = VRButton.createButton(this._renderer, {requiredFeatures: ['local-floor']}) as HTMLElement;
    vrButton.addEventListener('click', () => {
      // Create a MutationObserver
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            (async () => {
              const session = this.xr.getSession() as XRSession;
              
              this.xr.setReferenceSpace(await session.requestReferenceSpace('local-floor'));
            })();
          }
        });
      });

      // Configure the observer to watch for changes to the button's text
      observer.observe(vrButton, {
        childList: true, // Detects addition/removal of child nodes
        characterData: true, // Detects changes to text nodes
        subtree: true // Observes changes in descendants
      });
    });
		document.body.appendChild(vrButton);
    this._renderer.setAnimationLoop(this.animate.bind(this));
    this.xr.addEventListener
  }

  public onAnimate(callback: AnimateFn){
    this.animationCallbacks.push(callback);
  }

  animate(){
    this.animationCallbacks.forEach((cb) => cb());
    this._renderer.render(this._scene, this._camera);
  }
  
  public async updateScene(filename: string){
    if(this.currentSplat){
      this._scene.remove(this.currentSplat);
    }    
    this.room.setVisible(true);  
    this.currentSplat = new SplatMesh({ url: filename});
    this.currentSplat.quaternion.set(1, 0, 0, 0);
    this.currentSplat.position.set(0, 0, 0);
    this._scene.add(this.currentSplat);    
    this.room.setVisible(false);  
  }

  get xr(): WebXRManager{
    return this._renderer.xr;
  }

  get files(): string[]{
    return this.gsFiles;
  }

  get controller(): ControllerManager{
    return this.controllerManager;
  }

  get audio(): Audioscape{
    if(!this.audioscape)
      this.audioscape = new Audioscape(this);
    return this.audioscape;
  }

  get scene(): Scene{
    return this._scene;
  }

  get camera(): Camera{
    return this._camera;
  }

  get renderer(): WebGLRenderer{
    return this._renderer;
  }
}