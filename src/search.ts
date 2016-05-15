import {Component, Input} from '@angular/core';

import {TYPEAHEAD_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import {HashTable} from 'music-streamer-library';

import events = require('events');

@Component({
	selector: 'search',
	templateUrl: 'search.html',
    directives: [
        TYPEAHEAD_DIRECTIVES
    ]
})

export class Search extends events.EventEmitter
{
	private searchInput:string = "";
    private map:any = {}

    @Input() dht: HashTable;

	constructor()
	{
		super();
    }

    ngAfterViewInit()
    {
        /*
        this.dht.put_raw('alfa', '["beta", "gamma"]', function(err:any)
        {
            if(err) throw err;
        });
        this.dht.put_raw('alb', '["charlie", "echo"]', function(err:any)
        {
            if(err) throw err;
        });
        */
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
                    var keys = resp.map(function(obj:any)
                    { 
                        return obj.key;
                    });

                    resp.forEach(function(obj:any)
                    {
                        this.map[obj.key] = obj.value;
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
