//Define the requirements
var Datastore = require('nedb')
var Chart = require('chart.js');

//Create the database or load it if it does not exist, this is an embedded NeDB database
food_db = new Datastore({ filename: 'database/food-data', autoload: true });



//Intialize daily totals variables
var day_calories = 0; var day_protein = 0; var day_sugar = 0; var day_carbs = 0; var day_fat = 0;



//The initialize function is called when the home page first loads
function initialize() {
	document.getElementById("calorieGoal").innerHTML = "/" + calorie_goal;
	move();
	createChart();
}


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
	var portion = document.getElementById('portionSize').value; 
	var cals = document.getElementById('calories').value;
	var protein = document.getElementById('protein').value;
	var sugar = document.getElementById('sugar').value;
	var carbs = document.getElementById('carbs').value;
	var fat = document.getElementById('fat').value;

	//check if the user decided to save the recipe
	var sav = document.getElementById('saved');
	if (sav.checked){ 
		//make the food a saved food and add it to the favourites list on the home page
		sav = true; 
		$('<li/>', {html: foodName}).appendTo('ul#savList');}
	else{sav = false}

	//check if the user decided to favourite the recipe
	var fav = document.getElementById('favourite');
	if (fav.checked){ 
		//make the food a favourite and add it to the favourites list on the home page
		fav = true; 
		$('<li/>', {html: foodName}).appendTo('ul#favList');}
	else{fav = false}
	

	//insert the user input information into the database
	food_db.insert({"food" : foodName, "portion" : portion, "calories": cals, "protein": protein, "sugar": sugar, "carbs": carbs, "fat": fat, "saved":sav, "favourite": fav});
    
	//ADD TO TODAYS TOTALS
	day_calories += Number(cals);
	day_protein += Number(protein); 
	day_carbs += Number(carbs);
	day_fat += Number(fat);
	day_sugar += Number(sugar);

	//UPDATE CHARTS
	move()
	createChart()

	//ADD TO THE SAVED OR FAVOURITES COLUMN

}






