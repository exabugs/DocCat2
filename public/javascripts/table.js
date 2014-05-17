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
//        alert(JSON.stringify(json));
        return json;
      })
    .done(fnCallback);

  }
});
});
