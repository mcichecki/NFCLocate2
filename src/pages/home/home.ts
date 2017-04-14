import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [Geolocation, BackgroundGeolocation],
})

export class HomePage {

  lat: any;
  lng: any;
  accuracy: any;
  status: any;
  log: any;
  timePeriod: number = 1;

  updateInterval = 60000;

  config: BackgroundGeolocationConfig = {
    stationaryRadius: 50,
    distanceFilter: 50,
    desiredAccuracy: 10,
    debug: true,
    locationProvider: 1,
    interval: this.updateInterval * this.timePeriod,
    fastestInterval: this.updateInterval * this.timePeriod,
    activitiesInterval: this.updateInterval * this.timePeriod,
    stopOnTerminate: false,
    startForeground: true,
    stopOnStillActivity: false,
    activityType: 'AutomotiveNavigation',
    url: 'http://192.168.0.18:8080', // url: 'http://localhost:8080'
    syncThreshold: 100,
    httpHeaders: {
      'X-FOO': 'bar'
    },
    pauseLocationUpdates: false,
    saveBatteryOnBackground: false,
    maxLocations: 100
  };

  constructor(public navCtrl: NavController,
    private geolocation: Geolocation,
    private backgroundGeolocation: BackgroundGeolocation) { }

  showCords() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      this.accuracy = resp.coords.accuracy;
      this.status = "Geolocation"
    }).catch((error) => {
      console.log("Error")
    });
  }

  enableBackgroundGeolocation() {
    this.backgroundGeolocation.configure(this.config).subscribe((location: BackgroundGeolocationResponse) => {
      this.lat = location.latitude;
      this.lng = location.longitude;
      this.accuracy = location.accuracy;
      //this.backgroundGeolocation.finish();
    });
    this.backgroundGeolocation.start();

    this.status = "Background start";
    this.log = this.config.fastestInterval;
  }

  disableBackgroundGeolocation() {
    this.status = "Background stop";
    this.backgroundGeolocation.stop();
  }
}

// var config: BackgroundGeolocationConfig = {
//   stationaryRadius: 50,
//   distanceFilter: 50,
//   desiredAccuracy: 10,
//   debug: true,
//   locationProvider: 1,
//   interval: 60000,
//   fastestInterval: 60000,
//   activitiesInterval: 60000,
//   stopOnTerminate: false,
//   startForeground: true,
//   stopOnStillActivity: false,
//   activityType: 'AutomotiveNavigation',
//   url: 'http://192.168.0.18:8080', // url: 'http://localhost:8080'
//   syncThreshold: 100,
//   httpHeaders: {
//     'X-FOO': 'bar'
//   },
//   pauseLocationUpdates: false,
//   saveBatteryOnBackground: false,
//   maxLocations: 100
// };
