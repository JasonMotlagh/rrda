var max_scroll;
var footer_check;
var myData = false;
var myPromise;
var test_home;
var days_array = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function languageChoice(e) {
	console.info(this);
	var lang_chosen = this.id;
	$("#" + lang_chosen).siblings().removeClass("active choice");
	$("#" + lang_chosen).addClass("active choice");
	self.location.href = '../index.html?lang=' + $("#" + lang_chosen).data("lang");
}

function onScrollStyles() {
	if(document.body.scrollTop >= scroll_trigger || document.documentElement.scrollTop >= scroll_trigger) {
		$("nav").addClass("dynamic-navbar-shadow");
	} else {
		$("nav").removeClass("dynamic-navbar-shadow");
	}

	if(document.documentElement.scrollTop > document.body.scrollTop) {
		max_scroll = (document.documentElement.scrollHeight - window.innerHeight);
		footer_check = (document.documentElement.scrollTop < (max_scroll - scroll_trigger));
	} else {
		max_scroll = (document.body.scrollHeight - window.innerHeight);
		footer_check = (document.body.scrollTop < (max_scroll - scroll_trigger));
	}

	if(footer_check) {
		$("#footer-complete").addClass("dynamic-footer-shadow");
	} else {
		$("#footer-complete").removeClass("dynamic-footer-shadow");
	}
}

function searchGoButton(param_search_string) {
	if(param_search_string == "") {
		$("#search-text-group").addClass("has-error");
		$('#search-text').addClass("raleway-bold text-dark-red");
		$('#search-text').val("Please enter a City/State or Postal Code");
	} else {
		window.location.href = "communities.php?communities_search=" + param_search_string;
	}
}

function homeSearch() {
	getCommunities()
		.then(
			function(success) {
				communities = success.communities;
				var compare_state = "";
				var state_flag = false;
				var compare_city = "";
				var city_flag = false;
				var temp_html = "";	

				for(i = 0; i < communities.length; i++) {

					if(compare_state != communities[i]['state_name']) {
						if(i > 0) {
							temp_html += "<li role='separator' class='divider'></li>";
						}

						temp_html += "<li class='search-state'><a class='dropdown-list-item small2-font-size' href='#' data-state=" + communities[i]['state_name'] + ">" + communities[i]['state_name'] + "</a></li>";
						compare_state = communities[i]['state_name'];

						temp_html += "<li class='search-community'><a class='dropdown-list-item' href='#' data-communityId=" + communities[i]['id'] + ">" + communities[i]['city'] + "-" + communities[i]['name'] + "</a></li>";
					} else {
						temp_html += "<li class='search-community'><a class='dropdown-list-item' href='#' data-communityId=" + communities[i]['id'] + ">" + communities[i]['city'] + "-" + communities[i]['name'] + "</a></li>";
					}
				}

				$("#home-search-dropdown").html(temp_html);
				var dropdown_margin;
				if(parseInt($("#home-search-dropdown").outerWidth()) > parseInt($("#search-text-group").outerWidth())) {
					dropdown_margin = parseInt((parseInt($("#home-search-dropdown").outerWidth()) - parseInt($("#search-text-group").outerWidth())) / 2);
					$("#home-search-dropdown").css("margin-right", (dropdown_margin * -1) + "px");
				}
				$(".dropdown-list-item").on("click", searchResults);
			}
		);
}

function searchResults(e) {
	e.preventDefault();
	var dropdown_choice = e.currentTarget;

	//State chosen
	if($(dropdown_choice).attr("data-state") != undefined) {
		console.info("State chosen");
		state_chosen = $(dropdown_choice).attr("data-state");
		// self.location.href = 'search_results.php?state_chosen=' + state_chosen;
	} else {
		//City chosen
		if($(dropdown_choice).attr("data-city") != undefined) {
			console.info("City chosen");
			city_chosen = $(dropdown_choice).attr("data-city");
			// self.location.href = 'search_results.php?city_chosen=' + city_chosen;
		} else {
			//Community chosen
			if($(dropdown_choice).attr("data-communityId") != undefined) {
				console.info("Community chosen");
				community_chosen = $(dropdown_choice).attr("data-communityId");
				self.location.href = 'community_detail.php?community_id=' + community_chosen;
			}
		}
	}
}

