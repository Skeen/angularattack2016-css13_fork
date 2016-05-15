import {Component} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';

import {TorrentClient, Song, Storage, createSong} from 'music-streamer-library';
import {HashTable, HTTP_HashTable} from 'music-streamer-library';

import {Player} from './player';
import {Playlist} from './playlist';
import {Search} from './search';
import {SongInfo} from './songInfo';
import {PlaylistControl} from './playlist_control';
import {DropArea} from './droparea';
import {LocalContent} from './localcontent';
import {Downloads} from './downloads';

import {TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html',
    directives: [
        Player, Playlist, Search, SongInfo, PlaylistControl, DropArea,
		LocalContent, Downloads,
		TOOLTIP_DIRECTIVES    
	],
    styleUrls: ['app.component.css']
})
export class AppComponent
{
    private magnetURI : string = "magnet:?xt=urn:btih:60e0fcf843dbeb02dc08f34e4e6ca1e9bf385d89&dn=tiasu-analogue_ambitions-01_the_start.ogg&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io";

    @ViewChild('player')
    private player_element : Player;

    @ViewChild('playlist')
    private playlist_element : Playlist;

	@ViewChild('localcontent')
	private localcontent_element : LocalContent;

	@ViewChild('downloads')
	private downloads_element : Downloads;

	@ViewChild('search')
	private search_element : Search;

    private dht : HashTable;

    private search_result : Song;

    private seeding : any = [];

    // TODO: Add DHT code
    // TODO: Add replication code
    // TODO: Add searching
    // TODO: Add search results
    // TODO: Seed local content
    // TODO: Allow uploading local content
    
    private onSubmit() : void
    {
        this.download_song(this.magnetURI);
    }

    private download_song(magnetURI:string) : void
    {
        this.downloads_element.downloadSong(magnetURI);
    }
	

    constructor()
    {
        this.dht = new HTTP_HashTable("http://46.101.162.151:3000/");
    }

    ngAfterViewInit()
    {
        this.playlist_element.on('changingSong', function(index:number, new_song:Song)
        {
            this.player_element.playSong(new_song.getRenderable(), function()
            {
                this.playlist_element.setActive(index);
            }.bind(this));
        }.bind(this));

        this.player_element.on('nextSong', function()
        {
            if(this.player_element.getShuffle())
            {
                this.playlist_element.randomSong();
            }
            else
            {
                var repeat_all = this.player_element.getRepeatAll();
                this.playlist_element.nextSong(repeat_all);
            }
        }.bind(this));

        this.player_element.on('prevSong', function()
        {
            if(this.player_element.getShuffle())
            {
                this.playlist_element.randomSong();
            }
            else
            {
                var repeat_all = this.player_element.getRepeatAll();
                this.playlist_element.prevSong(repeat_all);
            }
        }.bind(this));

        this.player_element.on('song-ended', function()
        {
            var repeat = this.player_element.getRepeat();
            if(repeat)
            {
                this.playlist_element.sameSong();
            }
            else if(this.player_element.getShuffle())
            {
                this.playlist_element.randomSong();
            }
            else
            {
                var repeat_all = this.player_element.getRepeatAll();
                this.playlist_element.nextSong(repeat_all);
            }
        }.bind(this));

		// Load local content at startup
		this.localcontent_element.getKeys(function(err?:any, key?:any)
			{
				this.localcontent_element.getSongs(undefined);						 
			}.bind(this));

        // added is a callback function
        this.downloads_element.on('downloaded', function(song : Song, added : any)
        {
            // localcontent.addSong is destructive
            var copy : Song = Song.fromJSON(song);
            this.localcontent_element.addSong(copy, function(err?:any, sha1?:string)
            {
                if (err) throw err;
                added();
            });
        }.bind(this));

        this.downloads_element.on('add-song', function(song : Song)
        {
            this.playlist_element.addSong(song);
        }.bind(this));

        this.localcontent_element.on('add-song', function(song : Song)
        {
            this.playlist_element.addSong(song);
        }.bind(this));

        this.search_element.on('song-select', function(song : Song)
        {
            console.log(song);
            this.search_result = song;
        }.bind(this));
    }
}
