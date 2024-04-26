import { Holodeck } from './Holodeck';
import { 
    LineSegments, 
    LineBasicMaterial, 
    DirectionalLight} from 'three';
import { BoxLineGeometry } from 'three/addons/geometries/BoxLineGeometry.js';

export class Holoroom{
    private context: Holodeck;
    private room!: LineSegments;

    constructor(context: Holodeck){
        this.context = context;
        this.initRoom();
        this.initLights();
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
  
    initLights(){
        const light = new DirectionalLight(0xffffff, 3);
        light.position.set(1, 1, 1).normalize();
        this.context.scene.add(light);
    }

    setVisible(visible: boolean){
        if(visible)
            this.context.scene.add(this.room);
        else
            this.context.scene.remove(this.room);        
        
    }
}