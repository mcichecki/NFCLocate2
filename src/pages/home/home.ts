import { DatabaseProvider } from './../../providers/database/database';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { NativeStorage } from '@ionic-native/native-storage';
import { ReceivedData } from '../../classes/received-data';
import { Deeplinks } from '@ionic-native/deeplinks';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Location } from '../../classes/location';

declare var WifiWizard: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [Geolocation, BackgroundGeolocation],
})

export class HomePage {

  private calculatedLocation: String;
  private currentBuilding: any;

  private scannedNetworks = [];
  private scannedNetworksVector = [];

  private savedNetworksVector = [];
  private savedNetworks = [];

  private receivedData: ReceivedData;
  private location: Location;

  private localServer = 'http://192.168.0.17:8080';
  private onlineServer = 'https://nfc-locate.herokuapp.com/';//
  private elkaServer = 'https://nefico.tele.pw.edu.pl:8080/geo';
  private server = this.elkaServer;

  private updateInterval = 60000; //60000ms = 1min

  isGeolocationEnabled: boolean = false;
  status: any;
  timePeriod: number = 1;

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
            key: this.fillBase64(match.$args.key),
            groupId: match.$args.groupId,
          }

          this.receivedData = receivedData;

        }, (nomatch) => {
          console.error('Got a deeplink that didn\'t match', nomatch);
        });
      }
    })
  }

  ionViewWillEnter() {
    this.savedNetworks = [];
    
    this.databaseProvider.getAllWifiList().then(data => {
      this.savedNetworks = data;
    })
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
      this.isGeolocationEnabled = true;

      var config: BackgroundGeolocationConfig = {
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
        syncThreshold: 100,
        pauseLocationUpdates: false,
        saveBatteryOnBackground: false,
        maxLocations: 100
      };

      this.backgroundGeolocation.configure(config).subscribe((location: BackgroundGeolocationResponse) => {

        this.location = {
          timestamp: Date.now(),
          longitude: location.longitude,
          latitude: location.latitude
        }

        this.wifiLocation();

      });
      this.backgroundGeolocation.start();

      this.status = "Background start";
    }
  }

  disableBackgroundGeolocation() {
    this.isGeolocationEnabled = false;
    this.backgroundGeolocation.stop();
  }

  private wifiLocation() {

    this.scannedNetworks = [];
    this.scannedNetworksVector = [];

    WifiWizard.startScan(success => {
      WifiWizard.getScanResults({}, (networkList) => {

        this.scannedNetworks = networkList;
        this.scannedNetworksVector = this.createScannedNetworkVector();

        this.defineBuilding().subscribe(idBuilding => {
          if (idBuilding) {
            this.currentBuilding = idBuilding;
            this.getNetworkListPromise().subscribe(data => {
              var tempDistance;

              for (let key in data) {
                this.newScannedNetworksVector(this.scannedNetworks, data[key]);

                var distance;

                distance = this.calculateDistaceForVector(this.savedNetworksVector);

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
              this.sendHttpPut(this.calculatedLocation);
            })
          } else {
            this.sendHttpPut(undefined);
          }
        });
      }, fail => {
        console.error("SCAN FAILED");
      });
    })

  }

  private newScannedNetworksVector(scannedNetworks, savedNetworks) {
    let scannedLength = scannedNetworks.length;
    let savedLength = savedNetworks.length;

    var scannedVector = [];
    var savedVector = [];

    for (var i = 0; i < scannedLength; i++) {
      for (var j = 0; j < savedLength; j++) {
        if (scannedNetworks[i].BSSID == savedNetworks[j].BSSID) {
          scannedVector.push(scannedNetworks[i].level);
          savedVector.push(savedNetworks[j].level);
        }
      }

      this.scannedNetworksVector = scannedVector;
      this.savedNetworksVector = savedVector;
    }
  }


  private getNetworkListPromise(): Observable<any> {
    return Observable.fromPromise(this.databaseProvider.getNetworksFor(this.currentBuilding));
  }

  private sendHttpPut(buildingLocation: any) {
    this.getLocationName(buildingLocation).subscribe(data => {

      var body: any;
      var headers = new Headers();

      body = {
        timestamp: Date.now(),
        latitude: this.location.latitude * 1.29,
        longitude: this.location.longitude * 1.13,
        groupId: this.receivedData.groupId
      };

      if (data) {
        body.location = data;
      }

      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Basic ' + this.receivedData.key);

      this.http.put(this.server, body, { headers: headers }).map(res => res.json()).subscribe(
        success => {
          console.log("Response: ", JSON.stringify(success));
        }, error => {
          console.error("Response: ", JSON.stringify(error));
        }
      )
    })
  }

  private getLocationName(locationId: any): Observable<any> {
    if (locationId) {
      return Observable.fromPromise(this.databaseProvider.getLocationAndBuildingFor(locationId));
    } else {
      return Observable.of(null);
    }
  }

  private calculateDistaceForVector(vector: number[]): number {
    return vector.length == 0 ? 99999 : (this.calculateEuclideanDistance(vector) + this.calculateManhattanDistance(vector)) / vector.length;
  }

  private createScannedNetworkVector(): number[] {
    var scannedNetworksVector = [];
    for (let scannedNetwork of this.scannedNetworks) {
      scannedNetworksVector.push(scannedNetwork.level);
    }
    return scannedNetworksVector;
  }

  private calculateEuclideanDistance(savedNetworksVector: any): number {
    let vectorLength = this.scannedNetworksVector.length;

    var sum = 0;
    for (var i = 0; i < vectorLength; i++) {
      var difference = Math.pow((this.savedNetworksVector[i] - this.scannedNetworksVector[i]), 2);
      sum += difference;
    }

    return Math.sqrt(sum / vectorLength);
  }

  private calculateManhattanDistance(savedNetworksVector: any): number {
    let vectorLength = this.scannedNetworksVector.length;

    var sum = 0;
    for (var i = 0; i < vectorLength; i++) {
      var difference = Math.abs(this.savedNetworksVector[i] - this.scannedNetworksVector[i]);
      sum += difference;
    }

    return sum / vectorLength;
  }

  // BUILDING LOOKUP FUNCTION
  private defineBuilding(): Observable<any> {
    for (let scannedNetwork of this.scannedNetworks) {
      for (let savedNetwork of this.savedNetworks) {
        if (scannedNetwork.BSSID == savedNetwork.BSSID) {
          return Observable.fromPromise(this.databaseProvider.getBuildingIDFor(savedNetwork.idLocation));
        }
      }
    }
    return Observable.of(null);
  }

  private fillBase64(key: string): string {
    switch (key.length % 4) {
      case 2: {
        return key + "==";
      }
      case 3: {
        return key + "=";

      }
      default: {
        return key;
      }
    }
  }

  manualScan() {
    this.wifiLocation();
  }
}