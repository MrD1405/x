import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import Player from './Player';
import {io} from 'socket.io-client'; 
export class Office extends Scene
{
    cursors;
    player_instance;
    #startGame;
    pos;
    oldPos={x:0,y:0};
    vel;
    players={};//dictionary with key of socket.id
    otherPlayers={};
    layer1;
    layer2;
    clientId;
    constructor ()
    {
        super('Office');
    }
    
    preload(){
       

        //loading spritesheet
        //load this assest from backend
        this.load.atlas('male_character','../../../assets/anim/Adam_16x16.png',
            '../../../assets/anim/sprites.json');
         
    }
    initializeSocket(){
        this.socket=io('http://localhost:9898',"player");
    }
    create ()
    {
        //starting websocket
        this.initializeSocket();
        this.setupSocketEvents();

        //loading tilemap
        const map=this.make.tilemap({key:'map'});
        const tileset=map.addTilesetImage('Interiors','tiles',32,32,0,0);
        const tilesetFloor=map.addTilesetImage('flooring','flooring',32,32,0,0);
        this.layer1=map.createLayer('Tile Layer 1',tilesetFloor,0,0)
        this.layer2=map.createLayer('objects',tileset,0,0);
        this.layer2.setCollisionByExclusion([-1]);

        //input handling
        this.cursors=this.input.keyboard.createCursorKeys();

        
        //assigning each frame based on name in spritesheet
        this.createAnimations();
        
    }
    
    update(){
        const speed=60.5;
       
        //changing velocity of player based on input
        let player_velocity=new Phaser.Math.Vector2();
    
        if(!this.cursors.left.isDown && !this.cursors.right.isDown&& !this.cursors.up.isDown&& !this.cursors.down.isDown ){
            this.player_instance.anims.play('idle-right',true);
        }
        if(this.cursors.left.isDown){
            player_velocity.x=-1;
            
            this.player_instance.anims.play('run-left',true)

        }
        else if(this.cursors.right.isDown){
            player_velocity.x=1;
           
            this.player_instance.anims.play('run-right',true);
        }
        if(this.cursors.up.isDown){
            player_velocity.y=-1;
          
            this.player_instance.anims.play('run-right',true);
        }
        else if(this.cursors.down.isDown){
            player_velocity.y=1;
            
            this.player_instance.anims.play('run-right',true);
        }
        player_velocity.normalize();
        player_velocity.scale(speed);
        this.player_instance.setVelocity(player_velocity.x,player_velocity.y);

        this.pos.x=this.player_instance.x;
        this.pos.y=this.player_instance.y;
        console.log(this.player_instance.x,this.player_instance.y);
        console.log(this.oldPos.x,this.oldPos.y);
        if(this.pos.x!=this.oldPos.x|| this.pos.y!=this.oldPos.y){
            this.socket.emit("playerMovement",{
                clientId:this.clientId,
                x:this.pos.x,
                y:this.pos.y,
                vel:{x:this.vel.x,y:this.vel.y},
            });
            this.oldPos.x=this.pos.x;
            this.oldPos.y=this.pos.y;
            
        }
        
        
        ///if a person enters a certain boundary create another room for him
        //we should have 2 desks and a meeting room
        //create whiteboard
        //enable video and audio call features
        

    }
    setupSocketEvents(){
        this.socket.emit('addMember',this.clientId);
        this.socket.on('playerInfo',(data)=>{
            const {clientId,x,y,vel}=data;
            this.clientId=clientId;
            //console.log(clientId);
            this.#startGame=true;
            this.pos={x:x,y:y};
            this.vel=vel;
            this.player_instance=new Player(this,this.pos.x,this.pos.y,'male_character','player1');
            //console.log(this.player_instance);  
            this.player_instance.setBounce(0.2);
            this.player_instance.setCollideWorldBounds(true);
            this.physics.add.collider(this.layer2,this.player_instance);
            this.player_instance.anims.play('idle-right',true);
            EventBus.emit('current-scene-ready', this);

        });
        this.socket.on("newMember",(data)=>{
            const clientId=data[0];
            const x=data[1];
            const y=data[2];
            const vel=data[3];
            //console.log(data);
            this.players[clientId]={//find out whose socket am i getting here
                x:x,
                y:y,
                vel:{x:vel.x,y:vel.y},
            }
            
            const player=this.physics.add.sprite(x,y,'male_character');
            player.anims.play('idle-right',true);
            this.physics.add.collider(this.layer2,player);
            player.setCollideWorldBounds(true);
            this.otherPlayers[clientId]=player;
        });
        this.socket.on("allMembers",(data)=>{
            //console.log(data);
            data.forEach(element => {
                //console.log(element);
                const {clientId,x,y,vel}=element;
                const jsonData={
                     x:element.x,
                     y:element.y,
                     vel:{x:vel.x,y:vel.y},
                };
                this.players[clientId]=jsonData;
                   
                const player=this.physics.add.sprite(x,y,'male_character');
                this.physics.add.collider(this.layer2,player);
                player.anims.play('idle-right',true);
                player.setCollideWorldBounds(true);
                this.otherPlayers[clientId]=player;
            });
        });
        this.socket.on("otherPlayerMovement",(data)=>{
            const clientId=data.clientId;
            const x=data.x;
            const y=data.y;
            const vel=data.vel;
            if(this.players[clientId]){
                const otherplayer=this.otherPlayers[clientId];
                
                this.tweens.add({
                    targets:otherplayer,
                    x:x,
                    y:y,
                    duration:1000,
                   ease:'Linear',
                    onActive:()=>{
                        if(vel.x<0)otherplayer.anims.play('run-left',true);
                        else otherplayer.anims.play('run-right',true);
                    },
                    // onComplete:()=>{
                    //     otherplayer.anims.play('idle-left',true);
                    // }
                })
            }
        });
        

    }
    createAnimations(){
        this.anims.create({
            key:'idle-right',
            frames:this.anims.generateFrameNames('male_character',{prefix:'idle_right',start:1,end:6,zeroPad:2}),
            frameRate:8,
            repeat:-1,
        })
        this.anims.create({
            key:'idle-left',
            frames:this.anims.generateFrameNames('male_character',{prefix:'idle_left',start:1,end:6,zeroPad:2}),
            frameRate:8,
            repeat:-1,
            
        })
        this.anims.create({
            key:'run-left',
            frames:this.anims.generateFrameNames('male_character',{prefix:'run_left',start:1,end:5,zeroPad:2}),
            frameRate:8,
            repeat:-1,
        })
        this.anims.create({
            key:'run-right',
            frames:this.anims.generateFrameNames('male_character',{prefix:'run_right',start:1,end:6,zeroPad:2}),
            frameRate:8,
            repeat:-1,
        })
    }
}

function handleCollision(player_instance,player){
    console.log(player_instance.clientId);
}



//try keep cameras with the main character all the mnap grows
//u need to emit a phaser event when it reaches a metting room 
//create a room for each sofa/meeting room and members of that room can also access that shit
//for each clientIdname shd be assocaited
//map clientid to socket.id of the individuals
//intial json object shd serve both x,y vel,charcter specification 