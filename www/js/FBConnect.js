/*************************************************************
 * Authors: Rajitha & Bhaskar
 * File Name:FBConnect.js
 * Date: 13/07/2012
 *
 * 
 * This file contains logic for Facebook connecting 
 **************************************************************/
function FBConnect()
{
	if(window.plugins.childBrowser == null)
	{
		ChildBrowser.install();
	}
}
FBConnect.prototype.privacyconnect = function()
{
    var authorize_url  = "http://122.169.249.250:8097/agreement/policy.pdf";
    window.plugins.childBrowser.showWebPage(authorize_url);
    var self = this;
    window.plugins.childBrowser.onLocationChange = function(loc){self.onLocationChange(loc);};
}
FBConnect.prototype.reviewsConnect = function()
{
    var review_url_yelp=sessionStorage.getItem('review_url_yelp');
    var company_name= sessionStorage.getItem('companyname');
    var authorize_url  = review_url_yelp+" ?company_title= "+company_name;
    window.plugins.childBrowser.showWebPage(authorize_url);
    var self = this;
    window.plugins.childBrowser.onLocationChange = function(loc){self.onLocationChange(loc);};
}
FBConnect.prototype.cancellationPolicyConnect = function()
{
    var cancellationPolicyUrl=sessionStorage.getItem('cancellation_policy_url');
    console.log(cancellationPolicyUrl);
    var authorize_url  = cancellationPolicyUrl;
    window.plugins.childBrowser.showWebPage(authorize_url);
    var self = this;
    window.plugins.childBrowser.onLocationChange = function(loc){self.onLocationChange(loc);};
}
FBConnect.prototype.payPalConnect = function()
{
    var userId=sessionStorage.getItem('userId');
    
    var conformation_code=sessionStorage.getItem('conformation_code');
    var  url=baseURL+'/paypal_controller/call_paypal?confirmation='+conformation_code+'&user='+userId+'_User&resource_from=mobile&access_type=mobile';
    console.log(url);
    window.plugins.childBrowser.showWebPage(url);
    var self = this;
    window.plugins.childBrowser.onLocationChange = function(loc){self.onLocationChange(loc);};
}


/*FBConnect.prototype.connect = function(client_id,redirect_uri,display)
 {
 
 this.client_id = client_id;
 this.redirect_uri = redirect_uri;
 
 var authorize_url  = "https://graph.facebook.com/oauth/authorize?";
 authorize_url += "client_id=" + client_id;
 authorize_url += "&redirect_uri=" + redirect_uri;
 authorize_url += "&display="+ ( display ? display : "touch" );
 authorize_url += "&type=user_agent";
 //user_birthday,user_hometown,user_location,hometown_location,user_address,user_mobile_phone.
 authorize_url += "&scope=email,publish_stream,user_hometown,user_photos,user_birthday,user_online_presence,offline_access"
 
 window.plugins.childBrowser.showWebPage(authorize_url);
 var self = this;
 window.plugins.childBrowser.onLocationChange = function(loc){self.onLocationChange(loc);};
 }*/

