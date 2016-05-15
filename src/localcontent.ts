import {Component} from '@angular/core';
import {Storage, Song, sha1, TorrentClient} from 'music-streamer-library';
import {Playlist} from './playlist';

@Component({
	selector: 'localcontent',
	templateUrl: 'localcontent.html'
})
export class LocalContent extends Playlist
{
	private storageKeys:string[] = [];

	protected songs:Song[] = [];
	private seeding: any = [];

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
		var storedSong:Song = song;
		//add to storage first
		Storage.addSong(storedSong, function(err?:any, value?:string)
			{
				if(err || !value)
				{
					//TODO: handle error properly
				}
				if(!(this.hasDuplicate(value)))
				{
					this.songs.push(song);
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
					callback(undefined, keys);
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
			this.songs = songs;
			this.updateSeedList();
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

	private updateSeedList()
	{
		this.getSongs(function(err?:any, songs?:Song[])
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

}
