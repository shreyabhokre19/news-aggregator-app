var allArticles;
var removedArticles = [];
var currentTitle = "";
var defaultView = 'https://newsapi.org/v2/top-headlines?country=gb&apiKey=39b350bf37884544adc01a04c8aeae73';
var autocomplete = [];
$(document).ready(function(){

  //on page load
  if(sessionStorage){
    setRemovedArticles(JSON.parse(sessionStorage.getItem("removedArticles")));
    sessionStorage.setItem("currentView","null");
  }
  //get our content
  $.get(defaultView, function(data, status){

    allArticles = data.articles;

    currentTitle = '<strong>Latest Headlines</strong>';
    $(".se-pre-con").fadeOut("slow");
    setTitle();
    //for each of the articles append them to the view
    $.each(data.articles, function(index, element){
      if(!inArray(element.url))
      {
        $('.container').append(toArticle(element));
      }
    });
  });

  //toggle the short text
  $('.container').on('click','.card-header', function(){
    event.preventDefault();
    $(this).parent().find('#content').slideToggle('fast');
  });

  //close the article
  $('.container').on('click','.close', function(){
    event.preventDefault();
    $(this).parent().slideToggle('fast');
    removedArticles.push($(this).parent().find('#url').attr('href'));
    sessionStorage.setItem("removedArticles",JSON.stringify(removedArticles));
    setTitle();
  });

  //search button
  $('#btn-search').on('click', function(){
    event.preventDefault();
    $(".se-pre-con").show();
    let value = $('#search-box').val();
    if(!autocomplete.includes(value)){
      autocomplete.push(value);
      localStorage.setItem("search-autocomplete",JSON.stringify(autocomplete));
    }

    $('#search-box').val('');

    getNews(value);
    $(".se-pre-con").fadeOut("slow");
  });

  //clear removed
  $('.container').on('click','#clear-removed', function(){
    event.preventDefault();
    $(".se-pre-con").show();
    $(this).parent().slideToggle('fast');
    removedArticles = [];
    sessionStorage.setItem("removedArticles",JSON.stringify(removedArticles));
    getNews(sessionStorage.getItem("currentView"));
    $(".se-pre-con").fadeOut("slow");
  });

  //search box autocomplete
  autocompleteArray(JSON.parse(localStorage.getItem('search-autocomplete')));
  $('#search-box').autocomplete({source: autocomplete});
});

function setRemovedArticles(jsonArray){
  for(var i in jsonArray)
    removedArticles.push(jsonArray[i]);
}

function autocompleteArray(json){
  for(var i in json)
    autocomplete.push(json[i]);
}

function inArray(name){
  if(sessionStorage)
  {
    let sessionRemovedArticles = JSON.parse(sessionStorage.getItem("removedArticles"));
    for(var key in sessionRemovedArticles){
      console.log("array: " + sessionRemovedArticles[key]);
      console.log("query: " + name);
      if(new String(sessionRemovedArticles[key]).valueOf().trim() == new String(name).valueOf().trim())
        return true;
    }
  }
  return false;
}

function setTitle(){
  $('.container').find('#title-div').remove();
  let headHTML = '<div id="title-div">';
  headHTML +=    '<h3> '+ currentTitle +'</h3>';
  if(removedArticles !== null && removedArticles.length > 0){
    headHTML += '<pre>' + removedArticles.length + ' articles removed <a href="#" id="clear-removed"> (clear removed)</a></pre>';
  }
  headHTML +=    '</div>';
  $('.container').prepend(headHTML);
}

function getNews(query){
  $('.container').empty();
  let url = 'https://newsapi.org/v2/everything?q='+ query +'&apiKey=39b350bf37884544adc01a04c8aeae73';
  sessionStorage.setItem("currentView",query);
  currentTitle = 'Showing news results for <strong>' + query + '</strong>';
  if(query == "null"){
    url = defaultView;
    currentTitle = '<strong>Latest Headlines</strong>';
  }

  $.getJSON(url, function(data){
    var html = "";

    setTitle();
    //custom sort the articles since they come in a random order
    let sortedArticles = data.articles.sort(function(a,b){
      let datea = moment();
      datea = moment(a.publishedAt);

      let dateb = moment();
      dateb = moment(b.publishedAt);

      return datea < dateb ? 1 : -1;
    });
    //for each of the articles, show to screen
    $.each(sortedArticles, function(index, element){
      if(!inArray(element.url))
      {
        $('.container').append(toArticle(element));
      }
    });
  });
}

//create an article from JSON string
function toArticle(element){
  let date = moment();
  date = moment(element.publishedAt);
  let html = "";

  html += '<article class="card shadow p-3 mb-5 bg-white rounded">';
  html += ' <div class="card-img-top" id="img_container">';
  if(element.urlToImage !== null){
    html += ' <img src="'+ element.urlToImage +'" class="card-img-top">';
  }

  html += '</div>'

  html += '<a href="#" class="close button btn btn-danger active" role="button">x</a>';
  html += ' <header class="card-header">';
  html += '   <h5 class="card-title">' + element.title + '</h2>';
  html += '   <author><pre>by ' + element.author + ' at ' +  date.format("h:mm a DD/MM/YY") + '</pre> </author>';
  html += ' </header>';
  html += ' <div class="card-body" id="content">';
  html += ' <p class="card-text">';
  html += element.content;
  html += ' </p>';
  html += ' <p class="card-text">';
  html += '<a id="url" href="'+ element.url +' "target="_blank" rel="noopener noreferrer" class="btn btn-info btn-sm active" role="button" aria-pressed="true">Read More >></a>';
  html += ' </p>';
  html += ' </div>';
  html += '</article>';
  return html;
}
