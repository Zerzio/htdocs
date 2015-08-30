(function() {

    var app = angular.module("PizzaFinder");

    app.controller("gen", ['$http', function($http) {

        var vm = this;
        vm.ingredients = [];
        vm.pizzas = [];

        $http.get('data/pizzas.json').
            then(function(response) {

                var pizzas = response.data.pizzas;
                var pizzas2 = _.map(pizzas, function(pizza, index) {
                    var ingredients = _.map(pizza.ingredients.split(","), function(el) { return el.trim() });
                    var newPizza = _.cloneDeep(pizza);
                    newPizza.id = index;
                    if (index < 28) {
                        newPizza.base = 0;
                    } else {
                        newPizza.base = 1;
                    }
                    newPizza.ingredients = ingredients;
                    return newPizza;
                });
                /*
                var pizzas3 = _.reduce(pizzas, function(result, item, index) {
                    var ingredients = _.map(item.ingredients.split(","), function(el) { return el.trim() });
                    var ingredientIndex = _.map(ingredients, function(item) {
                        var index = _.indexOf(vm.ingredients, item);
                        return index;
                    });
                    item.ingredients = ingredientIndex;
                    if (index < 28) {
                        item.base = 0;
                    } else {
                        item.base = 1;
                    }
                    result.push(item);
                    return result;
                }, []);
                var pizzas4 = _.map(pizzas3, function(pizza, id) {
                    var newPizza = _.cloneDeep(pizza);
                    newPizza.id = id;
                    return newPizza;
                });
                */
                vm.pizzas = pizzas2;
            });
    }])
})(angular);