/*
TODO
1. edit database to match what mike sent over.
2. cache locations so that geolocation thing doesn't send too many queries
*/

// id for the map canvas
var mapID = "map-canvas";

// id for resulsts list id
var resultsListID = "results-list";

// link to the server
var serverURL = "http://localhost:8080/partner_data.json";

// geocoder
var geocoder = new google.maps.Geocoder();

// distance matrix service
var service = new google.maps.DistanceMatrixService();

// Minimum distance for vendors
var distance = 0;

$(document).ready(function(){
	distance = parseInt(getParam('distance'));
})


function getProductCapability() {
	var selected = [];
	$('#product input:checked').each(function() {
	    selected.push($(this).attr('value'));
	});
	return selected;
}

function getLead() {
	return $('#delivery input:checked').attr('value');
}

function getPayment() {
	return $('#payment input:checked').attr('value');
}

function getMatches() {
	var selected = [];
	$('#matches input:checked').each(function() {
	    selected.push($(this).attr('value'));
	});
	return selected;
}

//if you click on a box
function updateSearch() {
	initializeMap();
	//clear the list items
	document.getElementById("results-list").innerHTML = "";

}
/*
Gets the parameter of the URL as a string

name - the string representing the name of the parameter you want to retrieve
*/
function getParam(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}

/*
Returns a string of the address by parsing the URL parameters.
*/
function getAddressFromURL(){
	var address = getParam('addressLine1') + " " + getParam('addressLine2') + ", " + getParam('city') + ", " + getParam('state') + " " + getParam("zipcode");
	return address.replace(new RegExp("\\+", 'g'), " ")
}

/*
initializes the map
*/
function initializeMap() {
	//paints map
	var mapOptions = {
		center: new google.maps.LatLng(40.7078, -74.0119),
		zoom: 15
	};
	map = new google.maps.Map($('#' + mapID)[0], mapOptions);

	//deal with applicable vendors
	loadVendors(map);
}

google.maps.event.addDomListener(window, 'load', initializeMap);

/*
Gets a JSON object of vendors from the server
*/
function loadVendors(map){
	var address = getAddressFromURL();
	renderVendors(limit(partner_data), address);
}


/*
TODO: THIS FUNCTION SHOULD EVENTUALLY BE DELETED
*/
function limit(vendorList){
	var length = 10;
	var toRet = [];
	for (var i = 0; i < length; i++){
		toRet.push(vendorList[i]);
	}
	return toRet;
}

/*
Adds a vendor to a HTML list

data - a JSON of a single vendor
*/
function addResultToList(vendor) {
    var vendorName = vendor.name;
    var address1 = vendor.addressLine1;
    var address2 = getAddressLine2(vendor);
    var phone = vendor.phone;
    var id = vendor.id;

    //create DOM elements
    var $li = $("<li>", {
    	class: 'vendorLi',
    });
    var $details1 = $("<div>", {
    	class: 'details1'
    });
    var $details2 = $("<div>", {
		class: 'details2'
    });
    var $name = $("<div>", {
    	class: 'name',
    	text: vendorName
    });
    var $address1 = $("<div>", {
    	class: 'address',
    	text: address1
    });
    var $address2 = $("<div>", {
    	class: 'address',
    	text: address2
    });
    var $phone = $("<div>", {
    	class: 'phone',
    	text: phone
    });
    var $profile = $("<button>", {
    	class: 'profile',
    	text: "Full profile"
    });
    var $map = $("<button>", {
    	class: 'map',
    	text: "Find on map"
    });
    var newURL = window.location.pathname+"../../clientProfile.html";
    $profile.attr('onclick', "window.location.assign('"+newURL+"?id="+id+"'); loadProfile()");
    $map.attr('onclick', "document.vendorAddress='"+address1+" "+address2+"'; moveMapCenter();");
    // add DOM elements to page
    $details1.append($name);
    $details1.append($address1);
    $details1.append($address2);
    $details1.append($phone);
    $details2.append($profile);
    $details2.append("<br>");
    $details2.append($map);
    $li.append($details1);
    $li.append($details2);
    $("#" + resultsListID).append($li);
}

