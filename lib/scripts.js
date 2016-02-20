$(document).ready(function(){
    var waypoints = $('.wp').waypoint({
      handler: function(direction) {

          if($(this.element).hasClass('wpL')){
              $(this.element).addClass('animated fadeInLeft');
              $(this.element).removeClass('wp wpL');
          }


      },

      offset:'95%'

    });



});
