var cache = new CacheProvider;

/**
  Publication Model
 */
var Publication = Backbone.Model.extend({
   story: function() { return 'c' + publication._currentstory; }
});

/**
    Publications Collection
 */
var Publications = Backbone.Collection.extend({
    model: Publication,
    comparator: function(item) {
        return item.get('pid');
    }
});

function removeFallbacks(){
  var query = $('.jstest,.gallery');
        if(query.length){
          query.remove();
        }
}

/**
    Index View
 */
var IndexView = Backbone.View.extend({
    el: $('#main'),
    indexTemplate: $("#indexTmpl").template(),

    render: function() {
        removeFallbacks();
        var sg = this;
        
        this.el.fadeOut('fast', function() {
        sg.el.empty();
        $.tmpl(sg.indexTemplate, sg.model.toArray()).appendTo(sg.el);
        sg.el.fadeIn('fast');
        });
        return this;
    }

});

/**
 * Story View
 */
var StoryView = Backbone.View.extend({
    el: $('#main'),
    indexTemplate: $("#subindexTmpl").template(),
    
    initialize: function(options){

    },

    render: function() {
        var sg = this;
        removeFallbacks();
        this.el.fadeOut('fast', function() {
            sg.el.empty();
            $.tmpl(sg.indexTemplate, sg.model.toArray()).appendTo(sg.el);
            sg.el.fadeIn('fast');
        });
        return this;
    }

});

/**
 * Main App Controller
 */
var App = Backbone.Controller.extend({
    _index: null,
    _photos: null,
	_story:null,
	_data:null,
    routes: {
        "": "index",
        "story/:iid": "hashsub",
        "story/:iid/" : "directphoto"
        //"story/:id/:num" : "hashphoto"
    },

    initialize: function(options) {
    
        var ws = this;
       
        if (this._index === null){
            $.ajax({
                url: 'data/issues.json',
                dataType: 'json',
                data: {},
                success: function(data) {
                    var d = [];
                    
                    d.push(data['currentIssueDate']);
                    
                    for(var y in data['pubs']){
                        d.push(data['pubs'][y]);
                    }
                    
				    ws._data = d;
                    ws._photos = new Publications(data);
                    ws._index = new IndexView({model: ws._photos});
                    Backbone.history.loadUrl();

                }
            });
            return this;
        }
        return this;
    },

    /**
	 * Handle rendering the initial view for the application
	 * @type function
	*/
    index: function() {
        this._index.render();
    },
	

	/**
	 * URL Routing
	 */
	hashsub:function(id){
		
	   var properindex = id.replace('c','');	
	   this._currentstory = properindex;
	   this._subpublications = cache.get('pc' + properindex) || cache.set('pc' + properindex, new Publications(this._data[properindex].subalbum));
	   this._story = cache.get('sv' + properindex) || cache.set('sv' + properindex, new StoryView({model: this._subphotos}));
	   this._story.render();

		
	},
	
	directphoto: function(id){

	},

	/**
	 
	 */
	  hashphoto: function(num, id){
	    this._currentsub = num;
	    
	    num = num.replace('c','');
	    
		if(this._subphotos == undefined){
		   this._subphotos = cache.get('pc' + num) || cache.set('pc' + num, new Publications(this._data[num].subalbum));
		 }	
	    this._subphotos.at(id)._view = new PhotoView({model: this._subphotos.at(id)});
	    this._subphotos.at(id)._view.render();
	    
	  }
});


publication = new App();
Backbone.history.start();
