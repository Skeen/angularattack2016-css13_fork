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
	]
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

    private dht : HashTable;

    private seeding : any = [];

    // TODO: Add DHT code
    // TODO: Add replication code
    // TODO: Add searching
    // TODO: Add search results
    // TODO: Seed local content
    // TODO: Allow uploading local content
    
    private onSubmit() : void
    {
        this.downloads_element.downloadSong(this.magnetURI);
    }

	private updateSeedList()
	{
		this.localcontent_element.getSongs(function(err?:any, songs?:Song[])
		{
			if(err || !songs)
			{
				//TODO: handle this error
				alert("Unable to get songs from local storage");
			}

			for(var song of songs)
			{
				var blob: any = song.getBlob();
                var seed : any = 
                {
                    song: song,
                    upload_speed: 0,
                    bytes_uploaded: 0,
                    num_peers: 0
                };

                function update_flow(upload_speed:number, bytes_uploaded:number, num_peers:number)
                {
                    seed.upload_speed = upload_speed;
                    seed.bytes_uploaded = bytes_uploaded;
                    seed.num_peers = num_peers;
                }

                blob.name = song.getFileName();
                TorrentClient.seed_song(blob, 
                    function(torrent:any)
                    {
                        function read_flow_from_torrent()
                        {
                            update_flow(torrent.uploadSpeed, torrent.uploaded, torrent.numPeers);
                        }

                        setInterval(function()
                        {
                            read_flow_from_torrent();
                        }, 1000);
                        torrent.on('wire', function()
                        {
                            read_flow_from_torrent();
                        });
                    },
                    function(name:string, info:string, magnet:string, blobURL:string, query?:string)
                    {
                        seed.magnetURI = magnet;
                        seed.name = name;
                        seed.info = info;
                        seed.blobURL = blobURL;

                        this.seeding.push(seed);
                    }.bind(this));
			}
		}.bind(this));

	}

    constructor()
    {
        this.dht = new HTTP_HashTable();
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

		this.updateSeedList();
    }
}
