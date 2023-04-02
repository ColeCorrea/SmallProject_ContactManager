// URL of the group's website
const urlBase = 'http://165.227.66.2/';
let userID = null;
let currPage = 0;

function readCookie()
{
	userID = null;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");

		if( tokens[0] == "userID" )
		{
			userID = parseInt( tokens[1].trim() );
		}
	}


	if( userID == null || userID < 0 || isNaN(userID) )
	{
		window.location.href = "index.html";
	}
	else
	{
		console.log("logged in as user " + userID);
    }
}
readCookie()

function logout() 
{
    document.cookie = "userID=-1";
    console.log("logged out");
    window.location.href = "index.html";
}

// File paths for the APIs
const urlAPI = {
    editContact: "/editContact.php",
    searchContacts: "/searchContacts.php",
    deletecontact: "/deletecontact.php",
    loadContacts: "/loadContacts.php"
}

getData(urlAPI.loadContacts)

// load json data into list
// function to populate table
function buildTable(data){
    clearTable()
    var table = document.getElementById('myTable')

    for(var i = 0; i<data.length; i++){
        var row = `<tr>
                    <td class="hidden" id="userId">${userID}</td>
                    <td class="hidden" id="contactId">${data[i].id}</td>
                    <td id="firstName">${data[i].firstName}</td>
                    <td id="lastName">${data[i].lastName}</td>
                    <td id="email">${data[i].email}</td>
                    <td id="phone">${data[i].phone}</td>
                    <td>
                        <button class="edit btn-primary" data-toggle="tooltip">Edit</button>
                        <button class="delete btn-danger" data-toggle="tooltip" onclick="myFunction()">Delete</button>
                        <button class="save btn-primary" data-toggle="tooltip" >Save</button>
                        <button class="confirm btn-primary" data-toggle="tooltip">Confirm</button>
                        <button class="cancel btn-primary" data-toggle="tooltip">Cancel</button>
                    </td>
                        
                  </tr>`
        table.innerHTML += row
    }
}

function myFunction() {
    //var x = document.getElementById("myTable").rows[0].cells.length;
    //document.getElementById("demo").innerHTML = "Found " + x + " cells in the first tr element.";
    // used to find cells
    //var t = document.getElementById("myTable").rows[0].cells.namedItem("firstName").innerHTML;
    //alert(t)
}
// object to hold values of table
const tableData = new Object();

