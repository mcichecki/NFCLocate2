import { DatabaseProvider } from './../../providers/database/database';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: 'page-location-edit',
  templateUrl: 'location-edit.html',
})
export class LocationEditPage {

  building: any;
  choosenBuilding: any;

  public editForm: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formGroup: FormBuilder, private databaseProvider: DatabaseProvider) {
    this.building = this.navParams.data;
    this.choosenBuilding = this.navParams.get('idBuilding');
    this.editForm = this.formGroup.group({
      "name": ['', Validators.required],
      "street": ['', Validators.required],
      "number": ['', Validators.required],
      "city": ['', Validators.required],
      "postalCode": ['', Validators.required]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LocationEditPage');
  }

  editBuilding() {
    let building = {
      "name": this.building.name,
      "street": this.building.street,
      "number": this.building.number,
      "city": this.building.city,
      "postalCode": this.building.postalCode
    }
    this.databaseProvider.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.databaseProvider.editBuilding(building, this.choosenBuilding).then(data => {
          console.log("DONE");
        })
      }
    })
  }

}
