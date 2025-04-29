import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import Player from './Player';
import { useAppStore } from '@/store';
import { io } from 'socket.io-client';
import { playerInfo } from '@/App';


let enableJoin=false;
export {enableJoin};
export class Office extends Scene
{
    cursors;
    startGame=false;
    player_instance;
    pos={x:0,y:0};
    oldPos={x:0,y:0};
    vel={x:0,y:0};
    players={};//dictionary with key of socket.id
    otherPlayers={};
    layer1;
    layer2;
    playerNames={};
    playerInfo;
    get startGame(){
        return this.startGame;
    }
    constructor ()
    {
        super('Office');
    }
    
    preload(){
       

        //loading spritesheet
        //load this assest from backend
        this.load.atlas('male_character','/src/assets/anim/Adam_16x16.png',
            '/src/assets/anim/sprites.json');
         
    }
    initializeSocket(){
        this.socket=io('http://localhost:8747/player');
    }
    create ()
    {
        this.playerInfo=playerInfo;
        //console.log(this.playerInfo);
        this.initializeSocket();
        this.setupSocketEvents(); 
    
        this.createAnimations();

        //loading tilemap
        const map=this.make.tilemap({key:'map'});
        const tileset=map.addTilesetImage('Interiors','tiles',32,32,0,0);
        const tilesetFloor=map.addTilesetImage('flooring','flooring',32,32,0,0);
        this.layer1=map.createLayer('Tile Layer 1',tilesetFloor,0,0)
        this.layer2=map.createLayer('objects',tileset,0,0);
        this.layer2.setCollisionByExclusion([-1]);

        this.player_instance=new Player(this,400,200,'male_character','player1');
        this.player_instance.setBounce(0.2);
        this.player_instance.setCollideWorldBounds(true);
        this.physics.add.collider(this.layer2,this.player_instance);
        this.player_instance.anims.play('idle-right',true);


        

        //input handling
        this.cursors=this.input.keyboard.createCursorKeys();

        
       
        
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
        // console.log(this.pos)
        this.pos.x=this.player_instance.x;
        
        this.pos.y=this.player_instance.y;
       
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
    
        if((this.player_instance.x>200)&& this.player_instance.x<300 && this.player_instance.y>100 && this.player_instance.y<200){
           if(!enableJoin)enableJoin=true;
            //this.socket.emit('createRoom',this.clientId);
        }
        else{
            enableJoin=false;
        }


        this.tweens.add({
            targets:this.playerNames[this.clientId],
            x:this.pos.x,
            y:this.pos.y-16,
            ease:'Linear',
            duration:2,
        })
        ///if a person enters a certain boundary create another room for him
        //we should have 2 desks and a meeting room
        //create whiteboard
        //enable video and audio call features
        

    }
    setupSocketEvents(){
        this.socket.emit('addMember',this.playerInfo);
        this.socket.on('playerInfo',(data)=>{
            const {clientId,x,y,name}=data;
            this.clientId=clientId;
            this.playerNames[clientId]=this.add.text(x,y-16,name,{
                fontFamily: 'Arial Black', fontSize: 10, color: '#000000',
                stroke: '#ffffff', strokeThickness: 1,
                align: 'center',
                justify: 'center',
            }).setOrigin(0.5).setDepth(100);
            
            this.startGame=true;
            this.pos={x:x,y:y};
            this.player_instance.x=this.pos.x;
            this.player_instance.y=this.pos.y;   
            
            this.playerNames[clientId]=this.playerName;
            
            EventBus.emit('current-scene-ready', this);

        });
        this.socket.on("newMember",(data)=>{
            const clientId=data[0];
            const x=data[1];
            const y=data[2];
            const name=data[3];
            //console.log(data);
            this.players[clientId]={
                x:x,
                y:y,
                name:name,
            }

            this.playerNames[clientId]=this.add.text(x,y-16,name,{
                fontFamily: 'Arial Black', fontSize: 10, color: '#000000',
                stroke: '#ffffff', strokeThickness: 1,
                align: 'center',
                justify: 'center',
            }).setOrigin(0.5).setDepth(100);

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
                const {clientId,x,y,name}=element;
                const jsonData={
                     x:element.x,
                     y:element.y,
                     name:element.name,
                };
                this.players[clientId]=jsonData;
                  
                this.playerNames[clientId]=this.add.text(x,y-16,name,{
                    fontFamily: 'Arial Black', fontSize: 10, color: '#000000',
                    stroke: '#ffffff', strokeThickness: 1,
                    align: 'center',
                    justify: 'center',
                }).setOrigin(0.5).setDepth(100);


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
            
            if(this.players[clientId]){
                const otherplayer=this.otherPlayers[clientId];
                const otherPlayerName=this.playerNames[clientId];
                console.log(otherPlayerName);
                this.tweens.add({
                    targets:otherPlayerName,
                    x:x,
                    y:y-16,
                    duration:1000,
                    ease:'Linear'
                });
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
                });
                
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
    createPlayer(){
        let info;
        
        this.socket.on('playerInfo',(data)=>{
            info=data;
        })
        console.log(info);
        return info;
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