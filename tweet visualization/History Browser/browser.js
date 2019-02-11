var selected;
var iconUrl;
function initialize() {

    var channel = document.getElementById("fixed");

    var searchContent = document.getElementById("searchContent");
    var content = document.getElementById("content");
    channel.innerHTML = "<h3>Channels</h3><ul id='channel-list'></ul>";
    var channel_list= document.getElementById("channel-list");
    getIconUrl();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            for (var i = 0; i < data.length; i++) {
                var li = document.createElement("li");
                li.className= "channel";
                li.innerHTML = "<a href= '#'>#" + data[i]+ "</a>";
                channel.appendChild(li);
                li.addEventListener("click", function(event) {
                    document.getElementById("tooltip").style.display="none";
                    var chart= document.getElementById("chart");
                    chart.innerHTML= "";
                    content.style.display = "block";
                    searchContent.innerHTML = "";
                    searchContent.style.display = "none";
                    var lis = document.getElementsByTagName("li");
                    for (var j = 0; j < lis.length; j++) {
                        var liii = lis[j];
                        liii.className = "";
                    }
                    var ele = event.target.parentNode;
                    ele.className += " clicked";
                    selected = event.target.innerHTML;
                    getDataForRing();
                    getHistory();
                });
            }
        }
    };
    xhttp.open("GET", "getChannel.php", true);
    xhttp.send();
}

function getIconUrl(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            iconUrl = JSON.parse(this.responseText);
        }
    };
    xhttp.open("GET", "getIcon.php", true);
    xhttp.send();
}


function getDataForRing() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            showRing(data);
        }
    };
    xhttp.open("GET", "getRing.php?channel=" + selected.substring(1), true);
    xhttp.send();
}

function showRing(dataset) {
    
    var tooltip= document.getElementById("tooltip");

    var width = 360;
    var height = 360;
    var radius = Math.min(width, height) / 2;

    var color = d3.scaleOrdinal(d3.schemeCategory20c);

    var svg = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + (width / 2) +
            ',' + (height / 2) + ')');

    var donutWidth = 75;

    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) { return d.value; })
        .sort(null);

    var legendRectSize = 18;
    var legendSpacing = 4;

    var path = svg.selectAll('path')
        .data(pie(dataset))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d, i) {
            return color(d.data.sala);

        });

    path.on('click', function(d) {
        var total = d3.sum(dataset.map(function(d) {
            return d.value;
        }));
        var percent = Math.round(1000 * d.data.value / total) / 10;
        tooltip.style.display= "block";
        document.getElementById('name').innerHTML= d.data.sala;
        document.getElementById('times').innerHTML= d.data.value;
        document.getElementById('percent').innerHTML= percent + '%';
    });

    //path.on('mouseout', function() {
       // tooltip.style('display', 'none');
    //});

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * color.domain().length / 2;
            var horz = -2 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color);

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d; });
}

function getHistory() {
    var history = document.getElementById("content");
    history.innerHTML = "";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            for (var i = 0; i < data.length; i++) {
                var time = data[i]["day"];
                var sender = data[i]["username"];
                var mess = data[i]["message"];
                var url= iconUrl[sender];

                var html = "<div class='media'>" +
                    "<img src="+url+" class='media-object' style='width:60px'>" +
                    "<div class='media-body message'>" +
                    "<div class='media-heading username'>" + sender + "</div>"+
                    "<div class= 'time'> Posted on " + time + "</div>" +
                    "<div class='msg'>" + mess + "</div></div>"+
                    "</div>";
                history.innerHTML += html;
            }
        }
    };
    xhttp.open("GET", "getHistory.php?channel=" + selected.substring(1), true);
    xhttp.send();

}

function search() {
    var search = document.getElementById("usr").value;
    var searchContent = document.getElementById("searchContent");
    var content = document.getElementById("content");

    searchContent.style.display = "block";
    content.style.display = "none";
    searchContent.innerHTML= "";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            for (var i = 0; i < data.length; i++) {
                var time = data[i]["day"];
                var sender = data[i]["username"];
                var mess = data[i]["message"];
                var url= iconUrl[sender];

                var html = "<div class='media'>" +
                    "<img src="+url+" class='media-object' style='width:60px'>" +
                    "<div class='media-body message'>" +
                    "<div class='media-heading username'>" + sender + "</div>"+
                    "<div class= 'time'> Posted on " + time + "</div>" +
                    "<div class='msg'>" + mess + "</div></div>"+
                    "</div>";

                html = html.replace(search, "<strong style='color:red;'><i>" + search + "<i/></strong>");
                searchContent.innerHTML += html;
            }
        }
    };
    xhttp.open("GET", "searchContent.php?search=" + search, true);
    xhttp.send();
}