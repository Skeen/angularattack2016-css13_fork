import {Component} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';

@Component({
    selector: 'player',
    templateUrl: 'player.html',
    directives: [
    ]
})
export class Player
{
    // Render-media library
    private rendermedia : any;

    // DOM-element
    @ViewChild('media_player')
    private media_player : ElementRef;

    constructor()
    {
        this.rendermedia = require('render-media');
    }

    playSong(data_source:any) : void
    {
        this.rendermedia.render(data_source, this.media_player.nativeElement,
            function(err: any, elem: any)
            {
                if (err) throw err;
            }
        );
    }
}
