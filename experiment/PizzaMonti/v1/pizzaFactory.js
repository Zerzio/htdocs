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
            "init": init,
            "content": {
                "base": [],
                "ingredients": [],
                "allPizzas": [],
                "indexedIngredients": {}
            }
        };

        return service;

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
                service.content.base = p.ingredientsPromise.base;
                service.content.ingredients = p.ingredientsPromise.ingredients;
                service.content.allPizzas = p.pizzaPromise;

                _.map(service.content.ingredients, function (ingredient) {
                    computeFamily(ingredient, []);
                });
                _.map(service.content.ingredients, function (ingredient) {
                    indexFamily(ingredient, service.content.indexedIngredients);
                });


            });


            return pizzas;
        }

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