import {Component} from '@angular/core';

import {Song} from 'music-streamer-library';

// Current active song character U+23F5 || &#9205;

@Component({
	selector: 'playlist',
	template:` 
        <ul>
            <li *ngFor="let song of songs; let i=index" 
                (dblclick)="changeSong(i)" 
                (click)="changeHighlight(i)">
                {{song.title}}
            </li>
        </ul>
        `

})
export class Playlist
{
	private songs:Song[] = [];
	private name:string;

	private currentSong:Song;
	private currentSongIndex:number;
	private highlightedIndex:number;

    constructor()
    {
        this.addSong(new Song("alfa"));
    }

	public addSong(song:Song): void
	{
		this.songs.push(song);
	}

	public changeHighlight(index:number): void
	{
		var newHighlightSong = this.songs[index];
		if(newHighlightSong)
		{
			this.highlightedIndex = index;
		}
		else
		{
			// No song found at given index.
			// TODO: error handling?
		}
	}

	public changeSong(index:number): void
	{	
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
/*
// Sortable table classes
export class Column
{

}

export class Sorter
{

}
*/
