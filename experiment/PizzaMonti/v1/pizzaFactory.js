(function () {
    'use strict';

    angular
        .module('PizzaFinder')
        .factory('pizzaFactory', pizzaFactory);

    pizzaFactory.$inject = ['$q','$http'];

    /* @ngInject */
    function pizzaFactory($q,$http) {
        console.log("pizzaFactory");

        var service = {
            "base": [],
            "ingredients": [],
            "allPizzas": [],
            "indexedIngredients": {}
        };

        var deferred = $q.defer();
        init().then(function(q) {
            deferred.resolve(service);
        });

        return deferred.promise;

        ////////////////

        function init() {
            console.log("pizzaFactory fetching the pizzas...");
            var ingredientsPromise = $http.get('data/ingredients.json').
                then(function (response) {
                    console.log("pizzaFactory received Ingredients");
                    var base = response.data.bases;
                    var ingredients = response.data.ingredients;

                    return {
                        "base":base,
                        "ingredients":ingredients
                    };

                });

            var pizzaPromise = $http.get('data/pizzas.json').
                then(function (response) {
                    console.log("pizzaFactory received Pizzas");
                    var allPizzas = response.data;
                    return allPizzas
                });

            var pizzas = $q.all({"pizzaPromise" : pizzaPromise, "ingredientsPromise" : ingredientsPromise});

            pizzas.then(function (p) {
                console.log("pizzaFactory received all");
                service.base = p.ingredientsPromise.base;
                service.ingredients = p.ingredientsPromise.ingredients;
                service.allPizzas = p.pizzaPromise;

                service.indexedIngredients = createIndexedIngredients(service.ingredients);
            });

            return pizzas;
        }

        function createIndexedIngredients(ingredients) {
            // working var to calculate family in order to create the index
            var tempIngredients = _.cloneDeep(ingredients);
            // add 'family' property to tempIngredients
            _.map(tempIngredients, function (ingredient) {
                computeFamily(ingredient, []);
            });
            // creates the service.indexedIngredients
            var indexedIngredients = {};
            _.map(tempIngredients, function (ingredient) {
                indexFamily(ingredient, indexedIngredients);
            });
            return indexedIngredients;
        }

        /*
         *  Add a 'family' property to each ingredient
         *  the property contains the ingredient itself and all parent ingredients
         */
        function computeFamily(ingredient, parentFamily) {
            ingredient.family = ingredient.family || _.clone(parentFamily);
            ingredient.family.push(ingredient.name);
            var childFamily = _.clone(ingredient.family);
            if (ingredient.as) {
                _.map(ingredient.as, function (childIngredient) {
                    computeFamily(childIngredient, childFamily);
                });
            }
        }

        /*
         *  Populates an index object (exposed as service.indexedIngredients)
         *  This index is used for fast retrieval of the hierarchy of an ingredient
         */
        function indexFamily(ingredient, index) {
            index[ingredient.name] = ingredient.family;
            if (ingredient.as) {
                _.map(ingredient.as, function (childIngredient) {
                    indexFamily(childIngredient, index);
                });
            }
        }
    }
})();