var onPageLoadFunctions = [];
var PostPaidRates = {};
PostPaidRates.countries = [];
PostPaidRates.maximum = 20;
PostPaidRates.path = window.location.pathname.split( '/' );
PostPaidRates.isSMBPage = (PostPaidRates.path.indexOf("business") == -1) ? false: true;
PostPaidRates.isPending = (PostPaidRates.path.indexOf("pending.html") == -1) ? false: true;
PostPaidRates.dataSrc ="data/retail/current.json"; // default src points to Resi Current
PostPaidRates.errorThrown = false;

PostPaidRates.queryPath = function(){
	if( !this.isPending && !this.isSMBPage ){ // is Resi Current Rates
		return;
	}
	else if( this.isPending && !this.isSMBPage){ // is Resi Pending Rates
		this.dataSrc = "data/retail/pending.json"
	}
	else if( !this.isPending && this.isSMBPage){ // is Business Current Rates
		this.dataSrc = "data/business/current.json"
	}
	else if( this.isPending && this.isSMBPage){ // is Business Pending Rates
		this.dataSrc = "data/business/pending.json"
	}
	else if(this.path == undefined){
		this.errorThrown = true;
		PostPaidRates.errorState();
	}
}
PostPaidRates.returnMiscData = function(obj){
	if(obj.showPending && !this.isPending){
		$('.upcoming-message').html("New International Calling rates will be effective " + obj.pendingDate + ". Click <a href='pending.html'>here</a> to review these rates");
	}
	else if(this.isPending){
		$('.upcoming-message').text("International Calling rates subject to change at any time. New International Calling rates are effective on " + obj.pendingDate + ".");
		$('.last-updated').text('Rates Effective: ' + obj.pendingDate);
	}
	else if(!this.isPending){
		$('.last-updated').text('Rates Last Updated: ' + obj.lastUpdated);
	}
}


window.onload = function() {
	for (var i = 0; i < onPageLoadFunctions.length; i++) {
		onPageLoadFunctions[i](jQuery);
	}
}
onPageLoadFunctions.push(function($) {
	PostPaidRates.$input = $('#country-search');
	PostPaidRates.$onetTable = $('.onet-table');
	PostPaidRates.$table = $('.post-paid-table');
	PostPaidRates.$noresults = $('.no-results');
	PostPaidRates.$loadIndicator = $('.loading-table');
	PostPaidRates.$input.val('').attr('disabled', false);

	PostPaidRates.load = function(){
			$.ajax({
			url: this.dataSrc,
			cache:false,
			dataType: 'json',
			success: function(data) {
				ratesData = data[0];
				miscData = data[1];

				for (var i=0; i<ratesData.length; i++) {
					if(ratesData[i].Location && ratesData[i].Landline && ratesData[i].Mobile){
						PostPaidRates.countries.push(ratesData[i].Location.toLowerCase());
						var featured;
						if(i < PostPaidRates.maximum ){
							featured = "featured"
						}
						else{
							featured = "nonfeatured"
						}
						var html = $("<tr class = 'country " + featured + "' id='country-" + i + "'><td>" + ratesData[i].Location + "</td><td>" + ratesData[i].Landline + "</td><td>" + ratesData[i].Mobile + "</td></tr>");
						//console.log(countries);
						PostPaidRates.$table.append(html);
					}
					else{
						this.errorThrown = true;
						PostPaidRates.errorState();
						return;
					}
				}
				PostPaidRates.$loadIndicator.hide();
				PostPaidRates.$onetTable.removeClass('not-loaded');
				PostPaidRates.returnMiscData(miscData);

			},
			error: function(jqXHR, textStatus, errorThrown){
				PostPaidRates.errorThrown = true;
				PostPaidRates.errorState();
				//alert('Error: ' + textStatus + ' - ' + errorThrown);
			}
		});
	};

	PostPaidRates.$input.on("keyup", function() {
		var p = PostPaidRates;
		console.log(p)
		var rawInput = $(this).val();
		var inputValue = rawInput.toLowerCase();
		var matches = [];
		for(var i=0; i< p.countries.length; i++){
			if(p.countries[i].indexOf(inputValue) !== 0){

			}
			else{
				obj = {name: p.countries[i], id: "#country-" + i}
				matches.push(obj)
			}
		}
		if(matches == 0 || rawInput == ''){
			if(matches ==0){
				p.$noresults.html("No results found");
			}
			$('tr.country.featured').show();
			$('tr.country.nonfeatured').hide()
		}
		else{
			p.$noresults.html("");
			$('tr.country.nonfeatured').hide();
			$('tr.country.featured').hide()
			for(var j=0; j< matches.length; j++){
				$(matches[j].id).show();
			}
		}
	}).on('focus', function(){
		var color = $('.color-secondary').css('color');
        $(this).css('border','1px solid ' + color);
    }).on('blur', function(){
        $(this).css('border','1px solid #bfbfbf');
    });

	PostPaidRates.errorState = function(){
		this.$loadIndicator.text("Calling rates are unavailable at this time. Please check back later.");
		this.$input.attr({disabled: true, placeholder: "rates unavailable"});
	}

	if(!PostPaidRates.errorThrown){
		PostPaidRates.load();
	}

 }) // end onPageLoadFunctions()
PostPaidRates.queryPath();