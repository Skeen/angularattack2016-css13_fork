import {Component} from '@angular/core';
import {Storage, Song, sha1, TorrentClient} from 'music-streamer-library';
import {Playlist} from './playlist';

import {TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

@Component({
	selector: 'localcontent',
	templateUrl: 'localcontent.html',
	styleUrls: ['localcontent.css'],
	directives: [TOOLTIP_DIRECTIVES]
})
export class LocalContent extends Playlist
{
	private storageKeys:string[] = [];

	protected songs:Song[] = [];
	private seeding:any = [];

	constructor()
	{
		super();
		super.setName("Local Content");
	}

	private hasDuplicate(hash:string): boolean
	{		
		if(this.storageKeys.indexOf(hash) == -1)
		{
			return false;
		}
		return true;
	}
	
	public addSong(song:Song, callback?:any): void
	{
		var storedSong:Song = Song.fromJSON(song);
		//add to storage first
		Storage.addSong(storedSong, function(err?:any, value?:string)
			{
				if(err || !value)
				{
					//TODO: handle error properly
				}
				if(!(this.hasDuplicate(value)))
				{
					var i:number = (this.songs.push(song)) - 1;
					this.seed(i, song);
					console.log(i);
					console.log(this.songs);
					console.log(this.seeding);
					this.emit('addSong');
				}
				if(callback)
				{
					callback(err, value);
				}
			}.bind(this));	
	}

	public getKeys(callback?:any): void
	{
		Storage.getKeys(function(err?:any, keys?:string[])
			{
				if(err || !keys)
				{
					//TODO: handle error properly
					alert("Error getting list of stored items!");
				}
				this.storageKeys = keys;
				if(callback)
				{
					callback(err, keys);
				}
			}.bind(this));
	}

	public getSongs(callback?:any): void
	{
		this.getKeys(function(err?:any, keys?:string[])
			{
				this.getSongsRec([], callback);
			}.bind(this));
	}

	private getSongsRec(songs:Song[], callback?:any):void
	{		
		var next:number = songs.length;
		var key:string = this.storageKeys[next];
		if(!key)
		{
			this.updateSeedList(songs);
			this.songs = songs;
			if(callback)
				callback(undefined, this.songs);
			return;
		}
		Storage.getSong(key, function(err?:any, song?:Song)
			{
				if(err || !song)
				{
					//TODO: Handle error properly
					alert("Error getting song from storage!");
				}
				songs.push(song);
				this.getSongsRec(songs, callback);
			}.bind(this));
	}

	private updateSeedList(songs:Song[])
	{
		for(var i=0; i < songs.length; i++)
		{
			var song:Song = songs[i];
			this.seed(i, song);
		}
	}

	private seed(i:number, song:Song):void
	{
		var blob: any = song.getBlob();
        var seed: any = 
			{
                song: song,
                upload_speed: 0,
                bytes_uploaded: 0,
                num_peers: 0,
				name: "",
				magnetURI:"",
				info:"",
				blobURL:""
            };
		blob.name = song.getFileName();
		this.seeding[i] = seed;

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

				setInterval(function()
                {
                    update_seed_values(0,null,0);
                    update_seed_values_torrent();
                }, 1000);

                torrent.on('wire', function()
                {
                    update_seed_values_torrent();
				});
			},
			function(name:string, info:string, magnet:string, blobURL:string, query?:string)
            {
                seed.magnetURI = magnet || "";
                seed.name = name || "";
                seed.info = info || "";
                seed.blobURL = blobURL || "";
			}.bind(this),
            update_seed_values
        );
	}

    private add_to_playlist(seed:any)
    {
        this.emit('add-song', seed.song);
    }
}
