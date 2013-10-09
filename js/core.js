(function ( $ ) {
    
    var iframe = "<iframe src=''></iframe>";
      
    $.fn.addSurvey = function(params) {
		var container = this;
		
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
                        addFrame();
                        return false;
            } 
            
            var contents = $("iframe", container).first().contents();
            var uid_store = $(".ss-q-title:contains('"+params.guidSearchTerm+"')", contents);
            
            var input = $(uid_store).parent().parent().find("input");
            $(input).val(guid);
            $(uid_store).parent().parent().hide();
        });
		};
		
		
		addFrame();		
};
		
}( jQuery ));