function mapPanelTest(e) {
	console.log("Map panel open");
	if(!map_rendered) {
		map_rendered = true;
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBb6oaVFrV-fnEcG_2vmGBWOq6Ln4SFh30&callback=myMap";
		document.body.appendChild(script);
	}
}

function communitySearch(param_search) {
	$("#search-well").addClass("invisible");
	$("#inventory-container").addClass("invisible");
	var pretty_search = param_search.replace(/%20/g, " ");
	// console.log(param_search);
	getLatLong(param_search)
		.then(
			function(success) {
				var results = success;
				if (results.length > 0) {
					/*var lat = results[0].geometry.location.lat;
					var lng = results[0].geometry.location.lng;*/
					getCommunitiesFromSearch(results[0].geometry.location.lat, results[0].geometry.location.lng, pretty_search);
				} else {
					// no results
					console.log("No results");
				}
			}
		);
}

function getCommunitiesFromSearch(param_lat, param_lng, param_pretty_search) {
	getCommunitiesBasedOnLocation(param_lat, param_lng)
		.then(
			function(success) {
				communities = success.communities;

				var temp_breadcrumb = "";
				temp_breadcrumb += "<ol class='breadcrumb no-margins no-padding'>";
				temp_breadcrumb += "<li><a href='index.php'>Home</a></li>";
				temp_breadcrumb += "<li>Search Results for: &ldquo;" + param_pretty_search + "&rdquo;</li>";
				temp_breadcrumb += "</ol>";
				$("#search-well").html(temp_breadcrumb);
				$("#search-well").removeClass("invisible");

				var temp_html = "";
				temp_html += "<div class='col-xs-12 no-padding'>";

				for(var i = 0; i < communities.length; i++) {
					temp_html += "<div id='" + communities[i]['id'] + "' class='media community-link'>";

					temp_html += "<div class='media-left media-top'>";
					temp_html += "<img class='media-object img-responsive' src='" + communities[i]['community_photo'] + "'>";
					temp_html += "</div>";

					temp_html += "<div class='media-body'>";
					temp_html += "<div class='media-heading small-bottom-margin small2-font-size raleway-semi-bold'>" + communities[i]['name'] + "</div>";
					temp_html += "<p class='no-margins'>" + communities[i]['address'] + "</p>";
					temp_html += "<p class='no-margins'>" + communities[i]['city'] + ", " + communities[i]['state'] + "</p>";
					temp_html += "<p class='no-margins'>" + communities[i]['phone'] + "</p>";
					// temp_html += "<p class='no-margins'>" + communities[i]['comm_type'] + "</p>";
					temp_html += "</div>";
					temp_html += "</div>";
				}

				temp_html += "</div>";

				$("#inventory-container").html(temp_html);
				$("#inventory-container").removeClass("invisible");

				$(".community-link").on("click", function() {
					window.location.href = "community_detail.php?community_id=" + this.id;
				});
			}
		);
}

