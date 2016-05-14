import {Component} from '@angular/core';
import {Input} from '@angular/core';

import {Song} from 'music-streamer-library';

@Component({
    selector: 'songa',
	template:` 
        beta  {{song.title}}
        `,
    directives: [
    ]
})
export class Songa
{
    @Input() song : Song;
}
