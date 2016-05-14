import {Component} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';

import {TorrentClient, Song, createSong} from 'music-streamer-library';

import {Player} from './player';
import {Playlist} from './playlist';
import {Shuffler} from './shuffler';

var mm = require('musicmetadata')

@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html',
    directives: [
        Player, Playlist, Shuffler
    ]
})
export class AppComponent
{
    private magnetURI : string = "magnet:?xt=urn:btih:2f44f0e4edeeeb78084f582e1f29e2b4573e62fe&dn=incompetech-royalty_free-pixelland.mp3&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io";

    @ViewChild('player')
    private player_element : Player;

    @ViewChild('playlist')
    private playlist_element : Playlist;

    @ViewChild('log')
    private log_element : ElementRef;

    private log(str: any, query?: string) : void
    {
        var p = document.createElement('p');
        p.innerHTML = str;
        this.log_element.nativeElement.appendChild(p);
    }

    private torrent_to_html(name:string, info:string, magnet:string, blobURL:string, query?:string) : void
    {
        this.log('<b>' + name + '</b>' +
                '<ul>' +
                    '<li> hash: ' + info + '</li> ' +
                    '<li> <a href="' + magnet + '" target="_blank">[Magnet URI]</a></li>' +
                    '<li> <a href="' + blobURL + '" target="_blank" download="' + name + '.torrent">[Download .torrent]</a></li>' +
                '</ul>'
            , query);
        this.log('(Blob URLs only work if the file is loaded from a server.'
            + '"http//localhost" works.'
            + '"file://" does not.)');
    }

    private pullOutMetadata(file: any, magnetURI: string) : void
    {
        var stream = file.createReadStream();
        var parser = mm(stream, function(err: any, metadata: any)
        {
            if (err) throw err;

            this.log(JSON.stringify(metadata, null, 4));

            var song: Song = createSong(metadata, magnetURI);
            song.setFileName(file.name);

            this.playlist_element.addSong(song);
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

    private handleMusicStream(file: any, magnetURI: string) : void
    {
        this.player_element.playSong(file);
        // Add download URL to log
        file.getBlobURL(
            function(err: any, url: any)
            {
                if (err) {
                    return this.log(err.message);
                }
                this.log('File done.');
                this.log('<a href="' + url
                        + '">Download full file: '
                        + file.name + '</a>');

            }.bind(this));
        this.pullOutMetadata(file, magnetURI);
    }

    private onSubmit() : void
    {
        // Get torrent magnet from text input field.
        TorrentClient.download_song(this.magnetURI,
            this.handleMusicStream.bind(this),
            this.log.bind(this),
            null,
            this.torrent_to_html.bind(this));
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
