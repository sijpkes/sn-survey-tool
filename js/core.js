(function ( $ ) {
    
    function getURLParameter(name) {
        return decodeURI(
            (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
        );
    }
    
    var iframe = "<iframe src='' seamless></iframe>";
    var currentFrame = null;
    var guid = getURLParameter('uid');
       
    $.fn.addSurvey = function(params) {
        var list = $(this).find("div#controls");
		var container = $(this).find("div#frame-content");
		var lockFrame = false;
		var userName = "";
		var loopIndex = 0; // return to this frame after each response.
		var n = 0;
        var loads = 0;
        
   
        /*
         * Because of the same origin policy we cannot verify whether the survey
         * actually completed successfully by reading content. So if a frame is still waiting
         * it was not submitted.  This is unlikely to ever occur, since the load event handler
         * on the frame won't fire until the frame has loaded.
         */ 
        var checkComplete = function() {
             var subs = $("iframe.submitted", container).length;
            
               $('.subError', list).remove();
               $(container).hide(100).stop().remove();
               $(list).animate({ "margin-left": 330 }, 500);
               /*
                * Check if any forms are still waiting to submit...
                */
               if(validateWaiting) {
                 
                  $("p, ol, #skip, h1, h3", list).remove();
                  $(list).append("<h1 style='margin-left: 3em'>Survey complete. Thank you for your time!</h1>");
                   console.log("Forms submitted: " + subs);
               }
        };
        var validateWaiting = function() {
            $('iframe.waiting', container).each(function() {
               $(list).append("<p class='subError' style='color: red; font-weight: bolder'>This form has not submitted succesfully, please click submit again...</p>"); 
               $(this).unbind('load');
               $(this).show().bind('load', function() {
                        checkComplete();
               }); 
               return false;
            });
            return true;
        };
        
		$(params.frames).each(function(i, f) {
		    if(typeof f.keyForm === 'undefined') {
		        f.keyForm = false;
		    }
		    if(f.keyForm) {
		        loopIndex = i;
		        return false;
		    }
		});
		
		if(typeof params.base === 'undefined') {
		    params.base = "/";
		}
		if(typeof params.guidSearchTerm === 'undefined') {
		    params.guidSearchTerm = "%for_script_use%";   
		}
		if(typeof params.nameSearchTerm === 'undefined') {
            params.nameSearchTerm = "%screen_name%";   
        }
		console.log(params);
		
		var addFrame = function() { 
		   /* after the end of each user response, return to the key form */
		   if(n > (params.frames.length-1))  {
		       n = loopIndex;  
		   }
		   var wn = $("#name_list .waiting", list).length;
		   console.log(wn);
		   if(wn == 0) {
		       checkComplete();
		       return false;
		   } 
		    
		   if(typeof params.frames[n].message === 'undefined') {
		      params.frames[n].message = "";    
		   }
		   if(typeof params.frames[n].anonymous === 'undefined') {
              params.frames[n].anonymous = true;    
           }
            if(typeof params.frames[n].weighting === 'undefined') {
                params.frames[n].weighting = false;  
            }
		   
		    $(container).prepend(iframe);
		    currentFrame =  $("iframe", container).first();
		    $(currentFrame).addClass('waiting');
		    $(currentFrame).attr("src", params.base+params.frames[n].url);
		    
		    $(currentFrame).on('load', function() { // start frame load handler
          
            if(++loads % 2 === 0) {
                       
                        $(currentFrame).hide().removeClass('waiting').addClass('submitted');
                        lockFrame = false;
                        
                        n = n + 1;
                        addFrame();
                        return false;
            } else {
                lockFrame = true;
            }
            
            var contents = $("iframe", container).first().contents();
            var uid_store = $(".ss-q-title:contains('"+params.guidSearchTerm+"')", contents);
            var name_store = $(".ss-q-title:contains('"+params.nameSearchTerm+"')", contents);
            /* this determines whether the form is about node weighting rather than creating edges in the SN */
            if(params.frames[n].weighting) {
                
            }
            /* is the form anonymous?  i.e. the record has no identity associated with it in google drive */
            if(!params.frames[n].anonymous) {
                var input = $(uid_store).parent().parent().find("input");
                $(input).val(guid);
            }
            /* is this form user focused? i.e. the form asks questions about the current user, not about others
             * in the network.  This makes this a node weighting tool as well, for the user's node 
             * and does not add edges to the SN
             * */
            if(!params.frames[n].userFocused) {
                var nextName = $("label.waiting", list).first();
                if(n == params.frames.length-1) {
                    $(nextName).removeClass('waiting');
                }
                var screen_name = $(nextName).text();
                
                var input = $(name_store).parent().parent().find("input");
                $(input).val(screen_name);
                
                $(".ss-form-title:contains('%screen_name%'),\
                        .ss-form-desc:contains('%screen_name%')", contents).each(function() {
                       var myContents = $(this).html();
                       $(this).html(myContents.replace('%screen_name%', screen_name)); 
                });
            }
            /* this message is added to the control element this script is attached to
             */
            if(params.frames[n].message.length > 0) {
                $("p, ol, #skip, h3, #contacts", list).remove();
                $(list).append("<p>"+params.frames[n].message+"</p>");
            }
            /*
             * add a skip button for this form?
             */
            if(params.frames[n].skipButton) {
               if($("#skip", list).length === 0) { 
                    $(list).append("<button id='skip' style='float: right'>Skip this person</button>");
               }
            } else {
                $("#skip", list).remove();
            }
            
            /* add later */
           // $(list).append("&nbsp;&nbsp;&nbsp;<button id='save'>Save Progress</button>");
            
            console.log(params);
            
            $(uid_store).parent().parent().hide();
            $(name_store).parent().parent().hide();
            }); // end frame load handler
		};
		
		$(document).on('click', '#skip', function() {  
                            $("label.waiting", list).first().removeClass('waiting').addClass('skipped');
                            
                            n = params.frames.length;
                            loads = 0;
                            $(currentFrame).hide().removeClass('waiting').addClass('skipped');
                            
                            addFrame();
        });
            
		var ticks = function() {
		    $("label", list).prepend("<input type='radio' name='radio' value='1'/>").addClass('waiting');
		    $(list).append("<button id='start' style='float:right'>Start the Survey</button>");
		    
		    
		    $(list).on('click', 'label input', function() {
		       if(lockFrame) return false; 
		       
		       if($(this).attr('type') == 'radio') {
		          
		          userName = $($(this).closest('label')).text();
		         
		          $(this).closest('ul').prev("p").html("Hello, "+userName+". Please begin by filling in your details below."); 
		          $(this).closest('ul').hide().attr('id','name_list');
		          $(this).closest('li').remove();
		          $('input', list).attr('disabled', 'disabled');
		          lockFrame = true;
		          addFrame();
		       } 
		    });
		    
		    $('label', list).each(function() {
		       var lbl = $(this).attr('id'); 
		       var me = this;
		       $(this).hide();
		       
		       $(list).on('click', '#start', function() {
		           if(lbl == guid) {
		               if($(list).css('margin-left') == "330px") {
		                      $(list).animate({ "margin-left": 0 }, 500);
		                }
                        $(container).show();
                        $('input', me).trigger('click');
                        $('#start', list).unbind('click');
                        $('#start', list).remove();
                    }  
		       });
		    });
		    
		};
		
		ticks();		
};
		
}( jQuery ));