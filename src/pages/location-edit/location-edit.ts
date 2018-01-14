import { DatabaseProvider } from './../../providers/database/database';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FormBuilder, Validators } from "@angular/forms";
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

@Component({
  selector: 'page-location-edit',
  templateUrl: 'location-edit.html',
})
export class LocationEditPage {

  building: any;
  choosenBuilding: any;

  public editForm: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public formGroup: FormBuilder,
    private databaseProvider: DatabaseProvider,
    private alertCtrl: AlertController) {

    this.building = this.navParams.data;
    this.choosenBuilding = this.navParams.get('idBuilding');
    this.editForm = this.formGroup.group({
      "name": ['', Validators.required],
      "street": ['', Validators.required],
      "number": ['', [Validators.required, Validators.pattern('^[0-9+]*$')]],
      "city": ['', Validators.required],
      "postalCode": ['', [Validators.required, Validators.pattern('^[0-9]{2}-[0-9]{3}$')]]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LocationEditPage');
  }

  editBuilding() {
    console.log("EDIT clicked");
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
          this.alertCtrl.create({
            title: 'Edit successful',
            buttons: [{
              text: 'OK',
              handler: data => {
                console.log("DONE");
                this.navCtrl.pop();
              }
            }]
          }).present();
        })
      }
    })
  }

}
