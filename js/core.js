$(document).ready(function() {
	
		var urls = ["/ps_survey/form1.html", "/ps_survey/form2.html"];
		
		var gen_id = function() {
			function S4() {
    			return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
			}
		
		return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
		};
		
		var guid = gen_id(); 
				
		$("#frame-content iframe").attr("src", urls[0]);
		
		var n = 0;
		var loads = 0;
		
		$('#frame-content iframe').on('load', function() {	
			++loads;
			console.log("loaded iframe "+loads);
		
			if(loads == 2) {
						$("#frame-content iframe").attr("src", urls[++n]);
						return false;
			} 
			
			var contents = $(this).contents();
			var uid_store = $(".ss-q-title:contains('%for_script_use%')", contents);
			
			var input = $(uid_store).parent().parent().find("input");
			$(input).val(guid);
			$(uid_store).parent().parent().hide();
		});
		
		
		
	});