import { DatabaseProvider } from './../../providers/database/database';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

declare var WifiWizard: any;

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

  private currentBuilding: any;

  private scannedNetworks = [];
  private scannedNetworksVector = [];

  private savedNetworksVector = [];
  private savedNetworks = [];

  localServer = 'http://192.168.0.18:8080';
  onlineServer = 'https://nfc-locate.herokuapp.com/';//
  server = this.onlineServer;

  updateInterval = 60000; //60000ms = 1min

  constructor(public navCtrl: NavController,
    private geolocation: Geolocation,
    private backgroundGeolocation: BackgroundGeolocation,
    private http: Http,
    private databaseProvider: DatabaseProvider) {
    this.databaseProvider.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.databaseProvider.getAllWifiList().then(data => {
          this.savedNetworks = data;
        })
      }
    })
  }

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
    headers.append('name-test', 'value-test');

    this.status = "HTTP POST";

    body = {
      latitude: this.lat,
      longitude: this.lng,
      accuracy: this.acc,
      altitude: this.alti,
      speed: this.speed,
    };

    this.http.post(this.server, JSON.stringify(body), JSON.stringify(headers))
      .map(res => res.json())
      .subscribe(data => {
        console.log(data);
      });
  }

  // BUTTON
  refresh() {
    console.log("refresh");

    //TIME START
    var start = performance.now();
    //

    this.scannedNetworks = [];
    this.scannedNetworksVector = [];

    WifiWizard.getScanResults({}, (networkList) => {
      this.scannedNetworks = networkList;
      this.scannedNetworksVector = this.createScannedNetworkVector();

      this.defineBuilding().subscribe(idBuilding => {
        this.currentBuilding = idBuilding;

        console.log("SCANNED NETWORKS: ", this.scannedNetworksVector.length, " - ", JSON.stringify(this.scannedNetworksVector));

        this.databaseProvider.getNetworksFor(this.currentBuilding).then(data => {
          for (let key in data) {
            console.log("KEY: ", key);
            console.log("EUCL: ", this.calculateEuclideanDistance(this.createVector(data[key])));
          }
        })
      })
    }, this.errorHandler);

    //TIME STOP
    var stop = performance.now();
    console.log("TIME: ", (stop - start));
    //
  }

  private createScannedNetworkVector() {
    var scannedNetworksVector = [];
    for (let scannedNetwork of this.scannedNetworks) {
      scannedNetworksVector.push(scannedNetwork.level);
    }
    return scannedNetworksVector;
  }

  private calculateEuclideanDistance(savedNetworksVector: any) {
    let vectorLength = this.scannedNetworksVector.length;

    console.log("saved: ", JSON.stringify(savedNetworksVector));
    console.log("scanned: ", JSON.stringify(this.scannedNetworksVector));

    var sum = 0;
    for (var i = 0; i < vectorLength; i++) {
      var difference = Math.pow((Math.abs(savedNetworksVector[i]) - Math.abs(this.scannedNetworksVector[i])), 2);
      sum += difference;
    }

    return Math.sqrt(sum);
  }

  private createVector(data: [any]) {

    this.savedNetworksVector = [];
    var shouldAddValue: boolean = false;
    var networkLevel = 0;

    for (let scannedNetwork of this.scannedNetworks) {
      for (let network of data) {
        if (scannedNetwork.BSSID == network.BSSID) {
          shouldAddValue = true;
          networkLevel = network.level;
          break;
        }
      }
      if (shouldAddValue) {
        this.savedNetworksVector.push(networkLevel);
        shouldAddValue = false;
      } else {
        this.savedNetworksVector.push(-120);
      }
    }
    return this.savedNetworksVector;
  }

  // BUILDING LOOKUP FUNCTION
  private defineBuilding() {
    for (let scannedNetwork of this.scannedNetworks) {
      for (let savedNetwork of this.savedNetworks) {
        if (scannedNetwork.BSSID == savedNetwork.BSSID) {
          return Observable.fromPromise(this.databaseProvider.getBuildingIDFor(savedNetwork.idLocation));
        }
      }
    }
  }

  errorHandler(e) {
    alert('Problem');
  }
}