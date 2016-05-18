import {Component} from '@angular/core';
import {Song, Album, Artist, HashTable, HTTP_HashTable} from 'music-streamer-library';

import events = require('events');

@Component({
	selector: 'playlist',
	templateUrl: 'playlist.html',
	styleUrls: ['playlist.css']
})

export class Playlist extends events.EventEmitter
{
	protected songs:Song[] = [];
	protected name:string = "New Playlist";

	protected currentSong:Song;
	protected currentSongIndex:number;
	protected currentAlbum : Album;
	protected currentArtists : Artist[];
    protected changeSongIndex:number;

	private dht: HashTable;

    constructor()
    {
        super();
		this.emit('ready');
	}

	protected setSongs(songs:Song[]):void
	{
		this.songs = songs;
	}

	public setName(name:string): void
	{
		this.name = name;
	}

	public addSong(song:Song): void
	{		
		this.songs.push(song);
	}

	public changeSong(index:number): void
	{
        this.changeSongIndex = index;
		this.emit("changingSong", index, this.songs[index]);
    }

    public setActive(index:number): void
    {
        this.changeSongIndex = undefined;
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
            alert("No song found!");
            return;
		}
		this.emit("changedSong");
	}

    public randomSong(): void
    {
        var nextSongIndex = Math.floor(Math.random() * (this.songs.length-1)) + 0 
        this.changeSong(nextSongIndex);
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
                this.emit("no-more-songs");
                return;
            }
        }
        this.changeSong(nextSongIndex);
    }

    public prevSong(repeat_list:boolean): void
    {
        var nextSongIndex = this.currentSongIndex - 1;
        if(nextSongIndex < 0)
        {
            if(repeat_list)
            {
                nextSongIndex = this.songs.length - 1;
            }
            else
            {
                nextSongIndex = 0;
            }
        }
        this.changeSong(nextSongIndex);
    }

	public getSong(): Song
	{
		return this.currentSong;
	}

	public getSongIndex(): number
	{
		return this.currentSongIndex; 
	}

    public getChangeSongIndex(): number
    {
        return this.changeSongIndex;
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
