import {Component} from '@angular/core';

import {DATEPICKER_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

@Component({
    selector: 'home',
    templateUrl: 'home.html',
    directives: [
        DATEPICKER_DIRECTIVES
    ]
})
export class Home {
    public date: Date = new Date();
}
