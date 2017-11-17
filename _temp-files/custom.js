var page_name;
var image_load_interval;
var version;
var carousel_pause = 5000;

var scroll_trigger = 20;
var communities;
var community;
var googleLat;
var googleLng;
var map_rendered = false;
var state_chosen;
var city_chosen;
var community_chosen;

var bayshorehomes_phone = "888-855-1818";
var bayshorehomes_name = "Bayshore Home Sales";
var bayshorehomes_email = "bayshoreleads@rhp-properties.com";
var navbar_contact_link = "contact.php?community_name=" + bayshorehomes_name + "&community_phone=" + bayshorehomes_phone;

var session_id = -1;
var ls_array = [];
var session_obj;
var session_array = [];
var contact_obj;
var contact_array = [];
var ls_contact_array = [];

var cur_lat;
var cur_lng;
var start_carousel = false;
var protocol = "https:";

//console.log = function() {};
//console.info = function() {};

/****
	JavaScript Media Query
	var jsmq;
	jsmq = window.matchMedia("(max-width: 767px)");
	if (jsmq.matches) {
		//Do something
	} else {
		Do something else
	}
****/

$(document).ready(function() {
	page_name = $("body").attr("id");

	checkLocalStorage();

	$("nav").load("templates/navbar.html",
		function(responseTxt, statusTxt, xhr) {
			switch(statusTxt) {
				case "success":
					$(".navbar-link").removeClass("active");
					$("#nav-" + page_name).addClass("active");
					image_load_interval = setInterval(image_load_pause, 500);
					break;

				case "error":
					break;
			}
	});

	$("#footer-complete").load("templates/footer.html",
		function(responseTxt, statusTxt, xhr) {
			switch(statusTxt) {
				case "success":
					setFooterElements();
					break;

				case "error":
					break;
			}
	});

	// Get IE or Edge browser version
	version = detectIE();

	// Listeners
	$(window).scroll(onScrollStyles);
	$(window).resize(windowResizeActions);

	$(".btn-lang").on("click", languageChoice);
	$(".location-class").on("shown.bs.collapse", mapPanelTest);

	if(getLocalStorage('contact_info') != null) {
		ls_contact_array = getLocalStorage('contact_info');
	}
});

function getQueryVariable(param_variable) {
	/****
		Example URL:
		http://www.example.com/index.php?id=1&image=awesome.jpg

		Calling getQueryVariable("id") - would return "1"
		Calling getQueryVariable("image") - would return "awesome.jpg"
	****/

	var query = window.location.search.substring(1);
	var vars = query.split("&");
	
	for (var i=0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		
		if(pair[0] == param_variable) {
			return pair[1];
		}
	}
	return(false);
}

function image_load_pause() {
	// if(parseInt($("#hero-image").height()) > 0) {
		clearInterval(image_load_interval);
		image_load_interval = null;
		setNavbarLogo();
	// }
}

function setNavbarLogo() {
	$("#header-logo").addClass("invisible");
	$("#header-logo").css("margin-top", "0px");
	$("#header-logo").removeClass("invisible");

	setNavigation();
}

function setNavigation() {
	$("#navbar-links").addClass("invisible");
	$("#navbar-links").css("margin-top", "0px");

	var temp_margin_top = parseInt((parseInt($("#navbar-header").outerHeight()) - parseInt($("#navbar-lang-btn-group").outerHeight())) / 2);
	$("#navbar-lang-btn-group").css("margin-top", temp_margin_top + "px");
	document.getElementById('nav-contact-link').href = navbar_contact_link;
	$("#navbar-links").removeClass("invisible");

	$("#navbar-search").on("click", function() {
		window.location.href = "index.php";
	});

	setHeroImage();
}