// jquery used to listen to button clicks
$(document).ready(function(){
    $('[data-toggle="tooltip]').tooltip();
    var actions = $("table td:last-child").html();
    // edit row button, puts in input blocks and toggles the save, edit and delete buttons
    $(document).on("click", ".edit", function(){
        // find the rowNumber for where the edit button was clicked
        tableData.rowNumber = this.parentNode.parentNode;
        // gets the cells for the row
        tableData.userId = document.getElementById("myTable").rows[tableData.rowNumber.rowIndex - 1].cells.namedItem("userId").innerHTML;
        tableData.first = document.getElementById("myTable").rows[tableData.rowNumber.rowIndex - 1].cells.namedItem("firstName").innerHTML;
        tableData.last = document.getElementById("myTable").rows[tableData.rowNumber.rowIndex - 1].cells.namedItem("lastName").innerHTML;
        tableData.email = document.getElementById("myTable").rows[tableData.rowNumber.rowIndex - 1].cells.namedItem("email").innerHTML;
        tableData.phone = document.getElementById("myTable").rows[tableData.rowNumber.rowIndex - 1].cells.namedItem("phone").innerHTML;
        tableData.Id = document.getElementById("myTable").rows[tableData.rowNumber.rowIndex - 1].cells.namedItem("contactId").innerHTML;
        //alert(tableData.rowNumber.rowIndex - 1)
        //alert(tableData.first)

        $(this).parents("tr").find("td:not(:last-child)").each(function(){
            $(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
        });
        $(this).parents("tr").find(".save, .edit, .delete").toggle();
    });
    //delete button toggles the confirm, cancel, edit and delete buttons
    $(document).on("click",".delete", function(){
        $(this).parents("tr").find(".confirm, .delete").toggle()
        $(this).parents("tr").find(".cancel, .edit").toggle()
        //$(this).parents("tr").remove();
    });
    // delete the row when confirm button is clicked
    $(document).on("click",".confirm", function(){
        tableData.rowNumber = this.parentNode.parentNode;
        var Id = document.getElementById("myTable").rows[tableData.rowNumber.rowIndex - 1].cells.namedItem("contactId").innerHTML;
        // send userID to api
        console.log(Id);
        let tmp = {ContactID:Id}

        // Converts the object to a string so that the API can read it
        let jsonPayload = JSON.stringify(tmp);

        // Gets the URL of the php file handling addContact?
        let url = urlBase + urlAPI.deletecontact;

        // Prepare a new HTTP request
        let xhr = new XMLHttpRequest();

        // Set the URL of the request to the php file
        // and the type of request to POST (its sending data).
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

        try
        {
            // Defines a function that is called when the state of the HTTP request changes
            xhr.onreadystatechange = function() 
            {

                // If readyState = 4 (the request is complete)
                // and status = 200 (there were no errors)
                if (this.readyState == 4 && this.status == 200) 
                {
                    console.log("Successfully deleted contact.");
                    loadPage(currPage);
                }
            };
            // Send the info
            xhr.send(jsonPayload);
        }
        catch(err)
        {
            document.getElementById("ContactId").innerHTML = err.message;
        }
        $(this).parents("tr").remove();
    });
    // toggle back to delete button
    $(document).on("click",".cancel", function(){
        $(this).parents("tr").find(".confirm, .delete").toggle()
        $(this).parents("tr").find(".cancel, .edit").toggle()
    });
    // save the edit
    $(document).on("click", ".save", async function(){
        var empty = false;
        var input = $(this).parents("tr").find('input[type="text"]');
        input.each(function(){
            if(!$(this).val()){
                $(this).addClass("error");
                empty = true;
            } else{
                $(this).removeClass("error");
            }
        });
        $(this).parents("tr").find(".error").first().focus();
        if(!empty){
            input.each(function(){
                $(this).parent("td").html($(this).val());
            });			
            $(this).parents("tr").find(".save, .edit").toggle();
            $(this).parents("tr").find(".delete").toggle();

            // values of the cells after save has been clicked
            var updatedfirst = document.getElementById("myTable").rows[tableData.rowNumber.rowIndex - 1].cells.namedItem("firstName").innerHTML;
            var updatedlast = document.getElementById("myTable").rows[tableData.rowNumber.rowIndex - 1].cells.namedItem("lastName").innerHTML;
            var updatedemail = document.getElementById("myTable").rows[tableData.rowNumber.rowIndex - 1].cells.namedItem("email").innerHTML;
            var updatedphone = document.getElementById("myTable").rows[tableData.rowNumber.rowIndex - 1].cells.namedItem("phone").innerHTML;
            var userId = document.getElementById("myTable").rows[tableData.rowNumber.rowIndex - 1].cells.namedItem("userId").innerHTML;
            var ContactId = document.getElementById("myTable").rows[tableData.rowNumber.rowIndex - 1].cells.namedItem("contactId").innerHTML;

            if(updatedfirst != tableData.first | updatedlast != tableData.last | updatedemail != tableData.email | updatedphone != tableData.phone){
                // send data to api
                let response = await API_edit(userId, ContactId, updatedfirst, updatedlast, updatedemail, updatedphone);
                console.log(response);
            }
            else{
                console.log("No change.");
            }
        }
		
    });
    // Add Contact
    $(document).on("click",".btn", function()
    {
       // go to add contact page
       window.location.href = "/addContact.html";
    });

});

// search function
document.getElementById("searchbar").addEventListener("keyup", function(){
    let text = document.getElementById("searchbar").value;

    if (text == "")
    {
        loadPage(currPage = 0);
        return;
    }
    // remove all rows from the table


    // send data to api and receive
    let temp = {UserID: userID, Search: text}
    let jsonPayload = JSON.stringify(temp);
    let url = urlBase + urlAPI.searchContacts;
    let xhr = new XMLHttpRequest();

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
        try
        {
            // Defines a function that is called when the state of the HTTP request changes
            xhr.onreadystatechange = function() 
            {
                // If readyState = 4 (the request is complete)
                // and status = 200 (there were no errors)
                if (this.readyState == 4 && this.status == 200) 
                {
                    // Convert the API's response to a javascript object
                    let response = JSON.parse( xhr.responseText );
                    console.log(response);
                    buildTable(response.results)
                }
            };

            // Send the username and password to the API (causing the function above to run)
            xhr.send(jsonPayload);
        }
        catch(err)
        {
            document.getElementById("searchbar").innerHTML = err.message;
        }
});

// function to get table from json variables, json object
function getData(url){
    // Gets the URL of the php file handling login
    url = urlBase + urlAPI.loadContacts;

    // Prepare a new HTTP request
    let xhr = new XMLHttpRequest();

    // Set the URL of the request to the php file
	xhr.open("GET", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try
	{
        // Defines a function that is called when the state of the HTTP request changes
		xhr.onreadystatechange = function() 
		{

            // If readyState = 4 (the request is complete)
            // and status = 200 (there were no errors)
			if (this.readyState == 4 && this.status == 200) 
			{

                // Convert the API's response to a javascript object
				let response = JSON.parse( xhr.responseText );
                buildTable(response.results);
				
			}
        }
    }   
    catch(err)
	{
		document.innerHTML = err.message;
	}     
}

function clearTable(){
    var Table = document.getElementById("myTable");
    Table.innerHTML = "";
}

// change pages
tableData.pagenumber = 1;

document.getElementById("pageLeft").addEventListener('click', async function(){
    if (!await loadPage(--currPage))
    {
        currPage++;
    }
});

document.getElementById("pageRight").addEventListener('click', async function(){
    if(!await loadPage(++currPage))
    {
        currPage--;
    }
});


async function loadPage(pageNumber)
{
    let response = await API_load(userID, pageNumber);
    if (response.isError)
    {
        console.error("Error loading page")
        return false;
    }
    buildTable(response.result);
    return true;
}
loadPage(currPage);