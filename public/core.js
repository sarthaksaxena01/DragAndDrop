var dragdropApp = angular.module('dragdropApp', []);

dragdropApp.controller('mainController',['$scope','$http',function($scope, $http){
    $scope.formData = {};
    $scope.dirShown=false;
    $scope.fileContent="";
    $scope.files="";
    $scope.arrInner=[];
    $scope.copyArr=["fullAddress","fullname","contactNo"];
    $scope.arrs=[],$scope.lineArray=[];
    $scope.increment=0;
    $scope.changeArray=[],$scope.details=[],$scope.fullArr=[];
    function pushInArray(num){
        $scope.arrInner.push(num);
    }
    $scope.separateArray=[];

    function goodArrays(full,start,len) {
       
        var insideArray=[];
        while(start<full.length){
            insideArray.push(full[start]);
            start=start+len;
        }
        $scope.separateArray.push(insideArray);
    }


    $scope.contr=function(val){
            //var obj={},counter=0;
            $scope.lineArray=val.split("\\n");
            $scope.lineArray[0]=$scope.lineArray[0].substring(1,$scope.lineArray[0].length);
            $scope.lineArray[$scope.lineArray.length-1]=$scope.lineArray[$scope.lineArray.length-1].substring(0,$scope.lineArray[$scope.lineArray.length-1].length-1);
            //console.log($scope.lineArray);
            var rows=$scope.lineArray[0].split(",").length;
            for(var t=0;t<$scope.lineArray.length;t++){
                if($scope.lineArray[t].length==0){
                    $scope.lineArray.splice(t,1);
                    //$scope.lineArray.length=$scope.lineArray.length-1;
                }
            }
            //console.log($scope.lineArray);
            for(var i=0;i<$scope.lineArray.length;i++){
                $scope.arrInner=[];
                var vals=$scope.lineArray[i].split(",");
                $scope.fullArr=$scope.fullArr.concat(vals);
                //console.log($scope.fullArr);
                vals.map(pushInArray);
                $scope.arrs.push($scope.arrInner);
            }
            
            for(var j=0;j<rows;j++){
                goodArrays($scope.fullArr,j,rows);
            }     
    }

    $scope.handleDrop=function(itemIndex,bin){
        $scope.separateArray[itemIndex][0]=bin;
    }

    $scope.fileConversion=function() {
            for(var i=0;i<$scope.separateArray.length;i++){
                if($scope.copyArr.indexOf($scope.separateArray[i][0])==-1){
                    $scope.separateArray.splice(i,1);
                    i--;
                }
            }
            var dataToSend={
                arr:$scope.separateArray
            }
            //console.log($scope.separateArray);
            $http.post('/pushCsv',dataToSend)
            .success(function(data) {
                $scope.dirShown=true;
                console.log("data is pushed successfully");
            })
            .error(function(data) {
                console.log("Some error in sendind data");
            });
    }

    $scope.submits=function(){
       // console.log("entered atleast"+$scope.files+"ok");
        if($scope.files){
           // console.log("Its there");
             $http.post('/',{})
                .success(function(data) {
                    $scope.todos = data;
                    
                })
                .error(function(data) {
                   
                });
        }
    }
}]);


dragdropApp.directive('fileReader',function(){
    return{
        scope:{
            bars:'=fileReader'
        },
        link:function(scope,element){
            $(element).on('change',function(changeEvent){
                var files=changeEvent.target.files;
                if(files.length){
                    var r=new FileReader();
                    r.onload=function(e){
                        var contents=e.target.result;
                        contents=contents.replace(/\\n/g, "\\n").replace(/\\'/g, "\\'").replace(/\\"/g, '\\"').replace(/\\&/g, "\\&").replace(/\\r/g, "\\r").replace(/\\t/g, "\\t").replace(/\\b/g, "\\b").replace(/\\f/g, "\\f");
                            // remove non-printable and other non-valid JSON chars
                           // contents = contents.replace(/[\u0000-\u0019]+/g,""); 
                        //var jsonContent=JSON.parse(contents);
                        //console.log(jsonContent);
                        contents=JSON.stringify(contents);    
                        scope.$apply(function(){
                            scope.bars=contents;
                            for(var ii=0;ii<scope.bars.length;ii++){
                                //console.log(scope.bars[ii]);
                            }
                            
                        });
                    };
                    r.readAsText(files[0]);
                }
            })
        }
        
    }
});


dragdropApp.directive('draggable',function(){
    return function(scope,element){
        var el=element[0].children[0];
        //console.log(el);
        el.draggable=true;
        el.addEventListener('dragstart',function(e){
            e.dataTransfer.effectAllowed='move';
            console.log("there i am");
            console.log(this.id);
            e.dataTransfer.setData('Text',this.id);
            this.classList.add('drag');
            return false;
        },false);

        el.addEventListener('dragend',function(e){
            this.classList.remove('drag');
            this.classList.remove('margins');
            return false;
        },false);
    }
});

dragdropApp.directive('droppable',function(){
    return{
        scope: {
            drop:'&',
            vals:'='
        },
        link:function(scope,element){
            var el=element[0].children[0].children[1];
            //console.log("elements to be dropped to");
            console.log(element[0].children);
            el.addEventListener('dragover',function(e){
                e.dataTransfer.dropEffect='move';
                if(e.preventDefault)
                    e.preventDefault();
                this.classList.add('over');
                return false;
            },false);

            el.addEventListener('dragenter',function(e) {
              this.classList.add('over');
              this.classList.remove('margins');
              return false;
            },false);

            el.addEventListener('dragleave',function(e) {
              this.classList.remove('over');
              this.classList.remove('margins');
              return false;
            },false);

            el.addEventListener('drop',function(e){
                if(e.preventDefault)
                    e.preventDefault();
                this.classList.remove('over');
                //this.classList.remove('margins');
                var binId=this.id;
                var item=document.getElementById(e.dataTransfer.getData('Text'));
                this.appendChild(item);
                scope.$apply(function(scope){
                    var fn=scope.drop();
                    if('undefined' !== typeof(fn)){
                        fn(item.id,binId);
                    }
                });
                return false;
            },false);

        }
    }
});

dragdropApp.directive('displayNotification',function($timeout,$interval){

    'use strict';   
    return{
        restrict:"E",
        scope:true,
        link:function(scope,element,attrs){
            var elems=element.find('div');
            var elemNext=angular.element(elems[1]);
            var lasts=angular.element(elems[3]);
            //console.log(elemNext[0]);
            var firsts=angular.element(elemNext[0]);
            var margin=0;
            var ints=$interval(function(){
                lasts.css({
                    'margin-right':margin+'%'
                });
                margin=margin+1;
                if(margin==101){
                    lasts.css({
                        'display':'none'
                    });
                    firsts.css({
                        'display':'none'
                    });
                    $interval.cancel(ints);
                }
            },25);
        },
        templateUrl:'notificationDirective.html'
    }
});
