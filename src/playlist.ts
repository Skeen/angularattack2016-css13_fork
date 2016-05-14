import {Component} from '@angular/core';
import {Song} from 'music-streamer-library';

// Current active song character U+23F5 || &#9205;

@Component(
{
	selector: 'playlist',
	template:` 
		<ul>
			<li *ngFor="#song of songs; #i=index" 
					(dblclick)="changeSong(i)" 
					(click)="changeHighlight(i)">
				<div *ngIf="(i == getSongIndex()">
	
				</div>
				<div *ngIf="!(i == getSongIndex())">
					
				</div>
			</li>
		</ul>
		`
})
export class Playlist
{
	private songs:Song[];
	private playlistName;

	private currentSong:Song;
	private currentSongIndex:number;
	private highlightedIndex:number;

	constructor();
	constructor(name:string);
	constructor(name?:string)
	{
		if(name)
			this.name = name;
		else
			this.name = "new";
	}

	public addSong(song:Song): void
	{
		songs.push(song);
	}

	public changeHighlight(index:number): void
	{
		var newHighlightSong = songs[index];
		if(newHighlightSong)
		{
			highlightedIndex = index;
		}
		else
		{
			// No song found at given index.
			// TODO: error handling?
		}
	}

	public changeSong(index:number): void
	{	
		var newSong = songs[index];
		if(newSong)
		{
			// Song was found at the provided index, changing to use that.
			currentSongIndex = index;
			currentSong = newSong;
		}
		else
		{	
			// No song found at given index.
			// TODO: error handling?
		}
	}

	public getSong(): Song
	{
		return currentSong;
	}

	public getSongIndex(): number
	{
		return currentSongIndex; 
	}
}

// Sortable table classes
export class Column
{

}

export class Sorter
{

}


