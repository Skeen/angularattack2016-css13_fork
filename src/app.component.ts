import {Component} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';

import {TorrentClient, Song, Storage, createSong} from 'music-streamer-library';
import {HashTable, HTTP_HashTable} from 'music-streamer-library';

import {Player} from './player';
import {Playlist} from './playlist';
import {Search} from './search';
import {SongInfo} from './songInfo';
import {PlaylistControl} from './playlist_control';
import {LocalContent} from './localcontent';

import {TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

var mm = require('musicmetadata')

@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html',
    directives: [
        Player, Playlist, Search, SongInfo, PlaylistControl,
		LocalContent,
		TOOLTIP_DIRECTIVES    
	],
	styleUrls: ['playlist.css']
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
    private dht : HashTable;

    // List of downloads
    private downloads : any = [];
    private seeding : any = [];

    private add_to_playlist(download:any)
    {
        this.playlist_element.addSong(download.song);
    }

    private torrent_to_html(download:any, name:string, info:string, magnet:string, blobURL:string, query?:string) : void
    {
        download.magnetURI = magnet;
        download.name = name;
        download.info = info;
        download.blobURL = blobURL;
   
        this.downloads.push(download);
    }

    private torrent_progress(download:any, download_speed:number, progress:number, time_left:number)
    {
        download.download_speed = download_speed;
        download.progress = progress;
        download.time_left = time_left;
    }

    // TODO: Add DHT code
    // TODO: Add replication code
    // TODO: Add searching
    // TODO: Add search results
    // TODO: Seed local content
    // TODO: Allow uploading local content

    private pullOutMetadata(download:any, file: any, magnetURI: string) : void
    {
        var stream = file.createReadStream();
        var parser = mm(stream, function(err: any, metadata: any)
        {
            if (err) throw err;

            var song: Song = createSong(metadata, magnetURI);
            song.setFileName(file.name);
            // Set stream (used untill blob is ready)
            song.setStream(file);
            download.song = song;

            // TODO: Replace with getBlob from file (pull request WebTorrent)
            file.getBuffer(function(err: any, buffer: any)
            {
                if (err) throw err;

                function toArrayBuffer(buffer: any)
                {
                    var ab = new ArrayBuffer(buffer.length);
                    var view = new Uint8Array(ab);
                    for (var i = 0; i < buffer.length; ++i) 
                    {
                        view[i] = buffer[i];
                    }
                    return ab;
                }
                song.setBlob(new Blob([toArrayBuffer(buffer)]));
                // Provide a copy for storage (addSong is destructive)
                /*
				Storage.addSong(Song.fromJSON(song), function(err: any, sha1: string)
                {
                    if (err) throw err;
                    download.storedLocally = true;
                });
				*/
			   	this.localcontent_element.addSong(Song.fromJSON(song), function(err?:any, sha1?:string)
					{
						if (err) throw err;
						download.storedLocally = true;
					});
				
            }.bind(this));
        }.bind(this));
    }

    private handleMusicStream(download:any, file: any, magnetURI: string) : void
    {
        // Add download URL to downloads
        file.getBlobURL(
            function(err: any, url: any)
            {
                if (err) {
                    alert(err.message);
                }
                this.torrent_progress(download, 0, 1, 0);
                download.file_blobURL = url;
            }.bind(this));

        this.pullOutMetadata(download, file, magnetURI);
    }

    private onSubmit() : void
    {
        var download = {
            download_speed: 0,
            progress: 0,
            time_left: 0
        }
        // Get torrent magnet from text input field.
        TorrentClient.download_song(this.magnetURI,
            function(file:any, magnetURI:string)
            {
                this.handleMusicStream(download, file, magnetURI);
            }.bind(this),
            null,
            function(name:string, info:string, magnet:string, blobURL:string, query?:string)
            {
                this.torrent_to_html(download, name, info, magnet, blobURL);
            }.bind(this),
            function(download_speed:number, progress:number, time_left:number)
            {
                this.torrent_progress(download, download_speed, progress, time_left);
            }.bind(this)
            );
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

		this.updateSeedList();
    }
}
