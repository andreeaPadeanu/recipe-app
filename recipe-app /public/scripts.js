var modal = document.getElementById('recipeModal');
var span = document.getElementsByClassName('close')[0];

span.onclick = function () {
    modal.style.display = 'none';
};

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};


async function filterByIngredients() {
    const ingredientCheckboxes = document.querySelectorAll('input[name="ingredient"]:checked');
    const selectedIngredients = Array.from(ingredientCheckboxes).map(cb => cb.value);

    if (selectedIngredients.length > 0) {
        const queryParams = new URLSearchParams();
        selectedIngredients.forEach(ingredient => queryParams.append('ingredient', ingredient));

        const url = '/recipes-by-ingredients?' + queryParams.toString();
        window.location.href = url;
    }
}
document.addEventListener("DOMContentLoaded", function() {
    var recipeDetailsButtons = document.querySelectorAll('.recipe-details-button');
    recipeDetailsButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var recipeDetails = document.getElementById('recipeDetails');
            var recipeRow = this.closest('tr');
            var recipeName = recipeRow.cells[0].innerText;
            var recipeAuthor = recipeRow.cells[1].innerText;
            var recipeIngredients = recipeRow.dataset.ingredients.split(', ');
            var recipeCookingTime = recipeRow.dataset.cookingTime !== '-' ? parseInt(recipeRow.dataset.cookingTime) : 'N/A';
            var recipePreparationTime = recipeRow.dataset.preparationTime !== '-' ? parseInt(recipeRow.dataset.preparationTime) : 'N/A';
            var recipeDescription = recipeRow.dataset.description;
            var recipeCollections = recipeRow.dataset.collections ? recipeRow.dataset.collections.split(', ') : [];
            var recipeDietTypes = recipeRow.dataset.dietTypes ? recipeRow.dataset.dietTypes.split(', ') : [];
            var recipeKeywords = recipeRow.dataset.keywords ? recipeRow.dataset.keywords.split(', ') : [];
            

            recipeDetails.innerHTML = '<h2>' + recipeName + '</h2>' +
            '<p><strong>Author:</strong> ' + recipeAuthor + '</p>' +
            '<p><strong>Description:</strong> ' + recipeDescription + '</p>' +
            '<p><strong>Cooking Time:</strong> ' + recipeCookingTime + ' minutes</p>' +
            '<p><strong>Preparation Time:</strong> ' + recipePreparationTime + ' minutes</p>' +
            '<p><strong>Ingredients:</strong> <ul>';
        
        recipeIngredients.forEach(function(ingredient) {
            recipeDetails.innerHTML += '<li>' + ingredient + '</li>';
        });
        
        recipeDetails.innerHTML += '</ul></p>';
        
        if (recipeCollections.length > 0) {
            recipeDetails.innerHTML += '<p><strong>Collections:</strong> <ul>';
            recipeCollections.forEach(function(collection) {
                recipeDetails.innerHTML += '<li>' + collection + '</li>';
            });
            recipeDetails.innerHTML += '</ul></p>';
        }
        
        if (recipeDietTypes.length > 0) {
            recipeDetails.innerHTML += '<p><strong>Diet Types:</strong> <ul>';
            recipeDietTypes.forEach(function(dietType) {
                recipeDetails.innerHTML += '<li>' + dietType + '</li>';
            });
            recipeDetails.innerHTML += '</ul></p>';
        }
        
        if (recipeKeywords.length > 0) {
            recipeDetails.innerHTML += '<p><strong>Keywords:</strong> <ul>';
            recipeKeywords.forEach(function(keyword) {
                recipeDetails.innerHTML += '<li>' + keyword + '</li>';
            });
            recipeDetails.innerHTML += '</ul></p>';
        }
        
        modal.style.display = 'block';
        });
    });
});