/*
Adds a marker on the google map at the given address. 
currAddress - a string representing an address
*/


//red: matches requirements but not distance. default
//blue: matches distance but not requirements. http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png
//green: matches distance and requirements. http://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png

function addMarker(map, vendor, boundsList) {
	var currAddress = getAddress(vendor);
	geocoder.geocode( { 'address': currAddress}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
		    var product = vendor.productCapabilityIds;
		    var payment = vendor.paymentTerms.terms;
		    var lead = vendor.leadTime.leadTime;
			//gets the selected search parameters
			var productParam = getProductCapability();
			var leadParam = getLead();
			var paymentParam = getPayment();
			var matchesParam = getMatches();
			//now check to see whether the vendor matches the parameters

			var matchesProduct = false;
			var paramsMatched = 0;
			for (i=0;i<productParam.length;i++) {
				for (j=0;j<product;j++) {
					if (productParam[i]==product[j]) {
						paramsMatched++;
					}
				}
			}
			if (paramsMatched==productParam.length) {
				var matchesProduct = true;
			}

			var matchesLead = lead==leadParam;
			var matchesPayment = payment==paymentParam;

			if (matchesProduct&&matchesLead&&matchesPayment) {
				//green
				var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png';
				var color = 'green';
			}
			else if (matchesProduct) {
				//blue
				var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';
				var color = 'blue';
			}
			else {
				//just matches distance - red
				var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png';
				var color = 'red';
			}

			var matchesColor = false;
			for (i=0;i<matchesParam.length;i++) {
				if (color==matchesParam[i]) {
					var matchesColor = true;
				}
			}

			if (matchesColor) {
				var location = results[0].geometry.location;
				var marker = new google.maps.Marker({
					map: map,
					icon: iconColor,
					position: location,
	    			animation: google.maps.Animation.DROP
				});
				var contentString = getContentString(vendor);
				var infowindow = new google.maps.InfoWindow({
					content: contentString,
					width: 340
				});
				boundsList.push(location);
				//set the bounds if we're at the end of the vendor list
				//console.log("length of boundsList: "+boundsList.length);
				//console.log("length of vendorsList: "+vendorsLength);
				/*problem: that's the length of the full vendors list, not the number of vendors
				that fit the criteria. fix.*/
				//if (boundsList.length==vendorsLength) {
				var location = results[0].geometry.location;
				var marker = new google.maps.Marker({
					map: map,
					//TODO: change the color based on parameters
					icon: iconColor,
					position: location,
	    			animation: google.maps.Animation.DROP
				});
				fitBounds(boundsList);
				//add event listener so infowindow pops up on click
				google.maps.event.addListener(marker, 'click', function() {
					infowindow.open(map,marker);
					//call the function that fills the info into the profile
					loadProfile();
				});
			}
		}
		else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}


function getContentString(vendor) {
	/*
	Popup client profile windows when you click on their map markers.
	*/
    var product = vendor.productCapabilityIds;
    var payment = vendor.paymentTerms.terms;
    var lead = vendor.leadTime.leadTime;
	var vendorName = vendor.name;
    var address1 = vendor.addressLine1;
    var address2 = getAddressLine2(vendor);
    var phone = vendor.primaryPhone;
    var email = vendor.primaryEmail;
    var website = "fake.com";
	var contentString = "<div id='popupContent'>"
	+"<table id='profile'>"
	+"<tr>"
	+"	<td>"
	+"		<div id='info1'>"
	+"			<div id='name'>"+vendorName+"</div>"
	//+"			<button onclick='window.location.assign('"+newURL+"'); loadProfile()'>Full profile</button>"
	+"			<button onclick='goToProfile("+vendor.id+")'>Full profile</button>"
	+"			<div id='address'>"+address1+"<br>"+address2+"</div>"
	+"			<div id='phone'>Phone: "+phone+"</div>"
	+"			<div id='email'>Email: "+email+"</div>"
	+"			<div id='website'>Website: "+website+"</div>"
	+"		</div>"
	+"	</td>"
	+"	<td>"
	+"		<table border='1' id='info2'>"
	+"			<tr>"
	+"				<td>Product Capability</td>"
	+"				<td id='prodCapInfo'>"+product+"</td>"
	+"			</tr>"
	+"			<tr>"
	+"				<td>Payment Method</td>"
	+"				<td id='paymentInfo'>"+payment+"</td>"
	+"			</tr>"
	+"			<tr>"
	+"				<td>Lead Time</td>"
	+"				<td id='leadTimeInfo'>"+lead+"</td>"
	+"			</tr>"
	+"		</table>"
	+"	</td>"
	+"</tr>"
	+"</div>"

	return contentString;
}


