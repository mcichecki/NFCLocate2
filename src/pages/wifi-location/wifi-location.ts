import { WifiScannerPage } from './../wifi-scanner/wifi-scanner';
import { DatabaseProvider } from './../../providers/database/database';
import { Component, ErrorHandler } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';

@Component({
  selector: 'page-wifi-location',
  templateUrl: 'wifi-location.html',
})

export class WifiLocationPage {

  ssid: any;
  networkList = [];
  locations = [];
  choosenBuilding: any;
  shouldShowAdd: boolean = false;

  locationName: any;
  floor: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private databaseProvider: DatabaseProvider, private alertCtrl: AlertController) {
    this.choosenBuilding = this.navParams.get('idBuilding');

    this.databaseProvider.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.loadLocations();
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WifiLocationPage');
  }

  private loadLocations() {
    console.log("loadLocation" + this.choosenBuilding);
    this.databaseProvider.getLocationsFor(this.choosenBuilding).then(data => {
      this.locations = data;
    })
  }

  private addButtonClicked() {
    this.shouldShowAdd = true;
  }

  private addConfirmationClicked() {
    if (this.locationName != "" && this.floor != "") {
      this.addLocation(this.locationName, this.floor, this.choosenBuilding);
      this.shouldShowAdd = false;
      this.locationName = "";
      this.floor = "";
    }
  }

  private addLocation(locationName, floor, building) {
    this.databaseProvider.addLocation(locationName, floor, building);
    this.loadLocations();
  }

  openWifiScanner(location, ev) {
    ev.stopPropagation();
    this.navCtrl.push(WifiScannerPage, location);
  }

  delete(location, ev) {
    ev.stopPropagation();
    console.log("location: " + location.idLocation);
    this.databaseProvider.deleteNetworkForLocation(location.idLocation).then(data => {
      this.databaseProvider.deleteLocationForLocation(location.idLocation).then(data => {
        this.loadLocations();
      })
    })
  }

  private addCancelClicked() {
    this.shouldShowAdd = false;
  }

  private insertLocation(locationName, floor) {
    console.log("INSERTLOCATION: " + locationName + " " + floor);
  }
}