function communityDetail(param_commId) {
	sessionTracking("comm&data=" + param_commId);
	getCommunityDetails(param_commId)
		.then(
			function(success) {
				community = success;
				start_carousel = false;
				console.log("community.photos.length:", community.photos.length);
				console.log("community.photos:", community.photos);

				var temp_breadcrumb = "";
				temp_breadcrumb += "<ol class='breadcrumb no-margins no-padding'>";
				temp_breadcrumb += "<li><a href='index.php'>Home</a></li>";
				temp_breadcrumb += "<li><a href='community_detail.php?community_id=" + param_commId + "'>" + community.community['name'] + "</a></li>";
				temp_breadcrumb += "</ol>";
				$("#search-well").html(temp_breadcrumb);

				// Carousel
				var temp_carousel_html = "";
				var temp_carousel_indicators_html = "";

				if(community.photos.length <= 0) {
					console.log("No photos");
					temp_carousel_html += "<div class='item active'>";
					temp_carousel_indicators_html += "<li data-target='#myCarousel' data-slide-to='" + i + "' class='active'> </li>";
					temp_carousel_html += "<img src='https://public.rhp-properties.com/newbury/communities/images/community-default.png' class='img-responsive center-block'>";
					temp_carousel_html += "</div>";
				} else {
					for(var i = 0; i < community.photos.length; i++) {
						if(i == 0) {
							temp_carousel_html += "<div class='item active'>";
							temp_carousel_indicators_html += "<li data-target='#myCarousel' data-slide-to='" + i + "' class='active'> </li>";
						} else {
							temp_carousel_html += "<div class='item'>";
							temp_carousel_indicators_html += "<li data-target='#myCarousel' data-slide-to='" + i + "' class=''> </li>";
						}

						temp_carousel_html += "<img src='" + community.photos[i]['community_photos'] + "' class='img-responsive center-block'>";
						temp_carousel_html += "</div>";
					}

					start_carousel = true;
				}

				$("#community-carousel-indicators").html(temp_carousel_indicators_html);
				$("#community-carousel").html(temp_carousel_html);
				console.log("start_carousel:", start_carousel);

				if(start_carousel) {
					$('.carousel').carousel({
						interval: carousel_pause
					});

					$(".carousel-inner").on("swiperight", function() {
						$('.carousel').carousel('prev');
					});
					$(".carousel-inner").on("swipeleft", function() {
						$('.carousel').carousel('next');
					});
				}

				// Carousel

				var tagline = "Live Life. Live It at " + community.community['name'] + ".";
				if(community.community['description'] == "" || community.community['description'] == null) {
					var description = "Welcome to " + community.community['name'] + ", a unique manufactured home community designed specifically for our residents. Our experienced and professional management staff handles the day-to-day responsibilities of the community, so you can enjoy the beautifully landscaped grounds and contemporary amenities. " + community.community['name'] + " is centrally located, with easy access to all the area has to offer. Numerous home exterior styles and interior feature options are available to fit both your budget needs and ideal lifestyle.";

					// var tagline = "Live Life. Live It at " + community.community['name'] + ".";
					$("#description").html(description);
					$("#tagline").html(tagline);
				} else {
					var description = community.community['description'].split("<br /><br />");
					if(description.length == 1) {
						$("#description").html(description[0]);
						$("#tagline").html(tagline);
					} else {
						description.shift();
						$("#description").html(description[0]);
						$("#tagline").html(description[1]);
					}

					description.shift();
					$("#description").html(description[0]);
					$("#tagline").html(description[1]);
				}

			// Available Amenities Panel copy
				if(community.community['features'] == "" || community.community['features'] == null) {
					$("#amenities-panel").css("display", "none");
					// $("#amenities-copy").html("Look at me. No plans, no backup, no weapons worth a damn. Oh, and something else I don't have: anything to lose. So, if you&apos;re sitting up there with your silly little spaceships and your silly little guns and you&apos;ve any plans on taking the Pandorica tonight; just remember who&apos;s standing in your way. Remember every black day I ever stopped you and then, and then, do the smart thing. Let somebody else try first.");
				} else {
					var temp_features = community.community['features'].trim();
					temp_features = temp_features.split(",");
					if(temp_features[(temp_features.length - 1)] == "") {
						temp_features.pop();
					}
					
					var temp_features_html = "<ul>";
					for(var i = 0; i < temp_features.length; i++) {
						temp_features_html += "<li>" + temp_features[i] + "</li>";
					}
					temp_features_html += "</ul>";

					$("#amenities-copy").html(temp_features_html);
				}
			// Available Amenities Panel copy

			// Contact Information Panel copy
				var temp_contact = community.community['address'];
				temp_contact += "<br />" + community.community['city'] + ", " + community.community['state'] + " " + community.community['zip'];
				temp_contact += "<br /><a class='text-blue' href='tel://" + community.community['phone'] + "'>" + community.community['phone'] + "</a>";
				temp_contact += "<br /><div class='text-blue' ";
				var temp_link = "window.location.href='contact.php?community_name=" + encodeURI(community.community['name']) + "&community_phone=" + encodeURI(community.community['phone']) + "&community_email=" + encodeURI(community.community['email']) + "&community_id=" + getQueryVariable('community_id') + "'";
				temp_contact += "onclick=" + temp_link + ">";
				temp_contact += community.community['email'] + "</div>";

				temp_contact += "<div class='raleway-semi-bold small-top-margin'>Hours</div>";
				temp_contact += "<div class='container no-padding'>";
				for(var i = 0; i < community.hours.length; i++) {
					temp_contact += "<div class='col-xs-4 text-right'>" + days_array[i] + ":</div><div class='col-xs-8'>" + community.hours[i][0]['open'];
					if(community.hours[i][1]['close'] == "" || community.hours[i][1]['close'] == null) {
						temp_contact += "</div>";
					} else {
						temp_contact += "-" + community.hours[i][1]['close'] + "</div>";
					}
				}
				temp_contact += "</div>";
				
				$("#contact-copy").html(temp_contact);
			// Contact Information Panel copy

			// Site Plan Panel copy
				if(community.community['site_plan'] == "" || community.community['site_plan'] == null) {
					$("#site-plan-copy").html("Site Plan coming soon.");
				} else {
					$("#site-plan-copy").html(community.community['site_plan']);
				}
			// Site Plan Panel copy

			// Specials Panel copy
				if(community.community['specials'] == "" || community.community['specials'] == null) {
					$("#specials-copy").html("There are no specials currently running.");
				} else {
					$("specials-copy").html(community.community['specials']);
				}
			// Specials Panel copy

			// Location Map Panel copy
				$.ajax({
					url: protocol + "//maps.googleapis.com/maps/api/geocode/json",
					type: 'GET',
					dataType: 'json',
					data: {address: community.community['address'] + ", " + community.community['city'] + ", " + community.community['state'] + " " + community.community['zip']},

					complete: function(xhr, textStatus) {
						//called when complete
					},
			
					success: function(data) {
						//Do something
						googleLat = data.results[0].geometry.location.lat;
						googleLng = data.results[0].geometry.location.lng;
					},
			
					error: function(xhr, desc, err) {
						console.log(xhr)
						console.log("Details: " + desc + "\nError:" + err);
						console.log("Something broke");
					}
				});
			// Location Map Panel copy
			}
		);
}

