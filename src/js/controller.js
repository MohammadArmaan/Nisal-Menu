import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';


import 'core-js/stable';
import 'regenerator-runtime/runtime'

///////////////////////////////////////
// Copyright Year

const year = document.querySelector('.year');
year.textContent = new Date().getFullYear();

// if(module.hot){
//   module.hot.accept();
// }

const controlRecipes = async function(){
  try{

    const id = window.location.hash.slice(1);
    
    if(!id) return;

    recipeView.renderSpinner();

    // 1. Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 2. Updating BookMarks View
    bookmarksView.update(model.state.bookmarks); 
    
    // 3. Loading Recipe
    await model.loadRecipe(id);
    
    // 4. Rendering Recipe
    recipeView.render(model.state.recipe); 
    

  }

  catch(err){
    recipeView.renderError();
    console.error(err);
  }
}

const controlSearchResults = async function(){
  try{

    resultsView.renderSpinner();

    // 1. Get Search Query
    const query = searchView.getQuery();
    if(!query) return;

    // 2. Load Search Results
    await model.loadSearchResults(query);

    // 3. Render Results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4. Render Intial Pagination Buttons
    paginationView.render(model.state.search);

  }
  catch(err){
    console.error(err);
  }
}

const controlPagination = function(goToPage){
    // 1. Render NEW Results
    resultsView.render(model.getSearchResultsPage(goToPage));

    // 2. Render NEW Pagination Buttons
    paginationView.render(model.state.search);

}

const controlServings = function(newServings){
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the Recipe view 
  // recipeView.render(model.state.recipe); 
  recipeView.update(model.state.recipe); 

}

const controlAddBookmark = function(){
  // 1. Add/remove Bookmarks
  if(!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  }
  else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // 2. Update Recipe View
  recipeView.update(model.state.recipe);

  // 3. Render Bookmarks
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe){
  try{
    // Show Loading Spiner
    addRecipeView.renderSpinner();

    // Upload New Recipe Data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render Recipe
    recipeView.render(model.state.recipe)

    // SUCESS Message
    addRecipeView.renderMessage();

      // Render Bookmark view
      bookmarksView.render(model.state.bookmarks);

      // Change ID in URL
      window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close Form Window
    setTimeout(function(){
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000);
  }
  catch(err){
    console.error(err);
    addRecipeView.renderError(err.message);
  }

}

const init = function(){
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}

init();