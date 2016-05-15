import {Component, Input} from '@angular/core';

import {TYPEAHEAD_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import {HashTable} from 'music-streamer-library';

import events = require('events');

@Component({
	selector: 'search',
	templateUrl: 'search.html',
    directives: [
        TYPEAHEAD_DIRECTIVES
    ],
	styleUrls: ['search.css']
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
                this.dht.get_raw(this.searchInput, function(err:any, value:string)
                {
                    if(err) 
                    {
                        return resolve([]);
                    }

                    var resp = JSON.parse(value);
                    var keys : any[] = [];
                    resp.forEach(function(obj:any)
                    {
                        var value = JSON.parse(obj.value);
                        var key = obj.key + " (" + value.type + ")";
                        keys.push(key);
                        this.map[key] = value.payload;
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

    public typeaheadOnSelect(e:any):void {
        console.log(`Selected value: ${e.item}`);
        console.log(this.map[e.item]);
    }
}
