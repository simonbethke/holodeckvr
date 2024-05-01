import { Holodeck } from './Holodeck';
import { 
    AudioListener,
    AudioLoader, 
    PositionalAudio} from 'three';

export class Audioscape{
    private context: Holodeck;
    private listener!: AudioListener;
    private activeAudio: PositionalAudio[] = [];
    private audioLoader: AudioLoader;

    constructor(context: Holodeck){
        this.context = context;
        this.audioLoader = new AudioLoader();
        this.initListener();
    }

    initListener(){
        this.listener = new AudioListener();
        this.context.camera.add(this.listener);
    }

    public async start(baseName: string){
        this.stop();
        this.playAudio(baseName + "_fl.mp3", -10, 1, -10);
        this.playAudio(baseName + "_fr.mp3", 10, 1, -10);
        this.playAudio(baseName + "_rl.mp3", -10, 1, 10);
        this.playAudio(baseName + "_rr.mp3", 10, 1, 10);
    }

    public stop(){
        this.activeAudio.forEach((a) => a.stop());
        this.activeAudio = [];
    }

    async playAudio(file: string, x: number, y: number, z: number){
        const buffer = await this.audioLoader.loadAsync(file);
        const positionalAudio = new PositionalAudio(this.listener);
        positionalAudio.position.set(x, y, z);
        positionalAudio.setBuffer(buffer);  
        positionalAudio.loop = true; 
        positionalAudio.setRolloffFactor(0.2);
        positionalAudio.play();
        this.activeAudio.push(positionalAudio);
        this.context.scene.add(positionalAudio);
    }
}