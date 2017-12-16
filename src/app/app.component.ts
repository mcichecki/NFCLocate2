import { WifiBuildingChooserPage } from './../pages/wifi-building-chooser/wifi-building-chooser';
import { TabsPage } from './../pages/tabs/tabs';
import { WifiLocationPage } from './../pages/wifi-location/wifi-location';
import { HomePage } from './../pages/home/home';
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Deeplinks } from '@ionic-native/deeplinks';

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  rootPage:any = TabsPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private deeplinks: Deeplinks) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleLightContent();
      splashScreen.hide();

      this.deeplinks.route({
        '/': {}
      }).subscribe((match) => {
        // match.$route - the route we matched, which is the matched entry from the arguments to route()
        // match.$args - the args passed in the link
        // match.$link - the full link data
        let key = match.$args.key;
        
        console.log("KEY: ", key);
        //console.log('Successfully matched route', match);
      }, (nomatch) => {
        // nomatch.$link - the full link data
        console.error('Got a deeplink that didn\'t match', nomatch);
      });

    });
  }
}

