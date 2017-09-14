//Define the requirements
var Chart = require('chart.js');
var electron = require('electron');
const app = electron.remote.app;
var Datastore = require('nedb');
var userData = app.getPath('userData');

//Create the database or load it if it does not exist, this is an embedded NeDB database
//food_db = new Datastore({ filename: 'database/food-data', autoload: true });
//food_db.daily_details = new Datastore({ filename: 'database/daily-details', autoload: true });
food_db = new Datastore({ filename: userData+'database/food-data.db', autoload: true });
food_db.daily_details = new Datastore({ filename: userData+'database/daily-details', autoload: true });

//Ensure the food name field is unique
food_db.ensureIndex( { fieldName : 'food', unique:true});


//Intialize daily totals variables
var day_calories = 0; var day_protein = 0; var day_sugar = 0; var day_carbs = 0; var day_fat = 0;

//The initialize function is called when the home page first loads
function initialize() {
	document.getElementById("calorieGoal").innerHTML = "/" + calorie_goal;
	//Move the bar and create the chart
	move();
	createChart();
	//Load the saved and faved foods
	loadSaved();
	loadFaved();
	loadDailyDetails();

	//Create an event listener for the saved and favourite lists
	//When an item is clicked the nutrition information will be auto filled from the database
	var saved_or_faved = document.getElementsByClassName("saved_or_faved");  // Parent
	for (var i = 0 ; i < saved_or_faved.length; i++) {
	   saved_or_faved[i].addEventListener('click', function(e) {
	   		// Check if the element is a LI
		    if (e.target.tagName === 'LI'){
		    	var query_food = e.target.textContent; 
		    	//Query the food in the database
		    	food_db.find({food: query_food}, function (err,docs){
        			res = docs[0]; //Store the result (returned as an array, res is a dict)
        			console.log(res);

        			//Update the food entry field with the values of the food chosen
    				document.getElementById('foodName').value = res["food"];
    				document.getElementById('portionSize').value = ""; 
					document.getElementById('labelPortion').value = res["portion"]; 
					document.getElementById('calories').value = res["calories"];
					document.getElementById('protein').value = res["protein"];
					document.getElementById('sugar').value = res["sugar"];
					document.getElementById('carbs').value = res["carbs"];
					document.getElementById('fat').value = res["fat"];
    			});		    
		    }
		});
	}

} //End of initialize



//Animation bar variables
var width = 0;
var calorie_goal = 3000;

//A function that moves the animation bar for the users daily calories on the home screen
function move() {
	console.log(day_calories);
	document.getElementById("todaysCals").innerHTML = day_calories + " Calories";
    var elem = document.getElementById("completionBar"); 
    var id = setInterval(frame, 20);
    var amtCmplt = (day_calories/calorie_goal)*100;
    function frame() {
        if (width >= amtCmplt || width >= 100) {
            clearInterval(id);
        } else {
            width++; 
            elem.style.width = width + '%'; 
            elem.innerHTML = width * 1 + '%';
        }
    }
}


//Function to create bar charts for the home page showing different macro intake
function createChart(){
	resetCanvas();
	var ctx = document.getElementById("macroChart").getContext('2d');
	var myChart = new Chart(ctx, {
	    type: 'bar',
	    data: {
	        labels: ["Protein", "Carbs", "Fat", "Sugar"],
	        datasets: [{
	        	label: " Grams",
	            data: [day_protein, day_carbs, day_fat, day_sugar],
	            backgroundColor: [
	                'rgba(30, 215, 96, 0.5)', //Green
					'rgba(255, 206, 86, 0.5)', //Yellow
	                'rgba(255, 159, 64, 0.5)', //Orange
	                'rgba(255, 99, 132, 0.5)'  //Red
	            ],
	            borderColor: [
	                'rgba(30, 215, 96, 1)', //Green
					'rgba(255, 206, 86, 1)', //Yellow
	                'rgba(255, 159, 64, 1)', //Orange
	                'rgba(255, 99, 132, 1)'  //Red
	            ],
	            borderWidth: 1
	        }]
	    },
	    options: {
	        scales: {
	            yAxes: [{
	            	gridLines: {
                    color: "rgba(0, 0, 0, 0)",
                	},    
	                ticks: {
	                    beginAtZero:true
	                }
	            }], //End of Y Axis
	            xAxes: [{
                	gridLines: {
                    color: "rgba(0, 0, 0, 0)",
                	}
            	}], //End of X Axis
	        },
	        legend: {
            	display: false
            }
	    } //End of options
	});
}

//Resets the canvas element on which the macros chart is created upon
var resetCanvas = function () {
  $('#macroChart').remove(); // this is my <canvas> element
  $('#chartArea').append('<canvas id="macroChart"><canvas>');
};