function setHeroImage() {
	$("#hero-container").addClass("invisible");
	$("#bayshore-logo").addClass("invisible");

	/*if(!version) {
		$("#hero-container").css("margin-top", ((parseInt($("nav").height())) * -1) + "px");
	}*/
	$("#bayshore-logo").css("margin-top", ((parseInt($("nav").height())) + 10) + "px");
	
	$("#hero-container").removeClass("invisible");
	$("#bayshore-logo").removeClass("invisible");

	// setPageElements();
	pageCheck();
}

function setPageElements() {
	switch (page_name) {
		case "home":
			break;

		case "about":
			break;

		case "amenities":
			break;

		case "contact":
			break;
	}
}

function setFooterElements() {
	$("body").css("margin-tbottom", "0px");
	var footer_height = parseInt($("#footer-complete").outerHeight());
	$("body").css("margin-bottom", footer_height + "px");

	switch (page_name) {
		case "home":
			$("#footer-button-phone").on("click", function() {
				window.location.href = "tel:" + bayshorehomes_phone;
			});
			$("#footer-button-email").on("click", function() {
				window.location.href = "contact.php?community_name=" + bayshorehomes_name + "&community_phone=" + bayshorehomes_phone;
				// window.location.href = "mailto:" + bayshorehomes_email;
			});
			break;

		case "community-detail":
		case "community-inventory":
			$("#footer-button-phone").on("click", function() {
				window.location.href = "tel:" + community.community['phone'];
			});
			$("#footer-button-email").on("click", function() {
				window.location.href = "contact.php?community_name=" + community.community['name'] + "&community_phone=" + community.community['phone'] + "&community_email=" + community.community['email'] + "&community_id=" + getQueryVariable('community_id');
				// window.location.href = "mailto:" + community.community['email'];
			});
			break;

		case "contact":
			$("#footer-button-phone").on("click", function() {
				window.location.href = "tel:" + bayshorehomes_phone;
			});
			$("#footer-button-email-container").css("display", "none");
			$("#footer-button-phone-container").addClass("col-xs-offset-3");
			break;
	}
}

