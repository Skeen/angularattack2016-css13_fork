import {Component} from '@angular/core';
import {Song, Album, Artist, HashTable, HTTP_HashTable} from 'music-streamer-library';

import events = require('events');

@Component({
	selector: 'playlist',
	templateUrl: 'playlist.html'
})

export class Playlist extends events.EventEmitter
{
	private songs:Song[] = [];
	private name:string = "New Playlist";

	private currentSong:Song;
	private currentSongIndex:number;
	private currentAlbum : Album;
	private currentArtists : Artist[];

	private dht: HashTable;

    constructor()
    {
        super();
		this.emit('ready');
	}

	public addSong(song:Song): void
	{		
		this.songs.push(song);
		this.emit('addSong');
	}

	public changeSong(index:number): void
	{
		this.emit("changingSong", index, this.songs[index]);
    }

    public setActive(index:number): void
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
            alert("No song found!");
			// No song found at given index.
			// TODO: error handling?
		}
		this.emit("changedSong");
	}

	public getSong(): Song
	{
		return this.currentSong;
	}

	public getSongIndex(): number
	{
		return this.currentSongIndex; 
	}

	private setDHT(dht:HashTable): void
	{
		this.dht = dht;
	}

	private getSongAlbum(song:Song): void
	{
		var albumSHA = song.getAlbum();
		this.dht.get(albumSHA, function(err?:any, res?:string)
			{
				if(err)
				{
					return;
				}
				this.album = Album.fromJSON(JSON.parse(res));
				this.albumName = this.album.name;
			}.bind(this));
	}

	private getSongArtists(song:Song): void
	{
		var artistSHAs = song.getArtists();
		for(var i = 0; i < artistSHAs.length; i++)
		{
			this.dht.get(artistSHAs[i], function(err?:any, res?:string)
			{
				if(err)
				{
					return;
				}
				this.artists[i] = Artist.fromJSON(JSON.parse(res));
				this.artistNames[i] = this.artists[i].name;
			}.bind(this));
		}
	}
}