//submitFood enters the user entered information for a type of food and it's attributes into the NeDB database
//and upadtes the information shown on the homepage
function submitFood() {

	//Retrieve the data from the user form
	var foodName = document.getElementById('foodName').value;
	var consumedPortion = document.getElementById('portionSize').value; 

	var labelPortion = document.getElementById('labelPortion').value; 
	var cals = document.getElementById('calories').value;
	var protein = document.getElementById('protein').value;
	var sugar = document.getElementById('sugar').value;
	var carbs = document.getElementById('carbs').value;
	var fat = document.getElementById('fat').value;

	//check if the user decided to save the recipe
	var sav = document.getElementById('saved');
	if (sav.checked){ 
		sav = true; 
		//If the food is saved check that it is not already in the database
		food_db.find({food: foodName}, function (err,docs){
        	res = docs[0];
        	console.log(res);
        	if (res == null) {
				//If the food is not in the database make the food a saved and add it to the saved list on the home page
				$('<li/>', {html: foodName}).appendTo('ul#savList');
			}				
		});
	}
	else{sav = false}


	//check if the user decided to favourite the recipe
	var fav = document.getElementById('favourite');
	if (fav.checked){ 
		fav = true; 
		//If the food is favourited check that it is not already in the database
		food_db.find({food: foodName}, function (err,docs){
        	res = docs[0];
        	console.log(res);
        	if (res == null) {
        		console.log("yup");
				//If the food is not in the database make the food a favourite and add it to the favourites list on the home page
				$('<li/>', {html: foodName}).appendTo('ul#favList');
			}
			else {fav = false};
		});
	}
	else {fav = false};
	
	//DATABASE ENTRY - Insert the food information into the food database if saved or faved and add to daily records
	if (sav || fav) {
		food_db.insert({"food" : foodName, "portion" : labelPortion, "calories": cals, "protein": protein, "sugar": sugar, "carbs": carbs, "fat": fat, "saved":sav, "favourite": fav});
    }

	//Calculate consumption values based on ratio of consumed portion size to label portion size
	r = consumedPortion / labelPortion;

	consumed_cals = Math.round(Number(cals)*r);
	consumed_pro = Math.round(Number(protein)*r);
	consumed_carb = Math.round(Number(carbs)*r);
	consumed_fat = Math.round(Number(fat)*r);
	consumed_sug = Math.round(Number(sugar)*r);

	//ADD TO TODAYS TOTALS -- rounding values to nearest integer
	day_calories += consumed_cals;
	day_protein += consumed_pro;
	day_carbs += consumed_carb;
	day_fat += consumed_fat;
	day_sugar += consumed_sug;

	//DATABASE ENTRY - Insert the consumed amount into the days food database
	var d = new Date(); //Current date and time
	var date = String(d.getMonth()) + "/" +  String(d.getDate()) + "/" + String(d.getFullYear());
    food_db.daily_details.insert({"date": date, "meal": {"food" : foodName, "portion" : consumedPortion, "calories": consumed_cals, "protein": consumed_pro, "sugar": consumed_sug, "carbs": consumed_carb, "fat": consumed_fat}});

	//UPDATE CHARTS
	move()
	createChart()

	//UPDATE THE DETAILS TABLE
	$('#detailsTable tr:first').after('<tr><td>'+foodName+'</td><td>'+consumed_cals+'</td><td>'+consumed_pro+'g</td><td>'+consumed_carb+'g</td><td>'+consumed_fat+'g</td><td>'+consumed_sug+'g</td></tr>');
}


//Load the saved foods
function loadSaved(){
	food_db.find({}, function (err,docs){
		for (var i = docs.length - 1; i >= 0; i--) {
		 	if (docs[i]["saved"] == true) {$('<li/>', {html: docs[i]["food"]}).appendTo('ul#savList');}
		 }
	});	
}


//Load the favourite foods
function loadFaved(){
	food_db.find({}, function (err,docs){
	for (var i = docs.length - 1; i >= 0; i--) {
	 	if (docs[i]["favourite"] == true) {$('<li/>', {html: docs[i]["food"]}).appendTo('ul#favList');}
	 }
	});	
}

function loadDailyDetails(){
	
	var d = new Date(); //Current date and time
	var today_date = String(d.getMonth()) + "/" +  String(d.getDate()) + "/" + String(d.getFullYear());
	food_db.daily_details.find({date: today_date}, function (err,docs){
	for (var i = docs.length - 1; i >= 0; i--) {
		entry = docs[i];

		food_name = entry["meal"]["food"];
		consumed_cals = entry["meal"]["calories"];
		consumed_pro = entry["meal"]["protein"];
		consumed_carb = entry["meal"]["carbs"];
		consumed_fat = entry["meal"]["fat"];
		consumed_sug = entry["meal"]["sugar"];
		
		//ADD TO TODAYS TOTALS -- rounding values to nearest integer
		day_calories += consumed_cals;
		day_protein += consumed_pro;
		day_carbs += consumed_carb;
		day_fat += consumed_fat;
		day_sugar += consumed_sug;

		//UPDATE THE DETAILS TABLE
		$('#detailsTable tr:first').after('<tr><td>'+food_name+'</td><td>'+consumed_cals+'</td><td>'+consumed_pro+'g</td><td>'+consumed_carb+'g</td><td>'+consumed_fat+'g</td><td>'+consumed_sug+'g</td></tr>');
	}

	//UPDATE CHARTS
	move()
	createChart()

	});
}


