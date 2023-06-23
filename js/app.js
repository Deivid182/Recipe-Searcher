import { urlCategories, urlFilterByCategory, urlSelectMealById } from "./index.js";

function startApp() {

  const selectCategories = document.querySelector("#categorias")
  const result = document.querySelector("#resultado")

  if(selectCategories) {
    selectCategories.addEventListener("change", selectCategory)
    getCategories()
  } 

  const favoritesDiv = document.querySelector(".favoritos")

  if(favoritesDiv) {
    getFavorites()
  }

  const modal = new bootstrap.Modal("#modal", {})


  function getCategories() {
    fetch(urlCategories)
      .then(res => res.json())
        .then(data => showCategories(data.categories))
  }

  function showCategories (categories = []){
    categories.map(category => {
      const option = document.createElement("option")
        option.value = category.strCategory
        option.textContent = category.strCategory
        selectCategories.appendChild(option)
    })
  }

  function selectCategory(event) {
    const category = event.target.value
    fetch(`${urlFilterByCategory}${category}`)
      .then(res => res.json())
        .then(data => showMeals(data.meals))
  }

  function showMeals (meals = []){

    cleanPrevHtml(result)

    const heading = document.createElement("h2")
    heading.classList.add("text-center", "text-black", "my-5")
    heading.textContent = meals.length ? "Results" : "There no results to show"

    result.appendChild(heading)

    meals.map(meal => {
      const { strMeal, strMealThumb, idMeal } = meal

      const mealContainer = document.createElement("div")
      mealContainer.classList.add("col-md-4")
      //console.log(mealContainer);

      const mealCard = document.createElement("div")
      mealCard.classList.add("card", "mb-4")

      const mealImage = document.createElement("img")
      mealImage.classList.add("card-image-top")
      mealImage.alt = `${strMeal ?? meal.img} image`
      mealImage.src = strMealThumb ?? meal.img

      const mealCardBody = document.createElement("div") 
      mealCardBody.classList.add("card-body")

      const mealHeading = document.createElement("h3")
      mealHeading.classList.add("card-title", "mb-3")

      const mealButton = document.createElement("button")
      mealButton.classList.add("w-100", "btn", "btn-primary")
      mealButton.textContent = "View Meal"
      /* mealButton.dataset.bsTarget = "#modal"
      mealButton.dataset.bsToggle = "modal" */

      mealButton.onclick = function(){
        selectMeal(idMeal ?? meal.id)
      }

      mealCardBody.appendChild(mealHeading)
      mealCardBody.appendChild(mealButton)

      mealCard.appendChild(mealImage)
      mealCard.appendChild(mealCardBody)

      mealContainer.appendChild(mealCard)
      
      result.appendChild(mealContainer)
    })
  }

  function selectMeal(id) {
    fetch(`${urlSelectMealById}${id}`)
      .then(res => res.json())
      .then(data => showModalMeal(data.meals[0]))
  } 

  function showModalMeal(meal) {
    const { strInstructions, idMeal, strMeal, strMealThumb } = meal
    const modalTitle = document.querySelector(".modal .modal-title")
    const modalBody = document.querySelector(".modal .modal-body")

    modalTitle.textContent = strMeal ?? meal.title
    modalBody.innerHTML = `
      <img class="img-fluid" src="${strMealThumb ?? meal.img}" alt="receta ${strMeal ?? meal.title}"  >
      <h2 class="my-2">Instrucctions</h2>
      <p class="mb-2">${strInstructions}</p>
    `

    const listGroup = document.createElement("ul")
    listGroup.classList.add("list-group", "list-group-flush")
    
    for(let i = 0; i <= 20; i++){
      if(meal[`strIngredient${i}`]) {
        const ingredient = meal[`strIngredient${i}`]
        const measure = meal[`strMeasure${i}`]
        const ingredientLi = document.createElement("li")
        ingredientLi.classList.add("list-group-item")
        ingredientLi.textContent = `${ingredient} - ${measure}`

        listGroup.appendChild(ingredientLi)  
      }
    } 
    const headingInstructions = document.createElement("h2")
    headingInstructions.classList.add("text-center", "text-black", "my-2")
    headingInstructions.textContent = "Instructions"
    modalBody.appendChild(headingInstructions)
    modalBody.appendChild(listGroup)
    
    const modalFooter = document.querySelector(".modal .modal-footer")

    cleanPrevHtml(modalFooter)

    const btnFavorite = document.createElement("button")
    btnFavorite.classList.add("btn", "btn-danger", "col")
    btnFavorite.textContent = existsInStorage(idMeal) ? "Remove from favorites" : "Add to favorites"

    //save in ls
    btnFavorite.onclick = function(){
      if(existsInStorage(idMeal)) {
        deleteFromStorage(idMeal)
        btnFavorite.textContent = "Add to favorites"
        showToast("Removed from favorites")
      } else {
        addFavorite({
          id: idMeal,
          title: strMeal,
          img: strMealThumb
        })
        btnFavorite.textContent = "Remove from favorites"
        showToast("Added to favorites")
      }

    }

    const btnClose = document.createElement("button")
    btnClose.classList.add("btn", "btn-secondary", "col", "ml-3")
    btnClose.textContent = "Close"
    btnClose.onclick = function(){
      modal.hide()
    }

    modalFooter.appendChild(btnFavorite)
    modalFooter.appendChild(btnClose)

    modal.show()
  }

  function addFavorite(meal) {

    console.log(existsInStorage(meal.id))

    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? []
    localStorage.setItem("favorites", JSON.stringify([...favorites, meal]))
  }


  function getFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? []
    if(favorites.length) {
      showMeals(favorites)
    } else {
      const noFavorites = document.createElement("h2")
      noFavorites.classList.add("text-center", "text-black", "my-5")
      noFavorites.textContent = "There are no favorites yet"
      result.appendChild(noFavorites)
    }
  }

  function deleteFromStorage(id) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? []
    const updatedFavorites = favorites.filter(favorite => favorite.id !== id)
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
  }

  function existsInStorage(id){
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? []
    return favorites.some(favorite => favorite.id === id)
  }

  function showToast(message) {
    const toastContainer = document.querySelector("#toast")
    const toastBody = document.querySelector("#toast .toast-body")
    toastBody.textContent = message
    const toast = new bootstrap.Toast(toastContainer)
    toast.show()  
  } 

  function cleanPrevHtml(selector) {
    while(selector.firstChild) {
      selector.removeChild(selector.firstChild)
    }
  }

}

document.addEventListener("DOMContentLoaded", startApp)