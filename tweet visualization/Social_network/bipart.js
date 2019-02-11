var nodes;
var edges;
var startDate;
var endDate;
var selected_channel;

function initialize() {
    var channel_data = channels_data;
    var navbar = document.getElementById("navbar_list");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            var start = document.getElementById("start_date");
            var end = document.getElementById("end_date");
            for (var i = 0; i < data.length; i++) {
                var option1 = document.createElement("option");
                var option2 = document.createElement("option");
                option1.innerHTML = data[i].day;
                option1.value = data[i].day;
                option2.innerHTML = data[i].day;
                option2.value = data[i].day;
                start.append(option1);
                end.append(option2);
            }
        }
    };
    xhttp.open("GET", "getDate.php", true);
    xhttp.send();

    for (var i = 0; i < channel_data.length; i++) {
        var channel = channel_data[i];
        var channel_name = channel.name;
        var list = document.createElement("li");
        list.innerHTML = "<a>" + channel_name + "</a>";
        navbar.append(list);
        list.addEventListener("click", function(event) {
            var lists = navbar.getElementsByTagName("li");
            for (var i = 0; i < lists.length; i++) {
                lists[i].className = "";
            }
            selected_channel = event.target.innerHTML;
            event.target.parentNode.className += " active";
        });
    }
}

function check_network() {
    var e1 = document.getElementById("start_date");
    var e2 = document.getElementById("end_date");
    startDate = e1.options[e1.selectedIndex].value;
    endDate = e2.options[e2.selectedIndex].value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            nodes = data.nodes;
            edges = data.links;
            showGraph();
        }
    };
    //xhttp.open("GET", "getBiNodeLink.php", true);
    xhttp.open("GET", "getBiNodeLink.php?channel=" + selected_channel + "&start=" + startDate + "&end=" + endDate, true);
    xhttp.send();
}

function showGraph() {
    var width = 960,
        height = 800;

    var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var force = d3.layout.force()
        .nodes(nodes) //指定节点数组
        .links(edges) //指定连线数组
        .size([width, height]) //指定范围
        .linkDistance(600) //指定连线长度
        .charge(-300); //相互之间的作用力

    force.start(); //开始作用

    console.log(nodes);
    console.log(edges);


    var color = d3.scale.category20();

    //添加节点          
    var svg_nodes = svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", 20)
        .style("fill", function(d, i) {
            return color(i);
        })
        .call(force.drag); //使得节点能够拖动

    //添加描述节点的文字

    var svg_texts = svg.selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .style("fill", "black")
        .attr("dx", 20)
        .attr("dy", 8)
        .text(function(d) {
            return d.name;
        });

    var svg_edges = svg.selectAll(".link")
        .data(edges)
        .enter()
        .append("g")
        .attr('class', 'link')
        .append("line")
        .style("stroke", "#ccc")
        .style("stroke-width", 1);

    var linkText = svg.selectAll(".link")
        .append("text")
        .attr("class", "link-label")
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .attr("fill", "Black")
        .style("font", "normal 12px Arial")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.weight; });



    force.on("tick", function() { //对于每一个时间间隔

        //更新连线坐标
        svg_edges.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        svg_texts.attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });


        svg_nodes.attr("transform", function(d) {
            var x = d.x,
                y = d.y;
            if (x > 300 && d.group == 'tuple') {
                x = 300
                d.x = x
            }
            if (x < 500 && d.group == 'pattern') {
                x = 500
                d.x = x
            }

            return "translate(" + x + "," + y + ")";
        });

        linkText
            .attr("x", function(d) {
                return ((d.source.x + d.target.x) / 2);
            })
            .attr("y", function(d) {
                return ((d.source.y + d.target.y) / 2);
            });
    });
}