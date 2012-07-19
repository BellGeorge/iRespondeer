/*************************************************************
 * Authors: Rajitha & Bhaskar
 * File Name:main.js
 * Date: 13/07/2012
 *
 * 
 * This file contains logic for main methods which we are used in project.
 **************************************************************/
//Variables creation
var engineerInfoObj;
var engineerSelected_TaskObj = null;
var baseurl="http://sf.popcornapps.com";
/*facebook integration*/
var client_id = "219569221499325";//appid
var redir_url = "https://www.facebook.com/connect/login_success.html";//redirect url

//facebook login functionality implements here(index.html)
function facebookLogin()
{
    var fb = FBConnect.install();
    fb.connect(client_id,redir_url,"touch");
    fb.onConnect = onFBConnected;
    
}
//if user logged in with facebook succeessfully
function onFBConnected()
{
    //show the loader           
    $.mobile.showPageLoadingMsg();
    var req = window.plugins.fbConnect.getMe();
    req.onload = onGotMe;
    
}
//if user gets the user details from facebook
function onGotMe(evt)
{
    
    console.log(evt.target.responseText);
    var json = JSON.parse(evt.target.responseText);
    var fbId=json.id;
    sessionStorage.setItem('fbid',fbId);
   
    
    var strurl=baseurl+"/iresponder/fb_customer.php?email="+json.email+"&fbid="+json.id+"&fname="+json.first_name+"&lname="+json.last_name+"";
    console.log(strurl);
    //ajax calling for create lead for the user
    $.ajax({
           url:baseurl+"/iresponder/fb_customer.php?email="+json.email+"&fbid="+json.id+"&fname="+json.first_name+"&lname="+json.last_name+"",dataType: 'json',
           success: function(data)
           {
           console.log(data);
           //for new users
           if(data.done==undefined){
           console.log("New Fb Id");
           sessionStorage.setItem('leadid',data[0].id);
           console.log('leadid'+data[0].id);
           //hide the loader
           $.mobile.hidePageLoadingMsg();
           sessionStorage.setItem('fbemailid',json.email);
           //redirect to usertaskslist page
           $.mobile.changePage("usertaskslist.html", {
                               transition: "none",
                               reverse: true,
                               changeHash: false
                               });
           }
           //for existing users
           else
           {
           console.log("Exist Fb Id");
           sessionStorage.setItem('leadid',data.records[0].Id);
            console.log('leadid'+data.records[0].Id);
            sessionStorage.setItem('fbemailid',json.email);
           //hide the loader
           $.mobile.hidePageLoadingMsg();
           //redirect to usertaskslist page
           $.mobile.changePage("usertaskslist.html", {
                               transition: "none",
                               reverse: true,
                               changeHash: false
                               });
           }
           
          
           },//success
           //error handling
           error:function (){
           //hide the loader
           $.mobile.hidePageLoadingMsg();
           navigator.notification.alert("Error occured.Please try again later", null, "iResponder", null);
          
           }//error
           });//ajax
    
    
}
//facebook logout function implements here
function fbLogOut()
{
    var fb=FBConnect.install();
    fb.Logout();
    sessionStorage.setItem('fbid',0);
    //redirect to first page(index.html)
    $.mobile.changePage("index.html", {
                        transition: "none",
                        reverse: true,
                        changeHash: false
                        });
    
    
}
