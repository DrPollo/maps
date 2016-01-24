// one file
// NOTE: the immediately invoked function expression 
// is used to exemplify different files and is not required

(function(){
    // declaring the module in one file / anonymous function
    // (only pass a second parameter THIS ONE TIME as a redecleration creates bugs
    // which are very hard to dedect)
    angular.module('firstlife.controllers', []);
})();

(function(){
    // declaring the module in one file / anonymous function
    // (only pass a second parameter THIS ONE TIME as a redecleration creates bugs
    // which are very hard to dedect)
    angular.module('firstlife.services', []);
})();

(function(){
    // declaring the module in one file / anonymous function
    // (only pass a second parameter THIS ONE TIME as a redecleration creates bugs
    // which are very hard to dedect)
    angular.module('firstlife.factories', []);
})();

(function(){
    // declaring the module in one file / anonymous function
    // (only pass a second parameter THIS ONE TIME as a redecleration creates bugs
    // which are very hard to dedect)
    angular.module('firstlife.config', []);
})();