import { Component, OnInit, VERSION } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'ngx-simple-spinner';
  version = VERSION.full;
  value1 = 10;
  value2 = 12.5;
  value3 = null;
  value4 = 33.33;
  value5 = 12.25;

  ngOnInit() {
    // tslint:disable-next-line: no-console
    console.info(
      'I am developing those modules on my own, in my free time. ' +
      'It is very time consuming to deliver quality code.\n' +
      '\nIf you appreciate my work, please buy me a coffee 😊\n' +
      '\nThanks'
    );
  }
}
