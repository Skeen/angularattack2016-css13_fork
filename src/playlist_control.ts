import {Component, ChangeDetectionStrategy} from '@angular/core';
import {Playlist} from './playlist';
import {TAB_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {Song} from 'music-streamer-library';

import events = require('events');

@Component({
	selector: 'playlist_control',
	templateUrl: 'playlist_control.html',
	directives:[TAB_DIRECTIVES],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class PlaylistControl extends events.EventEmitter
{
	private currentPlaylist: Playlist;
	private currentIndex: number = -1;

	// Which state is the GUI in?
	// 1 for playlists
	// 2 for local content
	// 3 for networking
	private activeState: number = -1;
	
	public playlists:Array<any> = [];

	constructor()
	{
		super();
		this.createPlaylist("Playlist 1");
		this.createPlaylist("Playlist 2");
		this.emit('ready');
	}

	public getActiveState(): number
	{
		return this.activeState;
	}

	public setLocalActive(): void
	{
		this.activeState = 2;
		this.emit("ChangingState", this.activeState);	
	}

	public setNetworkingActive(): void
	{
		this.activeState = 3;
		this.emit("ChangingState", this.activeState);
	}

	public getPlaylist(): Playlist
	{
		return this.currentPlaylist;
	}

	public getSong(): Song
	{
		return this.currentPlaylist.getSong();
	}

	public getPlaylistIndex(): number
	{
		return this.currentIndex;
	}

	public changePlaylist(index: number): void
	{
		this.activeState = 1;
		this.emit("ChangingState", this.activeState);
		this.emit("changingPlaylist", index, this.playlists[index]);
	}

	public setActive(index: number): void
	{
		var oldIndex = this.currentIndex;
		var playlist = this.playlists[index];
		if(playlist)
		{
			this.playlists[oldIndex].active = false;
			this.playlists[index].active = true;
			this.currentIndex = index;
			this.currentPlaylist = playlist;
			this.emit("changedPlaylist");
		}
		else
		{
			alert("No playlist found!");
		}
	}

	public createPlaylist(name: string): void
	{
		var createdPlaylist = new Playlist();
		createdPlaylist.setName(name);
		this.playlists.push(createdPlaylist);
	}

	public addPlaylist(playlist: Playlist): void
	{
		this.playlists.push(playlist);
	}
}
