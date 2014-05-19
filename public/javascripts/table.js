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

  var w = 800;
  var h = 500;
  var s = 40; // 直径

  var view_w = w / (max_x - min_x);
  var view_h = h / (max_y - min_y);
  var view_s = s / (max_s - min_s);

  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  var i = 0;
  _.each(json.items, function (item) {
    info = item.tf;
    var x = (info.x - min_x) * view_w;
    var y = (info.y - min_y) * view_h;

    ctx.fillText(item.subject, x, y);

    ctx.beginPath();
    ctx.arc(x, y, info.score * view_s + 2, 0, Math.PI * 2, false);
    ctx.stroke();

    i++;
  });

}

$(document).ready(function () {
  $('#table_id').dataTable({
    aoColumns: [
      { mData: "_id", sDefaultContent: "" },
      { mData: "subject", sDefaultContent: "" },
      { mData: "tf.score", sDefaultContent: "" },
      { mData: "tf.x", sDefaultContent: "" },
      { mData: "tf.y", sDefaultContent: "" }
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
        .done(plot);

    }
  });
});
