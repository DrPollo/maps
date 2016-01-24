# angular-cbuffer

Encapsulation of [cbuffer.js](https://github.com/trevnorris/cbuffer) library for AngularJS


## Installation

#### Bower
```
bower install angular-cbuffer
```
#### NPM
```
npm install angular-cbuffer
```

## Dependencies
CBuffer depends on Angular only.

## Usage
Add 'cbuffer' as a dependency to your app and inject CBuffer into your controller or service.

````javascript
angular.module('myApp', ['cbuffer']);

angular.module('myApp').controller('MainCtrl', function($scope, CBuffer) {
  // ...
});
````

Note: When adding CBuffer as a dependency it is not capitalized 'cbuffer'
      But when injected into your controller it is 'CBuffer'
