import {Component, Input} from '@angular/core';

import {TYPEAHEAD_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import {HashTable, Song} from 'music-streamer-library';

import events = require('events');

@Component({
	selector: 'search',
	templateUrl: 'search.html',
	styleUrls: ['search.css'],
    directives: [
        TYPEAHEAD_DIRECTIVES
    ]
})
export class Search extends events.EventEmitter
{
	private searchInput:string = "";
    private map:any = {}

    @Input()
    private dht: HashTable;

	constructor()
	{
		super();
    }

    ngAfterViewInit()
    {
	}

    public getAsyncData(context:any):Function
    {
        let f:Function = function ():Promise<string[]>
        {
            let p:Promise<string[]> = new Promise((resolve:Function) =>
            {
                var search_string = this.searchInput;
                /*
                if(this.searchInput.endsWith(" (song)"))
                {
                    search_string = search_string.slice(0, -7);
                }
                */
                this.dht.get_raw(search_string, function(err:any, value:string)
                {
                    if(err) 
                    {
                        return resolve([]);
                    }

                    var resp = JSON.parse(value);
                    var keys : any[] = [];
                    resp.forEach(function(obj:any)
                    {
                        if(obj.key.startsWith("sha1:"))
                        {
                            return;
                        }
                        var value = obj.value;
                        var key = obj.key + " (" + value.type + ")";
                        keys.push(key);
                        this.map[key] = value;
                    }.bind(this));

                    return resolve(keys);

                }.bind(this));
            });
            return p;
        }.bind(this);
        return f;
    }

    private typeaheadLoading:boolean = false;
    private typeaheadNoResults:boolean = false;

    public getContext():any 
    {
        return this;
    }

    public changeTypeaheadLoading(e:boolean):void
    {
        this.typeaheadLoading = e;
    }

    public changeTypeaheadNoResults(e:boolean):void
    {
        this.typeaheadNoResults = e;
    }

    public typeaheadOnSelect(e:any):void
    {
        this.emit('drop-down-select', this.map[e.item]);
    }
}
