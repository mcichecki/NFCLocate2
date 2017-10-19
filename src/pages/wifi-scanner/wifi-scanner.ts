import { DatabaseProvider } from './../../providers/database/database';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

declare var WifiWizard: any;

@Component({
  selector: 'page-wifi-scanner',
  templateUrl: 'wifi-scanner.html',
})

export class WifiScannerPage {

  private choosenLocation: any;
  private networks = [];
  pageTitle: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private databaseProvider: DatabaseProvider) {
    this.choosenLocation = this.navParams.get('idLocation');
    this.pageTitle = this.navParams.get('name');

    this.databaseProvider.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.loadWifiList();
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WifiScannerPage');
  }

  private loadWifiList() {
    console.log("choosenLocation: " + this.choosenLocation);
    this.databaseProvider.getWifiListFor(this.choosenLocation).then(data => {
      this.networks = data;
    })
  }

  refresh() {
      this.networks = [];
      WifiWizard.getScanResults({}, (networkList) => this.networks = networkList, this.errorHandler);
  }

  save() {
    console.log("save");
  }


  errorHandler(e) {
    alert('Problem');
  }

}
