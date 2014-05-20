function plot(json) {

  var min_x = 0;
  var max_x = 0;
  var min_y = 0;
  var max_y = 0;
  var min_s = 0;
  var max_s = 0;

  _.each(json.items, function (item) {
    var info = item.tf;
    if (info) {
      if (info.x < min_x) min_x = info.x;
      if (info.x > max_x) max_x = info.x;
      if (info.y < min_y) min_y = info.y;
      if (info.y > max_y) max_y = info.y;
      if (info.score < min_s) min_s = info.score;
      if (info.score > max_s) max_s = info.score;
    }
  });

  var d_x = 0.3;
  var d_y = 0.1;

  min_x -= d_x;
  max_x += d_x;
  min_y -= d_y;
  max_y += d_y;

  var canvas = $('#canvas_id')[0];

  var w = canvas.width;
  var h = canvas.height;
  var s = 40; // 直径

  var view_w = w / (max_x - min_x);
  var view_h = h / (max_y - min_y);
  var view_s = s / (max_s - min_s);

  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  var PI2 = Math.PI * 2;

  _.each(json.items, function (item) {
    var info = item.tf;
    if (info) {
      var x = (info.x - min_x) * view_w;
      var y = (info.y - min_y) * view_h;

      ctx.fillText(item.subject, x, y);

      ctx.beginPath();
      ctx.arc(x, y, info.score * view_s + 2, 0, PI2, false);
      ctx.stroke();
    }
  });

}

function svg(json) {

  var min_x = 0;
  var max_x = 0;
  var min_y = 0;
  var max_y = 0;
  var min_s = 0;
  var max_s = 0;

  _.each(json.items, function (item) {
    var info = item.tf;
    if (info) {
      if (info.x < min_x) min_x = info.x;
      if (info.x > max_x) max_x = info.x;
      if (info.y < min_y) min_y = info.y;
      if (info.y > max_y) max_y = info.y;
      if (info.score < min_s) min_s = info.score;
      if (info.score > max_s) max_s = info.score;
    }
  });

  var d_x = 0.3;
  var d_y = 0.1;

  min_x -= d_x;
  max_x += d_x;
  min_y -= d_y;
  max_y += d_y;

  //var svg = $('#svg_id');
  var svg = document.getElementById('svg_id');

  var w = max_x - min_x;
  var h = max_y - min_y;
  svg.setAttribute('viewBox', [min_x, min_y, w, h].join(' '));

//  var text = $('<text x="20" y="20">ごきげんよう。</text>');
//  svg.append(text);


  var s = 40; // 直径

//  var view_w = w / (max_x - min_x);
//  var view_h = h / (max_y - min_y);
  var view_s = s / (max_s - min_s);

  //svg.empty();

  _.each(json.items, function (item) {
    var info = item.tf;
    if (info) {
      var x = info.x;
      var y = info.y;
/*
      ctx.fillText(item.subject, x, y);

      ctx.beginPath();
      ctx.arc(x, y, info.score * view_s + 2, 0, PI2, false);
      ctx.stroke();

      <circle cx="100" cy="50" r="40" stroke="black" stroke-width="2" fill="red" />
*/
      //var circle = $('<circle>');
      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', info.score * 10);
      circle.setAttribute('stroke', 'black');
      circle.setAttribute('stroke-width', 1);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('vector-effect', 'non-scaling-stroke');

      svg.appendChild(circle);
    }

  });

}

$(document).ready(function () {
  var myTable = $('#table_id').dataTable({
    bAutoWidth: false,
    aoColumns: [
      { sWidth: "260px", mData: "date", sDefaultContent: "" },
      {                  mData: "subject", sDefaultContent: "" },
      { sWidth: "160px", mData: "tf.score", sDefaultContent: "" },
      { sWidth: "160px", mData: "tf.x", sDefaultContent: "" },
      { sWidth: "160px", mData: "tf.y", sDefaultContent: "" }
    ],
    bServerSide: true,
    bDeferRender: true,
    sAjaxSource: "mails",
    sAjaxDataProp: "items",
    fnServerParams: function (aoData) {
      //alert(JSON.stringify(aoData));
      _.each(aoData, function (param) {
        if ("sSearch" === param.name) {
          aoData.push({"name": "keyword", "value": param.value});
        }
      });
      aoData.push(
        {"name": "id", "value": "1"}
      );
    },
    fnServerData: function (sSource, aoData, fnCallback, oSettings) {
      oSettings.jqXHR = $.ajax({
        url: sSource,
        type: "GET",
        data: aoData,
        dataType: 'json'
      })

        .pipe(function (json) {
          /*
           json.reports = $.map(json.reports, function(item, index) {
           // idが2なら省く
           return (item.id != "2") ? item : null;
           });
           */
          return json;
        })
        .done(fnCallback)
        .done(plot)
        .done(svg);

    }
  });

  // jQuery DataTables: Delay search until 3 characters been typed OR a button clicked
  // http://stackoverflow.com/questions/5548893/jquery-datatables-delay-search-until-3-characters-been-typed-or-a-button-clicke
  $('.dataTables_filter input')
    .unbind('keyup')
    .bind('keyup', function (e) {
      if (e.keyCode != 13) return;
      myTable.fnFilter($(this).val());
    });

});
