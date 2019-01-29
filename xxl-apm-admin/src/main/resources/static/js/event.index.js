$(function() {

    // base
    $('.select2').select2({
        language:'zh-CN'
    });

    // querytime
    $.datetimepicker.setLocale('ch');
    $('#querytime').datetimepicker({
        format: 'Y-m-d H:i',
        step: 60,
        maxDate: 0  // 0 means today
    });

    // appname
    $( "#appname" ).autocomplete({
        source: function( request, response ) {
            $.ajax({
                url: base_url + "/event/findAppNameList",
                dataType: "json",
                data: {
                    "appname": request.term
                },
                success: function( data ) {
                    if(data.code == 200){
                        response(data.data);
                    }
                }
            });
        }
    });

    // search
    $('#searchBtn').click(function () {

        // querytime
        var querytime_input = $('#querytime').val();
        if (!querytime_input) {
            layer.open({
                title: '系统提示' ,
                btn: [ '确定' ],
                content: '请选择查询时间',
                icon: '2'
            });
            return;
        }

        var time = new Date(querytime_input)
        var y = time.getFullYear();
        var m = time.getMonth() + 1;
        if (m < 10) {
            m = "0" + m
        }
        var d = time.getDate();
        if (d < 10) {
            d = "0" + d
        }
        var h = time.getHours();
        if (h < 10) {
            h = "0" + h
        }
        var querytime = y + "" + m + "" + d + "" + h;
        var appname = $('#appname').val()?$('#appname').val().trim():'';
        var type = $('#type').val()?$('#type').val().trim():'';

        if (!appname) {
            layer.open({
                title: '系统提示' ,
                btn: [ '确定' ],
                content: '请输入应用 AppName',
                icon: '2'
            });
            return;
        }

        // redirct
        var redirct_url = base_url + "/event?querytime={querytime}&appname={appname}&type={type}";
        redirct_url = redirct_url.replace('{querytime}', querytime);
        redirct_url = redirct_url.replace('{appname}', appname);
        redirct_url = redirct_url.replace('{type}', type);

        window.location.href = redirct_url;
    });


    // valid data
    if (!eventReportList) {
        return;
    }

    // 四舍五入，4位小数
    function toDecimal(x) {
        var f = parseFloat(x);
        f = Math.round(x*10000)/10000;
        f = f.toFixed(4);
        return f;
    }

    // parse data
    /**
     * event item, for each name
     *
     *  xData = [a, b, c]
     *  nameMapList:
     *  {
     *
     *      'name-x':{
     *          Name: 'xxx',
     *          Total: xxx,
     *          Failure: xxx,
     *          Failure_percent: xxx,
     *          QPS: xxx,
     *          Percent: xxx,
     *          Total_ARRAY: {
     *              index, xx       // {0:y3, 1:y6, 2:y9}
     *          },
     *          Failure_ARRAY: {
     *              index, xx
     *          },
     *          'SubIpData'{
     *              'ip-x':{
     *                  Ip: 'xxx',
     *                  HostName: 'xxx',
     *                  Total: xxx,
     *                  Failure: xxx,
     *                  Failure_percent: xxx,
     *                  QPS: xxx,
     *                  Percent: xxx,
     *                  Total_ARRAY: {
     *                      index, xx
     *                  },
     *                  Failure_ARRAY: {
     *                      index, xx
     *                  },
     *              }
     *          }
     *      }
     *  }
     *
     */
    var nameMapList = {};
    var xData = [];     // [0]=3, [1]=6, [2]=9
    var nameMap_all_name = '_All_';

    function getNewNameMap(name) {
        var nameMap = {};
        nameMap.Name = name;
        nameMap.Total = 0;
        nameMap.Failure = 0;
        nameMap.Failure_percent = 0;
        nameMap.QPS = 0;
        nameMap.Percent = 0;

        nameMap.Total_ARRAY = {};
        nameMap.Failure_ARRAY = {};

        nameMap.SubIpData = {};

        return nameMap;
    }

    for (var index in eventReportList) {
        var eventReport = eventReportList[index];

        // x-data, ms -> min
        var min = (eventReport.addtime/(1000*60))%60;
        if (xData.indexOf(min) == -1) {
            xData.push(min);
        }

        // item
        var nameMap_item = nameMapList[eventReport.name+''];
        if (!nameMap_item) {
            nameMap_item = getNewNameMap(eventReport.name);
            nameMapList[eventReport.name+''] = nameMap_item;
        }
        nameMap_item.Total += eventReport.total_count;
        nameMap_item.Failure += eventReport.fail_count;

        nameMap_item.Total_ARRAY[min] = eventReport.total_count;
        nameMap_item.Failure_ARRAY[min] = eventReport.fail_count;

        // all
        var nameMap_all = nameMapList[nameMap_all_name];
        if (!nameMap_all) {
            nameMap_all = getNewNameMap(nameMap_all_name);
            nameMapList[nameMap_all_name] = nameMap_all;
        }
        nameMap_all.Total += eventReport.total_count;
        nameMap_all.Failure += eventReport.fail_count;

        nameMap_all.Total_ARRAY[min] = (nameMap_all.Total_ARRAY[min]?nameMap_all.Total_ARRAY[min]:0) + eventReport.total_count;
        nameMap_all.Failure_ARRAY[min] = (nameMap_all.Failure_ARRAY[min]?nameMap_all.Failure_ARRAY[min]:0) + eventReport.fail_count;

    }

    xData.sort();
    for(var key in nameMapList) {
        var nameMap = nameMapList[key];
        nameMap.Failure_percent = nameMap.Failure/nameMap.Total;
        nameMap.QPS = nameMap.Total/periodSecond;
        nameMap.Percent = nameMap.Total/nameMapList[nameMap_all_name].Total;
    }

    // event table
    var TableData = [];
    function addTableData(nameMap){
        var nameMapArr = [];
        nameMapArr[0] = (nameMap.Name==nameMap_all_name)?'<span class="badge bg-gray">All</span>':nameMap.Name;
        nameMapArr[1] = nameMap.Total;
        nameMapArr[2] = '<span style="color: '+ (nameMap.Failure>0?'red':'black') +';">'+ nameMap.Failure +'</span>';
        nameMapArr[3] = '<span style="color: '+ (nameMap.Failure_percent>0?'red':'black') +';">'+ toDecimal( nameMap.Failure_percent*100 ) +'%</span>';
        nameMapArr[4] = toDecimal( nameMap.QPS );
        nameMapArr[5] = toDecimal( nameMap.Percent*100 ) + '%';
        nameMapArr[6] = '<a href="javascript:;" class="TimeLine" data-name="'+ nameMap.Name +'" >TimeLine</a> | ' +
            '<a href="javascript:;" class="Distribution" data-name="'+ nameMap.Name +'" >Distribution</a>';
        nameMapArr[7] = '--';

        TableData.push(nameMapArr);
    }
    for (var i in nameMapList) {
        addTableData(nameMapList[i]);
    }

    $('#event-table').dataTable( {
        "data": TableData,
        "paging": false,
        "searching": false,
        "order": [[ 1, 'desc' ]],
        "info": false
    } );

    // TimeLine
    $('#event-table').on('click', '.TimeLine', function () {

        // name
        var name = $(this).data('name');
        if (name == nameMap_all_name) {
            $('#timeLineModal ._name').html('All');
        } else {
            $('#timeLineModal ._name').html('Name=' + name);
        }

        // data fail
        var _xData = [];
        var _yData_All = [];
        var _yData_Fail = [];

        if (xData.length < 30) {
            for (var min = 0; min < 60; min++) {
                _xData[min] = min;
                _yData_All[min] = xData.indexOf(min)>-1?nameMapList[name].Total_ARRAY[min]:0;
                _yData_Fail[min] = xData.indexOf(min)>-1?nameMapList[name].Failure_ARRAY[min]:0;
            }
        } else {
            _xData = xData;
            _yData_All = nameMapList[name].Total_ARRAY;
            _yData_Fail = nameMapList[name].Failure_ARRAY;
        }

        // bar
        var timeLineModal_chart_left = echarts.init(document.getElementById('timeLineModal_chart_left'));
        timeLineModal_chart_left.setOption({
            title: {
                text: 'Total'
            },
            toolbox: {
                show : true,
                feature : {
                    dataView : {show: true, readOnly: false},
                    magicType : {show: true, type: ['line', 'bar']},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            tooltip : {
                trigger: 'axis'
            },
            xAxis: {
                name: 'Min',
                type: 'category',
                data: _xData
            },
            yAxis: {
                name: 'count',
                type: 'value'
            },
            series: [{
                data: _yData_All,
                type: 'bar'
            }]
        });

        var timeLineModal_chart_right = echarts.init(document.getElementById('timeLineModal_chart_right'));
        timeLineModal_chart_right.setOption({
            title: {
                text: 'Failure'
            },
            toolbox: {
                show : true,
                feature : {
                    dataView : {show: true, readOnly: false},
                    magicType : {show: true, type: ['line', 'bar']},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            tooltip : {
                trigger: 'axis'
            },
            xAxis: {
                name: 'Min',
                type: 'category',
                data: xData
            },
            yAxis: {
                name: 'count',
                type: 'value'
            },
            series: [{
                data: _yData_Fail,
                type: 'bar'
            }]
        });

        // ip table
        /*var TableData_ip = [];
        TableData_ip.push(['127.0.0.1', 'localhost', 100, 3, 0.3, new Date().getTime(), 0.2]);
        console.log(TableData_ip);
        $('#event-table-ip').dataTable( {
            "data": TableData_ip,
            "paging": false,
            "searching": false,
            "order": [[ 1, 'desc' ]],
            "info": false,
            "destroy": true
        } );*/

        $('#timeLineModal').modal('show');

    });

});
