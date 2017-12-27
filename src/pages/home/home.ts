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
  log: any;
  timePeriod: number = 1;

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
    syncThreshold: 100,
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

      this.backgroundGeolocation.configure(this.config).subscribe((location: BackgroundGeolocationResponse) => {
        
        this.location = {
          timestamp: Date.now(),
          longitude: location.longitude,
          latitude: location.latitude
        }
  
        this.scannedNetworks = [];
        this.scannedNetworksVector = [];
  
        WifiWizard.getScanResults({}, (networkList) => {
          this.scannedNetworks = networkList;
          this.scannedNetworksVector = this.createScannedNetworkVector();

          this.defineBuilding().subscribe(idBuilding => {
            if (idBuilding) {
              this.currentBuilding = idBuilding;
              this.getNetworkListPromise().subscribe(data => {
                var tempDistance;
                for (let key in data) {
                  let distance = this.calculateDistaceForVector(this.createVector(data[key]));
  
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

  disableBackgroundGeolocation() {
    this.isGeolocationEnabled = false;
    this.backgroundGeolocation.stop();
  }

  private getNetworkListPromise(): Observable<any> {
    return Observable.fromPromise(this.databaseProvider.getNetworksFor(this.currentBuilding));
  }

  private sendHttpPut(buildingLocation: any) {
    this.getLocationName(buildingLocation).subscribe(data => {

      console.log("sendHttpPut: ", JSON.stringify(data));

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
  
      console.log("BODY: ", JSON.stringify(body));
  
      headers.append('Content-Type', 'application-json');
      headers.append('Authorization', 'Basic ' + this.receivedData.key); // headers.append('Authorization', 'Basic MTIzNDU2OjEyMzQ1Ng==');
  
      this.http.put(this.server, body, { headers: headers }).map(res => res.json()).subscribe(
        success => {
          console.log("Response: ", JSON.stringify(success));
        }, error => {
          console.error("Response: ", JSON.stringify(error));
        }
      )
    })
  }

  private getLocationName(locationId : number): Observable<any> {
    console.log("getLocationName: ",locationId);
    if (locationId) {
      return Observable.fromPromise(this.databaseProvider.getLocationNameFor(locationId));
    } else {
      return Observable.of(null);
    }
  }

  private calculateDistaceForVector(vector): number {
    return this.calculateEuclideanDistance(vector) + this.calculateManhattanDistance(vector);
  }

  private createScannedNetworkVector() : number[] {
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
      var difference = Math.pow((savedNetworksVector[i] - this.scannedNetworksVector[i]), 2);
      sum += difference;
    }
    return Math.sqrt(sum);
  }

  private calculateManhattanDistance(savedNetworksVector: any): number {
    let vectorLength = this.scannedNetworksVector.length;

    var sum = 0;
    for (var i = 0; i < vectorLength; i++) {
      var difference = Math.abs(savedNetworksVector[i] - this.scannedNetworksVector[i]);
      sum += difference;
    }
    return sum;
  }

  private createVector(data: [any]) : number[] {

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
  private defineBuilding() : Observable<any> {
    for (let scannedNetwork of this.scannedNetworks) {
      for (let savedNetwork of this.savedNetworks) {
        if (scannedNetwork.BSSID == savedNetwork.BSSID) {
          return Observable.fromPromise(this.databaseProvider.getBuildingIDFor(savedNetwork.idLocation));
        }
      }
    }
    return Observable.of(null);
  }

  private errorHandler(e) {
    alert('Problem');
  }
}