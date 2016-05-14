import {Component} from '@angular/core';
import {Control} from '@angular/common';
import events = require('events');

@Component({
	selector: 'search',
	templateUrl: 'search.html'
})

export class Search extends events.EventEmitter
{
	private searchInput:string = "";

	constructor()
	{
		super();
		this.emit('ready');	
	}

	public searchFor(): void
	{
		this.emit('search', this.searchInput);	
	}
}
