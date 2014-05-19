$(document).ready(function(){$('#table_id').dataTable({
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
  fnServerData: function(sSource, aoData, fnCallback, oSettings) {
    oSettings.jqXHR = $.ajax({
      url: sSource,
      type: "GET",
      data: aoData,
      dataType: 'json'
    })

      .pipe(function(json) {
/*
        json.reports = $.map(json.reports, function(item, index) {
          // idが2なら省く
          return (item.id != "2") ? item : null;
        });
*/
        return json;
      })
      .done(function(json) {

        var min_x = 0;
        var min_y = 0;
        var max_x = 0;
        var max_y = 0;

        _.each(json.items, function(item) {
          var info = item.tf;
          if (info.x < min_x) min_x = info.x;
          if (info.y < min_y) min_y = info.y;
          if (info.x > max_x) max_x = info.x;
          if (info.y > max_y) max_y = info.y;
        });

        alert(min_x + " " + min_y + " " + max_x + " " + max_y);

        var x_expand = 3.0;
        var y_expand = 1.1;
//        min_x *= x_expand;
        max_x *= x_expand;
        min_y *= y_expand;
        max_y *= y_expand;

        alert(min_x + " " + min_y + " " + max_x + " " + max_y);


//        alert(JSON.stringify(json));
        var canvas = $('#canvas_id')[0];

        var w = 800;
        var h = 500;

        var view_w = w / (max_x - min_x);
        var view_h = h / (max_y - min_y);

        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);

        ctx.beginPath();
        ctx.moveTo(0, 0);

        var i = 0;
        _.each(json.items, function(item) {
          info = item.tf;
          var x = (info.x - min_x) * view_w;
          var y = (info.y - min_y) * view_h;
          alert(x + " " + y);
          ctx.fillText(item.subject, x, y);
          i++;
        });
        ctx.stroke();

        return json;
      })
    .done(fnCallback);

  }
});
});
