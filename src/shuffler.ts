import {Component} from '@angular/core';
import events = require('events');

@Component({
	selector: 'shuffler',
	templateUrl: 'shuffler.html'
})

export class Shuffler
{
	private shuffle:boolean;
	private repeat:boolean;
    private playing:boolean;

	constructor()
	{
		this.shuffle = false;
		this.repeat = false;
        this.playing = false;
	}

	public flip_shuffle(): void
	{
		this.shuffle = !this.shuffle;
	}
	
	public flip_repeat(): void
	{
		this.repeat = !this.repeat;
	}

	public flip_playing(): void
	{
		this.playing = !this.playing;
	}
}
