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
		
		var addFrame = function(isLast) {
		   if(typeof isLast === 'undefined') {
		       isLast = false;
		   } 
		   if(isLast && n === 0) {
		       $("p", list).first().html("Survey complete.  Thank you for your time!<br>You can now navigate away fro");
		       return false;
		   } 
		    
		   if(typeof params.frames[n].message === 'undefined') {
		      params.frames[n].message = "";    
		   }
		   if(typeof params.frames[n].anonymous === 'undefined') {
              params.frames[n].anonymous = true;    
           }
		   
		    $(container).prepend(iframe);
		    $("iframe", container).first().attr("src", params.base+params.frames[n].url);
		    
		    $("iframe", container).first().on('load', function() { 
          
            if(++loads % 2 === 0) {
                        $("iframe", container).first().hide();
                        lockFrame = false;
                        
                        if(n > params.frames.length) {
                                n = 0;
                        }
                        n = n + 1;
                        addFrame();
                        return false;
            } else {
                lockFrame = true;
            }
            
            var contents = $("iframe", container).first().contents();
            var uid_store = $(".ss-q-title:contains('"+params.guidSearchTerm+"')", contents);
            
            if(!params.frames[n].anonymous) {
                var input = $(uid_store).parent().parent().find("input");
                $(input).val(guid);
            }
            if(!params.frames[n].userFocused) {
                var nextName = $("label.waiting", list).first();
                $(nextName).removeClass('waiting');
                var screen_name = $(nextName).text();
                
                $(".ss-form-entry:contains('%screen_name%'), .ss-form-desc:contains('%screen_name%')", contents).each(function() {
                       var myContents = $(this).html();
                       $(this).html(myContents.replace('%screen_name%', screen_name)); 
                });
            }
            if(params.frames[n].message.length > 0) {
                $("p", list).first().html(params.frames[n].message);
            }
            if(params.frames[n].skipButton) {
               if($("#skip", list).length === 0) { 
                    $(list).append("<button id='skip'>Skip this person</button>");
                    $(list).on('click', '#skip', function() {
                            var isLast = false;
                            $("label.waiting", list).each(function() {
                                isLast = this === $("label").last().get(0);
                            });
                            $("label.waiting", list).removeClass('waiting').addClass('skipped');
                            if(n > params.frames.length) {
                                n = 0;
                            }
                            n = n + 1;
                            addFrame(isLast);
                    });
               }
            }
            
            console.log(params);
            
            $(uid_store).parent().parent().hide();
            });
		};
		
		var ticks = function() {
		    $("label", list).prepend("<input type='radio' name='radio' value='1'/>").addClass('waiting');
		    
		    $(list).on('click', 'label input', function() {
		       if(lockFrame) return false; 
		       
		       if($(this).attr('type') == 'radio') {
		          
		          userName = $($(this).closest('label')).text();
		         
		          $(this).closest('ul').prev("p").html("Thank you, "+userName+". Please fill in your details below."); 
		          $(this).closest('ul').hide().attr('id','name_list');
		          $(this).closest('li').remove();
		          $('input', list).attr('disabled', 'disabled');
		          lockFrame = true;
		          addFrame();
		       } 
		    });
		};
		
		ticks();		
};
		
}( jQuery ));