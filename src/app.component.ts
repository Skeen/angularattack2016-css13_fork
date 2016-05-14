import {Component} from '@angular/core';
import * as msl from 'music-streamer-library';

console.log(msl.sha1("Alfa"));

@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent { }


