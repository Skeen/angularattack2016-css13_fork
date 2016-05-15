import {Component} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';

import {TorrentClient, Song, createSong} from 'music-streamer-library';

import {Player} from './player';
import {Playlist} from './playlist';
import {Search} from './search';
import {SongInfo} from './songInfo';

var mm = require('musicmetadata')

@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html',
    directives: [
        Player, Playlist, Search
    ]
})
export class AppComponent
{
    private magnetURI : string = "magnet:?xt=urn:btih:60e0fcf843dbeb02dc08f34e4e6ca1e9bf385d89&dn=tiasu-analogue_ambitions-01_the_start.ogg&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io";

    @ViewChild('player')
    private player_element : Player;

    @ViewChild('playlist')
    private playlist_element : Playlist;

    @ViewChild('log')
    private log_element : ElementRef;

    private downloads : any = [];

    private log(str: any, query?: string) : void
    {
        var p = document.createElement('p');
        p.innerHTML = str;
        this.log_element.nativeElement.appendChild(p);
    }

    private torrent_to_html(download:any, name:string, info:string, magnet:string, blobURL:string, query?:string) : void
    {
        download.magnetURI = magnet;
        download.name = name;
        download.info = info;
        download.blobURL = blobURL;
        download.download_speed = 0;
        download.progress = 0;
        download.time_left = 0;
   
        this.downloads.push(download);
    }

    private torrent_progress(download:any, download_speed:number, progress:number, time_left:number)
    {
        download.download_speed = download_speed;
        download.progress = progress;
        download.time_left = time_left;
    }

    private pullOutMetadata(download:any, file: any, magnetURI: string) : void
    {
        var stream = file.createReadStream();
        var parser = mm(stream, function(err: any, metadata: any)
        {
            if (err) throw err;

            var song: Song = createSong(metadata, magnetURI);
            song.setFileName(file.name);

            download.song = song;

            // this.playlist_element.addSong(song);
            /*
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

                // Save blob somewhere
            });
            */
        }.bind(this));
    }

    private handleMusicStream(download:any, file: any, magnetURI: string) : void
    {
        this.player_element.playSong(file);
        // Add download URL to downloads
        file.getBlobURL(
            function(err: any, url: any)
            {
                if (err) {
                    return this.log(err.message);
                }
                this.torrent_progress(download, 0, 1, 0);
                download.file_blobURL = url;
            }.bind(this));

        this.pullOutMetadata(download, file, magnetURI);
    }

    private onSubmit() : void
    {
        var download = {}
        // Get torrent magnet from text input field.
        TorrentClient.download_song(this.magnetURI,
            function(file:any, magnetURI:string)
            {
                this.handleMusicStream(download, file, magnetURI);
            }.bind(this),
            null,
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

    constructor()
    {
    }

    ngAfterViewInit()
    {
        this.playlist_element.on('changeSong', function()
        {
            alert("changed song!");
        });
    }
}
