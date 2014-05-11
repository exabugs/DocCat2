$(document).ready(function(){$('#table_id').dataTable({
  aoColumns: [
    { mData: "_id", sDefaultContent: "" },
    { mData: "subject", sDefaultContent: "" },
    { mData: "tf", sDefaultContent: "" }
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
    .done(fnCallback);
  }
});
});
