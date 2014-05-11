$(document).ready(function(){$('#table_id').dataTable({
  aoColumns: [
    { mData: "_id", sDefaultContent: "" },
    { mData: "title", sDefaultContent: "" }
  ],
  bDeferRender: true,
  sAjaxSource: "mails",
  sServerMethod: "GET",
  fnServerParams: function (aoData) {
    aoData.push({"name": "id", "value": "1"});
  },
  sAjaxDataProp: "items"
});
});


$(document).ready(function(){$('#table_id').dataTable({
  aoColumns: [
    { mData: "_id", sDefaultContent: "" },
    { mData: "title", sDefaultContent: "" }
  ],
  bDeferRender: true,
  sAjaxSource: "mails",
  fnServerParams: function (aoData) {
    aoData.push({"name": "id", "value": "1"});
  },
  sAjaxDataProp: "items",
  fnServerData: function(sSource, aoData, fnCallback, oSettings) {
    // ajaxリクエストからの戻ってくるjqXHRはoSettingsへ格納します。
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
