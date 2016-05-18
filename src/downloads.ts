import {Component, Input} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';

import {TorrentClient} from 'music-streamer-library';
import {HashTable, Song, Storage, createSong} from 'music-streamer-library';

import {TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import events = require('events');

@Component({
	selector: 'downloads',
	templateUrl: 'downloads.html',
    directives: [
		TOOLTIP_DIRECTIVES    
    ]
})
export class Downloads extends events.EventEmitter
{
    // Musicmetadata library
    private mm : any;

    // List of downloads
    private downloads : any = [];

	constructor()
	{
        super();
        this.mm = require('musicmetadata')
	}

    private torrent_to_html(download:any, name:string, info:string, magnet:string, blobURL:string, query?:string) : void
    {
        download.magnetURI = magnet;
        download.name = name;
        download.info = info;
   
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
        var parser = this.mm(stream, function(err: any, metadata: any)
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
                
                this.emit('downloaded', song, function()
                {
                    var index = this.downloads.indexOf(download);
                    if(index == -1)
                    {
                        alert("Cannot remove such element!");
                        return;
                    }
                    this.downloads.splice(index, 1);
                }.bind(this));

                this.torrent_progress(download, 0, 1, 0);
            }.bind(this));
        }.bind(this));
    }

    private handleMusicStream(download:any, file: any, magnetURI: string) : void
    {
        this.pullOutMetadata(download, file, magnetURI);
    }

    private add_to_playlist(download:any)
    {
        this.emit('add-song', download.song);
    }

    public isDownloading(magnetURI:string): boolean
    {
        var downloading:boolean = false;
        this.downloads.forEach(function(obj:any)
        {
            if(obj.magnetURI == magnetURI)
                downloading = true;
        });
        return downloading;
    }

    public downloadSong(magnetURI:string) : void
    {
        var download = {
            download_speed: 0,
            progress: 0,
            time_left: 0
        }
        // Get torrent magnet from text input field.
        TorrentClient.download_song(magnetURI,
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
}
