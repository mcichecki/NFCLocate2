import { WifiNetworkDetailsPage } from './../pages/wifi-network-details/wifi-network-details';
import { WifiScannerPage } from './../pages/wifi-scanner/wifi-scanner';
import { LocationEditPage } from './../pages/location-edit/location-edit';
import { WifiBuildingChooserPage } from './../pages/wifi-building-chooser/wifi-building-chooser';
import { TabsPage } from './../pages/tabs/tabs';
import { WifiLocationPage } from './../pages/wifi-location/wifi-location';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { DatabaseProvider } from '../providers/database/database';

import { IonicStorageModule } from '@ionic/storage';

import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { SQLite } from '@ionic-native/sqlite';

import { Deeplinks } from '@ionic-native/deeplinks';
import { NativeStorage } from '@ionic-native/native-storage';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    WifiBuildingChooserPage,
    WifiLocationPage,
    LocationEditPage,
    WifiScannerPage,
    WifiNetworkDetailsPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    IonicStorageModule.forRoot({
      name: '__mydb',
      driverOrder: ['websql', 'sqlite', 'indexeddb']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    WifiBuildingChooserPage,
    WifiLocationPage,
    LocationEditPage,
    WifiScannerPage,
    WifiNetworkDetailsPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatabaseProvider,
    SQLite,
    SQLitePorter,
    Deeplinks,
    NativeStorage
  ]
})
export class AppModule {}
