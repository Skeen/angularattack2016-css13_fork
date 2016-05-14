import {Component} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';

import {PROGRESSBAR_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import events = require('events');

@Component({
    selector: 'player',
    templateUrl: 'player.html',
    directives: [
        PROGRESSBAR_DIRECTIVES
    ]
})
export class Player extends events.EventEmitter
{
    // Render-media library
    private rendermedia : any;

    // DOM-element
    @ViewChild('media_player')
    private media_player : ElementRef;

    // Audio controls
    private shuffle:boolean;
	private repeat:boolean;
    private playing:boolean;
    private muted:boolean;

    private volume:number = 100;

    public max:number = Infinity;
    public value:number = 0;

    constructor()
    {
        super();
        this.rendermedia = require('render-media');
        this.emit('ready');

		this.shuffle = false;
		this.repeat = false;
        this.playing = false;
	}

    public playSong(data_source:any) : void
    {
        this.rendermedia.render(data_source, this.media_player.nativeElement,
            function(err: any, elem: any)
            {
                if (err) throw err;
            }
        );
    }

	private flip_shuffle(): void
	{
        this.emit('shuffle');
		this.shuffle = !this.shuffle;

        console.log(this.media_player);
	}
	
	private flip_repeat(): void
	{
        this.emit('repeat');
		this.repeat = !this.repeat;
	}

    private flip_playing(): void
    {
        if (this.media_player.nativeElement.paused) {
            // TODO: Check for content before playing
            this.media_player.nativeElement.play();
        } else { 
            this.media_player.nativeElement.pause();
        }
    }

    private mute(): void
    {
        this.media_player.nativeElement.muted = !this.muted;
    }

    private onEnded() : void
    {
        this.emit('song-ended');
    }

    private onPause() : void
    {
        this.emit('pause');
        this.playing = false;
    }

    private onPlay() : void
    {
        this.emit('play');
        this.playing = true;
    }

    private songNext() : void
    {
        this.emit('song-next');
    }

    private songPrevious() : void
    {
        this.emit('song-previous');
    }

    private updateTime() : void
    {
        this.updateDuration();
        this.value = this.media_player.nativeElement.currentTime;
    }

    private updateDuration() : void
    {
        this.max = this.media_player.nativeElement.duration;
    }

    private playAhead(event:any) : void
    {
        function clickPercent(event:any, element:any) {
            return (event.pageX - element.offsetLeft) / element.clientWidth;
        }
        var element = event.target;
        while(element.className != "progress")
        {
            element = element.parentNode;
        }
        var precentage = clickPercent(event, element);
        // Update media player, and in turn the progress bar
        this.media_player.nativeElement.currentTime = this.max * precentage;
    }

    private updateVolume() : void
    {
        this.volume = this.media_player.nativeElement.volume;
        this.muted  = this.media_player.nativeElement.muted;
    }

    private setVolume(event:any) : void
    {
        this.media_player.nativeElement.volume = event.target.value;
    }
}
