/* My Scripts */

function slugify(text){
  var slug = text.toLowerCase().replace(/ /g,'-').replace(/[-]+/g, '-').replace(/[^\w-]+/g,'');
  return slug;
}

$(function(){
  //console.log('Hello!');
  const myTable = $('table');
  const myTHead = myTable.children('thead');
  const myTBody = myTable.children('tbody');
  const th = myTHead.find('th');
  const idArray = [];
  const yearCurrent = new Date().getFullYear();

  /* --- Prepare Table --- */

  th.each(function(){
    var th = $(this);
    var text = th.text();
    var id = slugify(text);
    th.attr('data-id',id);
    //console.log({id});
    if(idArray.indexOf(id) === -1) {
      idArray.push(id);
    }
  });
  //console.log({idArray});

  myTBody.children('tr').each(function(){ // loop rows
    var tr = $(this);
    tr.children('td').each(function(i){ // loop cells
      var td = $(this);
      var id = th.eq(i).data('id');
      td.attr('data-id',id);

      if(id == 'category'){
        var val = td.text();
        //console.log({val});
        if(val.length > 1){
          var cat = slugify(val);
          tr.attr('data-cat',cat);
        } else {
          tr.addClass('empty-row');
        }
      }
    });
  });

  /* --- Add Visualization DOM Elements --- */

  const myVisContainer = $('<div/>').addClass('vis-container');
  const myVisNav = $('<div/>').addClass('vis-nav');
  const myVis = $('<div id="visualization"></div>');

  myTable.parent().children().wrapAll(myVisContainer);
  //myVis.prependTo(myVisContainer);
  myVis.insertBefore( myTable.parent().children().first() );
  myVisNav.appendTo(myVis);

  myVisContainer.css({
    'display': 'block',
    'margin': 'auto',
    'width': '100vw',
    'max-width': '100%',
    'height': '100vh',
  });

  myVis.css({
    'display': 'block',
    'margin': 'auto',
    'width': '100vw',
    'max-width': '100%',
    'height': '100vh',
  });

  myVisNav.css({
    'margin': 'auto',
    'width': 'auto',
    'max-width': '100%',
    'height': 'auto',
    'z-index': '9999',
  });

  var width = Math.floor( window.innerWidth ); // size canvas width according to viewport width! redraw again on resize.
  var height = Math.floor( window.innerHeight );

  /* --- Prepare Items Array --- */

  const itemsArray = [
    //{id: 1, content: 'item 1', start: new Date(Date.parse('0001-01-04')), group: 1},
    //{id: 2, content: 'item 2', start: new Date(2011,9,23), end: new Date(2012,9,23), group: 1},
    //{id: 3, content: 'item 3', start: new Date(2013,9,23), type: 'point', group: 2}
  ];
  // Date.parse('0001-01-04')

  const categoryArray = [];

  myTBody.children('tr:not(".empty-row")').each(function(i){ // loop rows // .slice(0,100)
    var tr = $(this);
    //console.log(i);
    var start = tr.children('td[data-id="start"]').first().text().trim();
    //console.log({start});
    var end = tr.children('td[data-id="end"]').first().text().trim();
    //console.log({end});
    var title = tr.children('td[data-id="title"]').first().text().trim();
    //console.log({title});
    var desc = tr.children('td[data-id="description"]').first().text().trim();
    //console.log({desc});
    var category = tr.children('td[data-id="category"]').first().text().trim();
    //console.log({category});

    if( start != undefined && start.length > 0 ){

      var newArray = [];

      //newArray.push({id:i+1});
      newArray['id'] = i + 1;

      //newArray.push({content:title});
      newArray['content'] = title;

      // Start
      start = start.padStart(4, '0'); // add leading zeros, returns 0123
      //console.log({start});
      //newArray.push({start:start + '-01-01'}); // new Date(start,1,1)
      newArray['start'] = new Date(Date.parse(start + '-01-01'));

      // End
      //console.log(end.length);
      if(end.length > 0){
        newArray['title'] = start + '–' + end + ' ' + title; // tooltip
        if(end == 'now'){
          end = yearCurrent; // returns the current year
        } else {
          end = end.padStart(4, '0'); // add leading zeros, returns 0123
        }
        //console.log({end});
        //newArray.push({end:end + '-01-01'}); // new Date(end,1,1)
        newArray['end'] = new Date(Date.parse(end + '-01-01'));

      } else {
        newArray['type'] = 'point';
        newArray['title'] = start + ' ' + title; // tooltip
      }
      // Group
      //newArray.push({group:category});
      newArray['group'] = category;
      // ---
      itemsArray.push(newArray);
      if( categoryArray.includes(category) == false ){
        categoryArray.push(category);
      }
    }
  });

  //console.log({itemsArray});
  //console.log({categoryArray});

  var groups = [
    //{id: 1, content: 'Group 1'}, // Optional: a field 'className', 'style', 'order', [properties]
    //{id: 2, content: 'Group 2'},
  ];

  $.each(categoryArray, function( index, val ) {
    //console.log( index + ": " + value );
    groups.push({id: val, content: val , className: 'g_'+val});
    var newNavItem = $('<div><label class="switch" data-id="g_' + val + '"><input type="checkbox" checked><span>' + val + '</span></label></div>')
    newNavItem.appendTo(myVisNav);
  });

  //console.log({groups});

  /* --- Vis Nav --- */

  $(document).on("click",".vis-nav .switch input",function(event) {
    //event.preventDefault();
    event.stopPropagation();
    //console.log('switch clicked');
    var navItem = $(this).parent();
    var id = navItem.data('id');
    $('.vis-timeline').find('.'+id).toggle();
    timeline.zoomOut(0);
  });

  /* --- Initiate Vis.js --- */

  // DOM element where the Timeline will be attached
  var container = myVis[0];
  //console.log({container});

  // Create a DataSet (allows two way data-binding)
  var items = new vis.DataSet(itemsArray);

  // Configuration for the Timeline
  var options = {
    stack: true,
    verticalScroll: true,
    horizontalScroll: true,
    zoomKey: 'altKey',
    width: '100%',
    height: '100%',
    autoResize: true,
    //showCurrentTime: false,
    start: new Date(Date.parse('1000-01-01')),
    end: new Date(Date.parse(yearCurrent + '-01-01')),
    margin: { item: 5 }
  };

  // Create a Timeline
  const timeline = new vis.Timeline(container, items, groups, options);

  //console.log('fin');

});
