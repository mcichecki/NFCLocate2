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