FBConnect.prototype.onLocationChange = function(newLoc)
{
    // console.log("location changed-------------:"+newLoc);
    var args;
    if(newLoc.indexOf(this.redirect_uri) == 0)
	{
		var result = unescape(newLoc).split("#")[1];
		result = unescape(result);
		
		// TODO: Error Check
		this.accessToken = result.split("&")[0].split("=")[1];		
		//this.expiresIn = result.split("&")[1].split("=")[1];
        
        
		window.plugins.childBrowser.close();
		this.onConnect();
		
	}
    else if (newLoc.indexOf("paypal_mobile_response_failure")!=-1){
		alert("Payment was canceled");
        window.plugins.childBrowser.close();
        $.mobile.changePage("browsecategories.html", {
                            transition: "none",
                            reverse: true,
                            changeHash: false
                            });
        
	} else if (newLoc.indexOf("paypal_mobile_response_success")!=-1){
        //for successfull response
        //http://122.169.249.250:8097/paypal_controller/paypal_mobile_response_success?transaction_id=09Y31938SU2124223
        // for failure
        //  http://122.169.249.250:8097/paypal_controller/paypal_mobile_response_failure
        
        
		args=newLoc.replace(/.*?[?]/,"");
        
		//alert("Payment ok!"+args);
        var splite_args=args.split('=');
        window.plugins.childBrowser.close();
        sessionStorage.setItem('conformation_code',splite_args[1]);
        $.mobile.changePage("booking_confirmed.html", {
                            transition: "none",
                            reverse: true,
                            changeHash: false
                            }); 
        
        
        
	}
}
FBConnect.prototype.getMe = function()
{
    if(this.accessToken=='undefined')
    {
    }
    else
    {
        var url = "https://graph.facebook.com/me?access_token=" + this.accessToken;
        var req = new XMLHttpRequest();
        
        req.open("get",url,true);
        req.send(null);
        req.onerror = function(){
            navigator.notification.alert("Error", null, "Chimpped", null);    };
        return req;
    }
}
FBConnect.prototype.getFriends = function()
{
    if(this.accessToken=='undefined')
    {
    }
    else
    {
        
        var url = "https://graph.facebook.com/me/friends?access_token=" + this.accessToken;
        var req = new XMLHttpRequest();
        
        req.open("get",url,true);
        req.send(null);
        req.onerror = function(){
            navigator.notification.alert("Error", null, "Chimpped", null);    };
        return req;
    }
}

// Note: this plugin does NOT install itself, call this method some time after deviceready to install it
// it will be returned, and also available globally from window.plugins.fbConnect
FBConnect.install = function()
{
	if(!window.plugins)
	{
		window.plugins = {};	
	}
	window.plugins.fbConnect = new FBConnect();
	return window.plugins.fbConnect;
}
/*function fbPost() {
 $.ajax({
 type: 'POST',
 url: "https://graph.facebook.com/me/feed",
 data: {
 message: "TESTING",
 PICTURE: "<IMAGE URL>",
 name: "<TITLE OF POST>",
 link: "<LINK TO APP>",
 caption: "<SHOWN BELOW TITLE>",
 description: "<SHOWN BELOW CAPTION>",
 access_token:this.access_token,
 format: "json"
 },
 success: function (data) {
 navigator.notification.alert("success!", null, "Thanks!")
 },dataType: "json",
 
 });
 }*/

FBConnect.prototype.postFBWall = function(message, urlPost, urlPicture, callBack)
{
    console.log('inside postFBWall '+message + ' urlPost='+urlPost + ' urlPicture='+urlPicture);
    
    
    var url = 'https://graph.facebook.com/me/feed?access_token=' + this.accessToken+'&message='+message;
    
    
    if (urlPost) {
        
        url += '&link='+encodeURIComponent(urlPost);
        
    }
    
    if (urlPicture) {
        
        url += '&picture='+encodeURIComponent(urlPicture);
        
    }
    
    
    var req = this.postFBGraph(url);
    
    
    req.onload = callBack;
    
}


FBConnect.prototype.postFBGraph = function(url)

{
    
    console.log('inside postFBGraph url='+url);
    
    
    var req = new XMLHttpRequest();
    
    req.open("POST", url, true);
    
    /*req.onreadystatechange = function() {//Call a function when the state
     
     if(req.readyState == 4 && req.status == 200) {
     
     
     }
     
     };*/
    
    
    req.send(null);
    
    return req;
    
}

//You also need to customize the connect function to ask the authorization to post to the user's wall :

FBConnect.prototype.connect =
function(client_id,redirect_uri,display)

{
    
    this.client_id = client_id;
    
    this.redirect_uri = redirect_uri;
    
    
    
    var authorize_url  = "https://graph.facebook.com/oauth/authorize?";
    
    authorize_url += "client_id=" +
    client_id;
    
    authorize_url += "&redirect_uri=" +
    redirect_uri;
    
    authorize_url += "&display="+ ( display ?
                                   display : "touch" );
    
    authorize_url += "&type=user_agent";
    
    //if you want to post message on the wall : publish_stream, offline_access,
    
    authorize_url +="&scope=publish_stream,email";
    
    
    
    
    window.plugins.childBrowser.showWebPage(authorize_url);
    
    var self = this;
    
    window.plugins.childBrowser.onLocationChange =
    function(loc){self.onLocationChange(loc);};
    
}
FBConnect.prototype.Logout = function() { 
    window.plugins.childBrowser.LogOut();
    
}