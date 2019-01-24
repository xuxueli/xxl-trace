<!DOCTYPE html>
<html>
<head>
  	<#import "../common/common.macro.ftl" as netCommon>
    <title>应用性能管理平台</title>

    <#-- select2 -->
    <link rel="stylesheet" href="${request.contextPath}/static/adminlte/bower_components/select2/css/select2.min.css">
    <@netCommon.commonStyle />
    <#-- datetimepicker -->
    <link rel="stylesheet" href="${request.contextPath}/static/plugins/datetimepicker/jquery.datetimepicker.min.css">
    <#-- jquery-ui -->
    <link rel="stylesheet" href="${request.contextPath}/static/plugins/jquery-ui/jquery-ui.min.css">
    <#-- dataTables -->
    <link rel="stylesheet" href="${request.contextPath}/static/adminlte/bower_components/datatables.net-bs/css/dataTables.bootstrap.min.css">

</head>
<body class="hold-transition skin-blue sidebar-mini <#if cookieMap?exists && cookieMap["xxlapm_adminlte_settings"]?exists && "off" == cookieMap["xxlapm_adminlte_settings"].value >sidebar-collapse</#if>">
<div class="wrapper">
	<!-- header -->
	<@netCommon.commonHeader />
	<!-- left -->
	<@netCommon.commonLeft "event" />
	
	<!-- Content Wrapper. Contains page content -->
	<div class="content-wrapper">

		<!-- Main content -->
	    <section class="content">
	    
	    	<div class="row">

                <div class="col-xs-3">
                    <div class="input-group">
                        <span class="input-group-addon">时间</span>
                        <input type="text" class="form-control" id="querytime" value="${querytime?string('yyyy-MM-dd HH:mm')}" readonly >
                    </div>
                </div>

                <div class="col-xs-4">
                    <div class="input-group">
                        <span class="input-group-addon">AppName</span>
                        <input type="text" class="form-control" id="appname" autocomplete="on" placeholder="请输入应用 AppName" value="${appname!''}" maxlength="100" >
                    </div>
                </div>

                <div class="col-xs-4">
                    <div class="input-group">
                        <span class="input-group-addon">Type</span>
                        <select class="form-control select2" style2="width: 100%;" id="type" >
                            <#if typeList?exists >
                                <#list typeList as item>
                                    <option value="${item}" <#if type?exists && type==item>selected="selected"</#if> >${item}</option>
                                </#list>
                            </#if>
                        </select>
                    </div>
                </div>

	            <div class="col-xs-1">
	            	<button class="btn btn-block btn-info" id="searchBtn">GO</button>
	            </div>
          	</div>

			<div class="row">
                <br>
                <div class="col-md-12 col-xs-12">
                    <div class="box ">
                        <div class="box-body no-padding">
                            <table class="table table-striped" id="event-table" style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Total</th>
                                        <th>Failure</th>
                                        <th>Failure%</th>
                                        <th>QPS</th>
                                        <th>LogView</th>
                                        <th>Chart</th>
                                        <th class2="pull-right" >Percent%</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <!-- /.box-body -->
                    </div>
                </div>


			</div>
			
	    </section>
	</div>

	<!-- footer -->
	<@netCommon.commonFooter />

    <!-- 报表.模态框 -->
    <div class="modal fade" id="chartModal" tabindex="-1" role="dialog"  aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" >报表 | <span class="_name"></span></h4>
                </div>
                <div class="modal-body">


                    <div class="row">

                        <div class="col-md-6">
                            <!-- AREA CHART -->
                            <div class="box box-success">
                                <div class="box-body chart-responsive">
                                    <div class="chart" id="chartModal_chart_left" style="height: 300px;width: 400px;"></div>
                                </div>
                                <!-- /.box-body -->
                            </div>
                            <!-- /.box -->
                        </div>

                        <!-- /.col (LEFT) -->
                        <div class="col-md-6">
                            <!-- LINE CHART -->
                            <div class="box box-danger">
                                <div class="box-body chart-responsive">
                                    <div class="chart" id="chartModal_chart_right" style="height: 300px;width: 400px;"></div>
                                </div>
                                <!-- /.box-body -->
                            </div>
                            <!-- /.box -->
                        </div>
                        <!-- /.col (RIGHT) -->

                    </div>
                    <!-- /.row -->

                    <#--<div class="form-group">
                        <div class="text-center">
                            <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                        </div>
                    </div>-->
                </div>
            </div>
        </div>
    </div>

</div>

<@netCommon.commonScript />
<#-- echarts -->
<script src="${request.contextPath}/static/plugins/echarts/echarts.common.min.js"></script>
<#-- datetimepicker -->
<script src="${request.contextPath}/static/plugins/datetimepicker/jquery.datetimepicker.full.min.js"></script>
<#-- select2 -->
<script src="${request.contextPath}/static/adminlte/bower_components/select2/js/select2.full.min.js"></script>
<script src="${request.contextPath}/static/adminlte/bower_components/select2/js/i18n/zh-CN.js"></script>
<#-- jquery-ui -->
<script src="${request.contextPath}/static/plugins/jquery-ui/jquery-ui.min.js"></script>
<#-- dataTables -->
<script src="${request.contextPath}/static/adminlte/bower_components/datatables.net/js/jquery.dataTables.min.js"></script>
<script src="${request.contextPath}/static/adminlte/bower_components/datatables.net-bs/js/dataTables.bootstrap.min.js"></script>

<script>
    var eventReportList;
    <#if eventReportList?exists>
        eventReportList = JSON.parse('${eventReportList}');
    </#if>
    var periodSecond = '${periodSecond}';

</script>
<script src="${request.contextPath}/static/js/event.index.js"></script>

</body>
</html>
