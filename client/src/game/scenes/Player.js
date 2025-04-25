import {io} from 'socket.io-client'; 

export default class Player extends Phaser.Physics.Arcade.Sprite{
    
    constructor(scene,x,y,texture,clientId){
        super(scene,x,y,texture);
        this.x=x;
        this.y=y;
        this.clientId=clientId;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        // this.scene=scene;
        // this.texture=texture;
        // this.socket=io("http://localhost:9898")
        
    }
    
    

    
}