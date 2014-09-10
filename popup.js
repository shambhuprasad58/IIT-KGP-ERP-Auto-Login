/*
*
*date:9-9-2014
*author:Shambhu Prasad
*email-id:shambhuprasad58@gmail.com
*git:github.com/shambhuprasad58
*
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var HttpClient = function() 
{
    this.get = function(aUrl, ssocookie, erpcookie, roll, password, security, questionId, aCallback) 
	{
        anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() 
		{ 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
			{
				//alert('content length:'+anHttpRequest.getResponseHeader('Content-Length'));
                aCallback(anHttpRequest.responseText);
			}
			else
			{
				//alert("ERRORRRRR:"+anHttpRequest.status+"  response "+anHttpRequest.status + "  state: " + anHttpRequest.readyState);
			}
        }
		
		params = "user_id="+roll+"&password="+password+"&answer="+security+"&question_id="+questionId+"&submit=+Sign+In+&requestedUrl=https%3A%2F%2F%2Ferp.iitkgp.ernet.in%2FIIT_ERP2%2Fwelcome.jsp&sessionToken="+erpcookie;
		anHttpRequest.open( "POST", aUrl, true );
		anHttpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		anHttpRequest.setRequestHeader("Cookie", ssocookie);
        anHttpRequest.send(params);
    }
}

var HomePage = function()
{
	this.openHomePage = function(answer)
	{
		var body = answer.match(/<form[^>]*>[\s\S]*<\/form>/gi);			
		var div = document.createElement('div');
		div.innerHTML = body;
		var ssoToken = div.getElementsByTagName('input')[0].value;
		var sessionToken = div.getElementsByTagName('input')[1].value;
		var url = 'data:text/html;charset=utf8,';
		function append(key, value) 
		{
			var input = document.createElement('textarea');
			input.setAttribute('name', key);
			input.setAttribute('type', 'hidden');
			input.textContent = value;
			form.appendChild(input);
		}
		var form = document.createElement('form');
		form.method = 'POST';
		form.action = 'https://erp.iitkgp.ernet.in/IIT_ERP2/welcome.jsp';
		append('ssoToken', ssoToken);
		append('sessionToken', sessionToken);
		url += encodeURIComponent(form.outerHTML);
		url += encodeURIComponent('<script>document.forms[0].submit();</script>');
		window.open(url, '_blank');
	}
}

function addEventsToHTML(){
	chrome.storage.local.get("roll", function (obj) {
	document.getElementById('roll').value = obj["roll"];
		//alert('roll:'+obj["roll"]);
	});
	chrome.storage.local.get("password", function (obj) {
	document.getElementById('password').value = obj["password"];
		//alert(obj["password"]);
	});
	chrome.storage.local.get("security", function (obj) {
	document.getElementById('security').value = obj["security"];
		//alert(obj["security"]);
	});
	var mailer = document.getElementById("mailer");
	var location = mailer.href;
    mailer.onclick = function () {
        chrome.tabs.create({active: true, url: location});
    };
    var form1 = document.getElementById('login_form');
	var button = document.getElementById('login_button');
	button.onclick = Login;
	document.getElementById('roll').focus();
	document.getElementById('roll').addEventListener("keydown", function(e) 
	{
		// Enter is pressed
		if (e.keyCode == 13)
			Login();
	});
	document.getElementById('security').addEventListener("keydown", function(e) 
	{
		// Enter is pressed
		if (e.keyCode == 13)
			Login();
	});
}
window.onload = addEventsToHTML;

function Login()
{
	document.getElementById('login_button').innerText = "Wait";
	var roll = document.getElementById('roll').value;
	var password = document.getElementById('password').value;
	var security = document.getElementById('security').value;
	var data = {};
	data["roll"] = roll;
	data["password"] = password;
	data["security"] = security;
	chrome.storage.local.set(data, function() {
          // Notify that we saved.
          //alert('data saved');
    });
	chrome.cookies.getAll({ 'domain': 'erp.iitkgp.ernet.in', 'session': true}, 
	function(cookies)
	{
		var erpcookie = "";
		var ssocookie = "";
		for (var i = 0; i < cookies.length; i++) 
		{
			if(cookies[i].path == "/IIT_ERP2/")
			{
				erpcookie = cookies[i].value;
			}
			if(cookies[i].path == "/SSOAdministration/")
			{
				ssocookie = cookies[i].value;
			}
		}
		homePage = new HomePage();
		aClient = new HttpClient();
		aClient.get('https://erp.iitkgp.ernet.in/SSOAdministration/auth.htm', ssocookie, erpcookie, data["roll"], data["password"], data["security"], "U1",
		function(answer) 
		{
			if(answer.indexOf("Success Page") > -1)
			{
				homePage.openHomePage(answer);
			}
			else
			{
				aClient.get('https://erp.iitkgp.ernet.in/SSOAdministration/auth.htm', ssocookie, erpcookie, data["roll"], data["password"], data["security"], "U2",
				function(answer2)
				{
					if(answer2.indexOf("Success Page") > -1)
					{
						homePage.openHomePage(answer2);
					}
					else
					{
						aClient.get('https://erp.iitkgp.ernet.in/SSOAdministration/auth.htm', ssocookie, erpcookie, data["roll"], data["password"], data["security"], "U2",
						function(answer3)
						{
							if(answer3.indexOf("Success Page") > -1)
							{
								homePage.openHomePage(answer3);
							}
							else
							{
								alert('Login Failed');
								document.getElementById('login_button').innerText = "Login";
							}
						});
					}
				});
			}
		});
	});
}
