const express = require('express');
const app = express();
const neo4j = require('neo4j-driver');

const uri = 'neo4j://34.232.57.230:7687';
const user = 'neo4j';
const password = 'internship-2024';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

const handleErrors = (res, error) => {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
};

app.get('/', async (req, res) => {
    const currentPage = parseInt(req.query.page) || 1;
    const limit = 20; // Number of items per page

    try {
        const { search } = req.query;

        let query = 'MATCH (r:Recipe)';
        let params = {};

        if (search) {
            query += ' WHERE toLower(r.name) CONTAINS toLower($search)';
            params.search = search;
        }

        query += ' OPTIONAL MATCH (r)-[:CONTAINS_INGREDIENT]->(i:Ingredient)';
        query += ' OPTIONAL MATCH (a:Author)-[:WROTE]->(r)';
        query += ' RETURN r, collect(distinct i) as ingredients, collect(distinct a.name) as authors, r.description as description, r.skillLevel as skillLevel';
        query += ' ORDER BY r.name';

        const result = await session.run(query, { ...params });

        // Calculate total number of recipes
        const totalCount = result.records.length;

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        // Calculate offset
        const offset = (currentPage - 1) * limit;

        // Adjust query for pagination
        query += ` SKIP ${offset} LIMIT ${limit}`;

        const paginatedResult = await session.run(query, { ...params });

        const recipes = paginatedResult.records.map(record => {
            const recipe = record.get('r').properties;
            const authors = record.get('authors').join(', ');
            const ingredients = record.get('ingredients').map(ingredient => ingredient.properties.name);
            const skillLevel = recipe.skillLevel;
            const numberOfIngredients = ingredients.length;
            return {
                id: recipe.id,
                name: recipe.name,
                author: authors || '-',
                numberOfIngredients: numberOfIngredients || '-',
                cookingTime: recipe.cookingTime || '-',
                preparationTime: recipe.preparationTime || '-', 
                description: recipe.description || '-',
                skillLevel: skillLevel || '-',
                ingredients: ingredients || []
            };
        });
        res.render('index', { 
            search: search || '', 
            recipeTableHTML: recipes, 
            totalPages, 
            currentPage 
        });
        
        
    } catch (error) {
        handleErrors(res, error);
    }
});

app.get('/authors', async (req, res) => {
    try {
        const query = 'MATCH (a:Author) RETURN a.name AS authorName';
        const result = await session.run(query);
        let authors = result.records.map(record => record.get('authorName'));

        authors.sort((a, b) => a.localeCompare(b));

        res.render('authors', { authors });
    } catch (error) {
        handleErrors(res, error);
    }
});

app.get('/recipes-by-author/:authorName', async (req, res) => {
    try {
        const authorName = req.params.authorName;
                const query = `
            MATCH (a:Author {name: $authorName})-[:WROTE]->(r:Recipe)
            RETURN r
            ORDER BY r.name 
        `;
        
        const result = await session.run(query, { authorName });
        const recipes = result.records.map(record => record.get('r').properties);

        res.json({ recipes });
    } catch (error) {
        handleErrors(res, error);
    }
});

app.get('/recipes-by-ingredients', async (req, res) => {
    try {
        const { ingredient } = req.query;

        const query = `
            MATCH (r:Recipe)-[:CONTAINS_INGREDIENT]->(i:Ingredient {name: $ingredient})
            OPTIONAL MATCH (r)-[:CONTAINS_INGREDIENT]->(i:Ingredient)
            OPTIONAL MATCH (a:Author)-[:WROTE]->(r)
            RETURN r, collect(distinct i) as ingredients, collect(distinct a.name) as authors, r.description as description
            ORDER BY r.name
        `;

        const result = await session.run(query, { ingredient });

        const recipes = result.records.map(record => {
            const recipe = record.get('r').properties;
            const authors = record.get('authors').join(', ');
            const ingredients = record.get('ingredients');
            const numberOfIngredients = ingredients.length;
            return {
                id: recipe.id,
                name: recipe.name,
                author: authors || '-',
                numberOfIngredients: numberOfIngredients || '-',
                cookingTime: recipe.cookingTime || '-',
                preparationTime: recipe.preparationTime || '-',
                description: recipe.description || '-'
            };
        });

        res.json({ recipes });
    } catch (error) {
        handleErrors(res, error);
    }
});


app.get('/ingredients', async (req, res) => {
    try {
        const query = 'MATCH (i:Ingredient) RETURN i.name AS ingredientName';
        const result = await session.readTransaction(tx => tx.run(query));
        const ingredients = result.records.map(record => record.get('ingredientName'));
        res.render('ingredients', { ingredients });
    } catch (error) {
        handleErrors(res, error);
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



