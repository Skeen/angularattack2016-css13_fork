import {Component} from '@angular/core';
import {Storage, Song} from 'music-streamer-library';
import {Playlist} from './playlist';

@Component({
	selector: 'localcontent',
	templateUrl: 'localcontent.html'
})
export class LocalContent extends Playlist
{
	private storageKeys:string[] = [];

	protected songs:Song[] = [];

	constructor()
	{
		super();
		super.setName("Local Content");
	}

	public addSong(song:Song): void
	{
		//add to storage first
		Storage.addSong(song, function(err?:any, value?:string)
			{
				if(err || !value)
				{
					//TODO: handle error properly
				}
				this.songs.push();
			}.bind(this));	
	}

	public updateKeys(): void
	{
		Storage.getKeys(function(err?:any, keys?:string[])
			{
				if(err || !keys)
				{
					//TODO: handle error properly
					alert("Error getting list of stored items!");
				}
				this.storageKeys = keys;
			}.bind(this));
	}

	public updateSong(): void
	{
		var songs:Song[] = [];
		for(var i = 0; i < this.storageKeys.length; i++)
		{
			var key = this.storageKeys[i];
			Storage.getSong(key, function(err?:any, song?:Song)
				{
					if(err || !song)
					{
						//TODO: Handle error properly
						alert("Error getting song from storage!");
					}
					songs[i] = song;
				}.bind(this));
		}
		this.songs = songs;
	}
}

/*
	public changeSong(index:number): void
	{
		this.changeSongIndex = index;
		this.emit("changingSong", index, this.song[index]);
	}

	public setActive(index:number): void
	{
		this.changeSongIndex = undefined;
		var newSong = this.songs[index]
		if(newSong)
		{	
			// Song has a blob object
			this.currentSongIndex = index;
			this.currentSong = newSong;	
		}
		else
		{
			alert("No song found in local content!");
			// TODO: handle error properly.
		}
		this.emit("changedSong");

	}

	public getSongIndex(index:number): void
	{
		return this.currentSongIndex;
	}

	public getChangeSongIndex(index:number): void
	{
		return this.changeSongIndex;
	}

	public sameSong(): void
	{
		this.changeSong(this.currentSongIndex);
	}

	public nextSong(repeat_list:boolean): void
	{
		var nextSongIndex = this.currentSongIndex + 1;
		if(nextSongIndex >= this.songs.length)
		{
			if(repeat_list)
			{
				nextSongIndex = 0;
			}
			else
			{
				// TODO: Output ng2-bootstrap alert
				console.log("No more songs!");
				return
			}
		}
		this.changeSong(nextSongIndex);
	}
*/
