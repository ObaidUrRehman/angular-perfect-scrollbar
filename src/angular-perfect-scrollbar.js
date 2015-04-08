angular.module('perfect_scrollbar', []).directive('perfectScrollbar',
  ['$parse', '$window', function($parse, $window) {
  var psOptions = [
    'wheelSpeed', 'wheelPropagation', 'minScrollbarLength', 'useBothWheelAxes',
    'useKeyboard', 'suppressScrollX', 'suppressScrollY', 'scrollXMarginOffset',
    'scrollYMarginOffset', 'includePadding'//, 'onScroll', 'scrollDown'
  ];

  return {
    restrict: 'EA',
    transclude: true,
    template: '<div><div ng-transclude></div></div>',
    replace: true,
    link: function($scope, $elem, $attr) {
      var jqWindow = angular.element($window);
      var options = {};

      for (var i=0, l=psOptions.length; i<l; i++) {
        var opt = psOptions[i];
        if ($attr[opt] !== undefined) {
          options[opt] = $parse($attr[opt])();
        }
      }

      $scope.$evalAsync(function() {
        $elem.perfectScrollbar(options);
        var onScrollHandler = $parse($attr.onScroll)
        $elem.scroll(function(){
          var scrollTop = $elem.scrollTop()
          var scrollHeight = $elem.prop('scrollHeight') - $elem.height()
          $scope.$apply(function() {
            onScrollHandler($scope, {
              scrollTop: scrollTop,
              scrollHeight: scrollHeight
            })
          })
        });
      });

      function update(event) {
        $scope.$evalAsync(function() {
          if ($attr.scrollDown == 'true' && event != 'mouseenter') {
            setTimeout(function () {
              $($elem).scrollTop($($elem).prop("scrollHeight"));
            }, 100);
          }
          $elem.perfectScrollbar('update');
        });
      }

      // This is necessary when you don't watch anything with the scrollbar
      $elem.bind('mouseenter', update('mouseenter'));

      // Possible future improvement - check the type here and use the appropriate watch for non-arrays
      if ($attr.refreshOnChange) {
        $scope.$watchCollection($attr.refreshOnChange, function() {
          update();
        });
      }

      // this is from a pull request - I am not totally sure what the original issue is but seems harmless
      if ($attr.refreshOnResize) {
        jqWindow.on('resize', update);
      }

      $elem.bind('$destroy', function() {
        jqWindow.off('resize', update);
        $elem.perfectScrollbar('destroy');
      });
      
      // The following lines from https://github.com/mohitjee15/ng-perfect-scroll/blob/master/module(use_this)/perfect-scroll-module/perfectScrollModule.js
      // Function to find the sum height of all the elements inside the element on which the directive is applied
      var actualHeight    =   function(){
          "use strict";
          var totalHeight = 0;
          $elem.children().each(function(){
              totalHeight = totalHeight + angular.element(this).outerHeight();
          });
          return totalHeight;
      };
      
      //update the actual height of the element
      $scope.$watch(function(){
          "use strict";
          $scope.elementHeight =   actualHeight();
      });
      //update the scrollbar when the actual height of the element is changed
      $scope.$watch('elementHeight',function(){
          "use strict";
          $elem.perfectScrollbar('update');
      });

    }
  };
}]);
