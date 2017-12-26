import { DatabaseProvider } from './../../providers/database/database';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { RequestOptions } from '@angular/http/src/base_request_options';
import { NativeStorage } from '@ionic-native/native-storage';
import { MyApp } from '../../app/app.component';
import { ReceivedData } from '../../classes/received-data';
import { Deeplinks } from '@ionic-native/deeplinks';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

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

  calculatedLocation: String;

  private currentBuilding: any;

  private scannedNetworks = [];
  private scannedNetworksVector = [];

  private savedNetworksVector = [];
  private savedNetworks = [];

  private receivedData: ReceivedData;

  localServer = 'http://192.168.0.17:8080';
  onlineServer = 'https://nfc-locate.herokuapp.com/';//
  elkaServer = 'https://nefico.tele.pw.edu.pl:8080/geo';
  server = this.elkaServer;

  test: number = 0;

  updateInterval = 60000; //60000ms = 1min

  private config: BackgroundGeolocationConfig = {
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
    //url: this.server,//'http://192.168.0.18:8080',//'http://localhost:8080',//'
    syncThreshold: 100,
    // httpHeaders: {
    //   'X-FOO': 'bar'
    // },
    pauseLocationUpdates: false,
    saveBatteryOnBackground: false,
    maxLocations: 100
  };

  constructor(public navCtrl: NavController,
    private geolocation: Geolocation,
    private backgroundGeolocation: BackgroundGeolocation,
    private http: Http,
    private databaseProvider: DatabaseProvider,
    private nativeStorage: NativeStorage,
    private deeplinks: Deeplinks,
    private alertCtrl: AlertController) {

    this.databaseProvider.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.databaseProvider.getAllWifiList().then(data => {
          this.savedNetworks = data;
        })
        this.deeplinks.route({
          '/': {}
        }).subscribe((match) => {

          let receivedData: ReceivedData = {
            key: match.$args.key,
            groupId: match.$args.groupId,
          }

          this.nativeStorage.setItem("receivedData", receivedData).then(
            () => { this.receivedData = receivedData},
            error => console.error('Error ', error)
          );

        }, (nomatch) => {
          console.error('Got a deeplink that didn\'t match', nomatch);
        });
      }
    })
  }

  ionViewWillEnter() {
    console.log("DATA - willEnter", JSON.stringify(this.receivedData));
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
    if (!this.receivedData) {
      let alert = this.alertCtrl.create({
        title: 'No data',
        subTitle: 'Base app did not provide data',
        buttons: ['Ok']
      });

      alert.present();
    } else {
      this.backgroundGeolocation.configure(this.config).subscribe((location: BackgroundGeolocationResponse) => {
        this.lat = location.latitude;
        this.lng = location.longitude;
        this.acc = location.accuracy;
        this.currentTime = location.time;
  
        this.scannedNetworks = [];
        this.scannedNetworksVector = [];
  
        WifiWizard.getScanResults({}, (networkList) => {
          this.scannedNetworks = networkList;
          this.scannedNetworksVector = this.createScannedNetworkVector();
          this.defineBuilding().subscribe(idBuilding => {
            if (idBuilding) {
              this.currentBuilding = idBuilding;
              this.testMethod().subscribe(data => {
                var tempDistance;
                for (let key in data) {
                  let distance = this.calculateDistaceForVector(this.createVector(data[key]));
  
                  console.log("DISTANCE:, ", key, " - ", distance);
                  if (tempDistance == undefined) {
                    tempDistance = distance;
                    this.calculatedLocation = key;
                  } else {
                    if (tempDistance > distance) {
                      this.calculatedLocation = key;
                      tempDistance = distance;
                    }
                  }
                }
                this.sendHttpPut("Location" + this.calculatedLocation);
              })
  
            } else {
              console.log("UNDEFINED");
              this.sendHttpPut(undefined);
            }
          });
        });
  
  
      });
      this.backgroundGeolocation.start();
  
      this.status = "Background start";
      this.log = this.config.fastestInterval;
    }
  }

  private testMethod() {
    return Observable.fromPromise(this.databaseProvider.getNetworksFor(this.currentBuilding));
  }

  disableBackgroundGeolocation() {
    this.status = "Background stop";
    this.backgroundGeolocation.stop();
  }

  sendHttpPut(buildingLocation) {
    var body: any;
    var headers = new Headers();

    body = {
      timestamp: Date.now(),
      latitude: this.lat * 1.29,
      longitude: this.lng * 1.13,
      groupId: this.receivedData.groupId
    };

    if (buildingLocation) {
      body.buildingLocation = buildingLocation;
    }

    console.log("BODY: ", JSON.stringify(body));

    headers.append('Content-Type', 'application-json');
    headers.append('Authorization', 'Basic ' + this.receivedData.key); // headers.append('Authorization', 'Basic MTIzNDU2OjEyMzQ1Ng==');
    
    this.http.put(this.server, body, { headers: headers }).map(res => res.json()).subscribe(data => {
      console.log("RESPONSE: ", JSON.stringify(data));
    })
  }

  // BUTTON
  refresh() {

    //TIME START
    var start = performance.now();

    this.defineBuilding().subscribe(idBuilding => {
      this.currentBuilding = idBuilding;

      console.log("SCANNED NETWORKS: ", this.scannedNetworksVector.length, " - ", JSON.stringify(this.scannedNetworksVector));

      this.databaseProvider.getNetworksFor(this.currentBuilding).then(data => {
        var tempDistance;
        for (let key in data) {
          let distance = this.calculateDistaceForVector(this.createVector(data[key]));

          if (tempDistance == undefined) {
            tempDistance = distance;
          } else {
            if (tempDistance > distance) {
              this.calculatedLocation = key;
              tempDistance = distance;
            }
          }
        }
      })

    }, this.errorHandler);

    //TIME STOP
    var stop = performance.now();
    console.log("TIME: ", (stop - start));
    //
  }

  private calculateDistaceForVector(vector): number {
    return this.calculateEuclideanDistance(vector) + this.calculateManhattanDistance(vector);
  }

  private createScannedNetworkVector() {
    var scannedNetworksVector = [];
    for (let scannedNetwork of this.scannedNetworks) {
      scannedNetworksVector.push(scannedNetwork.level);
    }
    return scannedNetworksVector;
  }

  private calculateEuclideanDistance(savedNetworksVector: any): number {
    let vectorLength = this.scannedNetworksVector.length;

    // console.log("saved: ", JSON.stringify(savedNetworksVector));
    // console.log("scanned: ", JSON.stringify(this.scannedNetworksVector));

    var sum = 0;
    for (var i = 0; i < vectorLength; i++) {
      var difference = Math.pow((savedNetworksVector[i] - this.scannedNetworksVector[i]), 2);
      sum += difference;
    }

    return Math.sqrt(sum);
  }

  private calculateManhattanDistance(savedNetworksVector: any): number {
    let vectorLength = this.scannedNetworksVector.length;

    // console.log("saved: ", JSON.stringify(savedNetworksVector));
    // console.log("scanned: ", JSON.stringify(this.scannedNetworksVector));

    var sum = 0;
    for (var i = 0; i < vectorLength; i++) {
      var difference = Math.abs(savedNetworksVector[i] - this.scannedNetworksVector[i]);
      sum += difference;
    }

    return sum;
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
    return Observable.of(null);
  }

  errorHandler(e) {
    alert('Problem');
  }
}