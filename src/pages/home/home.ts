import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';

import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [Geolocation, BackgroundGeolocation],
})

export class HomePage {

  lat: any;
  lng: any;
  acc: any;
  alti: any;
  head: any;
  speed: any;
  status: any;
  log: any;
  timePeriod: number = 1;
  currentTime: any;

  localServer = 'http://192.168.0.18:8080';
  onlineServer = 'https://nfc-locate.herokuapp.com/';
  server = this.onlineServer;

  updateInterval = 60000; //60000ms = 1min

  constructor(public navCtrl: NavController,
    private geolocation: Geolocation,
    private backgroundGeolocation: BackgroundGeolocation,
    private http: Http) { }

  showCords() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      this.acc = resp.coords.accuracy;
      this.alti = resp.coords.altitude;
      this.head = resp.coords.altitude;
      this.speed = resp.coords.speed;
      this.status = "Geolocation";
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
      url: this.server,//'http://192.168.0.18:8080',//'http://localhost:8080',//'
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
      this.currentTime = location.time;
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

  sendHttpPost() {
    var body: any;
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.status = "HTTP POST";


    body = {
      latitude: this.lat,
      longitude: this.lng,
      accuracy: this.acc,
      altitude: this.alti,
      speed: this.speed,
    };

    //this.http.post('http://192.168.0.18:8080', JSON.stringify(body), {headers: headers})
    this.http.post(this.server, JSON.stringify(body))
      .map(res => res.json())
      .subscribe(data => {
        console.log(data);
      });
  }
}