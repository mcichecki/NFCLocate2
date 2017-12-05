import { WifiBuildingChooserPage } from './../wifi-building-chooser/wifi-building-chooser';
import { HomePage } from './../home/home';
import { Component } from '@angular/core';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  tab1 = HomePage;
  tab2 = WifiBuildingChooserPage;

  constructor() {
  }
}