function communityInventory(param_commId) {
	getCommunityDetails(param_commId)
		.then(
			function(success) {
				community = success;
				console.log(community);
				var formatter = new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD',
					minimumFractionDigits: 0,
					// the default value for minimumFractionDigits depends on the currency
					// and is usually already 2
				});

				var temp_breadcrumb = "";
				temp_breadcrumb += "<ol class='breadcrumb no-margins no-padding'>";
				temp_breadcrumb += "<li><a href='index.php'>Home</a></li>";
				temp_breadcrumb += "<li><a href='community_detail.php?community_id=" + param_commId + "'>" + community.community['name'] + "</a></li>";
				temp_breadcrumb += "</ol>";
				$("#search-well").html(temp_breadcrumb);

				var temp_html = "";
				temp_html += "<div class='col-xs-12 no-padding'>";
				for(var i = 0; i < community.homes.length; i++) {
					temp_html += "<div id='" + community.homes[i]['id'] + "' class='media home-link'>";
					temp_html += "<div class='media-left media-top'>";

					if(community.homes[i]['tnail'] == "" || community.homes[i]['tnail'] == null) {
						temp_html += "<img class='media-object' src='https://public.rhp-properties.com/newbury/communities/images/community-default.png'>";
					} else {
						temp_html += "<img class='media-object' src='" + community.homes[i]['tnail'] + "''>";
					}

					temp_html += "</div>";
					temp_html += "<div class='media-body'>";
					temp_html += "<div class='media-heading small-bottom-margin small2-font-size raleway-semi-bold'>Site #" + community.homes[i]['site'] + "</div>";
					temp_html += "<p class='no-margins'>" + community.homes[i]['bedrooms'] + " Bedrooms | " + community.homes[i]['baths'] + " Baths</p>";
					temp_html += "<p class='no-margins'>" + parseInt(community.homes[i]['sq_ft']).toLocaleString() + " sqft</p>";
					temp_html += "<p class='no-margins'>Buy for " + formatter.format(parseInt(community.homes[i]['list_price'])) + "</p>";
					temp_html += "</div>";
					temp_html += "</div>";
				}
				temp_html += "</div>";

				$("#inventory-container").html(temp_html);
				$("#inventory-container").removeClass("invisible");

				var temp_subject = community.community['name'] + "%20-%20subject";
				var temp_body = "Community%20email%20body.%0AA%20new%20line.%0A%0A%0A";

				$("#community-inventory-contact").on("click", function() {
					window.location.href = "contact.php?community_name=" + community.community['name'] + "&community_phone=" + community.community['phone'] + "&community_email=" + community.community['email'] + "&community_id=" + getQueryVariable('community_id');
				});

				$(".home-link").on("click", showHomeDetail);
			}
		);
}

