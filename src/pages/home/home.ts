import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import { SMS } from '@ionic-native/sms';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [Geolocation, BackgroundGeolocation, SMS],
})

export class HomePage {

  lat: any;
  lng: any;
  acc: any;
  status: any;
  log: any;
  timePeriod: number = 1;

  updateInterval = 60000; //60000ms = 1min

  constructor(public navCtrl: NavController,
    private geolocation: Geolocation,
    private backgroundGeolocation: BackgroundGeolocation,
    private sms: SMS) { }

  showCords() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      this.acc = resp.coords.accuracy;
      this.status = "Geolocation"
    }).catch((error) => {
      console.log("Error")
    });
  }

  enableBackgroundGeolocation() {
    let config: BackgroundGeolocationConfig = {
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

    this.backgroundGeolocation.configure(config).subscribe((location: BackgroundGeolocationResponse) => {
      this.lat = location.latitude;
      this.lng = location.longitude;
      this.acc = location.accuracy;
      //this.backgroundGeolocation.finish();
    });
    this.backgroundGeolocation.start();

    this.status = "Background start";
    this.log = config.fastestInterval;
  }

  disableBackgroundGeolocation() {
    this.status = "Background stop";
    this.backgroundGeolocation.stop();
  }

  sendSMS(){

    var smsOptions = {
      android: {
        intent: ""
      }
    }

    this.sms.send("691443886","test sms", smsOptions);
    this.status = "SMS";
  }
}