function pageCheck() {
	$("#button-lang-container").css("margin-top", "0px");
	var nav_height = parseInt($("#navbar-container").outerHeight());
	$("#button-lang-container").css("margin-top", (nav_height + 20) + "px");

	$("#bayshore-logo").on("click", function() {
		window.location.href = "index.php";
	});

	switch (page_name) {
		case "home":
			$("#search-text-group").removeClass("has-error");
			$('#search-text').removeClass("raleway-bold text-dark-red");

			homeSearch();
			$('#search-text').on("focus", function() {
				$("#search-text-group").removeClass("has-error");
				$('#search-text').removeClass("raleway-bold text-dark-red");
				$('#search-text').attr("placeholder", "");
				$('#search-text').val("");
			});

			$(document).keypress(function(e) {
				if (e.keyCode == '13') {
					if($('#search-text').val() == "" || $('#search-text').val() == null || $('#search-text').val() == undefined) {
						$("#search-text-group").addClass("has-error");
						$('#search-text').addClass("raleway-bold text-dark-red");
						$('#search-text').attr("placeholder", "Please enter a search value");
					} else {
						searchGoButton($('#search-text').val());
					}
				}
			});

			$("#home-button-go").on("click", function() {
				if($('#search-text').val() == "" || $('#search-text').val() == null || $('#search-text').val() == undefined) {
					$("#search-text-group").addClass("has-error");
					$('#search-text').addClass("raleway-bold text-dark-red");
					$('#search-text').attr("placeholder", "Please enter a search value");
				} else {
					searchGoButton($('#search-text').val());
				}
			});

			$("#current-location-button").on("click", getLocation);
			if (navigator && navigator.geolocation) {
				$("#current-location-button").removeClass("invisible");
			} else {
				$("#current-location-button").css("display", "none");
			}

			var pets_copy_height = parseInt($("#home-pets-copy").outerHeight());
			var dog_height = parseInt($("#home-pets-dog").outerHeight());
			var master_margin = parseInt((dog_height - pets_copy_height) / 2);
			$("#home-pets-copy").css("margin-top", master_margin + "px");
			$("#home-pets-copy").css("margin-right", (master_margin * -1) + "px");
			$("#home-pets-copy").css("margin-left", parseInt(master_margin / 2) + "px");
			/*var jsmq;
			jsmq = window.matchMedia("(max-width: 767px)");
			if (jsmq.matches) {
				// What to do if a match
			} else {
				// What to do if NOT a match
			}*/

			$('.carousel').carousel({
				interval: carousel_pause
			});

			$(".carousel-inner").on("swiperight", function() {
				$(this).parent().carousel('prev');
			});
			$(".carousel-inner").on("swipeleft", function() {
				$(this).parent().carousel('next');
			});
			break;

		case "search-results":
			var search_well_string = "Search Results for &ldquo;";
			var temp_state = getQueryVariable("state_chosen");
			var temp_city = getQueryVariable("city_chosen");
			var temp_community = getQueryVariable("community_id");
			if(!temp_state) {

				if(!temp_city) {

					if(!temp_community) {

					} else {

					}

				} else {
					search_well_string += temp_city;
				}

			} else {
				search_well_string += temp_state;
			}

			$("#search-well").html(search_well_string + "&rdquo;");
			break;

		case "communities":
			if(getQueryVariable("communities_search") == "-1") {
				cur_lat = getQueryVariable("lat");
				cur_lng = getQueryVariable("lng");
				console.log("cur_lat:", cur_lat);
				console.log("cur_lng:", cur_lng);
				getCommunitiesFromSearch(cur_lat, cur_lng, "Current Location");
			} else {
				communitySearch(getQueryVariable("communities_search"));
			}
			break;

		case "community-detail":
			communityDetail(getQueryVariable("community_id"));
			$("#community-inventory").on("click", function() {
				window.location.href = "community_inventory.php?community_id=" + getQueryVariable("community_id");
			});
			break;

		case "community-inventory":
			communityInventory(getQueryVariable("community_id"));
			$("#community-home").on("click", function() {
				window.location.href = "community_detail.php?community_id=" + getQueryVariable("community_id");
			});

			$("#home-detail-modal").on("hidden.bs.modal", function() {
				$("#modal-title-copy").html("");
				$("#modal-body-copy").html("");
				$("#modal-site-num").html("");
				$("#modal-basic-info").html("");
				$("#modal-purchase-price").html("");
				$('.carousel').carousel("pause");
				$("#modal-carousel-indicators").html("");
				$("#modal-carousel-photos").html("");
			});
			break;

		case "contact":
			contactForm(getQueryVariable("site_num"), getQueryVariable("community_name"), getQueryVariable("community_phone"), getQueryVariable("community_email"), getQueryVariable("community_id"));
			break;
	}
}

/**
* detect IE
* returns version of IE or false, if browser is not Internet Explorer
*/
function detectIE() {
	var ua = window.navigator.userAgent;

	// IE 10
	//ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
	var msie = ua.indexOf('MSIE ');

	if (msie > 0) {
		// IE 10 or older => return version number
		//return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		return true;
	}

	// IE 11
	//ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
	var trident = ua.indexOf('Trident/');

	if (trident > 0) {
		// IE 11 => return version number
		var rv = ua.indexOf('rv:');
		//return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
		return true;
	}

	// Edge 12 (Spartan)
	//ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
	var edge = ua.indexOf('Edge/');
	if (edge > 0) {
		// Edge (IE 12+) => return version number
		//return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
		return true;
	}

	//Edge 13
	// ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';
	// other browser
	return false;
}

function myMap() {
	var mapCanvas = document.getElementById("location-copy");
	var centerLatLng = {lat: googleLat, lng: googleLng};
	var mapOptions = {
		center: centerLatLng,
		zoom: 15,
		disableDefaultUI: true
	};
	var map = new google.maps.Map(mapCanvas, mapOptions);
	var marker = new google.maps.Marker({
		position: centerLatLng,
		map: map
	})
}