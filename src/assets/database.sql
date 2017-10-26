CREATE TABLE IF NOT EXISTS budynek(idBudynku INTEGER PRIMARY KEY AUTOINCREMENT,
                                    ulica TEXT,
                                    numerBudynku VARCHAR(6),
                                    miasto TEXT,
                                    kodPocztowy CHAR(6),
                                    nazwaBudynku TEXT);

CREATE TABLE lokalizacja(idLokalizacji INTEGER PRIMARY KEY AUTOINCREMENT,
                            nazwaLokalizacji TEXT,
                            pietro INTEGER,
                            idBudynku INTEGER,
                            FOREIGN KEY (idBudynku) REFERENCES budynek(idBudynku));

CREATE TABLE siec(idSieci INTEGER PRIMARY KEY AUTOINCREMENT,
                    poziomSygnalu INTEGER,
                    SSID TEXT,
                    BSSID TEXT,
                    czestotliwosc REAL,
                    idLokalizacji INTEGER,
                    FOREIGN KEY (idLokalizacji) REFERENCES budynek(idLokalizacji));

INSERT INTO budynek(ulica, numerBudynku, miasto, kodPocztowy, nazwaBudynku) VALUES ('Nowowiejska', '15/19', 'Warszawa', '00-665', 'Wydział Elektroniki i Technik Informacyjnych');
INSERT INTO budynek(ulica, numerBudynku, miasto, kodPocztowy, nazwaBudynku) VALUES ('Plac Politechniki', '1', 'Warszawa', '01-205', 'Gmach Glowny');
INSERT INTO budynek(ulica, numerBudynku, miasto, kodPocztowy, nazwaBudynku) VALUES ('KEN 98', '77', 'Warszawa', '02-666', 'Dom');

INSERT INTO lokalizacja(nazwaLokalizacji, pietro, idBudynku) VALUES ("Skrzydlo A", '4', '1'); -- 1
INSERT INTO lokalizacja(nazwaLokalizacji, pietro, idBudynku) VALUES ("Skrzydlo A", '3', '1'); -- 2
INSERT INTO lokalizacja(nazwaLokalizacji, pietro, idBudynku) VALUES ("Skrzydlo C", '3', '1'); -- 3
INSERT INTO lokalizacja(nazwaLokalizacji, pietro, idBudynku) VALUES ("Sala 1", '0', '2'); -- 4
INSERT INTO lokalizacja(nazwaLokalizacji, pietro, idBudynku) VALUES ("Sala 2", '0', '2'); --5 
INSERT INTO lokalizacja(nazwaLokalizacji, pietro, idBudynku) VALUES ("Room", '0', '3'); -- 6

INSERT INTO siec(poziomSygnalu, SSID, BSSID, czestotliwosc, idLokalizacji) VALUES ('11', 'siec1', 'bssid1', '2.5', '1');
INSERT INTO siec(poziomSygnalu, SSID, BSSID, czestotliwosc, idLokalizacji) VALUES ('22', 'siec2', 'bssid2', '5', '1');
INSERT INTO siec(poziomSygnalu, SSID, BSSID, czestotliwosc, idLokalizacji) VALUES ('33', 'siec3', 'bssid3', '5', '3');
INSERT INTO siec(poziomSygnalu, SSID, BSSID, czestotliwosc, idLokalizacji) VALUES ('44', 'siec4', 'bssid4', '5', '4');
INSERT INTO siec(poziomSygnalu, SSID, BSSID, czestotliwosc, idLokalizacji) VALUES ('55', 'siec5', 'bssid5', '5', '5');
INSERT INTO siec(poziomSygnalu, SSID, BSSID, czestotliwosc, idLokalizacji) VALUES ('-80', 'siec6', 'b4:2a:0e:49:af:e5', '5', '6');

