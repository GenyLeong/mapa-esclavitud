$(document).ready(function() {
      var width = window.innerWidth;
      var height = window.innerHeight;

      $("ul li").click(function() {
          $("ul li").removeClass("li-active");
            $(this).addClass("li-active")
      })

      $('.smooth').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1100);
                return false;
            }
        }
    });

      d3.json("./data/esclavitud.json", function(json) {
            console.log(json)

              var vis_scale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([30, width/5]);

              var vis_scale_pme = d3.scaleLinear()
                    .domain([Math.round(d3.min(json, function(d) { return d.PME; })), Math.round(d3.max(json, function(d) { return d.PME; }))])
                    .range([30, width/4]);

              var vis_scale_ppme = d3.scaleLinear()
                    .domain([Math.round(d3.min(json, function(d) { return d.PPME*2; })), Math.round(d3.max(json, function(d) { return d.PPME*2; }))])
                    .range([30, 160]);

              if (width<768) {
                var vis_scale_ppme = d3.scaleLinear()
                      .domain([Math.round(d3.min(json, function(d) { return d.PPME*2; })), Math.round(d3.max(json, function(d) { return d.PPME*2; }))])
                      .range([15, 80]);
              }

              var vis_scale_pob = d3.scaleLinear()
                    .domain([Math.round(d3.min(json, function(d) { return d.POB; })), Math.round(d3.max(json, function(d) { return d.POB; }))])
                    .range([20, 200]);


            var vis;
            var p = d3.select('#reporte')
            .append("div")
            .attr('class', 'dropdown')

            vis = p
              .selectAll('p')
              .data(json).enter()
              .append('p')
              .attr("class", "items")
              .text(function(d) {
                return (d.ID)
              })
              .on("click", cuadro)
              .append('img')
              .attr('src', function(d) { return "./images/" + d.img; })

              if(width<768){
                $('#reporte-add').html("").css({
                  "left": width/2,
                  "top":height/2 + 100,
                  "transform": "translate(-50%, -50%)"
                })
              };

              if(width<500){
                $('#reporte-add').html("").css(
                  "top", height/2
                );
              };

              function cuadro(d){

                          console.log(d.ID)

                          $("#reporte-add").css("visibility", "visible").html("<p class='close'><i class='fa fa-times' aria-hidden='true'></i></p><p><img class='image-map' src='./images/" +
                          d.img + "'></p>" +"<p class='id'>"+d.ID + "</p><p class='vdpys'> Porcentaje de Vulnerabilidad <br>de derechos y seguridad: "+(d.VDPYS) +
                          "%</p><p class='pob'>Población total: "+ (d.POB).toLocaleString() +"</p><p class='pme'>Población estimada en esclavitud moderna: "+(d.PME).toLocaleString() + "</p><p class='ppme'>Porcentaje de la población que representa: "+ (d.PPME).toFixed(2)+ "%</p><p class='rdj'>Personas sentenciadas por trata de personas: " + d.CTP + "</p><p class='rm'>Casos reportados por la justicia: " + d.CRJ + "</p><p class='rc'>Principal destino de las víctimas: " + d.DV + "</p>")

                          $(".close").click(function(){
                                $("#reporte-add").css("visibility", "hidden")
                          })
              }

            d3.select('#VDPYS').on('click', function() {
              $("#only-start").html("<a class='reload'>Volver</a>").click(function(){
                    location.reload(true)
              })
              $(".flexsearch").css("display", "none")
              $(".reporte-vdpys").css("display", "block")
              $(".reporte-pme").css("display", "none")
              $('#reporte').html("<div class='chart-example' id='chart'><svg></svg></div>").css({
                "width": "45%",
                "float": "left"
              });
              $('#reporte-add').html("").css({
                "textAlign": "center",
                "float": "left",
                "display":"block"
              });

              if (width<768){
                  $("#reporte").css("float", "none")
                  $('#reporte-add').html("").css({
                    "position": "absolute",
                    "float": "none",
                    "width":"277px",
                    "zIndex": "9999",
                    "transform": "translate(-50%, -50%)",
                    "top": height/2 + 100,
                    "left": width/2,
                    "visibility": "visible",
                    "height": "auto",
                    "backgroundColor": "rgba(0, 0, 0, 0.79)",
                    "color": "white",
                    "padding": "0px",
                    "textAlign":"left"
                  });
                }

              // if(width<500){
              //   $('#reporte-add').html("").css(
              //     "top", height/2
              //   );
              // }

              $('#reporte li').remove();


              d3.json("./data/esclavitud.json", function(data) {
                  var chart = bubbleChart().width(width).height(400);
                  console.log(width)
                  if(width<768){
                    var chart = bubbleChart().width(width-30).height(350);
                  }
                  d3.select('#chart').data(data).call(chart);
              });

              function bubbleChart() {
                    var width = width/2,
                        height = height/2,
                        maxRadius = 5

                    function chart(p) {
                        var data = p.enter().data();
                        var div =  p,
                            svg = div.selectAll('svg');
                        svg.attr('width', width).attr('height', height)

                        var simulation = d3.forceSimulation(json)
                            .force("link", d3.forceLink().id(function(d) { return d.VDPYS }))
                            .force("charge", d3.forceManyBody().strength([-15]))
                            // .force("collide",d3.forceCollide( function(d){return d.VDPYS }).iterations(1) )
                            .force("x", d3.forceX(width/24).strength(0.01999))
                            .force("y", d3.forceY(height/24).strength(0.01999))
                            .on("tick", ticked);

                        function ticked(e) {
                            node.attr("cx", function(d) {
                                    return d.x;
                                })
                                .attr("cy", function(d) {
                                    return d.y;
                                });
                        }

                        var scaleRadius = d3.scaleLinear().domain([d3.min(json, function(d) {
                              return +d.VDPYS;
                          }), d3.max(json, function(d) {
                              return +d.VDPYS;
                          })]).range([3, 20])

                          var defs = svg.selectAll('svg')
                          .data(json)
                          .enter()
                          .append('svg:defs')

                          defs
                          .append('svg:pattern')
                            .attr('id', function(d) { return (d.CC);})
                            .attr('width', 1)
                            .attr('height', 1)
                            .attr('patternContentUnits', 'objectBoundingBox')
                            .append('svg:image')
                              .attr('xlink:xlink:href', function(d) { return ("./images/" + d.imgcircle)})
                              .attr("x", 0)
                              .attr("y", 0)
                              .attr('width', 1.1)
                              .attr('height', 1.1)
                          .attr("preserveAspectRatio", "xMinYMin slice")

                          var node = svg.selectAll("circle")
                              .data(json)
                              .enter()
                              .append("circle")
                              .classed('directory', function(d) { return (d._children || d.children) ? 1 : 0; })
                              .attr('r', function(d) {
                                  return scaleRadius(d.VDPYS)
                              })
                              .style("cursor", "pointer")
                              .style("fill", function(d) { return ("url(#"+d.CC+")");})
                              .attr('transform', 'translate(' + [width / 2, height / 2] + ')')
                              .on("click", function(d){

                                if(width<768){
                                      $('#reporte-add').css(
                                        "padding", "1rem"
                                      )
                                }

                                $("circle").removeClass("circle-active");
                                var active = d3.select(this)
                                active
                                  .classed("circle-active", 1)
                                cuadro(d)

                                $(".vdpys").css({
                                  "backgroundColor": "#ff0",
                                  "color": "#000",
                                  "textShadow":"none",
                                  "margin": ".7rem auto",
                                  "width": "60%"
                                })

                              })


                              node.exit().remove();

                      }

                    chart.width = function(value) {
                        if (!arguments.length) {
                            return width;
                        }
                        width = value;
                        return chart;
                    };

                    chart.height = function(value) {
                        if (!arguments.length) {
                            return height;
                        }
                        height = value;
                        return chart;
                    };

                    return chart;
                }
            })


            d3.select('#PME').on('click', function() {
              $(".flexsearch").css("display", "none")
              $('#reporte').html("<p></p>").css("width", "47%");
              $("#only-start").html("<a class='reload'>Volver</a>").click(function(){
                    location.reload(true)
              })
              $(".reporte-vdpys").css("display", "none")
              $(".reporte-pme").css("display", "block")
              $('#reporte li').remove();
              $("#reporte").append("<li id='PPME'>Filtrar por porcentaje</li>")

              $('#reporte-add').html("").css({
                "width": "45%",
                "display": "none"
              });

              if (width<768){
                $('#reporte').css({
                  "float": "left",
                  "left": "0%"
                });
                $("#reporte-add").css({
                  "transform": "none",
                  "width": "50%"
                })
              }

              var p = d3.select('#reporte')
              .append("div")

              vis = p
                .selectAll('.country')
                .data(json).enter()
                .append('p')
                .classed("country", function(d) { return (d.PME).toLocaleString() })
                .sort(function(a,b){
                  return d3.descending(a.PME, b.PME);
                })
                .text(function(d){
                  return (d.ID)
                })

                var vis_datos = vis
                  .append("p").attr("class", "datos")
                  .style("opacity", function(d) {
                  if (d.PME > 100001) { return 1; } else if (d.PME > 10000) { return 0.7; } else { return 0.4; };
                })
                  .text(function(d){
                    return (d.PME).toLocaleString()
                  })
                  .transition()
                  .style("width", function(d){return vis_scale_pme(d.PME) + "px"})

                  d3.select('#PPME').on('click', function(d){
                    $("#reporte").css("float", "left")
                    $("#only-start").html("<a class='reload'>Volver</a>").click(function(){
                          location.reload(true)
                    })
                    $('#reporte-add').html("").css("display", "block");
                    $(".country").removeClass("active");

                    var p = d3.select('#reporte-add')
                            // .style("height", "800px")
                            .style("float", "left")
                            .style("top", "22px")
                            .style("margin-top", "35px")
                            .style("text-align", "left")


                    if(width<768) {
                      p
                      .style("position", "relative")
                      .style("visibility", "visible")
                      .style("color", "black")
                      .style("top", "56px")
                      .style("left", "-1rem")
                      .style("background-color", "transparent")
                      .style("text-shadow", "none")
                      .style("padding", "0")
                      .style("text-align", "left")
                      .style("margin-top", "0px")
                      // .style("height", "800px")
                  }

                  if(width<500) {
                      p
                      .style("top", "54px")
                      .style("left", "0rem")
                  }

                    vis = p
                      .selectAll('.country')
                      .data(json).enter()
                      .append('p')
                      .classed("country", function(d) { return d.PPME })
                      .sort(function(a,b){
                        return d3.descending(a.PPME, b.PPME);
                      })
                      .text(function(d){
                        return (d.ID)
                      })

                    var vis_datos = vis
                      .append("p").attr("class", "datos")
                      .style("opacity", function(d) {
                      if (d.PPME > 0.7) { return 1; } else if (d.PPME > 0.4) { return 0.7; } else { return 0.4; };
                    })
                      .text(function(d){
                        return (d.PPME).toFixed(2) + "%"
                      })
                      .transition()
                      .style("width", function(d){return vis_scale_ppme(d.PPME) + "px"})

                  })
            })

            d3.select('#RDJ').on('click', function() {
              $(".reporte-vdpys").css("display", "none")
              $(".reporte-pme").css("display", "none")
              $(".flexsearch").css("display", "none")
              $('#reporte').html("<p class='reporte-add'><span><i class='fa fa-info-circle' aria-hidden='true' style='margin-right:7px'></i></span>Realizado con el <a href='http://www.unodc.org/documents/data-and-analysis/glotip/Glotip16_Country_profile_South_America.pdf' target='_blank'> reporte de trata de personas 2016</a> de la ONU en donde se registra casos detectados entre 2012 y 2015. En el gráfico, los países con reporte más reciente registran, en promedio, más procesos judiciales. También está disponible el <a href='https://www.state.gov/documents/organization/271339.pdf' target='_blank'>reporte de tráfico de personas 2017</a> realizado por el gobierno de EE.UU. De acuerdo a este, apenas Puerto Rico, Guyana, Colombia y Chile cumplen totalmente con las normas mínimas de Ley de Protección a las Víctimas de la Trata.</p><div id='chart'></div>")
                .css({
                  "width": "100%",
                  "float":"none"
                })

              $("#only-start").html("<a class='reload'>Volver</a>").click(function(){
                    location.reload(true)
              })

              $("#reporte-add")
                  .html("")
                  .css(
                          // "float": "none",
                          // "marginTop": "1rem",
                          // "height": "200px",
                          // "textAlign":"center"
                          "display", "none"
                  )

                if (width<768){
                  $('#reporte').css("left", "-3%")

                  $("#reporte-add").css({
                  "position": "relative",
                  "width": "277px",
                  "zIndex": "9999",
                  "top": "-20px",
                  "left": "0px",
                  "color": "black",
                  "visibility": "visible",
                  "backgroundColor": "transparent",
                  "textShadow": "none",
                  "transform": "none",
                  "textAlign": "center"
                  })
                }

              var chart = bb.generate({
                  data: {
                    columns: [
                	["Casos reportados por tráfico de personas", 1688, 8310, 1013, 13, 707, 37, 15, 234, 582, 38, 395, 1857, 10, 8, 12, 74, 18, 22, "undefined", "undefined", 106, 57, 21, 818, 80],
                  ["Personas sentenciadas por tráfico de personas", 27, 259, 74, 2, 254, 15, 7, 39, 57, 8, 74, 15, "undefined", 11, "undefined", 16, 53, 30, 15, 4, 47, 9, "undefined", 77, 36],
                  ["Víctimas identificadas por tráfico de personas", 2107, 1613, 6386, 39, 567, 59, 186, 558, 546, 33, 425, 1921, "undefined", 180, 67, 213, 38, 27, 113, 11, 198, 93, 23, 1186, 872],
                  ["Último año reportado", 2015, 2015, 2013, 2013, 2015, 2015, 2014, 2015, 2014, 2015, 2015, 2015, 2013, 2015, 2014, 2015, 2013, 2013, 2015, 2013, 2015, 2014, 2015, 2015, 2015]
                ],
                type: "line",
                types: {
                    "Casos reportados por tráfico de personas":"line",
                    "Personas sentenciadas por tráfico de personas": "line",
                    "Víctimas identificadas por tráfico de personas": "line",
                    "Último año reportado": "scatter"
                },
                colors: {
                    "Casos reportados por tráfico de personas": "#E05D5F",
                    "Personas sentenciadas por tráfico de personas": "#FE9D65",
                    "Víctimas identificadas por tráfico de personas": "#8DD1A9"
                }
                },
                "tooltip": {
                  "grouped": true,
                    width:80
                },
                  legend: {
                  show: false
                  },
                  axis: {
                    "x": {
                      "type": "category",
                      "tick": {
                        "rotate": -45,
                        "multiline": false
                      },
                      "height": 80,
                      "categories": [
                        "Perú",
                        "Argentina",
                        "Brazil",
                        "Jamaica",
                        "Mexico",
                        "Costa Rica",
                        "Chile",
                        "Paraguay",
                        "Ecuador",
                        "Panamá",
                        "El Salvador",
                        "Bolivia",
                        "Bárbados",
                        "Honduras",
                        "Haití",
                        "Venezuela",
                        "Suriname",
                        "Cuba",
                        "Uruguay",
                        "Guyana",
                        "Colombia",
                        "Nicaragua",
                        "Trinidad y Tobago",
                        "Guatemala",
                        "Rep. Dominicana"
                      ]
                    }
                  },
                  point:   {
                      r:3
                  },
                  resize: {
                    auto:true,
                  },
                  onrendered: function onrendered(){
                      console.log("resizeeeeeee")
                      var circle_report = d3.selectAll("svg").selectAll(".bb-circles-Último-año-reportado")

                      circle_report_svg = circle_report.selectAll("g")
                      .data(json)
                      .enter()
                      .append('g:defs')

                      circle_report_svg
                      .append('g:pattern')
                      .attr('id', function(d) { return (d.CC);})
                      .attr('width', 1)
                      .attr('height', 1)
                      .attr('patternContentUnits', 'objectBoundingBox')
                      .append('g:image')
                      .attr('xlink:xlink:href', function(d) { return ("./images/" + d.imgcircle)})
                      .attr("x", 0)
                      .attr("y", 0)
                      .attr('width', 1.1)
                      .attr('height', 1.1)
                      .attr("preserveAspectRatio", "xMinYMin slice")

                      var node_report = circle_report.selectAll("circle")
                      .data(json)
                      .style("fill", function(d) { return ("url(#"+d.CC+")");})
                      .style("opacity", 1)
                  },
                  bindto: "#chart"
              });

              $("#chart").css("left", "-3%")
          })


            d3.select('#RM').on('click', function() {
              $(".reporte-vdpys").css("display", "none")
              $(".reporte-pme").css("display", "none")
              $(".flexsearch").css("display", "block")
              $('#reporte').html(
                "<p class='reporte-add'><span><i class='fa fa-info-circle' aria-hidden='true' style='margin-right:7px'></i></span> Estos datos pertenecen únicamente al último reporte de la ONU y buscan ser un indicativo general de cuál es el perfil de las víctimas de trata. Los perfiles que no aparecen en la distribución no tienen data especificada. Los países que no reportaron perfiles son Brazil, Honduras, Haití, Suriname, Guyana, Nicaragua y Guatemala</p><div class='flexsearch v-center'><div class='flexsearch--wrapper'><form class='flexsearch--form' action='#' method='post'><div class='flexsearch--input-wrapper'><input class='flexsearch--input' type='search' placeholder='Buscar país' id='search'></div></form></div></div><div id='box-piechart'><div id='chart_c1' class='bb-circle box-piechart'></div><div id='chart_c2' class='bb-circle box-piechart'></div><div id='chart_c3' class='bb-circle box-piechart'></div><div id='chart_c4' class='bb-circle box-piechart'></div><div id='chart_c5' class='bb-circle box-piechart'></div><div id='chart_c6' class='bb-circle box-piechart'></div><div id='chart_c7' class='bb-circle box-piechart'></div><div id='chart_c8' class='bb-circle box-piechart'></div><div id='chart_c9' class='bb-circle box-piechart'></div><div id='chart_c10' class='bb-circle box-piechart'></div><div id='chart_c11' class='bb-circle box-piechart'></div><div id='chart_c12' class='bb-circle box-piechart'></div><div id='chart_c13' class='bb-circle box-piechart'></div><div id='chart_c14' class='bb-circle box-piechart'></div><div id='chart_c15' class='bb-circle box-piechart'></div><div id='chart_c16' class='bb-circle box-piechart'></div><div id='chart_c17' class='bb-circle box-piechart'></div><div id='chart_c18' class='bb-circle box-piechart'></div></div>")
                .css("width", "100%")
              $("#only-start").html("<a class='reload'>Volver</a>").click(function(){
                    location.reload(true)
              })

              $("#reporte-add").html("").css("zIndex", "-9999")

              var chart_c1 = bb.generate({
                size: {
                },
              "data": {
                "columns": [
                    ["Mano de obra", 61],
                    ["Explotación sexual", 273],
                    ["Servidumbre doméstica", 3],
                    ["Otros fines", 7]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Mano de obra": "#FE9D65",
                  "Servidumbre doméstica": "#8DD1A9",
                  "Otros fines": "#8EB5CB"
                }
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
              "type": "category",
              "categories": ["Perú (2014)"]
              },
                y: {
                  show: false,
                  max:529,
                  min:42
                }
              },
              legend: {
                show: false
              },
              bar: {
                width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              // onrendered: function onrendered(){
              //   d3.select(".bb-axis-x")
              //     .attr("transform", "translate(0,145)")
              // },
              "bindto": "#chart_c1"
            });

            document.getElementsByClassName("bb-tooltip-container")[0].innerHTML = "<table class='bb-tooltip'><tbody><tr class='bb-tooltip-name-Explotación-sexual'><td class='name'><span style='background-color:#E05D5F'></span>Explotación sexual</td><td class='value'>79.4%</td></tr></tbody></table>"

            var chart_c2 = bb.generate({
              size: {
              },
              "data": {
                "columns": [
            	       ["Explotación sexual", 105],
                     ["Mano de obra", 138]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Mano de obra": "#FE9D65"
                }
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
                  "type": "category",
                  "categories": ["Argentina (2015)"]
                },
                y: {
                  show: false,
                  max:529,
                  min:42
                }
              },
              legend: {
                show: false
              },
              bar: {
                 width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              "bindto": "#chart_c2"
            });

            var chart_c3 = bb.generate({
              size: {
              },
              "data": {
                "columns": [
            	       ["Explotación sexual", 4],
                     ["Mano de obra", 1]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Mano de obra": "#FE9D65"
                }
              },
              legend: {
                show: false
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
                  "type": "category",
                  "categories": ["Jamaica (2013)"]
                },
                y: {
                  show: false,
                  max:529,
                  min:42
                }
              },
              legend: {
                show: false
              },
              bar: {
                 width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              "bindto": "#chart_c3"
            });

            var chart_c4 = bb.generate({
              size: {
              },
              "data": {
                "columns": [
            	       ["Explotación sexual", 49],
                     ["Mano de obra", 48]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Mano de obra": "#FE9D65"
                }
              },
              legend: {
                show: false
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
                  "type": "category",
                  "categories": ["Mexico (2015)"]
                },
                y: {
                  show: false,
                  max:529,
                  min:42
                }
              },
              legend: {
                show: false
              },
              bar: {
                 width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              "bindto": "#chart_c4"
            });

            var chart_c5 = bb.generate({
              size: {
              },
              "data": {
                "columns": [
            	       ["Explotación sexual", 9],
                     ["Mano de obra", 26],
                     ["Tráfico de órganos", 13],
                     ["Explotación sexual y mano de obra", 10],
                     ["Otros fines", 1]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Mano de obra": "#FE9D65",
                  "Tráfico de órganos": "#8DD1A9",
                  "Explotación sexual y mano de obra": "#7a679e",
                  "Otros fines": "#8EB5CB"
                }
              },
              legend: {
                show: false
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
                  "type": "category",
                  "categories": ["Costa Rica (2015)"]
                },
                y: {
                  show: false,
                  max:529,
                  min:42
                },
              },
              legend: {
                show: false
              },
              bar: {
                 width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              "bindto": "#chart_c5"
            });

            var chart_c6 = bb.generate({
              size: {
              },
              "data": {
                "columns": [
            	       ["Explotación sexual", 53],
                     ["Mano de obra", 134]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Mano de obra": "#FE9D65"
                }
              },
              legend: {
                show: false
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
                  "type": "category",
                  "categories": ["Chile (2014)"]
                },
                y: {
                  show: false,
                  max:529,
                  min:42
                }
              },
              legend: {
                show: false
              },
              bar: {
                 width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              "bindto": "#chart_c6"
            });

            var chart_c7 = bb.generate({
              size: {
              },
            "data": {
              "columns": [
          	       ["Explotación sexual", 61],
                   ["Mano de obra", 28]
              ],
              order : "asc",
              "type": "bar",
              colors: {
                "Explotación sexual": "#E05D5F",
                "Mano de obra": "#FE9D65",
                "Tráfico de órganos": "#8DD1A9",
                "Otros fines": "#8EB5CB"
              }
            },
            legend: {
              show: false
            },
            "tooltip": {
              "grouped": false
            },
            axis: {
              "x": {
                "type": "category",
                "categories": ["Paraguay (2015)"]
              },
              y: {
                show: false,
                max:529,
                min:42
              }
            },
            legend: {
              show: false
            },
            bar: {
               width:15
            },
            "interaction": {
              "inputType": {
                "touch": {
                  "preventDefault": true
                }
              }
            },
            "bindto": "#chart_c7"
          });

          var chart_c8 = bb.generate({
            size: {
            },
            "data": {
              "columns": [
          	       ["Explotación sexual", 529],
                   ["Pornografía", 121],
                   ["Mendicidad", 13],
                   ["Otros fines", 25]
              ],
              order : "asc",
              "type": "bar",
              colors: {
                "Explotación sexual": "#E05D5F",
                "Pornografía": "#7a679e",
                "Mendicidad": "#8DD1A9",
                "Otros fines": "#8EB5CB"
              }
            },
            legend: {
              show: false
            },
            "tooltip": {
              "grouped": false
            },
            axis: {
              "x": {
                "type": "category",
                "categories": ["Ecuador (2015)"]
              },
              y: {
                show: false,
                max:529,
                min:42
              }
            },
            legend: {
              show: false
            },
            bar: {
               width:15
            },
            "interaction": {
              "inputType": {
                "touch": {
                  "preventDefault": true
                }
              }
            },
            "bindto": "#chart_c8"
            });

            var chart_c9 = bb.generate({
              size: {
              },
              "data": {
                "columns": [
            	       ["Explotación sexual", 28],
                     ["Mano de obra", 14]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Mano de obra": "#FE9D65"
                }
              },
              legend: {
                show: false
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
                  "type": "category",
                  "categories": ["Panamá (2015)"]
                },
                y: {
                  show: false,
                  max:529,
                  min:42
                }
              },
              legend: {
                show: false
              },
              bar: {
                 width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              "bindto": "#chart_c9"
            });

            var chart_c10 = bb.generate({
              size: {
              },
              "data": {
                "columns": [
            	       ["Explotación sexual", 42],
                     ["Tráfico de órganos", 2]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Tráfico de órganos": "#8DD1A9"
                }
              },
              legend: {
                show: false
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
                  "type": "category",
                  "categories": ["El Salvador (2015)"]
                },
                y: {
                  show: false,
                  max:529,
                  min:42
                }
              },
              legend: {
                show: false
              },
              bar: {
                 width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              "bindto": "#chart_c10"
            });

            var chart_c11 = bb.generate({
              size: {
              },
            "data": {
              "columns": [
                   ["Explotación sexual", 10]
              ],
              order : "asc",
              "type": "bar",
              colors: {
                "Explotación sexual": "#E05D5F",
                "Mano de obra": "#FE9D65",
                "Tráfico de órganos": "#8DD1A9",
                "Otros fines": "#8EB5CB"
              }
            },
            legend: {
              show: false
            },
            "tooltip": {
              "grouped": false
            },
            axis: {
              "x": {
                "type": "category",
                "categories": ["Bárbados (2013)"]
              },
              y: {
                show: false,
                max:529,
                min:42
              }
            },
            legend: {
              show: false
            },
            bar: {
               width:15
            },
            "interaction": {
              "inputType": {
                "touch": {
                  "preventDefault": true
                }
              }
            },
            "bindto": "#chart_c11"
          });

            var chart_c12 = bb.generate({
              size: {
              },
              "data": {
                "columns": [
            	       ["Explotación sexual", 11],
                     ["Adopción ilegal", 1]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Adopción ilegal": "#8EB5CB"
                }
              },
              legend: {
                show: false
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
                  "type": "category",
                  "categories": ["Venezuela (2015)"]
                },
                y: {
                  show: false,
                  max:529,
                  min:42
                }
              },
              legend: {
                show: false
              },
              bar: {
                 width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              "bindto": "#chart_c12"
            });

            var chart_c13 = bb.generate({
              size: {
              },
              "data": {
                "columns": [
            	       ["Explotación sexual", 3],
                     ["Mano de obra", 11],
                     ["Otros fines", 3]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Mano de obra": "#FE9D65",
                  "Otros fines": "#8EB5CB"
                }
              },
              legend: {
                show: false
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
                  "type": "category",
                  "categories": ["Cuba (2014)"]
                },
                y: {
                  show: false,
                  max:529,
                  min:42
                }
              },
              legend: {
                show: false
              },
              bar: {
                 width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              "bindto": "#chart_c13"
            });

            var chart_c14 = bb.generate({
              size: {
              },
              "data": {
                "columns": [
            	       ["Explotación sexual", 108],
                     ["Mano de obra", 5]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Mano de obra": "#FE9D65"
                }
              },
              legend: {
                show: false
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
                  "type": "category",
                  "categories": ["Uruguay (2014)"]
                },
                y: {
                  show: false,
                  max:529,
                  min:42
                }
              },
              legend: {
                show: false
              },
              bar: {
                 width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              "bindto": "#chart_c14"
            });

            var chart_c15 = bb.generate({
              size: {
              },
              "data": {
                "columns": [
            	       ["Explotación sexual", 22],
                     ["Mano de obra", 8],
                     ["Matrimonio forzado", 7]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Mano de obra": "#FE9D65",
                  "Matrimonio forzado": "#8DD1A9"
                }
              },
              legend: {
                show: false
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
                  "type": "category",
                  "categories": ["Colombia (2015)"]
                },
                y: {
                  show: false,
                  max:529,
                  min:42
                }
              },
              legend: {
                show: false
              },
              bar: {
                 width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              "bindto": "#chart_c15"
            });

            var chart_c16 = bb.generate({
              size: {
              },
              "data": {
                "columns": [
                     ["Explotación sexual", 99],
                     ["Tráfico de órganos", 95],
                     ["Adopción ilegal", 157],
                     ["Mano de obra", 155],
                     ["Otros fines", 29]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Tráfico de órganos": "#8DD1A9",
                  "Mano de obra": "#FE9D65",
                  "Otros fines": "#8EB5CB",
                  "Adopción ilegal": "#7a679e"
                }
              },
              legend: {
                show: false
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
                  "type": "category",
                  "categories": ["Bolivia (2014)"]
                },
                y: {
                  show: false,
                  max:529,
                  min:42
                }
              },
              legend: {
                show: false
              },
              bar: {
                 width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              "bindto": "#chart_c16"
            });

            var chart_c17 = bb.generate({
              size: {
              },
              "data": {
                "columns": [
            	       ["Explotación sexual", 16],
                     ["Mano de obra", 6],
                     ["Servidumbre doméstica", 1]
                ],
                order : "asc",
                "type": "bar",
                colors: {
                  "Explotación sexual": "#E05D5F",
                  "Mano de obra": "#FE9D65",
                  "Servidumbre doméstica": "#8DD1A9"
                }
              },
              legend: {
                show: false
              },
              "tooltip": {
                "grouped": false
              },
              axis: {
                "x": {
                  "type": "category",
                  "categories": ["Trin. y Tobago (2015)"]
                },
                y: {
                  show: false,
                  max:529,
                  min:42
                }
              },
              legend: {
                show: false
              },
              bar: {
                 width:15
              },
              "interaction": {
                "inputType": {
                  "touch": {
                    "preventDefault": true
                  }
                }
              },
              "bindto": "#chart_c17"
            });

            var chart_c18 = bb.generate({
              size: {
              },
            "data": {
              "columns": [
          	       ["Explotación sexual", 39],
                   ["Mano de obra", 1],
                   ["Otros fines", 25]
              ],
              order : "asc",
              "type": "bar",
              colors: {
                "Explotación sexual": "#E05D5F",
                "Mano de obra": "#FE9D65",
                "Otros fines": "#8EB5CB"
              }  // min:-8
            },
            legend: {
              show: false
            },
            "tooltip": {
              "grouped": false
            },
            axis: {
              "x": {
                "type": "category",
                "categories": ["Rep. Dominicana (2014)"]
              },
              y: {
                show: false,
                max:529,
                min:42
              }
            },
            legend: {
              show: false
            },
            bar: {
               width:15
            },
            "interaction": {
              "inputType": {
                "touch": {
                  "preventDefault": true
                }
              }
            },
            "bindto": "#chart_c18"
          });

            $("#search").on("keyup", buscar);

            if (width<500){
              $("#search").on("keypress", buscarmob);
            }

            function buscar() {
              var input, filter, ul, svg, text, k;
                  input = document.getElementById("search");
                  filter = input.value.toUpperCase();
                  ul = document.getElementById("box-piechart");
                  svg = ul.getElementsByClassName("box-piechart");
                  for (k = 0; k < svg.length; k++) {
                      text = svg[k].getElementsByClassName("bb-chart-arcs-title")[0];
                      if (text.innerHTML.toUpperCase().indexOf(filter) > -1 ) {
                          svg[k].style.display = "";
                      }
                      else{
                          svg[k].style.display = "none";
                      }
                  }
              }

              function buscarmob(event) {
                var input, filter, ul, svg, text, k;
                    input = document.getElementById("search");
                    filter = input.value.toUpperCase();
                    ul = document.getElementById("box-piechart");
                    svg = ul.getElementsByClassName("box-piechart");
                    for (k = 0; k < svg.length; k++) {
                        text = svg[k].getElementsByClassName("bb-chart-arcs-title")[0];
                        if (text.innerHTML.toUpperCase().indexOf(filter) > -1 && event.keyCode == 13) {
                            event.preventDefault();
                            svg[k].style.display = "";
                        }
                        else{
                            svg[k].style.display = "none";
                        }
                    }
                }
          })

        })

        if (width>767){
          var doit;
          window.onresize = function(d) {
            clearTimeout( doit );
            doit = setTimeout( function(){
              location.reload()
            }, 200 );
          };
        }
    })
