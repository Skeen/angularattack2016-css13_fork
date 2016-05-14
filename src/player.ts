import {Component} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';

import events = require('events');

@Component({
    selector: 'player',
    templateUrl: 'player.html',
    directives: [
    ]
})
export class Player extends events.EventEmitter
{
    // Render-media library
    private rendermedia : any;

    // DOM-element
    @ViewChild('media_player')
    private media_player : ElementRef;

    constructor()
    {
        super();
        this.rendermedia = require('render-media');
        this.emit('ready');
    }

    playSong(data_source:any) : void
    {
        this.rendermedia.render(data_source, this.media_player.nativeElement,
            function(err: any, elem: any)
            {
                if (err) throw err;
                this.emit('playing');
            }.bind(this)
        );
    }

    songEnded() : void
    {
        this.emit('song-ended');
    }

    onPause() : void
    {
        this.emit('pause');
    }
}
