import { Platform } from 'ionic-angular';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { SQLite } from '@ionic-native/sqlite';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs/Rx';
import { SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class DatabaseProvider {
  database: SQLiteObject;
  private databaseReady: BehaviorSubject<boolean>;

  constructor(public sqlitePorter: SQLitePorter, private storage: Storage, private sqlite: SQLite, private platform: Platform, private http: Http) {
    this.databaseReady = new BehaviorSubject(false);
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'database.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          this.database = db;
          this.storage.get('database_filled').then(val => {
            if (val) {
              this.databaseReady.next(true);
            } else {
              this.fillDatabase();
            }
          });
        });
    });
  }

  fillDatabase() {
    this.http.get('assets/database.sql')
      .map(res => res.text())
      .subscribe(sql => {
        this.sqlitePorter.importSqlToDb(this.database, sql)
          .then(data => {
            this.databaseReady.next(true);
            this.storage.set('database_filled', true);
          })
          .catch(e => console.error(e));
      });
  }

  addBuilding(name) {
    let data = [name]
    return this.database.executeSql("INSERT INTO budynek (nazwaBudynku) VALUES (?)", data).then(data => {
      return data;
    }, err => {
      console.log('Error: ', err);
      return err;
    });
  }

  getAllBuildings() {
    return this.database.executeSql("SELECT * FROM budynek", []).then((data) => {
      let buildings = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
            buildings.push({id: data.rows.item(i).idBudynku,
            street: data.rows.item(i).ulica,
            number: data.rows.item(i).numerBudynku,
            city: data.rows.item(i).miasto,
            postalCode: data.rows.item(i).kodPocztowy,
            name: data.rows.item(i).nazwaBudynku
          });
        }
      }
      return buildings;
    }, err => {
      console.log('Error: ', err);
      return [];
    });
  }

  getDatabaseState() {
    return this.databaseReady.asObservable();
  }
}
