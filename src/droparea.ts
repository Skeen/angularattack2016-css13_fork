import {Component, Input} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';

import {TorrentClient} from 'music-streamer-library';
import {HashTable, Song, Storage, createSong} from 'music-streamer-library';

import events = require('events');

@Component({
	selector: 'dropArea',
	templateUrl: 'dropArea.html'
})
export class DropArea extends events.EventEmitter
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
        super();

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
            files.forEach(function(file: any)
            {
                var parser = this.mm(file, function(err: any, metadata: any)
                {
                    if (err) throw err;

                    // Create a song object
                    var song: Song = createSong(metadata, undefined);
                    song.setFileName(file.name);
                    song.setBlob(file);

                    this.emit('ready-for-seed', song, function()
                    {
                        this.addSongToDHT(Song.fromJSON(song), this.dht);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }
}
