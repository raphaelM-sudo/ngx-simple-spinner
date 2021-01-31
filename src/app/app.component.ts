import { Component, OnInit, VERSION } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'ngx-simple-spinner';
  version = VERSION.full;
  value = 10.5;

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
