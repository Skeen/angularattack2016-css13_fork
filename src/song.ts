import {Component} from '@angular/core';
import {Song} from 'music-streamer-library';
@Component({
    selector: 'song',
    templateUrl: 'song.html',
    providers: [Song],
	template: `Song Name : {{songname}}`
})
export class SongGUI {
	@Input() songname: Song;
// Values about this song:
	public title: string;
	public genre: string;
	public year: number;
	public duration: number;

	// Song belongs to: (hashes)
	public artists: string[];
	public album: string;

	// Finding this song in the net
	public magnet: string;

	// Data and filetype
	public blob: Blob;
	public fileName: string;
	public encoding: string;

	// duration should be in milliseconds.
	constructor(song : Song)	
	{
		this.title = song.getTitle()
		this.genre = song.getGenre() 		|| null;
		this.year = song.getYear() 		|| null;
		this.duration = song.getYear()		|| null;
		this.artists = song.getArtists() 	|| [];
		this.album = song.getAlbum() 	    || null;
		this.magnet = song.getMagnet()	|| null;
		this.blob = song.getBlob()		|| null;
		this.fileName = song.getFileName()|| null;
		this.encoding = song.getEncoding()|| null;
	}
}
