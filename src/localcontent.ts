import {Component} from '@angular/core';
import {Storage, Song, sha1, TorrentClient} from 'music-streamer-library';

import {DomSanitizationService} from '@angular/platform-browser';


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

		// Add to storage first
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

            // New song, add it
            this.seed(song);
            this.emit('addSong');

            if(callback)
            {
                callback(err, value);
            }

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

	private seed(song:Song):void
	{
		var blob: any = song.getBlob();
		blob.name = song.getFileName();

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
			function(name:string, info:string, magnet:string, blobURL:string, query?:string)
            {
                seed.magnetURI_raw = magnet;
                seed.magnetURI = this.sanitizer.bypassSecurityTrustUrl(magnet) || "";
                seed.name = name || "";
                seed.info = info || "";
                seed.blobURL = this.sanitizer.bypassSecurityTrustUrl(blobURL) || "";
			}.bind(this),
            update_seed_values
        );
	}

    private add_to_playlist(seed:any)
    {
        this.emit('add-song', seed.song);
    }
}
