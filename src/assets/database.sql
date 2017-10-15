CREATE TABLE IF NOT EXISTS budynek(id INTEGER PRIMARY KEY AUTOINCREMENT, ulica TEXT, numerBudynku VARCHAR(6), miasto TEXT, kodPocztowy CHAR(6), nazwaBudynku TEXT);

INSERT INTO budynek(ulica, numerBudynku, miasto, kodPocztowy, nazwaBudynku) VALUES ('Nowowiejska', '15/19', 'Warszawa', '00-665', 'Wydział Elektroniki i Technik Informacyjnych');
INSERT INTO budynek(ulica, numerBudynku, miasto, kodPocztowy, nazwaBudynku) VALUES ('Mlynarska', '7', 'Warszawa', '01-205', 'Freeport Metrics');

