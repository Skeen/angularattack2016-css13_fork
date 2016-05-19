import {Component} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';
import {NgSwitch, NgSwitchWhen, NgSwitchDefault} from '@angular/common';

import {TorrentClient, Song, Storage, createSong} from 'music-streamer-library';
import {HashTable, HTTP_HashTable, Scraper, sha1} from 'music-streamer-library';

import {Player} from './player';
import {Playlist} from './playlist';
import {Search} from './search';
import {SongInfo} from './songInfo';
import {PlaylistControl} from './playlist_control';
import {DropArea} from './droparea';
import {LocalContent} from './localcontent';
import {Downloads} from './downloads';

import {TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {AlertComponent} from 'ng2-bootstrap/ng2-bootstrap';

// TODO:
// Bad health replication
// - Good health removal from bad health list
//
// Print albums, artist and song information
// Better search results
//

@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html',
    directives: [
        Player, Playlist, Search, SongInfo, PlaylistControl, DropArea,
		LocalContent, Downloads,

        NgSwitch, NgSwitchWhen, NgSwitchDefault,

		TOOLTIP_DIRECTIVES, AlertComponent
	],
    styleUrls: ['app.component.css']
})
export class AppComponent
{
    private magnetURI : string = "magnet:?xt=urn:btih:60e0fcf843dbeb02dc08f34e4e6ca1e9bf385d89&dn=tiasu-analogue_ambitions-01_the_start.ogg&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io";

    // DOM Children
    @ViewChild('player')
    private player_element : Player;

    @ViewChild('playlist')
    private playlist_element : Playlist;

	@ViewChild('localcontent')
	private localcontent_element : LocalContent;

	@ViewChild('downloads')
	private downloads_element : Downloads;

	@ViewChild('search')
	private search_element : Search;

	@ViewChild('droparea')
	private droparea_element : DropArea;

    // State variables
    private dht : HashTable = new HTTP_HashTable("http://10.192.85.132:3000/");

    // Output state
    private search_result : any;
    private alerts : Array<Object> = [];

    private onSubmit() : void
    {
        this.download_song(this.magnetURI);
    }

    private download_song(magnetURI:string) : void
    {
        var downloading:boolean = this.downloads_element.isDownloading(magnetURI);
        var seeding:boolean = this.localcontent_element.isSeeding(magnetURI);
        if(downloading)
        {
            this.alerts.push({msg: 'That song is already downloading!', type: 'danger', closable: true, timeout: 3000});
        }
        else if (seeding)
        {
            this.alerts.push({msg: 'That song is stored local!', type: 'warning', closable: true, timeout: 3000});
        }
        else
        {
            this.downloads_element.downloadSong(magnetURI);
        }
    }

    public lookup(sha1_hash:string)
    {
        console.log(sha1_hash);

        this.dht.get_raw("sha1:" + sha1_hash, function(err:any, value:string)
        {
            if(err) 
            {
                alert(err);
                return;
            }

            var resp = JSON.parse(value);
            if(resp.length != 1)
            {
                alert("Invalid response length from DHT!");
                return;
            }

            var json = resp[0].value;
            this.search_result = json;

        }.bind(this));
    }

    public closeAlert(i:number) : void 
    {
        this.alerts.splice(i, 1);
    }

    constructor()
    {
    }