function showHomeDetail(e) {
	getHomeDetails(this.id)
		.then(
			function(success) {
				start_carousel = false;
				var home = success;
				test_home = success;
				console.log("success:", success);
				console.log(home);
				console.log(home.photos);
				sessionTracking("home&data=" + home.home['id'])

				var formatter = new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD',
					minimumFractionDigits: 0,
					// the default value for minimumFractionDigits depends on the currency
					// and is usually already 2
				});

				$("#modal-title-copy").html(community.community['name']);
				
				var temp_indicators = "";
				var temp_photos = "";

			/** Single Photo **/
				/*if(home.home['photo'] != "" || home.home['photo'] != null) {
					// temp_indicators += "<li data-target='#modal-carousel' data-slide-to='0' class='active'></li>";
					temp_photos += "<div class='item active'>";
					temp_photos += "<img src='" + home.home['photo'] + "' class='img-responsive center-block'>";
					temp_photos += "</div>";
				}*/
			/** Single Photo **/

				/*if(home.photos.length > 1) {
					start_carousel = true;
				}*/
				
			/** Multiple Photos **/
				/*for(var i = 0; i < home.photos.length; i++) {
					if(home.photos.length > 1) {
						start_carousel = true;
						temp_indicators += "<li data-target='#modal-carousel' data-slide-to='" + i + "'";
						if(i == 0) {
							temp_indicators += " class='active'";
						}
						temp_indicators += "></li>";
					}

					temp_photos += "<div class='item active'>";
					temp_photos += "<img src='" + home.photos[i]['home_photos'] + "' class='img-responsive center-block'>";
					temp_photos += "</div>";
				}*/
			/** Multiple Photos **/

				/*$("#modal-carousel-indicators").html(temp_indicators);
				$("#modal-carousel-photos").html(temp_photos);*/

				if(home.home['features'] == "" || home.home['features'] == null) {
					var temp_features = "Please call or email our community manager for specific detailed information on the home shown here. The phone number and email is located right above the location map.";
					$("#modal-body-copy").html(temp_features);
				} else {
					$("#modal-body-copy").html(home.home['features']);
				}

				$("#modal-site-num").html("Site #" + home.home['site_no']);
				var temp_html = "";
				temp_html += "<ul>";
				temp_html += "<li>" + home.home['bedrooms'] + "&nbsp; Bedrooms</li>";
				temp_html += "<li>" + home.home['baths'] + "&nbsp; Bathrooms</li>";
				temp_html += "<li>" + parseInt(home.home['sq_ft']).toLocaleString() + "&nbsp; Square Feet</li>";
				temp_html += "</ul>";
				$("#modal-basic-info").html(temp_html);
				temp_html = "Buy for&nbsp;" + formatter.format(parseInt(home.home['list_price']));
				$("#modal-purchase-price").html(temp_html);

				$("#home-detail-contact").on("click", function() {
					window.location.href = "contact.php?site_num=" + home.home['site_no'] + "&community_name=" + community.community['name'] + "&community_phone=" + community.community['phone'] + "&community_email=" + community.community['email'] + "&community_id=" + getQueryVariable('community_id');
				});

				// Carousel
				var temp_carousel_html = "";
				var temp_carousel_indicators_html = "";

				if(home.photos.length <= 0) {
					console.log("No photos");
					temp_carousel_html += "<div class='item active'>";
					temp_carousel_indicators_html += "<li data-target='#myCarousel' data-slide-to='" + i + "' class='active'> </li>";
					temp_carousel_html += "<img src='https://public.rhp-properties.com/newbury/communities/images/community-default.png' class='img-responsive center-block'>";
					temp_carousel_html += "</div>";
				} else {
					for(var i = 0; i < home.photos.length; i++) {
						if(i == 0) {
							temp_carousel_html += "<div class='item active'>";
							temp_carousel_indicators_html += "<li data-target='#myCarousel' data-slide-to='" + i + "' class='active'> </li>";
						} else {
							temp_carousel_html += "<div class='item'>";
							temp_carousel_indicators_html += "<li data-target='#myCarousel' data-slide-to='" + i + "' class=''> </li>";
						}

						temp_carousel_html += "<img src='" + home.photos[i]['home_photos'] + "' class='img-responsive center-block'>";
						temp_carousel_html += "</div>";
					}

					start_carousel = true;
				}

				$("#modal-carousel-indicators").html(temp_carousel_indicators_html);
				$("#modal-carousel").html(temp_carousel_html);
				// Carousel

				$("#home-detail-modal").modal();
				if(start_carousel) {
					$('.carousel').carousel({
						interval: carousel_pause
					});

					$(".carousel-inner").on("swiperight", function() {
						$('.carousel').carousel('prev');
					});
					$(".carousel-inner").on("swipeleft", function() {
						$('.carousel').carousel('next');
					});
				}
			}
		);
}

