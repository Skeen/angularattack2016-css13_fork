import {Component} from '@angular/core';
import {ViewChild} from '@angular/core';

import * as msl from 'music-streamer-library';

@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent {

    log(str: any, query?: string) : void
    {
        var p = document.createElement('p');
        p.innerHTML = str;
        this.log_element.nativeElement.appendChild(p);
    }

    torrent_to_html(name:string, info:string, magnet:string, blobURL:string, query?:string) : void
    {
        this.log('<b>' + name + '</b>' +
                '<ul>' +
                    '<li> hash: ' + info + '</li> ' +
                    '<li> <a href="' + magnet + '" target="_blank">[Magnet URI]</a></li>' +
                    '<li> <a href="' + blobURL + '" target="_blank" download="' + name + '.torrent">[Download .torrent]</a></li>' +
                '</ul>'
            , query);
    }

    handleMusicStream(file: any, magnetURI: string) : void
    {
        file.appendTo(this.player_element.nativeElement);
    }

    // TODO: Default to some music file
    magnetURI : string = "magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4"

    onSubmit() : void
    {
        var _this = this;
        // Get torrent magnet from text input field.
        msl.TorrentClient.download_song(this.magnetURI,
            this.handleMusicStream.bind(this),
            this.log.bind(this),
            null,
            this.torrent_to_html.bind(this));
    }

    @ViewChild('player') player_element : any;
    @ViewChild('log') log_element : any;
    constructor()
    {
    }
}
