import { WifiLocationPage } from './../wifi-location/wifi-location';
import { HomePage } from './../home/home';
import { Component } from '@angular/core';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  tab1 = HomePage;
  tab2 = WifiLocationPage;

  constructor() {
  }
}
