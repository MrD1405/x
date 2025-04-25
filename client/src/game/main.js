import { Boot } from './scenes/Boot';

import { Office } from './scenes/Office';
import { MainMenu } from './scenes/MainMenu';
import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';
import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';
// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 640,
    parent: 'game-container',
    physics:{
        default:'arcade',
        arcade:{
            debug:false,
            gravity:{y:0},
        }
    },
    pixelArt:true,
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        Office,
        MainMenu
    ],
    
    
};

const StartGame = (parent) => {

    

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
