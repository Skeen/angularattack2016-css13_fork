import {Component} from '@angular/core';

import {Song} from 'music-streamer-library';

// Current active song character U+23F5 || &#9205;

import events = require('events');

@Component({
	selector: 'playlist',
	templateUrl: 'playlist.html'
})
export class Playlist extends events.EventEmitter
{
	private songs:Song[] = [];
	private name:string;

	private currentSong:Song;
	private currentSongIndex:number;

    constructor()
    {
        super();
        this.emit('ready');
        this.addSong(new Song('13'));
	}

	public addSong(song:Song): void
	{
        this.emit('addSong');
		this.songs.push(song);
	}

	public changeSong(index:number): void
	{	
        this.emit("changeSong");
		var newSong = this.songs[index];
		if(newSong)
		{
			// Song was found at the provided index, changing to use that.
			this.currentSongIndex = index;
			this.currentSong = newSong;
		}
		else
		{	
			// No song found at given index.
			// TODO: error handling?
		}
	}

	public getSong(): Song
	{
		return this.currentSong;
	}

	public getSongIndex(): number
	{
		return this.currentSongIndex; 
	}
}
