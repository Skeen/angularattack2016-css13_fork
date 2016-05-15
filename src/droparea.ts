import {Component, Input} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';

import {TorrentClient} from 'music-streamer-library';
import {HashTable, Song, Storage, createSong} from 'music-streamer-library';

@Component({
	selector: 'dropArea',
	templateUrl: 'dropArea.html'
})
export class DropArea
{
    // Drag and drop library
    private drag_drop : any;
    // Musicmetadata library
    private mm : any;

    // DOM-element
    @ViewChild('droparea')
    private droparea_element : ElementRef;

    @Input()
    private dht : HashTable;

	constructor()
	{
        this.drag_drop = require('drag-drop')
        this.mm = require('musicmetadata')
	}

    addSongToDHT(song : Song, hash_table : HashTable) : void
    {
        song.setBlob(null);
        hash_table.put_raw(song.getTitle(), JSON.stringify({type: "song", payload: song}), function(err, value)
        {
            if(err)
            {
                console.log("Unable to store in overlay network: " + err.message);
                return;
            }
            console.log("Stored in overlay network: " + value);
        });
    }

    ngAfterViewInit()
    {
        // When user drops files on the browser, create a new torrent and start seeding it!
        this.drag_drop(this.droparea_element.nativeElement, function(files: any)
        {
            console.log(files);

            // TODO: Debug output dropped files

            files.forEach(function(file: any)
            {
                var parser = this.mm(file, function(err: any, metadata: any)
                {
                    if (err) throw err;

                    TorrentClient.seed_song(file, 
                        function(torrent:any)
                        {
                            // Create a song object
                            var song: Song = createSong(metadata, torrent.magnetURI);
                            song.setFileName(file.name);
                            song.setBlob(file);

                            // Provide a copy for storage (addSong is destructive)
                            Storage.addSong(Song.fromJSON(song), function(err: any, sha1: string)
                            {
                                if (err) throw err;
                            });

                            this.addSongToDHT(Song.fromJSON(song), this.dht);
/*
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
                            */
                        }.bind(this),
                        function(name:string, info:string, magnet:string, blobURL:string, query?:string)
                        {
                            /*
                            seed.magnetURI = magnet;
                            seed.name = name;
                            seed.info = info;
                            seed.blobURL = blobURL;

                            this.seeding.push(seed);
                            */
                        }.bind(this),
                        null //update_flow
                    );
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }
}