document.addEventListener('DOMContentLoaded', function() {
    const ingredientSearch = document.getElementById('ingredientSearch');

    ingredientSearch.addEventListener('input', function() {
        const searchValue = this.value.toLowerCase();

        fetch(`/recipes-by-ingredients?ingredient=${searchValue}`)
            .then(response => response.json())
            .then(data => {
                displayFilteredRecipes(data.recipes);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });

    function displayFilteredRecipes(recipes) {
        const recipeTable = document.getElementById('recipeTable');
        recipeTable.innerHTML = '';
        recipes.forEach(recipe => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${recipe.name}</td>
                <td>${recipe.author}</td>
                <td>${recipe.numberOfIngredients}</td>
                <td>${recipe.cookingTime}</td>
                <td>${recipe.preparationTime}</td>
                <td><button class="recipe-details-button" data-id="${recipe.id}">View Details</button></td>
            `;
            recipeTable.appendChild(row);
        });
    }
});


function showRecipesBySelectedAuthor() {
    const selectedAuthor = document.getElementById('authorDropdown').value;
    if (!selectedAuthor) return; 
    
    fetch(`/recipes-by-author/${selectedAuthor}`)
        .then(response => response.json())
        .then(data => {
            const recipesContainer = document.getElementById('recipesContainer');
            recipesContainer.innerHTML = ''; 
            const recipesList = document.createElement('ul');
            data.recipes.forEach(recipe => {
                const recipeItem = document.createElement('li');
                recipeItem.textContent = `${recipe.name} - ${recipe.description}`;
                recipesList.appendChild(recipeItem);
            });
            recipesContainer.appendChild(recipesList);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}




document.addEventListener('DOMContentLoaded', function() {
    let isSorted = false;

    function sortByIngredients() {
        const recipeTable = document.getElementById('recipeTable').getElementsByTagName('tbody')[0];
        const recipeRows = Array.from(recipeTable.getElementsByTagName('tr'));
        
        if (!isSorted) {
            const sortedRows = recipeRows.slice().sort((a, b) => {
                const aIngredients = parseInt(a.cells[2].textContent);
                const bIngredients = parseInt(b.cells[2].textContent);
                return aIngredients - bIngredients;
            });
            sortedRows.forEach(row => {
                recipeTable.appendChild(row);
            });
            isSorted = true;
        } else {
            recipeRows.forEach(row => {
                recipeTable.appendChild(row);
            });
            isSorted = false;
        }
    }

    const sortByIngredientsButton = document.getElementById('sortByIngredients');
    sortByIngredientsButton.addEventListener('click', sortByIngredients);
});




function filterBySkillLevel() {
    const skillLevel = document.getElementById('skillLevelDropdown').value;

    if (skillLevel) {
        fetch(`/recipes-by-skill-level?skillLevel=${skillLevel}`)
            .then(response => response.json())
            .then(data => {
                displayFilteredRecipes(data.recipes);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}


async function filterRecipes() {
    const ingredient = document.getElementById('ingredientInput').value;
  
    try {
        const response = await fetch(`/recipes-by-ingredients?ingredient=${ingredient}`);
        
        if (response.ok) {
            const { recipes } = await response.json();

            const table = document.getElementById('recipeTable');
            table.innerHTML = ''; 

            recipes.forEach(recipe => {
                const row = table.insertRow();
                row.insertCell(0).textContent = recipe.name;
                row.insertCell(1).textContent = recipe.author;
                row.insertCell(2).textContent = recipe.description;
            });
        } else {
            console.error('Error fetching recipes:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
}


function sortRecipesBy(option) {
    const recipeTable = document.getElementById('recipeTable').getElementsByTagName('tbody')[0];
    const recipeRows = Array.from(recipeTable.getElementsByTagName('tr'));

    let sortFunction;
    switch(option) {
        case 'name':
            sortFunction = (a, b) => a.cells[0].textContent.localeCompare(b.cells[0].textContent);
            break;
        case 'skillLevel':
            sortFunction = (a, b) => {
                const aLevel = a.cells[3].textContent;
                const bLevel = b.cells[3].textContent;
                return aLevel.localeCompare(bLevel);
            };
            break;
        case 'numberOfIngredients':
            sortFunction = (a, b) => {
                const aIngredients = parseInt(a.cells[2].textContent);
                const bIngredients = parseInt(b.cells[2].textContent);
                return aIngredients - bIngredients;
            };
            break;
        default:
            return;
    }

    const sortedRows = recipeRows.slice().sort(sortFunction);
    sortedRows.forEach(row => {
        recipeTable.appendChild(row);
    });
}


document.addEventListener('DOMContentLoaded', function() {
    const sortByDropdown = document.getElementById('sortBy');

    sortByDropdown.addEventListener('change', function() {
        const selectedOption = this.value;
        sortRecipesBy(selectedOption);
    });
});



document.addEventListener("DOMContentLoaded", function() {
    const pagination = document.querySelector(".pagination");
    const totalPages = parseInt(pagination.dataset.totalPages);

    pagination.addEventListener("click", function(event) {
        event.preventDefault();
        const target = event.target;

        if (target.tagName === "A") {
            const currentPage = parseInt(document.querySelector(".pagination .active").textContent);
            let page = currentPage;

            if (target.textContent === "« First") {
                page = 1;
            } else if (target.textContent === "« Prev") {
                page = Math.max(currentPage - 1, 1);
            } else if (target.textContent === "Next »") {
                page = Math.min(currentPage + 1, totalPages);
            } else if (target.textContent === "Last »") {
                page = totalPages;
            } else {
                page = parseInt(target.textContent);
            }

            fetchAndDisplayRecipes(page);
        }
    });

    function fetchAndDisplayRecipes(page) {
        fetch(`/?page=${page}`)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const recipeTable = doc.querySelector("#recipeTable tbody");
                const paginationContainer = doc.querySelector(".pagination");
                const currentPageLink = paginationContainer.querySelector(".active");

                document.querySelector("#recipeTable tbody").replaceWith(recipeTable);
                document.querySelector(".pagination").replaceWith(paginationContainer);

                if (currentPageLink) {
                    window.history.pushState({}, "", `/?page=${currentPageLink.textContent}`);
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }
});