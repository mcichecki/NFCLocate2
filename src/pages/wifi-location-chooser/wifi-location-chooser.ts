import { LocationEditPage } from './../location-edit/location-edit';
import { DatabaseProvider } from './../../providers/database/database';
import { WifiLocationPage } from './../wifi-location/wifi-location';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

@Component({
   selector: 'page-wifi-location-chooser',
   templateUrl: 'wifi-location-chooser.html',
})
export class WifiLocationChooserPage {

   building = {};
   buildings = [];

   constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, private databaseProvider: DatabaseProvider) {
      this.databaseProvider.getDatabaseState().subscribe(ready => {
         if (ready) {
            this.loadBuildings();
         }
      })
   }

   ionViewDidLoad() {
      console.log('ionViewDidLoad WifiLocationChooserPage');
   }

   addButtonClicked() {
      const alert = this.alertCtrl.create({
         title: 'Location',
         subTitle: 'Enter the name of location',
         inputs: [
            {
               name: 'locationName',
               placeholder: 'Enter the name of location'
            }
         ],
         buttons: [
            {
               text: 'Cancel',
               role: 'cancel',
            },
            {
               text: 'OK',
               handler: data => {
                  this.insertBuilding(data.locationName);
               }
            }
         ]
      });
      alert.present();
   }

   loadBuildings() {
      this.databaseProvider.getAllBuildings().then(data => {
         this.buildings = data;
      });
   }

   openLocationScan(building) {
      this.navCtrl.push(WifiLocationPage, building);
   }

   insertBuilding(buildingName) {
      this.databaseProvider.addBuilding(buildingName).then(data => {
         this.loadBuildings();
      })
   }

   edit(building) {
       this.navCtrl.push(LocationEditPage, building);
   }

   delete(building) {
       console.log("delete" + building.name);
   }
}