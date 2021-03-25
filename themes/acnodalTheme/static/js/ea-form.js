(function ($) {
    "use strict";

    
    /*==================================================================
    [ Validate ]*/
    var name = $('.validate-input input[name="name"]');
    var email = $('.validate-input input[name="email"]');
    var company = $('.validate-input input[name="company"]');
    var dist = $('.validate-input input[name="dist"]');


    $('.validate-form').on('submit',function(e){
        var check = true;

        if($(name).val().trim() == ''){
            showValidate(name);
            check=false;
        }

        if($(email).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
            showValidate(email);
            check=false;
        }

        if($(dist).val().trim() == ''){
            showValidate(dist);
            check=false;
        }

        if($(company).val().trim() == ''){
            showValidate(company);
            check=false;
        }



        if(!check)
            return false;

        e.preventDefault();
      
        $.ajax({
            url: "https://script.google.com/macros/s/AKfycbwBHpUO-Qz3gPyXcViNHhKfVADQOyqwoBZfh2jlF5SGB7t0dk186lLnsI8038s6cdY/exec",
            method: "POST",
            dataType: "json",
            data: $(".contact1-form").serialize(),
            success: function(response) {
                
                if(response.result == "success") {
                    $('.contact1-form')[0].reset();
                    alert('Thanks for registering, we will be in contact shortly.');
                    return true;
                }
                else {
                    alert("Something went wrong. Please let us know info@acnodal.io")
                }
            },
            error: function() {
                
                alert("Something went wrong. Please let us know info@acnodal.io")
            }
        })
    });


    $('.validate-form .input1').each(function(){
        $(this).focus(function(){
           hideValidate(this);
       });
    });

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    

})(jQuery);