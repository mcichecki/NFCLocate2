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
INSERT INTO budynek(ulica, numerBudynku, miasto, kodPocztowy, nazwaBudynku) VALUES ('Mlynarska', '7', 'Warszawa', '01-205', 'Freeport Metrics');

INSERT INTO lokalizacja(nazwaLokalizacji, pietro, idBudynku) VALUES ("Skrzydlo A", '4', '1');
INSERT INTO lokalizacja(nazwaLokalizacji, pietro, idBudynku) VALUES ("Skrzydlo A", '3', '1');
INSERT INTO lokalizacja(nazwaLokalizacji, pietro, idBudynku) VALUES ("Skrzydlo C", '3', '1');
INSERT INTO lokalizacja(nazwaLokalizacji, pietro, idBudynku) VALUES ("Conference room", '0', '2');

INSERT INTO siec(poziomSygnalu, SSID, BSSID, czestotliwosc, idLokalizacji) VALUES ('12', 'siec1', 'bssid1', '2.5', '1');
INSERT INTO siec(poziomSygnalu, SSID, BSSID, czestotliwosc, idLokalizacji) VALUES ('22', 'siec2', 'bssid3', '5', '1');
INSERT INTO siec(poziomSygnalu, SSID, BSSID, czestotliwosc, idLokalizacji) VALUES ('24', 'siec3', 'bssid3', '5', '2');
