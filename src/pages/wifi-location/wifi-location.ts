import { Component, ErrorHandler } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

declare var WifiWizard: any;

@Component({
  selector: 'page-wifi-location',
  templateUrl: 'wifi-location.html',
})

export class WifiLocationPage {

  ssid: any;
  networkList = [];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WifiLocationPage');
  }

  getSSIDName() {
    console.log("GET SSID");
    WifiWizard.getCurrentSSID((ssid: String) => this.ssid = ssid, this.errorHandler);
  }

  getNetworkList() {
    this.networkList = [];
    WifiWizard.getScanResults({}, (networkList) => this.networkList = networkList, this.errorHandler);
  }

  errorHandler(e) {
    alert('Problem');
  }
}