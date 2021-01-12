$(document).ready(function () {

    let initMap = () => {
        const map = new google.maps.Map(document.getElementById("initMap"), {
            zoom: 11,
            center: new google.maps.LatLng(51.4545, -2.5879),
        });
        let sql = 'SELECT * FROM ORDERS';
        db.transaction((tx) => {
            tx.executeSql(sql, undefined, (tx, result) => {
                let loadMapOrders = () => {
                    if (result.rows.length) {
                        for (let i = 0; i < result.rows.length; i += 1) {
                            let row = result.rows.item(i);
                            let name = row.name;
                            let phone = row.phone;
                            let house = row.house;
                            let street = row.street;
                            let city = row.city;
                            let postcode = row.postcode;
                            let order = row.ordersIn;
                            let address = house + " " + street + " " + city + " " + postcode + " UK";

                            axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                                params: {
                                    address: address,
                                    key: 'AIzaSyBev1K0QV2XXzwQYzUc7riQ7JXldkH-Lm8'
                                }
                            }).then((response) => {

                                let details = response.data.results[0].geometry.location;
                                let contentString = '<div class="infoWindow">' +
                                    '<ul data-role="listview" data-inset="true">' +
                                    '<h3>Name:</h3> ' + name + '.' +
                                    '<h3>Phone:</h3> ' + phone + '.' +
                                    '<h3>Order:</h3> ' + order + '.' +
                                    '</ul>' +
                                    '</div>'

                                let marker = new google.maps.Marker({
                                    position: details,
                                    map: map,
                                });

                                let window = new google.maps.InfoWindow({
                                    content: contentString,
                                })

                                marker.addListener('click', () => {
                                    window.open(map, marker);
                                    marker.hide();
                                })

                            }).catch((err) => {
                                console.log(err);
                            });
                        }
                    }
                }
                loadMapOrders();
            });
        });
    };
    initMap()

    $('#add').click(() => {
        $('#formDiv').toggleClass('popupBody');
        $('#mapSide, #orderSide').toggleClass('disable');
        $('#mapSide, #orderSide').toggleClass('cover');
    });
    $('#cancel').click(() => {
        $('#formDiv').addClass('popupBody');
        $('#mapSide, #orderSide').removeClass('disable');
        $('#mapSide, #orderSide').removeClass('cover');
        $('#nameErr, #phoneErr, #houseErr, #streetErr, #cityErr, #postcodeErr, #orderErr').hide();
    });

    $('#insert').click(() => {
        let name = $('#name').val();
        let phone = $('#phone').val();
        let house = $('#house').val();
        let street = $('#street').val();
        let city = $('#city').val();
        let postcode = $('#postcode').val();
        let order = $('#order').val();

        if (name.length < 3) {
            $('#nameErr').show();
            return false;
        } else if (!phone.match(/^(?:(?:00)?44|0)7(?:[45789]\d{2}|624)\d{6}$/)) {
            $('#phoneErr').show();
            return false;
        } else if (house.length < 1) {
            $('#houseErr').show();
            return false;
        } else if (street.length < 5) {
            $('#streetErr').show();
            return false;
        } else if (city.length < 5) {
            $('#cityErr').show();
            return false;
        } else if (postcode.length < 5) {
            $('#postcodeErr').show();
            return false;
        } else if (order.length < 5) {
            $('#orderErr').show();
            return false;
        } else {
            db.transaction((tx) => {
                let sql = "INSERT INTO orders(name, phone, house, street, city, postcode, ordersIn) VALUES(?, ?, ?, ?, ?, ?, ?)";
                tx.executeSql(sql, [name, phone, house, street, city, postcode, order], () => {
                    alert("New order added");
                    $('#formDiv').addClass('popupBody');
                    $('#mapSide, #orderSide').removeClass('disable');
                    $('#mapSide, #orderSide').removeClass('cover');
                    $('#nameErr, #phoneErr, #houseErr, #streetErr, #cityErr, #postcodeErr, #orderErr').hide();
                });
            });
            initMap();
            loadOrders();   
        }
});

$('#show').click(() => {
    loadOrders();
    $('#orderList').show();
});
$('#hideOrders').click(() => {
    $('#orderContainer').hide();
});

$('#deleteOrder').click(() => {
    let id = document.getElementById("delOrderList").value;
    db.transaction(function (tx) {
        tx.executeSql('DELETE FROM orders WHERE ID=' + id + '');
        alert('order deleted');
    }, (tx, err) => {
        alert(err.message);
    });
    $('select').selectmenu('refresh');
    $('#orderContainer').hide();
    loadOrders();
    initMap();

});

let loadOrders = () => {
    $('#orderContainer').show();
    db.transaction((tx) => {
        let sql = "SELECT * FROM orders";
        tx.executeSql(sql, undefined, (tx, result) => {
            if (result.rows.length) {
                $('#orderList, #delOrderList').children().remove();
                for (let i = 0; i < result.rows.length; i += 1) {
                    let row = result.rows.item(i);
                    let id = row.ID;
                    let name = row.name;
                    let order = row.ordersIn;
                    $('#orderList').append('<tr><td>' + id + '</td><td>' + name + '</td><td>' + order + '</td></tr>');
                    $('#delOrderList').append('<option id="' + id + '" value="' + id + '">' + id + '</option>');
                }
            } else {
                $('#orderList').append('<tr><td colspan="3" align="center">No orders found</td></tr>');
            }
        }, (tx, err) => {
            alert(err.message);
        });
    });
};

});
