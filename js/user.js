var url = window.location.href;
var msg = "Check out my story made with open data randomly selected from @wprdc!";

var getParam = function(name) {
    var currentUrl = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

var name = getParam('s');
console.log(name);
if (name){
    $.get("http://wprdc.org/adlibs/page-maker/get_page.php", {"name": name}, function(response){
        console.log(response);
        if(response['result'] == 'success'){
            console.log(response['story']);
            $('#story').html(response['story']);
        }
    }, 'json')
}

twttr = (function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    t.ready = function (f) {
        t._e.push(f);
    };

    return t;
}(document, "script", "twitter-wjs"));


twttr.ready(function (twttr) {
    twttr.widgets.createShareButton(
        url,
        document.getElementById("tweet-container"),
        {
            size: "large",
            related: "",
            text: msg,
            hashtags: "wprdc,opendata,abstractions"
        });
});
