var sensors = [
    {id:1, lt:49.474926, lg:0.532638},
    {id:2, lt:49.477108, lg:0.530009},
    {id:3, lt:49.471344, lg:0.536943},
    {id:4, lt:49.469325, lg:0.539289},
    {id:5, lt:49.471675, lg:0.150171},
    {id:6, lt:49.473493, lg:0.129273},
    {id:7, lt:49.476183, lg:0.167587},
    {id:8, lt:49.478057, lg:0.211944},
    {id:9, lt:49.476162, lg:0.227581},
    {id:10, lt:49.474293, lg:0.244049}
];

var markersObject = [];

var yellowIcon = L.icon({
    iconUrl: './img/icons/yellow60.png',
    iconSize:     [25, 41], // size of the icon
    shadowSize:   [25, 41], // size of the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var map;
var pubnub;

$( document ).ready(function() {
    
    initMap();
    
    initPubnub();
    
    pubnubSubscribe();
    
});

function initMap(){
    map = L.map('map');

    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 30, attribution: osmAttrib});

    map.setView(new L.LatLng(49.492239, 0.131904),9);
    map.addLayer(osm);
    
    map.locate({setView: true, maxZoom: 12});
    
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    
    map.on('click',function(){
        if($("#detail").is(":visible")){
            $("#detail").toggle(200);
        }
    });
}

function initPubnub(){
    // Initialize the instance
    pubnub = PUBNUB.init({
        //publish_key: 'pub-c-4c63bcfd-ef3d-49ff-a17a-5db83c247fe0',
        subscribe_key: 'sub-c-476b1cce-9904-11e6-bb35-0619f8945a4f',
        error: function (error) {
            console.log('Error:', error);
            alert('error : ' + error);
        }
    })
}

function pubnubSubscribe(){
    // Subscribe to a channel
 
    pubnub.subscribe({
        channel : 'Sensors',
        message : function(m){
            console.log(m)
            alert('succes : ' + m);
            addOrUpdateSensor(m);
        },
        error : function (error) {
            // Handle error here
            console.log(JSON.stringify(error));
            alert('error : ' + m);
        }
    });
}

function addOrUpdateSensor(item){
    repMarker = L.Marker.extend({
                        options: { 
                            id: item.id,
                            icon: yellowIcon,
                            data: item
                        }
                     }); 
    markersObject[item.id] = new repMarker([item.lt, item.lg]).addTo(map).on('click', onClick);
}

function onLocationFound(e) {
    var radius = 5000; //TODO : faire choisir a l'utilisateur le rayon de recherche

    L.marker(e.latlng).addTo(map);

    L.circle(e.latlng, radius).addTo(map);
    
    $.each(sensors, function( index, item ) {
        repMarker = L.Marker.extend({
                        options: { 
                            id: item.id,
                            icon: yellowIcon,
                            data: item
                        }
                     }); 
        markersObject[index] = new repMarker([item.lt, item.lg]).addTo(map).on('click', onClick);
    });
//    $.ajax({
//        type: "GET",
//        dataType: "json",
//        url: "http://127.0.0.1:82/ProxiGeekWS/index.php/afficherreparateur",
//        success: function (result) {
//            $("#nbPers").html(result.length);
//            $.each(result, function( index, item ) {
//                repMarker = L.Marker.extend({
//                    options: { 
//                        id: item.id,
//                        icon: yellowIcon,
//                        data: item
//                    }
//                 }); 
//                markersObject[index] = new repMarker([item.lat, item.long]).addTo(map).on('click', onClick);
//            });
//        },
//        error: function (err) {
//          console.log(err)
//          alert(err);
//        },
//    });
}
function onLocationError(e) {
    console.log(e.message);
}

function onClick(e) {
    var t = $( "#detailTemplate" ).tmpl( e.target.options.data );
    $("#detail").html(t);
    if(!$("#detail").is(":visible")){
        $("#detail").toggle(200);
    }
}