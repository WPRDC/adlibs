var url;
var promises = [];
var context = {};

// Load settings
$.getJSON("settings.json", function (data) {
    url = data['url'];
    fields = data['fields'];
    fields.forEach(function (field) {
        $("#field-list").append("<li> <span data-tooltip aria-haspopup='true' class='has-tip' title='" + field['description'] + "' >" + field["name"] + "</span></li>");
    });
    makeStory(data);

    // Generate button click
    $(".gen-btn").on("click", function () {
        makeStory(data);
        $('html,body').animate({
                scrollTop: $("#story").offset().top
            },
            'slow');
    });

    $("#back-btn").on("click", function () {
        makeStory(data);
        $('html,body').animate({
                scrollTop: $("#main-content").offset().top
            },
            'slow');
    });
});


var buildContext = function (fields) {
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];

        var p = getRandomItem(url, field);
        promises.push(p);
    }
};


var getRandomItem = function (url, field) {
    console.log(field);
    var name = field["name"];
    var type = field["type"];
    var resource = field["resource"];
    var ckan_field = field["field"];
    var reqUrl = url + "api/3/action/datastore_search_sql";
    var extraCondition = "";
    if (type === "string") {
        extraCondition = "AND \"" + ckan_field + "\" <> ' '"
    }


    var params = {
        "sql": "SELECT \"" + ckan_field + "\" FROM \"" + resource + "\" " +
        "WHERE (\"" + ckan_field + "\" IS NOT NULL " + extraCondition + ") LIMIT 2000;"
    };

    return $.ajax({
        url: reqUrl,
        data: params,
        crossDomain: true,
        dataType: "jsonp"
    }).done(function (response) {
        console.log(response);
        var results = response["result"]["records"];
        var rand = Math.floor((Math.random() * results.length) + 1);
        rand--;
        result = results[rand][ckan_field];

        if (type === "money") {
            result = "$" + result.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        if (type === "string") {
            result = result.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
        if (name === "CRIME") {
            result = result.replace(/\./g, "")
        }

        result = "<span class='lib'>" + result + "</span>";

        context[name] = result;
    });
};


var makeStory = function (data) {
    buildContext(data['fields']);
    $.when.apply($, promises).done(function () {
        // Make handlebars template out of story
        story = $("#story-box").val().replace(/(\(+)/g, "{{{").replace(/(\)+)/g, "}}}");
        var template = Handlebars.compile(story);
        var html = template(context);

        $(".story-box").show();
        $("#story").html(html);
    });
};

$('#share-btn').on('click', function () {
    s = $('#story').html();
    p_data = {"story": s};

    $.ajax({
        url: 'page-maker/make_page.php',
        type: 'POST',
        data: p_data,
        success: function (response) {
            if (response) {
                console.log(response);
                var p = response['page_name'];
                window.location.href = ('http://wprdc.org/adlibs/user.html?s=' + p);
            }
        },
        dataType: 'json'
    });
});
