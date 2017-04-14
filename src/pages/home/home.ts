import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [Geolocation]
})
export class HomePage {

  lat : any;
  lng: any;

  constructor(public navCtrl: NavController, private geolocation: Geolocation){//, private geolocation: Geolocation) {

  }

  showCords(){
      this.geolocation.getCurrentPosition().then((resp) => {
          this.lat = resp.coords.latitude;
          this.lng = resp.coords.longitude;
      }).catch((error) => {
        console.log("Error")
      });

      let watch = this.geolocation.watchPosition();
      watch.subscribe((data) => {
        
      })
  }

}