function contactForm(param_siteNum, param_commName, param_commPhone, param_commEmail, param_commId) {
	var temp_breadcrumb = "Contact us using the form below<br />or give us a call at: <a class='text-black' href='tel://" + param_commPhone + "''>" + param_commPhone + "</a>";
	$("#search-well").html(temp_breadcrumb);

	var default_comment;
	if(param_siteNum == undefined || param_siteNum == "") {
		default_comment = "I am interested in " + decodeURI(param_commName) + ".\n\n";
	} else {
		default_comment = "I am interested in site #" + param_siteNum + " at " + decodeURI(param_commName) + ".\n\n";
	}

	
	$("#comments").val(default_comment);

	var submit_height = parseInt($("#contact-submit").outerHeight());
	var cancel_height = parseInt($("#contact-cancel").outerHeight());
	if(submit_height >= cancel_height) {
		$("#contact-cancel").css("margin-top", parseInt((submit_height - cancel_height) / 2) + "px");
	} else {
		$("#contact-submit").css("margin-top", parseInt((cancel_height - submit_height) / 2) + "px");
	}

	if(getLocalStorage('contact_info') != null) {
		$("#name").val(ls_contact_array[0]['contact_name']);
		$("#phone").val(ls_contact_array[0]['contact_phone']);
		$("#email").val(ls_contact_array[0]['contact_email']);
	}

	$("#contact-cancel").on("click", function() {
		if(decodeURI(param_commName) == bayshorehomes_name) {
			window.location.href = "index.php";
		} else {
			window.location.href = "community_inventory.php?community_id=" + param_commId;
		}
	});

	$("#contact-submit").on("click", function() {
			if(getLocalStorage('contact_info') === null) {
				writeToLocalStorageContact();
			}

			var temp_param = "email&contact_name=" + $("#name").val() + "&contact_phone=" + $("#phone").val() + "&contact_email=" + $("#email").val();
			sessionTracking(temp_param)
				.then(
					function(success) {
						$("#contact-modal").on("hidden.bs.modal", function() {
							if(decodeURI(param_commName) == bayshorehomes_name) {
								window.location.href = "index.php";
							} else {
								window.location.href = "community_inventory.php?community_id=" + param_commId;
							}
						});

						$("#modal-title-copy").html("Email Sent");
						$("#modal-body-copy").html("Thank you for your interest in one of our many homes. A representative will be contacting you soon in regards to your request.");
						$("#contact-modal").modal();
					}
				);
		}
	);
}

