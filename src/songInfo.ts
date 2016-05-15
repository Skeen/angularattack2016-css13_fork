import {Component} from '@angular/core';
import {Song, Album, Artist} from 'music-streamer-library';
import {Playlist} from './playlist';

import events = require('events');

@Component({
	selector: 'songInfo',
	templateUrl: 'songInfo.html'
})

export class SongInfo
{
	private thumb:any;

	private albumName:string = "";
	private artistNames:string[] = [];

	private playlist: Playlist;

	constructor()
	{
		// Default values.
		this.thumb = null;
		//this.playlist_element.on('changedSong', () =>{});
	}

	public hookToPlaylist(playlist_element:Playlist)
	{
		this.playlist = playlist_element;
		this.playlist.on('changedSong', function()
			{
				this.setActiveSong(this.playlist.getSong());
			}.bind(this));
	}

	public setActiveSong(song:Song): void
	{
		this.albumName = song.getAlbumName();
		//TODO: fix typo ger
		this.artistNames = song.getArtistNames();
		//
		//TODO: get album thumbnail and use it
	}
}
