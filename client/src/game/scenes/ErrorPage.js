import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class ErrorPage extends Scene
{
    constructor ()
    {
        super('ErrorPage');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0xffffff);

        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.add.text(512, 384, 'Error in loading the Character', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center',
            justify: 'center',
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
    }
}