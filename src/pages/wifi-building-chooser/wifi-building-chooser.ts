import { LocationEditPage } from './../location-edit/location-edit';
import { DatabaseProvider } from './../../providers/database/database';
import { WifiLocationPage } from './../wifi-location/wifi-location';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

@Component({
    selector: 'page-wifi-building-chooser',
    templateUrl: 'wifi-building-chooser.html',
})
export class WifiBuildingChooserPage {

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
        console.log('ionViewDidLoad WifiBuildingChooserPage');
    }

    addButtonClicked() {
        const alert = this.alertCtrl.create({
            title: 'Location',
            subTitle: 'Enter the name of the building',
            inputs: [
                {
                    name: 'buildingName',
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
                        if (data.buildingName != "") {
                            this.insertBuilding(data.buildingName);

                        }
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

    openLocationScan(building, ev) {
        console.log("open");
        ev.stopPropagation();
        this.navCtrl.push(WifiLocationPage, building);
    }

    insertBuilding(buildingName) {
        this.databaseProvider.addBuilding(buildingName).then(data => {
            this.loadBuildings();
        })
    }

    edit(building, ev) {
        console.log("edit");        
        ev.stopPropagation();
        this.navCtrl.push(LocationEditPage, building);
    }

    delete(building, ev) {
        console.log("delete");        
        ev.stopPropagation();
        console.log("delete" + building.name);
    }
}