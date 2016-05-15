import {Component} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';

import {PROGRESSBAR_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import events = require('events');

@Component({
    selector: 'player',
    templateUrl: 'player.html',
    directives: [
        PROGRESSBAR_DIRECTIVES, TOOLTIP_DIRECTIVES
    ],
    styleUrls: ['player.css']
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
	private repeat:number;
    private playing:boolean;
    private muted:boolean;

    private volume:number = 1;

    public max:number = Infinity;
    public value:number = 0;

    constructor()
    {
        super();
        this.rendermedia = require('render-media');

		this.shuffle = false;
		this.repeat = 0;
        this.playing = false;
	}

    public playSong(data_source:any, callback:any) : void
    {
        this.rendermedia.render(data_source, this.media_player.nativeElement,
            function(err: any, elem: any)
            {
                if (err) throw err;
                // Fire callback when playback starts
                callback();
            }
        );
    }

    public getShuffle() : boolean
    {
        return this.shuffle;
    }

	private flip_shuffle(): void
	{
		this.shuffle = !this.shuffle;
	}

    public getRepeat() : boolean
    {
        return this.repeat == 1;
    }

    public getRepeatAll() : boolean
    {
        return this.repeat == 2;
    }

	private push_repeat(): void
	{
        this.repeat += 1;
        if(this.repeat > 2)
            this.repeat = 0;
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

    private nextSong() : void
    {
        this.emit('nextSong');
    }

    private prevSong() : void
    {
        this.emit('prevSong');
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
        // Calculate the precentage through the bar we clicked
        function clickPercent(event:any, element:any, offset_left:number) {
            return (event.pageX - offset_left) / element.clientWidth;
        }
        // Find the primary element of the bar
        var element = event.target;
        while(element.className != "progress")
        {
            element = element.parentNode;
        }
        // Calculate the total offset, from the left of the page
        var total_offset = 0;
        var offset_element = element;
        while(offset_element.offsetParent)
        {
            total_offset += offset_element.offsetLeft;
            offset_element = offset_element.offsetParent;
        }
        // Find the percentage through
        var precentage = clickPercent(event, element, total_offset);
        // Update media player, and in turn the progress bar
        // Note: We can only update the player, if max is not infinity
        if(this.max != Infinity)
        {
            this.media_player.nativeElement.currentTime = this.max * precentage;
        }
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
