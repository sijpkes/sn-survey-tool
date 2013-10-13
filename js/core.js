(function ( $ ) {
    
    var iframe = "<iframe src='' seamless></iframe>";
      
    $.fn.addSurvey = function(params) {
        var list = $(this).find("div:eq(0)");
		var container = $(this).find("div:eq(1)");
		var lockFrame = false;
		var userName = "";
		
		if(typeof params.base === 'undefined') {
		    params.base = "/";
		}
		if(typeof params.guidSearchTerm === 'undefined') {
		    params.guidSearchTerm = "%for_script_use%";   
		}
		console.log(params);
		var n = 0;
        var loads = 0;
        
		var gen_id = function() {
			function S4() {
    			return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
			}
		
		return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
		};
		
		var guid = gen_id(); 
		
		var addFrame = function() {
		    console.log(params);
		    $(container).prepend(iframe);
		    $("iframe", container).first().attr("src", params.base+params.urls[n++]);
		    
		    $("iframe", container).first().on('load', function() { 
            //++loads;
            console.log("loaded iframe "+loads);
        
            if(++loads % 2 === 0) {
                        $("iframe", container).first().hide();
                        lockFrame = false;
                        addFrame();
                        return false;
            } else {
                lockFrame = true;
            }
            
            var contents = $("iframe", container).first().contents();
            var uid_store = $(".ss-q-title:contains('"+params.guidSearchTerm+"')", contents);
            var name = $("div.ss-form-desc:contains('%user_name%')", contents);
            var rtext = $(name).html().replace('%user_name%', userName);
            $(name).html(rtext);    
            
            var input = $(uid_store).parent().parent().find("input");
            $(input).val(guid);
            $(uid_store).parent().parent().hide();
        });
		};
		
		var ticks = function() {
		    $("label", list).prepend("<input type='radio' name='radio' value='1'/>");
		    
		    $(list).on('click', 'label input', function() {
		       if(lockFrame) return false; 
		       
		       if($(this).attr('type') == 'radio') {
		          
		          userName = $($(this).closest('label')).text();
		         
		          $(this).closest('ul').prev("p").text("Thank you, "+userName+". Please fill in your details below."); 
		          $(this).closest('ul').hide().attr('id','name_list');
		          $(this).closest('li').remove();
		          $('input', list).attr('disabled', 'disabled');
		          lockFrame = true;
		          addFrame();
		       } else if($(this).attr('type') == 'checkbox') {
		           $("input",this).attr("disabled", "disabled ");
                   addFrame();
		       }
		    });
		};
		
		ticks();		
};
		
}( jQuery ));