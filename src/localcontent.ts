import {Component} from '@angular/core';
import {Storage, Song, sha1, TorrentClient, HTTP_HashTable} from 'music-streamer-library';
import {DomSanitizationService} from '@angular/platform-browser';
import {BadHealth} from './badhealth';

import {TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import events = require('events');

@Component({
	selector: 'localcontent',
	templateUrl: 'localcontent.html',
	styleUrls: ['localcontent.css'],
	directives: [TOOLTIP_DIRECTIVES]
})
export class LocalContent extends events.EventEmitter
{
	private seeding:any[] = [];
    private sanitizer:DomSanitizationService;

	// For bad health maintainance
	private static DHT = new HTTP_HashTable();
	

    // Inject the DOM Sanitizer service
    // We need this to santize our 'magnet:' and 'blob:' URLs
    constructor(sanitizer: DomSanitizationService)
	{
		super();
        this.sanitizer = sanitizer;
	}

    // This should only be called once!
    // XXX: Call from constructor?
    public seedLocal()
    {
        this.getSongs(function(err?:any, songs?:Song[])
        {
            if(err || !songs)
            {
                alert("Unable to seed local content!");
                return;
            }
            songs.forEach(function(song:Song)
            {
                this.seed(song);
            }.bind(this));
        }.bind(this));
    }

    public isSeeding(magnetURI:string): boolean
    {
        var is_seeding:boolean = false;
        this.seeding.forEach(function(obj:any)
        {
            if(obj.magnetURI_raw == magnetURI)
                is_seeding = true;
        });
        return is_seeding;
    }

	public addSong(song:Song, callback?:any): void
	{
        // TODO: Check if song already exists
        
        // New song, seed to generate magnet URI
        this.seed(song, function(magnet:string)
        {
            var old_magnet = song.getMagnet();
            if(old_magnet != undefined && old_magnet != magnet)
            {
                if(callback)
                    callback("MagnetURI mismatch!", undefined);
                else
                    alert("MagnetURI mismatch!");
                return;
            }
            song.setMagnet(magnet);

			// Add to bad health list
			BadHealth.updateDHTBadHealthList(DHT, magnet);

            // Add to storage with magnet URI icnluded
            Storage.addSong(song, function(err?:any, value?:string)
            {
                if(err || !value)
                {
                    if(callback)
                        callback(err, value);
                    else
                        alert(err);
                    return;
                }

                if(callback)
                {
                    callback(err, value);
                }

            }.bind(this));	
        }.bind(this));
	}

	public getKeys(callback:any): void
	{
		Storage.getKeys(function(err?:any, keys?:string[])
        {
            if(err || !keys)
            {
                if(callback)
                    callback(err, keys);
                else
                    alert(err);
                return;
            }
            callback(err, keys);

        }.bind(this));
	}

	public getSongs(callback:any): void
	{
        function getSongsRecursive(songs:Song[], callback:any, keys:string[]): void
        {
            // No more keys == we're done
            if(keys.length == 0)
            {
                callback(undefined, songs);
                return;
            }

            var key:string = keys.pop();
            Storage.getSong(key, function(err?:any, song?:Song)
            {
                if(err || !song)
                {
                    callback(err, songs);
                    return;
                }
                songs.push(song);

                getSongsRecursive(songs, callback, keys);

            }.bind(this));
        }
        this.getKeys(function(err?:any, keys?:any)
        {
            if(err || !keys)
            {
                callback(err, keys);
                return;
            }

            getSongsRecursive([], callback, keys);
        });
    }

	private seed(song:Song, callback?:any):void
	{
		var blob: any = song.getBlob();
        // If our blob doesn't have a name, set it
        if(!blob.name)
        {
            blob.name = song.getFileName();
        }
        var sanitized_file_blobURL = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
        var seed: any = 
        {
            song: song,
            upload_speed: 0,
            bytes_uploaded: 0,
            num_peers: 0,
            name: "",
            magnetURI:"",
            info:"",
            blobURL:"",
            file_blobURL: sanitized_file_blobURL
        };
		this.seeding.push(seed);

        function update_seed_values(upload_speed?:number, bytes_uploaded?:number, num_peers?:number)
        {
            if(upload_speed != null)
                seed.upload_speed = upload_speed;
            if(bytes_uploaded != null)
                seed.bytes_uploaded = bytes_uploaded;
            if(num_peers != null)
                seed.num_peers = num_peers;
        }

		TorrentClient.seed_song(blob,
			function(torrent:any)
			{
                function update_seed_values_torrent()
                {
                    update_seed_values(torrent.upload_speed, torrent.bytes_uploaded, torrent.num_peers);
                }

                // Clear speed and peers if no changes occur within 5 seconds
                var old_speed = seed.upload_speed;
                var old_peers = seed.num_peers;
				setInterval(function()
                {
                    update_seed_values_torrent();
                    if(seed.upload_speed == old_speed)
                    {
                        update_seed_values(0, torrent.bytes_uploaded, 0);
                    }
                    old_speed = seed.upload_speed;
                    old_peers = seed.num_peers;
                }, 5000);

                torrent.on('wire', function()
                {
                    update_seed_values_torrent();
				});
			},
			function(name:string, info:string, magnet:string, blobURL:string)
            {
                seed.magnetURI_raw = magnet;
                seed.magnetURI = this.sanitizer.bypassSecurityTrustUrl(magnet) || "";
                seed.name = name || "";
                seed.info = info || "";
                seed.blobURL = this.sanitizer.bypassSecurityTrustUrl(blobURL) || "";

                if(callback)
                    callback(magnet);

			}.bind(this),
            update_seed_values
        );
	}

    private add_to_playlist(seed:any)
    {
        this.emit('add-song', seed.song);
    }
}
