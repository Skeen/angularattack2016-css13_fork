import {Component, Input} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';

import {TorrentClient} from 'music-streamer-library';
import {HashTable, Storage, createSong} from 'music-streamer-library';
import {Song, Album, Artist} from 'music-streamer-library';
import {sha1} from 'music-streamer-library';

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

    private addSongToDHT(song : Song, hash_table : HashTable, metadata : any) : void
    {
        // Add song by name
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


        hash_table.put_raw("sha1:" + sha1(song.getTitle()), JSON.stringify({type: "song", payload: song}), function(err, value)
        {
            if(err)
            {
                console.log("Unable to store in overlay network: " + err.message);
                return;
            }
            console.log("Stored in overlay network: " + value);
        });

        // Album
        hash_table.get_raw("sha1:" + sha1(metadata.album), function(err, value)
        {
            // Prefer matadata.albumartist over metadata.artist
            var artists = metadata.albumartist;
            if(artists.length == 0)
            {
                artists = metadata.artist;
            }

            var added:boolean = false;
            var album:Album;
            if(err) // This album is not in DHT
            {
                console.log("No album found in DHT, creating one!");
                album = new Album(metadata.album);
                added = true;
            }
            else // This album is in DHT
            {
                console.log("Album found in DHT, adding song to it!");
                var json = JSON.parse(value);
                if(json.length != 1)
                {
                    alert("CRITICAL ERROR!");
                    return;
                }
                var album_json = json[0];
                //console.log(album_json);
                album = Album.fromJSON(album_json.value.payload);
            }
            //console.log(album);

            // Fill in artist information
            for(var key in artists)
            {
                var artist = artists[key];
                added = album.addArtist(sha1(artist), artist) || added;
            }
            // Add song
            added = album.addSong(sha1(song.getTitle()), song.getTitle()) || added;
            // If we added something new, update remote
            if(added)
            {
                //console.log(album);
                hash_table.put_raw("sha1:" + sha1(album.getName()), JSON.stringify({type: "album", payload: album}), function(err, value)
                {
                    if(err)
                    {
                        console.log("Unable to store in overlay network: " + err.message);
                        return;
                    }
                    console.log("Stored in overlay network: " + value);
                });
            }
        });

        // Artists
        for(var key in metadata.artist)
        {
            (function(artist_name:string)
             {
                hash_table.get_raw("sha1:" + sha1(artist_name), function(err, value)
                {
                    var artist:Artist;
                    if(err) // This artist is not in DHT
                    {
                        console.log("No artist found in DHT, creating one!");
                        artist = new Artist(artist_name);
                    }
                    else // This artist is in DHT
                    {
                        console.log("Artist found in DHT, album song to it!");
                        var json = JSON.parse(value);
                        if(json.length != 1)
                        {
                            alert("CRITICAL ERROR!");
                            return;
                        }
                        var artist_json = json[0];
                        //console.log(artist_json);
                        artist = Artist.fromJSON(artist_json.value.payload);
                    }
                    // Add album
                    var added:boolean = artist.addAlbum(sha1(metadata.album), metadata.album);
                    // If we added something new, update remote
                    if(added)
                    {
                        // Push to DHT
                        hash_table.put_raw("sha1:" + sha1(artist.getName()), JSON.stringify({type: "artist", payload: artist}), function(err, value)
                        {
                            if(err)
                            {
                                console.log("Unable to store in overlay network: " + err.message);
                                return;
                            }
                            console.log("Stored in overlay network: " + value);
                        });
                    }
                });
             })(metadata.artist[key]);
        }
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

                    this.emit('ready-for-seed', song, function(magnet:string)
                    {
                        song.setMagnet(magnet);
                        this.addSongToDHT(song, this.dht, metadata);

                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }
}
