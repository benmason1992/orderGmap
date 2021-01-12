let db = openDatabase('dboo', '1.0', 'itemdb', 65535)
db.transaction(function (transaction) {
    let sql = "CREATE TABLE orders(ID INTEGER PRIMARY KEY, name TEXT, phone TEXT, house INTEGER, street TEXT, city TEXT, postcode TEXT, ordersIn TEXT)";

    transaction.executeSql(sql, undefined, function () {
        alert("Table created.")
    }, function (transaction, err) {
        // alert(err.message)
    });
});