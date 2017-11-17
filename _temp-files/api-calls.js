function getCommunitiesBasedOnLocation(param_lat, param_lng) {
	var myPromise = new Promise(
		function(resolve, reject) {
			$.ajax({
				url: protocol + '//public.rhp-properties.com/api/bayshore/communitiesV2.php?lat=' + param_lat + "&long=" + param_lng,
				type: 'GET',
				dataType: 'json',
				complete: function(xhr, textStatus) {
					//called when complete
				},

				success: function(data) {
					//Do something
					resolve(data);
				},

				error: function(xhr, desc, err) {
					console.log("getCommunities() error");
					console.log(xhr)
					console.log("Details: " + desc + "\nError:" + err);
					console.log("Something broke");
					reject(false);
				}
			});
		}
	);

	return myPromise;
}

function getCommunities() {
	var myPromise = new Promise(
		function(resolve, reject) {
			$.ajax({
				url: protocol + '//public.rhp-properties.com/api/bayshore/communities.php?sort=mobilev2',
				type: 'POST',
				dataType: 'json',
				complete: function(xhr, textStatus) {
					//called when complete
				},

				success: function(data) {
					//Do something
					resolve(data);
				},

				error: function(xhr, desc, err) {
					console.log("getCommunities() error");
					console.log(xhr)
					console.log("Details: " + desc + "\nError:" + err);
					console.log("Something broke");
					reject(false);
				}
			});
		}
	);

	return myPromise;
}

function getCommunityDetails(param_commId) {
	var myPromise = new Promise(
		function(resolve, reject) {
			$.ajax({
				url: protocol + '//public.rhp-properties.com/api/bayshore/community.php?community_id=' + param_commId,
				type: 'POST',
				dataType: 'json',
				complete: function(xhr, textStatus) {
					//called when complete
				},

				success: function(data) {
					resolve(data);
				},

				error: function(xhr, desc, err) {
					console.log(xhr)
					console.log("Details: " + desc + "\nError:" + err);
					console.log("Something broke");
					reject(false);
				}
			});
		}
	);

	return myPromise;
}

function getHomeDetails(param_homeId) {
	var myPromise = new Promise(
		function(resolve, reject) {
			$.ajax({
				url: protocol + '//public.rhp-properties.com/api/bayshore/homeV2.php?home_id=' + param_homeId,
				type: 'POST',
				dataType: 'json',
				complete: function(xhr, textStatus) {
					//called when complete
				},

				success: function(data) {
					// console.log(data);
					resolve(data);
				},

				error: function(xhr, desc, err) {
					console.log(xhr)
					console.log("Details: " + desc + "\nError:" + err);
					console.log("Something broke");
					reject(false);
				}
			});
		}
	);

	return myPromise;
}

function sessionTracking(param_get) {
	var temp_flag = "new";

	if(param_get !== undefined) {
		temp_flag = param_get + "&id=" + ls_array[0]['session_id'];
	}
	var temp_url = protocol + '//public.rhp-properties.com/api/bayshore/session.php?op=' + temp_flag;
	
	var myPromise = new Promise(
		function(resolve, reject) {
			$.ajax({
				url: temp_url,
				type: 'GET',
				dataType: 'json',
				complete: function(xhr, textStatus) {
					//called when complete
				},

				success: function(data) {
					//Do something
					switch(temp_flag) {
						case "new":
							session_id = parseInt(data);
							break;
					}
					resolve(true);
				},

				error: function(xhr, desc, err) {
					console.log("sessionTracking() error");
					console.log(xhr)
					console.log("Details: " + desc + "\nError:" + err);
					console.log("Something broke");
				}
			});
		}
	);
	return myPromise;
}