    ngAfterViewInit()
    {
        this.playlist_element.on('changingSong', function(index:number, new_song:Song)
        {
            this.player_element.playSong(new_song.getRenderable(), function()
            {
                this.playlist_element.setActive(index);
            }.bind(this));
        }.bind(this));

        this.playlist_element.on('no-more-songs', function()
        {
            this.alerts.push({msg: 'No more songs in playlist!', type: 'info', closable: true, timeout: 3000});

        }.bind(this));

        this.player_element.on('nextSong', function()
        {
            if(this.player_element.getShuffle())
            {
                this.playlist_element.randomSong();
            }
            else
            {
                var repeat_all = this.player_element.getRepeatAll();
                this.playlist_element.nextSong(repeat_all);
            }
        }.bind(this));

        this.player_element.on('prevSong', function()
        {
            if(this.player_element.getShuffle())
            {
                this.playlist_element.randomSong();
            }
            else
            {
                var repeat_all = this.player_element.getRepeatAll();
                this.playlist_element.prevSong(repeat_all);
            }
        }.bind(this));

        this.player_element.on('song-ended', function()
        {
            var repeat = this.player_element.getRepeat();
            if(repeat)
            {
                this.playlist_element.sameSong();
            }
            else if(this.player_element.getShuffle())
            {
                this.playlist_element.randomSong();
            }
            else
            {
                var repeat_all = this.player_element.getRepeatAll();
                this.playlist_element.nextSong(repeat_all);
            }
        }.bind(this));

        // Seed our local content
        this.localcontent_element.seedLocal();

        // added is a callback function
        this.downloads_element.on('downloaded', function(song : Song, added : any)
        {
            // localcontent.addSong is destructive, so we create a copy
            var copy : Song = Song.fromJSON(song);
            this.localcontent_element.addSong(copy, function(err?:any, sha1?:string)
            {
                if (err) throw err;
                this.alerts.push({msg: 'Downloaded: "' + song.getTitle() + '" to local content!', type: 'success', closable: true, timeout: 3000});
                added();
            }.bind(this));
        }.bind(this));

        // added is a callback function
        this.droparea_element.on('ready-for-seed', function(song : Song, added : any)
        {
            // localcontent.addSong is destructive, so we create a copy
            var copy : Song = Song.fromJSON(song);
            this.localcontent_element.addSong(copy, function(err?:any, sha1?:string, magnet?:string)
            {
                if (err) throw err;
                this.alerts.push({msg: 'Added: "' + song.getTitle() + '" to local content!', type: 'info', closable: true, timeout: 3000});
                added(magnet);
            }.bind(this));
        }.bind(this));

        this.downloads_element.on('add-song', function(song : Song)
        {
            this.playlist_element.addSong(song);
        }.bind(this));

		this.localcontent_element.on('badHealthUpdate', function(song : Song)
		{
			this.updateDHTBadHealthList(song.getMagnet());
		}.bind(this));

        this.localcontent_element.on('add-song', function(song : Song)
        {
            this.playlist_element.addSong(song);
        }.bind(this));

        this.search_element.on('drop-down-select', function(value : any)
        {
            console.log(value);
            this.search_result = value;
        }.bind(this));

		this.timedBadHealthCheck = setInterval(this.updateSeedsFromBadHealth(), 10000);
    }
	
	private timedBadHealthCheck:any;
	private GOOD_HEALTH:number = 5;
	private badHealthList:string[] = [];

	private addToBadHealthList(magnetURI:string):void
	{
		this.badHealthList.push(magnetURI);
	}

	private updateDHTBadHealthList(magnetURI:string):void
	{
		// Check if it is bad health
		Scraper.scrape(magnetURI, function(data:any)
			{
				if(data.complete >= this.GOOD_HEALTH)
				{
					// Was in good health.
					return;
				}
				this.badHealthList.push(magnetURI);
				this.dht.get_raw("sha1:" + sha1("badHealth"), function(err?:any, value?:string)
				{
					if(err)
					{
						throw err;
					}
					else
					{
						var badHealthItems:any = JSON.parse(value);
						for(var badHealthItem of badHealthItems)
						{
							if(this.badHealthList.indexOf(badHealthItem) == -1)
							{
								this.badHealthList.push(badHealthItem);
							}
						}
						var jsonList = JSON.stringify(this.badHealthList);
						this.dht.put_raw("sha1:"+ sha1("badHealth"), jsonList, function(){});
					}
				}.bind(this));
			}.bind(this));
	}

	private updateSeedsFromBadHealth():void
	{
		this.dht.get_raw("sha1:"+sha1("badHealth"), function(err?:any, value?:string)
			{
				if(err)
				{
					var jsonList:string = JSON.stringify([]);
					this.dht.put_raw("sha1"+sha1("badHealth"), jsonList, function(){});
				}
				else
				{
					var badHealthItems:any = JSON.parse(value);
					var seedList = badHealthItems.length < 5 ? badHealthItems : this.getRandom(badHealthItems, 5);
					for(var i=0; i < seedList.length; i++)
					{
						Scraper.scrape(seedList[i], function(data:any)
							{
								if(data.complete >= this.GOOD_HEALTH)
								{
									badHealthItems.splice(i,1);
									this.dht.put_raw("sha1:"+sha1("badHealth"), badHealthItems, function(){});
								}
								else
								{
									this.download_song(seedList[i]);
								}
							});
					}
				}
			}.bind(this));
	}

	private getRandom(arr:any, n:any)
	{
		var result = new Array(n);
		var len = arr.length;
		var taken = new Array(len);
		if(n > len)
			throw new RangeError("getRandom: more elements taken than available");
		while(n--)
		{
			var x = Math.floor(Math.random() * len);
			result[n] = arr[x in taken ? taken[x] : x];
			taken[x] = --len;
		}
		return result;
	}

}
