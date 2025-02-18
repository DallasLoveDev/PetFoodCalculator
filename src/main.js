import { PROJECT_ID, DATABASE_ID, COLLECTION_ID_FOODS, COLLECTION_ID_PETS } from './keys.js';

const client = new Appwrite.Client()
	.setEndpoint('https://cloud.appwrite.io/v1')
	.setProject(PROJECT_ID);

const databases = new Appwrite.Databases(client);

const addFoodForm = document.querySelector('#addFood');
const addPetForm = document.querySelector('#addPet');
const calculateCal = document.querySelector('#calculateCal');

addFoodForm.addEventListener('submit', addFood);
addPetForm.addEventListener('submit', addPet);
calculateCal.addEventListener('click', calculateCalories)

function addFood(e){
	e.preventDefault();
	const job = databases.createDocument(
		DATABASE_ID,
		COLLECTION_ID_FOODS,
		Appwrite.ID.unique(),
		{ "food-name": e.target.foodName.value,
		  "calories-per-kilogram": Number(e.target.caloriesPerKilogram.value)
		 }
	);
	job.then(function (response) {
		addFoodToDom();
	}, function (error) {
		console.log(error);
	});
	addFoodForm.reset();
}

async function addFoodToDom(){
	document.querySelector('#selectFood').innerHTML = ""
	let response = await databases.listDocuments(
		DATABASE_ID,
		COLLECTION_ID_FOODS
  );
	response.documents.forEach((job)=>{
	const container = document.createElement('div');
	const radio = document.createElement('input');
	const label = document.createElement('label');
	container.id = job.$id;
	radio.id = 'radio_' + job.$id;
	radio.type = 'radio';
	radio.name = 'food';
	radio.setAttribute('data-calories',job['calories-per-kilogram'])
	label.htmlFor = 'radio_' + job.$id;
	label.id = 'label_' + job.$id;
	label.textContent = ` ${job['food-name']} - ${job['calories-per-kilogram']} kcal/kg `;
	

	const deleteBtn = document.createElement('button');
	deleteBtn.textContent = '❌';
	deleteBtn.onclick = () => removeFood(job.$id);

	container.appendChild(radio);
	container.appendChild(label);
	container.appendChild(deleteBtn);

	document.querySelector('#selectFood').appendChild(container);
  })

	async function removeFood(id){
		const result = databases.deleteDocument(
			DATABASE_ID,
			COLLECTION_ID_FOODS,
			id
		);
	document.getElementById(id).remove();
	result.then(function(){location.reload()});
	}
  
}

function addPet(e){
	e.preventDefault();
	const job = databases.createDocument(
		DATABASE_ID,
		COLLECTION_ID_PETS,
		Appwrite.ID.unique(),
		{ "pet-name": e.target.petName.value,
		  "weight": Number(e.target.weight.value)
		 }
	);
	job.then(function (response) {
		addPetToDom();
	}, function (error) {
		console.log(error);
	});
	addPetForm.reset();
}

async function addPetToDom(){
    document.querySelector('#selectPet').innerHTML = ""
    let response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID_PETS
  );
  response.documents.forEach((job)=>{
	const container = document.createElement('div');
    const radio = document.createElement('input');
	const label = document.createElement('label');
	container.id = job.$id;
	radio.id = 'radio_' + job.$id;
	radio.type = 'radio';
	radio.name = 'pet';
	radio.setAttribute('data-weight',job['weight'])
	label.htmlFor = 'radio_' + job.$id;
	label.id = 'label_' + job.$id;
    label.textContent = ` ${job['pet-name']} - ${job['weight']} lbs `;
	

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🪦';
    deleteBtn.onclick = () => removePet(job.$id);

	container.appendChild(radio);
	container.appendChild(label);
	container.appendChild(deleteBtn);

    document.querySelector('#selectPet').appendChild(container);
  })

	async function removePet(id){
		const result = databases.deleteDocument(
			DATABASE_ID,
			COLLECTION_ID_PETS,
			id
		);
	document.getElementById(id).remove();
	result.then(function(){location.reload()});
  }
  
}

function getRadioValue(name){
	const radioValue = document.getElementsByName(name);
	for (let i = 0; i < radioValue.length; i++){
		if (radioValue[i].checked) {
			if (name === 'food') {
				return Number(radioValue[i].getAttribute('data-calories'));
			} else if (name === 'pet') {
				return Number(radioValue[i].getAttribute('data-weight'));
			} else if (name === 'modifier') {
				if (radioValue[i].getAttribute('data-modifier') === '0') {
					return Number(document.querySelector('#customModifierText').value);
				} else {
					return Number(radioValue[i].getAttribute('data-modifier'));
				}
			}
		}
	}
}

function calculateCalories(){
	const foodCalories = getRadioValue('food') / 1000;
	const petWeight = getRadioValue('pet') / 2.205;
	const percentOfDaily = Number(document.querySelector('#percentOfDailyCalories').value) / 100;
	const modifier = getRadioValue('modifier');
	const calorieOverride = Number(document.querySelector('#calorieOverride').value);

	if (calorieOverride > 0) {
		const grams = Math.round(percentOfDaily * calorieOverride / foodCalories);
		const calories = Math.round(percentOfDaily * calorieOverride);
		document.querySelector('#displayOutput').innerText = `This meal: ${grams} grams (${calories} cals)`
	} else {
		const grams = Math.round(percentOfDaily * (petWeight * 30 + 70) * modifier / foodCalories);
		const calories = Math.round(percentOfDaily * (petWeight * 30 + 70) * modifier)
		document.querySelector('#displayOutput').innerText = `This meal: ${grams} grams (${calories} cals)`
	}
	
}

addFoodToDom();
addPetToDom();