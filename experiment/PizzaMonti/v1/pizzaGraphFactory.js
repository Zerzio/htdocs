(function () {
    'use strict';

    angular
        .module('PizzaFinder')
        .factory('pizzaGraphFactory', pizzaGraphFactory);

    pizzaGraphFactory.$inject = ['pizzaFactory','$q'];

    /* @ngInject */
    function pizzaGraphFactory(pizzaFactory, $q) {

        var isReady = $q.defer();

        var service = {
            "isReady": isReady.promise,
            "isExtendedBy" : isExtendedBy,
            "extendedPizzas" : [],
            "parent2child" : []
        };

        var _indexedIngredients = {};
        var _allPizzas = [];

        activate();

        return service;

        ////////////////////////////////////

        function isExtendedBy(pizzaChild, pizzaParent) {
            if (_.isEqual(pizzaChild.ingredients.sort(),pizzaParent.ingredients.sort())) return false;
            var commonIngredients = _.intersection(pizzaChild.ingredients,pizzaParent.ingredients);
            return _.isEqual(commonIngredients.sort(),pizzaParent.ingredients.sort());
        }

        function isExtensionOf(pizzaParent, pizzaChild) {
            if (_.isEqual(pizzaChild.ingredients.sort(),pizzaParent.ingredients.sort())) return false;
            var commonIngredients = _.intersection(pizzaChild.ingredients,pizzaParent.ingredients);
            return _.isEqual(commonIngredients.sort(),pizzaParent.ingredients.sort());
        }

        function computeDescendance() {
            var p = _.map(_allPizzas, function(pizzaParent) {
                var computedPizza = {
                    id: pizzaParent.id,
                    children : []
                };
                _.reduce(_allPizzas, function(childs, pizzaChild){
                    if (isExtensionOf(pizzaParent, pizzaChild)) {
                        childs.push(pizzaChild.id);
                    }
                    return childs;
                }, computedPizza.children);

                return computedPizza;
            });
            console.log(p);
            service.parent2child = p;
        }

        function computeExtensions() {
            var p = _.map(_allPizzas, function(pizzaChild) {
                var computedPizza = {
                    id: pizzaChild.id,
                    extensions : []
                };
                _.reduce(_allPizzas, function(ext, pizzaParent){
                    if (isExtendedBy(pizzaChild, pizzaParent)) {
                        ext.push(pizzaParent.id);
                    }
                    return ext;
                }, computedPizza.extensions);

                return computedPizza;
            });
            console.log(p);
            service.extendedPizzas = p;
        }

        ////////////////////////////////////

        function activate() {
            pizzaFactory.then(function(pf) {
                console.log("pizzaFactory returned...");

                service.ingredients = pf.ingredients;

                var bases = pf.base;
                // add the ingredients from base to the pizza
                _allPizzas = _.map(pf.allPizzas, function(pizza) {
                    var newPizza = _.cloneDeep(pizza);
                    var ingredients = _.union(pizza.ingredients, bases[pizza.base].ingredients);
                    newPizza.ingredients = ingredients;
                    return newPizza;
                });
                // create base pizzas from base and add it to the pizza collection
                _.reduce(bases,
                    function(acc, base){
                        var newPizza = {};
                        newPizza.id = acc.length;
                        newPizza.name = base.name + "-base";
                        newPizza.ingredients = base.ingredients;
                        acc.push(newPizza);
                        return acc;
                    },
                    _allPizzas
                );

                _indexedIngredients = pf.indexedIngredients;

                isReady.resolve();

                computeExtensions();
                computeDescendance();
            });
        }
    }
})();