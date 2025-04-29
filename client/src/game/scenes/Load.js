import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Office } from './Office';

export class Load extends Scene
{
    constructor ()
    {
        super('Load');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0xffffff);

        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.add.text(512, 384, 'Loading', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center',
            justify: 'center',
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
    }
    update(){
        if(Office.startGame){
            this.scene.start('Office');
            this.scene.stop('Load');
            // Office.startGame=false;
        }
    }
}