function writeToLocalStorageContact() {
	contact_obj = {};
	contact_obj.contact_name = $("#name").val();
	contact_obj.contact_phone =  $("#phone").val();
	contact_obj.contact_email =  $("#email").val();
	contact_array.push(contact_obj);
	setLocalStorage('contact_info', JSON.stringify(contact_array));

	ls_contact_array = [];
	ls_contact_array = getLocalStorage('contact_info');
}

function writeToLocalStorage() {
	var temp_d = new Date();
	var temp_tz = temp_d.toString().slice(temp_d.toString().indexOf("("));
	var temp_dY = String(temp_d.getFullYear());
	var temp_dM = String(temp_d.getMonth() + 1);
	var temp_dD = String(temp_d.getDate());
	var temp_dH = String(temp_d.getHours());
	var temp_dm = String(temp_d.getMinutes());
	var temp_dS = String(temp_d.getSeconds());

	session_obj = {};
	session_obj.session_id = session_id;
	session_obj.date =  temp_d;
	session_obj.dateY =  temp_dY;
	session_obj.dateM =  temp_dM;
	session_obj.dateD =  temp_dD;
	session_obj.dateH =  temp_dH;
	session_obj.datem =  temp_dm;
	session_obj.dateS =  temp_dS;
	session_array.push(session_obj);
	setLocalStorage('session_id', JSON.stringify(session_array));

	ls_array = [];
	ls_array = getLocalStorage('session_id');
}

function setLocalStorage(param_ls_name, param_ls_data) {
	localStorage.setItem(param_ls_name, param_ls_data);
}

function getLocalStorage(param_ls_name) {
	return JSON.parse(localStorage.getItem(param_ls_name));
}

function checkLocalStorage() {
	ls_array = [];
	ls_array = getLocalStorage('session_id');
	// console.log("checkLocalStorage():ls_array:", ls_array);
	var temp_date = new Date();
	var temp_hours = String(temp_date.getHours());

	if(ls_array === null || ls_array.length <= 0) {
		// console.log("null");
		sessionTracking()
			.then(
				function(success) {
					writeToLocalStorage();
					// console.log("if:ls_array:", ls_array);
				}
			);
	} else {
		// console.log("Not null");
		if(parseInt(temp_hours) > parseInt(ls_array[0]['dateH'])) {
			ls_array = [];
			ls_array = getLocalStorage('session_id');
		}
		// console.log("else:ls_array:", ls_array);
	}
}

function windowResizeActions() {
	pageCheck();
	setNavbarLogo();
}