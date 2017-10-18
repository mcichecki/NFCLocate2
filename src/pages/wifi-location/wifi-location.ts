import { DatabaseProvider } from './../../providers/database/database';
import { Component, ErrorHandler } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';

declare var WifiWizard: any;

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
    if (this.locationName != "" && this.floor != ""){
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

  private addCancelClicked() {
    this.shouldShowAdd = false;
  }

  getSSIDName() {
    console.log("GET SSID");
    WifiWizard.getCurrentSSID((ssid: String) => this.ssid = ssid, this.errorHandler);
  }

  getNetworkList() {
    this.networkList = [];
    WifiWizard.getScanResults({}, (networkList) => this.networkList = networkList, this.errorHandler);
  }

  private insertLocation(locationName, floor) {
    console.log("INSERTLOCATION: " + locationName + " " + floor);
  }

  errorHandler(e) {
    alert('Problem');
  }
}