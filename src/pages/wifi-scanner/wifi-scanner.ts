import { WifiNetworkDetailsPage } from './../wifi-network-details/wifi-network-details';
import { DatabaseProvider } from './../../providers/database/database';
import { Component } from '@angular/core';
import { NavController, NavParams, FabContainer, AlertController, ModalController } from 'ionic-angular';

declare var WifiWizard: any;

@Component({
  selector: 'page-wifi-scanner',
  templateUrl: 'wifi-scanner.html',
})

export class WifiScannerPage {

  private choosenLocation: any;
  private networks = [];
  pageTitle: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private databaseProvider: DatabaseProvider, private alertCtrl: AlertController, private modalCtrl: ModalController) {
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
    this.databaseProvider.getWifiListFor(this.choosenLocation).then(data => {
      this.networks = data;
    })
  }

  refresh() {
    this.networks = [];
    WifiWizard.getScanResults({}, (networkList) => this.networks = networkList, this.errorHandler);
  }

  save(fab: FabContainer) {
    console.log("save");
    fab.close();

    this.deleteWifiList();
    this.showAlert();     
       
    for (let network of this.networks) {
      this.databaseProvider.addNetwork(network.level, network.SSID, network.BSSID, network.frequency, this.choosenLocation).then(data => {
        this.loadWifiList();
      });
    }
  }

  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'Saving',
      subTitle: 'Network list for ' + this.pageTitle + ' has been updated',
      buttons: ['OK']
    });
    alert.present();
  }

  deleteWifiList() {
    this.databaseProvider.deleteWifiListFor(this.choosenLocation);
  }

  showNetworkDetails(network) {
    //this.navCtrl.push(WifiNetworkDetailsPage, network);
    let modal = this.modalCtrl.create(WifiNetworkDetailsPage, network);
    modal.present();
  }

  errorHandler(e) {
    alert('Problem');
  }

}
