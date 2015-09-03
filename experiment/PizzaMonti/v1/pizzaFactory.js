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
            "base" : [],
            "ingredients" : [],
            "allPizzas" : [],
            "indexedIngredients" : {}
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

                    _.map(service.ingredients, function (ingredient) {
                        computeFamily(ingredient, []);
                    });
                    _.map(service.ingredients, function (ingredient) {
                        indexFamily(ingredient, service.indexedIngredients);
                    });

                    return {
                        "base":base,
                        "ingredients":ingredients
                    };

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

                });

            var pizzaPromise = $http.get('data/pizzas.json').
                then(function (response) {
                    console.log("pizzaFactory received Pizzas");
                    var allPizzas = response.data;
                    return allPizzas
                });

            var pizzas = $q.all({pizzaPromise : pizzaPromise, ingredientsPromise : ingredientsPromise});

            pizzas.then(function () {
                console.log("pizzaFactory received all");
                service.base = ingredientsPromise.base;
                service.ingredients = ingredientsPromise.ingredients;
                service.allPizzas = pizzaPromise;
            });


            return pizzas;
        }
    }
})();