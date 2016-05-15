import {Component} from '@angular/core';
import {Storage, Song, sha1} from 'music-streamer-library';
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

	private hasDuplicate(hash:string): boolean
	{		
		if(this.storageKeys.indexOf(hash) == -1)
		{
			return false;
		}
		return true;
	}
	
	public addSong(song:Song, callback?:any): void
	{
		var storedSong:Song = song;
		//add to storage first
		Storage.addSong(storedSong, function(err?:any, value?:string)
			{
				if(err || !value)
				{
					//TODO: handle error properly
				}
				if(!(this.hasDuplicate(value)))
				{
					this.songs.push(song);
					this.emit('addSong');
				}
				if(callback)
				{
					callback(err, value);
				}
			}.bind(this));	
	}

	public getKeys(callback?:any): void
	{
		Storage.getKeys(function(err?:any, keys?:string[])
			{
				if(err || !keys)
				{
					//TODO: handle error properly
					alert("Error getting list of stored items!");
				}
				this.storageKeys = keys;
				if(callback)
				{
					callback(undefined, keys);
				}
			}.bind(this));
	}

	public getSongs(callback?:any): void
	{
		this.getKeys(function(err?:any, keys?:string[])
			{
				this.getSongsRec([], callback);
			}.bind(this));
	}

	private getSongsRec(songs:Song[], callback?:any):void
	{		
		var next:number = songs.length;
		var key:string = this.storageKeys[next];
		if(!key)
		{
			this.songs = songs;
			callback(undefined, this.songs);
			return;
		}
		Storage.getSong(key, function(err?:any, song?:Song)
			{
				if(err || !song)
				{
					//TODO: Handle error properly
					alert("Error getting song from storage!");
				}
				songs.push(song);
				this.getSongsRec(songs, callback);
			}.bind(this));
	}
}
