import { WifiBuildingChooserPage } from './../pages/wifi-building-chooser/wifi-building-chooser';
import { TabsPage } from './../pages/tabs/tabs';
import { WifiLocationPage } from './../pages/wifi-location/wifi-location';
import { HomePage } from './../pages/home/home';
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  rootPage:any = TabsPage;

  constructor(platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen) {

    console.log("constructor");
    platform.ready().then(() => {
      console.log("ready");
      statusBar.styleLightContent();
      splashScreen.hide();
    });
  }
}