function goToProfile(id) {
	var newURL = window.location.pathname+"../../clientProfile.html?id="+id;
	window.location.assign(newURL);
}

function fitBounds(boundsList) {
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < boundsList.length; i++) {
  		bounds.extend(boundsList[i]);
  	}
  	map.fitBounds(bounds);
}

/*
Renders filtered vendors on page

vendors - the complete JSON list of vendors
originAddress - a string representing the address of the origin
*/
var vendorsLength = 0;
function renderVendors(vendors, originAddress){
	vendorsLength = vendors.length;
	console.log("vendor length is: "+vendorsLength);
	var boundsList = [];

	for (var i = 0; i < vendorsLength; i++){
		vendor = vendors[i];
		renderFilteredVendor(originAddress, vendor, boundsList);
	}
}

/*
Renders vendor if:
1. vendor is within distance radius
2. TODO: vendor matches flower types
3. TODO: vendor matches lead time

clientAdress - the client's address as a string
vendor - JSON object representing vendor
*/
function renderFilteredVendor(clientAddress, vendor, boundsList) {
	var vendorAddress = getAddress(vendor);
	service.getDistanceMatrix(
    {
      origins: [clientAddress],
      destinations: [vendorAddress],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
      avoidHighways: false,
      avoidTolls: false
    }, function(response, status){
    	if (status != google.maps.DistanceMatrixStatus.OK) {
    		alert('Error was: ' + status);
		} else {
			//get distance
			var origins = response.originAddresses;
	    	var destinations = response.destinationAddresses;
	    	var totalDist = 0.0;
			for (var i = 0; i < origins.length; i++) {
	    		var results = response.rows[i].elements;
		      	for (var j = 0; j < results.length; j++) {
					totalDist = totalDist + results[j].distance.value;
		      	}
		    }

		    //convert to miles
		    totalDist *= 0.000621371;
		    //console.log(totalDist);
		    // add if passes filter
		    if (filter(totalDist)){
				addResultToList(vendor);
				addMarker(map, vendor, boundsList);
		    }
		}
    });
}

/*
Returns true if the vendor passes the filter/matches the user's query. 
Returns false otherwise

vendorDistance - distance between origin and vendor
*/
function filter(vendorDistance){
	return vendorDistance < distance;
}

/*
Moves the map to the center of the address clicked
*/
function moveMapCenter() {
	console.log("you clicked on the address: " + document.vendorAddress);
	geocoder.geocode( { 'address': document.vendorAddress}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
			map.setZoom(8);
		} 
		else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}

/*
Given a JSON object of a vendor, returns the vendor's address as a string
*/
function getAddress(vendor){
	return vendor.addressLine1 + ", " + vendor.addressLine2 + ", " + vendor.city + ", " + vendor.state + " " + vendor.zip;
}

function getAddressLine2(vendor){
	return vendor.city + ", " + vendor.state + " " + vendor.zip;
}



//TO DO!!!!!!!=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//this is not written at all it's from Michelle's chatroom lol

function validateForm() {
    var form = document.getElementById("roomName-form");
        form.addEventListener('submit', function(e) {
            if (this.roomName.value.length==0) {
                document.getElementById("roomName-err").style.display = "block";
                e.preventDefault();
            }
            else {
                document.getElementById("roomName-err").style.display = "none";
                e.preventDefault();
                window.location.assign(document.URL+"/messages/"+this.roomName.value);
            }
        });
}




