

// link to the server
var serverURL = "http://localhost:8080/search.json";

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
function getIDFromURL(){
    //var address = getParam('addressLine1') + " " + getParam('addressLine2') + ", " + getParam('city') + ", " + getParam('state') + " " + getParam("zipcode");
    //return address.replace(new RegExp("\\+", 'g'), " ")
    document.vendorID = getParam('id');
    console.log(document.vendorID);
}



function loadProfile(){
    getIDFromURL();
	console.log("called loadProfile");
	var request = new XMLHttpRequest();
	var profileURL = "http://localhost:8080/profile/"+document.vendorID+".json";

	// get vendors
	request.addEventListener('load', function(e){
	    if (request.status == 200) {
	        // do something with the loaded content
	        var content = request.responseText;
			var data = JSON.parse(content);
	    	renderProfile(data[0]);
	    } else {
	        // something went wrong, check the request status
	        // hint: 403 means Forbidden, maybe you forgot your username?
	        console.log('oops');
	    }
	}, false);

	// deal with errors
	request.addEventListener('error', function(e){
		alert('Error: failed to connect to server');
	}, false);

	// initiate connection
	request.open('GET', profileURL, true);
	request.send();

}

function renderProfile(vendor) {
	//TO DO: make this puttable on the page
	var vendorName = vendor.name;
    var address1 = vendor.addressLine1
    var address2 = getAddressLine2(vendor);
    var phone = vendor.phone;
    var email = vendor.email;
    var website = vendor.website;
    var capability = vendor.capID;
    var payment = vendor.payment;
    var lead = vendor.lead;
    var rate = vendor.rate;
    var deliveryFee = vendor.deliveryFee;
    //non-table
    $("#name").append(vendorName);
    $("#address").append(address1+"<br>"+address2);
    $("#phone").append(phone);
    $("#email").append("<a href='mailto:"+email+"'>"+email+'</a>');
    $("#website").append('<a href="http://'+website+'">'+website+'</a>');
    //table
    $("#prodCap").append(capability);
    $("#payment").append(payment);
    $("#leadTime").append(lead);
    $("#deliveryFee").append("$"+deliveryFee);
}


/*
Given a JSON object of a vendor, returns the vendor's address as a string
*/
function getAddressLine2(vendor){
    return vendor.city + ", " + vendor.state + " " + vendor.zip;
}