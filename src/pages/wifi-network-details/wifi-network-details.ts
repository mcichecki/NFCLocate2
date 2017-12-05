import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-wifi-network-details',
  templateUrl: 'wifi-network-details.html',
})
export class WifiNetworkDetailsPage {

  network: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.network = navParams.data;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WifiNetworkDetailsPage');
  }

  

}
