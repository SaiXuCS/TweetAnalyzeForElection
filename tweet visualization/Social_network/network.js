		var nodes;
		var edges;
		var messages;

		var selected_channel;
		var startDate;
		var endDate;

		var clickStartDate;
		var clickEndDate;

		var clickStartIndex;
		var clickEndIndex;

		function initialize() {
		    var channel_data = channels_data;
		    var navbar = document.getElementById("navbar_list");



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
		            getDateChannel();
		            event.target.parentNode.className += " active";
		        });
		    }

		}




		function formBarChart(date, frequency) {
		    var infoPanel = document.getElementById("infoPanel");
		    infoPanel.style.display = "block";

		    var tickX = 0;
		    if (date.length < 10) {
		        tickX = 10;
		    } else if (date.length < 20) {
		        tickX = 20;
		    } else {
		        tickX = 30;
		    }
		    var tickY = 0;
		    for (var i = 0; i < frequency.length; i++) {
		        frequency[i] = parseInt(frequency[i]);
		    }
		    var maxY = d3.max(frequency);
		    if (maxY < 10) {
		        tickY = 6;
		    } else if (maxY < 20) {
		        tickY = 5;
		    } else {
		        tickY = 4;
		    }
		    var width = 800;
		    var height = 300;
		    var padding = { top: 20, right: 20, bottom: 20, left: 20 };
		    var svg = document.getElementsByTagName("svg")[0];
		    if (svg) {
		        svg.parentNode.removeChild(svg);
		    }
		    var main = d3.select("#graphPanel")
		        .append("svg")
		        .attr("width", width)
		        .attr("transform", "translate(" + padding.top + ',' + padding.left + ')')
		        .attr("height", height);
		    var format = d3.time.format("%m-%d-%Y");

		    var xScale = d3.time.scale()
		        .domain([format.parse(date[0]), format.parse(date[date.length - 1])])
		        .range([10, width - padding.left - padding.right - 10]);
		    // 定义y轴的比例尺(线性比例尺)
		    var yScale = d3.scale.linear()
		        .domain([0, d3.max(frequency)])
		        .range([height - padding.top - padding.bottom, 0]);
		    // 定义x轴和y轴
		    var xAxis = d3.svg.axis()
		        .scale(xScale)
		        .orient('bottom')
		        .ticks(tickX)
		        .tickFormat(d3.time.format("%m-%d"));
		    var yAxis = d3.svg.axis()
		        .scale(yScale)
		        .orient('left')
		        .ticks(tickY);
		    // 添加坐标轴元素

		    main.append('g')
		        .attr('class', 'axis')
		        .attr('transform', 'translate(20,' + (height - padding.bottom - padding.top + 20) + ')')
		        .call(xAxis);
		    main.append('g')
		        .attr('class', 'axis')
		        .attr('transform', 'translate(23,20)')
		        .call(yAxis);


		    var rectMargin = 10;
		    // 添加矩形
		    main.selectAll('.bar')
		        .data(date)
		        .enter()
		        .append('rect')
		        .attr('class', 'bar')
		        .attr('x', function(d, i) {
		            return xScale(format.parse(date[i]));
		        })
		        .attr('y', function(d, i) {
		            return yScale(frequency[i]);
		        })
		        .attr('width', rectMargin)
		        .attr('height', function(d, i) {
		            return height - padding.top - padding.bottom - yScale(frequency[i]);
		        })
		        .on("click", function(d, i) {
		            d3.select(this).attr("fill", "red");
		            if (clickStartDate == null) {
		                clickStartDate = d;
		                clickStartIndex = i;
		            } else if (clickEndDate == null) {
		                clickEndDate = d;
		                clickEndIndex = i;
		                if (clickStartIndex > clickEndIndex) {
		                    var temp = clickStartIndex;
		                    clickStartIndex = clickEndIndex;
		                    clickEndIndex = temp;

		                    var temp = clickStartDate;
		                    clickStartDate = clickEndDate;
		                    clickEndDate = temp;
		                }
		                if (clickStartIndex != null && clickEndIndex != null) {
		                    d3.selectAll('.bar')
		                        .attr('fill', function(d, i) {
		                            if (i >= clickStartIndex && i <= clickEndIndex) {
		                                return "red";
		                            } else {
		                                return "steelblue";
		                            }
		                        });
		                } else {
		                    alert("error index");
		                }
		            } else {
		                clickStartDate = d;
		                clickStartIndex = i;
		                clickEndIndex = null;
		                clickEndDate = null;
		            }
		        })
		        .attr('transform', 'translate(15,20)')
		        .attr('fill', "steelblue");
		}

		function getDateChannel() {
		    var svgs = document.getElementsByTagName("svg");
		    for (var i = 0; i < svgs.length; i++) {
		        var svg = svgs[i];
		        if (svg) {
		            svg.parentNode.removeChild(svg);
		        }
		    }
		    var xhttp = new XMLHttpRequest();
		    var date = [];
		    xhttp.onreadystatechange = function() {
		        if (this.readyState == 4 && this.status == 200) {
		            var data = JSON.parse(this.responseText);
		            for (var i = 0; i < data.length; i++) {
		                date.push(data[i]);

		            }
		            getFrequency(date);
		        }
		    };
		    xhttp.open("GET", "getDateByChannel.php?channel=" + selected_channel, true);
		    //xhttp.open("GET", "getNodeLink.php?channel="+selected_channel+"&start="+start+"&end="+end, true);
		    xhttp.send();
		}

		function getFrequency(date) {
		    var xhttp = new XMLHttpRequest();
		    var frequency = [];
		    xhttp.onreadystatechange = function() {
		        if (this.readyState == 4 && this.status == 200) {
		            var data = JSON.parse(this.responseText);
		            for (var i = 0; i < data.length; i++) {
		                frequency.push(data[i]);

		            }
		            formBarChart(date, frequency);
		        }
		    };
		    xhttp.open("GET", "getFrequencyByChannel.php?channel=" + selected_channel, true);
		    //xhttp.open("GET", "getNodeLink.php?channel="+selected_channel+"&start="+start+"&end="+end, true);
		    xhttp.send();
		}


		function check_network2() {
		    var xhttp = new XMLHttpRequest();
		    xhttp.onreadystatechange = function() {
		        if (this.readyState == 4 && this.status == 200) {
		            var data = JSON.parse(this.responseText);
		            nodes = data.nodes;
		            edges = data.links;
		            messages = data.messages;
		            var svg = document.getElementsByTagName("svg")[1];
		            if (svg) {
		                svg.parentNode.removeChild(svg);
		            }
		            showGraph();
		        }
		    };
		    xhttp.open("GET", "getArrowNodeLink.php?channel=" + selected_channel + "&start=" + clickStartDate + "&end=" + clickEndDate, true);
		    xhttp.send();
		}


		function check_network3() {
		    var xhttp = new XMLHttpRequest();
		    xhttp.onreadystatechange = function() {
		        if (this.readyState == 4 && this.status == 200) {
		            var data = JSON.parse(this.responseText);
		            nodes = data.nodes;
		            edges = data.links;
		            messages = data.messages;
		            var svg = document.getElementsByTagName("svg")[1];
		            if (svg) {
		                svg.parentNode.removeChild(svg);
		            }
		            showGraph();
		        }
		    };
		    xhttp.open("GET", "getExplicitArrow.php?channel=" + selected_channel + "&start=" + clickStartDate + "&end=" + clickEndDate, true);
		    xhttp.send();
		}

		function showGraph() {

		    var width = 650;
		    var height = 550;
		    var svg = d3.select("#directedPanel")
		        .append("svg")
		        .attr("width", width)
		        .attr("height", height);

		    var force = d3.layout.force()
		        .nodes(nodes)
		        .links(edges)
		        .size([width, height])
		        .on("tick", tick)
		        .linkDistance(200)
		        .charge(-600);

		    force.start();

		    var color = d3.scale.category20();


		    // build the arrow.
		    svg.append("svg:defs").selectAll("marker")
		        .data(["end"]) // Different link/path types can be defined here
		        .enter().append("svg:marker") // This section adds in the arrows
		        .attr("id", String)
		        .attr("viewBox", "0 -5 10 10")
		        .attr("refX", 15)
		        .attr("refY", -1.5)
		        .attr("markerWidth", 6)
		        .attr("markerHeight", 6)
		        .attr("orient", "auto")
		        .append("svg:path")
		        .attr("d", "M0,-5L10,0L0,5");

		    // add the links and the arrows
		    var pg = svg.append("svg:g").selectAll("path")
		        .data(force.links())
		        .enter().append("g");

		    var path = pg.append("path")
		        .attr("class", "link")
		        .attr("marker-end", "url(#end)");

		    path.on("click", function(d, i) {
		        //alert(JSON.stringify(d, null, 4));
		        var sendName = d.source.name;
		        var receName = d.target.name;
		        var tb = document.getElementById("communicationBody");
		        tb.innerHTML = "";
		        var num = 0;
		        for (var i = 0; i < messages.length; i++) {
		            var me = messages[i];
		            if (me.sender == sendName && me.receiver == receName) {
		                num++;
		                var con = me.message;
		                var da = me.day;
		                var html = "<tr><td>" + num + "</td><td>" + sendName + "</td><td>" + receName + "</td><td>" + con + "</td><td>" + da + "</td></tr>";
		                tb.innerHTML += html;
		            }
		        }
		    });

		    // define the nodes
		    var node = svg.selectAll(".node")
		        .data(force.nodes())
		        .enter().append("g")
		        .attr("class", "node")
		        .call(force.drag);

		    // add the nodes
		    node.append("circle")
		        .attr("r", function(d, i) {
		            if (d.weight == 0) {
		                return 0;
		            }
		            if (d.weight < 5) {
		                return 2;
		            } else if (d.weight < 10) {
		                return 4;
		            } else if (d.weight < 18) {
		                return 6;
		            } else {
		                return 8;
		            }
		        });

		    node.on("click", function(d, i) {
		        alert("People send message: " + d.weight);
		    });

		    // add the text 
		    node.append("text")
		        .attr("x", 12)
		        .attr("dy", ".35em")
		        .text(function(d) { return d.name; });

		    // add the curvy lines
		    function tick() {
		        path.attr("d", function(d) {
		            var dx = d.target.x - d.source.x,
		                dy = d.target.y - d.source.y,
		                dr = Math.sqrt(dx * dx + dy * dy);
		            return "M" +
		                d.source.x + "," +
		                d.source.y + "A" +
		                dr + "," + dr + " 0 0,1 " +
		                d.target.x + "," +
		                d.target.y;
		        });

		        node.attr("transform", function(d) {
		                return "translate(" + d.x + "," + d.y + ")";
		            });

		    }
		}







		/*
		function check_network1() {
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
		            var svg = document.getElementsByTagName("svg")[1];
		            if (svg) {
		                svg.parentNode.removeChild(svg);
		            }
		            showGraph();
		        }
		    };
		    xhttp.open("GET", "getNodeLink.php?channel=" + selected_channel + "&start=" + clickStartDate + "&end=" + clickEndDate + "&type=explicit", true);
		    xhttp.send();
		}

		function check_network2() {
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
		            var svg = document.getElementsByTagName("svg")[1];
		            if (svg) {
		                svg.parentNode.removeChild(svg);
		            }
		            showGraph();
		        }
		    };
		    xhttp.open("GET", "getNodeLink.php?channel=" + selected_channel + "&start=" + clickStartDate + "&end=" + clickEndDate + "&type=implicit", true);
		    xhttp.send();
		}

		function showGraph() {
		    var width = 900;
		    var height = 600;

		    var svg = d3.select("body")
		        .append("svg")
		        .attr("width", width)
		        .attr("height", height);

		    var force = d3.layout.force()
		        .nodes(nodes) //指定节点数组
		        .links(edges) //指定连线数组
		        .size([width, height]) //指定范围
		        .linkDistance(200) //指定连线长度
		        .charge(-350); //相互之间的作用力

		    force.start(); //开始作用

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

		        //更新节点坐标
		        svg_nodes.attr("cx", function(d) { return d.x; })
		            .attr("cy", function(d) { return d.y; });

		        //更新文字坐标
		        svg_texts.attr("x", function(d) { return d.x; })
		            .attr("y", function(d) { return d.y; });

		        /*
		        linkText.attr("x", function(d){return d.x; })
		        		.attr("y", function(d){return d.y;});
		        	
		        linkText
		            .attr("x", function(d) {
		                return ((d.source.x + d.target.x) / 2);
		            })
		            .attr("y", function(d) {
		                return ((d.source.y + d.target.y) / 2);
		            });
		    });
		}

		*/